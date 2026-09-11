import { conditionalLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { conjunctionLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { nonfiniteLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { specialLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { voiceLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { modalLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { sentenceLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { tenseLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { infinitiveLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { gerundLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { partsLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { comparisonLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { participleLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { relativeLocalDistractor } from "@/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import type {
  GenerationPolicy,
  GrammarPointCode,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

const LOCAL = new Set<GrammarPointCode>([
  "RELATIVE_NONRESTRICTIVE",
  "RELATIVE_PREPOSITION_WHICH",
  "RELATIVE_PREPOSITION_WHOM",
  "RELATIVE_WHO_WHOM",
  "RELATIVE_SUBJECT",
  "RELATIVE_OBJECT",
  "RELATIVE_POSSESSIVE",
  "RELATIVE_WHAT",
  "RELATIVE_ADVERB_WHERE",
  "RELATIVE_ADVERB_WHEN",
  "RELATIVE_ADVERB_WHY",
  "RELATIVE_ADVERB_HOW",
  "RELATIVE_COMPOUND",
  "RELATIVE_AGREEMENT",
  "INDIRECT_QUESTION_ORDER",
  "CONDITIONAL_SECOND",
  "CONDITIONAL_THIRD",
  "VOICE_ACTIVE_PASSIVE",
  "VOICE_PROGRESSIVE_PASSIVE",
  "VOICE_PERFECT_PASSIVE",
  "VOICE_MODAL_PASSIVE",
  "VOICE_PHRASAL_VERB_PASSIVE",
  "VOICE_SVOO_PASSIVE",
  "VOICE_SVOC_PASSIVE",
  "VOICE_NONFINITE_PASSIVE",
  "VOICE_CAUSATIVE_HAVE_GET",
  "VOICE_BE_MADE_TO",
  "VOICE_BE_SEEN_TO",
  "CAUSATIVE_PASSIVE",
  "PARALLEL_VERBS",
  "PARALLEL_AND_OR_BUT",
  "CORRELATIVE_BOTH_AND",
  "CORRELATIVE_EITHER_OR",
  "CORRELATIVE_NEITHER_NOR",
  "CORRELATIVE_NOT_ONLY_BUT_ALSO",
  "CONJUNCTION_PREPOSITION_CONTRAST",
  "NOUN_CLAUSE_THAT",
  "NOUN_CLAUSE_WHETHER_IF",
  "NOUN_CLAUSE_DECLARATIVE_ORDER",
  "ADVERB_CLAUSE_TIME",
  "ADVERB_CLAUSE_PURPOSE",
  "ADVERB_CLAUSE_RESULT",
  "TENSE_TIME_CONDITION_CLAUSE",
  "TENSE_REPORTED_SPEECH",
  "TOO_TO",
  "ENOUGH_TO",
  "PARTICIPLE_ACTIVE_PASSIVE",
  "PARTICIPLE_NOUN_MODIFIER",
  "PARTICIPLE_EMOTION",
  "PARTICIPLE_SUBJECT_COMPLEMENT",
  "PARTICIPLE_OBJECT_COMPLEMENT",
  "PARTICIPIAL_CLAUSE_ACTIVE",
  "PARTICIPIAL_CLAUSE_PASSIVE",
  "PARTICIPIAL_CLAUSE_PERFECT",
  "PARTICIPIAL_CLAUSE_NEGATIVE",
  "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION",
  "ABSOLUTE_PARTICIPLE",
  "WITH_OBJECT_PARTICIPLE",
  "INFINITIVE_LOGICAL_SUBJECT",
  "INFINITIVE_PERFECT",
  "INFINITIVE_PASSIVE",
  "GERUND_PERFECT",
  "GERUND_PASSIVE",
  "NONFINITE_MEMORY_COMPLEMENT",
  "NONFINITE_STOP_COMPLEMENT",
  "NONFINITE_TRY_COMPLEMENT",
  "NONFINITE_MEAN_COMPLEMENT",
  "NONFINITE_GO_ON_COMPLEMENT",
  "AGREEMENT_GERUND_SUBJECT",
  "GERUND_VERB_OBJECT",
  "GERUND_PREPOSITION_OBJECT",
  "GERUND_FIXED_CONSTRUCTION",
  "AGREEMENT_PREPOSITIONAL_MODIFIER",
  "AGREEMENT_ONE_OF",
  "AGREEMENT_NUMBER_OF",
  "AGREEMENT_PARTITIVE",
  "AGREEMENT_EACH_EVERY",
  "AGREEMENT_DISTANCE",
  "AGREEMENT_CORRELATIVE",
  "COUNTABLE_UNCOUNTABLE",
  "PRONOUN_REFLEXIVE",
  "ANOTHER_OTHER_THE_OTHER",
  "PREPOSITION_COLLOCATION",
  "PREPOSITION_INSTEAD_OF",
  "ADJECTIVE_OBJECT_COMPLEMENT",
  "ADJECTIVE_SUBJECT_COMPLEMENT",
  "TOO_ENOUGH",
  "AS_AS",
  "COMPARATIVE",
  "SUPERLATIVE",
  "THE_COMPARATIVE",
  "COMPARATIVE_AND_COMPARATIVE",
  "ONE_OF_SUPERLATIVE",
  "COMPARISON_TARGET",
  "EMPHATIC_DO",
  "PSEUDO_CLEFT_ALL",
  "CLEFT_IT_THAT",
  "INVERSION_SO_NEITHER",
  "INVERSION_PLACE_DIRECTION",
  "INVERSION_COMPLEMENT",
  "APPOSITIVE_THAT",
  "INSERTION",
  "NEGATION_SCOPE",
  "MODAL_HAVE_PP",
  "MODAL_PAST_INFERENCE",
  "MODAL_REGRET_CRITICISM",
  "MANDATIVE_SHOULD",
  "SUBSTITUTE_DO",
  "SUBJECT_COMPLEMENT",
  "SENTENCE_SVC",
  "OBJECT_COMPLEMENT_NOUN_ADJ",
  "OBJECT_COMPLEMENT_TO_V",
  "OBJECT_COMPLEMENT_BARE_V",
  "CAUSATIVE_ACTIVE",
  "SENTENCE_SVOO",
  "VERB_TRANSITIVE_INTRANSITIVE",
  "TENSE_PRESENT_PAST",
  "TENSE_PRESENT_PERFECT_PAST",
  "TENSE_PAST_PERFECT",
  "TENSE_FUTURE_PERFECT",
  "TENSE_PROGRESSIVE",
  "TENSE_UNIVERSAL_TRUTH",
  "TENSE_SINCE_FOR",
  "TENSE_BY_THE_TIME",
  "INFINITIVE_DUMMY_IT",
  "INFINITIVE_ADJECTIVE_ROLE",
  "DUMMY_IT_OBJECT",
]);

/**
 * 출제하지 않는 코드.
 *
 * - 분석 전용(*_ANALYSIS, RESULT_RELATION_*, NONFINITE_VERBAL_PROPERTY): 학생 문항은
 *   짝이 되는 출제 코드가 맡는다.
 * - 뜻으로만 갈리는 대비(MODAL_MEANING, WOULD_PAST_HABIT, ADVERB_CLAUSE_CONDITION,
 *   VERB_COMPLEMENT_MEANING_CHANGE, CONFUSABLE_ADVERB): 유일성 판정이 문법성만 보므로
 *   가를 수 없다. VERB_COMPLEMENT_MEANING_CHANGE는 문맥 잠금이 있는 NONFINITE_*가 맡는다.
 * - 고등 수준에 너무 쉬운 것(ARTICLE, SINGULAR_PLURAL_NOUN, ITS_IT_IS): 2026-09-11
 *   선생님 검토에서 뺐다. it's/its는 철자 문제에 가깝다.
 * - 문장 형식 자체(SENTENCE_SV, SENTENCE_SVO), 둘 다 되는 것(GERUND_LOGICAL_SUBJECT:
 *   his/him coming), 문장 전체를 고쳐야 하는 것(DANGLING_PARTICIPLE).
 *
 * USED_TO, HAD_BETTER, GERUND_SUBJECT, GERUND_COMPLEMENT는 여기 있다가 뺐다. 형태로
 * 답이 정해지는 내신·수능 대표 어법(used to V, had better V, 동명사 주어·보어)이다.
 */
const NOT_Q = new Set<GrammarPointCode>([
  "ADVERB_CLAUSE_CONDITION",
  "DANGLING_PARTICIPLE",
  "ARTICLE",
  "SINGULAR_PLURAL_NOUN",
  "ITS_IT_IS",
  "MODAL_MEANING",
  "WOULD_PAST_HABIT",
  "SENTENCE_SV",
  "SENTENCE_SVO",
  "RESULT_RELATION_TOO_TO",
  "RESULT_RELATION_ENOUGH_TO",
  "NONFINITE_VERBAL_PROPERTY",
  "NONFINITE_LOGICAL_SUBJECT_ANALYSIS",
  "OBJECT_COMPLEMENT_TO_V_ANALYSIS",
  "OBJECT_COMPLEMENT_BARE_ANALYSIS",
  "GERUND_SUBJECT_ANALYSIS",
  "GERUND_PREP_OBJECT_ANALYSIS",
  "GERUND_SUBJECT_AGREEMENT_ANALYSIS",
  "PREP_MODIFIER_AGREEMENT_ANALYSIS",
  "GERUND_LOGICAL_SUBJECT",
  "VERB_COMPLEMENT_MEANING_CHANGE",
  "CONFUSABLE_ADVERB",
]);

export function generationPolicyFor(code: string): GenerationPolicy {
  if (LOCAL.has(code as GrammarPointCode)) return "LOCAL_TEMPLATE";
  if (NOT_Q.has(code as GrammarPointCode)) return "NOT_QUESTIONABLE";
  if (code.startsWith("CONDITIONAL_") || code.startsWith("INVERSION_")) {
    return "LOCAL_TEMPLATE";
  }
  return "REVIEWED_AI";
}

export function localTemplateDistractor(
  pointCode: string,
  sourceSpan: string
): string | null {
  const span = sourceSpan.trim();
  const lower = span.toLowerCase();
  if (!span) return null;

  if (pointCode === "RELATIVE_NONRESTRICTIVE" && lower === "which") return "that";
  if (
    (pointCode === "RELATIVE_PREPOSITION_WHICH" ||
      pointCode === "RELATIVE_PREPOSITION_WHOM") &&
    (lower === "which" || lower === "whom")
  ) {
    return "that";
  }
  if (pointCode === "RELATIVE_WHO_WHOM") {
    if (lower === "who") return "whom";
    if (lower === "whom") return "who";
  }
  if (pointCode === "CONJUNCTION_PREPOSITION_CONTRAST") {
    if (lower === "because") return "because of";
    if (lower === "because of") return "because";
    if (lower === "although") return "despite";
    if (lower === "despite") return "although";
    if (lower === "when") return "during";
    if (lower === "during") return "when";
  }
  if (pointCode === "CORRELATIVE_BOTH_AND" && lower === "and") return "or";
  const voiceWrong = voiceLocalDistractor(pointCode, span);
  if (voiceWrong) return voiceWrong;
  const modalWrong = modalLocalDistractor(pointCode, span);
  if (modalWrong) return modalWrong;
  const sentenceWrong = sentenceLocalDistractor(pointCode, span);
  if (sentenceWrong) return sentenceWrong;
  const tenseWrong = tenseLocalDistractor(pointCode, span);
  if (tenseWrong) return tenseWrong;
  const infinitiveWrong = infinitiveLocalDistractor(pointCode, span);
  if (infinitiveWrong) return infinitiveWrong;
  const gerundWrong = gerundLocalDistractor(pointCode, span);
  if (gerundWrong) return gerundWrong;
  const partsWrong = partsLocalDistractor(pointCode, span);
  if (partsWrong) return partsWrong;
  const comparisonWrong = comparisonLocalDistractor(pointCode, span);
  if (comparisonWrong) return comparisonWrong;
  if (pointCode === "VOICE_BE_MADE_TO" || pointCode === "CAUSATIVE_PASSIVE") {
    if (lower === "to move") return "move";
    if (lower === "to") return "∅";
  }
  const conditionalWrong = conditionalLocalDistractor(pointCode, span);
  if (conditionalWrong) return conditionalWrong;
  const relativeWrong = relativeLocalDistractor(pointCode, span);
  if (relativeWrong) return relativeWrong;
  const conjunctionWrong = conjunctionLocalDistractor(pointCode, span);
  if (conjunctionWrong) return conjunctionWrong;
  const participleWrong = participleLocalDistractor(pointCode, span);
  if (participleWrong) return participleWrong;
  const nonfiniteWrong = nonfiniteLocalDistractor(pointCode, span);
  if (nonfiniteWrong) return nonfiniteWrong;
  const specialWrong = specialLocalDistractor(pointCode, span);
  if (specialWrong) return specialWrong;
  if (pointCode === "INDIRECT_QUESTION_ORDER") {
    if (/\byou have\b/i.test(span)) return span.replace(/\byou have\b/i, "do you have");
    if (/\bthings should\b/i.test(span)) {
      return span.replace(/\bthings should\b/i, "should things");
    }
  }
  if (
    pointCode === "PARTICIPLE_ACTIVE_PASSIVE" &&
    /\bsuited\b/i.test(span)
  ) {
    return span.replace(/\bsuited\b/i, "suiting");
  }
  if (pointCode === "PARALLEL_VERBS") {
    const parts = span.split(/\s+/);
    const last = parts[parts.length - 1] ?? "";
    const verb = last.toLowerCase();
    if (
      last &&
      !last.endsWith("ing") &&
      /^(?:visualize|affirm|upgrade|become|build|read|think|focus|move|apply)$/i.test(verb)
    ) {
      parts[parts.length - 1] = `${last.replace(/e$/, "")}ing`;
      return parts.join(" ");
    }
  }
  return null;
}
