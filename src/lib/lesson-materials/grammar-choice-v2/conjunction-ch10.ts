import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ConjunctionCh10Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  clauseRequirement: string;
  detectionSignals: string[];
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH10";
  ownerChapter?: "CH10";
  analysisOnly?: boolean;
  assessmentAxis?: string;
  emitsStudentQuestion?: boolean;
  sharedForm?: string;
};

export const CONJUNCTION_CH10_RULES: ConjunctionCh10Rule[] = [
  {
    code: "PARALLEL_AND_OR_BUT",
    subtype: "COORDINATE",
    priority: "CORE",
    clauseRequirement: "등위접속사는 같은 층위의 어구·절을 연결하고, 뒤 공통 성분을 복원해도 병렬이어야 한다",
    detectionSignals: [", and/but/or/so/yet + 주어·술어", "절과 절을 잇는 so"],
    allowedMinimalPairs: [],
    rejectConditions: ["and/but", "and/or", "의미만 다른 등위접속사", "문맥상 둘 다 가능"],
    referenceChapter: "CH10",
  },
  {
    code: "CORRELATIVE_BOTH_AND",
    subtype: "BOTH_AND",
    priority: "MANDATORY",
    clauseRequirement: "both 뒤에는 and가 같은 층위의 대상을 연결해야 한다",
    detectionSignals: ["both ... and"],
    allowedMinimalPairs: [["and", "or"]],
    rejectConditions: ["both 없는 and/or", "의미만 다른 and/but"],
    referenceChapter: "CH10",
  },
  {
    code: "CORRELATIVE_EITHER_OR",
    subtype: "EITHER_OR",
    priority: "MANDATORY",
    clauseRequirement: "either 뒤에는 or가 둘 중 하나를 병렬로 연결해야 한다",
    detectionSignals: ["either ... or"],
    allowedMinimalPairs: [["or", "nor"]],
    rejectConditions: ["either 없는 or", "or/and 의미 대립"],
    referenceChapter: "CH10",
  },
  {
    code: "CORRELATIVE_NEITHER_NOR",
    subtype: "NEITHER_NOR",
    priority: "MANDATORY",
    clauseRequirement: "neither 뒤에는 nor가 부정 병렬을 이어야 한다",
    detectionSignals: ["neither ... nor"],
    allowedMinimalPairs: [["nor", "or"]],
    rejectConditions: ["neither 없는 nor", "or/nor 의미만 다른 경우"],
    referenceChapter: "CH10",
  },
  {
    code: "CORRELATIVE_NOT_ONLY_BUT_ALSO",
    subtype: "NOT_ONLY_BUT_ALSO",
    priority: "MANDATORY",
    clauseRequirement: "not only 뒤에는 but also가 같은 층위를 연결해야 한다",
    detectionSignals: ["not only ... but also"],
    allowedMinimalPairs: [["but also", "and"]],
    rejectConditions: ["not only 없는 but also", "but/and 의미 대립"],
    referenceChapter: "CH10",
  },
  {
    code: "NOUN_CLAUSE_THAT",
    subtype: "COMPLETE_THAT",
    priority: "MANDATORY",
    clauseRequirement: "that 뒤는 주어와 술어가 있는 완전한 절이어야 한다",
    detectionSignals: ["인식·전달 동사 + that", "is that", "fact/truth/idea that"],
    allowedMinimalPairs: [["that", "what"]],
    rejectConditions: ["that 생략 여부만", "관계사 that", "불완전절 what"],
    referenceChapter: "CH10",
  },
  {
    code: "NOUN_CLAUSE_WHETHER_IF",
    subtype: "WHETHER_UNIQUE",
    priority: "MANDATORY",
    clauseRequirement: "whether는 명사절을 이끌고, if로 바꿀 수 없는 자리만 출제한다",
    detectionSignals: ["전치사 + whether", "whether to V", "문두 whether"],
    allowedMinimalPairs: [["whether", "if"]],
    rejectConditions: ["목적어절 whether/if 둘 다 가능", "if를 조건절로 단정"],
    referenceChapter: "CH10",
  },
  {
    code: "NOUN_CLAUSE_DECLARATIVE_ORDER",
    subtype: "OMITTED_THAT_SV_ORDER",
    priority: "CORE",
    clauseRequirement: "be동사 뒤 진술 명사절은 생략된 that 뒤에 주어 + 동사 어순이어야 한다",
    detectionSignals: ["The point is + 주어 + 동사", "is + 완전한 진술절"],
    allowedMinimalPairs: [["we are getting", "are we getting"]],
    rejectConditions: ["의문사가 있는 간접의문문", "INDIRECT_QUESTION_ORDER로 분류"],
    referenceChapter: "CH10",
    assessmentAxis: "NOUN_CLAUSE_DECLARATIVE_ORDER",
  },
  {
    code: "INDIRECT_QUESTION_ORDER",
    subtype: "WH_NOUN_ORDER",
    priority: "MANDATORY",
    clauseRequirement: "의문사가 이끄는 명사절은 평서문 어순이어야 한다",
    detectionSignals: ["what + 명사구 + 주어 + 동사", "how + 주어 + 조동사"],
    allowedMinimalPairs: [
      ["you have", "do you have"],
      ["things should", "should things"],
    ],
    rejectConditions: ["간접의문문 절 전체", "직접의문문과 통째 대립", "관계사절 중복"],
    referenceChapter: "CH10",
  },
  {
    code: "TENSE_REPORTED_SPEECH",
    subtype: "COMMAND_TO",
    priority: "MANDATORY",
    clauseRequirement: "명령 화법은 told/ordered/asked + 대상 + to V이고, 발화 시점이 불분명하면 출제하지 않는다",
    detectionSignals: ["told/ordered/advised + 목적어 + to V"],
    allowedMinimalPairs: [["to", "that"]],
    rejectConditions: ["평서문 시제 후퇴가 불분명", "불변 진리", "접속사와 시제를 동시에 변경"],
    referenceChapter: "CH10",
  },
  {
    code: "ADVERB_CLAUSE_TIME",
    subtype: "TIME_CONJ_VS_PREP",
    priority: "MANDATORY",
    clauseRequirement: "시간 부사절은 접속사 뒤에 완전한 절이 있어야 하고, 전치사 뒤에는 명사구가 있어야 한다",
    detectionSignals: ["while/until + 주어 + 동사"],
    allowedMinimalPairs: [["while", "during"], ["until", "during"]],
    rejectConditions: ["관계부사 when/where", "before + -ing도 가능한 경우"],
    referenceChapter: "CH10",
  },
  {
    code: "ADVERB_CLAUSE_CONDITION",
    subtype: "CONDITION_IF",
    priority: "CORE",
    clauseRequirement: "조건의 if는 부사절이어야 하며, 명사절 if와 가정법 if는 조건 접속사 문항으로 내지 않는다",
    detectionSignals: ["if/unless + 절", "주절의 미래"],
    allowedMinimalPairs: [],
    rejectConditions: ["if/unless", "목적어절 if", "가정법 if", "의지 will·요청 would를 무조건 오답"],
    referenceChapter: "CH10",
  },
  {
    code: "TENSE_TIME_CONDITION_CLAUSE",
    subtype: "PRESENT_FOR_FUTURE",
    priority: "MANDATORY",
    clauseRequirement: "시간·조건 부사절이 미래 의미이면 동사는 현재시제다",
    detectionSignals: ["when/if/before/after/until/as soon as + 현재동사", "주절 will"],
    allowedMinimalPairs: [["arrives", "will arrive"], ["rains", "will rain"]],
    rejectConditions: ["의지·고집 will", "정중 요청 would", "명사절 if + will", "가정법 과거", "접속사와 시제 동시 변경"],
    referenceChapter: "CH10",
  },
  {
    code: "CONJUNCTION_PREPOSITION_CONTRAST",
    subtype: "CLAUSE_VS_PHRASE",
    priority: "MANDATORY",
    clauseRequirement: "절이면 접속사, 명사구이면 전치사 표현만 허용한다",
    detectionSignals: ["because + 주어 + 동사", "because of + 명사구", "although/even though + 절", "despite/in spite of + 명사구"],
    allowedMinimalPairs: [
      ["because", "because of"],
      ["although", "despite"],
      ["even though", "despite"],
    ],
    rejectConditions: ["뒤 구조가 절인지 명사구인지 불분명", "because/since 의미 대립"],
    referenceChapter: "CH10",
  },
  {
    code: "ADVERB_CLAUSE_PURPOSE",
    subtype: "SO_THAT",
    priority: "MANDATORY",
    clauseRequirement: "목적의 so that·in order that 뒤에는 완전한 절이 와야 한다",
    detectionSignals: ["so that + 주어 + can/may", "in order that + 절"],
    allowedMinimalPairs: [
      ["so that", "in order to"],
      ["in order that", "in order to"],
    ],
    rejectConditions: ["so that/in order that 둘 다 가능", "절 전체 반복"],
    referenceChapter: "CH10",
  },
  {
    code: "ADVERB_CLAUSE_RESULT",
    subtype: "SO_SUCH_THAT",
    priority: "MANDATORY",
    clauseRequirement: "so + 형용사·부사 또는 such + (a/an) + 명사 뒤에 that절이 와야 한다",
    detectionSignals: ["so + 형용사·부사 + that", "such a/an + 형용사 + 명사 + that"],
    allowedMinimalPairs: [["that", "to"]],
    rejectConditions: ["so/such를 의미만으로 고르는 문항", "공통 형용사 반복"],
    referenceChapter: "CH10",
  },
  {
    code: "RESULT_RELATION_TOO_TO",
    subtype: "TOO_TO_SO_THAT_CANNOT",
    priority: "CORE",
    clauseRequirement: "too ... to는 so ... that ... cannot과 결과 관계로만 대응한다. 학생 문항은 내지 않는다",
    detectionSignals: ["too + 형용사·부사 + to V", "so ... that ... cannot"],
    allowedMinimalPairs: [],
    rejectConditions: ["학생 문항 emit", "so ... that 장문 변환", "too/that 선택지"],
    referenceChapter: "CH10",
    ownerChapter: "CH10",
    analysisOnly: true,
    assessmentAxis: "RESULT_RELATION",
    emitsStudentQuestion: false,
    sharedForm: "TOO_TO_FRAME",
  },
  {
    code: "RESULT_RELATION_ENOUGH_TO",
    subtype: "ENOUGH_TO_SO_THAT_CAN",
    priority: "CORE",
    clauseRequirement: "enough to는 so ... that ... can과 결과 관계로만 대응한다. 학생 문항은 내지 않는다",
    detectionSignals: ["형용사·부사 + enough to V", "so ... that ... can"],
    allowedMinimalPairs: [],
    rejectConditions: ["학생 문항 emit", "so ... that 장문 변환", "enough/that 선택지"],
    referenceChapter: "CH10",
    ownerChapter: "CH10",
    analysisOnly: true,
    assessmentAxis: "RESULT_RELATION",
    emitsStudentQuestion: false,
    sharedForm: "ENOUGH_TO_FRAME",
  },
];

