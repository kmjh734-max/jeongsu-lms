import { hasInterveningAgreement } from "@/lib/lesson-materials/grammar-choice-v2/structure-frames";
import type { GrammarPointCode, GrammarPriority } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { detectSentenceCh01 } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectNonfiniteCh09 } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { detectGerundCh07 } from "@/lib/lesson-materials/grammar-choice-v2/gerund-ch07";

export type PartsCh13Rule = {
  code: GrammarPointCode;
  subtype: string;
  priority: GrammarPriority;
  referenceChapter: "CH13";
  headNounRule?: string;
  antecedentRule?: string;
  countability?: string;
  requiredForm?: string;
  allowedMinimalPairs: Array<[string, string]>;
  rejectConditions: string[];
  sharedForm?: string;
  analysisOnly?: boolean;
  emitsStudentQuestion?: boolean;
};

export const PARTS_CH13_RULES: PartsCh13Rule[] = [
  {
    code: "COUNTABLE_UNCOUNTABLE",
    subtype: "PEDAGOGICAL_COUNTABILITY",
    priority: "BASIC",
    referenceChapter: "CH13",
    headNounRule: "information/advice는 일반적인 불가산명사다",
    countability: "uncountable",
    requiredForm: "단수형. PEDAGOGICAL_COUNTABILITY_PAIR",
    allowedMinimalPairs: [
      ["information", "informations"],
      ["advice", "advices"],
    ],
    rejectConditions: ["존재하지 않는 형태를 정답으로", "단순 a/the", "같은 subtype 반복"],
  },
  {
    code: "COUNTABLE_UNCOUNTABLE",
    subtype: "EVIDENCE_CUED",
    priority: "CORE",
    referenceChapter: "CH13",
    headNounRule: "evidence는 much/a piece of 같은 구조 단서가 있을 때만 출제",
    countability: "uncountable",
    requiredForm: "구조 단서가 없으면 분석만",
    allowedMinimalPairs: [["evidence", "evidences"]],
    rejectConditions: ["단어만 교체", "전문 용례 evidences", "구조 단서 없음"],
  },
  {
    code: "SINGULAR_PLURAL_NOUN",
    subtype: "NEWS_SINGULAR",
    priority: "CORE",
    referenceChapter: "CH13",
    headNounRule: "news는 형태와 달리 단수 취급",
    countability: "singular-in-form",
    requiredForm: "단수 동사",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["짧은 일반 명사 수일치", "문맥 없는 means/species"],
  },
  {
    code: "SINGULAR_PLURAL_NOUN",
    subtype: "CONTEXT_NUMBER",
    priority: "CORE",
    referenceChapter: "CH13",
    headNounRule: "means/species/statistics는 한정사가 수를 잠글 때만 출제",
    countability: "context",
    allowedMinimalPairs: [],
    rejectConditions: ["한정사 없이 수 선택", "두 수 모두 가능"],
  },
  {
    code: "ARTICLE",
    subtype: "LOCKED_ARTICLE",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "the same / 서수·only가 구조를 잠글 때만 the",
    allowedMinimalPairs: [["the same", "a same"]],
    rejectConditions: ["명사 앞에 관사가 있다는 이유만으로 a/the", "담화에 따라 달라지는 관사"],
  },
  {
    code: "PRONOUN_REFLEXIVE",
    subtype: "REQUIRED_REFLEXIVE",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    antecedentRule: "주어와 목적어가 같은 대상일 때만 재귀대명사",
    requiredForm: "주어와 수·인칭이 맞는 -self",
    allowedMinimalPairs: [["ourselves", "us"]],
    rejectConditions: ["선행사 불명확", "including ourselves처럼 us도 가능", "강조 용법만 의미 차이"],
  },
  {
    code: "PRONOUN_SUBJECT_OBJECT_CASE",
    subtype: "OBJECT_CASE",
    priority: "BASIC",
    referenceChapter: "CH13",
    antecedentRule: "전치사 뒤는 목적격",
    requiredForm: "목적격",
    allowedMinimalPairs: [["me", "I"]],
    rejectConditions: ["It was me/I처럼 둘 다 가능", "불명확한 It/This"],
  },
  {
    code: "PRONOUN_ANTECEDENT",
    subtype: "AMBIGUOUS_IT",
    priority: "CORE",
    referenceChapter: "CH13",
    antecedentRule: "It/This/they의 지시 대상이 하나로 고정될 때만",
    allowedMinimalPairs: [],
    rejectConditions: ["AMBIGUOUS_REFERENCE", "they/it 둘 다 가능"],
  },
  {
    code: "ONE_ONES",
    subtype: "REPLACEMENT",
    priority: "BASIC",
    referenceChapter: "CH13",
    antecedentRule: "대명사 one/ones는 앞에 나온 가산명사의 수를 따른다",
    countability: "countable",
    allowedMinimalPairs: [["one", "ones"]],
    rejectConditions: ["one such처럼 한정사 one", "one of"],
  },
  {
    code: "ANOTHER_OTHER_THE_OTHER",
    subtype: "TWO_SET",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    antecedentRule: "전체가 둘이면 the other, 여럿의 또 하나면 another",
    allowedMinimalPairs: [
      ["the other", "another"],
      ["others", "the others"],
    ],
    rejectConditions: ["another + 명사만 있는 경우", "집합이 닫혀 있는지 불명"],
  },
  {
    code: "AGREEMENT_EACH_EVERY",
    subtype: "EACH_OF",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "each/every/either/neither of의 핵은 단수",
    countability: "singular",
    requiredForm: "단수 동사",
    allowedMinimalPairs: [["was", "were"]],
    rejectConditions: ["짧은 주어 바로 뒤 is/are", "none of는 단복 모두 가능"],
  },
  {
    code: "AGREEMENT_PREPOSITIONAL_MODIFIER",
    subtype: "PREP_HEAD",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "전치사구 속 명사가 아니라 핵어와 일치",
    allowedMinimalPairs: [["has", "have"]],
    rejectConditions: ["CH09가 같은 span을 출제하면 후보만", "짧은 수일치"],
    sharedForm: "PREP_MODIFIER_AGREEMENT",
  },
  {
    code: "AGREEMENT_ONE_OF",
    subtype: "ONE_OF_PLURAL",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "one of + 복수명사의 핵은 one",
    countability: "singular",
    requiredForm: "단수 동사",
    allowedMinimalPairs: [["was", "were"]],
    rejectConditions: ["one of + 관계절 동사는 CH11", "관계대명사 선택 중복"],
  },
  {
    code: "AGREEMENT_NUMBER_OF",
    subtype: "NUMBER_OF",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "a number of는 복수, the number of는 단수",
    allowedMinimalPairs: [["are", "is"]],
    rejectConditions: ["짧은 수일치"],
  },
  {
    code: "AGREEMENT_PARTITIVE",
    subtype: "PARTITIVE_HEAD",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "most/a lot of 뒤 명사의 가산성으로 핵을 정한다",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["most of us spend처럼 바로 보이는 복수", "Human beings want"],
  },
  {
    code: "AGREEMENT_DISTANCE",
    subtype: "ALONG_WITH",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    headNounRule: "along with/as well as/together with는 주어의 수에 더하지 않는다",
    allowedMinimalPairs: [["was", "were"]],
    rejectConditions: ["동명사구 주어는 CH07", "짧은 수일치"],
  },
  {
    code: "AGREEMENT_DISTANCE",
    subtype: "INTERVENING_MODIFIER",
    priority: "CORE",
    referenceChapter: "CH13",
    headNounRule: "주어와 동사 사이에 수식어가 삽입되면 동사는 실제 주어의 수를 따른다",
    allowedMinimalPairs: [["likes", "like"]],
    rejectConditions: ["주어와 동사가 인접한 짧은 수일치", "nobody likes처럼 개입 수식어가 없는 경우"],
  },
  {
    code: "AGREEMENT_CORRELATIVE",
    subtype: "NEAR_NOUN",
    priority: "CORE",
    referenceChapter: "CH13",
    headNounRule: "either/or, neither/nor는 가까운 명사와 일치. 접속사 짝은 CH10",
    allowedMinimalPairs: [["is", "are"]],
    rejectConditions: ["either/or 구조 자체를 CH10과 중복 출제"],
  },
  {
    code: "PREPOSITION_COLLOCATION",
    subtype: "REQUIRED_PARTICLE",
    priority: "MANDATORY",
    referenceChapter: "CH13",
    requiredForm: "exposed to / distinguish from / prevent from / responsible for / associated with",
    allowedMinimalPairs: [
      ["to", "with"],
      ["from", "with"],
      ["from", "to"],
    ],
    rejectConditions: ["to V / to V-ing", "by focus/focusing", "둘 다 가능한 전치사", "의미만 다른 by/until"],
  },
  {
    code: "PREPOSITION_INSTEAD_OF",
    subtype: "INSTEAD_OF_NOUN",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "instead of + 명사",
    allowedMinimalPairs: [["instead of", "instead"]],
    rejectConditions: ["despite/even though 해설 재사용", "절/명사 일반 대조 해설"],
  },
  {
    code: "ADVERB_VERB_MODIFIER",
    subtype: "ADJ_ADV_BASIC",
    priority: "BASIC",
    referenceChapter: "CH13",
    requiredForm: "동사를 수식하면 부사",
    allowedMinimalPairs: [["critically", "critical"]],
    rejectConditions: ["전체 문항의 25% 초과", "분사형 형용사는 CH08"],
  },
  {
    code: "ADVERB_ADJECTIVE_MODIFIER",
    subtype: "ADJ_ADV_BASIC",
    priority: "BASIC",
    referenceChapter: "CH13",
    requiredForm: "형용사 앞은 부사",
    allowedMinimalPairs: [["extremely", "extreme"]],
    rejectConditions: ["25% 초과", "비교급 형태는 CH12"],
  },
  {
    code: "ADJECTIVE_NOUN_MODIFIER",
    subtype: "ADJ_ADV_BASIC",
    priority: "BASIC",
    referenceChapter: "CH13",
    requiredForm: "부정대명사 뒤는 형용사",
    allowedMinimalPairs: [["useful", "usefully"]],
    rejectConditions: ["25% 초과"],
  },
  {
    code: "ADJECTIVE_OBJECT_COMPLEMENT",
    subtype: "OBJECT_ADJECTIVE",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "목적격보어는 형용사. 같은 span은 CH01과 한 문항",
    allowedMinimalPairs: [["open", "openly"]],
    rejectConditions: ["CH01이 같은 span을 출제하면 후보만"],
  },
  {
    code: "ADJECTIVE_SUBJECT_COMPLEMENT",
    subtype: "LINKING_ADJECTIVE",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "연결동사 보어는 형용사",
    allowedMinimalPairs: [["trustworthy", "trustworthily"]],
    rejectConditions: ["well이 상태 부사로도 가능한 feel well", "CH01 공유 span"],
  },
  {
    code: "TOO_ENOUGH",
    subtype: "ENOUGH_POSITION",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "형용사/부사 뒤에 enough",
    allowedMinimalPairs: [["strong enough", "enough strong"]],
    rejectConditions: ["enough to의 to만 묻는 문제", "4토큰 초과"],
  },
  {
    code: "CONFUSABLE_ADVERB",
    subtype: "MEANING_ONLY",
    priority: "CORE",
    referenceChapter: "CH13",
    requiredForm: "hard/hardly, near/nearly, late/lately, high/highly, most/mostly, close/closely는 의미만 다르므로 분석만",
    allowedMinimalPairs: [
      ["hard", "hardly"],
      ["nearly", "near"],
      ["late", "lately"],
      ["high", "highly"],
      ["most", "mostly"],
      ["close", "closely"],
    ],
    rejectConditions: ["MEANING_ONLY_CONTRAST", "학생 문항 emit"],
    analysisOnly: true,
    emitsStudentQuestion: false,
  },
];

