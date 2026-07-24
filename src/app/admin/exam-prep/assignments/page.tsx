import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type AssignmentRow = {
  id: string;
  title: string;
  due_at: string | null;
  created_at: string;
  exam_workbooks: { title: string } | null;
};

export default async function AdminExamPrepAssignmentsPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_assignments")
    .select("id, title, due_at, created_at, exam_workbooks(title)")
    .eq("academy_id", profile.academy_id)
    .order("created_at", { ascending: false });

  const assignments = (data ?? []) as unknown as AssignmentRow[];

  return (
    <div>
      <PageHeader
        title="학습 배정"
        description="승인된 워크북을 학생·반에 배정합니다."
        action={
          <Link
            href={`${BASE}/assignments/new`}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            새 배정
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="assignments" />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">워크북</th>
              <th className="px-4 py-3 font-medium">마감</th>
              <th className="px-4 py-3 font-medium">생성일</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {a.title}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {a.exam_workbooks?.title ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {a.due_at
                    ? new Date(a.due_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  배정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
