import { MiddleSchoolUnitPage } from "@/components/middle-school/MiddleSchoolPages";

export default async function Page({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  return <MiddleSchoolUnitPage base="/teacher/middle-school" unitId={unitId} />;
}
