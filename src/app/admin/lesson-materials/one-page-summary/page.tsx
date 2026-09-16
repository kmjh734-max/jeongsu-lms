import { OnePagePage } from "@/components/lesson-materials/one-page/OnePagePage";

export default async function AdminOnePageSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string }>;
}) {
  return <OnePagePage role="admin" mode="summary" params={await searchParams} />;
}
