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
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export async function ensureDailyTaskForStudentDate(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  studentId: string,
  taskDateIso: string
): Promise<{ created: boolean; taskId: string | null }> {
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

  const taskDate = parseDateOnly(taskDateIso);
  const start = parseDateOnly(assignment.start_date);
  const end = assignment.end_date ? parseDateOnly(assignment.end_date) : null;

  if (taskDate < start) return { created: false, taskId: null };
  if (end && taskDate > end) return { created: false, taskId: null };
  if (!isStudyDay(taskDate, assignment.days_of_week)) {
    return { created: false, taskId: null };
  }

  const studyDayIndex = getStudyDayIndex(
    assignment.start_date,
    taskDateIso,
    assignment.days_of_week
  );
  if (studyDayIndex < 0) return { created: false, taskId: null };

  const queue = await buildQuestionQueueForAssignment(admin, assignment.id);
  const slice = sliceQuestionsForStudyDay(
    queue,
    studyDayIndex,
    assignment.questions_per_day
  );
  if (!slice || slice.questionIds.length === 0) {
    return { created: false, taskId: null };
  }

  const { data: inserted, error } = await admin
    .from("listening_daily_tasks")
    .insert({
      assignment_id: assignment.id,
      student_id: studentId,
      task_date: taskDateIso,
      set_id: slice.setId,
      question_ids: slice.questionIds,
      status: "pending",
      completed_count: 0,
      total_count: slice.questionIds.length,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { created: false, taskId: null };
  }

  const progressRows = slice.questionIds.map((questionId) => ({
    daily_task_id: inserted.id,
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
  toIso: string
): Promise<void> {
  const from = parseDateOnly(fromIso);
  const to = parseDateOnly(toIso);
  const cursor = new Date(from);

  while (cursor <= to) {
    const iso = toDateOnlyString(cursor);
    await ensureDailyTaskForStudentDate(admin, assignment, studentId, iso);
    cursor.setDate(cursor.getDate() + 1);
  }
}

export async function bootstrapDailyTasksForAssignment(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  horizonDays = 45
): Promise<void> {
  const studentIds = await resolveStudentIdsForScheduleAssignment(
    admin,
    assignment
  );
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

  for (const studentId of studentIds) {
    await ensureDailyTasksForStudentRange(
      admin,
      assignment,
      studentId,
      fromIso,
      toIso
    );
  }
}
