import {
  WORD_ORDER_CHUNK_ALGORITHM_VERSION,
  WORD_ORDER_MAX_CHUNK_WORDS,
  WORD_ORDER_MAX_CHUNK_WORDS_FIXED,
  WORD_ORDER_MAX_SINGLE_WORD_RATIO,
} from "@/lib/lesson-materials/word-order-writing-constants";
import {
  normalizeWhitespace,
  tokenizeForWordOrder,
  type WordOrderToken,
} from "@/lib/lesson-materials/word-order-tokenize";

export type WordOrderChunk = {
  chunkId: string;
  text: string;
  originalIndex: number;
  startTokenIndex: number;
  endTokenIndex: number;
};

export type WordOrderChunkSource =
  | "stored"
  | "cache"
  | "openai"
  | "fallback";

export function buildChunksFromRanges(
  sentenceId: string,
  tokens: WordOrderToken[],
  ranges: Array<{ start: number; end: number }>
): WordOrderChunk[] {
  return ranges.map((r, i) => {
    const slice = tokens.slice(r.start, r.end + 1);
    return {
      chunkId: `${sentenceId}-c${i + 1}`,
      text: slice.map((t) => t.surface).join(" "),
      originalIndex: i,
      startTokenIndex: r.start,
      endTokenIndex: r.end,
    };
  });
}

export function restoreEnglishFromChunks(chunks: WordOrderChunk[]): string {
  return [...chunks]
    .sort((a, b) => a.startTokenIndex - b.startTokenIndex)
    .map((c) => c.text)
    .join(" ");
}

export function wordCountInChunk(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function validateWordOrderChunks(
  originalEnglish: string,
  chunks: WordOrderChunk[]
): { ok: true } | { ok: false; reason: string } {
  if (!chunks.length) return { ok: false, reason: "빈 청크" };
  if (chunks.length < 2) return { ok: false, reason: "청크가 2개 미만" };

  const tokens = tokenizeForWordOrder(originalEnglish);
  if (tokens.length === 0) return { ok: false, reason: "빈 원문" };

  const sorted = [...chunks].sort(
    (a, b) => a.startTokenIndex - b.startTokenIndex
  );
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]!;
    if (c.startTokenIndex > c.endTokenIndex) {
      return { ok: false, reason: "잘못된 토큰 범위" };
    }
    if (c.startTokenIndex < 0 || c.endTokenIndex >= tokens.length) {
      return { ok: false, reason: "토큰 범위 초과" };
    }
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (c.startTokenIndex <= prev.endTokenIndex) {
        return { ok: false, reason: "청크 범위 겹침" };
      }
      if (c.startTokenIndex !== prev.endTokenIndex + 1) {
        return { ok: false, reason: "청크 사이 토큰 누락" };
      }
    }
  }
  if (sorted[0]!.startTokenIndex !== 0) {
    return { ok: false, reason: "시작 토큰 누락" };
  }
  if (sorted[sorted.length - 1]!.endTokenIndex !== tokens.length - 1) {
    return { ok: false, reason: "끝 토큰 누락" };
  }

  const restored = restoreEnglishFromChunks(sorted);
  if (normalizeWhitespace(restored) !== normalizeWhitespace(originalEnglish)) {
    return { ok: false, reason: "원문 복원 실패" };
  }

  const ids = chunks.map((c) => c.chunkId);
  if (new Set(ids).size !== ids.length) {
    return { ok: false, reason: "중복 chunkId" };
  }

  let allSingles = true;
  let oversize = false;
  for (const c of chunks) {
    const n = wordCountInChunk(c.text);
    if (n !== 1) allSingles = false;
    if (n > WORD_ORDER_MAX_CHUNK_WORDS_FIXED) oversize = true;
    const expected = tokens
      .slice(c.startTokenIndex, c.endTokenIndex + 1)
      .map((t) => t.surface)
      .join(" ");
    if (normalizeWhitespace(expected) !== normalizeWhitespace(c.text)) {
      return { ok: false, reason: `청크 텍스트 불일치: ${c.chunkId}` };
    }
  }
  if (allSingles) return { ok: false, reason: "모든 청크가 낱말 단위" };
  if (oversize) return { ok: false, reason: "청크 최대 길이 초과" };

  return { ok: true };
}

