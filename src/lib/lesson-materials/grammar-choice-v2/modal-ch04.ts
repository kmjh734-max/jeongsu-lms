import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ModalCh04Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  meaningCondition: string;
  timeReference: string;
  requiredForm: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH04";
  ownerChapter?: "CH04";
  analysisOnly?: boolean;
};

export const MODAL_CH04_RULES: ModalCh04Rule[] = [
  {
    code: "MODAL_MEANING",
    subtype: "MEANING_ONLY",
    priority: "CORE",
    meaningCondition: "능력·허가·의무·필요·추측은 문맥이 하나를 강제할 때만 형식 차이가 된다",
    timeReference: "현재·미래 추측과 과거 사실은 같은 조동사로 묶지 않는다",
    requiredForm: "조동사 + 동사원형",
    allowedMinimalPairs: [],
    rejectConditions: ["의미만 다른 must/may/should", "조동사 뒤 try/tries", "could try/tries", "need/dare의 조동사·본동사 둘 다 가능"],
    referenceChapter: "CH04",
  },
  {
    code: "MODAL_HAVE_PP",
    subtype: "CANNOT_HAVE",
    priority: "CORE",
    meaningCondition: "과거 사실에 대한 불가능한 추측은 cannot have p.p.",
    timeReference: "yesterday, last night, ago 등 과거 표지가 있을 때만",
    requiredForm: "cannot/can't + have + p.p.",
    allowedMinimalPairs: [["have seen", "see"]],
    rejectConditions: ["과거 표지 없는 have p.p.", "modal + be + p.p. 태", "가정법 would have"],
    referenceChapter: "CH04",
  },
  {
    code: "MODAL_PAST_INFERENCE",
    subtype: "MUST_HAVE",
    priority: "CORE",
    meaningCondition: "과거 사실에 대한 강한 추측은 must have p.p.",
    timeReference: "과거 시점 또는 이미 지난 사건",
    requiredForm: "must + have + p.p.",
    allowedMinimalPairs: [["have forgotten", "forget"]],
    rejectConditions: ["must + 명사", "현재 의무 must V", "단순형도 가능한 문맥"],
    referenceChapter: "CH04",
  },
  {
    code: "MODAL_REGRET_CRITICISM",
    subtype: "SHOULD_HAVE",
    priority: "CORE",
    meaningCondition: "하지 않은 과거 행위에 대한 후회·비판은 should/ought to have p.p.",
    timeReference: "yesterday, last week 등 과거 표지가 필수",
    requiredForm: "should/ought to + have + p.p.",
    allowedMinimalPairs: [["have told", "tell"]],
    rejectConditions: ["시간 표현 없는 should have", "현재 의무 should V", "should rest 당위와 혼동"],
    referenceChapter: "CH04",
  },
  {
    code: "MANDATIVE_SHOULD",
    subtype: "MANDATIVE_BASE",
    priority: "CORE",
    meaningCondition: "요구·제안·명령·당위일 때만 that절 동사원형",
    timeReference: "발화 이후의 요구이지 과거 사실 전달이 아니다",
    requiredForm: "that + 주어 + (should) 동사원형",
    allowedMinimalPairs: [
      ["rest", "rested"],
      ["be", "is"],
    ],
    rejectConditions: ["suggest가 암시", "insist가 사실 주장", "should와 원형이 둘 다 가능", "요구인지 불분명"],
    referenceChapter: "CH04",
  },
  {
    code: "SUBSTITUTE_DO",
    subtype: "PRO_VERB",
    priority: "MANDATORY",
    meaningCondition: "앞선 동사구를 do/does/did가 대신한다",
    timeReference: "앞 동사구의 시제를 유지한다",
    requiredForm: "비교·접속 뒤의 do/does/did",
    allowedMinimalPairs: [
      ["do", "am"],
      ["did", "was"],
    ],
    rejectConditions: ["주어 바로 뒤 단순 do/does 수일치", "강조 did do", "본동사 do + 목적어"],
    referenceChapter: "CH04",
  },
  {
    code: "USED_TO",
    subtype: "USED_TO_FAMILY",
    priority: "CORE",
    meaningCondition: "과거 습관 used to V와 익숙함 be/get used to N/V-ing",
    timeReference: "used to는 과거, be/get used to는 현재·미래 익숙함",
    requiredForm: "used to V / be used to V-ing / get used to V-ing",
    allowedMinimalPairs: [],
    rejectConditions: ["used to live/living", "be used to living/live", "형태만 묻는 문항"],
    referenceChapter: "CH04",
  },
  {
    code: "WOULD_PAST_HABIT",
    subtype: "WOULD_BASE",
    priority: "CORE",
    meaningCondition: "과거 습관의 would + 동사원형",
    timeReference: "반복된 과거",
    requiredForm: "would + 동사원형",
    allowedMinimalPairs: [],
    rejectConditions: ["가정법 결과절 would", "would rather", "조동사 뒤 굴절"],
    referenceChapter: "CH04",
  },
  {
    code: "HAD_BETTER",
    subtype: "HAD_BETTER_BASE",
    priority: "CORE",
    meaningCondition: "충고 had better + 동사원형",
    timeReference: "지금 이후의 조언",
    requiredForm: "had better + 동사원형",
    allowedMinimalPairs: [],
    rejectConditions: ["had better go/goes", "had better go/to go"],
    referenceChapter: "CH04",
  },
  {
    code: "WOULD_RATHER",
    subtype: "RATHER_FORM",
    priority: "CORE",
    meaningCondition: "would rather + 동사원형",
    timeReference: "동일 주어의 선호",
    requiredForm: "would rather + 동사원형",
    allowedMinimalPairs: [],
    rejectConditions: ["같은 span을 다른 챕터에서 재출제", "would rather try/tries", "stay/stayed"],
    referenceChapter: "CH04",
    ownerChapter: "CH04",
    analysisOnly: true,
  },
];

