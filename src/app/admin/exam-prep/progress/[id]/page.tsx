import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";

const BASE = "/admin/exam-prep";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminExamPrepProgressDetailPage({
  params,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: asRow } = await supabase
    .from("exam_assignment_students")
    .select(
      "*, student:profiles!exam_assignment_students_student_id_fkey(name), exam_assignments(title, workbook_id)"
    )
    .eq("id", id)
    .eq("academy_id", profile.academy_id)
    .maybeSingle();

  if (!asRow) notFound();

  const [{ data: attempts }, { data: wrongs }] = await Promise.all([
    supabase
      .from("exam_attempts")
      .select(
        "id, step_id, attempt_number, status, score, correct_count, total_count, submitted_at, exam_workbook_steps(title, step_type, step_order)"
      )
      .eq("assignment_student_id", id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("exam_wrong_answers")
      .select(
        "id, wrong_count, error_category, is_mastered, last_wrong_at, exam_workbook_questions(question_text, question_type)"
      )
      .eq("assignment_student_id", id)
      .order("last_wrong_at", { ascending: false }),
  ]);

  const studentName =
    (asRow.student as { name: string } | null)?.name ?? "학생";
  const assignmentTitle =
    (asRow.exam_assignments as { title: string } | null)?.title ?? "-";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentName} · 학습 상세`}
        description={assignmentTitle}
        action={
          <Link
            href={`${BASE}/progress`}
            className="text-sm text-brand-700 hover:underline"
          >
            목록으로
          </Link>
        }
      />
      <ExamPrepStaffNav basePath={BASE} current="progress" />

      <div className="ui-section-card grid gap-3 sm:grid-cols-4">
        <Stat label="상태" value={String(asRow.status)} />
        <Stat label="진행률" value={`${asRow.progress_rate ?? 0}%`} />
        <Stat
          label="평균 점수"
          value={asRow.total_score != null ? String(asRow.total_score) : "-"}
        />
        <Stat
          label="최근 학습"
          value={
            asRow.last_studied_at
              ? new Date(asRow.last_studied_at).toLocaleString("ko-KR")
              : "-"
          }
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-900">응시 기록</h3>
        <ul className="space-y-2 text-sm">
          {(attempts ?? []).map((a) => {
            const stepRaw = a.exam_workbook_steps as
              | { title: string | null; step_type: string; step_order: number }
              | { title: string | null; step_type: string; step_order: number }[]
              | null;
            const step = Array.isArray(stepRaw) ? stepRaw[0] ?? null : stepRaw;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
              >
                <span>
                  #{step?.step_order ?? "?"} {step?.title ?? step?.step_type} ·
                  시도 {a.attempt_number}
                </span>
                <span className="text-slate-600">
                  {a.status}
                  {a.score != null ? ` · ${a.score}점` : ""}
                  {a.correct_count != null
                    ? ` (${a.correct_count}/${a.total_count})`
                    : ""}
                </span>
              </li>
            );
          })}
          {(attempts ?? []).length === 0 && (
            <li className="text-slate-500">응시 기록이 없습니다.</li>
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-900">오답</h3>
        <ul className="space-y-2 text-sm">
          {(wrongs ?? []).map((w) => {
            const qRaw = w.exam_workbook_questions as
              | { question_text: string | null; question_type: string }
              | { question_text: string | null; question_type: string }[]
              | null;
            const q = Array.isArray(qRaw) ? qRaw[0] ?? null : qRaw;
            return (
              <li
                key={w.id}
                className="rounded-lg border border-slate-100 px-3 py-2"
              >
                <p className="font-medium text-slate-800">
                  {q?.question_text ?? w.error_category}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {q?.question_type} · {w.wrong_count}회
                  {w.is_mastered ? " · 숙달" : ""}
                </p>
              </li>
            );
          })}
          {(wrongs ?? []).length === 0 && (
            <li className="text-slate-500">오답이 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
