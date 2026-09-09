import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type InfinitiveCh06Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  syntacticRole: string;
  modifiedTarget: string;
  missingArgument: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH06";
  ownerChapter?: "CH06";
  analysisOnly?: boolean;
  assessmentAxis?: string;
  emitsStudentQuestion?: boolean;
  sharedForm?: string;
};

export const INFINITIVE_CH06_RULES: InfinitiveCh06Rule[] = [
  {
    code: "INFINITIVE_NOUN_ROLE",
    subtype: "NOUN_TO_V",
    priority: "CORE",
    syntacticRole: "주어·목적어·보어",
    modifiedTarget: "절의 명사 자리",
    missingArgument: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["to V / V-ing", "동사별 목적어 선택은 CH07", "help O V / to V"],
    referenceChapter: "CH06",
    analysisOnly: true,
    assessmentAxis: "INFINITIVE_NOUN_FUNCTION",
    emitsStudentQuestion: false,
    sharedForm: "INFINITIVE_NOUN_FUNCTION",
  },
  {
    code: "INFINITIVE_NOUN_ROLE",
    subtype: "WH_TO",
    priority: "CORE",
    syntacticRole: "의문사 + to부정사",
    modifiedTarget: "명사절 자리",
    missingArgument: "의문사가 가리키는 성분",
    allowedMinimalPairs: [],
    rejectConditions: ["how to V / V-ing", "why + to V", "간접의문 어순이 아니면 출제 금지"],
    referenceChapter: "CH06",
    analysisOnly: true,
    assessmentAxis: "INFINITIVE_NOUN_FUNCTION",
    emitsStudentQuestion: false,
  },
  {
    code: "INFINITIVE_NOUN_ROLE",
    subtype: "BE_TO",
    priority: "CORE",
    syntacticRole: "be + to부정사",
    modifiedTarget: "주격보어",
    missingArgument: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["예정·의무·가능 명칭만 묻기", "CH03 be meant/made to"],
    referenceChapter: "CH06",
    analysisOnly: true,
    assessmentAxis: "INFINITIVE_NOUN_FUNCTION",
    emitsStudentQuestion: false,
  },
  {
    code: "INFINITIVE_DUMMY_IT",
    subtype: "DUMMY_SUBJECT",
    priority: "CORE",
    syntacticRole: "가주어 it + 진주어 to V",
    modifiedTarget: "It is + 형용사",
    missingArgument: "의미상 주어는 for/of로 표시",
    allowedMinimalPairs: [],
    rejectConditions: ["It is adj that과 의미만 대립", "to V / V-ing"],
    referenceChapter: "CH06",
  },
  {
    code: "DUMMY_IT_OBJECT",
    subtype: "DUMMY_OBJECT",
    priority: "MANDATORY",
    syntacticRole: "가목적어 it + 진목적어 to V",
    modifiedTarget: "find/think/make/consider + it + 보어",
    missingArgument: "없음",
    allowedMinimalPairs: [["it", "that"]],
    rejectConditions: ["that절 진목적어와 혼동", "it 없이 O + 형용사"],
    referenceChapter: "CH06",
  },
  {
    code: "INFINITIVE_LOGICAL_SUBJECT",
    subtype: "FOR_OF",
    priority: "MANDATORY",
    syntacticRole: "의미상 주어",
    modifiedTarget: "It is + 형용사 + for/of + 명사 + to V",
    missingArgument: "행위 주체",
    allowedMinimalPairs: [["for", "of"]],
    rejectConditions: ["형용사 성격이 불분명", "for + to가 목적 전치사", "시제·태를 같이 변경", "good for/of"],
    referenceChapter: "CH06",
    ownerChapter: "CH06",
    assessmentAxis: "LOGICAL_SUBJECT_FOR_OF",
    emitsStudentQuestion: true,
    sharedForm: "LOGICAL_SUBJECT_FOR_OF",
  },
  {
    code: "INFINITIVE_ADJECTIVE_ROLE",
    subtype: "NOUN_MODIFIER",
    priority: "MANDATORY",
    syntacticRole: "명사 수식",
    modifiedTarget: "선행 명사",
    missingArgument: "필수 전치사 또는 중복 목적어",
    allowedMinimalPairs: [
      ["on", "∅"],
      ["to read", "to read it"],
    ],
    rejectConditions: ["전치사가 필수가 아님", "목적어가 이미 있음", "how to V"],
    referenceChapter: "CH06",
  },
  {
    code: "INFINITIVE_ADVERB_ROLE",
    subtype: "PURPOSE_RESULT",
    priority: "CORE",
    syntacticRole: "목적·원인·근거·결과·조건",
    modifiedTarget: "동사 또는 문장",
    missingArgument: "수식 대상이 분명할 때만",
    allowedMinimalPairs: [],
    rejectConditions: ["to V / V-ing", "수식 대상이 모호", "all ... is (to) V"],
    referenceChapter: "CH06",
  },
  {
    code: "INFINITIVE_ADVERB_ROLE",
    subtype: "INDEPENDENT",
    priority: "CORE",
    syntacticRole: "독립부정사",
    modifiedTarget: "문장 전체",
    missingArgument: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["목적 부정사로 분류", "to be / being"],
    referenceChapter: "CH06",
  },
  {
    code: "TOO_TO",
    subtype: "TOO_TO",
    priority: "BASIC",
    syntacticRole: "too + 형용사/부사 + to V",
    modifiedTarget: "to부정사 표지",
    missingArgument: "없음",
    allowedMinimalPairs: [["to", "that"]],
    rejectConditions: [
      "to V / V-ing",
      "too / enough 의미 선택",
      "so ... that 장문 변환",
      "두 선택지가 모두 문법적",
      "4토큰 초과",
      "여러 문법 축을 동시에 변경",
    ],
    referenceChapter: "CH06",
    ownerChapter: "CH06",
    assessmentAxis: "INFINITIVE_CONSTRUCTION",
    emitsStudentQuestion: true,
    sharedForm: "TOO_TO_FRAME",
  },
  {
    code: "ENOUGH_TO",
    subtype: "ENOUGH_TO",
    priority: "BASIC",
    syntacticRole: "형용사/부사 + enough + to V",
    modifiedTarget: "to부정사 표지",
    missingArgument: "없음",
    allowedMinimalPairs: [["to", "that"]],
    rejectConditions: [
      "to V / V-ing",
      "too / enough 의미 선택",
      "so ... that 장문 변환",
      "두 선택지가 모두 문법적",
      "4토큰 초과",
      "여러 문법 축을 동시에 변경",
    ],
    referenceChapter: "CH06",
    ownerChapter: "CH06",
    assessmentAxis: "INFINITIVE_CONSTRUCTION",
    emitsStudentQuestion: true,
    sharedForm: "ENOUGH_TO_FRAME",
  },
  {
    code: "SO_AS_TO",
    subtype: "SO_AS_TO",
    priority: "CORE",
    syntacticRole: "목적",
    modifiedTarget: "so as to / in order to",
    missingArgument: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["to V / V-ing", "부정사구 전체 반복"],
    referenceChapter: "CH06",
  },
];

