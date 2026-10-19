import { TestBookPage } from "@/components/lesson-materials/test-book/TestBookPage";

export default async function AdminTestBookRoute({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string; mode?: string }>;
}) {
  return <TestBookPage role="admin" params={await searchParams} />;
}
