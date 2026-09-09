import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type SpecialCh14Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  triggerExpression: string;
  requiredWordOrder: string;
  clauseStructure: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH14";
};

export const SPECIAL_CH14_RULES: SpecialCh14Rule[] = [
  {
    code: "PSEUDO_CLEFT_ALL",
    subtype: "ALL_HAVE_TO_DO",
    priority: "CORE",
    triggerExpression: "all (that) S have to do + be",
    requiredWordOrder: "All (that) S have to do + be + 동사원형",
    clauseStructure: "all절은 해야 할 전부 한 가지 일을 나타낸다",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["전치사구 수일치로 설명", "AGREEMENT_LONG_SUBJECT로 출제"],
    referenceChapter: "CH14",
  },
  {
    code: "EMPHATIC_DO",
    subtype: "EMPHATIC_DO",
    priority: "MANDATORY",
    triggerExpression: "의사관계 분열문에서 did + do, 또는 do/does/did + 동사원형",
    requiredWordOrder: "do/does/did 뒤에 동사원형이 온다",
    clauseStructure: "강조 do는 본동사의 원형을 요구하고 조동사 뒤 굴절과 다르다",
    allowedMinimalPairs: [["did do", "did"]],
    rejectConditions: ["조동사 뒤 try/tries", "강조 정도만 다른 I do like / I like", "의문문 did you"],
    referenceChapter: "CH14",
  },
  {
    code: "CLEFT_IT_THAT",
    subtype: "CLEFT_NOT_UNTIL",
    priority: "MANDATORY",
    triggerExpression: "It was not until ... that",
    requiredWordOrder: "강조 부분 제거 후 원래 절이 복원될 때만 강조구문",
    clauseStructure: "that절은 완전한 절이고 when/who로 바꾸면 다른 구문이 된다",
    allowedMinimalPairs: [["that", "when"]],
    rejectConditions: ["가주어 It is adj that/to", "사람 강조 that/who 둘 다 가능", "that 일부만 보고 단정"],
    referenceChapter: "CH14",
  },
  {
    code: "INVERSION_NEGATIVE",
    subtype: "FRONT_NEGATIVE",
    priority: "MANDATORY",
    triggerExpression: "never, rarely, seldom, little, hardly, scarcely, barely, no sooner, not until, under no circumstances",
    requiredWordOrder: "문두 부정어 뒤에 조동사·be가 주어보다 앞",
    clauseStructure: "도치 지점만 묶고 문장 전체를 선택지로 반복하지 않는다",
    allowedMinimalPairs: [
      ["have I", "I have"],
      ["did he", "he"],
      ["had she", "she had"],
    ],
    rejectConditions: ["문중이 never/not until", "Had/Were/Should 가정법 도치", "도치·시제·수를 동시에 변경"],
    referenceChapter: "CH14",
  },
  {
    code: "INVERSION_ONLY",
    subtype: "ONLY_FRONT",
    priority: "MANDATORY",
    triggerExpression: "only then, only after, only when, only by",
    requiredWordOrder: "only 구 뒤 주절에서 조동사가 주어보다 앞",
    clauseStructure: "only 수식 절 안이 아니라 only 뒤 주절이 도치된다",
    allowedMinimalPairs: [["did I", "I"]],
    rejectConditions: ["문중 only", "가정법 도치와 중복"],
    referenceChapter: "CH14",
  },
  {
    code: "INVERSION_PLACE_DIRECTION",
    subtype: "PLACE_DIRECTION",
    priority: "MANDATORY",
    triggerExpression: "Here, There, 장소·방향 부사구",
    requiredWordOrder: "명사 주어는 동사 뒤, 대명사 주어는 동사 앞",
    clauseStructure: "there is 존재문은 장소 도치가 아니다",
    allowedMinimalPairs: [
      ["comes the bus", "the bus comes"],
      ["he comes", "comes he"],
    ],
    rejectConditions: ["대명사 주어를 명사처럼 도치", "There is/are 존재문"],
    referenceChapter: "CH14",
  },
  {
    code: "INVERSION_COMPLEMENT",
    subtype: "COMPLEMENT_FRONT",
    priority: "MANDATORY",
    triggerExpression: "문두 보어 + be",
    requiredWordOrder: "보어 뒤에 be, 그 뒤에 주어",
    clauseStructure: "보어 도치는 be 위치만 바꾼다",
    allowedMinimalPairs: [["was the noise", "the noise was"]],
    rejectConditions: ["장소 도치와 혼동", "문장 전체 반복"],
    referenceChapter: "CH14",
  },
  {
    code: "INVERSION_SO_NEITHER",
    subtype: "SO_NEITHER",
    priority: "MANDATORY",
    triggerExpression: "So, Neither, Nor",
    requiredWordOrder: "so/neither/nor + 조동사 + 주어",
    clauseStructure: "긍정 대용은 so, 부정 대용은 neither/nor",
    allowedMinimalPairs: [
      ["do I", "I do"],
      ["can she", "she can"],
    ],
    rejectConditions: ["so that 목적", "neither...nor 상관접속사와 같은 span", "문장 전체 반복"],
    referenceChapter: "CH14",
  },
  {
    code: "ELLIPSIS_COMMON_ELEMENT",
    subtype: "IF_SO_NOT",
    priority: "CORE",
    triggerExpression: "if so, if not, if any, if ever, to 뒤 동사구 생략",
    requiredWordOrder: "생략된 공통 요소는 앞 절에서 복원된다",
    clauseStructure: "생략 전후가 모두 자연스러우면 문항으로 만들지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["문체 차이만", "to 뒤 동사 생략 여부만"],
    referenceChapter: "CH14",
  },
  {
    code: "ELLIPSIS_SUBSTITUTION",
    subtype: "PRO_VERB",
    priority: "CORE",
    triggerExpression: "비교절의 do/does/did",
    requiredWordOrder: "than/as 뒤에서 본동사를 do로 받는다",
    clauseStructure: "대동사는 반복 동사를 대신하고 시제를 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["반복 동사와 대동사가 둘 다 자연스러움", "시제와 수를 같이 변경"],
    referenceChapter: "CH14",
  },
  {
    code: "APPOSITIVE_THAT",
    subtype: "APPOSITIVE_THAT",
    priority: "MANDATORY",
    triggerExpression: "the fact/news/idea/belief that",
    requiredWordOrder: "동격 that 뒤는 완전한 절",
    clauseStructure: "앞 명사의 내용을 설명하며 관계사처럼 성분이 빠지지 않는다",
    allowedMinimalPairs: [
      ["that", "what"],
      ["that", "which"],
    ],
    rejectConditions: ["관계사 that/which 둘 다 가능", "불완전 관계절", "같은 span을 관계사로 중복"],
    referenceChapter: "CH14",
  },
  {
    code: "INSERTION",
    subtype: "INSERTION_AGREEMENT",
    priority: "MANDATORY",
    triggerExpression: "along with, together with, as well as",
    requiredWordOrder: "삽입구는 주어와 동사 사이에 와도 수를 바꾸지 않는다",
    clauseStructure: "실제 주어는 삽입구 앞의 핵어다",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["삽입구 없는 가까운 명사 수일치", "도치와 수를 동시에 변경"],
    referenceChapter: "CH14",
  },
  {
    code: "PARTIAL_NEGATION",
    subtype: "NOT_ALL_EVERY",
    priority: "CORE",
    triggerExpression: "not all, not every, not both",
    requiredWordOrder: "not이 all/every/both 앞에 오면 부분부정",
    clauseStructure: "부분부정과 전체부정의 의미만 다른 선택지는 내지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["not all / none 의미만", "few / a few"],
    referenceChapter: "CH14",
  },
  {
    code: "NEGATION_SCOPE",
    subtype: "NOT_A_BUT_B",
    priority: "MANDATORY",
    triggerExpression: "not A but B",
    requiredWordOrder: "not A 뒤에 but B",
    clauseStructure: "but이 A와 B를 대조로 잇는다",
    allowedMinimalPairs: [["but", "and"]],
    rejectConditions: ["not only...but also와 혼동", "의미만 다른 부정 이동"],
    referenceChapter: "CH14",
  },
  {
    code: "DOUBLE_NEGATION",
    subtype: "DOUBLE_NEGATIVE",
    priority: "CORE",
    triggerExpression: "not without, never fail to, cannot help but",
    requiredWordOrder: "부정어가 두 번 쓰여 긍정이 된다",
    clauseStructure: "의미 해석이 둘로 갈리면 출제하지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["의미만 다른 이중부정", "부정 이동 I don't think"],
    referenceChapter: "CH14",
  },
];

