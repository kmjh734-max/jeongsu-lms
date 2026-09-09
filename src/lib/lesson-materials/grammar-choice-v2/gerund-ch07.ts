import { isMechanicalToInfinitiveMarker } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type GerundCh07Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  governingVerb: string;
  syntacticRole: string;
  meaningDifference: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH07";
  sharedForm?: string;
};

export const GERUND_CH07_RULES: GerundCh07Rule[] = [
  {
    code: "GERUND_SUBJECT",
    subtype: "SUBJECT_PHRASE",
    priority: "CORE",
    governingVerb: "",
    syntacticRole: "동명사구 주어",
    meaningDifference: "",
    allowedMinimalPairs: [],
    rejectConditions: ["단순 동명사구 주어의 is/are", "동명사구 전체 반복", "진행형·분사구문과 혼동"],
    referenceChapter: "CH07",
    sharedForm: "GERUND_SUBJECT",
  },
  {
    code: "AGREEMENT_GERUND_SUBJECT",
    subtype: "INSERTION_OR_PARALLEL",
    priority: "MANDATORY",
    governingVerb: "",
    syntacticRole: "삽입·병렬이 있는 동명사구 주어의 수일치",
    meaningDifference: "",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["짧은 동명사 + is", "may/can 뒤 수 일치", "구 전체 반복"],
    referenceChapter: "CH07",
    sharedForm: "GERUND_SUBJECT_AGREEMENT",
  },
  {
    code: "GERUND_COMPLEMENT",
    subtype: "COMPLEMENT_ING",
    priority: "CORE",
    governingVerb: "be",
    syntacticRole: "주격보어",
    meaningDifference: "",
    allowedMinimalPairs: [],
    rejectConditions: ["진행형 is V-ing", "단순 is/are"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_VERB_OBJECT",
    subtype: "GERUND_ONLY",
    priority: "MANDATORY",
    governingVerb: "enjoy/avoid/finish/mind/consider/suggest/admit/deny/postpone/quit/practice/risk/keep/imagine/resist/give up/put off",
    syntacticRole: "동사의 목적어",
    meaningDifference: "",
    allowedMinimalPairs: [
      ["taking", "to take"],
      ["discussing", "to discuss"],
    ],
    rejectConditions: ["to know/to knowing", "둘 다 가능한 동사", "목적격보어 to V", "need V-ing / need to be repaired"],
    referenceChapter: "CH07",
  },
  {
    code: "VERB_COMPLEMENT_MEANING_CHANGE",
    subtype: "BOTH_OK",
    priority: "CORE",
    governingVerb: "begin/start/continue/like/love/hate/prefer",
    syntacticRole: "동사의 목적어",
    meaningDifference: "동명사와 to부정사의 의미 차이가 거의 없다",
    allowedMinimalPairs: [],
    rejectConditions: ["begin doing / begin to do", "둘 다 가능"],
    referenceChapter: "CH07",
  },
  {
    code: "VERB_COMPLEMENT_MEANING_CHANGE",
    subtype: "MEANING_DIFF",
    priority: "CORE",
    governingVerb: "remember/forget/regret/try/stop/mean/go on",
    syntacticRole: "동사의 목적어",
    meaningDifference:
      "remember/forget/regret doing=과거, to do=해야 할 일; try doing=시험, try to do=노력; stop doing=중단, stop to do=다른 일을 위해 멈춤; mean doing=의미, mean to do=의도; go on doing=계속, go on to do=다음 행동",
    allowedMinimalPairs: [],
    rejectConditions: ["stop doing / stop to do", "의미만 다른 선택지"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_PREPOSITION_OBJECT",
    subtype: "PREP_GERUND",
    priority: "CORE",
    governingVerb: "",
    syntacticRole: "전치사의 목적어",
    meaningDifference: "",
    allowedMinimalPairs: [
      ["moving", "move"],
      ["focusing", "focus"],
      ["accepting", "accept"],
    ],
    rejectConditions: ["to know/to knowing", "to face/to facing", "to be/to being", "to V / to V-ing"],
    referenceChapter: "CH07",
    sharedForm: "GERUND_PREP_OBJECT",
  },
  {
    code: "GERUND_PREPOSITION_OBJECT",
    subtype: "PREP_PARALLEL",
    priority: "CORE",
    governingVerb: "between",
    syntacticRole: "전치사 목적어의 병렬 동명사",
    meaningDifference: "",
    allowedMinimalPairs: [],
    rejectConditions: ["병렬 동명사구 전체 반복", "형태만 묻는 선택"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_FIXED_CONSTRUCTION",
    subtype: "REQUIRED_ING",
    priority: "MANDATORY",
    governingVerb: "worth/there is no/have difficulty/spend time/be busy/feel like/no use",
    syntacticRole: "고정 동명사 구문",
    meaningDifference: "",
    allowedMinimalPairs: [
      ["knowing", "to know"],
      ["reading", "to read"],
      ["solving", "to solve"],
    ],
    rejectConditions: ["to know/to knowing", "전치사 to 뒤 V-ing", "구문 전체 반복"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_FIXED_CONSTRUCTION",
    subtype: "PREP_TO",
    priority: "CORE",
    governingVerb: "be used to/look forward to/object to/devote oneself to/be committed to/contribute to/when it comes to",
    syntacticRole: "전치사 to의 목적어",
    meaningDifference: "",
    allowedMinimalPairs: [],
    rejectConditions: ["to know/to knowing", "to face/to facing", "to V / to V-ing"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_VERB_OBJECT",
    subtype: "NEED_PASSIVE",
    priority: "CORE",
    governingVerb: "need/want/require",
    syntacticRole: "수동 의미의 동명사 목적어",
    meaningDifference: "need/want/require V-ing은 수동 의미이며 need to be repaired와 둘 다 가능하다",
    allowedMinimalPairs: [],
    rejectConditions: ["need repairing / need to be repaired"],
    referenceChapter: "CH07",
  },
  {
    code: "GERUND_LOGICAL_SUBJECT",
    subtype: "POSSESSIVE_OR_OBJECT",
    priority: "CORE",
    governingVerb: "",
    syntacticRole: "동명사의 의미상 주어",
    meaningDifference: "",
    allowedMinimalPairs: [],
    rejectConditions: ["his/him leaving처럼 둘 다 가능"],
    referenceChapter: "CH07",
  },
];

export type GerundHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const GERUND_ONLY =
  "enjoy|enjoys|enjoyed|avoid|avoids|avoided|finish|finishes|finished|mind|minds|minded|consider|considers|considered|suggest|suggests|suggested|admit|admits|admitted|deny|denies|denied|postpone|postpones|postponed|quit|quits|practice|practices|practiced|practise|practises|practised|risk|risks|risked|keep|keeps|kept|imagine|imagines|imagined|resist|resists|resisted";
const BOTH_OK =
  "begin|begins|began|begun|start|starts|started|continue|continues|continued|like|likes|liked|love|loves|loved|hate|hates|hated|prefer|prefers|preferred";
const MEANING =
  "remember|remembers|remembered|forget|forgets|forgot|forgotten|regret|regrets|regretted|try|tries|tried|stop|stops|stopped|mean|means|meant";
const PREP =
  "by|of|from|without|about|before|after|with|against|besides|despite|through|upon|such as|instead of";
const TRAP = "along with|together with|as well as|in addition to|accompanied by|rather than";

const TO_BASE: Record<string, string> = {
  taking: "to take",
  discussing: "to discuss",
  solving: "to solve",
  knowing: "to know",
  reading: "to read",
  moving: "to move",
  smoking: "to smoke",
  leaving: "to leave",
  writing: "to write",
  planning: "to plan",
  thinking: "to think",
  focusing: "to focus",
  accepting: "to accept",
  having: "to have",
  gathering: "to gather",
  subscribing: "to subscribe",
  learning: "to learn",
  waiting: "to wait",
  repairing: "to repair",
  finding: "to find",
  teaching: "to teach",
  getting: "to get",
  running: "to run",
  stopping: "to stop",
  changing: "to change",
  studying: "to study",
  finishing: "to finish",
  avoiding: "to avoid",
  practicing: "to practice",
  imagining: "to imagine",
};

export function detectGerundCh07(text: string): GerundHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: GerundHit[] = [];
  detectProgressive(source, hits);
  detectFixed(source, hits);
  detectVerbObject(source, hits);
  detectPrep(source, hits);
  detectSubject(source, hits);
  detectComplement(source, hits);
  detectLogicalSubject(source, hits);
  return dedupe(hits);
}

export function gerundLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span || /inging$/.test(lower)) return null;
  if (code === "AGREEMENT_GERUND_SUBJECT") {
    if (lower === "is") return "are";
    if (lower === "are") return "is";
    if (lower === "was") return "were";
    if (lower === "were") return "was";
    if (lower === "has") return "have";
    if (lower === "have") return "has";
  }
  if (code === "GERUND_VERB_OBJECT" || code === "GERUND_FIXED_CONSTRUCTION") {
    return TO_BASE[lower] ?? null;
  }
  if (code === "GERUND_PREPOSITION_OBJECT") {
    const toForm = TO_BASE[lower];
    return toForm?.startsWith("to ") ? toForm.slice(3) : null;
  }
  return null;
}

export function rejectGerundChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_INFINITIVE_MARKER" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "IMPLAUSIBLE_DISTRACTOR" | null {
  const mine =
    input.pointCode.startsWith("GERUND_") ||
    input.pointCode === "AGREEMENT_GERUND_SUBJECT" ||
    input.pointCode === "VERB_COMPLEMENT_MEANING_CHANGE";
  if (!mine) return null;
  if (isMechanicalToInfinitiveMarker(input.correct, input.wrong)) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (/inging$/.test(pair)) return "IMPLAUSIBLE_DISTRACTOR";
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) return "MECHANICAL_INFINITIVE_MARKER";
  if (
    input.pointCode !== "GERUND_PREPOSITION_OBJECT" &&
    /^(?:accept|accepting|focus|focusing|move|moving|have|having|gather|gathering)$/.test(pair.split("|")[0] ?? "") &&
    /\b(?:by|instead of|before|about|with|such as)\b/i.test(input.sentence) &&
    !/\b(?:worth|difficulty|trouble|spend|spent)\b/i.test(input.sentence)
  ) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (/\b(?:begin|begins|began|start|starts|started|continue|continues|continued|like|likes|liked|love|loves|loved|hate|hates|hated|prefer|prefers|preferred)\b/i.test(input.sentence) && isIngVsTo(pair)) {
    return "BOTH_GRAMMATICAL";
  }
  if (/\b(?:remember|remembers|remembered|forget|forgets|forgot|forgotten|regret|regrets|regretted|try|tries|tried|stop|stops|stopped|mean|means|meant|go on|goes on|went on)\b/i.test(input.sentence) && isIngVsTo(pair)) {
    return "MEANING_ONLY_CONTRAST";
  }
  if (/\b(?:need|want|require)s?\b/i.test(input.sentence) && /(?:repair|repairing|to be repaired)/.test(pair)) {
    return "BOTH_GRAMMATICAL";
  }
  if (/\b(?:used to|look forward to|object to|devote|committed to|contribute to|when it comes to)\b/i.test(input.sentence) && isIngVsTo(pair)) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (input.correct.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  return null;
}

function detectProgressive(text: string, hits: GerundHit[]) {
  const re = /\b(?:am|is|are|was|were)\s+(?:not\s+)?([a-z]+ing)\b/gi;
  for (const match of text.matchAll(re)) {
    const before = text.slice(Math.max(0, (match.index ?? 0) - 28), match.index ?? 0);
    if (/\b(?:job|hobby|goal|problem|task|aim|purpose|habit|duty|work|worth|busy)\s+$/i.test(before)) continue;
    if (/\b(?:there|worth)\b/i.test(before)) continue;
    push(hits, "GERUND_SUBJECT", "PROGRESSIVE_NOT_GERUND", match[0] ?? "", match.index ?? 0, false);
  }
}

function detectFixed(text: string, hits: GerundHit[]) {
  const required: Array<[RegExp, string]> = [
    [/\bThere\s+(?:is|was)\s+no\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\b(?:is|are|was|were|be)\s+worth\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\b(?:have|has|had)\s+(?:difficulty|trouble|problems)\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\b(?:spend|spends|spent|waste|wastes|wasted)\s+(?:(?:our|their|his|her|my|your|the|a|some|more|much)\s+)?(?:time|hours|days|money)\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\b(?:is|was)\s+no\s+(?:use|good)\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\b(?:am|is|are|was|were)\s+busy\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
    [/\bfeel(?:s)?\s+like\s+([a-z]+ing)\b/gi, "REQUIRED_ING"],
  ];
  for (const [re, subtype] of required) {
    for (const match of text.matchAll(re)) {
      const span = match[1] ?? "";
      push(hits, "GERUND_FIXED_CONSTRUCTION", subtype, span, indexOfSpan(text, span, match.index ?? 0), Boolean(TO_BASE[span.toLowerCase()]));
    }
  }
  const prepTo = /\b(?:(?:am|is|are|was|were|be|been|get|gets|got)\s+used to|look(?:s|ed)?\s+forward to|object(?:s|ed)?\s+to|devot(?:e|es|ed)\s+(?:himself|herself|themselves|oneself|ourselves)\s+to|(?:am|is|are|was|were|be)\s+committed to|contribute(?:s|d)?\s+to|when it comes to)\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(prepTo)) {
    push(hits, "GERUND_FIXED_CONSTRUCTION", "PREP_TO", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  for (const match of text.matchAll(/\b(?:cannot|can't|can not)\s+help\s+([a-z]+ing)\b/gi)) {
    push(hits, "GERUND_FIXED_CONSTRUCTION", "CANNOT_HELP", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  for (const match of text.matchAll(/\b(?:on|upon)\s+([a-z]+ing)\b/gi)) {
    if (/\b(?:am|is|are|was|were)\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 8), match.index ?? 0))) continue;
    push(hits, "GERUND_FIXED_CONSTRUCTION", "ON_UPON", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectVerbObject(text: string, hits: GerundHit[]) {
  const only = new RegExp(`\\b(?:${GERUND_ONLY})\\s+([a-z]+ing)\\b`, "gi");
  for (const match of text.matchAll(only)) {
    const span = match[1] ?? "";
    push(hits, "GERUND_VERB_OBJECT", "GERUND_ONLY", span, indexOfSpan(text, span, match.index ?? 0), Boolean(TO_BASE[span.toLowerCase()]));
  }
  const phrasal = /\b(?:give|gives|gave|given|put|puts)\s+(?:up|off)\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(phrasal)) {
    const span = match[1] ?? "";
    push(hits, "GERUND_VERB_OBJECT", "GERUND_ONLY", span, indexOfSpan(text, span, match.index ?? 0), Boolean(TO_BASE[span.toLowerCase()]));
  }
  const need = /\b(?:need|needs|needed|want|wants|wanted|require|requires|required)\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(need)) {
    push(hits, "GERUND_VERB_OBJECT", "NEED_PASSIVE", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  const both = new RegExp(`\\b(?:${BOTH_OK})\\s+(?:to\\s+[a-z]+|([a-z]+ing))\\b`, "gi");
  for (const match of text.matchAll(both)) {
    if (/\bwould\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 8), match.index ?? 0))) continue;
    const span = match[1] || match[0].match(/\bto\s+[a-z]+$/i)?.[0] || "to";
    push(hits, "VERB_COMPLEMENT_MEANING_CHANGE", "BOTH_OK", span, indexOfSpan(text, span, match.index ?? 0), false);
  }
  const meaning = new RegExp(`\\b(?:${MEANING})\\s+(to\\s+[a-z]+|[a-z]+ing)\\b`, "gi");
  for (const match of text.matchAll(meaning)) {
    const span = match[1] ?? "";
    push(hits, "VERB_COMPLEMENT_MEANING_CHANGE", "MEANING_DIFF", span, indexOfSpan(text, span, match.index ?? 0), false);
  }
  for (const match of text.matchAll(/\bgo(?:es)?\s+on\s+(to\s+[a-z]+|[a-z]+ing)\b/gi)) {
    push(hits, "VERB_COMPLEMENT_MEANING_CHANGE", "MEANING_DIFF", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectPrep(text: string, hits: GerundHit[]) {
  const between = /\bbetween\s+([a-z]+ing)\s+and\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(between)) {
    const span = `${match[1]} and ${match[2]}`;
    push(hits, "GERUND_PREPOSITION_OBJECT", "PREP_PARALLEL", span, match.index ?? 0, false);
  }
  const re = new RegExp(`\\b(?:${PREP})\\s+([a-z]+ing)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const span = match[1] ?? "";
    if (/\bworth\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 8), (match.index ?? 0) + 8))) continue;
    push(hits, "GERUND_PREPOSITION_OBJECT", "PREP_GERUND", span, indexOfSpan(text, span, match.index ?? 0), Boolean(TO_BASE[span.toLowerCase()]));
  }
}

function detectSubject(text: string, hits: GerundHit[]) {
  const re = /(?:^|[.!?]\s+)([A-Za-z]+ing)\b([\s\S]{0,160}?)\b(is|are|was|were|has|have|may|might|can|will|does|takes|take)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    const middle = match[2] ?? "";
    const verb = match[3] ?? "";
    if (/\b(?:am|is|are|was|were)\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 10), match.index ?? 0))) continue;
    if (middle.includes(".")) continue;
    const trap =
      new RegExp(`\\b(?:${TRAP})\\b`, "i").test(middle) ||
      (/,/.test(middle) && /\b[a-z]+ing\b/i.test(middle)) ||
      /^\s+and\s+[a-z]+ing\b/i.test(middle);
    const numberVerb = /^(?:is|are|was|were|has|have)$/i.test(verb);
    if (trap && numberVerb) {
      push(hits, "AGREEMENT_GERUND_SUBJECT", "INSERTION_OR_PARALLEL", verb, indexOfSpan(text, verb, (match.index ?? 0) + head.length), true);
      continue;
    }
    push(hits, "GERUND_SUBJECT", "SUBJECT_PHRASE", head, match.index ?? 0, false);
  }
}

function detectLogicalSubject(text: string, hits: GerundHit[]) {
  const re = /\b(?:mind|remember|excuse|appreciate|resent)s?\s+(?:his|her|their|my|our|him|them|me)\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "GERUND_LOGICAL_SUBJECT", "POSSESSIVE_OR_OBJECT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectComplement(text: string, hits: GerundHit[]) {
  const re = /\b(?:job|hobby|goal|problem|task|aim|purpose|habit|duty|favorite|work)\s+(is|was)\s+([a-z]+ing)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "GERUND_COMPLEMENT", "COMPLEMENT_ING", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
  }
}

function isIngVsTo(pair: string): boolean {
  return /^[a-z]+ing\|to [a-z]+$/.test(pair) || /^to [a-z]+\|[a-z]+ing$/.test(pair);
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: GerundHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: GerundHit[]): GerundHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
