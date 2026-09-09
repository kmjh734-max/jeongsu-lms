import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ComparisonCh12Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  referenceChapter: "CH12";
  comparisonFrame: string;
  targetRule: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
};

export const COMPARISON_CH12_RULES: ComparisonCh12Rule[] = [
  {
    code: "AS_AS",
    subtype: "EQUATIVE",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "as/so + 형용사·부사 + as",
    targetRule: "than이 원급 표지를 대체하지 않는다",
    allowedMinimalPairs: [
      ["as", "than"],
      ["many", "much"],
    ],
    rejectConditions: ["as well as", "twice as / twice larger", "4토큰 초과"],
  },
  {
    code: "COMPARATIVE",
    subtype: "THAN_FRAME",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "비교급 + than, less + 원급 + than, of the two",
    targetRule: "than이 있으면 비교급, 둘 중 비교는 the + 비교급",
    allowedMinimalPairs: [
      ["more", "most"],
      ["better", "best"],
    ],
    rejectConditions: ["importanter", "very + 비교급", "more important / importanter"],
  },
  {
    code: "COMPARATIVE",
    subtype: "BASIC_FORM",
    priority: "BASIC",
    referenceChapter: "CH12",
    comparisonFrame: "단순 비교급·최상급 형태",
    targetRule: "구조가 잠기지 않으면 형태만 묻지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["전체 CH12 문항의 25% 초과", "존재하지 않는 -er"],
  },
  {
    code: "THE_COMPARATIVE",
    subtype: "THE_MORE_THE_MORE",
    priority: "MANDATORY",
    referenceChapter: "CH12",
    comparisonFrame: "the 비교급, the 비교급",
    targetRule: "양쪽 모두 비교급",
    allowedMinimalPairs: [["more", "most"]],
    rejectConditions: ["문장 전체 재작성", "최상급으로 동시 변경"],
  },
  {
    code: "COMPARATIVE_AND_COMPARATIVE",
    subtype: "MORE_AND_MORE",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "비교급 and 비교급",
    targetRule: "두 형태가 같은 비교급",
    allowedMinimalPairs: [["more and more", "more and most"]],
    rejectConditions: ["4토큰 초과", "두 축 동시 변경"],
  },
  {
    code: "SUPERLATIVE",
    subtype: "THE_SUPERLATIVE",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "the + 최상급, by far, 서수 + 최상급",
    targetRule: "the와 범위가 잠기면 최상급",
    allowedMinimalPairs: [
      ["most", "more"],
      ["largest", "larger"],
    ],
    rejectConditions: ["most가 매우인지 최상급인지 불명", "형용사·부사 구별만"],
  },
  {
    code: "ONE_OF_SUPERLATIVE",
    subtype: "ONE_OF_PLURAL",
    priority: "MANDATORY",
    referenceChapter: "CH12",
    comparisonFrame: "one of the + 최상급 + 복수명사",
    targetRule: "최상급 뒤 명사는 복수",
    allowedMinimalPairs: [["scientists", "scientist"]],
    rejectConditions: ["one of 수일치는 CH13", "scientist 조어"],
  },
  {
    code: "COMPARISON_TARGET",
    subtype: "THAT_THOSE",
    priority: "MANDATORY",
    referenceChapter: "CH12",
    comparisonFrame: "than that/those of, than any other",
    targetRule: "앞 명사 단복수와 대용 표현이 일치할 때만",
    allowedMinimalPairs: [
      ["that", "those"],
      ["other", "others"],
    ],
    rejectConditions: ["that/which는 CH11", "than I / than me", "단복수 불명확"],
  },
  {
    code: "COMPARATIVE",
    subtype: "SPECIAL_TO",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "superior/prefer/different from/the same as",
    targetRule: "to 또는 from이 요구되면 than으로 바꾸지 않는다",
    allowedMinimalPairs: [
      ["to", "than"],
      ["from", "than"],
    ],
    rejectConditions: ["would rather는 CH04", "no more than / not more than", "둘 다 가능"],
  },
  {
    code: "MULTIPLICATIVE_COMPARISON",
    subtype: "TIMES_AS",
    priority: "CORE",
    referenceChapter: "CH12",
    comparisonFrame: "twice/times as ... as",
    targetRule: "용례가 갈리면 분석만",
    allowedMinimalPairs: [],
    rejectConditions: ["twice as large as / twice larger than"],
  },
];