export type SpecialHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const FRONT_NEG =
  "Never|Rarely|Seldom|Little|Hardly|Scarcely|Barely|Under no circumstances|No sooner|Not until|Not only";

export function detectSpecialCh14(text: string): SpecialHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: SpecialHit[] = [];
  if (isConditionalInversion(source)) return hits;
  detectEmphaticDo(source, hits);
  detectCleft(source, hits);
  detectNegativeInversion(source, hits);
  detectOnlyInversion(source, hits);
  detectPlaceInversion(source, hits);
  detectComplementInversion(source, hits);
  detectSoNeither(source, hits);
  detectEllipsis(source, hits);
  detectAppositive(source, hits);
  detectInsertion(source, hits);
  detectNegation(source, hits);
  return dedupe(hits);
}

export function specialLocalDistractor(code: string, sourceSpan: string, subtype = ""): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (code === "PSEUDO_CLEFT_ALL") {
    if (lower === "is") return "are";
    if (lower === "are") return "is";
    if (lower === "was") return "were";
    if (lower === "were") return "was";
  }
  if (code === "EMPHATIC_DO" && lower === "did do") return "did";
  if (code === "CLEFT_IT_THAT" && lower === "that") return "when";
  if (code === "INVERSION_NEGATIVE" || code === "INVERSION_ONLY" || code === "INVERSION_SO_NEITHER") {
    return flipAuxSubject(span);
  }
  if (code === "INVERSION_PLACE_DIRECTION" || code === "INVERSION_COMPLEMENT") {
    return flipPhrase(span);
  }
  if (code === "APPOSITIVE_THAT" && lower === "that") return subtype === "APPOSITIVE_NEWS" ? "which" : "what";
  if (code === "INSERTION") {
    if (lower === "is") return "are";
    if (lower === "are") return "is";
    if (lower === "has") return "have";
    if (lower === "have") return "has";
  }
  if (code === "NEGATION_SCOPE" && lower === "but") return "and";
  return null;
}

