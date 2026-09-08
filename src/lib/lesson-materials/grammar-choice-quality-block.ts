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

function isNounNumberSwap(a: string, b: string): boolean {
  const wa = a.split(/\s+/).filter(Boolean);
  const wb = b.split(/\s+/).filter(Boolean);
  if (wa.length !== wb.length || wa.length === 0) return false;
  let diffs = 0;
  for (let i = 0; i < wa.length; i++) {
    const x = wa[i]!.toLowerCase();
    const y = wb[i]!.toLowerCase();
    if (x === y) continue;
    diffs += 1;
    const pluralOf = (singular: string, plural: string) =>
      plural === `${singular}s` ||
      plural === `${singular}es` ||
      (singular.endsWith("y") && plural === `${singular.slice(0, -1)}ies`);
    if (!pluralOf(x, y) && !pluralOf(y, x)) return false;
  }
  return diffs === 1;
}

function isInfinitiveGerundSwap(a: string, b: string): boolean {
  const sides = [
    [a, b],
    [b, a],
  ] as const;
  for (const [inf, ger] of sides) {
    const m = inf.match(/^to ([a-z]+)$/i);
    if (!m) continue;
    const stem = m[1]!.toLowerCase();
    const g = ger.toLowerCase();
    if (g === `${stem}ing` || g === `${stem.replace(/e$/, "")}ing`) return true;
  }
  return false;
}

function isMechanicalInfinitiveMarker(a: string, b: string): boolean {
  const sides = [a, b];
  return sides.some((side) => /^to (know|face|be|do|being|knowing|facing)$/i.test(side));
}

function isMechanicalModalForm(a: string, b: string): boolean {
  const pair = `${a}|${b}`.toLowerCase();
  return (
    /might be\|been|been\|might be/.test(pair) ||
    /could bear\|bears|bears\|could bear/.test(pair) ||
    /will have\|has|has\|will have/.test(pair) ||
    /have to come\|comes|comes\|have to come/.test(pair)
  );
}

function isIfUnlessSwap(a: string, b: string): boolean {
  const hasIf = /\bif\b/.test(a) && /\bunless\b/.test(b);
  const hasUnless = /\bunless\b/.test(a) && /\bif\b/.test(b);
  return hasIf || hasUnless;
}

function isDummyItScramble(a: string, b: string): boolean {
  const pair = `${a}|${b}`;
  return /it is true that/.test(pair) && /that it is true/.test(pair);
}

function isCrudeParticipleBase(a: string, b: string): boolean {
  const pair = [
    [a, b],
    [b, a],
  ] as const;
  for (const [part, base] of pair) {
    if (/\b(made|held|meant|created|written|taken|given)\b/.test(part) === false) {
      continue;
    }
    const swapped = part
      .replace(/\bmade\b/g, "make")
      .replace(/\bheld\b/g, "hold")
      .replace(/\bmeant\b/g, "mean");
    if (swapped === base) return true;
  }
  return false;
}

function isSimpleCopulaAgreement(a: string, b: string): boolean {
  const wa = a.split(/\s+/);
  const wb = b.split(/\s+/);
  if (wa.length !== wb.length || wa.length > 4) return false;
  let diffs = 0;
  for (let i = 0; i < wa.length; i++) {
    const x = wa[i]!.toLowerCase();
    const y = wb[i]!.toLowerCase();
    if (x === y) continue;
    diffs += 1;
    const copula = new Set(["is", "are", "was", "were"]);
    if (!copula.has(x) || !copula.has(y)) return false;
  }
  return diffs === 1;
}

export type LowQualityRejectionCode =
  | "BOTH_GRAMMATICAL"
  | "BOTH_UNGRAMMATICAL"
  | "SEMANTIC_CONTRAST"
  | "MEANING_ONLY_CONTRAST"
  | "UNNATURAL_DISTRACTOR"
  | "LEXICAL_ONLY"
  | "MECHANICAL_INFINITIVE_MARKER"
  | "MECHANICAL_MODAL_FORM"
  | "NOT_GRAMMAR_POINT";

/**
 * Block known low-quality choice pairs before AI review.
 */
