import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type SentenceCh01Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  sentencePattern: "SV" | "SVC" | "SVO" | "SVOO" | "SVOC";
  verbClass: string;
  requiredArgument: string;
  complementType: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  referenceChapter: "CH01";
  sharedForm?: string;
};

export const SENTENCE_CH01_RULES: SentenceCh01Rule[] = [
  {
    code: "SENTENCE_SV",
    subtype: "INTRANSITIVE",
    priority: "BASIC",
    sentencePattern: "SV",
    verbClass: "목적어가 필요 없는 완전자동사",
    requiredArgument: "주어 + 본동사",
    complementType: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["문형 이름만 묻는 문항", "단순 수 일치"],
    referenceChapter: "CH01",
  },
  {
    code: "SENTENCE_SVC",
    subtype: "LINKING_ADJ",
    priority: "CORE",
    sentencePattern: "SVC",
    verbClass: "be, become, remain, stay, seem, appear, look, sound, smell, taste, feel",
    requiredArgument: "주어를 설명하는 보어",
    complementType: "형용사 또는 명사",
    allowedMinimalPairs: [
      ["good", "well"],
      ["reasonable", "reasonably"],
      ["magnetic", "magnetically"],
    ],
    rejectConditions: ["부사가 동작 방식으로도 가능", "feel well", "look carefully"],
    referenceChapter: "CH01",
  },
  {
    code: "SENTENCE_SVO",
    subtype: "TRANSITIVE_OBJECT",
    priority: "CORE",
    sentencePattern: "SVO",
    verbClass: "목적어를 요구하는 타동사",
    requiredArgument: "직접목적어",
    complementType: "없음",
    allowedMinimalPairs: [],
    rejectConditions: ["목적어 전체를 길게 변경", "동사와 목적어를 동시에 변경", "문형 이름"],
    referenceChapter: "CH01",
  },
  {
    code: "VERB_TRANSITIVE_INTRANSITIVE",
    subtype: "BARE_OBJECT",
    priority: "CORE",
    sentencePattern: "SVO",
    verbClass: "discuss, approach, enter, reach, attend는 타동. listen, wait, belong는 전치사 필수",
    requiredArgument: "목적어 또는 필수 전치사",
    complementType: "없음",
    allowedMinimalPairs: [
      ["the issue", "about the issue"],
      ["the room", "into the room"],
    ],
    rejectConditions: ["의미 자체가 달라지는 두 구조", "enter into a contract", "문형 이름"],
    referenceChapter: "CH01",
  },
  {
    code: "SENTENCE_SVOO",
    subtype: "TO_PERSON",
    priority: "CORE",
    sentencePattern: "SVOO",
    verbClass: "give 계열은 사람+사물 가능. explain/describe/suggest는 사물+to 사람. provide는 with",
    requiredArgument: "간접목적어와 직접목적어, 또는 필수 전치사",
    complementType: "없음",
    allowedMinimalPairs: [
      ["to me", "me"],
      ["with", "∅"],
    ],
    rejectConditions: ["give me / give to me처럼 둘 다 가능", "목적어 전체 재작성"],
    referenceChapter: "CH01",
  },
  {
    code: "OBJECT_COMPLEMENT_NOUN_ADJ",
    subtype: "ADJ_OC",
    priority: "CORE",
    sentencePattern: "SVOC",
    verbClass: "make, keep, find + O + 형용사. call, name, elect, appoint + O + 명사",
    requiredArgument: "목적어의 상태·신분",
    complementType: "형용사 또는 명사",
    allowedMinimalPairs: [
      ["happy", "happily"],
      ["susceptible", "susceptibly"],
    ],
    rejectConditions: ["동작 방식 부사", "보어 전체를 길게 변경"],
    referenceChapter: "CH01",
  },
  {
    code: "OBJECT_COMPLEMENT_TO_V",
    subtype: "TO_V",
    priority: "CORE",
    sentencePattern: "SVOC",
    verbClass: "allow, enable, force, persuade, lead + O + to V",
    requiredArgument: "목적어의 행동",
    complementType: "to부정사",
    allowedMinimalPairs: [
      ["to participate", "participate"],
      ["to make", "make"],
    ],
    rejectConditions: ["help O V / help O to V", "be made to V는 CH03", "목적어와 to를 동시에 변경"],
    referenceChapter: "CH01",
    sharedForm: "OBJECT_COMPLEMENT_TO_V",
  },
  {
    code: "CAUSATIVE_ACTIVE",
    subtype: "BARE_V",
    priority: "CORE",
    sentencePattern: "SVOC",
    verbClass: "make, let, have + O + 동사원형",
    requiredArgument: "목적어의 행동",
    complementType: "원형부정사",
    allowedMinimalPairs: [["look", "to look"]],
    rejectConditions: ["수동 be made to V", "help와 혼동", "지각동사 V/V-ing"],
    referenceChapter: "CH01",
    sharedForm: "OBJECT_COMPLEMENT_BARE_V",
  },
  {
    code: "PERCEPTION_COMPLEMENT",
    subtype: "V_OR_ING",
    priority: "CORE",
    sentencePattern: "SVOC",
    verbClass: "see, hear, watch, feel",
    requiredArgument: "목적어의 동작",
    complementType: "V, V-ing, p.p.",
    allowedMinimalPairs: [],
    rejectConditions: ["문맥 없이 V와 V-ing", "CH08 분사 목적격보어와 같은 span"],
    referenceChapter: "CH01",
  },
  {
    code: "OBJECT_COMPLEMENT_PP",
    subtype: "HAVE_GET_PP",
    priority: "CORE",
    sentencePattern: "SVOC",
    verbClass: "have, get + O + p.p.",
    requiredArgument: "목적어가 당하는 동작",
    complementType: "과거분사",
    allowedMinimalPairs: [["repaired", "repairing"]],
    rejectConditions: ["CH03 have/get p.p.와 같은 span 재출제", "분사 수식과 같은 span"],
    referenceChapter: "CH01",
  },
];

