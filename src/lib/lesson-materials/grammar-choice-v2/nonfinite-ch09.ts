import type { GrammarPointCode, GrammarPriority, LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { detectSentenceCh01 } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectInfinitiveCh06 } from "@/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { suppressSecondaryObjectComplement, suppressSecondarySameAxis } from "@/lib/lesson-materials/grammar-choice-v2/ownership";

export type NonfiniteCh09Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  finiteVerbRequirement: string;
  logicalSubjectRule: string;
  timeRelation: string;
  voiceRelation: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH09";
  ownerChapter?: "CH09";
  analysisOnly?: boolean;
  assessmentAxis?: string;
  emitsStudentQuestion?: boolean;
  secondaryAnalyzer?: boolean;
  sharedForm?: string;
};

export const NONFINITE_CH09_RULES: NonfiniteCh09Rule[] = [
  {
    code: "NONFINITE_VERBAL_PROPERTY",
    subtype: "VERBAL_PROPERTY",
    priority: "CORE",
    finiteVerbRequirement: "준동사는 목적어·보어·수식어를 가질 수 있지만 절의 시제·수를 맡지 않는다",
    logicalSubjectRule: "문장 주어와 같으면 별도 의미상 주어를 만들지 않는다",
    timeRelation: "단순형과 완료형이 둘 다 가능하면 시제 문항으로 내지 않는다",
    voiceRelation: "능동·수동이 둘 다 가능하면 태 문항으로 내지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["to know/knowing", "could try/tries", "instead of moving/move", "with having/have"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "NONFINITE_VERBAL_PROPERTY",
    emitsStudentQuestion: false,
    sharedForm: "INFINITIVE_NOUN_FUNCTION",
  },
  {
    code: "NONFINITE_LOGICAL_SUBJECT_ANALYSIS",
    subtype: "FOR_OF_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "to부정사는 본동사가 아니다",
    logicalSubjectRule: "사물의 필요·가능성은 for, 사람의 성질 평가는 of. 학생 문항은 CH06만 낸다",
    timeRelation: "for/of 선택은 시제와 같이 바꾸지 않는다",
    voiceRelation: "의미상 주어와 to V의 태를 한 문항에서 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["to V / to V-ing", "형용사 성격이 불분명", "his/him leaving처럼 둘 다 가능", "good for/of", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "NONFINITE_LOGICAL_SUBJECT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "LOGICAL_SUBJECT_FOR_OF",
  },
  {
    code: "OBJECT_COMPLEMENT_TO_V_ANALYSIS",
    subtype: "OBJECT_TO_V_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "allow/enable 뒤 to V는 목적격보어이고 본동사가 아니다. 학생 문항은 CH01만 낸다",
    logicalSubjectRule: "목적어가 to V의 의미상 주어다",
    timeRelation: "목적격보어 to V의 형태만 기계적으로 바꾸지 않는다",
    voiceRelation: "목적어와 능동·수동이 분명할 때만 태를 묻는다",
    allowedMinimalPairs: [],
    rejectConditions: ["to participate / to participating", "원형부정사와 혼동", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "OBJECT_COMPLEMENT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "OBJECT_COMPLEMENT_TO_V",
  },
  {
    code: "OBJECT_COMPLEMENT_BARE_ANALYSIS",
    subtype: "BARE_PARALLEL_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "help/let/make 뒤 원형부정사는 본동사가 아니다. 학생 문항은 CH01만 낸다",
    logicalSubjectRule: "목적어가 원형부정사의 의미상 주어다",
    timeRelation: "병렬된 원형은 같은 층위다",
    voiceRelation: "원형 병렬에서 태와 시제를 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["learn/learning", "to learn/to learning", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "OBJECT_COMPLEMENT_BARE_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "OBJECT_COMPLEMENT_BARE_V",
  },
  {
    code: "GERUND_SUBJECT_AGREEMENT_ANALYSIS",
    subtype: "NONFINITE_SUBJECT_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "긴 동명사구·to부정사구 주어의 본동사는 단수다. 학생 문항은 CH07만 낸다",
    logicalSubjectRule: "준동사구 전체가 하나의 단수 주어다",
    timeRelation: "수 일치와 준동사 시제를 같이 바꾸지 않는다",
    voiceRelation: "수 일치와 태를 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["한 단어 동명사 + is", "가까운 명사만 보고 수를 고름", "구 전체 반복", "짧은 수일치 재출제"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "GERUND_SUBJECT_AGREEMENT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "GERUND_SUBJECT_AGREEMENT",
  },
  {
    code: "PREP_MODIFIER_AGREEMENT_ANALYSIS",
    subtype: "NEAR_NOUN_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "본동사는 전치사구 속 가까운 명사가 아니라 핵어와 일치한다. 학생 문항은 CH13만 낸다",
    logicalSubjectRule: "of 뒤 명사는 핵어가 아니다",
    timeRelation: "수 일치와 시제를 같이 바꾸지 않는다",
    voiceRelation: "수 일치와 태를 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["핵어와 동사가 바로 붙은 단순 수일치", "준동사 형태 변경", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "PREP_MODIFIER_AGREEMENT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "PREP_MODIFIER_AGREEMENT",
  },
  {
    code: "INFINITIVE_PERFECT",
    subtype: "TO_HAVE_PP",
    priority: "MANDATORY",
    finiteVerbRequirement: "to have p.p.는 본동사가 아니다",
    logicalSubjectRule: "목적어가 있으면 의미상 주어는 행위 주체다",
    timeRelation: "본동사보다 앞선 동작일 때만 완료형을 묻는다",
    voiceRelation: "목적어가 있으면 수동 완료는 불가하다",
    allowedMinimalPairs: [["to have forgotten", "to have been forgotten"], ["to have written", "to have been written"]],
    rejectConditions: ["단순형과 완료형이 둘 다 가능", "완료와 수동을 동시에 변경", "구 전체 반복"],
    referenceChapter: "CH09",
  },
  {
    code: "GERUND_PERFECT",
    subtype: "HAVING_PP",
    priority: "MANDATORY",
    finiteVerbRequirement: "having p.p.는 본동사가 아니다",
    logicalSubjectRule: "목적어가 있으면 행위 주체다",
    timeRelation: "본동사보다 앞선 동작만 출제한다",
    voiceRelation: "목적어가 있는 having p.p.는 능동이다",
    allowedMinimalPairs: [["having broken", "having been broken"]],
    rejectConditions: ["시점 불분명", "분사구문 전체 반복"],
    referenceChapter: "CH09",
  },
  {
    code: "INFINITIVE_PASSIVE",
    subtype: "TO_BE_PP",
    priority: "MANDATORY",
    finiteVerbRequirement: "to be p.p.는 본동사가 아니다",
    logicalSubjectRule: "문장 주어가 준동사의 대상이어야 한다",
    timeRelation: "완료를 같이 바꾸지 않는다",
    voiceRelation: "의미상 주어가 대상이면 수동이다",
    allowedMinimalPairs: [["to be completed", "to complete"], ["to be finished", "to finish"]],
    rejectConditions: ["능동·수동 둘 다 가능", "진행 수동태 중복", "완료와 수동 동시 변경"],
    referenceChapter: "CH09",
  },
  {
    code: "GERUND_PASSIVE",
    subtype: "BEING_OR_HAVING_BEEN",
    priority: "MANDATORY",
    finiteVerbRequirement: "being p.p.와 having been p.p.는 본동사가 아니다",
    logicalSubjectRule: "의미상 주어가 대상이어야 한다",
    timeRelation: "Having been은 본동사보다 앞선 수동이다",
    voiceRelation: "be + being p.p. 진행 수동태와 구분한다",
    allowedMinimalPairs: [
      ["Having been warned", "Having warned"],
      ["being ignored", "ignoring"],
    ],
    rejectConditions: ["are being held 중복", "분사 수식 중복", "완료와 수동 동시 변경"],
    referenceChapter: "CH09",
  },
  {
    code: "NONFINITE_MEMORY_COMPLEMENT",
    subtype: "REMEMBER_FORGET_REGRET",
    priority: "MANDATORY",
    finiteVerbRequirement: "remember/forget/regret의 보충어는 절의 본동사가 아니다",
    logicalSubjectRule: "의미상 주어는 문장 주어와 같다",
    timeRelation: "to V는 앞으로 해야 할 일, V-ing는 이미 경험한 일이다",
    voiceRelation: "완료·수동을 같이 바꾸지 않는다",
    allowedMinimalPairs: [["to lock", "locking"], ["to call", "calling"]],
    rejectConditions: ["문맥 잠금 없음", "두 해석 모두 가능", "단순 to V / V-ing", "begin/start/continue"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    assessmentAxis: "NONFINITE_MEANING_CONTRAST",
  },
  {
    code: "NONFINITE_STOP_COMPLEMENT",
    subtype: "STOP_TO_OR_ING",
    priority: "MANDATORY",
    finiteVerbRequirement: "stop의 보충어는 절의 본동사가 아니다",
    logicalSubjectRule: "의미상 주어는 문장 주어와 같다",
    timeRelation: "V-ing는 하던 행동의 중단, to V는 다른 행동을 위한 멈춤이다",
    voiceRelation: "완료·수동을 같이 바꾸지 않는다",
    allowedMinimalPairs: [["smoking", "to smoke"], ["to rest", "resting"]],
    rejectConditions: ["문맥 잠금 없음", "두 해석 모두 가능", "단순 to V / V-ing"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    assessmentAxis: "NONFINITE_MEANING_CONTRAST",
  },
  {
    code: "NONFINITE_TRY_COMPLEMENT",
    subtype: "TRY_TO_OR_ING",
    priority: "MANDATORY",
    finiteVerbRequirement: "try의 보충어는 절의 본동사가 아니다",
    logicalSubjectRule: "의미상 주어는 문장 주어와 같다",
    timeRelation: "to V는 성공이 불확실한 시도, V-ing는 시험 삼아 해보는 행동이다",
    voiceRelation: "완료·수동을 같이 바꾸지 않는다",
    allowedMinimalPairs: [["to open", "opening"], ["turning", "to turn"]],
    rejectConditions: ["문맥 잠금 없음", "두 해석 모두 가능", "단순 to V / V-ing"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    assessmentAxis: "NONFINITE_MEANING_CONTRAST",
  },
  {
    code: "NONFINITE_MEAN_COMPLEMENT",
    subtype: "MEAN_TO_OR_ING",
    priority: "MANDATORY",
    finiteVerbRequirement: "mean의 보충어는 절의 본동사가 아니다",
    logicalSubjectRule: "의도일 때는 문장 주어가 행위 주체다",
    timeRelation: "to V는 의도, V-ing는 결과·수반이다",
    voiceRelation: "완료·수동을 같이 바꾸지 않는다",
    allowedMinimalPairs: [["to call", "calling"], ["waiting", "to wait"]],
    rejectConditions: ["문맥 잠금 없음", "두 해석 모두 가능", "단순 to V / V-ing"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    assessmentAxis: "NONFINITE_MEANING_CONTRAST",
  },
  {
    code: "NONFINITE_GO_ON_COMPLEMENT",
    subtype: "GO_ON_TO_OR_ING",
    priority: "MANDATORY",
    finiteVerbRequirement: "go on의 보충어는 절의 본동사가 아니다",
    logicalSubjectRule: "의미상 주어는 문장 주어와 같다",
    timeRelation: "V-ing는 같은 행동의 계속, to V는 다음 단계다",
    voiceRelation: "완료·수동을 같이 바꾸지 않는다",
    allowedMinimalPairs: [["talking", "to talk"], ["to explain", "explaining"]],
    rejectConditions: ["문맥 잠금 없음", "두 해석 모두 가능", "단순 to V / V-ing"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    assessmentAxis: "NONFINITE_MEANING_CONTRAST",
  },
  {
    code: "GERUND_PREP_OBJECT_ANALYSIS",
    subtype: "PREP_GERUND_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "전치사 뒤 V-ing는 목적어이고 본동사가 아니다. 학생 문항은 CH07만 낸다",
    logicalSubjectRule: "문장 주어와 같으면 별도 주어를 만들지 않는다",
    timeRelation: "전치사 목적어에서 시제를 기계적으로 바꾸지 않는다",
    voiceRelation: "진행형과 구분한다",
    allowedMinimalPairs: [],
    rejectConditions: ["focusing/focus", "moving/move", "having/have", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "GERUND_PREP_OBJECT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "GERUND_PREP_OBJECT",
  },
  {
    code: "GERUND_SUBJECT_ANALYSIS",
    subtype: "GERUND_PHRASE_ANALYSIS",
    priority: "CORE",
    finiteVerbRequirement: "동명사구 뒤 조동사·본동사가 절의 수를 담당한다. 학생 문항은 CH07만 낸다",
    logicalSubjectRule: "동명사구 전체가 주어다",
    timeRelation: "주어 분류와 시제 대립을 섞지 않는다",
    voiceRelation: "주어 동명사를 분사구문으로 보지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["동명사구 전체 반복", "분사 수식으로 중복 출제", "학생 문항 emit"],
    referenceChapter: "CH09",
    ownerChapter: "CH09",
    analysisOnly: true,
    assessmentAxis: "GERUND_SUBJECT_ANALYSIS",
    emitsStudentQuestion: false,
    secondaryAnalyzer: true,
    sharedForm: "GERUND_SUBJECT",
  },
];

export type NonfiniteHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
  exclusionReason?: LocalRejectCode;
  contextLockType?: string;
  evidenceSpan?: string;
  intendedMeaning?: string;
  rejectedAlternativeMeaning?: string;
};

const FOR_ADJ = "important|necessary|essential|possible|impossible|difficult|hard|easy|useful|vital|crucial|dangerous|safe|rare|common";
const AMBIGUOUS_FOR_OF_ADJ = "good";
const OF_ADJ = "kind|nice|foolish|wise|stupid|rude|clever|careless|brave|polite|silly|cruel|selfish|thoughtful";
const PREP = "by|of|for|from|without|about|instead of|with";

export function detectNonfiniteCh09(text: string): NonfiniteHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: NonfiniteHit[] = [];
  detectProgressivePassive(source, hits);
  detectPrepGerund(source, hits);
  detectParallelGerund(source, hits);
  detectForOf(source, hits);
  detectBareForTo(source, hits);
  detectObjectTo(source, hits);
  detectBareParallel(source, hits);
  detectPerfectInfinitive(source, hits);
  detectPassiveInfinitive(source, hits);
  detectGerundPassive(source, hits);
  detectHavingObject(source, hits);
  detectNonfiniteSubject(source, hits);
  detectNearNounAgreement(source, hits);
  detectMeaningContrast(source, hits);
  return dedupe(
    suppressSecondarySameAxis(
      detectInfinitiveCh06(source),
      suppressSecondaryObjectComplement(detectSentenceCh01(source), hits),
      "LOGICAL_SUBJECT_FOR_OF"
    )
  );
}

export function nonfiniteLocalDistractor(code: string, sourceSpan: string): string | null {
  const lower = sourceSpan.trim().toLowerCase();
  if (code === "INFINITIVE_LOGICAL_SUBJECT") {
    if (lower === "for") return "of";
    if (lower === "of") return "for";
  }
  if (code === "AGREEMENT_GERUND_SUBJECT" || code === "AGREEMENT_PREPOSITIONAL_MODIFIER") {
    if (lower === "is") return "are";
    if (lower === "are") return "is";
    if (lower === "has") return "have";
    if (lower === "have") return "has";
    if (lower === "was") return "were";
    if (lower === "were") return "was";
  }
  if (code === "INFINITIVE_PERFECT" && /^to have (?!been\b)/i.test(sourceSpan)) {
    return sourceSpan.replace(/\bto have\b/i, "to have been");
  }
  if (code === "GERUND_PERFECT" && /^having (?!been\b)/i.test(sourceSpan)) {
    return sourceSpan.replace(/\bhaving\b/i, "having been");
  }
  if (code === "INFINITIVE_PASSIVE" && /^be wiped$/i.test(sourceSpan)) return "wipe";
  if (code === "INFINITIVE_PASSIVE") {
    const verb = sourceSpan.replace(/^to be\s+/i, "");
    const active = activeOf(verb);
    return active ? `to ${active}` : null;
  }
  if (code === "GERUND_PASSIVE" && /^having been\b/i.test(sourceSpan)) {
    return sourceSpan.replace(/\bhaving been\b/i, "Having");
  }
  if (code === "GERUND_PASSIVE" && /^being\b/i.test(sourceSpan)) {
    const verb = sourceSpan.replace(/^being\s+/i, "");
    const active = activeOf(verb);
    return active ? `${active.replace(/e$/, "")}ing` : null;
  }
  if (MEANING_CODES.has(code)) return flipNonfiniteComplement(sourceSpan);
  return null;
}

export function rejectNonfiniteChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_INFINITIVE_MARKER" | "MECHANICAL_MODAL_FORM" | "BOTH_GRAMMATICAL" | "NON_MINIMAL_SPAN" | "AMBIGUOUS_MEANING_CONTRAST" | "MEANING_ONLY_CONTRAST" | null {
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (MEANING_CODES.has(input.pointCode)) {
    if (!isLockedMeaningPair(input.correct, input.wrong)) return "MECHANICAL_INFINITIVE_MARKER";
    if (!meaningLock(input.sentence, input.pointCode)) return "AMBIGUOUS_MEANING_CONTRAST";
    return null;
  }
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (pair === "tries|try" || pair === "try|tries") return "MECHANICAL_MODAL_FORM";
  if (
    input.pointCode !== "GERUND_PREPOSITION_OBJECT" &&
    (pair === "move|moving" || pair === "have|having") &&
    /\b(?:instead of|with)\b/i.test(input.sentence)
  ) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (pair === "him|his" || pair === "her|hers") return "BOTH_GRAMMATICAL";
  if (pair === "for|of" && /\bgood\b/i.test(input.sentence)) return "BOTH_GRAMMATICAL";
  if (input.correct.trim().split(/\s+/).length > 5) return "NON_MINIMAL_SPAN";
  return null;
}

function detectProgressivePassive(text: string, hits: NonfiniteHit[]) {
  for (const match of text.matchAll(/\b(?:am|is|are|was|were)\s+being\s+([A-Za-z]+)\b/gi)) {
    push(hits, "VOICE_PROGRESSIVE_PASSIVE", "PROGRESSIVE_PASSIVE", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectPrepGerund(text: string, hits: NonfiniteHit[]) {
  const re = new RegExp(`\\b(?:${PREP})\\s+([A-Za-z]+ing)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    push(hits, "GERUND_PREP_OBJECT_ANALYSIS", "PREP_GERUND_ANALYSIS", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectParallelGerund(text: string, hits: NonfiniteHit[]) {
  for (const match of text.matchAll(/\b([A-Za-z]+ing)\s+and\s+([A-Za-z]+ing)\b/gi)) {
    const before = text.slice(Math.max(0, (match.index ?? 0) - 16), match.index ?? 0);
    if (/\b(?:the|a|an)\s+$/i.test(before)) continue;
    const span = `${match[1]} and ${match[2]}`;
    const code = /\b(?:enjoy|enjoyed|spend|spent|avoid|avoided)\s+$/i.test(before) ? "GERUND_VERB_OBJECT" : "GERUND_SUBJECT_ANALYSIS";
    push(hits, code, "GERUND_PARALLEL", span, match.index ?? 0, false);
  }
}

function detectForOf(text: string, hits: NonfiniteHit[]) {
  const ambiguous = new RegExp(
    `\\bIt\\s+(?:is|was)\\s+(${AMBIGUOUS_FOR_OF_ADJ})\\s+(for|of)\\s+[A-Za-z]+\\s+to\\s+[a-z]+\\b`,
    "gi"
  );
  for (const match of text.matchAll(ambiguous)) {
    push(hits, "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", "BOTH_FOR_OF", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
  }
  const re = new RegExp(`\\bIt\\s+(?:is|was)\\s+(${FOR_ADJ}|${OF_ADJ})\\s+(for|of)\\s+[A-Za-z]+\\s+to\\s+[a-z]+\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const adj = (match[1] ?? "").toLowerCase();
    const marker = match[2] ?? "";
    const wantsFor = new RegExp(`^(?:${FOR_ADJ})$`, "i").test(adj);
    const wantsOf = new RegExp(`^(?:${OF_ADJ})$`, "i").test(adj);
    if (wantsFor && marker.toLowerCase() !== "for") continue;
    if (wantsOf && marker.toLowerCase() !== "of") continue;
    push(hits, "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", wantsOf ? "OF_TO" : "FOR_TO", marker, indexOfSpan(text, marker, match.index ?? 0), false);
  }
}

function detectBareForTo(text: string, hits: NonfiniteHit[]) {
  for (const match of text.matchAll(/\bfor\s+(?:the|a|an|our|their|his|her)?\s*(?:[A-Za-z]+\s+){1,3}to\s+[a-z]+\b/gi)) {
    if (/\bIt\s+is\s+/i.test(text.slice(Math.max(0, (match.index ?? 0) - 24), match.index ?? 0))) continue;
    push(hits, "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", "FOR_TO_ANALYSIS", "for", match.index ?? 0, false);
  }
}

function detectObjectTo(text: string, hits: NonfiniteHit[]) {
  const re = /\b(?:allow|allows|allowed|enable|enables|enabled|ask|asks|asked|encourage|encourages|encouraged)\s+(?:ourselves|themselves|himself|herself|him|her|them|us|me|you|the\s+[A-Za-z]+)\s+to\s+[a-z]+\b/gi;
  for (const match of text.matchAll(re)) {
    const at = match[0].toLowerCase().lastIndexOf(" to ");
    push(hits, "OBJECT_COMPLEMENT_TO_V_ANALYSIS", "OBJECT_TO_V_ANALYSIS", "to", (match.index ?? 0) + at + 1, false);
  }
}

function detectBareParallel(text: string, hits: NonfiniteHit[]) {
  const re = /\b(?:help|helps|helped|let|lets|make|makes)\s+(?:them|us|him|her|me|you)\s+[a-z]+(?:,\s*[a-z]+)*(?:,?\s+and\s+[a-z]+)?\b/gi;
  for (const match of text.matchAll(re)) {
    const verb = match[0].match(/\s([a-z]+)$/i)?.[1] ?? "";
    push(hits, "OBJECT_COMPLEMENT_BARE_ANALYSIS", "BARE_PARALLEL_ANALYSIS", verb, match[0].lastIndexOf(verb) + (match.index ?? 0), false);
  }
}

function detectPerfectInfinitive(text: string, hits: NonfiniteHit[]) {
  const re = /\b(to have (?!been\b)[a-z]+)\s+(?:the|a|an|his|her|their)\s+[A-Za-z]+\b/gi;
  for (const match of text.matchAll(re)) {
    const span = match[1] ?? "";
    if (!/\b(?:seems|seemed|claims|claimed|appears|appeared|is said|was said)\b/i.test(text.slice(Math.max(0, (match.index ?? 0) - 32), match.index ?? 0))) {
      if (!/\bto have\b/i.test(span)) continue;
    }
    push(hits, "INFINITIVE_PERFECT", "TO_HAVE_PP", span, match.index ?? 0, true);
  }
}

function detectPassiveInfinitive(text: string, hits: NonfiniteHit[]) {
  const re = /\b(?:is|was|are|were)\s+(?:expected|said|believed|reported|known|supposed|thought)\s+(to be [a-z]+)\b/gi;
  for (const match of text.matchAll(re)) {
    const span = match[1] ?? "";
    if (/\bbeing\b/i.test(text.slice(Math.max(0, (match.index ?? 0) - 8), match.index ?? 0))) continue;
    push(hits, "INFINITIVE_PASSIVE", "TO_BE_PP", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectGerundPassive(text: string, hits: NonfiniteHit[]) {
  for (const match of text.matchAll(/\b(Having been [a-z]+)\s+about\s+(?:the\s+|a\s+)?[A-Za-z]+,/g)) {
    const after = text.slice((match.index ?? 0) + match[0].length);
    if (!/^\s*(?:he|she|they|we|i)\b/i.test(after)) continue;
    push(hits, "GERUND_PASSIVE", "HAVING_BEEN", match[1] ?? "", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\b(?:of|dislikes|disliked|hates|hated|avoids|avoided)\s+(being [a-z]+)\b/gi)) {
    if (/\b(?:am|is|are|was|were)\s+being\b/i.test(text)) continue;
    const span = match[1] ?? "";
    push(hits, "GERUND_PASSIVE", "BEING_PP", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectHavingObject(text: string, hits: NonfiniteHit[]) {
  const re = /\b(having (?!been\b)[a-z]+)\s+(?:the|a|an|his|her)\s+[A-Za-z]+\b/gi;
  for (const match of text.matchAll(re)) {
    if (/^\s*having\b/i.test(text.slice(match.index ?? 0)) && text.includes(",")) continue;
    push(hits, "GERUND_PERFECT", "HAVING_PP", match[1] ?? "", match.index ?? 0, true);
  }
}

function detectNonfiniteSubject(text: string, hits: NonfiniteHit[]) {
  const re = /\b([A-Za-z]+ing|To\s+[a-z]+)\b([^.]{8,90}?)\b(is|are|was|were|has|have|may|might|can|will)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    const middle = match[2] ?? "";
    const verb = match[3] ?? "";
    if (middle.includes(",")) continue;
    if (/\b(?:am|is|are|was|were)\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 6), match.index ?? 0))) continue;
    const long = middle.trim().split(/\s+/).length >= 4;
    if (/^(?:is|are|was|were|has|have)$/i.test(verb) && long) {
      push(hits, "GERUND_SUBJECT_AGREEMENT_ANALYSIS", "NONFINITE_SUBJECT_ANALYSIS", verb, indexOfSpan(text, verb, (match.index ?? 0) + head.length), false);
      continue;
    }
    push(hits, "GERUND_SUBJECT_ANALYSIS", "GERUND_PHRASE_ANALYSIS", head, match.index ?? 0, false);
  }
}

function detectNearNounAgreement(text: string, hits: NonfiniteHit[]) {
  const re = /\bThe\s+(?:[a-z]+\s+){0,2}([A-Za-z]+)\s+of\s+[^.]{3,48}?\s+(has|is|was)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    if (/s$/i.test(head) || /^(news|series)$/i.test(head)) continue;
    const verb = match[2] ?? "";
    push(hits, "PREP_MODIFIER_AGREEMENT_ANALYSIS", "NEAR_NOUN_ANALYSIS", verb, indexOfSpan(text, verb, match.index ?? 0), false);
  }
}

export function activeLemmaOfParticiple(verb: string): string | null {
  return activeOf(verb);
}

function activeOf(verb: string): string | null {
  const map: Record<string, string> = {
    completed: "complete",
    finished: "finish",
    written: "write",
    built: "build",
    ignored: "ignore",
    warned: "warn",
    told: "tell",
    forgotten: "forget",
    chosen: "choose",
    broken: "break",
    done: "do",
    made: "make",
    seen: "see",
    taken: "take",
    wiped: "wipe",
  };
  const lower = verb.trim().toLowerCase();
  if (map[lower]) return map[lower];
  if (lower.endsWith("ed") && lower.length > 4) return lower.replace(/ed$/, "");
  return null;
}

const MEANING_CODES = new Set([
  "NONFINITE_MEMORY_COMPLEMENT",
  "NONFINITE_STOP_COMPLEMENT",
  "NONFINITE_TRY_COMPLEMENT",
  "NONFINITE_MEAN_COMPLEMENT",
  "NONFINITE_GO_ON_COMPLEMENT",
]);

function flipNonfiniteComplement(span: string): string | null {
  const trimmed = span.trim();
  const to = /^to\s+([a-z]+)$/i.exec(trimmed);
  if (to) return ingOf(to[1] ?? "");
  if (/^[a-z]+ing$/i.test(trimmed)) {
    const base = baseOfIng(trimmed);
    return base ? `to ${base}` : null;
  }
  return null;
}

function ingOf(base: string): string {
  const lower = base.toLowerCase();
  if (lower.endsWith("e") && !lower.endsWith("ee")) return `${lower.slice(0, -1)}ing`;
  return `${lower}ing`;
}

function baseOfIng(ing: string): string | null {
  const map: Record<string, string> = {
    locking: "lock",
    calling: "call",
    meeting: "meet",
    seeing: "see",
    saying: "say",
    smoking: "smoke",
    resting: "rest",
    opening: "open",
    turning: "turn",
    waiting: "wait",
    talking: "talk",
    explaining: "explain",
    informing: "inform",
    submitting: "submit",
  };
  return map[ing.toLowerCase()] ?? null;
}

function isLockedMeaningPair(correct: string, wrong: string): boolean {
  const left = correct.trim().toLowerCase();
  const right = wrong.trim().toLowerCase();
  const flipped = flipNonfiniteComplement(correct);
  return Boolean(flipped && flipped.toLowerCase() === right);
}

function sliceAt(text: string, span: string, from = 0): string {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), from);
  return at < 0 ? span : text.slice(at, at + span.length);
}

function meaningLock(text: string, code: string): { contextLockType: string; evidenceSpan: string; intendedMeaning: string; rejectedAlternativeMeaning: string } | null {
  if (code === "NONFINITE_MEMORY_COMPLEMENT") {
    if (/\b(?:please\s+)?(?:remember|forget|forgot)\s+to\s+[a-z]+\b/i.test(text) && /\b(?:before|by|tomorrow|tonight|later|don't forget|do not forget)\b/i.test(text)) {
      const evidence = text.match(/\b(?:before|by|tomorrow|tonight|later)\b/i)?.[0] ?? "remember to";
      return { contextLockType: "FUTURE_DUTY", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "앞으로 해야 할 일", rejectedAlternativeMeaning: "이미 경험한 일" };
    }
    if (/\bregret(?:s|ted)?\s+to\s+(?:inform|say|tell|announce)\b/i.test(text)) {
      return { contextLockType: "FUTURE_DUTY", evidenceSpan: sliceAt(text, "to inform") || sliceAt(text, "regret"), intendedMeaning: "앞으로 전해야 할 일", rejectedAlternativeMeaning: "이미 한 일을 후회" };
    }
    if (/\b(?:still\s+remember|never\s+forget|will\s+never\s+forget)\s+[a-z]+ing\b/i.test(text)) {
      const evidence = text.match(/\b(?:yesterday|last\s+\w+|ago|once|in\s+\d{4}|never\s+forget|still\s+remember)\b/i)?.[0] ?? "never forget";
      return { contextLockType: "PAST_EXPERIENCE", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "이미 경험한 일", rejectedAlternativeMeaning: "앞으로 해야 할 일" };
    }
    if (/\bregret(?:s|ted)?\s+[a-z]+ing\b/i.test(text) && /\b(?:yesterday|last|ago|having)\b/i.test(text)) {
      const evidence = text.match(/\b(?:yesterday|last\s+\w+|ago)\b/i)?.[0] ?? "regret";
      return { contextLockType: "PAST_EXPERIENCE", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "이미 한 일을 후회", rejectedAlternativeMeaning: "앞으로 전해야 할 일" };
    }
  }
  if (code === "NONFINITE_STOP_COMPLEMENT") {
    if (/\bstop(?:s|ped)?\s+[a-z]+ing\b/i.test(text) && /\b(?:last\s+\w+|ago|no longer|for good|completely)\b/i.test(text)) {
      const evidence = text.match(/\b(?:last\s+\w+|ago|no longer|for good|completely)\b/i)?.[0] ?? "stopped";
      return { contextLockType: "CEASE_ACTION", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "하던 행동의 중단", rejectedAlternativeMeaning: "다른 행동을 하기 위한 멈춤" };
    }
    if (/\bstop(?:s|ped)?\s+to\s+[a-z]+\b/i.test(text) && /\b(?:because|so that|in order|tired|ask)\b/i.test(text)) {
      const evidence = text.match(/\b(?:because|so that|in order|tired|ask)\b/i)?.[0] ?? "to";
      return { contextLockType: "PAUSE_FOR_PURPOSE", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "다른 행동을 하기 위한 멈춤", rejectedAlternativeMeaning: "하던 행동의 중단" };
    }
  }
  if (code === "NONFINITE_TRY_COMPLEMENT") {
    if (/\btr(?:y|ied|ies)\s+to\s+[a-z]+\b/i.test(text) && /\b(?:but|failed|could not|couldn't|unable|in vain|stuck)\b/i.test(text)) {
      const evidence = text.match(/\b(?:but|failed|could not|couldn't|unable|in vain|stuck)\b/i)?.[0] ?? "tried to";
      return { contextLockType: "EFFORT_UNCERTAIN", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "성공 여부가 불확실한 시도", rejectedAlternativeMeaning: "시험 삼아 해보는 행동" };
    }
    if (/\btry\s+[a-z]+ing\b/i.test(text) && /\b(?:if|instead|the other way|another way|see if)\b/i.test(text)) {
      const evidence = text.match(/\b(?:if|instead|the other way|another way|see if)\b/i)?.[0] ?? "try";
      return { contextLockType: "EXPERIMENT", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "시험 삼아 해보는 행동", rejectedAlternativeMeaning: "성공 여부가 불확실한 시도" };
    }
  }
  if (code === "NONFINITE_MEAN_COMPLEMENT") {
    if (/\bmeant\s+to\s+[a-z]+\b/i.test(text) && /\b(?:but|forgot|intended|on purpose)\b/i.test(text)) {
      const evidence = text.match(/\b(?:but|forgot|intended|on purpose)\b/i)?.[0] ?? "meant to";
      return { contextLockType: "INTENTION", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "의도", rejectedAlternativeMeaning: "결과·수반" };
    }
    if (/\bmeans\s+[a-z]+ing\b/i.test(text) && /\b(?:another|result|having to|waiting)\b/i.test(text)) {
      const evidence = text.match(/\b(?:another|waiting|having to)\b/i)?.[0] ?? "means";
      return { contextLockType: "RESULT_ENTAILMENT", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "결과·수반", rejectedAlternativeMeaning: "의도" };
    }
  }
  if (code === "NONFINITE_GO_ON_COMPLEMENT") {
    if (/\b(?:went|goes|go|going)\s+on\s+to\s+[a-z]+\b/i.test(text) && /\b(?:next|then|after|chapter|stage)\b/i.test(text)) {
      const evidence = text.match(/\b(?:next|then|after(?:\s+the)?|chapter|stage)\b/i)?.[0] ?? "on to";
      return { contextLockType: "NEXT_STAGE", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "다음 단계로 전환", rejectedAlternativeMeaning: "같은 행동의 계속" };
    }
    if (/\b(?:went|goes|go|going)\s+on\s+[a-z]+ing\b/i.test(text) && /\b(?:despite|still|kept|continued)\b/i.test(text)) {
      const evidence = text.match(/\b(?:despite|still|kept|continued)\b/i)?.[0] ?? "on";
      return { contextLockType: "CONTINUE_SAME", evidenceSpan: sliceAt(text, evidence), intendedMeaning: "같은 행동의 계속", rejectedAlternativeMeaning: "다음 단계로 전환" };
    }
  }
  return null;
}

function detectMeaningContrast(text: string, hits: NonfiniteHit[]) {
  const specs: Array<{ code: GrammarPointCode; re: RegExp }> = [
    { code: "NONFINITE_MEMORY_COMPLEMENT", re: /\b(?:remember|remembers|remembered|forget|forgets|forgot|forgotten|regret|regrets|regretted)\s+(to\s+[a-z]+|[a-z]+ing)\b/gi },
    { code: "NONFINITE_STOP_COMPLEMENT", re: /\bstop(?:s|ped)?\s+(to\s+[a-z]+|[a-z]+ing)\b/gi },
    { code: "NONFINITE_TRY_COMPLEMENT", re: /\btr(?:y|ied|ies)\s+(to\s+[a-z]+|[a-z]+ing)\b/gi },
    { code: "NONFINITE_MEAN_COMPLEMENT", re: /\b(?:mean|means|meant)\s+(to\s+[a-z]+|[a-z]+ing)\b/gi },
    { code: "NONFINITE_GO_ON_COMPLEMENT", re: /\b(?:went|goes|go|going)\s+on\s+(to\s+[a-z]+|[a-z]+ing)\b/gi },
  ];
  for (const spec of specs) {
    for (const match of text.matchAll(spec.re)) {
      const span = match[1] ?? "";
      const lock = meaningLock(text, spec.code);
      push(hits, spec.code, "CONTEXT_LOCKED", span, indexOfSpan(text, span, match.index ?? 0), Boolean(lock), lock ? undefined : "AMBIGUOUS_MEANING_CONTRAST", lock ?? undefined);
    }
  }
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: NonfiniteHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean,
  exclusionReason?: LocalRejectCode,
  lock?: { contextLockType: string; evidenceSpan: string; intendedMeaning: string; rejectedAlternativeMeaning: string }
) {
  if (!sourceSpan || at < 0) return;
  hits.push({
    code,
    subtype,
    sourceSpan,
    occurrenceIndex: at,
    questionable,
    exclusionReason,
    contextLockType: lock?.contextLockType,
    evidenceSpan: lock?.evidenceSpan,
    intendedMeaning: lock?.intendedMeaning,
    rejectedAlternativeMeaning: lock?.rejectedAlternativeMeaning,
  });
}

function dedupe(hits: NonfiniteHit[]): NonfiniteHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}|${hit.questionable}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
