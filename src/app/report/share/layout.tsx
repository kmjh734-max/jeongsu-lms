import type { Metadata } from "next";
import { ACADEMY_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `${ACADEMY_NAME} 학습 리포트`,
  robots: { index: false, follow: false },
};

/** 학부모 공개 리포트 전용 레이아웃 (대시보드/로그인 레이아웃 없음) */
export default function SharedReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
