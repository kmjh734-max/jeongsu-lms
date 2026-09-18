/**
 * 사업자 정보 — 환불 기준 등 공개 페이지에 나간다.
 * 비어 있는 칸은 화면에 표시하지 않으므로, 확정되는 대로 여기만 채우면 된다.
 */
export const BUSINESS_INFO: Record<
  "name" | "representative" | "registrationNumber" | "mailOrderNumber" | "address" | "email" | "phone" | "hours",
  string
> = {
  /** 상호 */
  name: "잉코어(EngCore)",
  /** 대표자 */
  representative: "최정민",
  /** 사업자등록번호 */
  registrationNumber: "397-43-01410",
  /** 통신판매업 신고번호 (신고 후 채운다) */
  mailOrderNumber: "",
  /** 사업장 주소 */
  address: "서울특별시 중랑구 봉우재로 109-15",
  /** 환불·결제 문의 이메일 */
  email: "",
  /** 환불·결제 문의 전화 */
  phone: "010-8851-1196",
  /** 문의 받는 시간 */
  hours: "평일 10:00~18:00 (주말·공휴일 제외)",
};

/** 환불 기준을 적용하기 시작한 날 */
export const REFUND_POLICY_EFFECTIVE_DATE = "2026년 9월 18일";
