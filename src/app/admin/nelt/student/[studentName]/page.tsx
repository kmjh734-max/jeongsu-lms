import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ studentName: string }>;
}

export default async function AdminNeltStudentPage({ params }: PageProps) {
  if (!isNeltEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/admin");

  const { studentName: raw } = await params;
  const studentName = decodeURIComponent(raw).trim();
  if (!studentName) notFound();

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("nelt_reports")
    .select(
      "id, test_date, test_name, attempt_number, overall_level, overall_percentile, source_type, extraction_status"
    )
    .eq("academy_id", profile.academy_id)
    .eq("student_name_raw", studentName)
    .order("test_date", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentName} NELT 영어 성장 리포트`}
        description="회차별 NELT 결과를 바탕으로 학생의 영어 실력 성장과 앞으로의 학습 방향을 분석합니다."
        action={
          <div className="flex gap-2">
            <ButtonLink href="/admin/nelt" variant="secondary" size="sm">
              목록
            </ButtonLink>
            <ButtonLink
              href={`/admin/nelt/import?name=${encodeURIComponent(studentName)}`}
              variant="primary"
              size="sm"
            >
              회차 추가
            </ButtonLink>
          </div>
        }
      />

      <Alert variant="info">
        성장 요약·그래프·학부모용 문구는 회차가 2개 이상 쌓인 뒤 다음
        단계에서 생성됩니다. 지금은 회차 목록만 표시합니다.
      </Alert>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
          회차별 상세 결과
        </div>
        {!reports?.length ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            등록된 회차가 없습니다.{" "}
            <Link
              href={`/admin/nelt/import?name=${encodeURIComponent(studentName)}`}
              className="text-brand-600 hover:underline"
            >
              결과 등록
            </Link>
          </p>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>회차</th>
                  <th>시험일</th>
                  <th>시험명</th>
                  <th>종합 레벨</th>
                  <th>출처</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.attempt_number ?? "—"}</td>
                    <td>{r.test_date ?? "—"}</td>
                    <td>{r.test_name ?? "—"}</td>
                    <td>{r.overall_level ?? "—"}</td>
                    <td>{r.source_type}</td>
                    <td>{r.extraction_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
