import { FinalBundlePage } from "@/components/lesson-materials/integrated/FinalBundlePage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc } = await searchParams;
  return <FinalBundlePage role="teacher" docId={doc} />;
}
