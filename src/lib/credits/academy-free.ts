/**
 * 학원별로 값을 받지 않는 기능.
 *
 * 선생님 2026-10-26: 단어 예문·동의어/반의어는 단어당 1크레딧, 윌링어학원은 무료.
 * 차감(debitFeatureCredits)·잔액 확인(lessonCreditShortfall)·확인 창 견적(/api/credits/quote)이 모두 여기를 본다.
 */
const FREE_FEATURES_BY_ACADEMY: Record<string, readonly string[]> = {
  // 윌링어학원
  "7716a037-73e1-4676-8df9-b5be40dd6e15": ["vocab_generate_examples", "vocab_generate_related"],
};

export function isFeatureFreeForAcademy(
  academyId: string | null | undefined,
  featureKey: string
): boolean {
  if (!academyId) return false;
  return FREE_FEATURES_BY_ACADEMY[academyId]?.includes(featureKey) ?? false;
}
