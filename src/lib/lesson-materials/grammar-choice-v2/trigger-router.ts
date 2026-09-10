import { detectComparisonCh12 } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { detectConditionalCh05 } from "@/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { detectConjunctionCh10 } from "@/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { detectGerundCh07 } from "@/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { detectInfinitiveCh06 } from "@/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { detectModalCh04 } from "@/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { detectNonfiniteCh09 } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { detectParticipleCh08 } from "@/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { detectPartsCh13 } from "@/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { detectRelativeCh11 } from "@/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { detectSentenceCh01 } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectSpecialCh14 } from "@/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { detectTenseCh02 } from "@/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { detectVoiceCh03 } from "@/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import {
  FORBIDDEN_PATTERNS,
  GRAMMAR_ONTOLOGY,
  ontologyPoint,
} from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type { ExactSentence, GrammarPointCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

const CHAPTERS = [
  "C01 문장 구조와 동사 문형",
  "C02 주어·동사 수 일치",
  "C03 시제와 상",
  "C04 능동태와 수동태",
  "C05 조동사",
  "C06 가정법",
  "C07 to부정사·동명사",
  "C08 분사와 분사구문",
  "C09 명사절·접속사·부사절",
  "C10 관계사",
  "C11 병렬구조",
  "C12 대명사·명사·한정사",
  "C13 형용사·부사·비교",
  "C14 도치·강조·생략·동격·부정",
];

type DetectorHit = { code: string; questionable?: boolean; exclusionReason?: string };

function isRecognizedHit(hit: DetectorHit): boolean {
  if (hit.exclusionReason) return false;
  return Boolean(hit.code);
}

function detectedStudentCodes(text: string): GrammarPointCode[] {
  const hits: DetectorHit[] = [
    ...detectSentenceCh01(text),
    ...detectTenseCh02(text),
    ...detectVoiceCh03(text),
    ...detectModalCh04(text),
    ...detectConditionalCh05(text),
    ...detectInfinitiveCh06(text),
    ...detectGerundCh07(text),
    ...detectParticipleCh08(text),
    ...detectNonfiniteCh09(text),
    ...detectConjunctionCh10(text),
    ...detectRelativeCh11(text),
    ...detectComparisonCh12(text),
    ...detectPartsCh13(text),
    ...detectSpecialCh14(text),
  ];
  const codes = new Set<GrammarPointCode>();
  for (const hit of hits) {
    if (!isRecognizedHit(hit)) continue;
    if (!ontologyPoint(hit.code as GrammarPointCode)) continue;
    codes.add(hit.code as GrammarPointCode);
  }
  return [...codes];
}

/** Structural comparison frames. Sentence text is never hardcoded. */
function addComparisonTriggers(text: string, core: Set<string>) {
  const source = text.replace(/[’]/g, "'");
  if (/\bnot\s+(?:as|so)\s+[a-z]+\s+as\b/i.test(source)) core.add("AS_AS");
  if (/\bas\s+[a-z]+\s+as\b/i.test(source) && !/\b(?:twice|three times|\d+\s+times)\s+as\b/i.test(source)) {
    core.add("AS_AS");
  }
  if (/\b(?:more|less)\s+[a-z]+\s+than\b/i.test(source)) core.add("COMPARATIVE");
  if (/\b[a-z]+er\s+than\b/i.test(source)) core.add("COMPARATIVE");
  if (/\bThe\s+[a-z]+(?:\s+[a-z]+){0,6},\s+the\s+[a-z]/i.test(source)) core.add("THE_COMPARATIVE");
  if (/\b(?:more and more|less and less|[a-z]+er and [a-z]+er)\b/i.test(source)) {
    core.add("COMPARATIVE_AND_COMPARATIVE");
  }
  if (/\b(?:by far\s+)?the\s+(?:most|[a-z]+est)\b/i.test(source)) core.add("SUPERLATIVE");
  if (/\bone of the\s+(?:most|[a-z]+est)\b/i.test(source)) core.add("ONE_OF_SUPERLATIVE");
  if (/\bthe\s+(?:first|second|third|fourth)\s+(?:most|[a-z]+est)\b/i.test(source)) core.add("SUPERLATIVE");
  if (/\bthan\s+(?:that|those)\s+of\b/i.test(source) || /\bthan any other\b/i.test(source)) {
    core.add("COMPARISON_TARGET");
  }
  if (/\b(?:superior|inferior|senior|junior)\s+to\b/i.test(source)) core.add("COMPARATIVE");
  if (/\bprefer(?:s|red)?\s+[a-z]+ing\s+to\s+[a-z]+ing\b/i.test(source)) core.add("COMPARATIVE");
  if (/\b(?:different from|the same as)\b/i.test(source)) core.add("COMPARATIVE");
  if (/\b(?:twice|three times|\d+\s+times)\s+as\b/i.test(source)) core.add("MULTIPLICATIVE_COMPARISON");
  for (const hit of detectComparisonCh12(source)) {
    if (hit.questionable || hit.code === "MULTIPLICATIVE_COMPARISON") core.add(hit.code);
  }
}

const HEAD_NOUN = "point|fact|truth|problem|idea|belief";
const DECLARATIVE_SUBJECT = "we|they|he|she|I|you|it|people|students";
const FINITE_VERB =
  "am|is|are|was|were|has|have|had|do|does|did|can|could|may|might|must|shall|should|will|would|[a-z]+(?:s|ed)";

/** Omitted-that declarative noun clause after a content noun + be. Not an indirect question. */
function addDeclarativeNounClauseTrigger(text: string, core: Set<string>) {
  const source = text.replace(/[’]/g, "'");
  const re = new RegExp(
    `\\b(?:the\\s+)?(?:${HEAD_NOUN})\\s+(?:is|was)\\s+(?!that\\b|whether\\b|if\\b|to\\b|what\\b|how\\b|who\\b|whom\\b|which\\b|when\\b|where\\b|why\\b)(?:${DECLARATIVE_SUBJECT})\\s+(?:${FINITE_VERB})\\b`,
    "i"
  );
  if (re.test(source)) core.add("NOUN_CLAUSE_DECLARATIVE_ORDER");
}

/** instead of + noun/noun phrase/gerund only. Bare adverb Instead, is not a trigger. */
function addInsteadOfTrigger(text: string, core: Set<string>) {
  if (/\binstead of\s+(?:[a-z]+ing\b|[a-z]+(?:\s+[a-z]+){0,5})\b/i.test(text)) {
    core.add("PREPOSITION_INSTEAD_OF");
  }
}

const MANDATORY_CODES = [
    "CONDITIONAL_SECOND",
    "CONDITIONAL_THIRD",
    "INDIRECT_QUESTION_ORDER",
    "RELATIVE_NONRESTRICTIVE",
    "RELATIVE_PREPOSITION_WHICH",
    "RELATIVE_WHO_WHOM",
    "RELATIVE_AGREEMENT",
    "PARALLEL_VERBS",
    "PARALLEL_CLAUSES",
    "CORRELATIVE_BOTH_AND",
    "INVERSION_ONLY",
    "INVERSION_NEGATIVE",
    "CLEFT_IT_THAT",
    "VOICE_BE_MADE_TO",
    "PARTICIPIAL_CLAUSE_PASSIVE",
    "AGREEMENT_LONG_SUBJECT",
    "AGREEMENT_DISTANCE",
    "AGREEMENT_CLAUSE_SUBJECT",
];

/**
 * 한 문장에서 실제로 걸리는 코드만 모은다.
 *
 * 예전에는 묶음의 문장을 join한 뒤 한 번만 돌려서 3문장이 힌트 하나를 공유했다.
 * 어느 문장 때문에 걸린 힌트인지 알 수 없으니, 추론 강도가 낮으면 사실상
 * 쓸모가 없었다. 문장 단위로 돌려야 low에서도 모델이 231개 코드를 뒤지지 않고
 * 좁은 후보에서 출발할 수 있다.
 */
function triggersForText(text: string): Set<string> {
  const core = new Set<string>();
  if (/\b(if|wish|as if|would|could|had|were)\b/i.test(text)) {
    core.add("CONDITIONAL_SECOND");
    core.add("ADVERB_CLAUSE_CONDITION");
  }
  if (/\ball\s+(?:that\s+)?(?:\w+\s+){0,4}(?:have|has|had)\s+to\s+do\s+(?:is|are|was|were)\b/i.test(text)) {
    core.add("PSEUDO_CLEFT_ALL");
  }
  if (/\b(what|how|whether)\b.+\b(you|things|we)\b/i.test(text)) {
    core.add("INDIRECT_QUESTION_ORDER");
    core.add("NOUN_CLAUSE_WH_WORD");
  }
  if (/,\s*which\b|\bfor which\b|\bwho\b|\bwhom\b/i.test(text)) {
    core.add("RELATIVE_NONRESTRICTIVE");
    core.add("RELATIVE_PREPOSITION_WHICH");
    core.add("RELATIVE_WHO_WHOM");
    core.add("RELATIVE_SUBJECT");
  }
  if (/\b(am|is|are|was|were|being|been)\b.+\b\w+ed\b/i.test(text)) {
    core.add("VOICE_PROGRESSIVE_PASSIVE");
    core.add("VOICE_ACTIVE_PASSIVE");
    core.add("PARTICIPLE_ACTIVE_PASSIVE");
  }
  if (/\b(and|or|both|either|neither)\b/i.test(text)) {
    core.add("PARALLEL_VERBS");
    core.add("CORRELATIVE_BOTH_AND");
    core.add("PARALLEL_AND_OR_BUT");
  }
  if (/\b(than|more|as)\b/i.test(text)) {
    core.add("COMPARATIVE");
    core.add("AS_AS");
    core.add("SUPERLATIVE");
    core.add("THE_COMPARATIVE");
    core.add("ONE_OF_SUPERLATIVE");
    core.add("COMPARISON_TARGET");
  }
  if (/\bbecause\b/i.test(text)) core.add("CONJUNCTION_PREPOSITION_CONTRAST");
  if (/\bmade to\b|\bmeant to\b/i.test(text)) {
    core.add("VOICE_BE_MADE_TO");
    core.add("INFINITIVE_PASSIVE");
  }
  addComparisonTriggers(text, core);
  addDeclarativeNounClauseTrigger(text, core);
  addInsteadOfTrigger(text, core);
  for (const code of detectedStudentCodes(text)) core.add(code);
  return core;
}

export function highlightedForSentence(text: string): string[] {
  return [...triggersForText(text)].filter((code) => ontologyPoint(code));
}

/** 정리된 온톨로지 전체. 호출마다 변하지 않으므로 시스템 프롬프트에 싣는다. */
export function ontologyCatalogText(): string {
  const codes = GRAMMAR_ONTOLOGY.map(
    (def) => `${def.code}|${def.priority}|${def.labelKo}`
  );
  return [
    `CHAPTERS: ${CHAPTERS.join(" / ")}`,
    `FORBIDDEN_PATTERNS: ${FORBIDDEN_PATTERNS.join(" / ")}`,
    `GRAMMAR_ONTOLOGY (${codes.length} codes, format code|priority|labelKo):`,
    codes.join("\n"),
  ].join("\n");
}

/**
 * 이 묶음에서 특히 살펴볼 코드를 문장별로 준다.
 *
 * 고를 수 있는 목록 자체(codes)는 시스템 프롬프트에 통째로 실려 있으므로
 * 여기서 걸러도 모델이 나머지 코드의 존재를 모르게 되지는 않는다
 * (그게 f861bc8에서 전체 전송으로 되돌린 이유였다).
 * 정적인 목록을 system으로 옮기면 호출마다 10KB를 다시 보내지 않아도 되고,
 * 프롬프트 캐시도 탄다.
 */
export function compactOntologyForSentences(sentences: ExactSentence[]) {
  const passageText = sentences.map((s) => s.text).join("\n");
  const inBatch = triggersForText(passageText);
  return {
    highlightedBySentence: sentences.map((sentence) => ({
      sentenceId: sentence.sentenceId,
      likelyCodes: highlightedForSentence(sentence.text),
    })),
    mandatoryInThisBatch: MANDATORY_CODES.filter(
      (code) => inBatch.has(code) && ontologyPoint(code)
    ),
    note: "likelyCodes are points a local detector found in that exact sentence. Start from them. They are a hint, not a restriction: the full code list is in GRAMMAR_ONTOLOGY in the system prompt, and a sentence may test a code not listed here.",
  };
}
