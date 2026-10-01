import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { loadExamAnalysis, loadExamMocks } from "@/lib/exam-analysis/load";
import { ExamReportView } from "@/components/exam-analysis/ExamReportView";
import { buildHitReport } from "@/lib/exam-analysis/hit-report";
import { createAdminClient } from "@/lib/supabase/admin";

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
  let hitReport = null;
  try {
    hitReport = await buildHitReport(
      createAdminClient(),
      profile!.academy_id!,
      data.items,
      // 이 시험지를 올리기 전에 만든 자료만 적중으로 센다
      data.analysis.created_at ?? null
    );
  } catch (e) {
    console.error("hit report failed", e);
  }
  return (
    <ExamReportView
      key={data.analysis.id}
      analysis={data.analysis}
      items={data.items}
      academyName={branding.name}
      listHref="/teacher/exam-analysis"
      mocks={mocks}
      hitReport={hitReport}
      generationsHref="/teacher/question-generator/generations"
    />
  );
}
