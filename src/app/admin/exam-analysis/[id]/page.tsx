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
  /*
   * 내가 만든 자료와 대조한 적중표. 모델을 부르지 않고 글자로만 맞춰 보므로 값이 안 든다.
   * 터지더라도 분석 화면은 떠야 하므로 감싼다(선생님 지시 2026-10-01).
   */
  // 담아 둔 적중표를 그대로 보여 준다. 대조는 「대조하기」를 눌렀을 때만 돈다(값이 나간다).
  const a = data.analysis as unknown as { hit_report?: unknown; hit_report_at?: string | null };
  const hitReport = (a.hit_report ?? null) as never;
  const hitReportAt = a.hit_report_at ?? null;

  return (
    <ExamReportView
      key={data.analysis.id}
      analysis={data.analysis}
      items={data.items}
      academyName={branding.name}
      listHref="/admin/exam-analysis"
      mocks={mocks}
      hitReport={hitReport}
      hitReportAt={hitReportAt}
      generationsHref="/admin/question-generator/generations"
    />
  );
}
