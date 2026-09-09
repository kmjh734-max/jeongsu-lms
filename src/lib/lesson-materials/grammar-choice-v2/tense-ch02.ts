import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type TenseCh02Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  timeReference: string;
  temporalEvidence: string;
  eventOrder: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH02";
};

export const TENSE_CH02_RULES: TenseCh02Rule[] = [
  {
    code: "TENSE_PRESENT_PAST",
    subtype: "FINISHED_PAST",
    priority: "CORE",
    timeReference: "특정 과거 시점에 끝난 사건",
    temporalEvidence: "yesterday, ago, last year, once",
    eventOrder: "그 시점에 완료되어 현재와 연결되지 않음",
    allowedMinimalPairs: [
      ["visited", "has visited"],
      ["said", "has said"],
    ],
    rejectConditions: ["문맥 없는 현재·과거", "work/works", "시제와 수 일치 동시 변경"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_UNIVERSAL_TRUTH",
    subtype: "GENERAL_TRUTH",
    priority: "CORE",
    timeReference: "언제나 참인 일반적 사실",
    temporalEvidence: "과학적 불변 사실, at 100°C",
    eventOrder: "시점과 무관한 현재 상태",
    allowedMinimalPairs: [["boils", "boiled"]],
    rejectConditions: ["역사적 현재", "일정표상 미래와 혼동"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_PRESENT_PERFECT_PAST",
    subtype: "PERFECT_BLOCKED",
    priority: "CORE",
    timeReference: "현재완료와 충돌하는 완료된 과거",
    temporalEvidence: "yesterday, ago, last year",
    eventOrder: "과거 한 시점에서 종료",
    allowedMinimalPairs: [["visited", "has visited"]],
    rejectConditions: ["since/for와 함께인 계속", "용법 명칭만 묻기"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_SINCE_FOR",
    subtype: "DURATION",
    priority: "CORE",
    timeReference: "since/for로 이어지는 지속·완료",
    temporalEvidence: "since + 기점, for + 기간",
    eventOrder: "시작 이후 현재까지",
    allowedMinimalPairs: [
      ["has lived", "lived"],
      ["has been", "was"],
      ["have ever read", "ever read"],
    ],
    rejectConditions: ["has + 명사", "명확한 과거 시점과 현재완료 결합", "태와 시제 동시 변경"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_PAST_PERFECT",
    subtype: "EARLIER_PAST",
    priority: "CORE",
    timeReference: "과거 기준보다 앞선 완료",
    temporalEvidence: "by the time + 과거, already",
    eventOrder: "기준 과거보다 먼저 끝남",
    allowedMinimalPairs: [["had already left", "has already left"]],
    rejectConditions: ["순서만으로 과거완료 강제", "단순과거와 과거완료가 둘 다 가능"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_FUTURE_PERFECT",
    subtype: "BY_FUTURE",
    priority: "CORE",
    timeReference: "미래 기준까지의 완료·지속",
    temporalEvidence: "by next month, by next year",
    eventOrder: "미래 기준 이전에 완료",
    allowedMinimalPairs: [["will have worked", "has worked"]],
    rejectConditions: ["will/be going to 의미만", "현재완료로도 가능한 지속"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_PROGRESSIVE",
    subtype: "STATIVE_BLOCK",
    priority: "CORE",
    timeReference: "상태의 지속은 진행형을 제한",
    temporalEvidence: "for years, belong to",
    eventOrder: "상태 시작 이후 현재까지",
    allowedMinimalPairs: [
      ["have known", "have been knowing"],
      ["belongs", "is belonging"],
    ],
    rejectConditions: ["think/see/feel/taste의 동적 의미", "always 불평의 의미만", "진행 수동태"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_BY_THE_TIME",
    subtype: "SINCE_PAST",
    priority: "CORE",
    timeReference: "It has been ... since 뒤는 과거",
    temporalEvidence: "It has been + 기간 + since",
    eventOrder: "since 절은 이미 끝난 기점",
    allowedMinimalPairs: [["left", "has left"]],
    rejectConditions: ["시간·조건절의 미래 현재는 CH10", "since 절 전체를 반복"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_EXPLICIT_TIME_MARKER",
    subtype: "FUTURE_FORM",
    priority: "CORE",
    timeReference: "일정·예정된 미래",
    temporalEvidence: "tomorrow, at six",
    eventOrder: "아직 오지 않은 일정",
    allowedMinimalPairs: [],
    rejectConditions: ["will/be going to가 둘 다 가능", "의미만 다른 미래 표현"],
    referenceChapter: "CH02",
  },
  {
    code: "TENSE_SEQUENCE",
    subtype: "UNCLEAR_SHIFT",
    priority: "CORE",
    timeReference: "보고 시점이 불분명한 전환",
    temporalEvidence: "화법 전환, 절 시제 일치",
    eventOrder: "기준 시점이 고정되지 않음",
    allowedMinimalPairs: [],
    rejectConditions: ["보고 시점 불분명", "CH10 간접화법과 같은 span"],
    referenceChapter: "CH02",
  },
];

export type TenseHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const PAST_POINT = "yesterday|last night|last week|last month|last year|ago";
const VOICE_PP = "used|written|recommended|accepted|held|done|seen|published|created|broken|taken";
const STATE_ADJ = "stable|quiet|true|ready|available|open|clear|silent";

export function detectTenseCh02(text: string): TenseHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: TenseHit[] = [];
  if (isTimeConditionFuture(source)) {
    detectAnalysis(source, hits);
    return dedupe(hits);
  }
  detectPastPoint(source, hits);
  detectUniversal(source, hits);
  detectSinceFor(source, hits);
  detectEver(source, hits);
  detectSincePast(source, hits);
  detectPastPerfect(source, hits);
  detectFuturePerfect(source, hits);
  detectStative(source, hits);
  detectAnalysis(source, hits);
  return dedupe(hits);
}

export function tenseLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span || /^(?:work|works|try|tries)$/.test(lower)) return null;
  if (code === "TENSE_UNIVERSAL_TRUTH" && lower === "boils") return "boiled";
  if (code === "TENSE_PRESENT_PAST" || code === "TENSE_PRESENT_PERFECT_PAST") {
    if (lower === "visited") return "has visited";
    if (lower === "said") return "has said";
    if (lower === "left") return "has left";
  }
  if (code === "TENSE_SINCE_FOR") {
    if (lower === "has lived") return "lived";
    if (lower === "has worked") return "worked";
    if (lower === "has been") return "was";
    if (lower === "have ever read") return "ever read";
    if (lower === "has ever read") return "ever read";
  }
  if (code === "TENSE_BY_THE_TIME" && lower === "left") return "has left";
  if (code === "TENSE_PAST_PERFECT" && lower === "had already left") return "has already left";
  if (code === "TENSE_FUTURE_PERFECT" && lower === "will have worked") return "has worked";
  if (code === "TENSE_PROGRESSIVE") {
    if (lower === "have known") return "have been knowing";
    if (lower === "has known") return "has been knowing";
    if (lower === "belongs") return "is belonging";
    if (lower === "resembles") return "is resembling";
  }
  return null;
}

export function rejectTenseChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_MODAL_FORM" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MULTI_AXIS_EDIT" | null {
  if (!input.pointCode.startsWith("TENSE_")) return null;
  if (input.pointCode === "TENSE_TIME_CONDITION_CLAUSE" || input.pointCode === "TENSE_REPORTED_SPEECH") return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pair === "work|works" || pair === "tries|try") return "MECHANICAL_MODAL_FORM";
  if (/\bbe going to\b/i.test(`${input.correct} ${input.wrong}`) && /\bwill\b/i.test(`${input.correct} ${input.wrong}`)) {
    return "MEANING_ONLY_CONTRAST";
  }
  if (/\bbeen\b/i.test(input.correct) && /\bbeen\b/i.test(input.sentence) && new RegExp(`\\b(?:${VOICE_PP})\\b`, "i").test(input.sentence)) {
    return "MULTI_AXIS_EDIT";
  }
  if (input.correct.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  return null;
}

function detectPastPoint(text: string, hits: TenseHit[]) {
  const re = new RegExp(`\\b(visited|said|left)\\b(?:[\\s\\S]{0,32})\\b(${PAST_POINT})\\b|\\b(${PAST_POINT})\\b(?:[\\s\\S]{0,32})\\b(visited|said|left)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const verb = match[1] || match[4] || "";
    if (!verb || /\b(?:has|have)\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 6), match.index ?? 0))) continue;
    push(hits, "TENSE_PRESENT_PAST", "FINISHED_PAST", verb, indexOfSpan(text, verb, match.index ?? 0), true);
    push(hits, "TENSE_PRESENT_PERFECT_PAST", "PERFECT_BLOCKED", verb, indexOfSpan(text, verb, match.index ?? 0), true);
  }
  const once = /\bonce\s+(said|wrote|observed)\b/gi;
  for (const match of text.matchAll(once)) {
    push(hits, "TENSE_PRESENT_PAST", "ONCE_PAST", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectUniversal(text: string, hits: TenseHit[]) {
  const re = /\b(?:Water|Ice|The sun|Light)\s+(boils|freezes|rises)\b/g;
  for (const match of text.matchAll(re)) {
    push(hits, "TENSE_UNIVERSAL_TRUTH", "GENERAL_TRUTH", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectSinceFor(text: string, hits: TenseHit[]) {
  const lived = /\b(has lived|has worked|have lived|have worked)\b[\s\S]{0,40}\b(?:since|for)\b/gi;
  for (const match of text.matchAll(lived)) {
    const span = match[1] ?? "";
    if (new RegExp(`\\b(?:${PAST_POINT})\\b`, "i").test(text)) continue;
    push(hits, "TENSE_SINCE_FOR", "DURATION", span, match.index ?? 0, true);
  }
  const state = new RegExp(`\\b(has been|have been)\\s+(?:${STATE_ADJ})\\b[\\s\\S]{0,24}\\b(?:for|since)\\b`, "gi");
  for (const match of text.matchAll(state)) {
    push(hits, "TENSE_SINCE_FOR", "STATE_DURATION", match[1] ?? "", match.index ?? 0, true);
  }
}

function detectEver(text: string, hits: TenseHit[]) {
  if (!/\b(?:best|worst|first|only)\b/i.test(text)) return;
  const re = /\b(have ever read|has ever read|have ever seen|has ever seen)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "TENSE_SINCE_FOR", "SUPERLATIVE_EVER", match[1] ?? "", match.index ?? 0, true);
  }
}

function detectSincePast(text: string, hits: TenseHit[]) {
  const re = /\bIt\s+has\s+been\b[\s\S]{0,40}\bsince\s+(?:he|she|they|I|we)\s+(left|died|arrived|started)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "TENSE_BY_THE_TIME", "SINCE_PAST", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectPastPerfect(text: string, hits: TenseHit[]) {
  const re = /\bBy the time\s+(?:she|he|they|we|I)\s+(arrived|came|finished|left)\b[\s\S]{0,48}\b(had already left|had already finished)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "TENSE_PAST_PERFECT", "EARLIER_PAST", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
    push(hits, "TENSE_BY_THE_TIME", "PAST_REFERENCE", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), false);
  }
}

function detectFuturePerfect(text: string, hits: TenseHit[]) {
  const re = /\bBy next\s+(?:month|year|week)\b[\s\S]{0,48}\b(will have worked|will have finished)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "TENSE_FUTURE_PERFECT", "BY_FUTURE", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectStative(text: string, hits: TenseHit[]) {
  const known = /\b(have known|has known)\b[\s\S]{0,24}\bfor\b/gi;
  for (const match of text.matchAll(known)) {
    push(hits, "TENSE_PROGRESSIVE", "STATIVE_BLOCK", match[1] ?? "", match.index ?? 0, true);
  }
  const belong = /\b(belongs|resembles)\s+to\b|\b(resembles)\s+(?:her|his|the|a)\b/gi;
  for (const match of text.matchAll(belong)) {
    const span = match[1] || match[2] || "";
    if (!span) continue;
    push(hits, "TENSE_PROGRESSIVE", "STATIVE_BLOCK", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectAnalysis(text: string, hits: TenseHit[]) {
  if (/\bhave heard\b/i.test(text) && !/\b(?:since|for|ever|yesterday|ago|last year)\b/i.test(text)) {
    push(hits, "TENSE_PRESENT_PERFECT_PAST", "EXPERIENCE", "have heard", text.search(/\bhave heard\b/i), false);
  }
  if (/\bhas\s+(?:many|a|an|the|some|no|several)\s+[A-Za-z]+\b/i.test(text) && !/\bhas\s+(?:heard|lived|been|visited|seen)\b/i.test(text)) {
    push(hits, "TENSE_PRESENT_PERFECT_PAST", "HAVE_NOUN", "has", text.search(/\bhas\b/i), false);
  }
  if (new RegExp(`\\b(?:has|have|had)\\s+been\\s+(?:${VOICE_PP})\\b`, "i").test(text)) {
    push(hits, "TENSE_SINCE_FOR", "VOICE_DEFER", "been", text.search(/\bbeen\b/i), false);
  }
  if (/\bwas\s+written\b/i.test(text)) {
    push(hits, "TENSE_PRESENT_PAST", "PAST_PASSIVE", "was written", text.search(/\bwas written\b/i), false);
  }
  if (/\bactually\s+live\b/i.test(text) || /\bwe\s+live\s+with\b/i.test(text)) {
    push(hits, "TENSE_PRESENT_PAST", "PRESENT_STATE", "live", text.search(/\blive\b/i), false);
  }
  if (/\bobserved\b/i.test(text) && !/\b(?:yesterday|ago|last year|once)\b/i.test(text)) {
    push(hits, "TENSE_PRESENT_PAST", "HISTORICAL", "observed", text.search(/\bobserved\b/i), false);
  }
  if (/\b(?:leaves|departs|arrives)\s+at\b/i.test(text) && /\btomorrow\b/i.test(text)) {
    push(hits, "TENSE_EXPLICIT_TIME_MARKER", "SCHEDULED_PRESENT", "leaves", text.search(/\b(?:leaves|departs|arrives)\b/i), false);
  }
  if (/\bis\s+meeting\b/i.test(text) && /\btomorrow\b/i.test(text)) {
    push(hits, "TENSE_EXPLICIT_TIME_MARKER", "PLAN_PROGRESSIVE", "is meeting", text.search(/\bis meeting\b/i), false);
  }
  if (/\bwill\b/i.test(text) && /\bgoing to\b/i.test(text)) {
    push(hits, "TENSE_EXPLICIT_TIME_MARKER", "FUTURE_BOTH", "will", text.search(/\bwill\b/i), false);
  } else if (/\b(?:will|going to)\b/i.test(text) && !/\bwill have\b/i.test(text)) {
    push(hits, "TENSE_EXPLICIT_TIME_MARKER", "FUTURE_BOTH", "will", text.search(/\b(?:will|going)\b/i), false);
  }
  if (/\bhas been\s+[a-z]+ing\b/i.test(text)) {
    push(hits, "TENSE_PROGRESSIVE", "PERFECT_PROGRESSIVE", "has been", text.search(/\bhas been\b/i), false);
  }
  if (/\b(?:and then|after that)\b/i.test(text)) {
    push(hits, "TENSE_PAST_PERFECT", "OPTIONAL_ORDER", "then", text.search(/\b(?:and then|after that)\b/i), false);
  }
  if (/\bsaid that\b/i.test(text)) {
    push(hits, "TENSE_SEQUENCE", "UNCLEAR_SHIFT", "said that", text.search(/\bsaid that\b/i), false);
  }
}

function isTimeConditionFuture(text: string): boolean {
  return /\b(?:when|if|unless|before|after|as soon as)\b[\s\S]{0,40}\b(?:rains|comes|arrives|leaves)\b[\s\S]{0,40}\bwill\b/i.test(text);
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: TenseHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: TenseHit[]): TenseHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
