import { HitBookPage } from "@/components/exam-analysis/HitBookPage";

export const maxDuration = 120;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HitBookPage id={id} backHref={`/admin/exam-analysis/${id}`} />;
}
