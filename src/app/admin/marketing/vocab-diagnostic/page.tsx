import { notFound } from "next/navigation";
import { DiagAdminClient } from "@/components/vocab-diagnostic/DiagAdminClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDiagStaff } from "@/lib/vocab-diagnostic/access";
import { listInvites, listPeople, listResults, listTests } from "@/lib/vocab-diagnostic/admin-queries";

export const dynamic = "force-dynamic";

export default async function VocabDiagnosticPage() {
  const staff = await getDiagStaff();
  if (!staff) notFound();
  const [tests, invites, results, people] = await Promise.all([
    listTests(staff.academyId),
    listInvites(staff.academyId),
    listResults(staff.academyId),
    listPeople(staff.academyId),
  ]);
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="예비고1·예비중1 어휘 진단"
        description="정수학원 단어장으로 진단 시험을 확정하고, 학생마다 응시 링크를 보내 결과를 상담과 복습 안내에 씁니다."
      />
      <DiagAdminClient
        tests={tests.map((t) => ({
          id: t.id,
          target: t.target,
          title: t.title,
          version: t.version,
          status: t.status,
          isActive: t.is_active,
          questionCount: t.question_count,
          minutes: t.recommended_minutes,
          confirmedAt: t.confirmed_at,
          updatedAt: t.updated_at,
        }))}
        invites={invites}
        results={results}
        people={people}
      />
    </div>
  );
}
