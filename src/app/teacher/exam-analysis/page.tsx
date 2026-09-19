import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ExamAnalysisListPage } from "@/components/exam-analysis/ExamAnalysisListPage";

export default async function ExamAnalysisPage() {
  const profile = await getCurrentProfile();
  return <ExamAnalysisListPage academyId={profile!.academy_id!} basePath="/teacher/exam-analysis" />;
}
