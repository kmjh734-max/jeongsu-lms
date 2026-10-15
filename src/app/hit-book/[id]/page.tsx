import { HitBookPage } from "@/components/exam-analysis/HitBookPage";

export const metadata = { title: "적중 자료집" };

/** 적중 자료집 — 앱 틀(왼쪽 메뉴·윗줄) 없이 연다. 인쇄하면 A4 자료집만 나온다(2026-10-15) */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HitBookPage id={id} />;
}
