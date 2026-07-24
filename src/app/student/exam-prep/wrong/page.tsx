import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

type WrongRow = {
  id: string;
  wrong_count: number;
  error_category: string | null;
  is_mastered: boolean;
  last_wrong_at: string | null;
  assignment_student_id: string;
  exam_workbook_questions: {
    question_text: string | null;
    question_type: string;
  } | null;
};

export default async function StudentExamPrepWrongPage() {
  if (!isExamPrepEnabled()) redirect("/student");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_wrong_answers")
    .select(
      "id, wrong_count, error_category, is_mastered, last_wrong_at, assignment_student_id, exam_workbook_questions(question_text, question_type)"
    )
    .eq("student_id", profile.id)
    .order("last_wrong_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as unknown as WrongRow[];

  return (
    <div>
      <PageHeader
        title="내 오답"
        description="틀린 문항을 다시 확인하세요."
        action={
          <Link
            href="/student/exam-prep"
            className="text-sm text-brand-700 hover:underline"
          >
            학습 목록
          </Link>
        }
      />

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {r.exam_workbook_questions?.question_text ??
                    r.error_category ??
                    "오답"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {r.exam_workbook_questions?.question_type ??
                    r.error_category}{" "}
                  · {r.wrong_count}회
                  {r.is_mastered ? " · 숙달" : ""}
                  {r.last_wrong_at
                    ? ` · ${new Date(r.last_wrong_at).toLocaleDateString("ko-KR")}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/student/exam-prep/${r.assignment_student_id}`}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                다시 풀기
              </Link>
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            오답이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}
