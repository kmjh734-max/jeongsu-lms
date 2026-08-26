import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

async function refreshDailyTaskCounts(
  admin: SupabaseClient,
  dailyTaskId: string,
  totalCount: number
): Promise<{ completedCount: number; allDone: boolean }> {
  const { data: progressRows } = await admin
    .from("listening_daily_task_progress")
    .select("completed")
    .eq("daily_task_id", dailyTaskId);

  const completedCount = (progressRows ?? []).filter((r) => r.completed).length;
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
    .eq("id", dailyTaskId);

  return { completedCount, allDone };
}

/**
 * Dictation 없이 completed=true 로 남은 문항을 복구한다.
 * (빈칸 생성 실패·클라이언트 오기록 등으로 세모 상태에서 Dictation 재시도 불가하던 문제)
 */
export async function reconcileDailyTaskDictationProgress(
  admin: SupabaseClient,
  opts: {
    dailyTaskId: string;
    studentId: string;
    setId: string;
    requireDictation: boolean;
    dictationPassScore: number;
  }
): Promise<void> {
  if (!opts.requireDictation) return;

  const { data: task } = await admin
    .from("listening_daily_tasks")
    .select("total_count")
    .eq("id", opts.dailyTaskId)
    .maybeSingle();
  if (!task) return;

  const { data: rows } = await admin
    .from("listening_daily_task_progress")
    .select(
      "question_id, objective_completed, dictation_completed, completed, dictation_score"
    )
    .eq("daily_task_id", opts.dailyTaskId)
    .eq("student_id", opts.studentId);

  let changed = false;

  for (const row of rows ?? []) {
    if (!row.completed && !row.dictation_completed) continue;

    const { data: attempt } = await admin
      .from("listening_dictation_attempts")
      .select("score, passed")
      .eq("student_id", opts.studentId)
      .eq("question_id", row.question_id as string)
      .not("submitted_at", "is", null)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    const score = attempt?.score != null ? (attempt.score as number) : null;
    const dictationOk = score != null && score >= opts.dictationPassScore;

    if (dictationOk) {
      if (!row.completed || !row.dictation_completed) {
        await admin
          .from("listening_daily_task_progress")
          .update({
            dictation_completed: true,
            dictation_score: score,
            completed: !!row.objective_completed,
            completed_at:
              row.objective_completed && dictationOk
                ? new Date().toISOString()
                : null,
          })
          .eq("daily_task_id", opts.dailyTaskId)
          .eq("question_id", row.question_id as string)
          .eq("student_id", opts.studentId);
        changed = true;
      }
      continue;
    }

    // 실제 통과 점수 미달인데 완료로 남아 있으면 되돌림
    if (row.completed || row.dictation_completed) {
      await admin
        .from("listening_daily_task_progress")
        .update({
          dictation_completed: false,
          dictation_score: score,
          completed: false,
          completed_at: null,
        })
        .eq("daily_task_id", opts.dailyTaskId)
        .eq("question_id", row.question_id as string)
        .eq("student_id", opts.studentId);
      changed = true;
    }

    // 세트 기준 passed=true 이지만 배정 점수 미달인 시도는 재도전 가능하도록 표시 해제
    if (attempt?.passed && score != null && score < opts.dictationPassScore) {
      await admin
        .from("listening_dictation_attempts")
        .update({ passed: false })
        .eq("student_id", opts.studentId)
        .eq("question_id", row.question_id as string)
        .eq("passed", true)
        .lt("score", opts.dictationPassScore);
    }
  }

  if (changed) {
    await refreshDailyTaskCounts(
      admin,
      opts.dailyTaskId,
      task.total_count as number
    );
  }
}

export async function updateDailyTaskQuestionProgress(
  admin: SupabaseClient,
  opts: {
    dailyTaskId: string;
    studentId: string;
    questionId: string;
    objectiveCompleted: boolean;
    /** 학생이 고른 객관식 번호(1-based). 있으면 서버에서 정답과 비교해 저장 */
    selectedAnswer?: number | null;
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
  // 하루 과제가 세트 경계를 넘으면 task.set_id 와 문항 set_id 가 다를 수 있음
  if (requireDictation) {
    const { data: attempt } = await admin
      .from("listening_dictation_attempts")
      .select("score, passed, submitted_at, set_id")
      .eq("student_id", opts.studentId)
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

  let objectiveCorrect: boolean | null | undefined;
  let selectedAnswer: number | null | undefined;
  if (
    opts.objectiveCompleted &&
    typeof opts.selectedAnswer === "number" &&
    opts.selectedAnswer > 0
  ) {
    selectedAnswer = Math.floor(opts.selectedAnswer);
    const { data: question } = await admin
      .from("listening_questions")
      .select("correct_answer")
      .eq("id", opts.questionId)
      .maybeSingle();
    const correct = Number(question?.correct_answer);
    if (Number.isFinite(correct) && correct > 0) {
      objectiveCorrect = selectedAnswer === correct;
    }
  }

  const progressPatch: Record<string, unknown> = {
    objective_completed: opts.objectiveCompleted,
    dictation_completed: dictationCompleted,
    dictation_score: dictationScore,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  };
  if (objectiveCorrect !== undefined) {
    progressPatch.objective_correct = objectiveCorrect;
  }
  if (selectedAnswer !== undefined) {
    progressPatch.selected_answer = selectedAnswer;
  }

  await admin
    .from("listening_daily_task_progress")
    .update(progressPatch)
    .eq("daily_task_id", opts.dailyTaskId)
    .eq("question_id", opts.questionId)
    .eq("student_id", opts.studentId);

  const { allDone } = await refreshDailyTaskCounts(
    admin,
    opts.dailyTaskId,
    task.total_count as number
  );

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