const DETERMINERS = new Set([
  "a",
  "an",
  "the",
  "my",
  "our",
  "your",
  "his",
  "her",
  "its",
  "their",
  "this",
  "that",
  "these",
  "those",
  "one's",
  "each",
  "every",
  "some",
  "any",
  "no",
  "another",
]);

const PREPOSITIONS = new Set([
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "from",
  "into",
  "onto",
  "about",
  "over",
  "under",
  "through",
  "during",
  "without",
  "within",
  "among",
  "between",
  "against",
  "across",
  "after",
  "before",
  "toward",
  "towards",
  "upon",
  "via",
  "per",
  "like",
]);

const AUX_MODAL = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "don't",
  "doesn't",
  "didn't",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "need",
]);

const CONJ_REL = new Set([
  "and",
  "but",
  "or",
  "so",
  "yet",
  "which",
  "who",
  "whom",
  "whose",
  "that",
  "if",
  "when",
  "while",
  "although",
  "because",
  "since",
  "unless",
  "though",
  "whereas",
  "then",
  "instead",
  "however",
  "therefore",
  "thus",
]);

const STRUCTURAL_SINGLE = new Set([
  "is",
  "are",
  "was",
  "were",
  "but",
  "instead",
  "however",
  "therefore",
  "thus",
]);

/** Multi-word expressions preferred as single chunks (longest first). */
const FIXED_PHRASES: string[] = [
  "the Law of Attraction",
  "Law of Attraction",
  "positive or negative thoughts",
  "positive or negative results",
  "worthy, lovable, and deserving",
  "all we have to do",
  "or visualize something",
  "in our understanding",
  "in line with",
  "bring about",
  "think about",
  "focusing on",
  "focus on",
  "heard of",
  "to manifest it",
  "to live extraordinary lives",
  "of this law",
  "the common flaw",
  "which states",
  "and that",
  "that we believe",
  "by focusing on",
  "one can bring about",
  "Perhaps you have heard",
  "into your life",
  "at the level of",
  "our own vibration",
  "our belief system",
  "a loving relationship",
  "limiting beliefs",
].sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length);

function stripTrailingPunct(surface: string): string {
  return surface.replace(/[.,;:!?]+$/g, "");
}

function bareLower(surface: string): string {
  return stripTrailingPunct(surface).toLowerCase();
}

function matchPhraseAt(
  tokens: WordOrderToken[],
  start: number,
  phrase: string
): number | null {
  const parts = phrase.split(/\s+/).filter(Boolean);
  if (start + parts.length > tokens.length) return null;
  for (let i = 0; i < parts.length; i++) {
    const want = parts[i]!.toLowerCase();
    const got = bareLower(tokens[start + i]!.surface);
    const wantBare = want.replace(/[.,;:!?]+$/g, "");
    // Allow punctuation to stay on the last token of the phrase
    if (i === parts.length - 1) {
      if (got !== wantBare && got !== want) return null;
    } else if (got !== wantBare) {
      return null;
    }
  }
  return start + parts.length - 1;
}

/**
 * Deterministic semantic-ish chunking used when stored/cache/AI chunks
 * are missing or invalid. Prefer phrase units over word soup.
 */