export type ConjunctionHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const PREP_BEFORE_WHETHER = "about|of|on|over|without|into|for";
const NOUN_GOVERNOR =
  "acknowledge|acknowledges|believe|believes|think|thinks|know|knows|say|says|show|shows|mean|means|prove|proves|claim|claims|suggest|suggests|admit|admits|realize|realizes|understand|understands|remember|remembers|expect|expects|notice|notices|find|finds|feel|feels|argue|argues|insist|insists|report|reports|confirm|confirms|mention|mentions";
const FINITE =
  "is|are|was|were|has|have|had|can|could|may|might|must|should|would|will|do|does|did|live|lives|make|makes|seem|seems|become|becomes|help|helps|cause|causes|lead|leads|show|shows|participate|participates|influence|influences|remain|remains";
const PRESENT =
  "arrives|arrive|rains|rain|finishes|finish|leaves|leave|comes|come|goes|go|starts|start|studies|study|is|are|has|have|does|do|lives|live|gets|get|makes|make|opens|open|closes|close|begins|begin|stops|stop";
const PLACE_TIME = "place|town|city|country|school|room|house|day|year|time|moment|night|morning|reason";

export function detectConjunctionCh10(text: string): ConjunctionHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: ConjunctionHit[] = [];
  detectIndirectOrder(source, hits);
  detectWhether(source, hits);
  detectNounThat(source, hits);
  detectCorrelatives(source, hits);
  detectClauseVsPhrase(source, hits);
  detectPurpose(source, hits);
  detectResult(source, hits);
  detectTooEnough(source, hits);
  detectTimeConditionTense(source, hits);
  detectTimeConjunction(source, hits);
  detectReportedCommand(source, hits);
  detectCoordinateAnalysis(source, hits);
  detectConditionAnalysis(source, hits);
  return dedupe(hits);
}

