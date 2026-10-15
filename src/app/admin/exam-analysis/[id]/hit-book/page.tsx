import { redirect } from "next/navigation";

/** 적중 자료집은 앱 틀 없는 /hit-book/[id] 로 옮겼다 — 인쇄할 때 A4가 잘리지 않게(2026-10-15) */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/hit-book/${id}`);
}
