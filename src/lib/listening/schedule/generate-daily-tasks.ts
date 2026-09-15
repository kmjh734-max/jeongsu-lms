import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  isTaskStarted,
  planStudentDailyTasks,
  type PlanExistingTaskRow,
} from "@/lib/listening/schedule/plan-daily-tasks";
import { buildQuestionQueueForAssignment } from "@/lib/listening/schedule/question-queue";
import { resolveStudentIdsForScheduleAssignment } from "@/lib/listening/schedule/resolve-students";
import {
  getStudentListeningEffectiveStartIso,
  pruneIncompleteTasksBeforeEffectiveStart,
} from "@/lib/listening/schedule/student-effective-start";
import type { QuestionQueueItem } from "@/lib/listening/schedule/types";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

const INSERT_BATCH = 80;

type DailyTaskInsert = {
  assignment_id: string;
  student_id: string;
  task_date: string;
  set_id: string;
  question_ids: string[];
  status: "pending";
  completed_count: number;
  total_count: number;
};

/** 진행 기록(객관식·받아쓰기 중 하나라도)이 있는 과제 id */
const STARTED_PROGRESS_FILTER =
  "objective_completed.eq.true,dictation_completed.eq.true,completed.eq.true,dictation_score.not.is.null";

export async function loadStartedTaskIds(
  admin: SupabaseClient,
  taskIds: string[]
): Promise<Set<string>> {
  const started = new Set<string>();
  for (let i = 0; i < taskIds.length; i += 100) {
    const chunk = taskIds.slice(i, i + 100);
    const { data } = await admin
      .from("listening_daily_task_progress")
      .select("daily_task_id")
      .in("daily_task_id", chunk)
      .or(STARTED_PROGRESS_FILTER);
    for (const row of data ?? []) started.add(row.daily_task_id as string);
  }
  return started;
}

async function insertDailyTasksBatch(
  admin: SupabaseClient,
  rows: DailyTaskInsert[]
): Promise<void> {
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const chunk = rows.slice(i, i + INSERT_BATCH);
    const { data: inserted, error } = await admin
      .from("listening_daily_tasks")
      .insert(chunk)
      .select("id, student_id, question_ids");

    if (error || !inserted?.length) continue;

    const progressRows = inserted.flatMap((task) =>
      ((task.question_ids as string[]) ?? []).map((questionId) => ({
        daily_task_id: task.id as string,
        student_id: task.student_id as string,
        question_id: questionId,
        objective_completed: false,
        dictation_completed: false,
        completed: false,
      }))
    );

    for (let j = 0; j < progressRows.length; j += INSERT_BATCH) {
      await admin
        .from("listening_daily_task_progress")
        .insert(progressRows.slice(j, j + INSERT_BATCH));
    }
  }
}

export async function ensureDailyTaskForStudentDate(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  studentId: string,
  taskDateIso: string,
  queue?: QuestionQueueItem[],
  effectiveStartIso?: string
): Promise<{ created: boolean; taskId: string | null }> {
  const effectiveStart =
    effectiveStartIso ??
    (await getStudentListeningEffectiveStartIso(admin, assignment, studentId));
  if (taskDateIso < effectiveStart) {
    return { created: false, taskId: null };
  }

  const { data: before } = await admin
    .from("listening_daily_tasks")
    .select("id")
    .eq("assignment_id", assignment.id)
    .eq("student_id", studentId)
    .eq("task_date", taskDateIso)
    .maybeSingle();

  await ensureDailyTasksForStudentRange(
    admin,
    assignment,
    studentId,
    taskDateIso,
    taskDateIso,
    queue,
    effectiveStart
  );

  const { data: after } = await admin
    .from("listening_daily_tasks")
    .select("id")
    .eq("assignment_id", assignment.id)
    .eq("student_id", studentId)
    .eq("task_date", taskDateIso)
    .maybeSingle();

  return {
    created: !before?.id && Boolean(after?.id),
    taskId: (after?.id as string | undefined) ?? null,
  };
}

