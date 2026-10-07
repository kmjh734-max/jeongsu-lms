import { notFound } from "next/navigation";
import { DiagAdminClient } from "@/components/vocab-diagnostic/DiagAdminClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDiagStaff } from "@/lib/vocab-diagnostic/access";
import { listResults, loadSetup } from "@/lib/vocab-diagnostic/admin-queries";

export const dynamic = "force-dynamic";

export default async function VocabDiagnosticPage() {
  const staff = await getDiagStaff();
  if (!staff) notFound();
  const [setup, results] = await Promise.all([loadSetup(staff.academyId), listResults(staff.academyId)]);
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="예비고1·예비중1 어휘 진단"
        description="링크 하나를 알리면, 학생이 예비고1·예비중1을 고르고 이름을 적어 바로 응시합니다. 단어는 응시할 때마다 단어장에서 고르게 뽑힙니다."
      />
      <DiagAdminClient
        link={setup.link}
        tests={setup.tests.map((t) => ({
          target: t.target,
          title: t.title,
          isActive: t.is_active,
          questionCount: t.question_count,
          minutes: t.recommended_minutes,
          intro: t.intro_text,
        }))}
        results={results}
      />
    </div>
  );
}