export function rejectSpecialChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MECHANICAL_MODAL_FORM" | null {
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (input.correct.trim().split(/\s+/).length > 4 || input.wrong.trim().split(/\s+/).length > 5) {
    return "NON_MINIMAL_SPAN";
  }
  if (pair === "that|who" && input.pointCode === "CLEFT_IT_THAT") return "BOTH_GRAMMATICAL";
  if (pair === "tries|try") return "MECHANICAL_MODAL_FORM";
  if (pair === "few|a few" || pair === "a little|little" || pair === "none|not all") return "MEANING_ONLY_CONTRAST";
  return null;
}

function detectEmphaticDo(text: string, hits: SpecialHit[]) {
  for (const match of text.matchAll(/\b(did do)\s+was\b/gi)) {
    push(hits, "EMPHATIC_DO", "EMPHATIC_DO", match[1] ?? "", match.index ?? 0, true);
  }
}

function detectCleft(text: string, hits: SpecialHit[]) {
  if (/\bIt\s+is\s+(?:important|necessary|clear|true|possible|likely|obvious)\s+(?:that|to)\b/i.test(text)) {
    push(hits, "DUMMY_IT_SUBJECT", "DUMMY_IT", "It", text.search(/\bIt\b/), false);
    return;
  }
  for (const match of text.matchAll(/\bIt\s+was\s+not\s+until\s+[A-Za-z]+\s+(that)\s+[A-Za-z]+\s+[a-z]+/gi)) {
    push(hits, "CLEFT_IT_THAT", "CLEFT_NOT_UNTIL", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bIt\s+was\s+[A-Z][a-z]+\s+(that|who)\s+/g)) {
    push(hits, "CLEFT_IT_THAT", "CLEFT_PERSON", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectNegativeInversion(text: string, hits: SpecialHit[]) {
  const re = new RegExp(`^(?:${FRONT_NEG})\\b[\\s\\S]{0,40}?\\b((?:have|has|had|do|does|did|can|could|will|would|is|are|was|were)\\s+(?:I|you|he|she|we|they)(?:\\s+[a-z]+)?)\\b`, "i");
  const match = re.exec(text.trim());
  if (!match) return;
  if (/^Had\b|^Were\b|^Should\b/.test(text.trim())) return;
  const span = match[1] ?? "";
  const code = /^Not until\b/i.test(text.trim()) ? "INVERSION_NEGATIVE" : "INVERSION_NEGATIVE";
  push(hits, code, /^No sooner\b/i.test(text.trim()) ? "NO_SOONER" : "FRONT_NEGATIVE", span, text.toLowerCase().indexOf(span.toLowerCase()), true);
}

function detectOnlyInversion(text: string, hits: SpecialHit[]) {
  const match = /^(?:Only then|Only after|Only when|Only by)\b[\s\S]{0,48}?\b((?:did|do|does|had|have|has|can|could|will|would)\s+(?:I|you|he|she|we|they)(?:\s+[a-z]+)?)\b/i.exec(text.trim());
  if (!match) return;
  push(hits, "INVERSION_ONLY", "ONLY_FRONT", match[1] ?? "", text.toLowerCase().indexOf(match[1]!.toLowerCase()), true);
}

function detectPlaceInversion(text: string, hits: SpecialHit[]) {
  const noun = /^(?:Here|There)\s+(comes|goes)\s+(the\s+[A-Za-z]+)\b/i.exec(text.trim());
  if (noun) {
    const span = `${noun[1]} ${noun[2]}`;
    push(hits, "INVERSION_PLACE_DIRECTION", "NOUN_SUBJECT", span, text.toLowerCase().indexOf(span.toLowerCase()), true);
  }
  const pronoun = /^(?:Here|There)\s+(he|she|it|they|we|I|you)\s+(comes|goes|is|are)\b/i.exec(text.trim());
  if (pronoun) {
    const span = `${pronoun[1]} ${pronoun[2]}`;
    push(hits, "INVERSION_PLACE_DIRECTION", "PRONOUN_SUBJECT", span, text.toLowerCase().indexOf(span.toLowerCase()), true);
  }
  const prep = /\b(?:On|In|Under|Behind)\s+the\s+[A-Za-z]+\s+(stands|lies|sits)\s+(the\s+[A-Za-z]+)\b/i.exec(text);
  if (prep) {
    const span = `${prep[1]} ${prep[2]}`;
    push(hits, "INVERSION_PLACE_DIRECTION", "PLACE_PHRASE", span, text.toLowerCase().indexOf(span.toLowerCase()), true);
  }
}

function detectComplementInversion(text: string, hits: SpecialHit[]) {
  const match = /^(?:So\s+[a-z]+)\s+(was|were|is|are)\s+(the\s+[A-Za-z]+)\b/i.exec(text.trim());
  if (!match) return;
  const span = `${match[1]} ${match[2]}`;
  push(hits, "INVERSION_COMPLEMENT", "COMPLEMENT_FRONT", span, text.toLowerCase().indexOf(span.toLowerCase()), true);
}

function detectSoNeither(text: string, hits: SpecialHit[]) {
  if (/\bneither\b[\s\S]{0,24}\bnor\b/i.test(text) && !/^(?:Neither|Nor)\b/.test(text.trim())) return;
  const match = /^(?:So|Neither|Nor)\s+((?:do|does|did|can|could|will|would|have|has|had|is|are|am)\s+(?:I|you|he|she|we|they|he))\b/i.exec(text.trim());
  if (!match) return;
  if (/\bso\s+that\b/i.test(text)) return;
  push(hits, "INVERSION_SO_NEITHER", "SO_NEITHER", match[1] ?? "", text.toLowerCase().indexOf(match[1]!.toLowerCase()), true);
}

function detectEllipsis(text: string, hits: SpecialHit[]) {
  for (const match of text.matchAll(/\bif\s+(so|not|any|ever)\b/gi)) {
    push(hits, "ELLIPSIS_COMMON_ELEMENT", "IF_SO_NOT", `if ${match[1]}`, match.index ?? 0, false);
  }
  for (const match of text.matchAll(/\bthan\s+(?:he|she|they|we)\s+(does|do|did)\b/gi)) {
    push(hits, "ELLIPSIS_SUBSTITUTION", "PRO_VERB", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectAppositive(text: string, hits: SpecialHit[]) {
  const fact = /\b(?:fact|idea|belief|rumor)\s+(that)\s+[A-Za-z]+\s+(?:refused|won|had|was|is|left|came)\b/gi;
  for (const match of text.matchAll(fact)) {
    if (isRelativeGap(text, indexOfSpan(text, "that", match.index ?? 0))) continue;
    push(hits, "APPOSITIVE_THAT", "APPOSITIVE_THAT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const news = /\b(?:news|report|message)\s+(that)\s+[A-Za-z]+\s+(?:had|has|won|was|is)\b/gi;
  for (const match of text.matchAll(news)) {
    push(hits, "APPOSITIVE_THAT", "APPOSITIVE_NEWS", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectInsertion(text: string, hits: SpecialHit[]) {
  const re = /\b([A-Za-z]+),\s+(?:along with|together with|as well as)\s+[^,]{3,40},\s+(is|are|has|have)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    const verb = match[2] ?? "";
    const headPlural = /s$/i.test(head) && !/^(news|brother|class)$/i.test(head);
    if (headPlural && !/^are|have$/i.test(verb)) continue;
    if (!headPlural && !/^is|has$/i.test(verb)) continue;
    push(hits, "INSERTION", "INSERTION_AGREEMENT", verb, indexOfSpan(text, verb, match.index ?? 0), true);
  }
}

function detectNegation(text: string, hits: SpecialHit[]) {
  for (const match of text.matchAll(/\bnot\s+(all|every|both)\b/gi)) {
    push(hits, "PARTIAL_NEGATION", "NOT_ALL_EVERY", `not ${match[1]}`, match.index ?? 0, false);
  }
  for (const match of text.matchAll(/\bnot\s+[A-Za-z]+\s+(but)\s+[A-Za-z]+\b/gi)) {
    if (/\bnot\s+only\b/i.test(match[0])) continue;
    push(hits, "NEGATION_SCOPE", "NOT_A_BUT_B", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\b(?:not\s+without|never\s+fail\s+to|cannot\s+help\s+but)\b/gi)) {
    push(hits, "DOUBLE_NEGATION", "DOUBLE_NEGATIVE", match[0], match.index ?? 0, false);
  }
}

function isConditionalInversion(text: string): boolean {
  return /^(?:Had|Were|Should)\s+(?:I|you|he|she|we|they|it)\b/.test(text.trim());
}

function isRelativeGap(text: string, thatAt: number): boolean {
  const after = text.slice(thatAt + 4, thatAt + 32);
  return /^\s*(?:I|you|he|she|we|they)\s+(?:read|bought|saw|met|know)\b/i.test(after);
}

function flipAuxSubject(span: string): string | null {
  const parts = span.trim().split(/\s+/);
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  if (parts.length === 3) {
    const [aux, subject, verb] = parts;
    if (/^did$/i.test(aux)) return `${subject} ${pastOf(verb)}`;
    return `${subject} ${aux} ${verb}`;
  }
  return null;
}

function pastOf(verb: string): string {
  const map: Record<string, string> = { return: "returned", understand: "understood", arrive: "arrived", see: "saw", leave: "left" };
  return map[verb.toLowerCase()] ?? `${verb}ed`;
}

function flipPhrase(span: string): string | null {
  const lower = span.trim().toLowerCase();
  if (lower === "comes the bus") return "the bus comes";
  if (lower === "he comes") return "comes he";
  if (lower === "goes the train") return "the train goes";
  const so = /^was the\s+/i.exec(span);
  if (so) return `${span.slice(so[0].length)} was`;
  const stands = /^(stands|lies|sits)\s+(the\s+\w+)$/i.exec(span);
  if (stands) return `${stands[2]} ${stands[1]}`;
  return null;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: SpecialHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: SpecialHit[]): SpecialHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}|${hit.questionable}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