export type PartsHit = {
  code: GrammarPointCode;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

const UNCOUNT = "information|advice|evidence|furniture|luggage|equipment|homework|knowledge";
const BASIC_ADJ_ADV = new Set(["ADJECTIVE_NOUN_MODIFIER", "ADVERB_VERB_MODIFIER", "ADVERB_ADJECTIVE_MODIFIER"]);

export function detectPartsCh13(text: string): PartsHit[] {
  const source = text.replace(/[’]/g, "'");
  const hits: PartsHit[] = [];
  detectUncountable(source, hits);
  detectNews(source, hits);
  detectContextNumber(source, hits);
  detectArticle(source, hits);
  detectReflexive(source, hits);
  detectCase(source, hits);
  detectAmbiguousIt(source, hits);
  detectOne(source, hits);
  detectOther(source, hits);
  detectQuantifierAgreement(source, hits);
  detectPrepHead(source, hits);
  detectOneOf(source, hits);
  detectNumberOf(source, hits);
  detectPartitive(source, hits);
  detectAlongWith(source, hits);
  detectInterveningAgreement(source, hits);
  detectCorrelativeNear(source, hits);
  detectMeasure(source, hits);
  detectPreposition(source, hits);
  detectAdjAdv(source, hits);
  detectEnough(source, hits);
  detectConfusable(source, hits);
  detectShortBan(source, hits);
  return oneQuestionPerSubtype(dedupe(hits));
}

export function applyBasicRatioCap(hits: PartsHit[]): PartsHit[] {
  return capBasicAdjAdv(hits);
}

export function partsLocalDistractor(code: string, sourceSpan: string): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span) return null;
  const noun: Record<string, string> = {
    information: "informations",
    advice: "advices",
    evidence: "evidences",
    furniture: "furnitures",
  };
  if (code === "COUNTABLE_UNCOUNTABLE" && noun[lower]) return noun[lower];
  if (code.startsWith("AGREEMENT_") || code === "SINGULAR_PLURAL_NOUN") {
    if (lower === "is") return "are";
    if (lower === "are") return "is";
    if (lower === "was") return "were";
    if (lower === "were") return "was";
    if (lower === "has") return "have";
    if (lower === "have") return "has";
    if (lower === "likes") return "like";
    if (lower === "like") return "likes";
    if (lower === "seem") return "seems";
    if (lower === "seems") return "seem";
  }
  if (code === "PRONOUN_REFLEXIVE" && lower === "ourselves") return "us";
  if (code === "PRONOUN_SUBJECT_OBJECT_CASE" && lower === "me") return "I";
  if (code === "PRONOUN_SUBJECT_OBJECT_CASE" && lower === "he") return "Him";
  if (code === "PRONOUN_SUBJECT_OBJECT_CASE" && lower === "she") return "Her";
  if (code === "ANOTHER_OTHER_THE_OTHER" && lower === "the other") return "another";
  if (code === "ANOTHER_OTHER_THE_OTHER" && lower === "the others") return "others";
  if (code === "ANOTHER_OTHER_THE_OTHER" && lower === "others") return "the others";
  if (code === "ARTICLE" && lower === "the same") return "a same";
  if (code === "ONE_ONES" && lower === "one") return "ones";
  if (code === "PREPOSITION_INSTEAD_OF" && lower === "instead of") return "instead";
  if (code === "PREPOSITION_COLLOCATION") {
    if (lower === "to") return "with";
    if (lower === "from") return "with";
    if (lower === "for") return "of";
    if (lower === "with") return "to";
  }
  const swap: Record<string, string> = {
    critically: "critical",
    extremely: "extreme",
    useful: "usefully",
    open: "openly",
    trustworthy: "trustworthily",
    closely: "close",
    "strong enough": "enough strong",
    "old enough": "enough old",
  };
  return swap[lower] ?? null;
}

