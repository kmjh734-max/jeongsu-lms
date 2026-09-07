import type { WordOrderChunk } from "@/lib/lesson-materials/word-order-chunking";
import {
  tokenizeForWordOrder,
  normalizeWhitespace,
} from "@/lib/lesson-materials/word-order-tokenize";
import { wordCountInChunk } from "@/lib/lesson-materials/word-order-chunking";

export type ChunkRefinementIssue =
  | "ISOLATED_WH_WORD"
  | "SPLIT_WH_INFINITIVE"
  | "ISOLATED_DETERMINER"
  | "ISOLATED_AUXILIARY"
  | "ISOLATED_MODIFIER"
  | "SPLIT_SHORT_COORDINATION"
  | "CROSSES_INDEPENDENT_CLAUSE"
  | "OVER_MERGED_CHUNK";

const MAX_MERGED_WORDS = 6;
const MIN_CHUNKS = 3;

const WH_WORDS = new Set([
  "how",
  "what",
  "where",
  "when",
  "which",
  "who",
  "whom",
  "whether",
]);

const PREP_RELATIVE = new Set([
  "for which",
  "in which",
  "to which",
  "with whom",
  "by whom",
  "of which",
  "on which",
  "at which",
  "from which",
]);

const STRUCTURAL_KEEP = new Set([
  "is",
  "are",
  "was",
  "were",
  "however",
  "instead",
  "therefore",
  "thus",
  "but",
]);

const ISOLATED_MODIFIERS = new Set([
  "outside",
  "inside",
  "alone",
  "together",
  "forward",
  "backward",
  "later",
  "earlier",
  "rapidly",
  "slowly",
  "away",
  "home",
  "abroad",
  "here",
  "there",
]);

const SUBJECT_PRONOUNS = new Set([
  "i",
  "we",
  "you",
  "he",
  "she",
  "it",
  "they",
]);

function stripPunct(s: string): string {
  return s.replace(/[.,;:!?]+$/g, "").toLowerCase();
}

function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function bareWords(text: string): string[] {
  return wordsOf(text).map(stripPunct);
}

function renumber(
  sentenceId: string,
  chunks: WordOrderChunk[]
): WordOrderChunk[] {
  return chunks.map((c, i) => ({
    ...c,
    chunkId: `${sentenceId}-c${i + 1}`,
    originalIndex: i,
  }));
}

function mergeAdjacent(
  chunks: WordOrderChunk[],
  i: number,
  type?: WordOrderChunk["type"]
): WordOrderChunk[] {
  const a = chunks[i]!;
  const b = chunks[i + 1]!;
  const merged: WordOrderChunk = {
    chunkId: a.chunkId,
    text: `${a.text} ${b.text}`.replace(/\s+/g, " ").trim(),
    originalIndex: a.originalIndex,
    startTokenIndex: a.startTokenIndex,
    endTokenIndex: b.endTokenIndex,
    type: type ?? a.type ?? b.type ?? "other",
  };
  return [...chunks.slice(0, i), merged, ...chunks.slice(i + 2)];
}

function endsWithClausePunct(text: string): boolean {
  return /[,;:]$/.test(text.trim());
}

/** Independent-clause coordinator: and/but/yet/or + new subject (+ verb). */
function looksLikeIndependentClauseStart(chunkText: string): boolean {
  const w = bareWords(chunkText);
  if (w.length === 0) return false;
  const first = w[0]!;
  if (!["and", "but", "yet", "or", "so"].includes(first)) return false;
  if (w.length >= 2 && SUBJECT_PRONOUNS.has(w[1]!)) return true;
  // "and they are..." already covered; also "but if" keep separate
  return false;
}

function isPrepRelativeChunk(text: string): boolean {
  const n = normalizeWhitespace(text).toLowerCase().replace(/[.,;:!?]+$/g, "");
  return PREP_RELATIVE.has(n);
}

function shouldMergeWhInfinitive(
  current: WordOrderChunk,
  next: WordOrderChunk
): boolean {
  if (isPrepRelativeChunk(current.text)) return false;
  const cur = bareWords(current.text);
  const nxt = bareWords(next.text);
  if (cur.length === 0 || nxt.length === 0) return false;
  const last = cur[cur.length - 1]!;
  if (!WH_WORDS.has(last)) return false;
  // Prefer isolated WH or short "know how" style (last is WH)
  if (cur.length > 2) return false;
  const first = nxt[0]!;
  if (first === "to") return true;
  if (first === "not" && nxt[1] === "to") return true;
  return false;
}

/** Light verb heuristic — blocks clause-level coordination merges. */
const LIKELY_VERBS = new Set([
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
  "will",
  "would",
  "can",
  "could",
  "may",
  "might",
  "must",
  "shall",
  "should",
  "need",
  "needs",
  "support",
  "supports",
  "supported",
  "learn",
  "learns",
  "learning",
  "go",
  "goes",
  "going",
  "went",
  "make",
  "makes",
  "made",
  "bring",
  "brings",
  "brought",
  "read",
  "reads",
  "reading",
  "accept",
  "accepts",
  "reject",
  "rejects",
  "decide",
  "decides",
  "know",
  "knows",
  "stay",
  "stays",
  "stayed",
  "occupy",
  "occupies",
  "held",
  "hold",
  "holds",
  "focusing",
  "focus",
  "believe",
  "believes",
  "allow",
  "allows",
  "participate",
  "states",
  "attracts",
  "evaluate",
  "evaluates",
  "respond",
  "responds",
  "stop",
  "stops",
  "socialize",
  "continue",
  "choose",
  "ask",
]);