export function conjunctionLocalDistractor(code: string, sourceSpan: string): string | null {
  const lower = sourceSpan.trim().toLowerCase();
  if (code === "CORRELATIVE_BOTH_AND" && lower === "and") return "or";
  if (code === "CORRELATIVE_EITHER_OR" && lower === "or") return "nor";
  if (code === "CORRELATIVE_NEITHER_NOR" && lower === "nor") return "or";
  if (code === "CORRELATIVE_NOT_ONLY_BUT_ALSO" && lower === "but also") return "and";
  if (code === "NOUN_CLAUSE_THAT" && lower === "that") return "what";
  if (code === "NOUN_CLAUSE_WHETHER_IF" && lower === "whether") return "if";
  if (code === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    if (lower === "we are getting") return "are we getting";
    return invertOrder(sourceSpan);
  }
  if (code === "INDIRECT_QUESTION_ORDER") {
    if (lower === "you have") return "do you have";
    if (lower === "things should") return "should things";
    const flipped = invertOrder(sourceSpan);
    if (flipped) return flipped;
  }
  if (code === "TENSE_REPORTED_SPEECH" && lower === "to") return "that";
  if (code === "ADVERB_CLAUSE_TIME") {
    if (lower === "while" || lower === "until") return "during";
  }
  if (code === "CONJUNCTION_PREPOSITION_CONTRAST") {
    if (lower === "because") return "because of";
    if (lower === "because of") return "because";
    if (lower === "although" || lower === "even though") return "despite";
    if (lower === "despite" || lower === "in spite of") return "although";
  }
  if (code === "ADVERB_CLAUSE_PURPOSE") {
    if (lower === "so that" || lower === "in order that") return "in order to";
  }
  if (code === "ADVERB_CLAUSE_RESULT" && (lower === "that" || lower === "to")) {
    return lower === "that" ? "to" : "that";
  }
  if (code === "TENSE_TIME_CONDITION_CLAUSE") return futureOf(sourceSpan);
  return null;
}

