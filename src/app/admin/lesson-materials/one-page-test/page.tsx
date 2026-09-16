import { OnePagePage } from "@/components/lesson-materials/one-page/OnePagePage";

export default async function AdminOnePageTestPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string }>;
}) {
  return <OnePagePage role="admin" mode="test" params={await searchParams} />;
}
