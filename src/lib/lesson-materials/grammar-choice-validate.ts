import {
  tokenizeForWordOrder,
  normalizeWhitespace,
} from "@/lib/lesson-materials/word-order-tokenize";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";

export type GrammarChoiceRejectReason =
  | "missing_sentence"
  | "token_out_of_range"
  | "original_mismatch"
  | "correct_not_original"
  | "restore_failed"
  | "same_as_incorrect"
  | "empty_incorrect"
  | "overlap"
  | "duplicate_span"
  | "ambiguity_not_low"
  | "low_learning_value"
  | "empty_meta"
  | "ambiguous_pair"
  | "too_easy_agreement"
  | "vocab_collocation";

const AMBIGUOUS_PAIR_PATTERNS: Array<[RegExp, RegExp]> = [
  [/^(to\s+)?\w+$/i, /ing$/i], // handled more carefully below
];

const BOTH_OK_NORM = new Set([
  "begin to work|begin working",
  "begin working|begin to work",
  "like to read|like reading",
  "like reading|like to read",
  "continue to study|continue studying",
  "continue studying|continue to study",
  "remember to call|remember calling",
  "remember calling|remember to call",
  "stop to smoke|stop smoking",
  "stop smoking|stop to smoke",
  "is think|is to think",
  "is to think|is think",
  "focus on|focus at",
  "focus at|focus on",
]);

function normPair(a: string, b: string): string {
  return `${normalizeWhitespace(a).toLowerCase()}|${normalizeWhitespace(b).toLowerCase()}`;
}

function looksLikeBothOk(correct: string, incorrect: string): boolean {
  const key = normPair(correct, incorrect);
  if (BOTH_OK_NORM.has(key)) return true;
  const c = normalizeWhitespace(correct).toLowerCase();
  const i = normalizeWhitespace(incorrect).toLowerCase();
  // to V / V-ing swap for common both-ok verbs
  const bothOkVerbs = ["begin", "start", "continue", "like", "love", "hate", "prefer"];
  for (const v of bothOkVerbs) {
    if (
      (c === `${v} to` || c.startsWith(`${v} to `)) &&
      (i === `${v}` || i.startsWith(`${v} `) && /ing\b/.test(i))
    ) {
      return true;
    }
  }
  // is think / is to think
  if (
    (/\bis\s+to\s+think\b/.test(c) && /\bis\s+think\b/.test(i)) ||
    (/\bis\s+think\b/.test(c) && /\bis\s+to\s+think\b/.test(i))
  ) {
    return true;
  }
  // focus on / focus at
  if (
    (/\bfocus\s+on\b/.test(c) && /\bfocus\s+at\b/.test(i)) ||
    (/\bfocus\s+at\b/.test(c) && /\bfocus\s+on\b/.test(i))
  ) {
    return true;
  }
  return false;
}

function looksLikeTooEasyAgreement(correct: string, incorrect: string): boolean {
  const c = normalizeWhitespace(correct).toLowerCase();
  const i = normalizeWhitespace(incorrect).toLowerCase();
  const pairs: Array<[string, string]> = [
    ["is", "are"],
    ["are", "is"],
    ["was", "were"],
    ["were", "was"],
    ["has", "have"],
    ["have", "has"],
  ];
  return pairs.some(([a, b]) => c === a && i === b);
}

function looksLikeVocabCollocation(correct: string, incorrect: string): boolean {
  const c = normalizeWhitespace(correct).toLowerCase();
  const i = normalizeWhitespace(incorrect).toLowerCase();
  // different preposition only on same head verb → usually collocation
  const prepOnly =
    /^([a-z]+)\s+(on|at|in|to|for|with|from|by|about)$/i;
  const mc = c.match(prepOnly);
  const mi = i.match(prepOnly);
  if (mc && mi && mc[1] === mi[1] && mc[2] !== mi[2]) return true;
  return false;
}

export function spanTextFromTokens(
  tokens: string[],
  start: number,
  end: number
): string {
  return tokens.slice(start, end + 1).join(" ");
}

export function restoreSentenceWithChoice(
  english: string,
  start: number,
  end: number,
  replacement: string
): string {
  const tokens = tokenizeForWordOrder(english).map((t) => t.surface);
  if (start < 0 || end >= tokens.length || start > end) return "";
  const next = [
    ...tokens.slice(0, start),
    ...normalizeWhitespace(replacement).split(" ").filter(Boolean),
    ...tokens.slice(end + 1),
  ];
  // Replacement must keep same token count for exact restore of surrounding
  // When replacement has different token count, join still valid for semantic check
  // but exact original restore requires same span length.
  return next.join(" ");
}