export type ComparisonHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const MASS = "information|advice|evidence|furniture|time|money|water|traffic|news";
const TO_SUPER: Record<string, string> = {
  more: "most",
  better: "best",
  worse: "worst",
  larger: "largest",
  bigger: "biggest",
  smaller: "smallest",
  older: "oldest",
  newer: "newest",
  harder: "hardest",
  clearer: "clearest",
  milder: "mildest",
};
const TO_COMP: Record<string, string> = {
  most: "more",
  best: "better",
  worst: "worse",
  largest: "larger",
  biggest: "bigger",
  smallest: "smaller",
  oldest: "older",
  newest: "newer",
  hardest: "harder",
};

export function detectComparisonCh12(text: string): ComparisonHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: ComparisonHit[] = [];
  detectEquative(source, hits);
  detectThanFrame(source, hits);
  detectTheMore(source, hits);
  detectMoreAndMore(source, hits);
  detectSuperlative(source, hits);
  detectOneOf(source, hits);
  detectTarget(source, hits);
  detectSpecial(source, hits);
  detectMultiplicative(source, hits);
  detectAmbiguous(source, hits);
  return dedupe(hits);
}

export function comparisonLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span || /importanter|thinkinging/.test(lower)) return null;
  if (code === "AS_AS") {
    if (lower === "as" || lower === "so") return "than";
    if (lower === "many") return "much";
    if (lower === "much") return "many";
  }
  if (code === "COMPARATIVE") {
    if (lower === "to" || lower === "from") return "than";
    if (lower === "more") return "most";
    if (lower === "better") return "best";
    if (lower === "than") return "as";
  }
  if (code === "THE_COMPARATIVE" && lower === "more") return "most";
  if (code === "COMPARATIVE_AND_COMPARATIVE" && lower === "more and more") return "more and most";
  if (code === "COMPARATIVE_AND_COMPARATIVE" && lower === "better and better") return "better and best";
  if (code === "SUPERLATIVE") {
    if (lower === "most") return "more";
    if (TO_COMP[lower]) return TO_COMP[lower];
    if (/^most [a-z]+$/.test(lower)) return span.replace(/^most\b/i, "more");
  }
  if (code === "ONE_OF_SUPERLATIVE" && /s$/.test(lower) && !lower.endsWith("ss")) return lower.replace(/s$/, "");
  if (code === "COMPARISON_TARGET") {
    if (lower === "that") return "those";
    if (lower === "those") return "that";
    if (lower === "other") return "others";
  }
  return null;
}

export function rejectComparisonChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "IMPLAUSIBLE_DISTRACTOR" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MULTI_AXIS_EDIT" | "MECHANICAL_INFINITIVE_MARKER" | null {
  const mine =
    input.pointCode === "AS_AS" ||
    input.pointCode === "COMPARATIVE" ||
    input.pointCode === "SUPERLATIVE" ||
    input.pointCode === "THE_COMPARATIVE" ||
    input.pointCode === "COMPARATIVE_AND_COMPARATIVE" ||
    input.pointCode === "MULTIPLICATIVE_COMPARISON" ||
    input.pointCode === "ONE_OF_SUPERLATIVE" ||
    input.pointCode === "COMPARISON_TARGET";
  if (!mine) return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (/importanter|gooder|thinkinging/.test(pair)) return "IMPLAUSIBLE_DISTRACTOR";
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) return "MECHANICAL_INFINITIVE_MARKER";
  if (pair === "i|me" || pair === "than i|than me") return "BOTH_GRAMMATICAL";
  if (pair === "no more than|not more than") return "MEANING_ONLY_CONTRAST";
  if (input.correct.trim().split(/\s+/).length > 4 || input.wrong.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  const left = input.correct.trim().toLowerCase().split(/\s+/);
  const right = input.wrong.trim().toLowerCase().split(/\s+/);
  if (left.length === right.length && left.filter((token, i) => token !== right[i]).length > 1) return "MULTI_AXIS_EDIT";
  return null;
}

