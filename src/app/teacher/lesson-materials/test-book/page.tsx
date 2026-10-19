import { TestBookPage } from "@/components/lesson-materials/test-book/TestBookPage";

export default async function TeacherTestBookRoute({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; doc?: string; mode?: string }>;
}) {
  return <TestBookPage role="teacher" params={await searchParams} />;
}