export async function ensureDailyTasksForStudentRange(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  studentId: string,
  fromIso: string,
  toIso: string,
  queue?: QuestionQueueItem[],
  effectiveStartIso?: string
): Promise<void> {
  const effectiveStart =
    effectiveStartIso ??
    (await getStudentListeningEffectiveStartIso(admin, assignment, studentId));

  await pruneIncompleteTasksBeforeEffectiveStart(admin, {
    studentId,
    assignmentId: assignment.id,
    effectiveStartIso: effectiveStart,
  });

  const clampedFrom = fromIso < effectiveStart ? effectiveStart : fromIso;
  if (clampedFrom > toIso) return;

  const resolvedQueue =
    queue ?? (await buildQuestionQueueForAssignment(admin, assignment.id));
  if (resolvedQueue.length === 0) return;

  const todayIso = getTodayIsoKorea();
  const { data: existingAll } = await admin
    .from("listening_daily_tasks")
    .select("id, task_date, status, completed_count, question_ids, set_id")
    .eq("assignment_id", assignment.id)
    .eq("student_id", studentId);

  const existingRows = (existingAll ?? []) as PlanExistingTaskRow[];

  const completedQuestionIds = new Set<string>();
  const queueIds = resolvedQueue.map((q) => q.questionId);
  for (let i = 0; i < queueIds.length; i += 100) {
    const chunk = queueIds.slice(i, i + 100);
    const { data: doneRows } = await admin
      .from("listening_daily_task_progress")
      .select("question_id")
      .eq("student_id", studentId)
      .eq("completed", true)
      .in("question_id", chunk);
    for (const row of doneRows ?? []) {
      completedQuestionIds.add(row.question_id as string);
    }
  }

  // 오늘 과제를 풀기 시작했으면(끝낸 문항이 아직 없어도) 그대로 둔다
  const startedTaskIds = await loadStartedTaskIds(
    admin,
    existingRows
      .filter((row) => row.task_date >= todayIso && !isTaskStarted(row))
      .map((row) => row.id)
  );

  const { idsToDelete, inserts } = planStudentDailyTasks({
    assignment,
    queue: resolvedQueue,
    existingRows,
    completedQuestionIds,
    startedTaskIds,
    todayIso,
    fromIso: clampedFrom,
    toIso,
  });

  const pending: DailyTaskInsert[] = inserts.map((task) => ({
    assignment_id: assignment.id,
    student_id: studentId,
    task_date: task.task_date,
    set_id: task.set_id,
    question_ids: task.question_ids,
    status: "pending",
    completed_count: 0,
    total_count: task.question_ids.length,
  }));

  if (idsToDelete.length > 0) {
    await admin.from("listening_daily_tasks").delete().in("id", idsToDelete);
  }

  if (pending.length > 0) {
    await insertDailyTasksBatch(admin, pending);
  }
}

export async function bootstrapDailyTasksForAssignment(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  horizonDays = 30
): Promise<void> {
  const studentIds = await resolveStudentIdsForScheduleAssignment(
    admin,
    assignment
  );
  if (studentIds.length === 0) return;

  const queue = await buildQuestionQueueForAssignment(admin, assignment.id);
  if (queue.length === 0) return;

  const start = parseDateOnly(assignment.start_date);
  const end = assignment.end_date
    ? parseDateOnly(assignment.end_date)
    : new Date(start.getTime() + horizonDays * 86400000);
  const today = new Date();
  const to =
    end < today
      ? end
      : new Date(
          Math.min(end.getTime(), today.getTime() + horizonDays * 86400000)
        );

  const fromIso = assignment.start_date;
  const toIso = toDateOnlyString(to);
  if (fromIso > toIso) return;

  for (const studentId of studentIds) {
    const effectiveStart = await getStudentListeningEffectiveStartIso(
      admin,
      assignment,
      studentId
    );
    const studentFrom = fromIso < effectiveStart ? effectiveStart : fromIso;
    if (studentFrom > toIso) continue;

    await ensureDailyTasksForStudentRange(
      admin,
      assignment,
      studentId,
      studentFrom,
      toIso,
      queue,
      effectiveStart
    );
  }
}