export function validateGrammarChoiceCandidate(
  candidate: GrammarChoiceCandidate,
  sentences: Map<string, string>,
  occupied: Array<{ sentenceId: string; start: number; end: number }>
): { ok: true } | { ok: false; reason: GrammarChoiceRejectReason } {
  const english = sentences.get(candidate.sentenceId);
  if (!english) return { ok: false, reason: "missing_sentence" };

  const tokens = tokenizeForWordOrder(english).map((t) => t.surface);
  const { startTokenIndex: start, endTokenIndex: end } = candidate;
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end >= tokens.length ||
    start > end
  ) {
    return { ok: false, reason: "token_out_of_range" };
  }

  const span = spanTextFromTokens(tokens, start, end);
  if (normalizeWhitespace(span) !== normalizeWhitespace(candidate.originalText)) {
    return { ok: false, reason: "original_mismatch" };
  }
  if (
    normalizeWhitespace(candidate.correctText) !==
    normalizeWhitespace(candidate.originalText)
  ) {
    return { ok: false, reason: "correct_not_original" };
  }

  const restored = restoreSentenceWithChoice(
    english,
    start,
    end,
    candidate.correctText
  );
  if (normalizeWhitespace(restored) !== normalizeWhitespace(english)) {
    // If token count of correct equals span, restore must match; else fail
    const corrTokens = normalizeWhitespace(candidate.correctText)
      .split(" ")
      .filter(Boolean);
    if (corrTokens.length === end - start + 1) {
      return { ok: false, reason: "restore_failed" };
    }
    // Multi-token mismatch length — still require correct === original span
    return { ok: false, reason: "restore_failed" };
  }

  if (!candidate.incorrectText.trim()) {
    return { ok: false, reason: "empty_incorrect" };
  }
  if (
    normalizeWhitespace(candidate.correctText) ===
    normalizeWhitespace(candidate.incorrectText)
  ) {
    return { ok: false, reason: "same_as_incorrect" };
  }

  if (candidate.ambiguityRisk !== "low") {
    return { ok: false, reason: "ambiguity_not_low" };
  }
  if (candidate.learningValue < 3) {
    return { ok: false, reason: "low_learning_value" };
  }
  if (
    !candidate.grammarCategoryId.trim() ||
    !candidate.grammarCategoryName.trim() ||
    !candidate.bookTerm.trim() ||
    !candidate.explanationKo.trim() ||
    !candidate.incorrectReasonKo.trim()
  ) {
    return { ok: false, reason: "empty_meta" };
  }

  if (looksLikeBothOk(candidate.correctText, candidate.incorrectText)) {
    return { ok: false, reason: "ambiguous_pair" };
  }
  if (looksLikeTooEasyAgreement(candidate.correctText, candidate.incorrectText)) {
    return { ok: false, reason: "too_easy_agreement" };
  }
  if (looksLikeVocabCollocation(candidate.correctText, candidate.incorrectText)) {
    return { ok: false, reason: "vocab_collocation" };
  }

  for (const o of occupied) {
    if (o.sentenceId !== candidate.sentenceId) continue;
    if (!(end < o.start || start > o.end)) {
      return { ok: false, reason: "overlap" };
    }
  }

  const dup = occupied.some(
    (o) =>
      o.sentenceId === candidate.sentenceId &&
      o.start === start &&
      o.end === end
  );
  if (dup) return { ok: false, reason: "duplicate_span" };

  return { ok: true };
}

export function validateAndFilterCandidates(
  raw: GrammarChoiceCandidate[],
  sentenceMap: Map<string, string>
): {
  accepted: GrammarChoiceCandidate[];
  rejected: Array<{ candidate: GrammarChoiceCandidate; reason: GrammarChoiceRejectReason }>;
} {
  const accepted: GrammarChoiceCandidate[] = [];
  const rejected: Array<{
    candidate: GrammarChoiceCandidate;
    reason: GrammarChoiceRejectReason;
  }> = [];
  const occupied: Array<{ sentenceId: string; start: number; end: number }> =
    [];

  // Prefer higher learning value when sorting before greedy accept
  const sorted = [...raw].sort(
    (a, b) =>
      b.learningValue - a.learningValue || b.difficulty - a.difficulty
  );

  const perSentence = new Map<string, number>();

  for (const c of sorted) {
    const v = validateGrammarChoiceCandidate(c, sentenceMap, occupied);
    if (!v.ok) {
      rejected.push({ candidate: c, reason: v.reason });
      continue;
    }
    const n = perSentence.get(c.sentenceId) ?? 0;
    const eng = sentenceMap.get(c.sentenceId) ?? "";
    const wordCount = tokenizeForWordOrder(eng).length;
    const maxPerSentence = wordCount >= 28 ? 2 : 1;
    if (n >= maxPerSentence) {
      rejected.push({ candidate: c, reason: "overlap" });
      continue;
    }
    accepted.push(c);
    occupied.push({
      sentenceId: c.sentenceId,
      start: c.startTokenIndex,
      end: c.endTokenIndex,
    });
    perSentence.set(c.sentenceId, n + 1);
  }

  return { accepted, rejected };
}

// silence unused lint for pattern list placeholder
void AMBIGUOUS_PAIR_PATTERNS;