export type ModalHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const PAST_TIME = "yesterday|last night|last week|last month|last year|earlier|previously|ago";
const PAST_EVENT = "appointment|meeting|call|deadline";
const PP_BASE: Record<string, string> = {
  forgotten: "forget",
  forgottenly: "forget",
  seen: "see",
  told: "tell",
  left: "leave",
  done: "do",
  gone: "go",
  been: "be",
  written: "write",
  taken: "take",
  given: "give",
  finished: "finish",
  missed: "miss",
  waited: "wait",
  known: "know",
  come: "come",
  arrived: "arrive",
};

const MANDATIVE_BASE = new Set([
  "rest",
  "be",
  "leave",
  "go",
  "come",
  "stay",
  "start",
  "stop",
  "wait",
  "attend",
  "submit",
  "finish",
  "take",
  "write",
  "return",
]);

export function detectModalCh04(text: string): ModalHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: ModalHit[] = [];
  if (isConditionalResult(source)) {
    detectAnalysisOnly(source, hits);
    return dedupe(hits);
  }
  detectHavePp(source, hits);
  detectMandative(source, hits);
  detectSubstitute(source, hits);
  detectAnalysisOnly(source, hits);
  return dedupe(hits);
}

export function modalLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span) return null;
  if (lower === "live" || lower === "living" || lower === "try" || lower === "tries" || lower === "go" || lower === "goes") {
    return null;
  }
  if (code === "MODAL_HAVE_PP" || code === "MODAL_PAST_INFERENCE" || code === "MODAL_REGRET_CRITICISM") {
    const pp = /^have\s+([a-z]+)$/i.exec(span);
    if (!pp) return null;
    return ppToBase(pp[1] ?? "");
  }
  if (code === "MANDATIVE_SHOULD") {
    if (lower === "be") return "is";
    const past: Record<string, string> = {
      rest: "rested",
      leave: "left",
      go: "went",
      come: "came",
      stay: "stayed",
      start: "started",
      stop: "stopped",
      wait: "waited",
      attend: "attended",
      submit: "submitted",
      finish: "finished",
      take: "took",
      write: "wrote",
      return: "returned",
    };
    return past[lower] ?? null;
  }
  if (code === "SUBSTITUTE_DO") {
    if (lower === "do") return "am";
    if (lower === "does") return "is";
    if (lower === "did") return "was";
  }
  return null;
}

