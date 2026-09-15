import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { isStudyDay, parseDateOnly } from "@/lib/listening/schedule/days-of-week";
import { applyPausesToAssignment } from "@/lib/listening/schedule/pauses";
import {
  isAssignmentPausedOn,
  loadStudentScheduleContext,
  type StudentScheduleContext,
} from "@/lib/listening/schedule/student-context";
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
  /** 선생님이 멈춘 날 (학습일로 세지 않음) */
  paused?: boolean;
}

function isDateInAssignment(
  taskDateIso: string,
  assignment: ScheduleAssignmentRow,
  effectiveStartIso?: string
): boolean {
  if (effectiveStartIso && taskDateIso < effectiveStartIso) return false;
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
  todayIso = getTodayIsoKorea(),
  /** 같은 요청에서 이미 읽은 과제 목록 (없으면 여기서 읽는다) */
  context?: StudentScheduleContext
): Promise<{
  year: number;
  month: number;
  todayIso: string;
  days: ListeningCalendarDay[];
}> {
  const { start, end, daysInMonth } = monthBounds(year, month);

  type TaskRow = {
    id: string;
    assignment_id: string;
    task_date: string;
    status: DailyTaskStatus;
    completed_count: number;
    total_count: number;
    assignment: { title?: string } | { title?: string }[] | null;
    set: { title?: string } | { title?: string }[] | null;
  };

  // 과제 목록(유효 시작일 포함)과 이달 과제는 서로 기다릴 필요가 없다
  const [ctx, { data: taskRows }] = await Promise.all([
    context ?? loadStudentScheduleContext(admin, studentId),
    admin
      .from("listening_daily_tasks")
      .select(
        "id, assignment_id, task_date, status, completed_count, total_count, assignment:listening_schedule_assignments(title), set:listening_sets(title)"
      )
      .eq("student_id", studentId)
      .gte("task_date", start)
      .lte("task_date", end),
  ]);

  const tasksByDate = new Map<string, TaskRow[]>();
  for (const row of (taskRows ?? []) as TaskRow[]) {
    const iso = row.task_date;
    const list = tasksByDate.get(iso) ?? [];
    list.push(row);
    tasksByDate.set(iso, list);
  }

  const { assignments, effectiveStartByAssignment, pausesByAssignment } = ctx;
  const activeAssignmentIds = new Set(assignments.map((a) => a.id));
  // 끝나는 날은 쉰 날만큼 뒤로 민 규칙으로 본다
  const effectiveAssignments = assignments.map((a) =>
    applyPausesToAssignment(a, pausesByAssignment.get(a.id))
  );
  const days: ListeningCalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const taskDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = parseDateOnly(taskDate);
    const weekday = dateObj.getDay();
    const ruleAssignments = effectiveAssignments.filter((a) =>
      isDateInAssignment(
        taskDate,
        a,
        effectiveStartByAssignment.get(a.id)
      )
    );
    // 멈춘 날은 학습일로 세지 않는다 (그날 끝낸 과제는 그대로 보인다)
    const studyAssignments = ruleAssignments.filter(
      (a) => !isAssignmentPausedOn(ctx, a.id, taskDate)
    );
    const rows = (tasksByDate.get(taskDate) ?? []).filter(
      (r) =>
        r.status === "completed" ||
        !activeAssignmentIds.has(r.assignment_id) ||
        !isAssignmentPausedOn(ctx, r.assignment_id, taskDate)
    );
    // 요일·기간을 바꾼 뒤에도 이미 나간 과제는 달력에 남긴다
    const isStudyDayFlag =
      studyAssignments.length > 0 ||
      rows.some((r) => activeAssignmentIds.has(r.assignment_id));

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
        paused: ruleAssignments.length > 0,
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
