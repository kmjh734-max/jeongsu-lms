import {
  buildChunksFromRanges,
  validateWordOrderChunksDetailed,
  type SemanticChunkType,
  type WordOrderChunk,
} from "@/lib/lesson-materials/word-order-chunking";
import {
  tokenizeForWordOrder,
  normalizeWhitespace,
  type WordOrderToken,
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

    /**
     * 모델이 만든 JSON은 응답 봉투 안의 choices[0].message.content에 문자열로 들어 있다.
     * 예전에는 봉투 자체(bodyText)를 파싱해서 sentences를 찾았고, 봉투에는 그런 필드가
     * 없으니 rows가 항상 빈 배열이었다. 그래서 모델이 정상적으로 의미 단위를 돌려주는데도
     * 문항이 전부 deterministic-fallback(기계적 고정폭 분할)으로 만들어졌다.
     * 관측: 응답 200 + 올바른 청크인데 byId가 0개.
     */
    const envelope = parseJsonSafe<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? "";
    if (!content) {
      console.warn("[WordOrderChunks] 응답에 content가 없습니다", bodyText.slice(0, 200));
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
    }>(content);
    const rows = parsed?.sentences ?? [];
    for (const row of rows) {
      const sid = String(row.sentenceId ?? "");
      const src = input.sentences.find((s) => s.sentenceId === sid);
      if (!src || !Array.isArray(row.chunks)) continue;
      const tokens = tokenizeForWordOrder(src.english);
      const ranges = alignChunkTextsToTokens(
        tokens,
        row.chunks.map((c) => ({
          text: String(c.text ?? ""),
          type: (c.type as SemanticChunkType | undefined) ?? "other",
        }))
      );
      if (!ranges || ranges.length < 2) continue;
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

/** 비교용 정규화: 대소문자·문장부호·굽은 따옴표 차이를 지운다. */
function comparable(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");
}

/**
 * 모델이 준 청크 "텍스트"를 원문 토큰에 순서대로 맞춰 범위를 만든다.
 *
 * 예전에는 모델이 준 startTokenIndex/endTokenIndex를 그대로 썼다. 그런데 로컬
 * 토크나이저는 공백으로만 자르는데(reader's = 토큰 하나, thought. = 토큰 하나)
 * 모델은 문장부호와 소유격을 따로 세기 때문에 인덱스가 어긋났다. 그 결과
 * 마지막 토큰이 잘려 COVERAGE_FAILED·RESTORE_FAILED로 전부 탈락했다.
 *
 * 청크의 텍스트 자체는 정확하므로(의미 단위를 제대로 잡는다) 텍스트로 맞춘다.
 * 모델이 꼬리 토큰을 빠뜨린 경우는 마지막 청크를 끝까지 늘려 덮는다 —
 * 다만 빠진 양이 크면 의미 단위가 아니게 되므로 그때는 포기하고 폴백에 맡긴다.
 */
const CHUNK_TAIL_TOLERANCE = 3;

export function alignChunkTextsToTokens(
  tokens: WordOrderToken[],
  chunks: Array<{ text: string; type?: SemanticChunkType }>
): Array<{ start: number; end: number; type?: SemanticChunkType }> | null {
  const ranges: Array<{ start: number; end: number; type?: SemanticChunkType }> = [];
  let cursor = 0;
  for (const chunk of chunks) {
    const want = comparable(chunk.text);
    if (!want) continue;
    if (cursor >= tokens.length) return null;
    let acc = "";
    let end = cursor - 1;
    for (let i = cursor; i < tokens.length; i++) {
      acc += comparable(tokens[i]!.surface);
      if (acc === want) {
        end = i;
        break;
      }
      if (!want.startsWith(acc)) return null;
    }
    if (end < cursor) return null;
    ranges.push({ start: cursor, end, type: chunk.type });
    cursor = end + 1;
  }
  if (!ranges.length) return null;
  if (cursor < tokens.length) {
    if (tokens.length - cursor > CHUNK_TAIL_TOLERANCE) return null;
    ranges[ranges.length - 1]!.end = tokens.length - 1;
  }
  return ranges;
}