export type InfinitiveHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const FOR_ADJ = "important|necessary|possible|essential|difficult|easy|hard|impossible|useful|natural|vital|enough";
const OF_ADJ = "kind|nice|foolish|silly|wise|brave|rude|polite|careless|stupid|generous|cruel|wrong";
const AMBIGUOUS_FOR_OF_ADJ = "good";
const INDEPENDENT =
  "to be frank|to tell the truth|strange to say|so to speak|needless to say|to begin with|to make matters worse";

export function detectInfinitiveCh06(text: string): InfinitiveHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: InfinitiveHit[] = [];
  detectDummyObject(source, hits);
  detectForOf(source, hits);
  detectAdjectiveRole(source, hits);
  detectAnalysis(source, hits);
  detectDegreeFrame(source, hits);
  return applyBasicRatioCap(dedupe(hits));
}

export function infinitiveLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span) return null;
  if (/\b(?:know|knowing|face|facing|be|being|present|presenting)\b/.test(lower) && /ing$/.test(lower)) return null;
  if (code === "DUMMY_IT_OBJECT" && lower === "it") return "that";
  if (code === "INFINITIVE_LOGICAL_SUBJECT") {
    if (lower === "for") return "of";
    if (lower === "of") return "for";
  }
  if (code === "INFINITIVE_ADJECTIVE_ROLE") {
    if (lower === "on" || lower === "with") return "∅";
    if (lower === "to read") return "to read it";
    if (lower === "to write") return "to write it";
  }
  if ((code === "TOO_TO" || code === "ENOUGH_TO") && lower === "to") return "that";
  return null;
}

export function rejectInfinitiveChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_INFINITIVE_MARKER" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MULTI_AXIS_EDIT" | null {
  const mine =
    input.pointCode.startsWith("INFINITIVE_") ||
    input.pointCode === "DUMMY_IT_OBJECT" ||
    input.pointCode === "TOO_TO" ||
    input.pointCode === "ENOUGH_TO" ||
    input.pointCode === "SO_AS_TO";
  if (!mine) return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (input.pointCode === "TOO_TO" || input.pointCode === "ENOUGH_TO") {
    const locked = rejectDegreeFrameChoice(input.correct, input.wrong);
    if (locked) return locked;
  }
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) {
    return "MECHANICAL_INFINITIVE_MARKER";
  }
  if (/\bhelp\b/i.test(input.sentence) && /^[a-z]+\|to [a-z]+$/.test(pair)) return "BOTH_GRAMMATICAL";
  if (pair === "for|of" && new RegExp(`\\b(?:${AMBIGUOUS_FOR_OF_ADJ})\\b`, "i").test(input.sentence)) {
    return "BOTH_GRAMMATICAL";
  }
  if (pair === "think|to think" || pair === "think|to think") return "BOTH_GRAMMATICAL";
  if (input.correct.trim().split(/\s+/).length > 4 || input.wrong.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  return null;
}