export function rejectModalChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_MODAL_FORM" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | null {
  const mine =
    input.pointCode.startsWith("MODAL_") ||
    input.pointCode === "MANDATIVE_SHOULD" ||
    input.pointCode === "SUBSTITUTE_DO" ||
    input.pointCode === "USED_TO" ||
    input.pointCode === "HAD_BETTER" ||
    input.pointCode === "WOULD_PAST_HABIT" ||
    input.pointCode === "WOULD_RATHER";
  if (!mine) return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pair === "tries|try" || pair === "go|goes" || pair === "go|to go" || pair === "stay|stayed") {
    return "MECHANICAL_MODAL_FORM";
  }
  if (pair === "live|living" || pair === "live|to live") return "MECHANICAL_MODAL_FORM";
  if (input.pointCode === "MODAL_MEANING") return "MEANING_ONLY_CONTRAST";
  if (input.pointCode === "USED_TO" || input.pointCode === "HAD_BETTER" || input.pointCode === "WOULD_PAST_HABIT") {
    return "BOTH_GRAMMATICAL";
  }
  if (/\bshould\b/i.test(input.sentence) && input.pointCode === "MANDATIVE_SHOULD" && /\bshould\b/i.test(input.sentence.slice(0, input.sentence.toLowerCase().indexOf(input.correct.toLowerCase())))) {
    return "BOTH_GRAMMATICAL";
  }
  if (input.correct.trim().split(/\s+/).length > 3) return "NON_MINIMAL_SPAN";
  return null;
}

function detectHavePp(text: string, hits: ModalHit[]) {
  const past = hasPastCue(text);
  const re = /\b(must|should|cannot|can't|ought to|need not|needn't)\s+have\s+([a-z]+)\b/gi;
  for (const match of text.matchAll(re)) {
    const modal = (match[1] ?? "").toLowerCase();
    const pp = (match[2] ?? "").toLowerCase();
    if (!ppToBase(pp) || pp === "been") continue;
    const span = `have ${match[2]}`;
    if (modal === "must" && (past || new RegExp(`\\b(?:${PAST_EVENT})\\b`, "i").test(text))) {
      push(hits, "MODAL_PAST_INFERENCE", "MUST_HAVE", span, indexOfSpan(text, span, match.index ?? 0), true);
      continue;
    }
    if ((modal === "should" || modal === "ought to") && past) {
      push(hits, "MODAL_REGRET_CRITICISM", "SHOULD_HAVE", span, indexOfSpan(text, span, match.index ?? 0), true);
      continue;
    }
    if ((modal === "cannot" || modal === "can't" || modal === "need not" || modal === "needn't") && past) {
      push(hits, "MODAL_HAVE_PP", modal.startsWith("need") ? "NEED_NOT_HAVE" : "CANNOT_HAVE", span, indexOfSpan(text, span, match.index ?? 0), true);
      continue;
    }
    push(hits, "MODAL_HAVE_PP", "OPTIONAL_PERFECT", span, indexOfSpan(text, span, match.index ?? 0), false);
  }
}