export type SentenceHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const ADJ: Record<string, string> = {
  good: "well",
  reasonable: "reasonably",
  magnetic: "magnetically",
  happy: "happily",
  susceptible: "susceptibly",
  quiet: "quietly",
  fresh: "freshly",
  sweet: "sweetly",
};

export function detectSentenceCh01(text: string): SentenceHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: SentenceHit[] = [];
  detectSvc(source, hits);
  detectTransitive(source, hits);
  detectSvoo(source, hits);
  detectSvocAdj(source, hits);
  detectToInfinitive(source, hits);
  detectBareCausative(source, hits);
  detectPerception(source, hits);
  detectHaveGet(source, hits);
  detectAnalysis(source, hits);
  return dedupe(hits);
}

export function sentenceLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span) return null;
  if (ADJ[lower] && (code === "SENTENCE_SVC" || code === "SUBJECT_COMPLEMENT" || code === "OBJECT_COMPLEMENT_NOUN_ADJ")) {
    return ADJ[lower];
  }
  if (code === "VERB_TRANSITIVE_INTRANSITIVE") {
    if (lower === "the issue") return "about the issue";
    if (lower === "the room") return "into the room";
    if (lower === "the building") return "to the building";
    if (lower === "the meeting") return "to the meeting";
  }
  if (code === "SENTENCE_SVOO" && lower === "to me") return "me";
  if (code === "SENTENCE_SVOO" && lower === "with") return "∅";
  if (code === "OBJECT_COMPLEMENT_TO_V" && /^to\s+[a-z]+$/i.test(span)) return span.replace(/^to\s+/i, "");
  if (code === "CAUSATIVE_ACTIVE" || code === "OBJECT_COMPLEMENT_BARE_V") {
    if (/^(?:look|seem|feel|sound|go|leave)$/i.test(span)) return `to ${span}`;
  }
  return null;
}