function detectDummyObject(text: string, hits: InfinitiveHit[]) {
  const re = /\b(?:find|found|finds|make|makes|made|think|thought|consider|considered)\s+(it)\s+(?:difficult|possible|easy|hard|necessary|important)\s+to\s+[a-z]+\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "DUMMY_IT_OBJECT", "DUMMY_OBJECT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectForOf(text: string, hits: InfinitiveHit[]) {
  const ambiguous = new RegExp(
    `\\bIt(?:\\s+is|'s|\\s+was)\\s+(${AMBIGUOUS_FOR_OF_ADJ})\\s+(for|of)\\s+[A-Za-z]+\\s+to\\s+[a-z]+\\b`,
    "gi"
  );
  for (const match of text.matchAll(ambiguous)) {
    push(hits, "INFINITIVE_LOGICAL_SUBJECT", "BOTH_FOR_OF", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
  }
  const re = new RegExp(
    `\\bIt(?:\\s+is|'s|\\s+was)\\s+(${FOR_ADJ}|${OF_ADJ})\\s+(for|of)\\s+[A-Za-z]+\\s+to\\s+[a-z]+\\b`,
    "gi"
  );
  for (const match of text.matchAll(re)) {
    const adj = (match[1] ?? "").toLowerCase();
    const marker = (match[2] ?? "").toLowerCase();
    const wantsFor = new RegExp(`^(?:${FOR_ADJ})$`, "i").test(adj);
    const wantsOf = new RegExp(`^(?:${OF_ADJ})$`, "i").test(adj);
    if (wantsFor && marker !== "for") continue;
    if (wantsOf && marker !== "of") continue;
    push(hits, "INFINITIVE_LOGICAL_SUBJECT", wantsOf ? "OF_TO" : "FOR_TO", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
  }
}

function detectAdjectiveRole(text: string, hits: InfinitiveHit[]) {
  const particle = /\bto\s+(?:sit|rely|write)\s+(on|with)\b(?!\s+(?:the|a|an|him|her|them|it)\b)/gi;
  for (const match of text.matchAll(particle)) {
    push(hits, "INFINITIVE_ADJECTIVE_ROLE", "MISSING_PREP", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const easy = /\b(?:easy|hard|difficult)\s+[A-Za-z]+\s+(to\s+(?:read|write|use))\b(?!\s+it\b)/gi;
  for (const match of text.matchAll(easy)) {
    push(hits, "INFINITIVE_ADJECTIVE_ROLE", "NO_EXTRA_OBJECT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectAnalysis(text: string, hits: InfinitiveHit[]) {
  if (/\bTo\s+[a-z]+\b/.test(text) && /\b(?:takes|takes|requires|is)\b/.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "SUBJECT_TO", "to", text.search(/\bTo\s+/), false);
  }
  if (/\b(?:decided|wanted|hoped|planned)\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "OBJECT_TO", "to", text.search(/\bto\s+/i), false);
  }
  if (/\bgoal\s+is\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "COMPLEMENT_TO", "to", text.search(/\bto\s+/i), false);
  }
  if (/\b(?:how|what|which|when|where|whether)\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "WH_TO", "to", text.search(/\bto\s+/i), false);
  }
  if (/\bwhy\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "WHY_TO_AVOID", "to", text.search(/\bwhy\s+to\b/i), false);
  }
  if (/\b(?:is|are|was|were)\s+to\s+[a-z]+\b/i.test(text) && !/\b(?:made|meant|said|supposed)\s+to\b/i.test(text)) {
    push(hits, "INFINITIVE_NOUN_ROLE", "BE_TO", "to", text.search(/\bto\s+/i), false);
  }
  if (/\bIt(?:\s+is|'s|\s+was)\s+(?:important|necessary|possible|easy|hard)\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_DUMMY_IT", "DUMMY_SUBJECT", "it", text.search(/\bIt/i), false);
  }
  if (/\bfor\s+(?:the\s+|a\s+|an\s+)?(?:[A-Za-z]+\s+){1,3}to\s+[a-z]+\b/i.test(text) && !/\bIt(?:\s+is|'s|\s+was)\b/i.test(text)) {
    push(hits, "INFINITIVE_LOGICAL_SUBJECT", "FOR_TO_BARE", "for", text.search(/\bfor\b/i), false);
  }
  if (/\bno one\s+to\s+challenge\b/i.test(text) || /\bsomething\s+to\s+eat\b/i.test(text)) {
    push(hits, "INFINITIVE_ADJECTIVE_ROLE", "NOUN_MODIFIER", "to", text.search(/\bto\s+/i), false);
  }
  if (/\bto\s+manifest\b/i.test(text)) {
    push(hits, "INFINITIVE_ADVERB_ROLE", "PURPOSE_AMBIGUOUS", "to", text.search(/\bto\s+manifest\b/i), false);
  }
  if (/\ball\b[\s\S]{0,24}\bhave\s+to\s+do\s+is\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_ADVERB_ROLE", "BARE_BE_COMPLEMENT", "is", text.search(/\bis\b/i), false);
  }
  if (/\ballow(?:s|ed)?\s+ourselves\s+to\b/i.test(text)) {
    push(hits, "INFINITIVE_ADVERB_ROLE", "CH01_DEFER", "to", text.search(/\bto\s+/i), false);
  }
  if (/\b(?:were|was|are|is)\s+made\s+to\b/i.test(text) || /\bmeant\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "INFINITIVE_ADVERB_ROLE", "CH03_DEFER", "to", text.search(/\bto\s+/i), false);
  }
  const independent = new RegExp(`\\b(${INDEPENDENT})\\b`, "gi");
  for (const match of text.matchAll(independent)) {
    push(hits, "INFINITIVE_ADVERB_ROLE", "INDEPENDENT", match[1] ?? "", match.index ?? 0, false);
  }
  if (/\b(?:so as|in order)\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "SO_AS_TO", "SO_AS_TO", "to", text.search(/\b(?:so as|in order)\s+to\b/i), false);
  }
}

const BASIC_EMIT = new Set(
  INFINITIVE_CH06_RULES.filter((rule) => rule.priority === "BASIC" && rule.emitsStudentQuestion !== false).map((rule) => rule.code)
);

function rejectDegreeFrameChoice(correct: string, wrong: string): "MECHANICAL_INFINITIVE_MARKER" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MULTI_AXIS_EDIT" | null {
  const left = correct.trim();
  const right = wrong.trim();
  const pair = [left, right].map((item) => item.toLowerCase()).sort().join("|");
  if (!left || !right || pair === "that|that" || pair === "to|to") return "BOTH_GRAMMATICAL";
  if (left.split(/\s+/).length > 4 || right.split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  if (pair === "enough|too") return "MEANING_ONLY_CONTRAST";
  const parts = pair.split("|");
  const hasToVerb = parts.some((item) => /^to [a-z]+$/.test(item));
  const hasBareIng = parts.some((item) => /^[a-z]+ing$/.test(item));
  if (hasToVerb && hasBareIng) return "MECHANICAL_INFINITIVE_MARKER";
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) return "MECHANICAL_INFINITIVE_MARKER";
  const leftTokens = left.toLowerCase().split(/\s+/);
  const rightTokens = right.toLowerCase().split(/\s+/);
  if (leftTokens.length === rightTokens.length && leftTokens.filter((token, index) => token !== rightTokens[index]).length > 1) {
    return "MULTI_AXIS_EDIT";
  }
  if (pair !== "that|to") return "BOTH_GRAMMATICAL";
  return null;
}

