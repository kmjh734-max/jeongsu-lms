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
import { findTextbookPoint } from "@/lib/grammar/textbook-points";
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

export type OnePageGrammarRule = {
  code: string;
  labelKo: string;
  decide: string;
  avoid?: string;
  /** 교재가 이 어법을 묻는 횟수. 한 장에 실을 것을 고를 때 자주 나오는 것부터 쓴다. */
  freq: number;
};

/** 교재가 5문항 이상 묻고, 워크북 엔진이 출제 가능하다고 보고, 둘 다 되는 자리가 아닌 어법. */
function buildRules(): OnePageGrammarRule[] {
  const out: OnePageGrammarRule[] = [];
  for (const [code, rule] of Object.entries(TEXTBOOK_RULES)) {
    if (rule.freq < 5) continue;
    if (ONE_PAGE_BOTH_FORMS_OK.has(code)) continue;
    if (generationPolicyFor(code) === "NOT_QUESTIONABLE") continue;
    const labelKo = ontologyPoint(code)?.labelKo ?? "";
    if (!labelKo) continue;
    out.push({ code, labelKo, decide: rule.decide, avoid: rule.avoid, freq: rule.freq });
  }
  return out
    .sort((a, b) => TEXTBOOK_RULES[b.code]!.freq - TEXTBOOK_RULES[a.code]!.freq)
    .slice(0, MAX_RULES);
}

/**
 * 교과서에만 있는 어법.
 *
 * 선생님 요청(2026-09-29): 참고파일의 교과서 문법 포인트가 1장 자료에 실제로 나오게.
 * 위 60가지는 워크북 교재 다섯 권에서 뽑은 것이라, 교과서가 크게 다루는데도 교재에 없는
 * 자리는 들어올 통로가 아예 없었다 — 동격의 that(13종), 계속적 용법(12종),
 * 현재완료 수동태(8종)가 1장 자료에 한 번도 안 나오던 까닭이다.
 *
 * 여기 싣는 것은 「두 형태 가운데 하나만 맞는 자리」로 좁혔다. 단수·복수 짝이라 고르기가
 * 안 되는 one of the 최상급이나, 구어에서 두 형태가 함께 쓰이는 as if 가정법처럼
 * 고르기로 낼 수 없는 것은 영작 조건으로 돌린다(writing-grammar-condition.ts).
 */
const TEXTBOOK_ONLY_RULES: Array<Omit<OnePageGrammarRule, "freq"> & { books: number }> = [
  {
    code: "TB_APPOSITIVE_THAT",
    labelKo: "동격의 that",
    books: 13,
    decide: "the fact/idea/news 뒤에 완전한 절이 오면 관계대명사 which가 아니라 동격 접속사 that이다",
    avoid: "뒤 절에 빠진 자리가 있어 관계대명사가 맞는 곳",
  },
  {
    code: "TB_RELATIVE_NONRESTRICTIVE",
    labelKo: "관계대명사 계속적 용법",
    books: 12,
    decide: "콤마 뒤 관계사 자리에는 that을 쓰지 못한다. which/who를 쓴다",
    avoid: "콤마가 없는 제한적 용법",
  },
  {
    code: "TB_PRESENT_PERFECT_PASSIVE",
    labelKo: "현재완료 수동태",
    books: 8,
    decide: "has/have been 뒤는 과거분사다. -ing나 동사원형이 올 수 없다",
  },
  {
    code: "TB_CORRELATIVE_CONJUNCTION",
    labelKo: "상관접속사",
    books: 6,
    decide: "짝이 정해져 있다 — both A and B, either A or B, neither A nor B, not only A but also B",
  },
  {
    code: "TB_ELLIPSIS_ADVERB_CLAUSE",
    labelKo: "부사절의 「주어+be동사」 생략",
    books: 6,
    decide: "when/while/if 뒤에 주어와 be동사를 지운 자리는 의미가 능동이면 -ing, 수동이면 과거분사다",
  },
  {
    code: "TB_SO_SUCH_THAT",
    labelKo: "so/such ~ that",
    books: 6,
    decide: "so 뒤에는 형용사·부사가, such 뒤에는 「a(n) + 형용사 + 명사」가 온다",
  },
  {
    code: "TB_PRO_VERB_DO",
    labelKo: "대동사 do",
    books: 5,
    decide: "앞의 일반동사를 받을 때는 do/does/did를 쓴다. be동사나 조동사를 받을 때만 그것을 되쓴다",
  },
  {
    code: "TB_COMPOUND_RELATIVE",
    labelKo: "복합관계사",
    books: 5,
    decide: "「~든지」로 새기는 자리에는 what이 아니라 whatever/whoever/whichever를 쓴다",
    avoid: "단순히 「~하는 것」으로 새기는 관계대명사 what 자리",
  },
  {
    code: "TB_WITH_NOUN_PARTICIPLE",
    labelKo: "with + 명사 + 분사",
    books: 4,
    decide: "with 뒤 명사와의 관계가 능동이면 -ing, 수동이면 과거분사다",
  },
];

