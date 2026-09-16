import { OnePagePage } from "@/components/lesson-materials/one-page/OnePagePage";

export default async function TeacherOnePageTestPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string }>;
}) {
  return <OnePagePage role="teacher" mode="test" params={await searchParams} />;
}
