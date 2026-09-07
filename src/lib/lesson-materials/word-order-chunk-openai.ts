import {
  buildChunksFromRanges,
  validateWordOrderChunksDetailed,
  type SemanticChunkType,
  type WordOrderChunk,
} from "@/lib/lesson-materials/word-order-chunking";
import {
  tokenizeForWordOrder,
  normalizeWhitespace,
} from "@/lib/lesson-materials/word-order-tokenize";

const SYSTEM = `너는 고등학교 영어 구문 교재의 문장을 학생이 의미 단위로 끊어 읽을 수 있도록 나누는 전문가다.

단어 수를 균등하게 나누는 것이 아니라
명사구, 동사구, 전치사구, 부정사구, 관계절,
접속절, 수동태, 구동사, 연어를 기준으로 나눈다.

절대 규칙:
- 원문 단어를 추가·삭제·변경·재배열하지 않는다.
- 문장부호를 변경하지 않는다.
- 모든 청크는 원문 whitespace 토큰의 연속 범위이다.
- 청크끼리 겹치지 않으며 모든 토큰이 정확히 한 번 포함된다.
- 관사/한정사(a, an, the, this, these, my, our, same 등)로 청크를 끝내지 않는다.
- 조동사·수동태·완료형의 중간에서 끊지 않는다 (예: are being / held 금지 → are being held captive).
- 강하게 결합된 형용사+명사를 나누지 않는다 (physical cues, same square footage).
- 쉼표·세미콜론 뒤의 새 절 경계를 가로질러 묶지 않는다 (made, yet we 금지).
- 고정 단어 수(3단어/4단어)로 자르지 않는다.
- 전체 문장을 한 청크로 만들지 않는다.
- 모든 단어를 한 단어씩 분리하지 않는다.
- 구동사(bring about, think about, focus on, held captive by 등)를 분리하지 않는다.

각 청크에 type만 짧게 붙인다:
noun-phrase | verb-phrase | prepositional-phrase | infinitive-phrase |
participial-phrase | clause | connector | fixed-expression | structural-verb | other

JSON만 출력한다.`;

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function callWordOrderChunkOpenAI(input: {
  sentences: Array<{ sentenceId: string; english: string }>;
}): Promise<{
  byId: Map<string, WordOrderChunk[]>;
  openAiRequestCount: number;
}> {
  const byId = new Map<string, WordOrderChunk[]>();
  if (input.sentences.length === 0) {
    return { byId, openAiRequestCount: 0 };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { byId, openAiRequestCount: 0 };
  }

  const configured = process.env.OPENAI_MODEL_WORKBOOK_WORD_ORDER?.trim();
  const models = configured ? [configured] : ["gpt-4o-mini", "gpt-4o"];

  const userContent = JSON.stringify({
    sentences: input.sentences.map((s) => ({
      sentenceId: s.sentenceId,
      english: normalizeWhitespace(s.english),
      tokens: tokenizeForWordOrder(s.english).map((t) => t.surface),
    })),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    let bodyText = "";
    let ok = false;
    for (const model of models) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 4_096,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `Split each sentence into semantic chunks with types. Return {"sentences":[{"sentenceId":"...","chunks":[{"chunkId":"...","text":"...","startTokenIndex":0,"endTokenIndex":2,"type":"verb-phrase"}]}]}.\n\n${userContent}`,
            },
          ],
        }),
      });
      bodyText = await res.text();
      if (res.ok) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      console.warn("[WordOrderChunks] OpenAI failed", bodyText.slice(0, 200));
      return { byId, openAiRequestCount: 1 };
    }

    const parsed = parseJsonSafe<{
      sentences?: Array<{
        sentenceId?: string;
        chunks?: Array<{
          text?: string;
          startTokenIndex?: number;
          endTokenIndex?: number;
          type?: string;
        }>;
      }>;
    }>(bodyText);
    const rows = parsed?.sentences ?? [];
    for (const row of rows) {
      const sid = String(row.sentenceId ?? "");
      const src = input.sentences.find((s) => s.sentenceId === sid);
      if (!src || !Array.isArray(row.chunks)) continue;
      const tokens = tokenizeForWordOrder(src.english);
      const ranges = row.chunks
        .map((c) => ({
          start: Number(c.startTokenIndex),
          end: Number(c.endTokenIndex),
          type: (c.type as SemanticChunkType | undefined) ?? "other",
        }))
        .filter(
          (r) =>
            Number.isFinite(r.start) &&
            Number.isFinite(r.end) &&
            r.start >= 0 &&
            r.end >= r.start
        );
      if (ranges.length < 2) continue;
      const chunks = buildChunksFromRanges(sid, tokens, ranges);
      const v = validateWordOrderChunksDetailed(src.english, chunks);
      if (v.ok) {
        byId.set(sid, chunks);
      } else {
        console.warn("[WordOrderChunks] AI chunks rejected", {
          sentenceId: sid,
          issues: v.issues,
          chunks: chunks.map((c) => c.text).join(" / "),
        });
      }
    }
    return { byId, openAiRequestCount: 1 };
  } catch (e) {
    console.warn(
      "[WordOrderChunks] OpenAI error",
      e instanceof Error ? e.message : e
    );
    return { byId, openAiRequestCount: 1 };
  } finally {
    clearTimeout(timer);
  }
}
