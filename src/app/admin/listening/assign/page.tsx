import { ListeningAssignTabPage } from "@/components/listening/ListeningPages";

export default async function AdminListeningAssignPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;
  // 세트 목록에서 여러 개를 골라 넘어올 수 있다(쉼표로 이어 붙인다)
  const setIds = (set ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return <ListeningAssignTabPage role="admin" presetSetIds={setIds} />;
}
