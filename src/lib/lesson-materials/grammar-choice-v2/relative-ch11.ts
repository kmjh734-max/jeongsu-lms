import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type RelativeCh11Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  antecedentRule: string;
  clauseGapRule: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH11";
};

export const RELATIVE_CH11_RULES: RelativeCh11Rule[] = [
  {
    code: "RELATIVE_SUBJECT",
    subtype: "SUBJECT_GAP",
    priority: "MANDATORY",
    antecedentRule: "명사 선행사가 바로 앞에 있어야 한다",
    clauseGapRule: "관계사 바로 뒤가 관계절의 술어이고 주어가 빠져 있다",
    allowedMinimalPairs: [["that", "what"], ["which", "what"]],
    rejectConditions: ["제한적 that/which", "사람 선행사 who/that", "선행사 불분명"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_OBJECT",
    subtype: "OBJECT_GAP",
    priority: "MANDATORY",
    antecedentRule: "사람 선행사가 있고 목적격이 whom으로 실현되어 있다",
    clauseGapRule: "관계사 뒤에 별도 주어가 있고 목적어가 빠져 있다",
    allowedMinimalPairs: [["whom", "who"]],
    rejectConditions: ["제한적 that/which", "목적격 who/whom이 모두 가능한 구어 용법", "관계절 전체"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_OMISSION",
    subtype: "OBJECT_OMISSION",
    priority: "CORE",
    antecedentRule: "명사 선행사 뒤에 관계사가 생략될 수 있다",
    clauseGapRule: "목적어가 빠진 절이 선행사에 바로 이어진다",
    allowedMinimalPairs: [],
    rejectConditions: ["생략과 that이 둘 다 가능", "문항으로 만들지 않음"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_POSSESSIVE",
    subtype: "POSSESSIVE",
    priority: "MANDATORY",
    antecedentRule: "명사 선행사가 whose 앞에 있다",
    clauseGapRule: "whose가 뒤 명사를 소유격으로 수식하고 절의 다른 성분은 남아 있다",
    allowedMinimalPairs: [["whose", "who"]],
    rejectConditions: ["의문문 Whose", "who's와의 문체 선호만"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_WHAT",
    subtype: "FUSED_WHAT",
    priority: "MANDATORY",
    antecedentRule: "what 앞에는 선행사 명사가 없어야 한다",
    clauseGapRule: "what이 선행사를 포함하며 목적어나 주어가 빠져 있다",
    allowedMinimalPairs: [["what", "that"]],
    rejectConditions: ["선행사가 있으면 what 금지", "what+명사+주어+동사는 간접의문문"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_PREPOSITION_WHICH",
    subtype: "PREP_WHICH",
    priority: "MANDATORY",
    antecedentRule: "사물 선행사와 전치사가 관계사 앞에 있다",
    clauseGapRule: "전치사의 목적어 자리가 관계사로 채워진다",
    allowedMinimalPairs: [["which", "that"]],
    rejectConditions: ["where/in which는 둘 다 가능하므로 그 대립은 금지"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_PREPOSITION_WHOM",
    subtype: "PREP_WHOM",
    priority: "MANDATORY",
    antecedentRule: "사람 선행사와 전치사가 관계사 앞에 있다",
    clauseGapRule: "전치사의 목적어 자리가 관계사로 채워진다",
    allowedMinimalPairs: [["whom", "that"]],
    rejectConditions: ["전치사 없는 who/that"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_ADVERB_WHERE",
    subtype: "ADVERB_WHERE",
    priority: "MANDATORY",
    antecedentRule: "장소 선행사가 있다",
    clauseGapRule: "관계사절은 주어와 술어가 있는 완전절이다",
    allowedMinimalPairs: [["where", "which"]],
    rejectConditions: ["where/in which", "의미만 다른 장소 선택"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_ADVERB_WHEN",
    subtype: "ADVERB_WHEN",
    priority: "MANDATORY",
    antecedentRule: "시간 선행사가 있다",
    clauseGapRule: "관계사절은 완전절이다",
    allowedMinimalPairs: [["when", "which"]],
    rejectConditions: ["when이 시간의 부사절 접속사로만 쓰인 경우"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_ADVERB_WHY",
    subtype: "ADVERB_WHY",
    priority: "MANDATORY",
    antecedentRule: "reason 선행사가 있다",
    clauseGapRule: "관계사절은 완전절이다",
    allowedMinimalPairs: [["why", "which"]],
    rejectConditions: ["reason 없는 의문 why"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_ADVERB_HOW",
    subtype: "ADVERB_HOW",
    priority: "MANDATORY",
    antecedentRule: "the way 선행사가 있거나, 선행사 없이 how가 방법을 포함한다",
    clauseGapRule: "how 뒤 절은 완전절이어야 관계부사다",
    allowedMinimalPairs: [["how", "which"]],
    rejectConditions: ["the way how처럼 선행사와 how가 겹치면 비출제", "how/what 의미 대립"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_NONRESTRICTIVE",
    subtype: "COMMA_WHICH",
    priority: "MANDATORY",
    antecedentRule: "콤마 뒤 계속적 용법이며 that은 불가하다",
    clauseGapRule: "콤마 뒤 which가 관계절을 연다",
    allowedMinimalPairs: [["which", "that"]],
    rejectConditions: ["제한적 that/which", "콤마 없는 which"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_COMPOUND",
    subtype: "COMPOUND",
    priority: "MANDATORY",
    antecedentRule: "선행사 없이 복합관계사가 선행사를 포함한다",
    clauseGapRule: "whoever는 주어, whomever는 목적어, whatever/whichever는 절 안 역할이 분명해야 한다",
    allowedMinimalPairs: [
      ["whoever", "whomever"],
      ["whatever", "what"],
    ],
    rejectConditions: ["의문문 who", "문체 선호만의 whoever/whomever"],
    referenceChapter: "CH11",
  },
  {
    code: "RELATIVE_AGREEMENT",
    subtype: "ONE_OF_WHO",
    priority: "MANDATORY",
    antecedentRule: "one of the 복수명사 또는 the only one of의 선행사가 관계사절 동사 수를 결정한다",
    clauseGapRule: "who 뒤 동사는 가까운 명사가 아니라 지정된 선행사와 일치한다",
    allowedMinimalPairs: [["are", "is"]],
    rejectConditions: ["가까운 선행사와 동사만 보는 단순 수일치", "관계사 없는 수일치"],
    referenceChapter: "CH11",
  },
];

export type RelativeHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const PREP = "for|with|to|from|of|in|on|by|about|into|through|without|over|under|between|among";
const PERSON =
  "members|people|person|persons|man|men|woman|women|student|students|child|children|friend|friends|teacher|teachers|scientist|scientists|writer|writers|player|players|human|humans|those|kids|readers|artists|doctors|patients|individuals|candidates|authors|workers|leaders";
const PLACE = "place|places|town|city|cities|country|school|room|house|village|area|spot|office|building";
const TIME = "day|days|year|years|time|moment|night|morning|season|hour|week|month";
const VERB =
  "are|is|was|were|have|has|had|do|does|did|will|can|could|may|might|must|should|would|states|state|helps|help|lives|live|created|create|want|wants|need|needs|known|made|means|include|includes";
const PRONOUN = "I|you|he|she|we|they|it";

export function detectRelativeCh11(text: string): RelativeHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: RelativeHit[] = [];
  detectIndirectQuestion(source, hits);
  detectNonrestrictive(source, hits);
  detectPrepositionRelative(source, hits);
  detectWhoWhom(source, hits);
  detectFusedWhat(source, hits);
  detectSubjectThat(source, hits);
  detectPossessive(source, hits);
  detectAdverbs(source, hits);
  detectCompound(source, hits);
  detectAgreement(source, hits);
  detectOmissionAnalysis(source, hits);
  return dedupe(hits);
}

export function relativeLocalDistractor(code: string, sourceSpan: string): string | null {
  const lower = sourceSpan.trim().toLowerCase();
  if (code === "RELATIVE_NONRESTRICTIVE" && lower === "which") return "that";
  if (code === "RELATIVE_PREPOSITION_WHICH" && lower === "which") return "that";
  if (code === "RELATIVE_PREPOSITION_WHOM" && lower === "whom") return "that";
  // who/whom은 요즘 시험에서 잘 묻지 않는다(선생님, 2026-09-11). 사람 선행사에 which를 오답으로 둔다.
  if (code === "RELATIVE_WHO_WHOM" && (lower === "who" || lower === "whom")) return "which";
  if (code === "RELATIVE_WHAT" && lower === "what") return "that";
  if (code === "RELATIVE_SUBJECT" && (lower === "that" || lower === "which")) return "what";
  if (code === "RELATIVE_POSSESSIVE" && lower === "whose") return "who";
  if (
    (code === "RELATIVE_ADVERB_WHERE" && lower === "where") ||
    (code === "RELATIVE_ADVERB_WHEN" && lower === "when") ||
    (code === "RELATIVE_ADVERB_WHY" && lower === "why") ||
    (code === "RELATIVE_ADVERB_HOW" && lower === "how")
  ) {
    return "which";
  }
  if (code === "RELATIVE_COMPOUND") {
    if (lower === "whoever") return "whomever";
    if (lower === "whomever") return "whoever";
    if (lower === "whatever" || lower === "whichever") return "what";
  }
  if (code === "RELATIVE_AGREEMENT") {
    if (lower === "are") return "is";
    if (lower === "is") return "are";
  }
  // 템플릿은 스팬만 보므로 문장이 간접의문문인지는 호출부(검출기·검증기)가 가린다.
  if (code === "INDIRECT_QUESTION_ORDER" && /\byou have\b/i.test(sourceSpan)) return "do you have";
  return null;
}

export function rejectRelativeChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "TOO_TRIVIAL_SHORT_AGREEMENT" | null {
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pair === "that|which" && !/,\s*which\b/.test(input.sentence) && !new RegExp(`\\b(?:${PREP})\\s+which\\b`, "i").test(input.sentence)) {
    return "BOTH_GRAMMATICAL";
  }
  if (pair === "that|who") return "BOTH_GRAMMATICAL";
  if (pair === "in which|where" || pair === "where|in which") return "BOTH_GRAMMATICAL";
  /**
   * 간접의문문 어순은 네모 안에 주어와 동사가 함께 들어가야 문항이 된다
   * (where [the nearest station is / is the nearest station]). 같은 낱말의 어순만
   * 바꾼 쌍은 5낱말까지 둔다. 예전 3낱말 문턱에서는 명사구 주어가 들어가는 순간
   * 이 코드의 대표 문항이 떨어졌다.
   */
  const correctTokens = input.correct.trim().toLowerCase().split(/\s+/);
  const wrongTokens = input.wrong.trim().toLowerCase().split(/\s+/);
  const wordOrderOnly = [...correctTokens].sort().join(" ") === [...wrongTokens].sort().join(" ");
  if (correctTokens.length > (wordOrderOnly ? 5 : 3)) return "NON_MINIMAL_SPAN";
  if (input.pointCode === "RELATIVE_AGREEMENT" && pair === "are|is" && !/\bone of the\b|\bthe only one of\b/i.test(input.sentence)) {
    return "TOO_TRIVIAL_SHORT_AGREEMENT";
  }
  return null;
}

export function isRelativeCh11Code(code: string): boolean {
  return RELATIVE_CH11_RULES.some((rule) => rule.code === code);
}

function detectIndirectQuestion(text: string, hits: RelativeHit[]) {
  const re = /\bwhat\s+(?:[A-Za-z]+\s+){1,3}(you|we|they|he|she|I)\s+(have|has|had|want|need|do|did)\b/gi;
  for (const match of text.matchAll(re)) {
    const span = `${match[1]} ${match[2]}`;
    push(hits, "INDIRECT_QUESTION_ORDER", "INDIRECT_ORDER", span, text.indexOf(span, match.index ?? 0), true);
  }
}

function detectNonrestrictive(text: string, hits: RelativeHit[]) {
  for (const match of text.matchAll(/,\s*which\b/gi)) {
    push(hits, "RELATIVE_NONRESTRICTIVE", "COMMA_WHICH", "which", (match.index ?? 0) + match[0].toLowerCase().indexOf("which"), true);
  }
}

function detectPrepositionRelative(text: string, hits: RelativeHit[]) {
  const re = new RegExp(`\\b(?:${PREP})\\s+(which|whom)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const word = match[1] ?? "";
    const code = word.toLowerCase() === "whom" ? "RELATIVE_PREPOSITION_WHOM" : "RELATIVE_PREPOSITION_WHICH";
    const subtype = word.toLowerCase() === "whom" ? "PREP_WHOM" : "PREP_WHICH";
    push(hits, code, subtype, word, text.indexOf(word, match.index ?? 0), true);
  }
}

function detectWhoWhom(text: string, hits: RelativeHit[]) {
  const subject = new RegExp(`\\b(?:${PERSON})\\s+(who)\\s+(\\w+)`, "gi");
  for (const match of text.matchAll(subject)) {
    const rel = match[1] ?? "";
    const next = (match[2] ?? "").toLowerCase();
    if (!isSubjectFollower(next)) continue;
    if (/\bone of the\b|\bthe only one of\b/i.test(text.slice(Math.max(0, (match.index ?? 0) - 28), match.index ?? 0))) {
      continue;
    }
    push(hits, "RELATIVE_WHO_WHOM", "SUBJECT_WHO", rel, match.index! + match[0].toLowerCase().lastIndexOf("who"), true);
  }
  const object = /\b([A-Za-z]+)\s+(whom)\s+(I|you|he|she|we|they|it)\b/gi;
  for (const match of text.matchAll(object)) {
    const noun = match[1] ?? "";
    if (new RegExp(`^(?:${PREP})$`, "i").test(noun)) continue;
    const rel = match[2] ?? "";
    push(hits, "RELATIVE_OBJECT", "OBJECT_WHOM", rel, match.index! + match[0].toLowerCase().indexOf("whom"), true);
  }
}

function detectFusedWhat(text: string, hits: RelativeHit[]) {
  const re = new RegExp(`\\b(?:${PREP})\\s+what\\s+(?:${PRONOUN})\\s+\\w+`, "gi");
  for (const match of text.matchAll(re)) {
    if (isIndirectWhat(text, match.index ?? 0)) continue;
    const at = (match.index ?? 0) + match[0].toLowerCase().indexOf("what");
    push(hits, "RELATIVE_WHAT", "FUSED_WHAT", "what", at, true);
  }
}

function detectSubjectThat(text: string, hits: RelativeHit[]) {
  const re =
    /\b(?:the|a|an|this|those|these)\s+(?:[A-Za-z]+\s+){0,2}(that|which)\s+(will|can|could|may|might|must|should|would|is|are|was|were|has|have|helps|help|works|work)\b/gi;
  for (const match of text.matchAll(re)) {
    const rel = match[1] ?? "";
    const at = (match.index ?? 0) + match[0].toLowerCase().indexOf(rel.toLowerCase());
    const before = text.slice(Math.max(0, at - 16), at);
    if (new RegExp(`\\b(?:${PREP})\\s+$`, "i").test(before)) continue;
    if (/,\s*$/.test(before)) continue;
    push(hits, "RELATIVE_SUBJECT", "SUBJECT_GAP", rel, at, true);
  }
}

function detectPossessive(text: string, hits: RelativeHit[]) {
  const re = /\b([A-Za-z]+)\s+whose\s+[A-Za-z]+\b/gi;
  for (const match of text.matchAll(re)) {
    const noun = match[1] ?? "";
    if (/^(the|a|an|and|or|but|what|who|me|him|her|them|us|know|tell|ask|see|say|find|show|wonder)$/i.test(noun)) continue;
    push(hits, "RELATIVE_POSSESSIVE", "POSSESSIVE", "whose", text.indexOf("whose", match.index ?? 0), true);
  }
}

function detectAdverbs(text: string, hits: RelativeHit[]) {
  const place = new RegExp(`\\b(?:${PLACE})\\s+where\\s+(?:${PRONOUN}|the|a)\\s+\\w+`, "gi");
  for (const match of text.matchAll(place)) {
    push(hits, "RELATIVE_ADVERB_WHERE", "ADVERB_WHERE", "where", (match.index ?? 0) + match[0].toLowerCase().indexOf("where"), true);
  }
  const time = new RegExp(`\\b(?:${TIME})\\s+when\\s+(?:${PRONOUN}|the|a)\\s+\\w+`, "gi");
  for (const match of text.matchAll(time)) {
    push(hits, "RELATIVE_ADVERB_WHEN", "ADVERB_WHEN", "when", (match.index ?? 0) + match[0].toLowerCase().indexOf("when"), true);
  }
  const why = /\breason\s+why\s+(?:I|you|he|she|we|they|it|the|a)\s+\w+/gi;
  for (const match of text.matchAll(why)) {
    push(hits, "RELATIVE_ADVERB_WHY", "ADVERB_WHY", "why", (match.index ?? 0) + match[0].toLowerCase().indexOf("why"), true);
  }
  if (/\bthe way\s+how\b/i.test(text)) return;
  const fusedHow = new RegExp(`\\bhow\\s+(?:${PRONOUN})\\s+\\w+`, "gi");
  for (const match of text.matchAll(fusedHow)) {
    const at = match.index ?? 0;
    if (at === 0) continue;
    const before = text.slice(Math.max(0, at - 24), at);
    if (/\b(?:know|see|ask|wonder|tell|show|explain|remember|understand|learn|the way)\s+$/i.test(before)) continue;
    push(hits, "RELATIVE_ADVERB_HOW", "ADVERB_HOW", "how", at, true);
  }
}

function detectCompound(text: string, hits: RelativeHit[]) {
  if (text.includes("?")) return;
  for (const match of text.matchAll(/\b(whoever|whomever|whatever|whichever)\s+(\w+)/gi)) {
    const word = match[1] ?? "";
    const next = (match[2] ?? "").toLowerCase();
    const lower = word.toLowerCase();
    if (lower === "whoever" && isSubjectFollower(next)) {
      push(hits, "RELATIVE_COMPOUND", "COMPOUND", word, match.index ?? 0, true);
    } else if (lower === "whomever" && isPronoun(next)) {
      push(hits, "RELATIVE_COMPOUND", "COMPOUND", word, match.index ?? 0, true);
    } else if ((lower === "whatever" || lower === "whichever") && (isSubjectFollower(next) || isPronoun(next))) {
      push(hits, "RELATIVE_COMPOUND", "COMPOUND", word, match.index ?? 0, true);
    }
  }
}

function detectAgreement(text: string, hits: RelativeHit[]) {
  const only = /\bthe only one of the\s+[A-Za-z]+\s+who\s+(is|has|was)\b/i.exec(text);
  if (only?.[1]) {
    const verb = only[1];
    const at = text.toLowerCase().indexOf(verb.toLowerCase(), (only.index ?? 0) + "the only one of".length);
    push(hits, "RELATIVE_AGREEMENT", "ONLY_ONE_OF_WHO", verb, at, true);
  }
  const plural = /\bone of the\s+[A-Za-z]+\s+who\s+(are|have|were)\b/i.exec(text);
  if (plural?.[1] && !/\bthe only one of the\b/i.test(text.slice(Math.max(0, (plural.index ?? 0) - 8), (plural.index ?? 0) + 16))) {
    const verb = plural[1];
    const at = text.toLowerCase().indexOf(verb.toLowerCase(), (plural.index ?? 0) + "one of the".length);
    push(hits, "RELATIVE_AGREEMENT", "ONE_OF_WHO", verb, at, true);
  }
}

function detectOmissionAnalysis(text: string, hits: RelativeHit[]) {
  const re = /\b(?:the|a|an)\s+[A-Za-z]+\s+(I|you|he|she|we|they)\s+\w+/gi;
  for (const match of text.matchAll(re)) {
    const beforeRel = text.slice(Math.max(0, (match.index ?? 0) - 8), match.index ?? 0);
    if (/\b(?:who|whom|which|that|whose|what|when|where|why|how)\s*$/i.test(beforeRel)) continue;
    push(hits, "RELATIVE_OMISSION", "OBJECT_OMISSION", match[1] ?? "", match.index ?? 0, false);
  }
}

function isIndirectWhat(text: string, at: number): boolean {
  return /\bwhat\s+(?:[A-Za-z]+\s+){1,3}(?:you|we|they|he|she|I)\s+(?:have|has|had|want|need)\b/i.test(text.slice(at, at + 48));
}

function isSubjectFollower(word: string): boolean {
  if (!word || isPronoun(word)) return false;
  if (new RegExp(`^(?:${VERB})$`, "i").test(word)) return true;
  return /(?:s|ed)$/i.test(word) && word.length > 3;
}

function isPronoun(word: string): boolean {
  return /^(?:i|you|he|she|we|they|it)$/i.test(word);
}

function push(
  hits: RelativeHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: RelativeHit[]): RelativeHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