function looksVerbal(text: string): boolean {
  return bareWords(text).some((w) => LIKELY_VERBS.has(w));
}

function isShortNounishChunk(text: string): boolean {
  const w = bareWords(text);
  if (w.length === 0 || w.length > 3) return false;
  if (looksLikeIndependentClauseStart(text)) return false;
  if (looksVerbal(text)) return false;
  if (w.length >= 2 && SUBJECT_PRONOUNS.has(w[0]!)) return false;
  return true;
}

function isShortNpAfterConj(curWords: string[]): boolean {
  const after = curWords.slice(1);
  if (after.length === 0 || after.length > 3) return false;
  if (after.some((w) => SUBJECT_PRONOUNS.has(w))) return false;
  // VP coordination: "and read physical cues" / "or reject the proposal"
  if (looksVerbal(after.join(" "))) return false;
  return true;
}

function shouldMergeShortCoordination(
  prev: WordOrderChunk,
  current: WordOrderChunk
): boolean {
  const curWords = bareWords(current.text);
  if (curWords.length === 0) return false;
  const conj = curWords[0]!;
  if (!["and", "or"].includes(conj)) return false;
  if (looksLikeIndependentClauseStart(current.text)) return false;
  if (endsWithClausePunct(prev.text)) return false;
  if (!isShortNpAfterConj(curWords)) return false;
  if (!isShortNounishChunk(prev.text)) return false;

  const mergedCount =
    wordCountInChunk(prev.text) + wordCountInChunk(current.text);
  return mergedCount <= MAX_MERGED_WORDS;
}

/**
 * "supports teachers" / "and students" → peel last noun, then merge NP.
 */
function tryPeelLastNounForCoordination(
  prev: WordOrderChunk,
  current: WordOrderChunk
): { remainderText: string; mergedText: string } | null {
  const curWords = bareWords(current.text);
  if (curWords.length === 0) return null;
  if (!["and", "or"].includes(curWords[0]!)) return null;
  if (looksLikeIndependentClauseStart(current.text)) return null;
  if (!isShortNpAfterConj(curWords)) return null;
  if (endsWithClausePunct(prev.text)) return null;

  const prevTokens = wordsOf(prev.text);
  if (prevTokens.length < 2) return null;
  if (!looksVerbal(prev.text)) return null;

  const lastSurface = prevTokens[prevTokens.length - 1]!;
  const lastBare = stripPunct(lastSurface);
  if (!lastBare || SUBJECT_PRONOUNS.has(lastBare) || LIKELY_VERBS.has(lastBare)) {
    return null;
  }
  // Don't peel trailing punctuation-only; keep surface punctuation on peeled noun
  const remainderTokens = prevTokens.slice(0, -1);
  const remainderText = remainderTokens.join(" ");
  if (wordCountInChunk(remainderText) < 2) return null;

  const peeledChunk: WordOrderChunk = {
    ...prev,
    text: lastSurface,
  };
  if (!shouldMergeShortCoordination(peeledChunk, current)) return null;

  const mergedText = `${lastSurface} ${current.text}`
    .replace(/\s+/g, " ")
    .trim();
  if (wordCountInChunk(mergedText) > MAX_MERGED_WORDS) return null;
  return { remainderText, mergedText };
}

function shouldAttachIsolatedModifier(
  prev: WordOrderChunk,
  isolated: WordOrderChunk,
  next: WordOrderChunk | undefined
): boolean {
  const w = bareWords(isolated.text);
  if (w.length !== 1) return false;
  const word = w[0]!;
  if (STRUCTURAL_KEEP.has(word)) return false;
  if (WH_WORDS.has(word)) return false;
  if (!ISOLATED_MODIFIERS.has(word) && word.length > 10) return false;
  // only known short adverbs/complements or single alpha modifier
  if (!ISOLATED_MODIFIERS.has(word) && !/^[a-z]+$/i.test(word)) return false;
  if (!ISOLATED_MODIFIERS.has(word)) {
    // don't swallow random nouns; only clear adverb-ish list
    return false;
  }
  if (endsWithClausePunct(prev.text)) return false;
  if (endsWithClausePunct(isolated.text)) return false;
  const merged = wordCountInChunk(prev.text) + 1;
  if (merged > MAX_MERGED_WORDS) return false;
  // Prefer attaching before infinitive ("going outside / to play")
  if (next && bareWords(next.text)[0] === "to") return true;
  return true;
}

