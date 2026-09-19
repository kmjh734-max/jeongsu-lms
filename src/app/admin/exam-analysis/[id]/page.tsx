import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadExamAnalysis, loadExamMocks } from "@/lib/exam-analysis/load";
import { ExamReportView } from "@/components/exam-analysis/ExamReportView";

export default async function ExamAnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const [data, branding, mocks] = await Promise.all([
    loadExamAnalysis(id, profile!.academy_id!),
    getAcademyBrandingForCurrentUser(),
    loadExamMocks(id, profile!.academy_id!),
  ]);
  if (!data) notFound();
  return (
    <ExamReportView
      key={data.analysis.id}
      analysis={data.analysis}
      items={data.items}
      academyName={branding.name}
      listHref="/admin/exam-analysis"
      mocks={mocks}
      generationsHref="/admin/question-generator/generations"
    />
  );
}
