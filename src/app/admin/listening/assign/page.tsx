import { ListeningAssignTabPage } from "@/components/listening/ListeningPages";

export default async function AdminListeningAssignPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;
  return <ListeningAssignTabPage role="admin" presetSetId={set} />;
}
