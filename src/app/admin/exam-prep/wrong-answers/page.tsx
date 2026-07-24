import { redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

type WrongRow = {
  id: string;
  wrong_count: number;
  error_category: string | null;
  is_mastered: boolean;
  last_wrong_at: string | null;
  student: { name: string } | null;
  exam_workbook_questions: {
    question_text: string | null;
    question_type: string;
  } | null;
};

export default async function AdminExamPrepWrongAnswersPage() {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_wrong_answers")
    .select(
      "id, wrong_count, error_category, is_mastered, last_wrong_at, student:profiles!exam_wrong_answers_student_id_fkey(name), exam_workbook_questions(question_text, question_type)"
    )
    .eq("academy_id", profile.academy_id)
    .eq("is_mastered", false)
    .order("last_wrong_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as WrongRow[];

  return (
    <div>
      <PageHeader
        title="오답 관리"
        description="숙달되지 않은 오답을 모아 봅니다."
      />
      <ExamPrepStaffNav basePath={BASE} current="wrong-answers" />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">학생</th>
              <th className="px-4 py-3 font-medium">문항</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">횟수</th>
              <th className="px-4 py-3 font-medium">최근</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {r.student?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {r.exam_workbook_questions?.question_text ??
                    r.error_category ??
                    "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.exam_workbook_questions?.question_type ??
                    r.error_category ??
                    "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.wrong_count}</td>
                <td className="px-4 py-3 text-slate-500">
                  {r.last_wrong_at
                    ? new Date(r.last_wrong_at).toLocaleDateString("ko-KR")
                    : "-"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  오답이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