export function rejectPartsChoice(input: {
  pointCode: string;
  correct: string;
  wrong: string;
  sentence: string;
}): "MECHANICAL_INFINITIVE_MARKER" | "BOTH_GRAMMATICAL" | "MEANING_ONLY_CONTRAST" | "AMBIGUOUS_REFERENCE" | "TOO_TRIVIAL_SHORT_AGREEMENT" | "NON_MINIMAL_SPAN" | "IMPLAUSIBLE_DISTRACTOR" | "MULTI_AXIS_EDIT" | null {
  if (!isPartsCode(input.pointCode)) return null;
  const pair = [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (/^to [a-z]+\|to [a-z]+ing$/.test(pair)) return "MECHANICAL_INFINITIVE_MARKER";
  if (
    (input.pointCode === "PRONOUN_ANTECEDENT" || input.pointCode === "DUMMY_REFERENTIAL_IT") &&
    (pair === "it|this" || pair === "it|that" || pair === "it|they" || pair === "they|it")
  ) {
    return "AMBIGUOUS_REFERENCE";
  }
  if (/\b(?:human beings|many kinds|this variation|our thoughts)\b/i.test(input.sentence) && /^(?:is|are|want|wants|preserve|preserves)$/.test(pair.split("|")[0] ?? "")) {
    return "TOO_TRIVIAL_SHORT_AGREEMENT";
  }
  if (input.correct.trim().split(/\s+/).length > 4) return "NON_MINIMAL_SPAN";
  if (axisCount(input.correct, input.wrong) > 1) return "MULTI_AXIS_EDIT";
  if (/inging$/.test(input.wrong) || input.wrong.toLowerCase() === "thinkinging") return "IMPLAUSIBLE_DISTRACTOR";
  return null;
}

export function basicAdjAdvShare(hits: PartsHit[]): number {
  const asked = hits.filter((hit) => hit.questionable);
  if (!asked.length) return 0;
  const basic = asked.filter((hit) => BASIC_ADJ_ADV.has(hit.code) || hit.subtype === "ADJ_ADV_BASIC").length;
  return basic / asked.length;
}

export function restoresSource(text: string, hit: PartsHit): boolean {
  const slice = text.slice(hit.occurrenceIndex, hit.occurrenceIndex + hit.sourceSpan.length);
  return slice === hit.sourceSpan;
}

function detectUncountable(text: string, hits: PartsHit[]) {
  const re = new RegExp(`\\b(?:much|little|a piece of|a great deal of|an amount of)\\s+(${UNCOUNT})\\b`, "gi");
  for (const match of text.matchAll(re)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    const lower = span.toLowerCase();
    const at = indexOfSpan(text, span, match.index ?? 0);
    if (lower === "evidence") {
      const cued = /\b(?:much|a piece of|a great deal of|an amount of)\s+evidence\b/i.test(text);
      push(hits, "COUNTABLE_UNCOUNTABLE", cued ? "EVIDENCE_CUED" : "EVIDENCE_ANALYSIS", span, at, cued);
      continue;
    }
    if (lower === "information" || lower === "advice") {
      push(hits, "COUNTABLE_UNCOUNTABLE", "PEDAGOGICAL_COUNTABILITY", span, at, true);
    }
  }
}

function detectNews(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\bThe news\s+(is|are|was|were)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    const ok = /^(?:is|was)$/i.test(span);
    push(hits, "SINGULAR_PLURAL_NOUN", "NEWS_SINGULAR", span, indexOfSpan(text, span, match.index ?? 0), ok);
  }
}

