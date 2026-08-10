import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { isStudyDay, parseDateOnly } from "@/lib/listening/schedule/days-of-week";
import type {
  DailyTaskStatus,
  ScheduleAssignmentRow,
} from "@/lib/listening/schedule/types";

export interface ListeningCalendarDay {
  taskDate: string;
  day: number;
  weekday: number;
  isStudyDay: boolean;
  taskId: string | null;
  status: "completed" | "in_progress" | "pending" | "scheduled" | "none";
  locked: boolean;
  totalCount: number;
  completedCount: number;
  assignmentTitle: string | null;
  setTitle: string | null;
}

async function loadActiveAssignmentsForStudent(
  admin: SupabaseClient,
  studentId: string
): Promise<ScheduleAssignmentRow[]> {
  const byId = new Map<string, ScheduleAssignmentRow>();

  const [{ data: direct }, { data: classRows }] = await Promise.all([
    admin
      .from("listening_schedule_assignments")
      .select("*")
      .eq("is_active", true)
      .eq("target_type", "student")
      .eq("target_student_id", studentId),
    admin.from("class_students").select("class_id").eq("student_id", studentId),
  ]);

  for (const row of (direct ?? []) as ScheduleAssignmentRow[]) {
    byId.set(row.id, row);
  }

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

function isDateInAssignment(
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

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, daysInMonth: lastDay };
}

function mapTaskStatus(
  status: DailyTaskStatus,
  taskDate: string,
  todayIso: string
): ListeningCalendarDay["status"] {
  if (status === "completed") return "completed";
  if (taskDate > todayIso) return "scheduled";
  if (status === "in_progress") return "in_progress";
  return "pending";
}

export async function getStudentListeningCalendar(
  admin: SupabaseClient,
  studentId: string,
  year: number,
  month: number,
  todayIso = getTodayIsoKorea()
): Promise<{
  year: number;
  month: number;
  todayIso: string;
  days: ListeningCalendarDay[];
}> {
  const assignments = await loadActiveAssignmentsForStudent(admin, studentId);
  const { start, end, daysInMonth } = monthBounds(year, month);

  type TaskRow = {
    id: string;
    task_date: string;
    status: DailyTaskStatus;
    completed_count: number;
    total_count: number;
    assignment: { title?: string } | { title?: string }[] | null;
    set: { title?: string } | { title?: string }[] | null;
  };

  const { data: taskRows } = await admin
    .from("listening_daily_tasks")
    .select(
      "id, task_date, status, completed_count, total_count, assignment:listening_schedule_assignments(title), set:listening_sets(title)"
    )
    .eq("student_id", studentId)
    .gte("task_date", start)
    .lte("task_date", end);

  const tasksByDate = new Map<string, TaskRow[]>();
  for (const row of (taskRows ?? []) as TaskRow[]) {
    const iso = row.task_date;
    const list = tasksByDate.get(iso) ?? [];
    list.push(row);
    tasksByDate.set(iso, list);
  }

  const days: ListeningCalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const taskDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = parseDateOnly(taskDate);
    const weekday = dateObj.getDay();
    const studyAssignments = assignments.filter((a) =>
      isDateInAssignment(taskDate, a)
    );
    const isStudyDayFlag = studyAssignments.length > 0;
    const rows = tasksByDate.get(taskDate) ?? [];

    if (!isStudyDayFlag) {
      days.push({
        taskDate,
        day,
        weekday,
        isStudyDay: false,
        taskId: null,
        status: "none",
        locked: true,
        totalCount: 0,
        completedCount: 0,
        assignmentTitle: null,
        setTitle: null,
      });
      continue;
    }

    const pick =
      rows.find((r) => r.status !== "completed") ?? rows[0] ?? null;
    // 미래만 잠금 — 과거·오늘 미완료는 언제든 입장 가능
    const locked = taskDate > todayIso;

    if (pick) {
      const assignment = Array.isArray(pick.assignment)
        ? pick.assignment[0]
        : pick.assignment;
      const set = Array.isArray(pick.set) ? pick.set[0] : pick.set;
      const status = mapTaskStatus(
        pick.status as DailyTaskStatus,
        taskDate,
        todayIso
      );

      days.push({
        taskDate,
        day,
        weekday,
        isStudyDay: true,
        taskId: pick.id as string,
        status,
        locked,
        totalCount: (pick.total_count as number) ?? 0,
        completedCount: (pick.completed_count as number) ?? 0,
        assignmentTitle:
          assignment?.title ?? studyAssignments[0]?.title ?? null,
        setTitle: set?.title ?? null,
      });
      continue;
    }

    days.push({
      taskDate,
      day,
      weekday,
      isStudyDay: true,
      taskId: null,
      status: taskDate > todayIso ? "scheduled" : "pending",
      locked,
      totalCount: studyAssignments[0]?.questions_per_day ?? 0,
      completedCount: 0,
      assignmentTitle: studyAssignments[0]?.title ?? null,
      setTitle: null,
    });
  }

  return { year, month, todayIso, days };
}
