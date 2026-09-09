import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ParticipleCh08Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  logicalSubjectRule: string;
  voiceRelation: string;
  timeRelation: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH08";
};

export const PARTICIPLE_CH08_RULES: ParticipleCh08Rule[] = [
  {
    code: "PARTICIPLE_NOUN_MODIFIER",
    subtype: "NOUN_MODIFIER",
    priority: "MANDATORY",
    logicalSubjectRule: "분사가 수식하는 명사가 의미상 주어다",
    voiceRelation: "능동이면 현재분사, 수동·완료이면 과거분사",
    timeRelation: "명사 수식 분사는 문장 시제와 따로 출제하지 않는다",
    allowedMinimalPairs: [
      ["published", "publishing"],
      ["employed", "employing"],
      ["stating", "stated"],
    ],
    rejectConditions: ["동명사", "진행형", "be + p.p. 수동태", "능동·수동 모두 가능"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPLE_SUBJECT_COMPLEMENT",
    subtype: "SUBJECT_COMPLEMENT",
    priority: "MANDATORY",
    logicalSubjectRule: "주격보어 분사의 의미상 주어는 문장 주어다",
    voiceRelation: "주어가 감정·상태의 대상이면 과거분사",
    timeRelation: "보어 분사는 진행 be + -ing와 구분한다",
    allowedMinimalPairs: [["suited", "suiting"], ["closed", "closing"]],
    rejectConditions: ["진행형", "수동태 본동사", "감정분사는 감정 코드로 분류"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPLE_OBJECT_COMPLEMENT",
    subtype: "OBJECT_COMPLEMENT",
    priority: "MANDATORY",
    logicalSubjectRule: "목적격보어 분사의 의미상 주어는 목적어다",
    voiceRelation: "목적어와 능동이면 -ing, 수동·상태이면 p.p.",
    timeRelation: "목적격보어는 본동사 시제와 같이 바꾸지 않는다",
    allowedMinimalPairs: [["broken", "breaking"], ["playing", "played"]],
    rejectConditions: ["동명사 목적어", "관계 불분명"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPLE_EMOTION",
    subtype: "EMOTION",
    priority: "MANDATORY",
    logicalSubjectRule: "감정을 느끼는 사람은 -ed, 원인을 주는 대상은 -ing",
    voiceRelation: "감정 유발과 감정 경험은 서로 반대 형태다",
    timeRelation: "감정분사는 시제 문제가 아니다",
    allowedMinimalPairs: [["frightened", "frightening"]],
    rejectConditions: ["사람·사물 역할이 불분명", "철자만 다른 형태"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPIAL_CLAUSE_ACTIVE",
    subtype: "ACTIVE_CLAUSE",
    priority: "MANDATORY",
    logicalSubjectRule: "분사구문의 의미상 주어는 주절 주어와 일치해야 한다",
    voiceRelation: "주절 주어가 행위 주체이면 V-ing",
    timeRelation: "본절과 거의 같은 때. 선후가 분명하면 완료 분사구문",
    allowedMinimalPairs: [["opening", "opened"], ["speaking", "spoken"]],
    rejectConditions: ["현수 분사", "동명사 주어", "시간 관계 불분명", "접속사 의미 추측"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPIAL_CLAUSE_PERFECT",
    subtype: "PERFECT",
    priority: "MANDATORY",
    logicalSubjectRule: "완료 분사구문의 의미상 주어는 주절 주어와 일치한다",
    voiceRelation: "목적어가 있으면 Having p.p., 주어가 대상이면 Having been p.p.",
    timeRelation: "본절보다 먼저 완료된 동작",
    allowedMinimalPairs: [["Having finished", "Having been finished"]],
    rejectConditions: ["시간 관계가 불분명한 V-ing / Having p.p.", "시제와 태를 동시에 변경"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPIAL_CLAUSE_PASSIVE",
    subtype: "PASSIVE_CLAUSE",
    priority: "MANDATORY",
    logicalSubjectRule: "주절 주어가 분사의 대상이어야 한다",
    voiceRelation: "수동 관계이면 p.p. 또는 Being p.p.",
    timeRelation: "완료 수동의 Having been p.p.와 구분한다",
    allowedMinimalPairs: [["written", "writing"], ["built", "building"]],
    rejectConditions: ["be + p.p. 본동사 수동태", "진행 수동태"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION",
    subtype: "CONJUNCTION_KEPT",
    priority: "MANDATORY",
    logicalSubjectRule: "접속사를 남겨도 의미상 주어는 주절 주어다",
    voiceRelation: "주절 주어와의 능동·수동으로 분사 형태를 고른다",
    timeRelation: "접속사 자체의 의미는 추측하지 않는다",
    allowedMinimalPairs: [["walking", "walked"], ["waiting", "waited"]],
    rejectConditions: ["접속사 선택만", "접속사와 분사 형태를 동시에 변경"],
    referenceChapter: "CH08",
  },
  {
    code: "ABSOLUTE_PARTICIPLE",
    subtype: "SUBJECT_KEPT",
    priority: "MANDATORY",
    logicalSubjectRule: "분사 앞 명사가 의미상 주어이고 주절 주어와 다르다",
    voiceRelation: "그 명사와의 능동·수동으로 분사를 고른다",
    timeRelation: "주절보다 앞선 완료는 having p.p.",
    allowedMinimalPairs: [["finished", "finishing"], ["being", "been"]],
    rejectConditions: ["주어를 지워 현수 분사로 만드는 대립", "절 전체 반복"],
    referenceChapter: "CH08",
  },
  {
    code: "WITH_OBJECT_PARTICIPLE",
    subtype: "WITH_OBJECT",
    priority: "MANDATORY",
    logicalSubjectRule: "with 뒤 명사가 분사의 의미상 주어다",
    voiceRelation: "명사와 수동·상태이면 p.p., 능동이면 V-ing",
    timeRelation: "with 구의 분사는 주절 시제와 같이 바꾸지 않는다",
    allowedMinimalPairs: [["closed", "closing"], ["crying", "cried"]],
    rejectConditions: ["전치사 목적어 동명사", "with 없는 분사구문과 혼동"],
    referenceChapter: "CH08",
  },
  {
    code: "PARTICIPIAL_CLAUSE_NEGATIVE",
    subtype: "NEGATIVE",
    priority: "MANDATORY",
    logicalSubjectRule: "Not 분사구문의 의미상 주어는 주절 주어다",
    voiceRelation: "주절 주어가 행위 주체이면 Not V-ing",
    timeRelation: "선후가 분명할 때만 Not having p.p.",
    allowedMinimalPairs: [["knowing", "known"]],
    rejectConditions: ["Not 위치만 다른 문항", "없는 형태"],
    referenceChapter: "CH08",
  },
  {
    code: "DANGLING_PARTICIPLE",
    subtype: "SUBJECT_MISMATCH",
    priority: "CORE",
    logicalSubjectRule: "의미상 주어가 주절 주어와 다르면 형태 대립 문항으로 만들지 않는다",
    voiceRelation: "불일치 자체는 분석만 남긴다",
    timeRelation: "주어를 고치면서 분사 형태를 같이 바꾸지 않는다",
    allowedMinimalPairs: [],
    rejectConditions: ["현수 분사를 능동·수동 대립으로 출제", "주어와 형태를 동시에 변경"],
    referenceChapter: "CH08",
  },
];

export type ParticipleHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const PREP = "by|of|for|from|without|about|after|before|instead of|on|at|in";
const BE = "am|is|are|was|were|be|been|being";
const EMOTION_ING =
  "frightening|interesting|boring|exciting|surprising|confusing|amazing|tiring|disappointing|satisfying|shocking|annoying|embarrassing|pleasing|worrying|relaxing|terrifying";
const EMOTION_ED =
  "frightened|interested|bored|excited|surprised|confused|amazed|tired|disappointed|satisfied|shocked|annoyed|embarrassed|pleased|worried|relaxed|terrified";
const PASSIVE_PP =
  "published|employed|stated|written|built|known|called|created|designed|promoted|used|given|taken|seen|closed|broken|locked|finished|suited|held";
const IDIOM =
  "generally speaking|frankly speaking|strictly speaking|roughly speaking|judging from|talking of|speaking of|weather permitting";

export function detectParticipleCh08(text: string): ParticipleHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: ParticipleHit[] = [];
  detectNonParticiple(source, hits);
  detectEmotion(source, hits);
  detectWithObject(source, hits);
  detectObjectComplement(source, hits);
  detectSubjectComplement(source, hits);
  detectNounModifier(source, hits);
  detectParticipialClauses(source, hits);
  detectIdiom(source, hits);
  detectAbsolute(source, hits);
  detectDangling(source, hits);
  return dedupe(hits);
}

export function participleLocalDistractor(code: string, sourceSpan: string): string | null {
  const lower = sourceSpan.trim().toLowerCase();
  if (code === "PARTICIPIAL_CLAUSE_PERFECT" && lower === "having finished") return "Having been finished";
  if (code === "PARTICIPIAL_CLAUSE_PERFECT" && lower === "having written") return "Having been written";
  const flipped = flipVoice(sourceSpan);
  if (!flipped || flipped.toLowerCase() === lower) return null;
  if (
    code.startsWith("PARTICIPLE_") ||
    code.startsWith("PARTICIPIAL_") ||
    code === "WITH_OBJECT_PARTICIPLE" ||
    code === "ABSOLUTE_PARTICIPLE"
  ) {
    return flipped;
  }
  return null;
}

export function rejectParticipleChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "NON_MINIMAL_SPAN" | "UNREALISTIC_LEARNER_ERROR" | null {
  const correct = input.correct.trim();
  const wrong = input.wrong.trim();
  if (correct.split(/\s+/).length > 4 || wrong.split(/\s+/).length > 5) return "NON_MINIMAL_SPAN";
  if (/ing?ing$/i.test(wrong) || /ing?ing$/i.test(correct)) return "UNREALISTIC_LEARNER_ERROR";
  if (/\bbeing\s+\w+/i.test(input.sentence) && /\b(?:am|is|are|was|were)\s+being\b/i.test(input.sentence) && input.pointCode.startsWith("PARTICIPLE")) {
    return "BOTH_GRAMMATICAL";
  }
  if (new RegExp(`\\b(?:${PREP})\\s+${correct}\\b`, "i").test(input.sentence) && input.pointCode.startsWith("PARTICIPLE")) {
    return "BOTH_GRAMMATICAL";
  }
  return null;
}

export function isParticipleCh08Code(code: string): boolean {
  return PARTICIPLE_CH08_RULES.some((rule) => rule.code === code);
}

function detectNonParticiple(text: string, hits: ParticipleHit[]) {
  const prep = new RegExp(`\\b(?:${PREP})\\s+([A-Za-z]+ing)\\b`, "gi");
  for (const match of text.matchAll(prep)) {
    const span = match[1] ?? "";
    if (!span || isEmotion(span)) continue;
    push(hits, "GERUND_PREPOSITION_OBJECT", "PREP_GERUND", span, indexOfSpan(text, span, match.index ?? 0), false);
  }
  const subject = /\b([A-Za-z]+ing)\s+(?:a|an|the)\s+[A-Za-z]+(?:\s+[A-Za-z]+){0,8}?\s+(?:may|might|can|will|must|is|are)\b/gi;
  for (const match of text.matchAll(subject)) {
    const at = match.index ?? 0;
    if (text.slice(at, at + (match[0].length)).includes(",")) continue;
    const span = match[1] ?? "";
    push(hits, "GERUND_SUBJECT", "GERUND_SUBJECT", span, at, false);
  }
  const pair = /\b([A-Za-z]+ing)\s+and\s+([A-Za-z]+ing)\b/gi;
  for (const match of text.matchAll(pair)) {
    const before = text.slice(Math.max(0, (match.index ?? 0) - 12), match.index ?? 0);
    if (/\b(?:the|a|an|this|these)\s+$/i.test(before)) continue;
    const span = `${match[1]} and ${match[2]}`;
    push(hits, "GERUND_SUBJECT", "GERUND_PARALLEL", span, match.index ?? 0, false);
  }
  const progressive = /\b(?:am|is|are|was|were)\s+being\s+([A-Za-z]+)\b/gi;
  for (const match of text.matchAll(progressive)) {
    const span = match[1] ?? "";
    push(hits, "VOICE_PROGRESSIVE_PASSIVE", "PROGRESSIVE_PASSIVE", span, indexOfSpan(text, span, match.index ?? 0), false);
  }
}

function detectEmotion(text: string, hits: ParticipleHit[]) {
  const feel = new RegExp(`\\b(?:feel|feels|felt|look|looks|seem|seems)\\s+(${EMOTION_ED})\\b`, "gi");
  for (const match of text.matchAll(feel)) {
    push(hits, "PARTICIPLE_EMOTION", "EXPERIENCER", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const cause = new RegExp(`\\b(?:a|an|the)\\s+(${EMOTION_ING})\\s+[A-Za-z]+\\b`, "gi");
  for (const match of text.matchAll(cause)) {
    push(hits, "PARTICIPLE_EMOTION", "CAUSE", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectWithObject(text: string, hits: ParticipleHit[]) {
  const re = /\bwith\s+(?:his|her|their|my|our|the|a|an)?\s*([A-Za-z]+)\s+(closed|closing|crying|cried|folded|broken|locked|open|waiting|running)\b/gi;
  for (const match of text.matchAll(re)) {
    const noun = (match[1] ?? "").toLowerCase();
    const part = match[2] ?? "";
    if (isPrepGerund(text, match.index ?? 0)) continue;
    if (!isClearWithRelation(noun, part)) continue;
    push(hits, "WITH_OBJECT_PARTICIPLE", "WITH_OBJECT", part, indexOfSpan(text, part, match.index ?? 0), true);
  }
}

function detectObjectComplement(text: string, hits: ParticipleHit[]) {
  const re = /\b(?:find|found|keep|kept|leave|left|hear|heard|see|saw|watch|watched|notice|noticed)\s+(?:the|a|an|his|her|their)?\s*([A-Za-z]+)\s+(broken|breaking|locked|locking|closed|closing|playing|played)\b/gi;
  for (const match of text.matchAll(re)) {
    const noun = (match[1] ?? "").toLowerCase();
    const part = match[2] ?? "";
    if (!isClearObjectRelation(noun, part)) continue;
    push(hits, "PARTICIPLE_OBJECT_COMPLEMENT", "OBJECT_COMPLEMENT", part, indexOfSpan(text, part, match.index ?? 0), true);
  }
}

function detectSubjectComplement(text: string, hits: ParticipleHit[]) {
  const suited = /\b(?:is|are|was|were)\s+well\s+suited\b/gi;
  for (const match of text.matchAll(suited)) {
    push(hits, "PARTICIPLE_SUBJECT_COMPLEMENT", "SUBJECT_COMPLEMENT", "suited", indexOfSpan(text, "suited", match.index ?? 0), true);
  }
  const re = /\b(?:remain|remains|remained|seem|seems|seemed)\s+(closed|open|locked|broken|hidden)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "PARTICIPLE_SUBJECT_COMPLEMENT", "SUBJECT_COMPLEMENT", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectNounModifier(text: string, hits: ParticipleHit[]) {
  const passive = new RegExp(`\\b([A-Za-z]+)\\s+(${PASSIVE_PP})\\s+(and|in|as|by|that)\\b`, "gi");
  for (const match of text.matchAll(passive)) {
    const noun = match[1] ?? "";
    const part = match[2] ?? "";
    if (isBeBefore(text, match.index ?? 0, noun)) continue;
    if (/^(he|she|we|they|i|you|it|and|or|who|which|that|am|is|are|was|were|be|been|being|have|has|had)$/i.test(noun)) continue;
    if (isEmotion(part)) continue;
    push(hits, "PARTICIPLE_NOUN_MODIFIER", "PASSIVE_POSTNOMINAL", part, indexOfSpan(text, part, match.index ?? 0), true);
  }
  const active = /\b([A-Za-z]+)\s+(stating|saying|showing|describing|holding|using)\s+(?:that|a|an|the)\b/gi;
  for (const match of text.matchAll(active)) {
    const noun = match[1] ?? "";
    const part = match[2] ?? "";
    if (isBeBefore(text, match.index ?? 0, noun)) continue;
    if (/^(he|she|we|they|i|you|by|of|for)$/i.test(noun)) continue;
    push(hits, "PARTICIPLE_NOUN_MODIFIER", "ACTIVE_POSTNOMINAL", part, indexOfSpan(text, part, match.index ?? 0), true);
  }
}

function detectParticipialClauses(text: string, hits: ParticipleHit[]) {
  const perfect = /\b(Having finished|Having written|Having completed)\s+(?:the|a|an|his|her|their)\s+[A-Za-z]+,/gi;
  for (const match of text.matchAll(perfect)) {
    const span = match[1] ?? "";
    if (!mainSubjectMatchesAgent(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "PARTICIPIAL_CLAUSE_PERFECT", "PERFECT_ACTIVE", span, match.index ?? 0, true);
  }
  const passive = /\b(Written|Built|Born|Seen)\s+(?:in|by|as)\s+[A-Za-z]+,/g;
  for (const match of text.matchAll(passive)) {
    const span = match[1] ?? "";
    if (!mainSubjectIsPatient(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "PARTICIPIAL_CLAUSE_PASSIVE", "PASSIVE_CLAUSE", span, match.index ?? 0, true);
  }
  const conj = /\b(?:When|While|After|Before)\s+(walking|waiting|reading|listening)\b[^,]*,/gi;
  for (const match of text.matchAll(conj)) {
    const span = match[1] ?? "";
    if (!mainSubjectMatchesAgent(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION", "CONJUNCTION_KEPT", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  const negative = /\bNot\s+(knowing|realizing|seeing)\b[^,]*,/g;
  for (const match of text.matchAll(negative)) {
    const span = match[1] ?? "";
    if (!mainSubjectMatchesAgent(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "PARTICIPIAL_CLAUSE_NEGATIVE", "NEGATIVE", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  const active = /\b(Opening|Entering|Holding|Crossing)\s+(?:the|a|an|his|her)\s+[A-Za-z]+,/g;
  for (const match of text.matchAll(active)) {
    const span = match[1] ?? "";
    if (!mainSubjectMatchesAgent(text, (match.index ?? 0) + match[0].length)) continue;
    push(hits, "PARTICIPIAL_CLAUSE_ACTIVE", "ACTIVE_CLAUSE", span, match.index ?? 0, true);
  }
}

function detectIdiom(text: string, hits: ParticipleHit[]) {
  const re = new RegExp(`\\b(${IDIOM})\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const phrase = match[1] ?? "";
    const part = phrase.split(/\s+/).pop() ?? phrase;
    const at = (match.index ?? 0) + phrase.toLowerCase().lastIndexOf(part.toLowerCase());
    push(hits, "PARTICIPIAL_CLAUSE_ACTIVE", "IDIOM", part, at, true);
  }
}

function detectAbsolute(text: string, hits: ParticipleHit[]) {
  const re = /\b(?:The|His|Her|Their|Its)\s+([A-Za-z]+)\s+(being|finished|done|permitting)\b[^,]*,/gi;
  for (const match of text.matchAll(re)) {
    const part = match[2] ?? "";
    push(hits, "ABSOLUTE_PARTICIPLE", "SUBJECT_KEPT", part, indexOfSpan(text, part, match.index ?? 0), true);
  }
}

function detectDangling(text: string, hits: ParticipleHit[]) {
  const re = /\b([A-Za-z]+ing)\s+(?:the|a|an|down|along|to)\s+[A-Za-z]+(?:\s+[A-Za-z]+)*,/gi;
  for (const match of text.matchAll(re)) {
    const span = match[1] ?? "";
    if (isIdiom(text, match.index ?? 0)) continue;
    const after = text.slice((match.index ?? 0) + match[0].length);
    const subject = after.match(/^\s*(?:the\s+)?([A-Za-z]+)/i)?.[1] ?? "";
    if (!subject || isAgentSubject(subject)) continue;
    push(hits, "DANGLING_PARTICIPLE", "SUBJECT_MISMATCH", span, match.index ?? 0, false);
  }
}

function isClearWithRelation(noun: string, part: string): boolean {
  const lower = part.toLowerCase();
  if (/(eye|eyes|door|window|mouth|book|arms)/.test(noun) && /^(closed|closing|folded|open|broken|locked)$/i.test(lower)) {
    return /^(closed|folded|open|broken|locked)$/i.test(lower);
  }
  if (/(baby|child|children|dog|crowd)/.test(noun) && /^(crying|running|waiting)$/i.test(lower)) return true;
  return false;
}

function isClearObjectRelation(noun: string, part: string): boolean {
  const lower = part.toLowerCase();
  if (/(door|window|glass|vase|phone|leg)/.test(noun) && /^(broken|locked|closed)$/i.test(lower)) return true;
  if (/(child|children|boy|girl|students|man|woman)/.test(noun) && lower === "playing") return true;
  return false;
}

function isBeBefore(text: string, at: number, noun: string): boolean {
  const before = text.slice(Math.max(0, at - 16), at + noun.length);
  return new RegExp(`\\b(?:${BE})\\s+(?:well\\s+|very\\s+)?$`, "i").test(before);
}

function mainSubjectMatchesAgent(text: string, at: number): boolean {
  const subject = text.slice(at).match(/^\s*([A-Za-z]+)/)?.[1] ?? "";
  return isAgentSubject(subject);
}

function mainSubjectIsPatient(text: string, at: number): boolean {
  const subject = text.slice(at).match(/^\s*(?:the\s+)?([A-Za-z]+)/i)?.[1] ?? "";
  return /^(letter|book|bridge|house|song|film|story|city|note|report)$/i.test(subject);
}

function isAgentSubject(word: string): boolean {
  return /^(she|he|they|we|i|you|students|people|john|mary|team)$/i.test(word);
}

function isPrepGerund(text: string, at: number): boolean {
  return new RegExp(`\\b(?:${PREP})\\s+$`, "i").test(text.slice(Math.max(0, at - 12), at));
}

function isEmotion(word: string): boolean {
  return new RegExp(`^(?:${EMOTION_ING}|${EMOTION_ED})$`, "i").test(word);
}

function isIdiom(text: string, at: number): boolean {
  return new RegExp(`(?:${IDIOM})`, "i").test(text.slice(Math.max(0, at - 20), at + 24));
}

function flipVoice(span: string): string | null {
  const lower = span.trim().toLowerCase();
  const map: Record<string, string> = {
    published: "publishing",
    publishing: "published",
    employed: "employing",
    employing: "employed",
    stated: "stating",
    stating: "stated",
    suited: "suiting",
    suiting: "suited",
    closed: "closing",
    closing: "closed",
    finished: "finishing",
    finishing: "finished",
    written: "writing",
    writing: "written",
    spoken: "speaking",
    speaking: "spoken",
    built: "building",
    building: "built",
    broken: "breaking",
    breaking: "broken",
    locked: "locking",
    locking: "locked",
    playing: "played",
    played: "playing",
    crying: "cried",
    cried: "crying",
    waiting: "waited",
    waited: "waiting",
    walking: "walked",
    walked: "walking",
    reading: "read",
    listening: "listened",
    knowing: "known",
    known: "knowing",
    opening: "opened",
    opened: "opening",
    entering: "entered",
    holding: "held",
    held: "holding",
    crossing: "crossed",
    judging: "judged",
    permitting: "permitted",
    realizing: "realized",
    seeing: "seen",
    being: "been",
    been: "being",
    done: "doing",
    frightened: "frightening",
    frightening: "frightened",
    interesting: "interested",
    interested: "interesting",
    boring: "bored",
    bored: "boring",
    exciting: "excited",
    excited: "exciting",
    surprising: "surprised",
    surprised: "surprising",
  };
  return map[lower] ?? null;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: ParticipleHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: ParticipleHit[]): ParticipleHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