export function rejectConjunctionChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | null {
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();
  const pair = [correct, wrong].map((s) => s.toLowerCase()).sort().join("|");
  if (correct.split(/\s+/).length > 4 || wrong.split(/\s+/).length > 6) return "NON_MINIMAL_SPAN";
  if (pair === "and|but" || pair === "and|so" || pair === "but|so" || pair === "but|yet" || pair === "or|yet") {
    return "MEANING_ONLY_CONTRAST";
  }
  if (pair === "and|or" && input.pointCode !== "CORRELATIVE_BOTH_AND") return "MEANING_ONLY_CONTRAST";
  if (pair === "if|unless") return "MEANING_ONLY_CONTRAST";
  if (pair === "if|whether" && !isUniqueWhetherSite(input.sentence)) return "BOTH_GRAMMATICAL";
  return null;
}

export function isConjunctionCh10Code(code: string): boolean {
  return CONJUNCTION_CH10_RULES.some((rule) => rule.code === code);
}

function detectIndirectOrder(text: string, hits: ConjunctionHit[]) {
  const what = /\bwhat\s+(?:[A-Za-z]+\s+){1,3}(you|we|they|he|she|I)\s+(have|has|had|want|need|do|did)\b/gi;
  for (const match of text.matchAll(what)) {
    const span = `${match[1]} ${match[2]}`;
    push(hits, "INDIRECT_QUESTION_ORDER", "WH_NOUN_ORDER", span, text.toLowerCase().indexOf(span.toLowerCase(), match.index ?? 0), true);
  }
  const how = /\bhow\s+((?:the|a|an|this|these|those)\s+)?([A-Za-z]+)\s+(should|would|could|can|may|might|must|will)\b/gi;
  for (const match of text.matchAll(how)) {
    if (text.includes("?")) continue;
    const before = text.slice(Math.max(0, (match.index ?? 0) - 16), match.index ?? 0);
    if (/\b(?:know|see|ask|wonder|tell|show|explain|remember)\s+$/i.test(before) && /\bthe way\s+$/i.test(before)) continue;
    const span = `${match[2]} ${match[3]}`;
    push(hits, "INDIRECT_QUESTION_ORDER", "WH_NOUN_ORDER", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectWhether(text: string, hits: ConjunctionHit[]) {
  const prep = new RegExp(`\\b(?:${PREP_BEFORE_WHETHER})\\s+whether\\b`, "gi");
  for (const match of text.matchAll(prep)) {
    push(hits, "NOUN_CLAUSE_WHETHER_IF", "PREP_WHETHER", "whether", indexOfSpan(text, "whether", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bwhether\s+to\s+[A-Za-z]+/gi)) {
    push(hits, "NOUN_CLAUSE_WHETHER_IF", "WHETHER_TO", "whether", indexOfSpan(text, "whether", match.index ?? 0), true);
  }
  if (/^(?:whether)\b/i.test(text.trim()) && !text.includes("?")) {
    push(hits, "NOUN_CLAUSE_WHETHER_IF", "SUBJECT_WHETHER", "Whether", text.search(/whether/i), true);
  }
}

function detectNounThat(text: string, hits: ConjunctionHit[]) {
  const governed = new RegExp(`\\b(?:${NOUN_GOVERNOR}|is|was)\\s+that\\s+`, "gi");
  for (const match of text.matchAll(governed)) {
    const at = indexOfSpan(text, "that", match.index ?? 0);
    if (!isCompleteThatClause(text, at)) continue;
    push(hits, "NOUN_CLAUSE_THAT", "COMPLETE_THAT", "that", at, true);
  }
  const fact = /\b(?:fact|idea|news|belief|claim|view|point|truth|possibility)\s+that\s+/gi;
  for (const match of text.matchAll(fact)) {
    const at = indexOfSpan(text, "that", match.index ?? 0);
    if (!isCompleteThatClause(text, at)) continue;
    push(hits, "NOUN_CLAUSE_THAT", "COMPLETE_THAT", "that", at, true);
  }
}

function detectCorrelatives(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/\bboth\b([\s\S]{1,72}?)\band\b/gi)) {
    if (/[.?]/.test(match[1] ?? "")) continue;
    push(hits, "CORRELATIVE_BOTH_AND", "BOTH_AND", "and", (match.index ?? 0) + match[0].length - 3, true);
  }
  for (const match of text.matchAll(/\beither\b([\s\S]{1,60}?)\bor\b/gi)) {
    if (/[.?]/.test(match[1] ?? "")) continue;
    push(hits, "CORRELATIVE_EITHER_OR", "EITHER_OR", "or", (match.index ?? 0) + match[0].length - 2, true);
  }
  for (const match of text.matchAll(/\bneither\b([\s\S]{1,60}?)\bnor\b/gi)) {
    if (/[.?]/.test(match[1] ?? "")) continue;
    push(hits, "CORRELATIVE_NEITHER_NOR", "NEITHER_NOR", "nor", (match.index ?? 0) + match[0].length - 3, true);
  }
  for (const match of text.matchAll(/\bnot only\b([\s\S]{1,72}?)\bbut also\b/gi)) {
    if (/[.?]/.test(match[1] ?? "")) continue;
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf("but also");
    push(hits, "CORRELATIVE_NOT_ONLY_BUT_ALSO", "NOT_ONLY_BUT_ALSO", "but also", at, true);
  }
}

function detectClauseVsPhrase(text: string, hits: ConjunctionHit[]) {
  const because = new RegExp(`\\bbecause\\s+(?!of\\b)([A-Za-z]+)\\s+(?:[a-z]+\\s+){0,2}(?:${FINITE})\\b`, "gi");
  for (const match of text.matchAll(because)) {
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "BECAUSE_CLAUSE", "because", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\bbecause of\s+(?:the|a|an|this|that|his|her|their|our|its)?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?/gi)) {
    const after = text.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 16);
    if (new RegExp(`^\\s+(?:${FINITE})\\b`, "i").test(after)) continue;
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "BECAUSE_OF_PHRASE", "because of", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\beven though\s+(?:I|you|he|she|we|they|[A-Z][a-z]+)\s+(?:[a-z]+\s+){0,2}\w+/gi)) {
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "EVEN_THOUGH_CLAUSE", "even though", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\balthough\s+(?:I|you|he|she|we|they|[A-Z][a-z]+)\s+(?:[a-z]+\s+){0,2}\w+/gi)) {
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "ALTHOUGH_CLAUSE", "although", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\bdespite\s+(?:the|a|an|this|that|his|her|their)?\s*[A-Za-z]+/gi)) {
    if (/\bdespite the fact\b/i.test(match[0])) continue;
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "DESPITE_PHRASE", "despite", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\bin spite of\s+(?:the|a|an|this|that|his|her|their)?\s*[A-Za-z]+/gi)) {
    push(hits, "CONJUNCTION_PREPOSITION_CONTRAST", "IN_SPITE_OF_PHRASE", "in spite of", match.index ?? 0, true);
  }
}

