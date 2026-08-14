import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getStudyDayIndex,
  isStudyDay,
  listStudyDatesInclusive,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  buildLeftoverDailySlices,
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

function sameIdList(a: string[] | null | undefined, b: string[]): boolean {
  const left = a ?? [];
  if (left.length !== b.length) return false;
  return left.every((id, i) => id === b[i]);
}

type ExistingTaskRow = {
  id: string;
  task_date: string;
  status: string;
  completed_count: number | null;
  question_ids: string[] | null;
  set_id: string;
};

function isLockedExistingTask(row: ExistingTaskRow, todayIso: string): boolean {
  if (row.task_date < todayIso) return true;
  if (row.status === "completed" || row.status === "in_progress") return true;
  if ((row.completed_count ?? 0) > 0) return true;
  return false;
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

  const existingRows = (existingAll ?? []) as ExistingTaskRow[];
  const locked = existingRows.filter((row) =>
    isLockedExistingTask(row, todayIso)
  );
  const unlockedInRange = existingRows.filter(
    (row) =>
      !isLockedExistingTask(row, todayIso) &&
      row.task_date >= clampedFrom &&
      row.task_date <= toIso
  );

  const consumed = new Set<string>();
  for (const row of locked) {
    for (const id of row.question_ids ?? []) consumed.add(id);
  }

  const lockedByDate = new Map(locked.map((row) => [row.task_date, row]));
  const unlockedByDate = new Map(
    unlockedInRange.map((row) => [row.task_date, row])
  );
  const existingByDate = new Map(
    existingRows.map((row) => [row.task_date, row])
  );

  const studyDates = listStudyDatesInclusive(
    clampedFrom,
    toIso,
    assignment.days_of_week
  ).filter((iso) => isTaskDateInAssignment(iso, assignment));

  const pending: DailyTaskInsert[] = [];
  const idsToDelete: string[] = [];

  for (const iso of studyDates) {
    if (iso >= todayIso) continue;
    if (existingByDate.has(iso)) continue;
    const row = buildTaskRowForDate(
      assignment,
      studentId,
      iso,
      resolvedQueue
    );
    if (row) pending.push(row);
  }

  const futureDates = studyDates.filter(
    (iso) => iso >= todayIso && !lockedByDate.has(iso)
  );

  if (locked.length === 0) {
    for (const iso of futureDates) {
      const expected = buildTaskRowForDate(
        assignment,
        studentId,
        iso,
        resolvedQueue
      );
      const existing = unlockedByDate.get(iso);
      if (!expected) {
        if (existing) idsToDelete.push(existing.id);
        continue;
      }
      if (
        existing &&
        existing.set_id === expected.set_id &&
        sameIdList(existing.question_ids, expected.question_ids)
      ) {
        continue;
      }
      if (existing) idsToDelete.push(existing.id);
      pending.push(expected);
    }
  } else {
    const slices = buildLeftoverDailySlices(
      resolvedQueue,
      consumed,
      assignment.questions_per_day
    );
    futureDates.forEach((iso, i) => {
      const slice = slices[i];
      const existing = unlockedByDate.get(iso);
      if (!slice) {
        if (existing) idsToDelete.push(existing.id);
        return;
      }
      if (
        existing &&
        existing.set_id === slice.setId &&
        sameIdList(existing.question_ids, slice.questionIds)
      ) {
        return;
      }
      if (existing) idsToDelete.push(existing.id);
      pending.push({
        assignment_id: assignment.id,
        student_id: studentId,
        task_date: iso,
        set_id: slice.setId,
        question_ids: slice.questionIds,
        status: "pending",
        completed_count: 0,
        total_count: slice.questionIds.length,
      });
    });
  }

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
