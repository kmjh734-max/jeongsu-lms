import { MiddleSchoolExamPrintPage } from "@/components/middle-school/MiddleSchoolPages";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string; sel: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { unitId, sel } = await params;
  const sp = await searchParams;
  return <MiddleSchoolExamPrintPage base="/admin/middle-school" unitId={unitId} sel={sel} mode={sp.mode === "answers" ? "answers" : "exam"} />;
}
