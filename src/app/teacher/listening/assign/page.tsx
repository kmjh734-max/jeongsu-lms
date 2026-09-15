import { ListeningAssignTabPage } from "@/components/listening/ListeningPages";

export default async function TeacherListeningAssignPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;
  return <ListeningAssignTabPage role="teacher" presetSetId={set} />;
}