function detectMandative(text: string, hits: ModalHit[]) {
  const verb = /\b(recommended|demanded|ordered|requested|required)\s+that\s+(?:he|she|they|we|i|every\s+[A-Za-z]+)\s+(should\s+)?([a-z]+)\b/gi;
  for (const match of text.matchAll(verb)) {
    const bare = (match[3] ?? "").toLowerCase();
    if (match[2]) {
      push(hits, "MANDATIVE_SHOULD", "SHOULD_OPTIONAL", bare, indexOfSpan(text, match[3] ?? "", match.index ?? 0), false);
      continue;
    }
    if (!MANDATIVE_BASE.has(bare)) continue;
    push(hits, "MANDATIVE_SHOULD", "MANDATIVE_BASE", match[3] ?? "", indexOfSpan(text, match[3] ?? "", match.index ?? 0), true);
  }
  const suggestDemand = /\b(suggested|insisted)\s+that\s+(?:he|she|they|we)\s+(should\s+)?([a-z]+)\b/gi;
  for (const match of text.matchAll(suggestDemand)) {
    const bare = (match[3] ?? "").toLowerCase();
    if (match[2] || isFiniteClauseVerb(bare)) {
      push(hits, "MANDATIVE_SHOULD", "FACT_OR_IMPLY", bare, indexOfSpan(text, match[3] ?? "", match.index ?? 0), false);
      continue;
    }
    if (!MANDATIVE_BASE.has(bare)) continue;
    push(hits, "MANDATIVE_SHOULD", "MANDATIVE_BASE", match[3] ?? "", indexOfSpan(text, match[3] ?? "", match.index ?? 0), true);
  }
  const adj = /\bIt\s+is\s+(?:essential|important|necessary|vital|imperative)\s+that\s+(?:he|she|they|we|every\s+[A-Za-z]+)\s+(should\s+)?([a-z]+)\b/gi;
  for (const match of text.matchAll(adj)) {
    const bare = (match[2] ?? "").toLowerCase();
    if (match[1] || !MANDATIVE_BASE.has(bare)) {
      push(hits, "MANDATIVE_SHOULD", "SHOULD_OPTIONAL", bare, indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
      continue;
    }
    push(hits, "MANDATIVE_SHOULD", "MANDATIVE_BASE", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
  }
  const imply = /\b(suggested|suggests|suggest)\s+that\s+(?:he|she|they|the\s+[A-Za-z]+)\s+(was|were|is|are|had|has|worked|left|works)\b/gi;
  for (const match of text.matchAll(imply)) {
    push(hits, "MANDATIVE_SHOULD", "SUGGEST_IMPLY", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
  }
  const fact = /\binsisted\s+that\s+(?:he|she|they|the\s+[A-Za-z]+)\s+(was|were|is|are|had)\b/gi;
  for (const match of text.matchAll(fact)) {
    push(hits, "MANDATIVE_SHOULD", "INSIST_FACT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectSubstitute(text: string, hits: ModalHit[]) {
  if (/\bdid\s+do\s+was\b/i.test(text) || /\b(?:do|does|did)\s+(?:like|know|want|believe)\b/i.test(text)) {
    push(hits, "SUBSTITUTE_DO", "EMPHATIC_DEFER", "do", text.search(/\b(?:do|does|did)\b/i), false);
    return;
  }
  const than = /\bthan\s+(I|you|he|she|we|they)\s+(do|does|did)\b/gi;
  for (const match of text.matchAll(than)) {
    if (!hasLexicalAntecedent(text.slice(0, match.index ?? 0))) continue;
    if (isMainVerbDo(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "SUBSTITUTE_DO", "PRO_VERB", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
  }
  const andDid = /\b(?:promised|wanted|agreed|offered|tried)\s+to\s+[a-z]+,\s+and\s+(?:he|she|they|i|we)\s+(did)\b/gi;
  for (const match of text.matchAll(andDid)) {
    push(hits, "SUBSTITUTE_DO", "PRO_VERB", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectAnalysisOnly(text: string, hits: ModalHit[]) {
  if (/\bused\s+to\s+[a-z]+\b/i.test(text) && !/\b(?:be|am|is|are|was|were|get|gets|getting)\s+used\s+to\b/i.test(text)) {
    push(hits, "USED_TO", "USED_TO_V", "used to", text.search(/\bused\s+to\b/i), false);
  }
  if (/\b(?:am|is|are|was|were|be|been)\s+used\s+to\b/i.test(text)) {
    push(hits, "USED_TO", "BE_USED_TO", "used to", text.search(/\bused\s+to\b/i), false);
  }
  if (/\b(?:get|gets|getting|got)\s+used\s+to\b/i.test(text)) {
    push(hits, "USED_TO", "GET_USED_TO", "used to", text.search(/\bused\s+to\b/i), false);
  }
  if (/\bhad\s+better\s+[a-z]+\b/i.test(text)) {
    push(hits, "HAD_BETTER", "HAD_BETTER_BASE", "had better", text.search(/\bhad\s+better\b/i), false);
  }
  if (/\bwould\s+rather\b/i.test(text)) {
    push(hits, "WOULD_RATHER", "RATHER_FORM", "would rather", text.search(/\bwould\s+rather\b/i), false);
  }
  if (/\bwould\s+[a-z]+\b/i.test(text) && !/\bwould\s+(?:rather|have)\b/i.test(text) && !isConditionalResult(text)) {
    push(hits, "WOULD_PAST_HABIT", "WOULD_BASE", "would", text.search(/\bwould\b/i), false);
  }
  if (/\b(?:may|might)\s+well\b/i.test(text) || /\bmay\s+as\s+well\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "MODAL_IDIOM", "may well", text.search(/\b(?:may|might)\b/i), false);
  }
  if (/\bcannot\s+help\s+[a-z]+ing\b/i.test(text) || /\bcan'?t\s+help\s+[a-z]+ing\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "CANNOT_HELP", "cannot help", text.search(/\b(?:cannot|can't)\b/i), false);
  }
  if (/\bcannot\b[\s\S]{0,24}\btoo\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "CANNOT_TOO", "cannot", text.search(/\bcannot\b/i), false);
  }
  if (/\b(?:need|dare)\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "NEED_DARE", "need", text.search(/\b(?:need|dare)\b/i), false);
  }
  if (/\bhave\s+to\s+do\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "HAVE_TO", "have to do", text.search(/\bhave\s+to\s+do\b/i), false);
  }
  const bare = /\b(can|could|may|might|must|should|will|would)\s+(?:not\s+)?(?:be|become|bring|bear|happen)\b/gi;
  for (const match of text.matchAll(bare)) {
    if (/\bbe\s+[a-z]+\b/i.test(match[0]) && /\b(?:done|held|seen|known|wiped|accepted)\b/i.test(text.slice(match.index ?? 0, (match.index ?? 0) + 40))) {
      push(hits, "MODAL_MEANING", "VOICE_DEFER", match[1] ?? "", match.index ?? 0, false);
      continue;
    }
    push(hits, "MODAL_MEANING", "BARE_BASE", match[1] ?? "", match.index ?? 0, false);
  }
  if (/\bmodal\s+be\s+[a-z]+\b/i.test(text) || /\b(?:can|could|may|might|must|should|will|would)\s+be\s+(?:done|held|seen|wiped|broken)\b/i.test(text)) {
    push(hits, "MODAL_MEANING", "VOICE_DEFER", "be", text.search(/\bbe\b/i), false);
  }
}

function hasPastCue(text: string): boolean {
  return new RegExp(`\\b(?:${PAST_TIME})\\b`, "i").test(text);
}

function hasLexicalAntecedent(before: string): boolean {
  return /\b(?:speaks|speak|works|work|plays|play|runs|run|writes|write|reads|read|helps|help|studies|study)\b/i.test(before);
}

function isMainVerbDo(text: string, at: number): boolean {
  return /^\s+(?:the|a|an|his|her|their|my|homework|dishes)\b/i.test(text.slice(at));
}

function isFiniteClauseVerb(verb: string): boolean {
  return /^(?:was|were|is|are|had|has|did|worked|left|seemed|seem|looked)$/i.test(verb);
}

function isConditionalResult(text: string): boolean {
  return /\bif\b[\s\S]{0,80}\b(?:would|could|might|had|were)\b/i.test(text) || /^(?:Had|Were|Should)\b/.test(text.trim());
}

function ppToBase(pp: string): string | null {
  const w = pp.toLowerCase();
  if (PP_BASE[w]) return PP_BASE[w];
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  return null;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: ModalHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: ModalHit[]): ModalHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
