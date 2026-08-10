import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getStudyDayIndex,
  isStudyDay,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  buildQuestionQueueForAssignment,
  sliceQuestionsForStudyDay,
} from "@/lib/listening/schedule/question-queue";
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

function isTaskDateInAssignment(
  taskDateIso: string,
  assignment: ScheduleAssignmentRow
): boolean {
  const taskDate = parseDateOnly(taskDateIso);
  const start = parseDateOnly(assignment.start_date);
  const end = assignment.end_date ? parseDateOnly(assignment.end_date) : null;
  if (taskDate < start) return false;
  if (end && taskDate > end) return false;
  return isStudyDay(taskDate, assignment.days_of_week);
}

function buildTaskRowForDate(
  assignment: ScheduleAssignmentRow,
  studentId: string,
  taskDateIso: string,
  queue: QuestionQueueItem[]
): DailyTaskInsert | null {
  if (!isTaskDateInAssignment(taskDateIso, assignment)) return null;

  const studyDayIndex = getStudyDayIndex(
    assignment.start_date,
    taskDateIso,
    assignment.days_of_week
  );
  if (studyDayIndex < 0) return null;

  const slice = sliceQuestionsForStudyDay(
    queue,
    studyDayIndex,
    assignment.questions_per_day
  );
  if (!slice || slice.questionIds.length === 0) return null;

  return {
    assignment_id: assignment.id,
    student_id: studentId,
    task_date: taskDateIso,
    set_id: slice.setId,
    question_ids: slice.questionIds,
    status: "pending",
    completed_count: 0,
    total_count: slice.questionIds.length,
  };
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

  const { data: existing } = await admin
    .from("listening_daily_tasks")
    .select("id")
    .eq("assignment_id", assignment.id)
    .eq("student_id", studentId)
    .eq("task_date", taskDateIso)
    .maybeSingle();

  if (existing?.id) {
    return { created: false, taskId: existing.id as string };
  }

  const resolvedQueue =
    queue ?? (await buildQuestionQueueForAssignment(admin, assignment.id));
  const row = buildTaskRowForDate(
    assignment,
    studentId,
    taskDateIso,
    resolvedQueue
  );
  if (!row) return { created: false, taskId: null };

  const { data: inserted, error } = await admin
    .from("listening_daily_tasks")
    .insert(row)
    .select("id")
    .single();

  if (error || !inserted) {
    return { created: false, taskId: null };
  }

  const progressRows = row.question_ids.map((questionId) => ({
    daily_task_id: inserted.id as string,
    student_id: studentId,
    question_id: questionId,
    objective_completed: false,
    dictation_completed: false,
    completed: false,
  }));

  await admin.from("listening_daily_task_progress").insert(progressRows);

  return { created: true, taskId: inserted.id as string };
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

  const { data: existingRows } = await admin
    .from("listening_daily_tasks")
    .select("task_date")
    .eq("assignment_id", assignment.id)
    .eq("student_id", studentId)
    .gte("task_date", clampedFrom)
    .lte("task_date", toIso);

  const existingDates = new Set(
    (existingRows ?? []).map((r) => r.task_date as string)
  );

  const pending: DailyTaskInsert[] = [];
  const from = parseDateOnly(clampedFrom);
  const to = parseDateOnly(toIso);
  const cursor = new Date(from);

  while (cursor <= to) {
    const iso = toDateOnlyString(cursor);
    if (!existingDates.has(iso)) {
      const row = buildTaskRowForDate(
        assignment,
        studentId,
        iso,
        resolvedQueue
      );
      if (row) pending.push(row);
    }
    cursor.setDate(cursor.getDate() + 1);
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