function detectContextNumber(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(this|these|a|one)\s+(means|species|series)\s+(is|are|was|were)\b/gi)) {
    const det = (match[1] ?? "").toLowerCase();
    const verb = match[3] ?? "";
    const singular = det === "this" || det === "a" || det === "one";
    const ok = singular ? /^(?:is|was)$/i.test(verb) : /^(?:are|were)$/i.test(verb);
    push(hits, "SINGULAR_PLURAL_NOUN", "CONTEXT_NUMBER", exact(text, verb, match.index ?? 0), indexOfSpan(text, verb, match.index ?? 0), ok);
  }
  if (/\bstatistics\b/i.test(text) && !/\b(?:this|these|the)\s+statistics\b/i.test(text)) {
    push(hits, "SINGULAR_PLURAL_NOUN", "CONTEXT_NUMBER", "statistics", text.toLowerCase().indexOf("statistics"), false);
  }
}

function detectArticle(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(the same)\b/gi)) {
    push(hits, "ARTICLE", "LOCKED_ARTICLE", exact(text, match[1] ?? "", match.index ?? 0), match.index ?? 0, true);
  }
  for (const match of text.matchAll(/\b(the) (?:first|second|third|only)\b/gi)) {
    if (/\ban only\b/i.test(text)) continue;
    push(hits, "ARTICLE", "LOCKED_ARTICLE", exact(text, match[1] ?? "", match.index ?? 0), match.index ?? 0, false);
  }
}