export function rejectSentenceChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "NON_MINIMAL_SPAN" | null {
  const mine =
    input.pointCode.startsWith("SENTENCE_") ||
    input.pointCode.startsWith("OBJECT_COMPLEMENT_") ||
    input.pointCode === "VERB_TRANSITIVE_INTRANSITIVE" ||
    input.pointCode === "SUBJECT_COMPLEMENT" ||
    input.pointCode === "CAUSATIVE_ACTIVE" ||
    input.pointCode === "PERCEPTION_COMPLEMENT";
  if (!mine) return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (/\bhelp\b/i.test(input.sentence) && /^[a-z]+\|to [a-z]+$/.test(pair)) return "BOTH_GRAMMATICAL";
  if (input.pointCode === "PERCEPTION_COMPLEMENT") return "BOTH_GRAMMATICAL";
  if (pair === "good|well" && /\bfeel\b/i.test(input.sentence)) return "BOTH_GRAMMATICAL";
  if (input.correct.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  if (/\benter into\b/i.test(input.sentence)) return "MEANING_ONLY_CONTRAST";
  return null;
}

function detectSvc(text: string, hits: SentenceHit[]) {
  const re = /\b(tastes|seems|appears|smells|sounds|remains|stays|becomes|is|are|was|were)\s+(?:extremely|very|so|more|most)?\s*(good|reasonable|magnetic|quiet|fresh|sweet)\b/gi;
  for (const match of text.matchAll(re)) {
    const verb = (match[1] ?? "").toLowerCase();
    const adj = (match[2] ?? "").toLowerCase();
    if (verb === "feel") continue;
    if (/^(?:is|are|was|were)$/.test(verb) && /\b(?:looks|looked|sounds|feels)\s+$/i.test(text.slice(Math.max(0, (match.index ?? 0) - 12), match.index ?? 0))) {
      continue;
    }
    push(hits, "SENTENCE_SVC", "LINKING_ADJ", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
    push(hits, "SUBJECT_COMPLEMENT", "ADJ_COMPLEMENT", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
  }
}

function detectTransitive(text: string, hits: SentenceHit[]) {
  const bare = /\b(discussed|approached|entered|reached|attended)\s+(the\s+[A-Za-z]+)\b/gi;
  for (const match of text.matchAll(bare)) {
    const verb = (match[1] ?? "").toLowerCase();
    const object = (match[2] ?? "").toLowerCase();
    if (verb === "entered" && /\binto\b/i.test(text.slice((match.index ?? 0) + "entered".length, (match.index ?? 0) + match[0].length + 8))) continue;
    if (verb === "entered" && !/^(?:the room|the building|the house|the hall)$/.test(object)) continue;
    if (verb === "discussed" && !/^the issue$/.test(object) && !/^the plan$/.test(object) && !/^the matter$/.test(object)) continue;
    if (verb === "approached" && object !== "the building") continue;
    if (verb === "reached" && object !== "the station" && object !== "the destination") continue;
    if (verb === "attended" && object !== "the meeting") continue;
    push(hits, "VERB_TRANSITIVE_INTRANSITIVE", "BARE_OBJECT", match[2] ?? "", indexOfSpan(text, match[2] ?? "", match.index ?? 0), true);
  }
  if (/\benter(?:ed|s)?\s+into\b/i.test(text)) {
    push(hits, "VERB_TRANSITIVE_INTRANSITIVE", "MEANING_SHIFT", "into", text.search(/\binto\b/i), false);
  }
  if (/\b(?:listened|listens|listen)\s+to\b/i.test(text) || /\b(?:waited|waits|wait)\s+for\b/i.test(text) || /\bbelong(?:s|ed)?\s+to\b/i.test(text)) {
    push(hits, "VERB_TRANSITIVE_INTRANSITIVE", "REQUIRED_PREP", "to", text.search(/\b(?:to|for)\b/i), false);
  }
}

function detectSvoo(text: string, hits: SentenceHit[]) {
  const explain = /\b(?:explained|described|suggested|introduced)\s+(?:the|a|an)\s+[A-Za-z]+\s+(to me)\b/gi;
  for (const match of text.matchAll(explain)) {
    push(hits, "SENTENCE_SVOO", "TO_PERSON", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const provide = /\bprovided\s+(?:me|him|her|them|us)\s+(with)\b/gi;
  for (const match of text.matchAll(provide)) {
    push(hits, "SENTENCE_SVOO", "PROVIDE_WITH", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  if (/\b(?:gave|sent|showed|offered|taught)\s+(?:me|him|her|them|us)\s+(?:a|an|the)\b/i.test(text)) {
    push(hits, "SENTENCE_SVOO", "BOTH_ORDERS", "me", text.search(/\b(?:gave|sent|showed|offered|taught)\b/i), false);
  }
}

function detectSvocAdj(text: string, hits: SentenceHit[]) {
  const re = /\b(?:make|makes|made|keep|keeps|kept|find|finds|found)\s+(?:him|her|them|us|people|one\s+[A-Za-z]+)\s+(?:more\s+)?(happy|susceptible|quiet|calm)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "OBJECT_COMPLEMENT_NOUN_ADJ", "ADJ_OC", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  if (/\b(?:called|named|elected|appointed)\s+(?:him|her|them)\s+(?:a|an|the)\s+[A-Za-z]+\b/i.test(text)) {
    push(hits, "OBJECT_COMPLEMENT_NOUN_ADJ", "NOUN_OC", "a", text.search(/\b(?:called|named|elected|appointed)\b/i), false);
  }
}

function detectToInfinitive(text: string, hits: SentenceHit[]) {
  if (/\bhelp(?:s|ed)?\s+\S+\s+(?:to\s+)?[a-z]+/i.test(text)) {
    push(hits, "OBJECT_COMPLEMENT_TO_V", "HELP_EITHER", "to", text.search(/\bhelp/i), false);
  }
  const re = /\b(?:allow|allows|allowed|enable|enables|enabled|force|forces|forced|persuade|persuades|persuaded|lead|leads|led)\s+(?:ourselves|themselves|himself|herself|him|her|them|us|me|people|one\s+[A-Za-z]+)\s+(to\s+[a-z]+)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "OBJECT_COMPLEMENT_TO_V", "TO_V", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  if (/\b(?:were|was|are|is)\s+made\s+to\s+[a-z]+\b/i.test(text)) {
    push(hits, "OBJECT_COMPLEMENT_TO_V", "PASSIVE_DEFER", "to", text.search(/\bmade\s+to\b/i), false);
  }
}

function detectBareCausative(text: string, hits: SentenceHit[]) {
  const re = /\b(?:make|makes|made|let|lets|have|has|had)\s+(?:one\s+)?(?:[A-Za-z]+\s+){0,3}(look|seem|feel|sound|go|leave)\b/gi;
  for (const match of text.matchAll(re)) {
    const before = text.slice(Math.max(0, (match.index ?? 0) - 6), match.index ?? 0);
    if (/\b(?:to|been|being)\s+$/i.test(before)) continue;
    if (/\bhelp\b/i.test(text.slice(Math.max(0, (match.index ?? 0) - 12), (match.index ?? 0) + 6))) continue;
    push(hits, "CAUSATIVE_ACTIVE", "BARE_V", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  const help = /\bhelp(?:s|ed)?\s+(?:them|us|him|her|me|you)\s+[a-z]+(?:\s*,\s*[a-z]+)*(?:\s+and\s+[a-z]+)?\b/gi;
  for (const match of text.matchAll(help)) {
    push(hits, "OBJECT_COMPLEMENT_BARE_V", "HELP_PARALLEL", "help", match.index ?? 0, false);
  }
}

function detectPerception(text: string, hits: SentenceHit[]) {
  const re = /\b(?:see|saw|seen|hear|heard|watch|watched|feel|felt)\s+(?:him|her|them|us|me|the\s+[A-Za-z]+)\s+([a-z]+|ing)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "PERCEPTION_COMPLEMENT", "V_OR_ING", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectHaveGet(text: string, hits: SentenceHit[]) {
  const re = /\b(?:have|has|had|get|gets|got)\s+(?:my|his|her|their|the|a)\s+[A-Za-z]+\s+(repaired|fixed|painted|cleaned)\b/gi;
  for (const match of text.matchAll(re)) {
    push(hits, "OBJECT_COMPLEMENT_PP", "HAVE_GET_PP", match[1] ?? "", indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectAnalysis(text: string, hits: SentenceHit[]) {
  const sv = /\b(rose|arrived|fell|exists|slept)\b/i.exec(text);
  if (sv && !/\b(?:discussed|entered|enhanced)\b/i.test(text)) {
    push(hits, "SENTENCE_SV", "INTRANSITIVE", sv[1] ?? "", sv.index ?? 0, false);
  }
  if (/\b(?:enhance|enhances|enhanced)\s+(?:the|a|an)\s+[A-Za-z]+\b/i.test(text)) {
    push(hits, "SENTENCE_SVO", "TRANSITIVE_OBJECT", "the", text.search(/\b(?:the|a|an)\b/i), false);
  }
  if (/\bis\s+(?:our|their|his|her|the)\s+[A-Za-z]+\b/i.test(text)) {
    push(hits, "SENTENCE_SVC", "NOUN_COMPLEMENT", "is", text.search(/\bis\b/i), false);
  }
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: SentenceHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function dedupe(hits: SentenceHit[]): SentenceHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
