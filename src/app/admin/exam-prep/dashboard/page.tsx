import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { loadExamPrepClassDashboard } from "@/lib/exam-prep/load-class-dashboard";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

export default async function AdminExamPrepDashboardPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const rows = await loadExamPrepClassDashboard(supabase, profile.academy_id);
  const totals = {
    students: rows.reduce((s, r) => s + r.studentCount, 0),
    review: rows.reduce((s, r) => s + r.needsReviewCount, 0),
    wrong: rows.reduce((s, r) => s + r.wrongOpenCount, 0),
    completed: rows.reduce((s, r) => s + r.completedCount, 0),
  };

  return (
    <div>
      <PageHeader
        title="클래스 대시보드"
        description="반별 진도·점수·검토 대기·미숙달 오답을 한눈에 봅니다."
        action={
          <Link
            href={`${BASE}/progress`}
            className="text-sm text-brand-700 hover:underline"
          >
            학생별 현황
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="dashboard" />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="배정 건수(행)" value={String(totals.students)} />
        <StatCard label="완료" value={String(totals.completed)} />
        <StatCard label="검토 대기" value={String(totals.review)} />
        <StatCard label="미숙달 오답" value={String(totals.wrong)} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">반</th>
              <th className="px-4 py-3 font-medium">배정</th>
              <th className="px-4 py-3 font-medium">학습 행</th>
              <th className="px-4 py-3 font-medium">평균 진도</th>
              <th className="px-4 py-3 font-medium">평균 점수</th>
              <th className="px-4 py-3 font-medium">완료</th>
              <th className="px-4 py-3 font-medium">검토</th>
              <th className="px-4 py-3 font-medium">오답</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.classId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {r.className}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.assignmentCount}</td>
                <td className="px-4 py-3 text-slate-600">{r.studentCount}</td>
                <td className="px-4 py-3 text-slate-600">{r.avgProgress}%</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.avgScore != null ? r.avgScore : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.completedCount}</td>
                <td
                  className={`px-4 py-3 ${
                    r.needsReviewCount > 0
                      ? "font-semibold text-amber-700"
                      : "text-slate-600"
                  }`}
                >
                  {r.needsReviewCount}
                </td>
                <td
                  className={`px-4 py-3 ${
                    r.wrongOpenCount > 0
                      ? "font-semibold text-rose-700"
                      : "text-slate-600"
                  }`}
                >
                  {r.wrongOpenCount}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  반 또는 반 배정 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