export function classifyLowQualityPair(
  correctText: string,
  incorrectText: string
): { blocked: boolean; reason: string; rejectionCode: LowQualityRejectionCode | null } {
  const c = normalizeWhitespace(correctText).toLowerCase();
  const i = normalizeWhitespace(incorrectText).toLowerCase();
  if (!c || !i) return { blocked: false, reason: "", rejectionCode: null };

  const exact: Array<[string, string, LowQualityRejectionCode]> = [
    ["what limiting beliefs", "what limiting belief", "BOTH_GRAMMATICAL"],
    ["may be more challenged", "may be more challenging", "MEANING_ONLY_CONTRAST"],
    ["they", "what they", "UNNATURAL_DISTRACTOR"],
    [
      "what limiting beliefs you have that",
      "what limiting beliefs you have what",
      "UNNATURAL_DISTRACTOR",
    ],
    ["may be", "is", "BOTH_GRAMMATICAL"],
    ["belief systems", "belief system", "BOTH_GRAMMATICAL"],
    ["if you don't truly believe", "unless you truly believe", "MEANING_ONLY_CONTRAST"],
    ["if you don’t truly believe", "unless you truly believe", "MEANING_ONLY_CONTRAST"],
    ["to attract", "attracting", "BOTH_GRAMMATICAL"],
    ["it is true that", "that it is true", "UNNATURAL_DISTRACTOR"],
    ["for hour and hour", "for hours and hours", "LEXICAL_ONLY"],
    ["in line with", "in line to", "LEXICAL_ONLY"],
    ["to know", "knowing", "MECHANICAL_INFINITIVE_MARKER"],
    ["to face", "facing", "MECHANICAL_INFINITIVE_MARKER"],
    ["to be", "being", "MECHANICAL_INFINITIVE_MARKER"],
    ["might be", "been", "MECHANICAL_MODAL_FORM"],
    ["could bear", "bears", "MECHANICAL_MODAL_FORM"],
    ["will have", "has", "MECHANICAL_MODAL_FORM"],
    ["have to come", "comes", "MECHANICAL_MODAL_FORM"],
  ];
  for (const [a, b, code] of exact) {
    if ((c === a && i === b) || (c === b && i === a)) {
      return { blocked: true, reason: code, rejectionCode: code };
    }
  }

  if (isMechanicalInfinitiveMarker(c, i) || isInfinitiveGerundSwap(c, i)) {
    return {
      blocked: true,
      reason: "MECHANICAL_INFINITIVE_MARKER",
      rejectionCode: "MECHANICAL_INFINITIVE_MARKER",
    };
  }
  if (isMechanicalModalForm(c, i)) {
    return {
      blocked: true,
      reason: "MECHANICAL_MODAL_FORM",
      rejectionCode: "MECHANICAL_MODAL_FORM",
    };
  }
  if (isIfUnlessSwap(c, i)) {
    return {
      blocked: true,
      reason: "MEANING_ONLY_CONTRAST",
      rejectionCode: "MEANING_ONLY_CONTRAST",
    };
  }
  if (isDummyItScramble(c, i)) {
    return {
      blocked: true,
      reason: "UNNATURAL_DISTRACTOR",
      rejectionCode: "UNNATURAL_DISTRACTOR",
    };
  }
  if (/hour and hour/.test(`${c}|${i}`) && /hours and hours/.test(`${c}|${i}`)) {
    return { blocked: true, reason: "LEXICAL_ONLY", rejectionCode: "LEXICAL_ONLY" };
  }

  if (
    (/^may be$/i.test(c) && /^(is|are|was|were)$/i.test(i)) ||
    (/^(is|are|was|were)$/i.test(c) && /^may be$/i.test(i))
  ) {
    return {
      blocked: true,
      reason: "BOTH_GRAMMATICAL",
      rejectionCode: "BOTH_GRAMMATICAL",
    };
  }

  if (isSinglePrepositionSwap(c, i)) {
    return { blocked: true, reason: "LEXICAL_ONLY", rejectionCode: "LEXICAL_ONLY" };
  }
  if (/focus on/.test(`${c}|${i}`) && /focus at/.test(`${c}|${i}`)) {
    return { blocked: true, reason: "LEXICAL_ONLY", rejectionCode: "LEXICAL_ONLY" };
  }
  if (isCrudeProgressiveBareSwap(c, i)) {
    return {
      blocked: true,
      reason: "MECHANICAL_MODAL_FORM",
      rejectionCode: "MECHANICAL_MODAL_FORM",
    };
  }

  if (/\b(many|kids|today|we|they|bodies|humans)\b/i.test(incorrectText)) {
    if (
      incorrectText.split(/\s+/).length >=
      correctText.split(/\s+/).length + 2
    ) {
      return {
        blocked: true,
        reason: "UNNATURAL_DISTRACTOR",
        rejectionCode: "UNNATURAL_DISTRACTOR",
      };
    }
  }

  if (
    /[.!?]|we were made|humans are meant/i.test(incorrectText) ||
    /[.!?]|we were made|humans are meant/i.test(correctText)
  ) {
    return {
      blocked: true,
      reason: "UNNATURAL_DISTRACTOR",
      rejectionCode: "UNNATURAL_DISTRACTOR",
    };
  }

  if (
    /limiting beliefs/.test(c) &&
    /limiting belief\b/.test(i) &&
    !/beliefs/.test(i)
  ) {
    return {
      blocked: true,
      reason: "BOTH_GRAMMATICAL",
      rejectionCode: "BOTH_GRAMMATICAL",
    };
  }
  if (/challenged/.test(`${c}|${i}`) && /challenging/.test(`${c}|${i}`)) {
    return {
      blocked: true,
      reason: "SEMANTIC_CONTRAST",
      rejectionCode: "SEMANTIC_CONTRAST",
    };
  }
  if (/are being hold\b/.test(i) || /are being hold\b/.test(c)) {
    return {
      blocked: true,
      reason: "UNNATURAL_DISTRACTOR",
      rejectionCode: "UNNATURAL_DISTRACTOR",
    };
  }

  return { blocked: false, reason: "", rejectionCode: null };
}