function detectPurpose(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/\bso that\s+(?:I|you|he|she|we|they|it|the|a|an)\s+(?:can|could|may|might|will|would)\b/gi)) {
    push(hits, "ADVERB_CLAUSE_PURPOSE", "SO_THAT", "so that", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\bin order that\s+(?:I|you|he|she|we|they|it|the|a|an)\s+\w+/gi)) {
    push(hits, "ADVERB_CLAUSE_PURPOSE", "IN_ORDER_THAT", "in order that", match.index ?? 0, true);
  }
}

function detectResult(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/\bso\s+(?!that\b)[A-Za-z]+\s+that\s+/gi)) {
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf("that");
    push(hits, "ADVERB_CLAUSE_RESULT", "SO_ADJ_THAT", "that", at, true);
  }
  for (const match of text.matchAll(/\bsuch\s+(?:a|an)\s+[A-Za-z]+\s+[A-Za-z]+\s+that\s+/gi)) {
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf("that");
    push(hits, "ADVERB_CLAUSE_RESULT", "SUCH_THAT", "that", at, true);
  }
}

function detectTooEnough(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/\btoo\s+[A-Za-z]+\s+to\s+[A-Za-z]+/gi)) {
    push(hits, "RESULT_RELATION_TOO_TO", "TOO_TO_SO_THAT_CANNOT", match[0], match.index ?? 0, false);
  }
  for (const match of text.matchAll(/\b[A-Za-z]+\s+enough\s+to\s+[A-Za-z]+/gi)) {
    push(hits, "RESULT_RELATION_ENOUGH_TO", "ENOUGH_TO_SO_THAT_CAN", match[0], match.index ?? 0, false);
  }
}