export function applyBasicRatioCap(hits: ComparisonHit[]): ComparisonHit[] {
  const asked = hits.filter((hit) => hit.questionable);
  const basic = asked.filter((hit) => hit.subtype === "BASIC_FORM");
  const core = asked.length - basic.length;
  const maxBasic = Math.floor(core / 3);
  let kept = 0;
  return hits.map((hit) => {
    if (!hit.questionable || hit.subtype !== "BASIC_FORM") return hit;
    if (kept < maxBasic) {
      kept += 1;
      return hit;
    }
    return { ...hit, questionable: false, subtype: "BASIC_CAPPED" };
  });
}

export function restoresSource(text: string, hit: ComparisonHit): boolean {
  return text.slice(hit.occurrenceIndex, hit.occurrenceIndex + hit.sourceSpan.length) === hit.sourceSpan;
}

function detectEquative(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\bnot\s+(as|so)\s+[a-z]+\s+as\b/gi)) {
    push(hits, "AS_AS", "EQUATIVE", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const many = new RegExp(`\\bas\\s+(many|much)\\s+(${MASS}|[a-z]+s)\\s+as\\b`, "gi");
  for (const match of text.matchAll(many)) {
    const quant = match[1] ?? "";
    const noun = (match[2] ?? "").toLowerCase();
    const mass = new RegExp(`^(?:${MASS})$`, "i").test(noun);
    const ok = mass ? /^much$/i.test(quant) : /^many$/i.test(quant);
    push(hits, "AS_AS", "AS_MANY_MUCH", exact(text, quant, match.index ?? 0), indexOfSpan(text, quant, match.index ?? 0), ok);
  }
  for (const match of text.matchAll(/\bas\s+[a-z]+\s+(as)\s+(?:possible|[A-Za-z]+\s+can)\b/gi)) {
    push(hits, "AS_AS", "AS_POSSIBLE", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", (match.index ?? 0) + 3), true);
  }
  for (const match of text.matchAll(/\bas\s+[a-z]+\s+(?:a|an)\s+[a-z]+\s+as\b/gi)) {
    push(hits, "AS_AS", "AS_ADJ_A", "as", match.index ?? 0, false);
  }
}

function detectThanFrame(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\b(?:far|much|even|still|a lot)\s+(more)\s+[a-z]+\s+than\b/gi)) {
    push(hits, "COMPARATIVE", "THAN_FRAME", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bless\s+[a-z]+\s+(than)\b/gi)) {
    push(hits, "COMPARATIVE", "LESS_THAN", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bOf the two [A-Za-z]+,\s+[^.]{0,48}?\bthe\s+(better|worse|more)\b/gi)) {
    const span = match[1] ?? "";
    push(hits, "COMPARATIVE", "OF_THE_TWO", exact(text, span, match.index ?? 0), indexOfSpan(text, span, match.index ?? 0), true);
  }
  if (/\bvery\s+(?:more|better|larger)\b/i.test(text)) {
    push(hits, "COMPARATIVE", "VERY_COMPARATIVE", "very", text.toLowerCase().search(/\bvery\s+/), false);
  }
}

function detectTheMore(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\bThe\s+(more)\s+[^,]{1,48},\s+the\s+/gi)) {
    push(hits, "THE_COMPARATIVE", "THE_MORE_THE_MORE", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectMoreAndMore(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\b(more and more|better and better|harder and harder)\b/gi)) {
    push(hits, "COMPARATIVE_AND_COMPARATIVE", "MORE_AND_MORE", exact(text, match[1] ?? "", match.index ?? 0), match.index ?? 0, true);
  }
}

function detectSuperlative(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\bby far the (most|[a-z]+est)\b/gi)) {
    const span = match[1] ?? "";
    push(hits, "SUPERLATIVE", "BY_FAR", exact(text, span, match.index ?? 0), indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bthe (?:first|second|third) (largest|biggest|smallest|oldest|newest|most [a-z]+)\b/gi)) {
    const span = match[1] ?? "";
    push(hits, "SUPERLATIVE", "ORDINAL", exact(text, span, match.index ?? 0), indexOfSpan(text, span, match.index ?? 0), true);
  }
  if (/\bmost [a-z]+\b/i.test(text) && !/\b(?:the|by far)\s+most\b/i.test(text)) {
    push(hits, "SUPERLATIVE", "AMBIGUOUS_MOST", "most", text.toLowerCase().search(/\bmost\b/), false);
  }
}