export function buildFallbackWordOrderChunks(
  sentenceId: string,
  english: string
): WordOrderChunk[] {
  const tokens = tokenizeForWordOrder(english);
  if (tokens.length === 0) return [];
  if (tokens.length === 1) {
    return buildChunksFromRanges(sentenceId, tokens, [{ start: 0, end: 0 }]);
  }

  const taken = new Array(tokens.length).fill(false);
  const ranges: Array<{ start: number; end: number }> = [];

  const pushRange = (start: number, end: number) => {
    for (let i = start; i <= end; i++) taken[i] = true;
    ranges.push({ start, end });
  };

  // Pass 1: fixed phrases
  for (let i = 0; i < tokens.length; i++) {
    if (taken[i]) continue;
    for (const phrase of FIXED_PHRASES) {
      const end = matchPhraseAt(tokens, i, phrase);
      if (end == null) continue;
      let blocked = false;
      for (let j = i; j <= end; j++) {
        if (taken[j]) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      const n = end - i + 1;
      if (n > WORD_ORDER_MAX_CHUNK_WORDS_FIXED) continue;
      pushRange(i, end);
      break;
    }
  }

  // Pass 2: grammar merges on remaining spans
  let i = 0;
  while (i < tokens.length) {
    if (taken[i]) {
      i += 1;
      continue;
    }
    // find contiguous free span
    let j = i;
    while (j < tokens.length && !taken[j]) j += 1;
    const spanStart = i;
    const spanEnd = j - 1;
    let k = spanStart;
    while (k <= spanEnd) {
      const low = bareLower(tokens[k]!.surface);
      let end = k;

      // determiner / possessive NP (up to 4)
      if (DETERMINERS.has(low) && k < spanEnd) {
        end = Math.min(spanEnd, k + 3);
        // stop before next prep/conj if mid
        for (let t = k + 1; t <= end; t++) {
          const bl = bareLower(tokens[t]!.surface);
          if (t > k + 1 && (PREPOSITIONS.has(bl) || CONJ_REL.has(bl))) {
            end = t - 1;
            break;
          }
        }
      }
      // prepositional phrase (prep + up to 3)
      else if (PREPOSITIONS.has(low) && k < spanEnd) {
        end = Math.min(spanEnd, k + 3);
        for (let t = k + 1; t <= end; t++) {
          const bl = bareLower(tokens[t]!.surface);
          if (t > k + 1 && (PREPOSITIONS.has(bl) || CONJ_REL.has(bl))) {
            end = t - 1;
            break;
          }
        }
      }
      // aux/modal + verb (+ optional particle)
      else if (AUX_MODAL.has(low) && k < spanEnd) {
        end = k + 1;
        if (end < spanEnd) {
          const next = bareLower(tokens[end + 1]!.surface);
          if (
            ["about", "on", "out", "up", "in", "off", "over", "along"].includes(
              next
            )
          ) {
            end += 1;
          }
        }
      }
      // to-infinitive (+ short object)
      else if (low === "to" && k < spanEnd) {
        end = Math.min(spanEnd, k + 2);
      }
      // conjunction / relative + next 1–2
      else if (CONJ_REL.has(low) && k < spanEnd) {
        end = Math.min(spanEnd, k + 2);
        // keep "and that" / "but if" style
        if (
          end > k + 1 &&
          !CONJ_REL.has(bareLower(tokens[k + 1]!.surface)) &&
          !DETERMINERS.has(bareLower(tokens[k + 1]!.surface))
        ) {
          // ok
        }
      }
      // particle verb leftover: verb + about/on/...
      else if (k < spanEnd) {
        const next = bareLower(tokens[k + 1]!.surface);
        if (
          ["about", "on", "out", "up", "off", "over", "along", "into"].includes(
            next
          )
        ) {
          end = k + 1;
        } else {
          // default 2–3 word merge when many singles ahead
          end = Math.min(spanEnd, k + 2);
        }
      }

      // Cap default size
      if (end - k + 1 > WORD_ORDER_MAX_CHUNK_WORDS) {
        end = k + WORD_ORDER_MAX_CHUNK_WORDS - 1;
      }

      // Prefer splitting before trailing comma groups stay attached (already on token)
      pushRange(k, end);
      k = end + 1;
    }
    i = j;
  }

  ranges.sort((a, b) => a.start - b.start);

  // Merge adjacent tiny leftovers to cut singleton ratio
  let merged = mergeToReduceSingletons(ranges, tokens);
  merged = splitOversized(merged, tokens);
  merged = ensureMinChunkCount(merged, tokens);

  return buildChunksFromRanges(sentenceId, tokens, merged);
}

function mergeToReduceSingletons(
  ranges: Array<{ start: number; end: number }>,
  tokens: WordOrderToken[]
): Array<{ start: number; end: number }> {
  const out = [...ranges];

  // Attach lone prepositions to the following chunk (of + NP)
  for (let i = 0; i < out.length - 1; i++) {
    const r = out[i]!;
    if (r.end !== r.start) continue;
    const low = bareLower(tokens[r.start]!.surface);
    if (!PREPOSITIONS.has(low)) continue;
    const next = out[i + 1]!;
    const size = next.end - r.start + 1;
    if (size <= WORD_ORDER_MAX_CHUNK_WORDS_FIXED) {
      out.splice(i, 2, { start: r.start, end: next.end });
      i -= 1;
    }
  }

  const singletonRatio = () => {
    if (!out.length) return 0;
    const singles = out.filter((r) => r.end === r.start).length;
    return singles / out.length;
  };

  let guard = 0;
  while (singletonRatio() > WORD_ORDER_MAX_SINGLE_WORD_RATIO && guard < 40) {
    guard += 1;
    let changed = false;
    for (let i = 0; i < out.length; i++) {
      const r = out[i]!;
      if (r.end !== r.start) continue;
      const low = bareLower(tokens[r.start]!.surface);
      if (STRUCTURAL_SINGLE.has(low)) continue;
      // merge with smaller neighbor
      if (i + 1 < out.length) {
        const next = out[i + 1]!;
        const size = next.end - r.start + 1;
        if (size <= WORD_ORDER_MAX_CHUNK_WORDS) {
          out.splice(i, 2, { start: r.start, end: next.end });
          changed = true;
          break;
        }
      }
      if (i > 0) {
        const prev = out[i - 1]!;
        const size = r.end - prev.start + 1;
        if (size <= WORD_ORDER_MAX_CHUNK_WORDS) {
          out.splice(i - 1, 2, { start: prev.start, end: r.end });
          changed = true;
          break;
        }
      }
    }
    if (!changed) break;
  }
  return out;
}

function splitOversized(
  ranges: Array<{ start: number; end: number }>,
  _tokens: WordOrderToken[]
): Array<{ start: number; end: number }> {
  const out: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const n = r.end - r.start + 1;
    if (n <= WORD_ORDER_MAX_CHUNK_WORDS_FIXED) {
      out.push(r);
      continue;
    }
    let s = r.start;
    while (s <= r.end) {
      const e = Math.min(r.end, s + WORD_ORDER_MAX_CHUNK_WORDS - 1);
      out.push({ start: s, end: e });
      s = e + 1;
    }
  }
  return out;
}