function detectTimeConditionTense(text: string, hits: ConjunctionHit[]) {
  if (!/\bwill\b/i.test(text)) return;
  const re = new RegExp(
    `\\b(?:when|before|after|until|once|if|unless|whenever|while|as soon as|by the time|as long as)\\s+(?:the|a|an|this|that)?\\s*([A-Za-z]+)\\s+(${PRESENT})\\b`,
    "gi"
  );
  for (const match of text.matchAll(re)) {
    const at = match.index ?? 0;
    const before = text.slice(Math.max(0, at - 24), at);
    if (/\b(?:wonder|know|ask|see|doubt|unsure|discuss|consider|depend)\b/i.test(before)) continue;
    if (/\b(?:said|told|asked)\s+that\b/i.test(before)) continue;
    const verb = match[2] ?? "";
    if (!/\bwill\b/i.test(text.slice(at))) continue;
    if (/\bwould\b/i.test(text) && !/\bwill\b/i.test(text)) continue;
    push(hits, "TENSE_TIME_CONDITION_CLAUSE", "PRESENT_FOR_FUTURE", verb, indexOfSpan(text, verb, at), true);
  }
}

function detectTimeConjunction(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/\bwhile\s+(?:I|you|he|she|we|they|it|the|a)\s+(?:[a-z]+\s+){0,2}(?:was|were|is|are|waited|wait|worked|work)\b/gi)) {
    if (new RegExp(`\\b(?:${PLACE_TIME})\\s+while\\b`, "i").test(text)) continue;
    push(hits, "ADVERB_CLAUSE_TIME", "WHILE_CLAUSE", "while", match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\buntil\s+(?:I|you|he|she|we|they|it|the|a)\s+(?:[a-z]+\s+){0,2}(?:arrives|arrive|comes|come|finishes|finish|leaves|leave|is|are)\b/gi)) {
    push(hits, "ADVERB_CLAUSE_TIME", "UNTIL_CLAUSE", "until", match.index ?? 0, true);
  }
}