function detectReflexive(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(we|they|he|she)\b[^.]{0,48}?\b(?:protect|taught|teach|blame|prepare|introduced|introduces|hurt|saw)\s+(ourselves|themselves|himself|herself)\b/gi)) {
    const subject = (match[1] ?? "").toLowerCase();
    const span = exact(text, match[2] ?? "", match.index ?? 0);
    const agree =
      (subject === "we" && span.toLowerCase() === "ourselves") ||
      (subject === "they" && span.toLowerCase() === "themselves") ||
      (subject === "he" && span.toLowerCase() === "himself") ||
      (subject === "she" && span.toLowerCase() === "herself");
    if (!agree) continue;
    push(hits, "PRONOUN_REFLEXIVE", "REQUIRED_REFLEXIVE", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bincluding (ourselves|himself|herself|themselves)\b/gi)) {
    push(hits, "PRONOUN_REFLEXIVE", "INCLUDED", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
  for (const match of text.matchAll(/\bby (himself|herself|themselves|myself|ourselves)\b/gi)) {
    push(hits, "PRONOUN_REFLEXIVE", "BY_ONESELF", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function detectCase(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\bbetween you and (me|him|her)\b/gi)) {
    push(hits, "PRONOUN_SUBJECT_OBJECT_CASE", "OBJECT_CASE", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\b(?:invited|called|told|asked|saw|met)\s+(me|him|her|us|them)\b/gi)) {
    push(hits, "PRONOUN_SUBJECT_OBJECT_CASE", "OBJECT_CASE", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
  for (const match of text.matchAll(/^(He|She|They|We|I)\s+(?:explained|left|arrived|said)\b/g)) {
    push(hits, "PRONOUN_SUBJECT_OBJECT_CASE", "SUBJECT_CASE", exact(text, match[1] ?? "", match.index ?? 0), match.index ?? 0, true);
  }
  if (/\bit was (?:me|I)\b/i.test(text)) {
    push(hits, "PRONOUN_SUBJECT_OBJECT_CASE", "BOTH_CASE", "me", text.toLowerCase().search(/\bit was\b/), false);
  }
}

function detectAmbiguousIt(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(It|This)\b/g)) {
    push(hits, "PRONOUN_ANTECEDENT", "AMBIGUOUS_IT", match[1] ?? "", match.index ?? 0, false);
  }
}

function detectOne(text: string, hits: PartsHit[]) {
  if (/\bone such\b/i.test(text)) {
    push(hits, "ONE_ONES", "DETERMINER", "one", text.toLowerCase().indexOf("one such"), false);
  }
  for (const match of text.matchAll(/\b(?:a|another)\s+[a-z]+\s+(one)\b/gi)) {
    push(hits, "ONE_ONES", "REPLACEMENT", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), true);
  }
}

function detectOther(text: string, hits: PartsHit[]) {
  if (/\bOne\b[^.]{0,48}?;\s+(the other)\b/i.test(text)) {
    const at = text.toLowerCase().indexOf("the other");
    push(hits, "ANOTHER_OTHER_THE_OTHER", "TWO_SET", exact(text, "the other", at), at, true);
  }
  if (/\b(?:the rest|of the (?:\d+|five|six|seven|ten)|the remaining|all the others)\b/i.test(text) && /\bthe others\b/i.test(text)) {
    const at = text.toLowerCase().indexOf("the others");
    push(hits, "ANOTHER_OTHER_THE_OTHER", "CLOSED_REMAINDER", exact(text, "the others", at), at, true);
  }
  if (/\b(?:and|among)\s+(others)\b/i.test(text) && !/\b(?:the rest|of the \d+|all the others|the remaining)\b/i.test(text)) {
    const at = text.toLowerCase().search(/\b(?:and|among)\s+others\b/i);
    const spanAt = text.toLowerCase().indexOf("others", at);
    push(hits, "ANOTHER_OTHER_THE_OTHER", "OPEN_ADDITIONAL", exact(text, "others", spanAt), spanAt, true);
  }
  if (/\bSome\b[^.]{0,40}?\bwhile\s+(others)\b/i.test(text)) {
    const at = text.toLowerCase().indexOf("others");
    push(hits, "ANOTHER_OTHER_THE_OTHER", "AMBIGUOUS_REFERENCE", exact(text, "others", at), at, false);
  }
  if (/\banother\s+[a-z]+\s+[a-z]+\b/i.test(text) && !/\bthe other\b/i.test(text)) {
    const at = text.toLowerCase().indexOf("another");
    push(hits, "ANOTHER_OTHER_THE_OTHER", "DETERMINER", "another", at, false);
  }
}

function detectQuantifierAgreement(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\bEach of the [A-Za-z]+ (was|were|is|are)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "AGREEMENT_EACH_EVERY", "EACH_OF", span, indexOfSpan(text, span, match.index ?? 0), /^(?:was|is)$/i.test(span));
  }
  if (/\b(?:none|all|both) of\b/i.test(text)) {
    push(hits, "EACH_ALL_BOTH", "BOTH_POSSIBLE", "of", text.toLowerCase().search(/\b(?:none|all|both) of\b/), false);
  }
}