export const ONE_PAGE_GRAMMAR_RULES: OnePageGrammarRule[] = [
  ...buildRules(),
  ...TEXTBOOK_ONLY_RULES.map(({ books, ...r }) => ({ ...r, freq: books })),
];

const BY_CODE = new Map(ONE_PAGE_GRAMMAR_RULES.map((r) => [r.code, r] as const));

export function onePageGrammarRule(code: string): OnePageGrammarRule | undefined {
  return BY_CODE.get(String(code ?? "").trim().toUpperCase());
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/**
 * 고등 교과서가 이 어법을 몇 종에서 다루는지.
 *
 * 선생님 요청(2026-09-29): 교과서 문법 포인트가 1장 자료의 어법 포인트로 나오게.
 * 목록 자체는 워크북 교재에서 뽑은 것을 그대로 두되(출제 가능 여부를 이미 걸러 뒀다),
 * 교과서가 많이 다루는 자리를 <b>먼저 찾게</b> 차례를 바꾸고 프롬프트에 종수를 적어 준다.
 */
const TEXTBOOK_WEIGHT: Record<string, number> = (() => {
  // 교재 코드 ↔ 교과서 포인트 이름을 이어 둔다
  const pair: Array<[string, string]> = [
    ["VOICE_ACTIVE_PASSIVE", "수동태"],
    ["AGREEMENT_LONG_SUBJECT", "수일치"],
    ["AGREEMENT_PREPOSITIONAL_MODIFIER", "수일치"],
    ["AGREEMENT_RELATIVE_ANTECEDENT", "수일치"],
    ["RELATIVE_WHAT", "관계대명사 what"],
    ["RELATIVE_ADVERB_WHERE", "관계부사"],
    ["PARTICIPIAL_CLAUSE_ACTIVE", "분사구문"],
    ["PARTICIPLE_NOUN_MODIFIER", "명사 수식 분사"],
    ["PARTICIPLE_EMOTION", "명사 수식 분사"],
    ["OBJECT_COMPLEMENT_TO_V", "목적격보어 to부정사"],
    ["MANDATIVE_SHOULD", "제안·요구 동사의 that절"],
    ["CONDITIONAL_SECOND", "가정법 과거"],
    ["CONDITIONAL_THIRD", "가정법 과거완료"],
    ["INVERSION_NEGATIVE", "부정어 도치"],
    ["INDIRECT_QUESTION_ORDER", "간접의문문"],
    ["COMPARATIVE", "비교급"],
    ["AS_AS", "as ~ as 원급 비교"],
    ["PRONOUN_REFLEXIVE", "재귀대명사"],
    ["TENSE_TIME_CONDITION_CLAUSE", "시간·조건 부사절의 현재시제"],
    ["PARALLEL_AND_OR_BUT", "병렬구조"],
    ["GERUND_VERB_OBJECT", "동명사"],
  ];
  const out: Record<string, number> = {};
  for (const [code, label] of pair) {
    const p = findTextbookPoint(label);
    if (p) out[code] = Math.max(out[code] ?? 0, p.bookCount);
  }
  // 교과서에서만 온 어법은 그 종수가 곧 가중치다
  for (const r of TEXTBOOK_ONLY_RULES) out[r.code] = r.books;
  return out;
})();

/** 이 어법이 고등 교과서 몇 종에 나오는지 (0이면 교과서 목록에 없음) */
export function textbookWeightOf(code: string): number {
  return TEXTBOOK_WEIGHT[String(code ?? "").trim().toUpperCase()] ?? 0;
}

/** 교과서가 많이 다루는 것부터 — 프롬프트도 이 차례로 싣는다 */
const RULES_BY_TEXTBOOK = [...ONE_PAGE_GRAMMAR_RULES].sort(
  (a, b) => textbookWeightOf(b.code) - textbookWeightOf(a.code) || b.freq - a.freq
);

/** 프롬프트에 싣는 한 줄 카드(호출마다 같아 프롬프트 캐시가 붙는다). */
export function onePageGrammarRulesText(): string {
  return RULES_BY_TEXTBOOK.map((r) => {
    const books = textbookWeightOf(r.code);
    const head = books > 0 ? `${r.code}(${r.labelKo} · 교과서 ${books}종)` : `${r.code}(${r.labelKo})`;
    const parts = [`${head}: ${clip(r.decide, 72)}`];
    if (r.avoid) parts.push(`단, ${clip(r.avoid, 46)}인 자리는 출제 금지`);
    return parts.join(" | ");
  }).join("\n");
}
