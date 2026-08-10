import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { assertDailyTaskAccessible } from "@/lib/listening/schedule/task-access";
import { loadDailyTaskProgressMap } from "@/lib/listening/schedule/update-progress";
import { StudentListeningPractice } from "@/components/listening/StudentListeningPractice";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentListeningDailyTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: task } = await admin
    .from("listening_daily_tasks")
    .select(
      "id, student_id, assignment_id, set_id, question_ids, status, task_date"
    )
    .eq("id", taskId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!task) notFound();

  const todayIso = getTodayIsoKorea();
  const access = await assertDailyTaskAccessible(admin, {
    studentId: profile.id,
    task: {
      id: task.id as string,
      assignment_id: task.assignment_id as string,
      task_date: task.task_date as string,
    },
    todayIso,
  });
  if (!access.ok) {
    if (access.blockingTaskId && access.blockingTaskId !== taskId) {
      redirect(`/student/listening/daily/${access.blockingTaskId}`);
    }
    redirect("/student/listening");
  }

  const { data: assignment } = await admin
    .from("listening_schedule_assignments")
    .select(
      "title, require_dictation_pass, dictation_pass_score, lock_next_until_today_complete"
    )
    .eq("id", task.assignment_id)
    .maybeSingle();

  const { data: set } = await admin
    .from("listening_sets")
    .select(
      "id, title, dictation_enabled, dictation_pass_score, dictation_blank_level, dictation_randomize_on_retry, dictation_lock_next_until_pass"
    )
    .eq("id", task.set_id)
    .maybeSingle();

  if (!set) notFound();

  const questionIds = (task.question_ids as string[]) ?? [];
  const { data: allQuestions } = await admin
    .from("listening_questions")
    .select(
      "id, order_index, question_type, instruction, question_text, choices, correct_answer, audio_url, script_text, script_translation, answer_clue, explanation, table_data"
    )
    .eq("set_id", task.set_id)
    .in("id", questionIds);

  const byId = new Map((allQuestions ?? []).map((q) => [q.id, q]));
  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q);

  const progressMap = await loadDailyTaskProgressMap(admin, taskId, profile.id);

  const requireDictation = assignment?.require_dictation_pass !== false;
  const passScore = assignment?.dictation_pass_score ?? 80;

  return (
    <div>
      <Link
        href="/student/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 목록
      </Link>
      <p className="mt-2 text-xs text-slate-500">
        {assignment?.title ?? "스케줄 과제"} · {task.task_date} · 오늘{" "}
        {ordered.length}문항
      </p>
      <div className="mt-4">
        <StudentListeningPractice
          setId={task.set_id}
          setTitle={set.title}
          dictationSettings={{
            dictation_enabled:
              requireDictation && (set.dictation_enabled ?? true),
            dictation_pass_score: passScore,
            dictation_blank_level:
              (set.dictation_blank_level as
                | "auto"
                | "few"
                | "normal"
                | "many") ?? "auto",
            dictation_randomize_on_retry:
              set.dictation_randomize_on_retry ?? true,
            dictation_lock_next_until_pass: true,
          }}
          scheduleMode={{
            dailyTaskId: taskId,
            requireDictationPass: requireDictation,
            dictationPassScore: passScore,
            initialProgress: progressMap,
          }}
          questions={ordered.map((q) => ({
            id: q.id,
            order_index: q.order_index,
            question_type: q.question_type ?? "",
            instruction: q.instruction ?? "",
            question_text: q.question_text ?? "",
            choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
            correct_answer: q.correct_answer ?? 1,
            audio_url: q.audio_url,
            script_text: q.script_text ?? "",
            script_translation: q.script_translation ?? "",
            answer_clue: q.answer_clue ?? "",
            explanation: q.explanation ?? "",
            table_data:
              q.table_data && typeof q.table_data === "object"
                ? q.table_data
                : null,
          }))}
        />
      </div>
    </div>
  );
}
