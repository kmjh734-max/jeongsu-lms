/**
 * 크레딧 판매·마진 기준 (학원 충전 단가).
 *
 * 목표: 무거운 AI(변형문제·TTS·학생부)에서도 매출 대비 원가 비율 ≤ ~35%
 * → 총이익률 약 65~75%. 가벼운 gpt-4o-mini는 거의 전부 마진.
 *
 * 판매가 1 크레딧 = 30원 기준.
 */
export const CREDIT_WON_PER_UNIT = 30;

export type CreditPack = {
  credits: number;
  priceWon: number;
  /** 정가(credits × CREDIT_WON_PER_UNIT) 대비 할인율 % */
  discountPct: number;
  label: string;
};

/** 학원 충전 패키지 가이드 (슈퍼관리자 참고용) */
export const CREDIT_PACKS: CreditPack[] = [
  { label: "소", credits: 500, priceWon: 15_000, discountPct: 0 },
  { label: "중", credits: 2_000, priceWon: 55_000, discountPct: 8 },
  { label: "대", credits: 5_000, priceWon: 120_000, discountPct: 20 },
];

export function creditsToWon(credits: number, wonPer = CREDIT_WON_PER_UNIT): number {
  return Math.round(credits * wonPer);
}

export function formatWon(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
