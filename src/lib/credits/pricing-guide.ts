/**
 * 크레딧 판매·마진 기준 (학원 충전 단가).
 *
 * 1크레딧 = 1원(부가세 제외). 충전 상품(DB credit_packages)이 이 기준이다:
 * 스타터 11,000원(부가세 포함) = 10,000크레딧.
 * 기능 가격(feature_pricing)은 2026-09-14 실측 원가의 약 2배(원가율 ~50%)로 정했다.
 * 보너스 크레딧이 붙는 큰 상품은 원가율이 그만큼 올라간다(맥스 +15% → 약 57%).
 *
 * 예전에는 1크레딧 = 30원을 기준으로 가격을 정했는데, 충전 상품은 1원 기준으로 만들어져
 * 모든 기능이 30배 싸게 팔리고 있었다.
 */
export const CREDIT_WON_PER_UNIT = 1;

export type CreditPack = {
  credits: number;
  priceWon: number;
  /** 정가(credits × CREDIT_WON_PER_UNIT) 대비 할인율 % */
  discountPct: number;
  label: string;
};

/** 학원 충전 패키지 가이드 (슈퍼관리자 참고용, 부가세 제외 금액). 실제 상품은 DB credit_packages. */
export const CREDIT_PACKS: CreditPack[] = [
  { label: "스타터", credits: 10_000, priceWon: 10_000, discountPct: 0 },
  { label: "스탠다드", credits: 32_000, priceWon: 30_000, discountPct: 6 },
  { label: "프로", credits: 55_000, priceWon: 50_000, discountPct: 9 },
  { label: "맥스", credits: 115_000, priceWon: 100_000, discountPct: 13 },
];

export function creditsToWon(credits: number, wonPer = CREDIT_WON_PER_UNIT): number {
  return Math.round(credits * wonPer);
}

export function formatWon(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