export function isBlockedLowQualityPair(
  correctText: string,
  incorrectText: string
): { blocked: boolean; reason: string } {
  const classified = classifyLowQualityPair(correctText, incorrectText);
  return { blocked: classified.blocked, reason: classified.reason };
}

export const BLOCKED_PAIR_FIXTURES: Array<{
  correct: string;
  incorrect: string;
  code: LowQualityRejectionCode;
}> = [
  { correct: "what limiting beliefs", incorrect: "what limiting belief", code: "BOTH_GRAMMATICAL" },
  { correct: "may be more challenged", incorrect: "may be more challenging", code: "MEANING_ONLY_CONTRAST" },
  { correct: "are being held", incorrect: "Many kids today are holding", code: "UNNATURAL_DISTRACTOR" },
  { correct: "they", incorrect: "what they", code: "UNNATURAL_DISTRACTOR" },
  { correct: "to live extraordinary lives", incorrect: "We were made move", code: "UNNATURAL_DISTRACTOR" },
  {
    correct: "what limiting beliefs you have that",
    incorrect: "what limiting beliefs you have what",
    code: "UNNATURAL_DISTRACTOR",
  },
  { correct: "may be", incorrect: "is", code: "BOTH_GRAMMATICAL" },
  { correct: "in line with", incorrect: "in line to", code: "LEXICAL_ONLY" },
  { correct: "belief systems", incorrect: "belief system", code: "BOTH_GRAMMATICAL" },
  { correct: "if you don't truly believe", incorrect: "unless you truly believe", code: "MEANING_ONLY_CONTRAST" },
  { correct: "to attract", incorrect: "attracting", code: "BOTH_GRAMMATICAL" },
  { correct: "It is true that", incorrect: "That it is true", code: "UNNATURAL_DISTRACTOR" },
  { correct: "for hour and hour", incorrect: "for hours and hours", code: "LEXICAL_ONLY" },
  { correct: "to know", incorrect: "knowing", code: "MECHANICAL_INFINITIVE_MARKER" },
  { correct: "might be", incorrect: "been", code: "MECHANICAL_MODAL_FORM" },
];

export const ALLOWED_CLEAR_PAIRS = [
  ["visualize", "visualizes"],
  ["contradict", "contradicts"],
  ["is", "are"],
  ["holding", "held"],
  ["affecting", "affected"],
] as const;
