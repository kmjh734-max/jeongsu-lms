import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeatureCost } from "@/lib/credits";
import { buildMockSlots } from "@/lib/exam-analysis/blueprint";
import { loadExamAnalysis, loadMaterialPassages } from "@/lib/exam-analysis/load";
import { ExamMockBuilder } from "@/components/exam-analysis/ExamMockBuilder";

export default async function ExamMockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const academyId = profile!.academy_id!;
  const [data, materials, price] = await Promise.all([
    loadExamAnalysis(id, academyId),
    loadMaterialPassages(academyId),
    getFeatureCost(createAdminClient(), "qg_generate_job"),
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
    />
  );
}
