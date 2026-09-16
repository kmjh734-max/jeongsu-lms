/**
 * 1장 요약직보자료의 "중요 어법 포인트"가 쓸 수 있는 어법 목록.
 *
 * 워크북 어법 선택 엔진(grammar-choice-v2)이 교재 5권에서 뽑아 둔 규칙 카드(textbook-rules)와
 * 어법 이름표(grammar-ontology), 출제 제외 목록(generation-policy)을 그대로 쓴다. 정리자료도
 * 같은 기준으로 "답이 하나로 정해지는 자리"만 싣는다.
 *
 * 2026-09-16 선생님 지적: "주어 자리에 동명사가 쓰일 때는 to부정사도 주어가 가능하다"처럼 두 형태가
 * 모두 맞는 자리가 어법 포인트로 실렸다. 교재 카드의 avoid(둘 다 가능)에 해당하는 항목은
 * BOTH_FORMS_OK에 모아 아예 뽑지 못하게 한다.
 */
import { generationPolicyFor } from "@/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { TEXTBOOK_RULES } from "@/lib/lesson-materials/grammar-choice-v2/textbook-rules";

/**
 * 두 형태가 모두 맞거나(교재도 "둘 다 가능"이라고 적은 것), 고르게 할 근거가 문장 안에 없는 자리.
 * 정리자료에서는 빼고, 모델이 그래도 내면 코드가 버린다.
 */
export const ONE_PAGE_BOTH_FORMS_OK = new Set<string>([
  // 주어·보어 자리의 동명사 ↔ to부정사(둘 다 문법적이다)
  "GERUND_SUBJECT",
  "GERUND_COMPLEMENT",
  "INFINITIVE_NOUN_ROLE",
  "INFINITIVE_ADJECTIVE_ROLE",
  // 지각·사역·help의 목적격보어(원형과 -ing/to V가 함께 쓰인다)
  "PERCEPTION_COMPLEMENT",
  "OBJECT_COMPLEMENT_BARE_V",
  // 관계사: 콤마 없는 절의 that/which, 생략 가능한 목적격, 문미 전치사, the reason that
  "RELATIVE_RESTRICTIVE",
  "RELATIVE_OBJECT",
  "RELATIVE_OMISSION",
  "RELATIVE_PREPOSITION_WHICH",
  "RELATIVE_PREPOSITION_WHOM",
  "RELATIVE_ADVERB_WHY",
  // 강조구문 that/who, 목적어절 if/whether, 배수 비교 두 형태, without/but for
  "CLEFT_IT_THAT",
  "NOUN_CLAUSE_WHETHER_IF",
  "MULTIPLICATIVE_COMPARISON",
  "WITHOUT_IF_CONDITION",
  // 뜻만 다른 대비(문법으로는 둘 다 맞다)
  "USED_TO",
  "WOULD_PAST_HABIT",
  "TENSE_PROGRESSIVE",
  "ADVERB_CLAUSE_REASON",
  "MODAL_MEANING",
  "VERB_COMPLEMENT_MEANING_CHANGE",
  "NONFINITE_MEMORY_COMPLEMENT",
  "NONFINITE_STOP_COMPLEMENT",
  "NONFINITE_TRY_COMPLEMENT",
  "NONFINITE_MEAN_COMPLEMENT",
  "NONFINITE_GO_ON_COMPLEMENT",
  // 고르게 할 수 없는 것: 관사, 단수·복수 표기, it's/its 철자, 쉼표, 생략
  "ARTICLE",
  "SINGULAR_PLURAL_NOUN",
  "ITS_IT_IS",
  "ELLIPSIS_COMMON_ELEMENT",
  "ELLIPSIS_SUBSTITUTION",
  "PREPOSITION_COLLOCATION",
  // 조동사 뒤 동사원형·have p.p. 자리(형태만 보면 풀리고 오답이 학생의 실수가 아니다)
  "MODAL_HAVE_PP",
  "MODAL_PAST_INFERENCE",
  "MODAL_REGRET_CRITICISM",
  // 문장 전체를 고쳐야 하는 것
  "DANGLING_PARTICIPLE",
  "WORD_ORDER",
]);

/** 프롬프트에 싣는 어법 수. 교재가 자주 묻는 것부터 자른다(정리자료 한 장에는 5~6개만 실린다). */
const MAX_RULES = 60;

export type OnePageGrammarRule = { code: string; labelKo: string; decide: string; avoid?: string };

/** 교재가 5문항 이상 묻고, 워크북 엔진이 출제 가능하다고 보고, 둘 다 되는 자리가 아닌 어법. */
function buildRules(): OnePageGrammarRule[] {
  const out: OnePageGrammarRule[] = [];
  for (const [code, rule] of Object.entries(TEXTBOOK_RULES)) {
    if (rule.freq < 5) continue;
    if (ONE_PAGE_BOTH_FORMS_OK.has(code)) continue;
    if (generationPolicyFor(code) === "NOT_QUESTIONABLE") continue;
    const labelKo = ontologyPoint(code)?.labelKo ?? "";
    if (!labelKo) continue;
    out.push({ code, labelKo, decide: rule.decide, avoid: rule.avoid });
  }
  return out
    .sort((a, b) => TEXTBOOK_RULES[b.code]!.freq - TEXTBOOK_RULES[a.code]!.freq)
    .slice(0, MAX_RULES);
}

export const ONE_PAGE_GRAMMAR_RULES = buildRules();

const BY_CODE = new Map(ONE_PAGE_GRAMMAR_RULES.map((r) => [r.code, r] as const));

export function onePageGrammarRule(code: string): OnePageGrammarRule | undefined {
  return BY_CODE.get(String(code ?? "").trim().toUpperCase());
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** 프롬프트에 싣는 한 줄 카드(호출마다 같아 프롬프트 캐시가 붙는다). */
export function onePageGrammarRulesText(): string {
  return ONE_PAGE_GRAMMAR_RULES.map((r) => {
    const parts = [`${r.code}(${r.labelKo}): ${clip(r.decide, 72)}`];
    if (r.avoid) parts.push(`단, ${clip(r.avoid, 46)}인 자리는 출제 금지`);
    return parts.join(" | ");
  }).join("\n");
}
