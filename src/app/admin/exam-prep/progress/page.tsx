import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type ProgressRow = {
  id: string;
  status: string;
  progress_rate: number;
  total_score: number | null;
  last_studied_at: string | null;
  student: { name: string } | null;
  exam_assignments: { title: string } | null;
};

export default async function AdminExamPrepProgressPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_assignment_students")
    .select(
      "id, status, progress_rate, total_score, last_studied_at, student:profiles!exam_assignment_students_student_id_fkey(name), exam_assignments(title)"
    )
    .eq("academy_id", profile.academy_id)
    .order("last_studied_at", { ascending: false, nullsFirst: false })
    .limit(200);

  const rows = (data ?? []) as unknown as ProgressRow[];

  return (
    <div>
      <PageHeader
        title="학습 현황"
        description="학생별 내신대비 배정 진행 상황입니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="progress" />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">학생</th>
              <th className="px-4 py-3 font-medium">배정</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">진행률</th>
              <th className="px-4 py-3 font-medium">점수</th>
              <th className="px-4 py-3 font-medium">최근 학습</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`${BASE}/progress/${r.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {r.student?.name ?? "-"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.exam_assignments?.title ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.status}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.progress_rate ?? 0}%
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.total_score ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {r.last_studied_at
                    ? new Date(r.last_studied_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  학습 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
