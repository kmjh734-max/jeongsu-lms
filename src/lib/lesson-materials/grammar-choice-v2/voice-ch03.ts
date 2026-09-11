import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type VoiceCh03Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  transitivityRule: string;
  subjectRole: string;
  auxiliaryPattern: string;
  requiredParticle: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH03";
};

export const VOICE_CH03_RULES: VoiceCh03Rule[] = [
  {
    code: "VOICE_ACTIVE_PASSIVE",
    subtype: "SIMPLE_BE_PP",
    priority: "CORE",
    transitivityRule: "목적어가 필요한 타동사만 be + p.p.로 바꾼다",
    subjectRole: "주어가 동작의 대상이고 by 행위자가 있다",
    auxiliaryPattern: "am/is/are/was/were + p.p.",
    requiredParticle: "",
    allowedMinimalPairs: [
      ["is accepted", "accepts"],
      ["was accepted", "accepted"],
    ],
    rejectConditions: ["능동·수동이 문맥상 둘 다 가능", "by와 with/from 의미만", "시제와 태를 동시에 변경", "자동사 수동"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_ACTIVE_PASSIVE",
    subtype: "PASSIVE_IDIOM",
    priority: "CORE",
    transitivityRule: "be meant/intended/supposed to는 관용 수동이다",
    subjectRole: "주어는 의무·의도·예상의 대상이다",
    auxiliaryPattern: "be (+ not) + meant/intended/supposed + to",
    requiredParticle: "to",
    allowedMinimalPairs: [
      ["are meant to", "mean to"],
      ["is not intended to", "does not intend to"],
    ],
    rejectConditions: ["be interested/satisfied/suited 상태 형용사", "to 삭제", "문체만 다른 능동"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_PROGRESSIVE_PASSIVE",
    subtype: "PROGRESSIVE_BEING",
    priority: "CORE",
    transitivityRule: "진행 중인 타동 동작의 대상만 being + p.p.",
    subjectRole: "주어가 지금 당하는 대상이다",
    auxiliaryPattern: "am/is/are/was/were + being + p.p.",
    requiredParticle: "",
    allowedMinimalPairs: [["are being held", "are holding"]],
    rejectConditions: ["are being holding", "분사 수식 중복", "과거분사만 교체"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_PERFECT_PASSIVE",
    subtype: "PERFECT_BEEN",
    priority: "CORE",
    transitivityRule: "완료된 타동 동작이고 by 행위자가 있다",
    subjectRole: "주어가 이미 완료된 동작의 대상이다",
    auxiliaryPattern: "have/has/had + been + p.p.",
    requiredParticle: "",
    allowedMinimalPairs: [["has been accepted", "has accepted"]],
    rejectConditions: ["been만 보고 태를 바꿈", "시제와 태를 동시에 변경", "by 없는 의미 대립"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_MODAL_PASSIVE",
    subtype: "MODAL_BE_PP",
    priority: "CORE",
    transitivityRule: "조동사 뒤 타동 동작의 대상",
    subjectRole: "주어가 조동사 가능·의무의 대상이다",
    auxiliaryPattern: "modal + be + p.p.",
    requiredParticle: "",
    allowedMinimalPairs: [
      ["can be done", "can do"],
      ["can be broken down", "can break down"],
    ],
    rejectConditions: ["조동사 뒤 try/tries", "의미만 다른 can V / can be p.p.", "by 없는 자동사성 구동사"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_PHRASAL_VERB_PASSIVE",
    subtype: "PHRASAL_PARTICLE",
    priority: "CORE",
    transitivityRule: "전치사·부사를 끝까지 유지하는 타동 구동사",
    subjectRole: "주어가 구동사 동작의 대상이다",
    auxiliaryPattern: "be/been/modal be + p.p. + particle",
    requiredParticle: "after/to/at/with/of/down/on/into",
    allowedMinimalPairs: [
      ["can be broken down", "can break down"],
      ["be exposed to", "expose to"],
      ["is looked after", "looks after"],
    ],
    rejectConditions: ["전치사 삭제", "구동사 전체를 길게 반복", "분사 수식과 같은 span"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_SVOO_PASSIVE",
    subtype: "PREP_TO_FOR",
    priority: "CORE",
    transitivityRule: "직접목적어가 주어가 되면 동사별 to/for만 허용",
    subjectRole: "사물이 주어이고 수령인은 전치사 뒤다",
    auxiliaryPattern: "be + given/sent/bought + to/for",
    requiredParticle: "to 또는 for",
    allowedMinimalPairs: [["to", "for"]],
    rejectConditions: ["IO 주어와 DO 주어가 둘 다 가능한 문장 선택", "전치사 없는 4형식 수동 전체를 다시 씀"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_SVOC_PASSIVE",
    subtype: "COMPLEMENT_KEPT",
    priority: "CORE",
    transitivityRule: "목적격보어는 수동 뒤에도 남는다",
    subjectRole: "원래 목적어가 주어가 되고 보어는 뒤에 남는다",
    auxiliaryPattern: "be + kept/found/called/elected + C",
    requiredParticle: "",
    allowedMinimalPairs: [],
    rejectConditions: ["두 수동이 모두 가능", "사역 to V와 같은 span", "분사 목적격보어와 같은 span"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_BE_MADE_TO",
    subtype: "MADE_TO_V",
    priority: "MANDATORY",
    transitivityRule: "make O V의 수동은 O be made to V",
    subjectRole: "원래 목적어가 주어가 된다",
    auxiliaryPattern: "be + made + to + 동사원형",
    requiredParticle: "to",
    allowedMinimalPairs: [["made to move", "made move"]],
    rejectConditions: ["원형만 남김", "made to order 같은 관용과 혼동", "능동 make O V와 같은 span"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_BE_SEEN_TO",
    subtype: "SEEN_TO_V",
    priority: "CORE",
    transitivityRule: "see/hear O V의 수동은 O be seen/heard to V",
    subjectRole: "원래 목적어가 주어가 된다",
    auxiliaryPattern: "be + seen/heard + to + 동사원형",
    requiredParticle: "to",
    allowedMinimalPairs: [["seen to enter", "seen enter"]],
    rejectConditions: ["to 삭제", "지각 능동 O V와 같은 span", "둘 다 가능한 to/원형"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_NONFINITE_PASSIVE",
    subtype: "SAID_TO",
    priority: "CORE",
    transitivityRule: "that절 목적어 타동사의 인칭 수동은 be said to",
    subjectRole: "절의 주어가 인칭 수동의 주어가 된다",
    auxiliaryPattern: "be + said/believed/known + to",
    requiredParticle: "to",
    allowedMinimalPairs: [["said to", "said"]],
    rejectConditions: ["to V와 to have p.p.가 둘 다 가능", "It is said that과 인칭 수동을 의미로만 대립", "준동사 to be p.p.와 같은 span"],
    referenceChapter: "CH03",
  },
  {
    code: "VOICE_CAUSATIVE_HAVE_GET",
    subtype: "HAVE_GET_PP",
    priority: "CORE",
    transitivityRule: "have/get O p.p.는 목적어가 당하는 동작이다",
    subjectRole: "have/get의 목적어가 보어 동작의 대상이다",
    auxiliaryPattern: "have/get + O + p.p.",
    requiredParticle: "",
    allowedMinimalPairs: [["repaired", "repair"]],
    rejectConditions: ["분사 목적격보어와 같은 span", "have O V와 p.p.가 둘 다 가능"],
    referenceChapter: "CH03",
  },
];

export type VoiceHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const BE = "am|is|are|was|were";
const MODAL = "can|could|may|might|must|shall|should|will|would";
const HAVE = "has|have|had";
const INTRANSITIVE = new Set([
  "happen",
  "occur",
  "arrive",
  "disappear",
  "appear",
  "rise",
  "fall",
  "die",
  "exist",
  "consist",
  "belong",
  "remain",
  "emerge",
  "vanish",
  "arise",
  "occur",
]);
const STATIVE = new Set([
  "interested",
  "satisfied",
  "excited",
  "bored",
  "tired",
  "worried",
  "surprised",
  "married",
  "located",
  "based",
  "related",
  "concerned",
  "pleased",
  "disappointed",
  "accustomed",
  "delighted",
  "frightened",
  "amazed",
  "annoyed",
  "confused",
  "suited",
  "embarrassed",
  "thrilled",
  "shocked",
  "exhausted",
  "relaxed",
]);
const TO_VERB = new Set(["give", "send", "show", "lend", "offer", "teach", "bring", "pass", "hand", "write"]);
const FOR_VERB = new Set(["buy", "cook", "save", "choose", "get"]);
const CAUSATIVE_VERB = new Set([
  "move",
  "wait",
  "leave",
  "work",
  "believe",
  "think",
  "speak",
  "sit",
  "stand",
  "stay",
  "go",
  "stop",
  "listen",
  "apologize",
  "study",
  "write",
]);
const PERCEPTION_VERB = new Set([
  "enter",
  "leave",
  "go",
  "come",
  "walk",
  "run",
  "speak",
  "take",
  "open",
  "close",
  "cry",
  "laugh",
  "approach",
  "cross",
  "sing",
]);
const PARTICLE = "after|down|up|off|out|on|at|with|into|over";
const PHRASAL_PAIRS: Array<[string, string]> = [
  ["broken", "down"],
  ["looked", "after"],
  ["spoken", "to"],
  ["laughed", "at"],
  ["dealt", "with"],
  ["cared", "for"],
  ["listened", "to"],
  ["exposed", "to"],
  ["depended", "on"],
  ["relied", "on"],
  ["referred", "to"],
  ["called", "off"],
  ["brought", "up"],
  ["pointed", "out"],
  ["handed", "in"],
  ["put", "off"],
  ["accounted", "for"],
  ["looked", "into"],
  ["turned", "down"],
];

const PP_BASE: Record<string, string> = {
  held: "hold",
  done: "do",
  broken: "break",
  taken: "take",
  given: "give",
  made: "make",
  seen: "see",
  spoken: "speak",
  written: "write",
  said: "say",
  meant: "mean",
  begun: "begin",
  chosen: "choose",
  driven: "drive",
  eaten: "eat",
  shown: "show",
  known: "know",
  grown: "grow",
  drawn: "draw",
  worn: "wear",
  hidden: "hide",
  sent: "send",
  spent: "spend",
  built: "build",
  felt: "feel",
  kept: "keep",
  left: "leave",
  lost: "lose",
  sold: "sell",
  told: "tell",
  bought: "buy",
  thought: "think",
  brought: "bring",
  caught: "catch",
  taught: "teach",
  lent: "lend",
  paid: "pay",
  laid: "lay",
  led: "lead",
  heard: "hear",
  found: "find",
  bound: "bind",
  dealt: "deal",
  fed: "feed",
  met: "meet",
  won: "win",
  understood: "understand",
  put: "put",
  cut: "cut",
  set: "set",
  let: "let",
  hit: "hit",
  hurt: "hurt",
  cost: "cost",
  spread: "spread",
  shut: "shut",
  read: "read",
  accepted: "accept",
  recommended: "recommend",
  intended: "intend",
  exposed: "expose",
  deceived: "deceive",
  looked: "look",
  laughed: "laugh",
  listened: "listen",
  depended: "depend",
  relied: "rely",
  referred: "refer",
  pointed: "point",
  handed: "hand",
  accounted: "account",
  turned: "turn",
  called: "call",
  supposed: "suppose",
  obliged: "oblige",
  repaired: "repair",
  fixed: "fix",
  cleaned: "clean",
  washed: "wash",
  painted: "paint",
  misrepresented: "misrepresent",
  published: "publish",
  used: "use",
  created: "create",
  moved: "move",
  lived: "live",
  elected: "elect",
  named: "name",
  appointed: "appoint",
  believed: "believe",
  reported: "report",
  expected: "expect",
  considered: "consider",
};

export function detectVoiceCh03(text: string): VoiceHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: VoiceHit[] = [];
  detectIdiom(source, hits);
  detectMadeTo(source, hits);
  detectSeenTo(source, hits);
  detectPhrasal(source, hits);
  detectProgressive(source, hits);
  detectPerfect(source, hits);
  detectModal(source, hits);
  detectSvoo(source, hits);
  detectSvoc(source, hits);
  detectReporting(source, hits);
  detectHaveGet(source, hits);
  detectSimpleBy(source, hits);
  detectNonQuestion(source, hits);
  return dedupe(hits);
}

export function voiceLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span || lower === "held") return null;
  if (code === "VOICE_BE_MADE_TO" || code === "CAUSATIVE_PASSIVE") {
    if (lower === "to move") return "move";
    if (lower === "to") return "∅";
  }
  if (/^(?:am|is|are|was|were)\s+being\s+[a-z]+$/i.test(span)) {
    return flipProgressive(span);
  }
  if (/^(?:has|have|had)\s+been\s+[a-z]+$/i.test(span)) {
    return span.replace(/\s+been\b/i, "");
  }
  if (/^(?:can|could|may|might|must|shall|should|will|would)\s+be\s+[a-z]+(?:\s+[a-z]+)?$/i.test(span)) {
    return flipModal(span);
  }
  if (/^made\s+to\s+[a-z]+$/i.test(span)) return span.replace(/\s+to\b/i, "");
  if (/^(?:seen|heard|watched|noticed|observed|felt)\s+to\s+[a-z]+$/i.test(span)) {
    return span.replace(/\s+to\b/i, "");
  }
  if (code === "VOICE_SVOO_PASSIVE" && lower === "to") return "for";
  if (code === "VOICE_SVOO_PASSIVE" && lower === "for") return "to";
  if (/^(?:said|believed|known|reported|thought|expected)\s+to$/i.test(span)) {
    return span.replace(/\s+to$/i, "");
  }
  if (/^(?:am|is|are|was|were)(?:\s+not)?\s+(?:meant|intended|supposed|obliged|bound)\s+to$/i.test(span)) {
    return flipIdiom(span);
  }
  if (/^(?:be|been|am|is|are|was|were)\s+exposed\s+to$/i.test(span)) {
    return flipExposed(span);
  }
  if (/^(?:am|is|are|was|were)\s+[a-z]+\s+(?:after|down|up|off|out|on|at|with|into|over)$/i.test(span)) {
    return flipSimplePhrasal(span);
  }
  if (/^(?:am|is|are|was|were)\s+[a-z]+$/i.test(span) && code.startsWith("VOICE_")) {
    return flipSimpleBe(span);
  }
  const base = ppToBase(lower);
  if (code === "VOICE_CAUSATIVE_HAVE_GET" && base && base !== lower) return base;
  return null;
}

export function rejectVoiceChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | "MECHANICAL_MODAL_FORM" | "UNREALISTIC_LEARNER_ERROR" | "FUNCTION_WORD_OR_ARGUMENT_DROPPED" | "MULTI_AXIS_EDIT" | null {
  if (!input.pointCode.startsWith("VOICE_")) return null;
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();
  const pair = [correct, wrong].map((s) => s.toLowerCase()).sort().join("|");
  if (correct.split(/\s+/).length > 5 || wrong.split(/\s+/).length > 5) return "NON_MINIMAL_SPAN";
  if (pair === "tries|try") return "MECHANICAL_MODAL_FORM";
  if (pair === "by|with" || pair === "by|from" || pair === "from|with") return "MEANING_ONLY_CONTRAST";
  if (/\bbeing\s+[a-z]*ing\b/i.test(wrong) && !/\bbeing\s+(?:interesting|exciting|surprising)\b/i.test(wrong)) {
    return "UNREALISTIC_LEARNER_ERROR";
  }
  if (input.sentence.includes(correct)) {
    const assembled = input.sentence.replace(correct, wrong);
    if (/\b(?:am|is|are|was|were)\s+being\s+[a-z]*ing\b/i.test(assembled)) {
      return "UNREALISTIC_LEARNER_ERROR";
    }
  }
  if (dropsParticle(correct, wrong)) return "FUNCTION_WORD_OR_ARGUMENT_DROPPED";
  if (isSpellingOnly(correct, wrong)) return "UNREALISTIC_LEARNER_ERROR";
  return null;
}

function detectIdiom(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(${BE})(?:\\s+not)?\\s+(meant|intended|supposed|obliged|bound)\\s+to\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const span = match[0];
    push(hits, "VOICE_ACTIVE_PASSIVE", "PASSIVE_IDIOM", span, match.index ?? 0, true);
  }
}

function detectMadeTo(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(?:${BE})\\s+made\\s+to\\s+([a-z]+)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const verb = (match[1] ?? "").toLowerCase();
    if (!CAUSATIVE_VERB.has(verb)) continue;
    const span = `made to ${match[1]}`;
    push(hits, "VOICE_BE_MADE_TO", "MADE_TO_V", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectSeenTo(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(?:${BE})\\s+(seen|heard|watched|noticed|observed|felt)\\s+to\\s+([a-z]+)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const verb = (match[2] ?? "").toLowerCase();
    if (!PERCEPTION_VERB.has(verb)) continue;
    const span = `${match[1]} to ${match[2]}`;
    push(hits, "VOICE_BE_SEEN_TO", "SEEN_TO_V", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectPhrasal(text: string, hits: VoiceHit[]) {
  const care = new RegExp(`\\b((?:${MODAL})\\s+be|${BE}|be|been)\\s+taken\\s+care\\s+of\\b`, "gi");
  for (const match of text.matchAll(care)) {
    push(hits, "VOICE_PHRASAL_VERB_PASSIVE", "PHRASAL_PARTICLE", match[0], match.index ?? 0, true);
  }
  const exposed = new RegExp(`\\b(be|been|${BE})\\s+exposed\\s+to\\b`, "gi");
  for (const match of text.matchAll(exposed)) {
    push(hits, "VOICE_PHRASAL_VERB_PASSIVE", "EXPOSED_TO", match[0], match.index ?? 0, true);
  }
  const pair = new RegExp(
    `\\b((?:${MODAL})\\s+be|(?:${HAVE})\\s+been|${BE}|be)\\s+([a-z]+)\\s+(${PARTICLE})\\b`,
    "gi"
  );
  for (const match of text.matchAll(pair)) {
    const verb = (match[2] ?? "").toLowerCase();
    const particle = (match[3] ?? "").toLowerCase();
    if (!isListedPhrasal(verb, particle)) continue;
    if (verb === "exposed" && particle === "to") continue;
    push(hits, "VOICE_PHRASAL_VERB_PASSIVE", "PHRASAL_PARTICLE", match[0], match.index ?? 0, true);
  }
}

function detectProgressive(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(${BE})\\s+being\\s+([a-z]+)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const pp = (match[2] ?? "").toLowerCase();
    if (STATIVE.has(pp) || isIntransitivePp(pp) || !ppToBase(pp)) continue;
    const span = `${match[1]} being ${match[2]}`;
    push(hits, "VOICE_PROGRESSIVE_PASSIVE", "PROGRESSIVE_BEING", span, match.index ?? 0, true);
  }
}

function detectPerfect(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(${HAVE})\\s+been\\s+([a-z]+)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const pp = (match[2] ?? "").toLowerCase();
    if (STATIVE.has(pp) || isIntransitivePp(pp) || !ppToBase(pp)) continue;
    const after = text.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 24);
    if (new RegExp(`^\\s+(?:${PARTICLE})\\b`, "i").test(after)) continue;
    if (!/^\s+by\b/i.test(after)) continue;
    const span = `${match[1]} been ${match[2]}`;
    push(hits, "VOICE_PERFECT_PASSIVE", "PERFECT_BEEN", span, match.index ?? 0, true);
  }
}

function detectModal(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(${MODAL})\\s+be\\s+([a-z]+)\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const pp = (match[2] ?? "").toLowerCase();
    if (STATIVE.has(pp) || isIntransitivePp(pp) || !ppToBase(pp)) continue;
    const after = text.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 28);
    if (new RegExp(`^\\s+(?:${PARTICLE})\\b`, "i").test(after)) continue;
    if (pp === "exposed" && /^\s+to\b/i.test(after)) continue;
    if (!/^\s+by\b/i.test(after)) continue;
    const span = `${match[1]} be ${match[2]}`;
    push(hits, "VOICE_MODAL_PASSIVE", "MODAL_BE_PP", span, match.index ?? 0, true);
  }
}

function detectSvoo(text: string, hits: VoiceHit[]) {
  const to = new RegExp(`\\b(?:${BE})\\s+(given|sent|shown|lent|offered|taught|brought|passed|handed|written)\\s+(to)\\s+(?:her|him|them|us|me|you)\\b`, "gi");
  for (const match of text.matchAll(to)) {
    const lemma = ppToBase(match[1] ?? "");
    if (!lemma || !TO_VERB.has(lemma)) continue;
    push(hits, "VOICE_SVOO_PASSIVE", "PREP_TO_FOR", match[2] ?? "to", indexOfSpan(text, match[2] ?? "to", match.index ?? 0), true);
  }
  const forPrep = new RegExp(`\\b(?:${BE})\\s+(bought|cooked|saved|chosen)\\s+(for)\\s+(?:her|him|them|us|me|you)\\b`, "gi");
  for (const match of text.matchAll(forPrep)) {
    push(hits, "VOICE_SVOO_PASSIVE", "PREP_TO_FOR", match[2] ?? "for", indexOfSpan(text, match[2] ?? "for", match.index ?? 0), true);
  }
  const io = new RegExp(`\\b(?:${BE})\\s+(given|offered|shown|sent|told)\\s+(?:a|an|the)\\s+[A-Za-z]+\\b`, "gi");
  for (const match of text.matchAll(io)) {
    push(hits, "VOICE_SVOO_PASSIVE", "IO_SUBJECT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectSvoc(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(?:${BE})\\s+(called|elected|named|appointed|kept|found)\\s+(?:a|an|the\\s+)?[A-Za-z]+\\b`, "gi");
  for (const match of text.matchAll(re)) {
    if (/\bto\s+[a-z]+\b/i.test(match[0])) continue;
    push(hits, "VOICE_SVOC_PASSIVE", "COMPLEMENT_KEPT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectReporting(text: string, hits: VoiceHit[]) {
  const it = new RegExp(`\\bIt\\s+(?:is|was)\\s+(said|believed|known|reported|thought|expected)\\s+that\\b`, "gi");
  for (const match of text.matchAll(it)) {
    push(hits, "VOICE_NONFINITE_PASSIVE", "IT_IS_SAID", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  const person = new RegExp(`\\b(?:${BE})\\s+(said|believed|known|reported|thought|expected)\\s+to\\s+(?:be|have)\\b`, "gi");
  for (const match of text.matchAll(person)) {
    const span = `${match[1]} to`;
    push(hits, "VOICE_NONFINITE_PASSIVE", "SAID_TO", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectHaveGet(text: string, hits: VoiceHit[]) {
  const re = /\b(?:have|has|had|get|gets|got)\s+(?:the|a|an|his|her|their|my|our)\s+[A-Za-z]+\s+(repaired|fixed|cleaned|washed|painted)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "VOICE_CAUSATIVE_HAVE_GET", "HAVE_GET_PP", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectSimpleBy(text: string, hits: VoiceHit[]) {
  const re = new RegExp(`\\b(${BE})\\s+([a-z]+)\\s+by\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const pp = (match[2] ?? "").toLowerCase();
    const before = text.slice(Math.max(0, (match.index ?? 0) - 8), match.index ?? 0);
    if (/\b(?:being|been)\s+$/i.test(`${before}${match[1]} `) || /\bbeing\b/i.test(text.slice((match.index ?? 0), (match.index ?? 0) + match[0].length))) continue;
    if (text.slice(match.index ?? 0, (match.index ?? 0) + 12).toLowerCase().includes("being")) continue;
    if (STATIVE.has(pp) || isIntransitivePp(pp) || !ppToBase(pp)) continue;
    if (["meant", "intended", "supposed", "made", "seen", "heard"].includes(pp)) continue;
    const span = `${match[1]} ${match[2]}`;
    if (hits.some((hit) => Math.abs(hit.occurrenceIndex - (match.index ?? 0)) < 4 && hit.questionable)) continue;
    push(hits, "VOICE_ACTIVE_PASSIVE", "SIMPLE_BE_PP", span, match.index ?? 0, true);
  }
}

function detectNonQuestion(text: string, hits: VoiceHit[]) {
  if (/\b(?:happen|happened|occur|occurred|arrive|arrived|disappear|disappeared|take place|took place)\b/i.test(text)) {
    push(hits, "VOICE_ACTIVE_PASSIVE", "INTRANSITIVE", "happen", text.search(/\b(?:happen|occur|arrive|disappear|take place|took place)\b/i), false);
  }
  const stative = new RegExp(`\\b(?:${BE})\\s+(?:well\\s+)?(${[...STATIVE].join("|")})\\b`, "gi");
  for (const match of text.matchAll(stative)) {
    push(hits, "VOICE_ACTIVE_PASSIVE", "STATIVE_ADJECTIVE", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  if (/\b(?:can|could|may|might)\s+(?:misrepresent|break down|represent)\b/i.test(text) && !/\bbe\s+misrepresented\b/i.test(text)) {
    push(hits, "VOICE_MODAL_PASSIVE", "BOTH_POSSIBLE", "can", text.search(/\b(?:can|could|may|might)\b/i), false);
  }
}

function flipProgressive(span: string): string | null {
  const match = /^(am|is|are|was|were)\s+being\s+([a-z]+)$/i.exec(span.trim());
  if (!match) return null;
  const ing = ppToIng(match[2] ?? "");
  if (!ing) return null;
  return `${match[1]} ${ing}`;
}

function flipModal(span: string): string | null {
  const match = /^(can|could|may|might|must|shall|should|will|would)\s+be\s+([a-z]+)(?:\s+([a-z]+))?$/i.exec(span.trim());
  if (!match) return null;
  const base = ppToBase(match[2] ?? "");
  if (!base) return null;
  const particle = match[3] ? ` ${match[3]}` : "";
  return `${match[1]} ${base}${particle}`;
}

/**
 * be supposed/obliged/bound to의 능동형은 비문이라 오답이 된다(suppose to live).
 * be meant/intended to는 능동형(mean to, intend to)도 뜻만 다른 정문이라 넣지 않는다
 * (관측: we are meant to live / we mean to live가 둘 다 맞는 문항으로 새어 나왔다).
 */
function flipIdiom(span: string): string | null {
  const match = /^(am|is|are|was|were)(\s+not)?\s+(supposed|obliged|bound)\s+to$/i.exec(span.trim());
  if (!match) return null;
  const base = ppToBase(match[3] ?? "");
  if (!base) return null;
  const neg = match[2] ? " not" : "";
  if (neg && /^(?:is|was)$/i.test(match[1] ?? "")) return `does${neg} ${base} to`;
  if (neg) return `do${neg} ${base} to`;
  if (/^(?:is|was)$/i.test(match[1] ?? "")) return `${base}s to`;
  return `${base} to`;
}

function flipExposed(span: string): string | null {
  const lower = span.trim().toLowerCase();
  if (lower === "be exposed to" || lower === "been exposed to") return "expose to";
  if (lower === "is exposed to" || lower === "was exposed to") return "exposes to";
  if (lower === "are exposed to" || lower === "were exposed to" || lower === "am exposed to") return "expose to";
  return null;
}

function flipSimplePhrasal(span: string): string | null {
  const match = /^(am|is|are|was|were)\s+([a-z]+)\s+([a-z]+)$/i.exec(span.trim());
  if (!match) return null;
  const base = ppToBase(match[2] ?? "");
  if (!base) return null;
  const be = (match[1] ?? "").toLowerCase();
  const particle = match[3] ?? "";
  if (be === "is" || be === "was") return `${third(base)} ${particle}`;
  return `${base} ${particle}`;
}

function flipSimpleBe(span: string): string | null {
  const match = /^(am|is|are|was|were)\s+([a-z]+)$/i.exec(span.trim());
  if (!match) return null;
  const base = ppToBase(match[2] ?? "");
  if (!base) return null;
  const be = (match[1] ?? "").toLowerCase();
  if (be === "is") return third(base);
  if (be === "are" || be === "am") return base;
  return ppForm(base);
}

function third(base: string): string {
  if (base.endsWith("y") && !/[aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh|o)$/i.test(base)) return `${base}es`;
  return `${base}s`;
}

function ppForm(base: string): string {
  const known = Object.entries(PP_BASE).find(([, lemma]) => lemma === base);
  return known?.[0] ?? `${base}ed`;
}

/**
 * -ed를 떼고 남은 어간에 묵음 e를 되돌린다.
 *
 * 떼기만 하면 admired -> admir, used -> us, changed -> chang이 되어 is admired의
 * 능동형 오답이 "admir"라는 없는 철자로 나왔다(대표 문항 검사에서 발견). 영어 철자
 * 규칙으로 e가 확실히 붙는 어미만 되돌린다. visited/limited, opened/happened,
 * answered/considered, developed처럼 e 없이 끝나는 동사와 갈리지 않는 어미
 * (-ited, -ned, -ered, -ped)는 건드리지 않는다.
 */
const E_FINAL_ITE = new Set(["invit", "unit", "excit", "recit", "ignit", "cit", "delet", "complet"]);
const NO_E_US = new Set(["focus", "bias", "canvas"]);

function restoreSilentE(stem: string): string {
  if (E_FINAL_ITE.has(stem)) return `${stem}e`;
  if (NO_E_US.has(stem)) return stem;
  if (/(?:v|z|c|dg|ang|eng|[^s]s|[aiou]r|[aiou]t|[aiou]d|[aiou]k|[aiou]l|[aiou]m|in|at)$/.test(stem)) {
    if (/(?:it|er|ss)$/.test(stem)) return stem;
    // 이중모음 뒤 자음(treated, looked, failed, seemed, rained)은 e가 없다.
    // qu는 자음으로 읽는다(required, acquired).
    if (/[aeiou]{2}[^aeiou]$/.test(stem) && !/[aeiou]{2}s$/.test(stem) && !/qu[aeiou][^aeiou]$/.test(stem)) {
      return stem;
    }
    return `${stem}e`;
  }
  return stem;
}

function ppToBase(pp: string): string | null {
  const w = pp.toLowerCase();
  if (PP_BASE[w]) return PP_BASE[w];
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ed") && w.length > 4) {
    const stem = w.slice(0, -2);
    const last = stem.at(-1) ?? "";
    /**
     * -ed를 떼면 자음이 겹쳐 남는 것은 두 가지다 — 어미변화로 겹친 것(stopped -> stop,
     * controlled -> control)과 원래 겹자음인 것(obsessed -> obsess, passed -> pass).
     * 영어는 어미변화로 s를 겹치지 않으므로 s만은 벗기지 않는다.
     *
     * 예전에는 obsessed -> obses가 되어 is obsessed의 능동형이 obseses라는 없는
     * 철자로 나왔다. 로컬 후보는 위험도가 낮아 검수 호출을 타지 않고, 블라인드
     * 유일성 판정은 없는 낱말을 "비문"으로 보아 통과시키므로 여기서 막아야 한다.
     */
    if (
      stem.length >= 3 &&
      last === stem.at(-2) &&
      last !== "s" &&
      !/[aeiou]/.test(last)
    ) {
      return stem.slice(0, -1);
    }
    return restoreSilentE(stem);
  }
  return null;
}

function ppToIng(pp: string): string | null {
  const base = ppToBase(pp);
  if (!base) return null;
  if (base.endsWith("ie")) return `${base.slice(0, -2)}ying`;
  if (base.endsWith("e") && !base.endsWith("ee")) return `${base.slice(0, -1)}ing`;
  if (/[^aeiou][aeiou][^aeiouwxy]$/i.test(base)) return `${base}${base.at(-1)}ing`;
  return `${base}ing`;
}

function isIntransitivePp(pp: string): boolean {
  const base = ppToBase(pp);
  return Boolean(base && INTRANSITIVE.has(base));
}

function isListedPhrasal(verb: string, particle: string): boolean {
  return PHRASAL_PAIRS.some(([v, p]) => v === verb && p === particle);
}

function dropsParticle(correct: string, wrong: string): boolean {
  const c = correct.trim().toLowerCase().split(/\s+/);
  const w = wrong.trim().toLowerCase().split(/\s+/);
  if (c.length < 2 || w.length !== c.length - 1) return false;
  const last = c[c.length - 1] ?? "";
  if (!/^(?:after|down|up|off|out|on|at|with|of|into|to|for|over)$/.test(last)) return false;
  // is said to be / is said be: 준동사 수동에서 to를 빼는 것은 대표 오답이다(규칙의 허용 쌍).
  if (last === "to" && /^(?:said|believed|known|reported|thought|expected|supposed|considered|seen|heard|made)$/.test(c[0] ?? "")) {
    return false;
  }
  return c.slice(0, -1).join(" ") === w.join(" ");
}

function isSpellingOnly(a: string, b: string): boolean {
  const left = a.toLowerCase().replace(/[^a-z]/g, "");
  const right = b.toLowerCase().replace(/[^a-z]/g, "");
  if (!left || left === right || left.length !== right.length) return false;
  let diffs = 0;
  for (let i = 0; i < left.length; i += 1) if (left[i] !== right[i]) diffs += 1;
  return diffs === 1;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: VoiceHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: VoiceHit[]): VoiceHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