function diagnoseRefinementIssues(
  chunks: WordOrderChunk[]
): ChunkRefinementIssue[] {
  const issues: ChunkRefinementIssue[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i]!;
    const w = bareWords(c.text);
    const next = chunks[i + 1];
    if (w.length === 1 && WH_WORDS.has(w[0]!) && next) {
      const n0 = bareWords(next.text)[0];
      if (n0 === "to" || n0 === "not") issues.push("SPLIT_WH_INFINITIVE");
      else issues.push("ISOLATED_WH_WORD");
    }
    if (w.length === 1 && ["the", "a", "an", "our", "my"].includes(w[0]!)) {
      issues.push("ISOLATED_DETERMINER");
    }
    if (w.length === 1 && ["being", "been"].includes(w[0]!)) {
      issues.push("ISOLATED_AUXILIARY");
    }
    if (w.length === 1 && ISOLATED_MODIFIERS.has(w[0]!)) {
      issues.push("ISOLATED_MODIFIER");
    }
    if (
      next &&
      ["and", "or"].includes(bareWords(next.text)[0] ?? "") &&
      shouldMergeShortCoordination(c, next)
    ) {
      issues.push("SPLIT_SHORT_COORDINATION");
    }
    if (/,\s+(yet|but|and|they|we)\b/i.test(c.text)) {
      issues.push("CROSSES_INDEPENDENT_CLAUSE");
    }
    if (wordCountInChunk(c.text) > MAX_MERGED_WORDS + 2) {
      issues.push("OVER_MERGED_CHUNK");
    }
  }
  return [...new Set(issues)];
}

/**
 * Post-process chunks in original order (before shuffle).
 * Merges awkward splits without rewriting the whole generator.
 */
export function refineSemanticChunks(
  chunks: WordOrderChunk[],
  english: string
): WordOrderChunk[] {
  if (chunks.length < 2) return chunks;
  const tokens = tokenizeForWordOrder(english);
  const sentenceId =
    chunks[0]!.chunkId.replace(/-c\d+$/, "") || "s";

  let out = [...chunks].sort(
    (a, b) => a.startTokenIndex - b.startTokenIndex
  );

  let guard = 0;
  let changed = true;
  while (changed && guard < 40) {
    changed = false;
    guard += 1;

    // 1) WH + to-infinitive
    for (let i = 0; i < out.length - 1; i++) {
      if (!shouldMergeWhInfinitive(out[i]!, out[i + 1]!)) continue;
      const mergedWords =
        wordCountInChunk(out[i]!.text) + wordCountInChunk(out[i + 1]!.text);
      if (mergedWords > MAX_MERGED_WORDS) continue;
      out = mergeAdjacent(out, i, "infinitive-phrase");
      changed = true;
      break;
    }
    if (changed) continue;

    // 2) short coordination (phones / and tablets)
    for (let i = 0; i < out.length - 1; i++) {
      if (shouldMergeShortCoordination(out[i]!, out[i + 1]!)) {
        out = mergeAdjacent(out, i, "noun-phrase");
        changed = true;
        break;
      }
      const peeled = tryPeelLastNounForCoordination(out[i]!, out[i + 1]!);
      if (!peeled) continue;
      const a = out[i]!;
      const b = out[i + 1]!;
      const remEnd = a.endTokenIndex - 1;
      const remainder: WordOrderChunk = {
        ...a,
        text: peeled.remainderText,
        endTokenIndex: remEnd,
      };
      const merged: WordOrderChunk = {
        chunkId: b.chunkId,
        text: peeled.mergedText,
        originalIndex: a.originalIndex,
        startTokenIndex: remEnd + 1,
        endTokenIndex: b.endTokenIndex,
        type: "noun-phrase",
      };
      out = [...out.slice(0, i), remainder, merged, ...out.slice(i + 2)];
      changed = true;
      break;
    }
    if (changed) continue;

    // 3) isolated modifier (outside)
    for (let i = 1; i < out.length; i++) {
      const prev = out[i - 1]!;
      const cur = out[i]!;
      const next = out[i + 1];
      if (!shouldAttachIsolatedModifier(prev, cur, next)) continue;
      out = mergeAdjacent(out, i - 1, prev.type ?? "verb-phrase");
      changed = true;
      break;
    }
  }

  // Ensure token coverage still matches english via indices
  if (out.length > 0) {
    const first = out[0]!;
    const last = out[out.length - 1]!;
    if (
      first.startTokenIndex !== 0 ||
      last.endTokenIndex !== tokens.length - 1
    ) {
      // index repair from texts if needed — keep original if broken
      return renumber(sentenceId, chunks);
    }
  }

  // Don't over-merge below minimum chunk count (except very short sentences)
  if (out.length < MIN_CHUNKS && tokens.length >= 8) {
    return renumber(sentenceId, chunks);
  }

  const issues = diagnoseRefinementIssues(out);
  if (process.env.NODE_ENV !== "production" && issues.length) {
    // Remaining soft issues after refine — informational
    console.info("[WordOrderChunks] refine residual issues", {
      issues,
      chunks: out.map((c) => c.text).join(" / "),
    });
  }

  return renumber(sentenceId, out);
}