function ensureMinChunkCount(
  ranges: Array<{ start: number; end: number }>,
  tokens: WordOrderToken[]
): Array<{ start: number; end: number }> {
  const words = tokens.length;
  let minChunks = 3;
  if (words <= 8) minChunks = 3;
  else if (words <= 15) minChunks = 4;
  else if (words <= 25) minChunks = 6;
  else if (words <= 40) minChunks = 8;
  else minChunks = 10;

  const out = [...ranges];
  let guard = 0;
  while (out.length < minChunks && guard < 30) {
    guard += 1;
    // split the longest chunk
    let longest = 0;
    let idx = -1;
    for (let i = 0; i < out.length; i++) {
      const n = out[i]!.end - out[i]!.start + 1;
      if (n > longest) {
        longest = n;
        idx = i;
      }
    }
    if (idx < 0 || longest < 2) break;
    const r = out[idx]!;
    const mid = r.start + Math.floor((r.end - r.start) / 2);
    out.splice(
      idx,
      1,
      { start: r.start, end: mid },
      { start: mid + 1, end: r.end }
    );
  }
  return out;
}

/** Try to read pre-stored phrase/chunk arrays from arbitrary lesson-pack JSON. */
export function extractStoredChunksFromPack(
  pack: unknown,
  sentenceId: string,
  english: string
): WordOrderChunk[] | null {
  if (!pack || typeof pack !== "object") return null;
  const root = pack as Record<string, unknown>;
  const candidates: unknown[] = [];
  for (const key of [
    "wordOrderChunks",
    "semanticChunks",
    "phraseChunks",
    "syntaxUnits",
    "readingChunks",
    "chunks",
  ]) {
    if (root[key] != null) candidates.push(root[key]);
  }
  // nested caches
  if (root.wordOrderChunkCache && typeof root.wordOrderChunkCache === "object") {
    candidates.push(root.wordOrderChunkCache);
  }

  for (const c of candidates) {
    const parsed = tryParseStoredSentenceChunks(c, sentenceId, english);
    if (parsed) return parsed;
  }
  return null;
}