function detectPrepHead(text: string, hits: PartsHit[]) {
  /**
   * 수식어구가 끼어든 주어의 수일치. 내신 어법에서 가장 자주 나오는 축 중 하나다.
   *
   * 예전에는 주어가 The로 시작할 때만 봤다. 그래서 A succession of tiny paragraphs
   * [is/are], Its effects on students [are/is]처럼 한정사만 다른 같은 구조를 통째로
   * 놓쳤다. one of / each of / a number of는 각자 전용 검출기가 있으므로 여기서는 뺀다.
   */
  const re = /\b(?:The|A|An|This|That|These|Those|My|Your|His|Her|Its|Our|Their)\s+(?:[a-z]+\s+){0,2}([A-Za-z]+)\s+(?:of|in|for)\s+[^.]{3,48}?\s+(has|have|is|are|was|were)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    const verb = match[2] ?? "";
    if (/ing$/i.test(head)) continue;
    const span = exact(text, verb, match.index ?? 0);
    const at = indexOfSpan(text, span, match.index ?? 0);
    const owned = occupied(text, span, at);
    const pluralHead = /s$/i.test(head) && !/^(?:news|series|species)$/i.test(head);
    const ok = pluralHead ? /^(?:have|are|were)$/i.test(verb) : /^(?:has|is|was)$/i.test(verb);
    push(hits, "AGREEMENT_PREPOSITIONAL_MODIFIER", owned ? "OWNED_ELSEWHERE" : "PREP_HEAD", span, at, ok && !owned);
  }
}

function detectOneOf(text: string, hits: PartsHit[]) {
  const re = /\bOne of\s+(?:[A-Za-z']+\s+){1,6}([A-Za-z]+s)\s+(who|that|which)?\s*(was|were|is|are|has|have)\b/gi;
  for (const match of text.matchAll(re)) {
    const rel = match[2] ?? "";
    const verb = match[3] ?? "";
    const span = exact(text, verb, match.index ?? 0);
    const at = indexOfSpan(text, span, match.index ?? 0);
    if (rel) {
      push(hits, "AGREEMENT_ONE_OF", "RELATIVE_DEFER", span, at, false);
      continue;
    }
    push(hits, "AGREEMENT_ONE_OF", "ONE_OF_PLURAL", span, at, /^(?:was|is|has)$/i.test(verb));
  }
}

function detectNumberOf(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\bA number of [A-Za-z]+ (are|is|were|was)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "AGREEMENT_NUMBER_OF", "A_NUMBER_OF", span, indexOfSpan(text, span, match.index ?? 0), /^(?:are|were)$/i.test(span));
  }
  for (const match of text.matchAll(/\bThe number of [A-Za-z]+ (is|are|was|were|has|have)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "AGREEMENT_NUMBER_OF", "THE_NUMBER_OF", span, indexOfSpan(text, span, match.index ?? 0), /^(?:is|was|has)$/i.test(span));
  }
}

function detectPartitive(text: string, hits: PartsHit[]) {
  const mass = /\b(?:a lot of|lots of|most of|half of)\s+(?:the\s+)?(?:[a-z]+\s+){0,2}(information|advice|evidence|furniture|news)\s+(is|are|was|were)\b/gi;
  for (const match of text.matchAll(mass)) {
    const verb = match[2] ?? "";
    const span = exact(text, verb, match.index ?? 0);
    push(hits, "AGREEMENT_PARTITIVE", "MASS_HEAD", span, indexOfSpan(text, span, match.index ?? 0), /^(?:is|was)$/i.test(verb));
  }
  for (const match of text.matchAll(/\b(?:some|many|several)\s+([A-Za-z]+s)\s+of\s+[^.]{0,28}?\s+(seem|seems|are|is)\b/gi)) {
    const head = match[1] ?? "";
    const verb = match[2] ?? "";
    if (/^(?:news|series)$/i.test(head)) continue;
    const span = exact(text, verb, match.index ?? 0);
    push(hits, "AGREEMENT_PARTITIVE", "PLURAL_HEAD", span, indexOfSpan(text, span, match.index ?? 0), /^(?:seem|are)$/i.test(verb));
  }
  if (/\b(?:most|all|some) of (?:us|them)\s+(?:spend|think|believe)\b/i.test(text)) {
    const at = text.toLowerCase().search(/\b(?:most|all|some) of (?:us|them)\b/);
    push(hits, "AGREEMENT_PARTITIVE", "PARTITIVE_HEAD", "us", at, false);
  }
}

function detectAlongWith(text: string, hits: PartsHit[]) {
  const re = /\b(The\s+[A-Za-z]+),\s+(?:along with|as well as|together with)\s+[^,]{3,40},\s+(was|were|is|are)\b/gi;
  for (const match of text.matchAll(re)) {
    const head = match[1] ?? "";
    if (/\b[A-Za-z]+ing\b/.test(head)) continue;
    const verb = match[2] ?? "";
    const span = exact(text, verb, match.index ?? 0);
    const plural = /\s(?:students|people|children)$/i.test(head);
    push(hits, "AGREEMENT_DISTANCE", "ALONG_WITH", span, indexOfSpan(text, span, match.index ?? 0), plural ? /^(?:were|are)$/i.test(verb) : /^(?:was|is)$/i.test(verb));
  }
}

