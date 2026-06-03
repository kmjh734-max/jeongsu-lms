import type { SupabaseClient } from "@supabase/supabase-js";
import {
  nextStudyDateAfter,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  ensureDailyTaskForStudentDate,
  ensureDailyTasksForStudentRange,
} from "@/lib/listening/schedule/generate-daily-tasks";
import type { DailyTaskStatus, ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export interface StudentDailyTaskView {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  taskDate: string;
  setId: string;
  setTitle: string;
  questionIds: string[];
  status: DailyTaskStatus;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

async function loadActiveAssignmentsForStudent(
  admin: SupabaseClient,
  studentId: string
): Promise<ScheduleAssignmentRow[]> {
  const byId = new Map<string, ScheduleAssignmentRow>();

  const { data: direct } = await admin
    .from("listening_schedule_assignments")
    .select("*")
    .eq("is_active", true)
    .eq("target_type", "student")
    .eq("target_student_id", studentId);

  for (const row of (direct ?? []) as ScheduleAssignmentRow[]) {
    byId.set(row.id, row);
  }

  const { data: classRows } = await admin
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);

  const classIds = (classRows ?? []).map((r) => r.class_id as string);
  if (classIds.length > 0) {
    const { data: classBased } = await admin
      .from("listening_schedule_assignments")
      .select("*")
      .eq("is_active", true)
      .eq("target_type", "class")
      .in("target_class_id", classIds);

    for (const row of (classBased ?? []) as ScheduleAssignmentRow[]) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

export async function getStudentScheduleTodaySummary(
  admin: SupabaseClient,
  studentId: string,
  todayIso = toDateOnlyString(new Date())
) {
  const assignments = await loadActiveAssignmentsForStudent(admin, studentId);

  for (const assignment of assignments) {
    const rangeFrom =
      assignment.start_date <= todayIso ? assignment.start_date : todayIso;
    await ensureDailyTasksForStudentRange(
      admin,
      assignment,
      studentId,
      rangeFrom,
      todayIso
    );
  }

  const { data: missedRows } = await admin
    .from("listening_daily_tasks")
    .select(
      "id, assignment_id, task_date, set_id, question_ids, status, completed_count, total_count, assignment:listening_schedule_assignments(title)"
    )
    .eq("student_id", studentId)
    .lt("task_date", todayIso)
    .in("status", ["pending", "in_progress"])
    .order("task_date", { ascending: true });

  const missedTasks: StudentDailyTaskView[] = [];
  for (const row of missedRows ?? []) {
    const assignment = row.assignment as { title?: string } | null;
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("title")
      .eq("id", row.set_id)
      .maybeSingle();
    const total = row.total_count as number;
    const completed = row.completed_count as number;
    missedTasks.push({
      id: row.id as string,
      assignmentId: row.assignment_id as string,
      assignmentTitle: assignment?.title ?? "듣기 과제",
      taskDate: row.task_date as string,
      setId: row.set_id as string,
      setTitle: (setRow?.title as string) ?? "",
      questionIds: (row.question_ids as string[]) ?? [],
      status: row.status as DailyTaskStatus,
      completedCount: completed,
      totalCount: total,
      remainingCount: Math.max(0, total - completed),
    });
  }

  let todayTask: StudentDailyTaskView | null = null;
  let nextStudyDate: string | null = null;

  for (const assignment of assignments) {
    await ensureDailyTaskForStudentDate(
      admin,
      assignment,
      studentId,
      todayIso
    );

    const { data: todayRow } = await admin
      .from("listening_daily_tasks")
      .select(
        "id, assignment_id, task_date, set_id, question_ids, status, completed_count, total_count"
      )
      .eq("student_id", studentId)
      .eq("assignment_id", assignment.id)
      .eq("task_date", todayIso)
      .maybeSingle();

    if (todayRow && !todayTask) {
      const { data: setRow } = await admin
        .from("listening_sets")
        .select("title")
        .eq("id", todayRow.set_id)
        .maybeSingle();
      const total = todayRow.total_count as number;
      const completed = todayRow.completed_count as number;
      todayTask = {
        id: todayRow.id as string,
        assignmentId: todayRow.assignment_id as string,
        assignmentTitle: assignment.title,
        taskDate: todayRow.task_date as string,
        setId: todayRow.set_id as string,
        setTitle: (setRow?.title as string) ?? "",
        questionIds: (todayRow.question_ids as string[]) ?? [],
        status: todayRow.status as DailyTaskStatus,
        completedCount: completed,
        totalCount: total,
        remainingCount: Math.max(0, total - completed),
      };
    }

    const next = nextStudyDateAfter(
      todayIso,
      assignment.days_of_week,
      assignment.end_date
    );
    if (next && (!nextStudyDate || next < nextStudyDate)) {
      nextStudyDate = next;
    }
  }

  const isStudyDayToday = assignments.some((a) => {
    const d = new Date(todayIso + "T12:00:00");
    return a.days_of_week.includes(d.getDay());
  });

  return {
    todayIso,
    isStudyDayToday,
    todayTask,
    missedTasks,
    nextStudyDate,
  };
}
