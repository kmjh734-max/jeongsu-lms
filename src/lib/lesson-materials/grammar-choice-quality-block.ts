import { normalizeWhitespace } from "@/lib/lesson-materials/word-order-tokenize";

/**
 * Block known low-quality choice pairs (section 9 failure cases).
 */
export function isBlockedLowQualityPair(
  correctText: string,
  incorrectText: string
): { blocked: boolean; reason: string } {
  const c = normalizeWhitespace(correctText).toLowerCase();
  const i = normalizeWhitespace(incorrectText).toLowerCase();
  const pair = `${c}|${i}`;
  const rev = `${i}|${c}`;

  const exact = new Set([
    "what you want|what you wants",
    "what limiting beliefs|what limiting belief",
    "may be more challenged|may be more challenging",
    "they|what they",
    "have to do is|have to do are",
  ]);
  if (exact.has(pair) || exact.has(rev)) {
    return { blocked: true, reason: "KNOWN_LOW_QUALITY_PAIR" };
  }

  // Subject duplicated inside choice (e.g. are being held / Many kids today are holding)
  if (/\b(many|kids|today|we|they|bodies|humans)\b/i.test(incorrectText)) {
    if (incorrectText.split(/\s+/).length >= correctText.split(/\s+/).length + 2) {
      return { blocked: true, reason: "SUBJECT_LEAKED_INTO_CHOICE" };
    }
  }

  // Cross-sentence mash: both sides look like full clauses
  if (
    /[.!?]|we were made|humans are meant/i.test(incorrectText) ||
    /[.!?]|we were made|humans are meant/i.test(correctText)
  ) {
    return { blocked: true, reason: "CROSS_SENTENCE_MIX" };
  }

  // Artificial 3sg on what-clause object
  if (/what you want/.test(c) && /what you wants/.test(i)) {
    return { blocked: true, reason: "ARTIFICIAL_AGREEMENT" };
  }

  // Singular/plural belief both possible
  if (
    /limiting beliefs/.test(c) &&
    /limiting belief\b/.test(i) &&
    !/beliefs/.test(i)
  ) {
    return { blocked: true, reason: "BOTH_NUMBER_POSSIBLE" };
  }

  // challenged / challenging meaning swap
  if (/challenged/.test(pair) && /challenging/.test(pair)) {
    return { blocked: true, reason: "MEANING_NOT_GRAMMAR" };
  }

  // are being hold — crude participle spelling
  if (/are being hold\b/.test(i) || /are being hold\b/.test(c)) {
    return { blocked: true, reason: "CRUDE_SPELLING_ERROR" };
  }

  return { blocked: false, reason: "" };
}

export const BLOCKED_PAIR_FIXTURES: Array<[string, string]> = [
  ["what you want", "what you wants"],
  ["what limiting beliefs", "what limiting belief"],
  ["may be more challenged", "may be more challenging"],
  ["are being held", "Many kids today are holding"],
  ["they", "what they"],
  ["to live extraordinary lives", "We were made move"],
  ["have to do is", "have to do are"],
];