function detectInterveningAgreement(text: string, hits: PartsHit[]) {
  const re =
    /\b(?:nobody|no one|nothing|everybody|everyone|anybody|anyone|somebody|someone|each)\b[\s\S]{1,80}?\b([A-Za-z]+s)\b/gi;
  for (const match of text.matchAll(re)) {
    const verb = match[1] ?? "";
    if (/^(?:is|was|has|does)$/i.test(verb)) continue;
    if (!hasInterveningAgreement(text, verb)) continue;
    const span = exact(text, verb, match.index ?? 0);
    push(hits, "AGREEMENT_DISTANCE", "INTERVENING_MODIFIER", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
}

function detectCorrelativeNear(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(?:Either|Neither)\s+(?:the\s+)?[A-Za-z]+\s+(?:or|nor)\s+(?:the\s+)?([A-Za-z]+)\s+(is|are|was|were)\b/gi)) {
    const near = match[1] ?? "";
    const verb = match[2] ?? "";
    const plural = /s$/i.test(near) && !/^(?:news|series)$/i.test(near);
    const span = exact(text, verb, match.index ?? 0);
    push(hits, "AGREEMENT_CORRELATIVE", "NEAR_NOUN", span, indexOfSpan(text, span, match.index ?? 0), plural ? /^(?:are|were)$/i.test(verb) : /^(?:is|was)$/i.test(verb));
  }
}

function detectMeasure(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(?:Three hours|Ten dollars|Five miles|Two weeks)\s+(is|are|was|were)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "AGREEMENT_PARTITIVE", "MEASURE_UNIT", span, indexOfSpan(text, span, match.index ?? 0), /^(?:is|was)$/i.test(span));
  }
}

function detectPreposition(text: string, hits: PartsHit[]) {
  const rows: Array<[RegExp, string, string]> = [
    [/\bexposed (to)\b/gi, "to", "REQUIRED_PARTICLE"],
    [/\bresponsible (for)\b/gi, "for", "REQUIRED_PARTICLE"],
    [/\bassociated (with)\b/gi, "with", "REQUIRED_PARTICLE"],
    [/\bdistinguish(?:es|ed)?\s+[A-Za-z]+\s+(from)\b/gi, "from", "REQUIRED_PARTICLE"],
    [/\bprevent(?:s|ed)?\s+[A-Za-z]+\s+(from)\s+[a-z]+ing\b/gi, "from", "REQUIRED_PARTICLE"],
  ];
  for (const [re, span, subtype] of rows) {
    for (const match of text.matchAll(re)) {
      const found = match[1] ?? span;
      push(hits, "PREPOSITION_COLLOCATION", subtype, exact(text, found, match.index ?? 0), indexOfSpan(text, found, match.index ?? 0), true);
    }
  }
  if (/\b(?:by|until|during|since|beside|besides|except)\b/i.test(text)) {
    push(hits, "PREPOSITION_COLLOCATION", "BOTH_OR_MEANING", "by", text.toLowerCase().search(/\b(?:by|until|during|since|beside|besides|except)\b/), false);
  }
}

