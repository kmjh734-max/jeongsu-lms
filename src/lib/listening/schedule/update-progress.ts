import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";
import { assertDailyTaskAccessible } from "@/lib/listening/schedule/task-access";

export async function updateDailyTaskQuestionProgress(
  admin: SupabaseClient,
  opts: {
    dailyTaskId: string;
    studentId: string;
    questionId: string;
    objectiveCompleted: boolean;
    dictationCompleted?: boolean;
    dictationScore?: number | null;
    requireDictationPass: boolean;
    dictationPassScore: number;
  }
): Promise<{ ok: boolean; message?: string; taskCompleted?: boolean }> {
  const { data: task } = await admin
    .from("listening_daily_tasks")
    .select(
      "id, student_id, assignment_id, set_id, question_ids, completed_count, total_count, status, task_date"
    )
    .eq("id", opts.dailyTaskId)
    .maybeSingle();

  if (!task || task.student_id !== opts.studentId) {
    return { ok: false, message: "오늘 과제를 찾을 수 없습니다." };
  }

  const questionIds = (task.question_ids as string[]) ?? [];
  if (!questionIds.includes(opts.questionId)) {
    return { ok: false, message: "이 과제의 문항이 아닙니다." };
  }

  const access = await assertDailyTaskAccessible(admin, {
    studentId: opts.studentId,
    task: {
      id: task.id as string,
      assignment_id: task.assignment_id as string,
      task_date: task.task_date as string,
    },
  });
  if (!access.ok) {
    return { ok: false, message: access.message };
  }

  const [{ data: assignment }, { data: set }] = await Promise.all([
    admin
      .from("listening_schedule_assignments")
      .select("require_dictation_pass, dictation_pass_score")
      .eq("id", task.assignment_id)
      .maybeSingle(),
    admin
      .from("listening_sets")
      .select("dictation_enabled")
      .eq("id", task.set_id as string)
      .maybeSingle(),
  ]);

  const requireDictation =
    (assignment?.require_dictation_pass ?? opts.requireDictationPass) &&
    set?.dictation_enabled !== false;
  const passScore =
    assignment?.dictation_pass_score ?? opts.dictationPassScore;

  let dictationCompleted = opts.dictationCompleted ?? false;
  let dictationScore = opts.dictationScore ?? null;

  // Dictation은 DB 제출 기록으로만 통과 인정 (클라이언트 값 신뢰 금지)
  if (requireDictation) {
    const { data: attempt } = await admin
      .from("listening_dictation_attempts")
      .select("score, passed, submitted_at")
      .eq("student_id", opts.studentId)
      .eq("set_id", task.set_id as string)
      .eq("question_id", opts.questionId)
      .not("submitted_at", "is", null)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attempt && attempt.score != null) {
      dictationScore = attempt.score as number;
      dictationCompleted = dictationScore >= passScore;
    } else {
      dictationCompleted = false;
      dictationScore = null;
    }
  }

  const dictationOk = !requireDictation || dictationCompleted;
  const completed = opts.objectiveCompleted && dictationOk;

  await admin
    .from("listening_daily_task_progress")
    .update({
      objective_completed: opts.objectiveCompleted,
      dictation_completed: dictationCompleted,
      dictation_score: dictationScore,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("daily_task_id", opts.dailyTaskId)
    .eq("question_id", opts.questionId)
    .eq("student_id", opts.studentId);

  const { data: progressRows } = await admin
    .from("listening_daily_task_progress")
    .select("completed")
    .eq("daily_task_id", opts.dailyTaskId);

  const completedCount = (progressRows ?? []).filter((r) => r.completed).length;
  const totalCount = task.total_count as number;
  const allDone = completedCount >= totalCount && totalCount > 0;

  const nextStatus = allDone
    ? "completed"
    : completedCount > 0
      ? "in_progress"
      : "pending";

  await admin
    .from("listening_daily_tasks")
    .update({
      completed_count: completedCount,
      status: nextStatus,
      completed_at: allDone ? new Date().toISOString() : null,
    })
    .eq("id", opts.dailyTaskId);

  return { ok: true, taskCompleted: allDone };
}

export async function loadDailyTaskProgressMap(
  admin: SupabaseClient,
  dailyTaskId: string,
  studentId: string
): Promise<
  Record<
    string,
    {
      objectiveCompleted: boolean;
      dictationCompleted: boolean;
      completed: boolean;
    }
  >
> {
  const { data } = await admin
    .from("listening_daily_task_progress")
    .select("question_id, objective_completed, dictation_completed, completed")
    .eq("daily_task_id", dailyTaskId)
    .eq("student_id", studentId);

  const out: Record<
    string,
    {
      objectiveCompleted: boolean;
      dictationCompleted: boolean;
      completed: boolean;
    }
  > = {};

  for (const row of data ?? []) {
    out[row.question_id as string] = {
      objectiveCompleted: !!row.objective_completed,
      dictationCompleted: !!row.dictation_completed,
      completed: !!row.completed,
    };
  }
  return out;
}

export async function getAssignmentForDailyTask(
  admin: SupabaseClient,
  dailyTaskId: string
): Promise<ScheduleAssignmentRow | null> {
  const { data: task } = await admin
    .from("listening_daily_tasks")
    .select("assignment_id")
    .eq("id", dailyTaskId)
    .maybeSingle();
  if (!task) return null;

  const { data: assignment } = await admin
    .from("listening_schedule_assignments")
    .select("*")
    .eq("id", task.assignment_id)
    .maybeSingle();

  return (assignment as ScheduleAssignmentRow) ?? null;
}
