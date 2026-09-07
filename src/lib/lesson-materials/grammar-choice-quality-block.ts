const PREP = new Set([
  "on",
  "at",
  "in",
  "to",
  "for",
  "with",
  "of",
  "by",
  "from",
  "into",
  "onto",
]);

function normalizeWhitespace(english: string): string {
  return english.replace(/\s+/g, " ").trim();
}

function isSinglePrepositionSwap(a: string, b: string): boolean {
  const wa = a.split(/\s+/).filter(Boolean);
  const wb = b.split(/\s+/).filter(Boolean);
  if (wa.length !== wb.length || wa.length < 2) return false;
  let diffs = 0;
  for (let i = 0; i < wa.length; i++) {
    const x = wa[i]!.toLowerCase();
    const y = wb[i]!.toLowerCase();
    if (x === y) continue;
    diffs += 1;
    if (!PREP.has(x) || !PREP.has(y)) return false;
  }
  return diffs === 1;
}

function isCrudeProgressiveBareSwap(a: string, b: string): boolean {
  const pair = [
    [a, b],
    [b, a],
  ] as const;
  for (const [prog, bare] of pair) {
    const m = prog.match(
      /^(.*?)\b((?:am|is|are|was|were)(?:\s+not)?\s+)([a-z]+ing)\b(.*)$/i
    );
    if (!m) continue;
    const rebuilt = `${m[1] ?? ""}${m[2] ?? ""}${m[3]!.slice(0, -3)}${m[4] ?? ""}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (rebuilt === bare.replace(/\s+/g, " ").trim().toLowerCase()) {
      return true;
    }
  }
  return false;
}

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
    "what limiting beliefs you have that|what limiting beliefs you have what",
    "may be|is",
    "is|may be",
    "may be|are",
    "are|may be",
    "in line with|in line to",
    "in line to|in line with",
  ]);
  if (exact.has(pair) || exact.has(rev)) {
    return { blocked: true, reason: "KNOWN_LOW_QUALITY_PAIR" };
  }

  if (
    (/^may be$/i.test(c) && /^(is|are|was|were)$/i.test(i)) ||
    (/^(is|are|was|were)$/i.test(c) && /^may be$/i.test(i))
  ) {
    return { blocked: true, reason: "BOTH_OPTIONS_POSSIBLE_BE" };
  }

  if (isSinglePrepositionSwap(c, i)) {
    return { blocked: true, reason: "LEXICAL_OR_COLLOCATION" };
  }
  if (/in line with/.test(pair) && /in line to/.test(pair)) {
    return { blocked: true, reason: "LEXICAL_OR_COLLOCATION" };
  }
  if (/focus on/.test(pair) && /focus at/.test(pair)) {
    return { blocked: true, reason: "LEXICAL_OR_COLLOCATION" };
  }

  if (isCrudeProgressiveBareSwap(c, i)) {
    return { blocked: true, reason: "TOO_TRIVIAL" };
  }

  if (/\b(many|kids|today|we|they|bodies|humans)\b/i.test(incorrectText)) {
    if (
      incorrectText.split(/\s+/).length >=
      correctText.split(/\s+/).length + 2
    ) {
      return { blocked: true, reason: "SUBJECT_LEAKED_INTO_CHOICE" };
    }
  }

  if (
    /[.!?]|we were made|humans are meant/i.test(incorrectText) ||
    /[.!?]|we were made|humans are meant/i.test(correctText)
  ) {
    return { blocked: true, reason: "CROSS_SENTENCE_MIX" };
  }

  if (/what you want/.test(c) && /what you wants/.test(i)) {
    return { blocked: true, reason: "ARTIFICIAL_AGREEMENT" };
  }

  if (
    /limiting beliefs/.test(c) &&
    /limiting belief\b/.test(i) &&
    !/beliefs/.test(i)
  ) {
    return { blocked: true, reason: "BOTH_NUMBER_POSSIBLE" };
  }

  if (/challenged/.test(pair) && /challenging/.test(pair)) {
    return { blocked: true, reason: "MEANING_NOT_GRAMMAR" };
  }

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
  [
    "what limiting beliefs you have that",
    "what limiting beliefs you have what",
  ],
  ["may be", "is"],
  ["in line with", "in line to"],
  ["are not learning", "are not learn"],
];