function detectAdjAdv(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b(?:evaluate|examine|analyze|judg(?:e|es|ed))\s+(?:the\s+[A-Za-z]+\s+)?(critically)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "ADVERB_VERB_MODIFIER", "ADJ_ADV_BASIC", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\b(extremely|extremely)\s+[a-z]+\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "ADVERB_ADJECTIVE_MODIFIER", "ADJ_ADV_BASIC", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\b(?:an|an)\s+(extremely)\s+[a-z]+\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "ADVERB_ADJECTIVE_MODIFIER", "ADJ_ADV_BASIC", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\bsomething (useful|necessary|important)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "ADJECTIVE_NOUN_MODIFIER", "ADJ_ADV_BASIC", span, indexOfSpan(text, span, match.index ?? 0), true);
  }
  for (const match of text.matchAll(/\b(?:make|makes|made|keep|keeps|kept)\s+(?:the\s+[A-Za-z]+|people|him|her|them)\s+(open|interesting|clear)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    const at = indexOfSpan(text, span, match.index ?? 0);
    const owned = occupied(text, span, at);
    push(hits, "ADJECTIVE_OBJECT_COMPLEMENT", owned ? "OWNED_CH01" : "OBJECT_ADJECTIVE", span, at, !owned);
  }
  for (const match of text.matchAll(/\b(?:make|makes|made)\s+people\s+(susceptible)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    const at = indexOfSpan(text, span, match.index ?? 0);
    push(hits, "ADJECTIVE_OBJECT_COMPLEMENT", "OWNED_CH01", span, at, false);
  }
  for (const match of text.matchAll(/\b(?:sounds|seems|looks|is|was)\s+(trustworthy)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    const at = indexOfSpan(text, span, match.index ?? 0);
    push(hits, "ADJECTIVE_SUBJECT_COMPLEMENT", occupied(text, span, at) ? "OWNED_CH01" : "LINKING_ADJECTIVE", span, at, !occupied(text, span, at));
  }
}

function detectEnough(text: string, hits: PartsHit[]) {
  for (const match of text.matchAll(/\b((?:strong|old|good|hard)\s+enough)\b/gi)) {
    const span = exact(text, match[1] ?? "", match.index ?? 0);
    push(hits, "TOO_ENOUGH", "ENOUGH_POSITION", span, match.index ?? 0, true);
  }
}

function detectConfusable(text: string, hits: PartsHit[]) {
  const forms = ["hard", "hardly", "near", "nearly", "late", "lately", "high", "highly", "most", "mostly", "close", "closely"];
  for (const form of forms) {
    const at = text.toLowerCase().search(new RegExp(`\\b${form}\\b`));
    if (at < 0) continue;
    push(hits, "CONFUSABLE_ADVERB", "MEANING_ONLY", exact(text, form, at), at, false);
  }
}

function detectShortBan(text: string, hits: PartsHit[]) {
  const banned = [
    /\bHuman beings\s+(want|wants)\b/i,
    /\bour thoughts and words\s+(are|is)\b/i,
    /\bMany kinds\s+(are|is)\b/i,
    /\bThis variation\s+(preserves|preserve)\b/i,
  ];
  for (const re of banned) {
    const match = re.exec(text);
    if (!match) continue;
    push(hits, "SINGULAR_PLURAL_NOUN", "SHORT_BAN", exact(text, match[1] ?? "", match.index ?? 0), indexOfSpan(text, match[1] ?? "", match.index ?? 0), false);
  }
}

function occupied(text: string, span: string, at: number): boolean {
  const same = (sourceSpan: string, index: number, questionable: boolean) =>
    questionable && sourceSpan.toLowerCase() === span.toLowerCase() && Math.abs(index - at) < 6;
  return (
    detectSentenceCh01(text).some((hit) => same(hit.sourceSpan, hit.occurrenceIndex, hit.questionable)) ||
    detectNonfiniteCh09(text).some((hit) => same(hit.sourceSpan, hit.occurrenceIndex, hit.questionable)) ||
    detectGerundCh07(text).some((hit) => same(hit.sourceSpan, hit.occurrenceIndex, hit.questionable))
  );
}

function capBasicAdjAdv(hits: PartsHit[]): PartsHit[] {
  const asked = hits.filter((hit) => hit.questionable);
  const basic = asked.filter(isBasicAdjAdv);
  const core = asked.length - basic.length;
  const maxBasic = Math.floor(core / 3);
  let kept = 0;
  return hits.map((hit) => {
    if (!hit.questionable || !isBasicAdjAdv(hit)) return hit;
    if (kept < maxBasic) {
      kept += 1;
      return hit;
    }
    return { ...hit, questionable: false, subtype: "BASIC_CAPPED" };
  });
}

function isBasicAdjAdv(hit: PartsHit): boolean {
  return (
    hit.subtype === "ADJ_ADV_BASIC" ||
    hit.subtype === "PEDAGOGICAL_COUNTABILITY" ||
    hit.subtype === "OBJECT_CASE" ||
    hit.subtype === "SUBJECT_CASE" ||
    BASIC_ADJ_ADV.has(hit.code)
  );
}

function isPartsCode(code: string): boolean {
  return (
    code.startsWith("PRONOUN_") ||
    code.startsWith("ADJECTIVE_") ||
    code.startsWith("ADVERB_") ||
    code.startsWith("AGREEMENT_") ||
    code === "COUNTABLE_UNCOUNTABLE" ||
    code === "SINGULAR_PLURAL_NOUN" ||
    code === "ARTICLE" ||
    code === "ONE_ONES" ||
    code === "ANOTHER_OTHER_THE_OTHER" ||
    code === "EACH_ALL_BOTH" ||
    code === "EITHER_NEITHER" ||
    code === "PREPOSITION_COLLOCATION" ||
    code === "PREPOSITION_INSTEAD_OF" ||
    code === "CONFUSABLE_ADVERB" ||
    code === "TOO_ENOUGH" ||
    code === "DUMMY_REFERENTIAL_IT" ||
    code === "LINKING_VERB_COMPLEMENT"
  );
}

function axisCount(correct: string, wrong: string): number {
  const a = correct.trim().toLowerCase().split(/\s+/);
  const b = wrong.trim().toLowerCase().split(/\s+/);
  if (a.length !== b.length) return a.join(" ") === wrong.trim().toLowerCase() ? 0 : 1;
  return a.filter((word, i) => word !== b[i]).length;
}

function exact(text: string, span: string, from: number): string {
  const at = indexOfSpan(text, span, from);
  return text.slice(at, at + span.length) || span;
}

function indexOfSpan(text: string, span: string, from: number): number {
  const at = text.toLowerCase().indexOf(span.toLowerCase(), Math.max(0, from));
  return at >= 0 ? at : from;
}

function push(
  hits: PartsHit[],
  code: GrammarPointCode,
  subtype: string,
  sourceSpan: string,
  at: number,
  questionable: boolean
) {
  if (!sourceSpan || at < 0) return;
  hits.push({ code, subtype, sourceSpan, occurrenceIndex: at, questionable });
}

function oneQuestionPerSubtype(hits: PartsHit[]): PartsHit[] {
  const asked = new Set<string>();
  return hits.map((hit) => {
    if (!hit.questionable) return hit;
    if (asked.has(hit.subtype)) return { ...hit, questionable: false };
    asked.add(hit.subtype);
    return hit;
  });
}

function dedupe(hits: PartsHit[]): PartsHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.code}|${hit.subtype}|${hit.sourceSpan.toLowerCase()}|${hit.occurrenceIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
