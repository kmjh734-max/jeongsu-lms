import Link from "next/link";
import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/teacher/exam-prep";

type WorkbookRow = {
  id: string;
  title: string;
  status: string;
  preset_type: string | null;
  updated_at: string;
  exam_passages: { title: string } | null;
};

export default async function TeacherExamPrepWorkbooksPage() {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_workbooks")
    .select(
      "id, title, status, preset_type, updated_at, exam_passages(title)"
    )
    .eq("academy_id", profile.academy_id)
    .order("updated_at", { ascending: false });

  const workbooks = (data ?? []) as unknown as WorkbookRow[];

  return (
    <div>
      <PageHeader
        title="워크북 관리"
        description="프리셋으로 학습 단계를 만들고 문항을 검수·승인합니다."
        action={
          <Link
            href={`${BASE}/workbooks/new`}
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            워크북 생성
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">지문</th>
              <th className="px-4 py-3 font-medium">프리셋</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">수정일</th>
            </tr>
          </thead>
          <tbody>
            {workbooks.map((w) => (
              <tr key={w.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`${BASE}/workbooks/${w.id}/edit`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {w.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.exam_passages?.title ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.preset_type ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(w.updated_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
            {workbooks.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  워크북이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