function detectDegreeFrame(text: string, hits: InfinitiveHit[]) {
  for (const match of text.matchAll(/\btoo\s+[A-Za-z]+\s+to\s+[a-z]+\b/gi)) {
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf(" to ") + 1;
    push(hits, "TOO_TO", "TOO_TO", "to", at, true);
  }
  for (const match of text.matchAll(/\b[A-Za-z]+\s+enough\s+to\s+[a-z]+\b/gi)) {
    const at = (match.index ?? 0) + match[0].toLowerCase().lastIndexOf(" to ") + 1;
    push(hits, "ENOUGH_TO", "ENOUGH_TO", "to", at, true);
  }
}

export function applyBasicRatioCap(hits: InfinitiveHit[]): InfinitiveHit[] {
  const asked = hits.filter((hit) => hit.questionable);
  const basic = asked.filter((hit) => BASIC_EMIT.has(hit.code));
  const core = asked.length - basic.length;
  const maxBasic = core === 0 ? basic.length : Math.floor(core / 3);
  let kept = 0;
  return hits.map((hit) => {
    if (!hit.questionable || !BASIC_EMIT.has(hit.code)) return hit;
    if (kept < maxBasic) {
      kept += 1;
      return hit;
    }
    return { ...hit, questionable: false };
  });
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: InfinitiveHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: InfinitiveHit[]): InfinitiveHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
