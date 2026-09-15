import { ListeningSetDetailPage } from "@/components/listening/ListeningPages";

export default async function TeacherListeningSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { setId } = await params;
  const { step } = await searchParams;
  return <ListeningSetDetailPage role="teacher" setId={setId} step={step} />;
}