function detectOneOf(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\bone of the most [a-z]+ ([a-z]+s)\b/gi)) {
    const noun = match[1] ?? "";
    if (/^(?:news|series|species)$/i.test(noun)) continue;
    push(hits, "ONE_OF_SUPERLATIVE", "ONE_OF_PLURAL", exact(text, noun, match.index ?? 0), indexOfSpan(text, noun, match.index ?? 0), true);
  }
}

function detectTarget(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\bthan\s+(that|those)\s+of\b/gi)) {
    const marker = match[1] ?? "";
    const before = text.slice(Math.max(0, (match.index ?? 0) - 48), match.index ?? 0);
    const plural = /\b(?:these|those|results|cities|students|books|methods)\b/i.test(before) || /\b[a-z]+s\s+(?:are|were|seem)\b/i.test(before);
    const singular = /\b(?:this|the)\s+[a-z]+\s+(?:is|was)\b/i.test(before) || /\b(?:climate|price|population)\b/i.test(before);
    if (plural === singular) {
      push(hits, "COMPARISON_TARGET", "AMBIGUOUS_NUMBER", exact(text, marker, match.index ?? 0), indexOfSpan(text, marker, match.index ?? 0), false);
      continue;
    }
    const ok = plural ? /^those$/i.test(marker) : /^that$/i.test(marker);
    push(hits, "COMPARISON_TARGET", "THAT_THOSE", exact(text, marker, match.index ?? 0), indexOfSpan(text, marker, match.index ?? 0), ok);
  }
  for (const match of text.matchAll(/\bthan any (other)\s+[A-Za-z]+\b/gi)) {
    push(hits, "COMPARISON_TARGET", "ANY_OTHER", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  if (/\bthan (?:I|me)\b/i.test(text)) {
    push(hits, "COMPARISON_TARGET", "THAN_I_ME", "than", text.toLowerCase().search(/\bthan\b/), false);
  }
  if (/\bthan\s+(?:that|which)\b/i.test(text) && /\bwhich\b/i.test(text)) {
    push(hits, "COMPARISON_TARGET", "RELATIVE_DEFER", "that", text.toLowerCase().search(/\bthan\s+/), false);
  }
}

function detectSpecial(text: string, hits: ComparisonHit[]) {
  for (const match of text.matchAll(/\b(?:superior|inferior|senior|junior)\s+(to)\b/gi)) {
    push(hits, "COMPARATIVE", "SPECIAL_TO", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bprefer(?:s|red)?\s+[a-z]+ing\s+(to)\s+[a-z]+ing\b/gi)) {
    push(hits, "COMPARATIVE", "PREFER_TO", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bthe same (as)\b/gi)) {
    push(hits, "COMPARATIVE", "SAME_AS", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bdifferent (from)\b/gi)) {
    push(hits, "COMPARATIVE", "DIFFERENT_FROM", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  if (/\bwould rather\b/i.test(text)) {
    push(hits, "COMPARATIVE", "RATHER_DEFER", "rather", text.toLowerCase().search(/\brather\b/), false);
  }
  if (/\b(?:no|not) more than\b/i.test(text)) {
    push(hits, "COMPARATIVE", "MEANING_ONLY", "more", text.toLowerCase().search(/\bmore than\b/), false);
  }
}

function detectMultiplicative(text: string, hits: ComparisonHit[]) {
  if (/\b(?:twice|three times|\d+ times)\s+as\b/i.test(text)) {
    push(hits, "MULTIPLICATIVE_COMPARISON", "TIMES_AS", "as", text.toLowerCase().search(/\bas\b/), false);
  }
}

function detectAmbiguous(text: string, hits: ComparisonHit[]) {
  if (/\bthan\s+\w+\s+does\b/i.test(text)) {
    push(hits, "COMPARISON_TARGET", "ELLIPSIS_DEFER", "than", text.toLowerCase().search(/\bthan\b/), false);
  }
}

function exact(text: string, span: string, from: number): string {
  const at = indexOfSpan(text, span, from);
  return text.slice(at, at + span.length) || span;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: ComparisonHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: ComparisonHit[]): ComparisonHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}|${hit.questionable}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