function tryParseStoredSentenceChunks(
  raw: unknown,
  sentenceId: string,
  english: string
): WordOrderChunk[] | null {
  if (!raw) return null;
  const tokens = tokenizeForWordOrder(english);

  // Shape: { sentences: [{ sentenceId, chunks: [{text}|string] }] }
  if (typeof raw === "object" && raw && "sentences" in raw) {
    const sentences = (raw as { sentences?: unknown }).sentences;
    if (Array.isArray(sentences)) {
      const row = sentences.find(
        (s) =>
          s &&
          typeof s === "object" &&
          String((s as { sentenceId?: string }).sentenceId) === sentenceId
      ) as { chunks?: unknown } | undefined;
      if (row?.chunks) {
        return chunksFromTextList(sentenceId, tokens, row.chunks);
      }
    }
  }

  // Shape: { [sentenceId]: string[] } or Record
  if (typeof raw === "object" && raw && sentenceId in (raw as object)) {
    const list = (raw as Record<string, unknown>)[sentenceId];
    return chunksFromTextList(sentenceId, tokens, list);
  }

  return null;
}

function chunksFromTextList(
  sentenceId: string,
  tokens: WordOrderToken[],
  list: unknown
): WordOrderChunk[] | null {
  if (!Array.isArray(list) || list.length < 2) return null;
  const texts = list.map((x) => {
    if (typeof x === "string") return normalizeWhitespace(x);
    if (x && typeof x === "object" && "text" in x) {
      return normalizeWhitespace(String((x as { text: unknown }).text ?? ""));
    }
    return "";
  });
  if (texts.some((t) => !t)) return null;

  const ranges: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (const text of texts) {
    const parts = text.split(/\s+/).filter(Boolean);
    if (cursor + parts.length > tokens.length) return null;
    for (let i = 0; i < parts.length; i++) {
      if (
        normalizeWhitespace(tokens[cursor + i]!.surface) !==
        normalizeWhitespace(parts[i]!)
      ) {
        // allow punctuation-normalized compare
        if (bareLower(tokens[cursor + i]!.surface) !== bareLower(parts[i]!)) {
          return null;
        }
      }
    }
    ranges.push({ start: cursor, end: cursor + parts.length - 1 });
    cursor += parts.length;
  }
  if (cursor !== tokens.length) return null;
  const chunks = buildChunksFromRanges(sentenceId, tokens, ranges);
  const v = validateWordOrderChunks(
    tokens.map((t) => t.surface).join(" "),
    chunks
  );
  return v.ok ? chunks : null;
}

export function isFreshChunkAlgorithm(version: string | undefined): boolean {
  return version === WORD_ORDER_CHUNK_ALGORITHM_VERSION;
}
