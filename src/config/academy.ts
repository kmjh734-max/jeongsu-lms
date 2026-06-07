/**
 * 학원별 브랜드·인증 설정 — video-app(정수학원) 전용
 */
export const academyConfig = {
  academyName: "정수학원",
  lmsTitle: "정수학원 LMS",
  loginSubtitle: "정수학원 온라인 학습관에 오신 것을 환영합니다.",
  internalEmailDomain: "jslms.local",
  logoPath: "/image/logo.png",
  productionSiteUrl: "https://jeongsu-lms.vercel.app",
  primaryColor: "#2563EB",
} as const;

export type AcademyConfig = typeof academyConfig;