function detectReportedCommand(text: string, hits: ConjunctionHit[]) {
  const re = /\b(?:told|ordered|advised|warned|asked)\s+(?:him|her|them|us|me|you|the\s+[A-Za-z]+)\s+to\s+[A-Za-z]+/gi;
  for (const match of text.matchAll(re)) {
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf(" to ") + 1;
    push(hits, "TENSE_REPORTED_SPEECH", "COMMAND_TO", "to", at, true);
  }
}

function detectCoordinateAnalysis(text: string, hits: ConjunctionHit[]) {
  for (const match of text.matchAll(/,\s*(and|but|or|so|yet)\s+(?:I|you|he|she|we|they|the|a|it)\b/gi)) {
    const word = match[1] ?? "";
    push(hits, "PARALLEL_AND_OR_BUT", "COORDINATE", word, indexOfSpan(text, word, match.index ?? 0), false);
  }
}

function detectConditionAnalysis(text: string, hits: ConjunctionHit[]) {
  if (/\b(?:wonder|know|ask|see|doubt|unsure)\s+if\b/i.test(text)) return;
  if (/\bif\s+\w+\s+(?:were|had)\b/i.test(text) && /\bwould\b/i.test(text)) return;
  const re = /\bif\s+(?:I|you|he|she|we|they|it|the)\s+\w+/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "ADVERB_CLAUSE_CONDITION", "CONDITION_IF", "if", match.index ?? 0, false);
  }
}

function isCompleteThatClause(text: string, thatAt: number): boolean {
  const after = text.slice(thatAt + 4, thatAt + 72);
  if (new RegExp(`^\\s*(?:${FINITE})\\b`, "i").test(after)) return false;
  if (/^\s*(?:I|you|he|she|we|they)\s+\w+/i.test(after) && !/\b(?:is|are|was|were|can|will|could|may)\b/i.test(after)) {
    return false;
  }
  return new RegExp(`\\b(?:${FINITE}|participate|participates|influence|influences)\\b`, "i").test(after);
}

function isUniqueWhetherSite(sentence: string): boolean {
  return (
    new RegExp(`\\b(?:${PREP_BEFORE_WHETHER})\\s+whether\\b`, "i").test(sentence) ||
    /\bwhether\s+to\s+/i.test(sentence) ||
    /^\s*whether\b/i.test(sentence)
  );
}

function invertOrder(span: string): string | null {
  const parts = span.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  return `${parts[1]} ${parts[0]}`;
}

function futureOf(verb: string): string {
  const lower = verb.trim().toLowerCase();
  if (lower === "is" || lower === "are" || lower === "am") return "will be";
  if (lower === "has") return "will have";
  if (lower === "does") return "will do";
  if (lower.endsWith("ies")) return `will ${lower.slice(0, -3)}y`;
  if (/(?:ch|sh|s|x|z)es$/.test(lower)) return `will ${lower.slice(0, -2)}`;
  if (lower.endsWith("s") && !lower.endsWith("ss")) return `will ${lower.slice(0, -1)}`;
  return `will ${lower}`;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), from);
  return at >= 0 ? at : from;
}

function push(
  hits: ConjunctionHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: ConjunctionHit[]): ConjunctionHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}|${hit.questionable}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
