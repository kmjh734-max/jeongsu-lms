import { OnePagePage } from "@/components/lesson-materials/one-page/OnePagePage";

export default async function TeacherOnePageSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string }>;
}) {
  return <OnePagePage role="teacher" mode="summary" params={await searchParams} />;
}
