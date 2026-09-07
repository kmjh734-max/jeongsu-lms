import {
  buildChunksFromRanges,
  validateWordOrderChunks,
  type WordOrderChunk,
} from "@/lib/lesson-materials/word-order-chunking";
import {
  tokenizeForWordOrder,
  normalizeWhitespace,
} from "@/lib/lesson-materials/word-order-tokenize";

const SYSTEM = `You split English sentences into semantic phrase/clause chunks for a high-school word-order writing exercise.

Rules:
- Do not change, add, delete, or reorder any words or punctuation.
- Every chunk is a contiguous span of the original whitespace tokens.
- Every token appears in exactly one chunk; chunks do not overlap.
- Prefer 2–4 word meaning units (noun phrases, prep phrases, verb phrases, short infinitives).
- Default max 5 words per chunk; proper names / fixed expressions may be up to 6.
- Do not make every chunk a single word.
- Do not make the whole sentence one chunk.
- Keep phrasal verbs together (bring about, think about, focus on).
- Keep short units like "to manifest it", "which states", "and that".
- Return JSON only.`;

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
          temperature: 0.2,
          max_tokens: 4_096,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `Split each sentence into chunks. Return {"sentences":[{"sentenceId":"...","chunks":[{"chunkId":"...","text":"...","startTokenIndex":0,"endTokenIndex":2}]}]}.\n\n${userContent}`,
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
        }))
        .filter(
          (r) =>
            Number.isFinite(r.start) &&
            Number.isFinite(r.end) &&
            r.start >= 0 &&
            r.end >= r.start
        );
      if (ranges.length < 2) continue;
      // Prefer index ranges; if text provided without indices, skip to validation via ranges
      let chunks = buildChunksFromRanges(sid, tokens, ranges);
      // If AI text differs but indices cover, rebuild from tokens (ignore AI text drift)
      chunks = buildChunksFromRanges(sid, tokens, ranges);
      const v = validateWordOrderChunks(src.english, chunks);
      if (v.ok) byId.set(sid, chunks);
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
