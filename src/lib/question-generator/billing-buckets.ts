/**
 * 문항 유형을 값 받는 갈래로 나눈다.
 *
 * 확인 창(만들기 전)과 실제 차감(만든 뒤)이 서로 다른 기준을 쓰고 있었다 — 확인 창은
 * 어법추론·어법개수만 따로 세고 서술형은 아예 일반에 섞어 보여, 선생님이 보신 금액과
 * 빠져나간 금액이 달랐다(2026-10-01 선생님 지적). 두 곳이 갈라지지 않도록 여기 하나만 둔다.
 */

/** 어법 유형 — 지문 전체를 다시 읽고 여러 자리를 한꺼번에 봐야 해서 값이 더 든다 */
export const isGrammarBillingType = (key: string | null) =>
  /:(어법추론|어법개수)$/.test(String(key ?? ""));

/**
 * 서술형 — 호출이 2.3번 들어가고(검수에서 걸려 다시 만드는 일이 잦다) 해설이 길다.
 * 실측(2026-10-01): 객관식 41원, 서술형·어법 114원.
 */
export const isWritingBillingType = (key: string | null) =>
  /^(writing|summary_short):/.test(String(key ?? "")) ||
  /:(어법문장오류수정|어법오류수정2|어법오류수정3|지칭대명사서술|특정표현의미서술|요약표빈칸단어)$/.test(
    String(key ?? "")
  );

/**
 * 1지문 다문항(세트)으로 만든 문항은 유형과 상관없이 이 갈래 하나로 받는다(150, 선생님 결정 2026-10-10).
 * 세트마다 검수가 한 번 더 돌고 앞 문항 이야기를 붙여 만들어 원가가 더 든다(시험 문항당 약 67원).
 */
export const QG_SET_FEATURE = "qg_generate_set";

/** 유형 하나가 어느 갈래로 값을 받는지 */
export function billingFeatureFor(optionKey: string | null): string {
  if (isGrammarBillingType(optionKey)) return "qg_generate_grammar";
  if (isWritingBillingType(optionKey)) return "qg_generate_writing";
  return "qg_generate_job";
}
