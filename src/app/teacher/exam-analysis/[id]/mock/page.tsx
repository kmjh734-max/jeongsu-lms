import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeatureCost } from "@/lib/credits";
import { buildMockSlots } from "@/lib/exam-analysis/blueprint";
import { loadExamAnalysis, loadExamMocks, loadMaterialPassages } from "@/lib/exam-analysis/load";
import { ExamMockBuilder } from "@/components/exam-analysis/ExamMockBuilder";
import { isTextbookPassageOpen } from "@/lib/textbooks/shared-passages";

export default async function ExamMockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ passages?: string }>;
}) {
  const { id } = await params;
  const { passages } = await searchParams;
  const profile = await getCurrentProfile();
  const academyId = profile!.academy_id!;
  const admin = createAdminClient();
  const [data, materials, price, mocks, textbookOpen] = await Promise.all([
    loadExamAnalysis(id, academyId),
    loadMaterialPassages(academyId),
    getFeatureCost(admin, "qg_generate_job"),
    loadExamMocks(id, academyId),
    isTextbookPassageOpen(admin, academyId),
  ]);
  if (!data) notFound();
  const { slots, groupCount } = buildMockSlots(data.items);
  const a = data.analysis;
  return (
    <ExamMockBuilder
      analysisId={id}
      examTitle={[a.school_name, a.grade ? `${a.grade}학년` : "", a.subject, a.exam_label].filter(Boolean).join(" ")}
      slots={slots}
      groupCount={groupCount}
      materials={materials}
      backHref={`/teacher/exam-analysis/${id}`}
      generationsHref="/teacher/question-generator/generations"
      pricePerQuestion={price?.cost ?? 80}
      round={mocks.length + 1}
      initialPassageIds={(passages ?? "").split(",").filter(Boolean)}
      textbookOpen={textbookOpen}
    />
  );
}
