import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getKoreaDayUtcBounds,
  getMonthDateRange,
  getTodayIsoKorea,
} from "@/lib/date/korea-today";
import { isStudyDay, parseDateOnly } from "@/lib/listening/schedule/days-of-week";
import type {
  DailyTaskStatus,
  ScheduleAssignmentRow,
} from "@/lib/listening/schedule/types";
import type {
  HomeworkDayCell,
  HomeworkDaySymbol,
  ListeningStatusRow,
  ListeningStatusTable,
} from "@/lib/learning-status/types";
import { listReportStudents } from "@/lib/reports/list-students";
import type { UserRole } from "@/types/database";

type TaskRow = {
  id: string;
  student_id: string;
  task_date: string;
  status: DailyTaskStatus;
  completed_count: number;
  total_count: number;
  assignment_id: string;
};

async function loadAssignmentsByStudent(
  supabase: SupabaseClient,
  studentIds: string[]
): Promise<Map<string, ScheduleAssignmentRow[]>> {
  const result = new Map<string, ScheduleAssignmentRow[]>();
  if (studentIds.length === 0) return result;

  for (const id of studentIds) {
    result.set(id, []);
  }

  const [{ data: direct }, { data: classLinks }] = await Promise.all([
    supabase
      .from("listening_schedule_assignments")
      .select("*")
      .eq("is_active", true)
      .eq("target_type", "student")
      .in("target_student_id", studentIds),
    supabase
      .from("class_students")
      .select("student_id, class_id")
      .in("student_id", studentIds),
  ]);

  const classIdsByStudent = new Map<string, string[]>();
  for (const row of classLinks ?? []) {
    const sid = row.student_id as string;
    const cid = row.class_id as string;
    const list = classIdsByStudent.get(sid) ?? [];
    list.push(cid);
    classIdsByStudent.set(sid, list);
  }

  const allClassIds = [
    ...new Set((classLinks ?? []).map((r) => r.class_id as string)),
  ];

  let classAssignments: ScheduleAssignmentRow[] = [];
  if (allClassIds.length > 0) {
    const { data } = await supabase
      .from("listening_schedule_assignments")
      .select("*")
      .eq("is_active", true)
      .eq("target_type", "class")
      .in("target_class_id", allClassIds);
    classAssignments = (data ?? []) as ScheduleAssignmentRow[];
  }

  for (const row of (direct ?? []) as ScheduleAssignmentRow[]) {
    const sid = row.target_student_id;
    if (!sid) continue;
    const list = result.get(sid) ?? [];
    list.push(row);
    result.set(sid, list);
  }

  for (const [studentId, classIds] of classIdsByStudent) {
    for (const assignment of classAssignments) {
      if (
        assignment.target_class_id &&
        classIds.includes(assignment.target_class_id)
      ) {
        const list = result.get(studentId) ?? [];
        if (!list.some((a) => a.id === assignment.id)) {
          list.push(assignment);
          result.set(studentId, list);
        }
      }
    }
  }

  return result;
}

function aggregateTasksForDay(rows: TaskRow[]): {
  status: DailyTaskStatus | null;
  completedCount: number;
  totalCount: number;
} {
  if (rows.length === 0) {
    return { status: null, completedCount: 0, totalCount: 0 };
  }

  const allCompleted = rows.every((r) => r.status === "completed");
  if (allCompleted) {
    return {
      status: "completed",
      completedCount: rows.reduce((sum, r) => sum + r.completed_count, 0),
      totalCount: rows.reduce((sum, r) => sum + r.total_count, 0),
    };
  }

  const anyProgress = rows.some(
    (r) => r.status === "in_progress" || r.status === "completed"
  );
  if (anyProgress) {
    return {
      status: "in_progress",
      completedCount: rows.reduce((sum, r) => sum + r.completed_count, 0),
      totalCount: rows.reduce((sum, r) => sum + r.total_count, 0),
    };
  }

  const pick = rows[0]!;
  return {
    status: pick.status,
    completedCount: pick.completed_count,
    totalCount: pick.total_count,
  };
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

function toDaySymbol(
  status: DailyTaskStatus | null,
  taskDate: string,
  todayIso: string,
  isStudyDayFlag: boolean,
  completedCount: number,
  totalCount: number
): HomeworkDaySymbol {
  if (!isStudyDayFlag) return "none";
  if (taskDate > todayIso) return "scheduled";
  if (!status) return "missing";
  if (status === "completed") return "complete";
  if (status === "in_progress" && completedCount > 0) return "partial";
  return "missing";
}

type ExamDaySummary = { attemptCount: number; bestScore: number };

function buildStudentDays(
  assignments: ScheduleAssignmentRow[],
  tasksByDate: Map<string, TaskRow[]>,
  examByDate: Map<string, ExamDaySummary>,
  year: number,
  month: number,
  daysInMonth: number,
  todayIso: string
): HomeworkDayCell[] {
  const days: HomeworkDayCell[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const taskDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = parseDateOnly(taskDate);
    const weekday = dateObj.getDay();
    const studyAssignments = assignments.filter((a) =>
      isDateInAssignment(taskDate, a)
    );
    const isStudyDayFlag = studyAssignments.length > 0;
    const rows = tasksByDate.get(taskDate) ?? [];
    const aggregated = aggregateTasksForDay(rows);

    const completedCount = aggregated.completedCount;
    const totalCount =
      aggregated.totalCount > 0
        ? aggregated.totalCount
        : (studyAssignments[0]?.questions_per_day ?? 0);
    let symbol = toDaySymbol(
      aggregated.status,
      taskDate,
      todayIso,
      isStudyDayFlag,
      completedCount,
      totalCount
    );

    const examDay = examByDate.get(taskDate);
    if (examDay && taskDate <= todayIso) {
      if (symbol === "none" || symbol === "missing" || symbol === "partial") {
        symbol = examDay.bestScore >= 60 ? "complete" : "partial";
      }
    }

    const studyDayFlag = isStudyDayFlag || Boolean(examDay);

    days.push({
      day,
      weekday,
      taskDate,
      symbol,
      isToday: taskDate === todayIso,
      isStudyDay: studyDayFlag,
      completedCount: examDay
        ? Math.max(completedCount, examDay.attemptCount > 0 ? 1 : 0)
        : completedCount,
      totalCount,
    });
  }

  return days;
}

export async function loadListeningMonthlyStatusTable(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  role: UserRole,
  viewerId: string,
  options: {
    year: number;
    month: number;
    classId?: string;
    nameQuery?: string;
    loginQuery?: string;
  }
): Promise<ListeningStatusTable> {
  const todayIso = getTodayIsoKorea();
  const { start, end, daysInMonth } = getMonthDateRange(
    options.year,
    options.month
  );

  const students = await listReportStudents(supabase, role, viewerId, {
    classId: options.classId,
    nameQuery: options.nameQuery,
    loginQuery: options.loginQuery,
  });

  if (students.length === 0) {
    return {
      year: options.year,
      month: options.month,
      todayIso,
      daysInMonth,
      rows: [],
    };
  }

  const studentIds = students.map((s) => s.id);
  const monthBounds = {
    start: getKoreaDayUtcBounds(start).start,
    end: getKoreaDayUtcBounds(end).end,
  };
  const [assignmentsByStudent, { data: taskRows }, { data: examRows }] =
    await Promise.all([
      loadAssignmentsByStudent(admin, studentIds),
      admin
        .from("listening_daily_tasks")
        .select(
          "id, student_id, task_date, status, completed_count, total_count, assignment_id"
        )
        .in("student_id", studentIds)
        .gte("task_date", start)
        .lte("task_date", end),
      admin
        .from("listening_exam_attempts")
        .select("student_id, score, submitted_at")
        .in("student_id", studentIds)
        .gte("submitted_at", monthBounds.start)
        .lte("submitted_at", monthBounds.end),
    ]);

  const examByStudentDate = new Map<string, Map<string, ExamDaySummary>>();
  for (const row of examRows ?? []) {
    const sid = row.student_id as string;
    const dateIso = getTodayIsoKorea(new Date(row.submitted_at as string));
    const score = row.score as number;
    const byDate = examByStudentDate.get(sid) ?? new Map<string, ExamDaySummary>();
    const prev = byDate.get(dateIso);
    byDate.set(dateIso, {
      attemptCount: (prev?.attemptCount ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, score),
    });
    examByStudentDate.set(sid, byDate);
  }

  const tasksByStudentDate = new Map<string, Map<string, TaskRow[]>>();
  for (const row of (taskRows ?? []) as TaskRow[]) {
    const sid = row.student_id;
    const date = row.task_date;
    const byDate = tasksByStudentDate.get(sid) ?? new Map<string, TaskRow[]>();
    const list = byDate.get(date) ?? [];
    list.push(row);
    byDate.set(date, list);
    tasksByStudentDate.set(sid, byDate);
  }

  const rows: ListeningStatusRow[] = students.map((student) => {
    const assignments = assignmentsByStudent.get(student.id) ?? [];
    const tasksByDate = tasksByStudentDate.get(student.id) ?? new Map();
    const days = buildStudentDays(
      assignments,
      tasksByDate,
      examByStudentDate.get(student.id) ?? new Map(),
      options.year,
      options.month,
      daysInMonth,
      todayIso
    );

    let completedCount = 0;
    let totalCount = 0;
    for (const cell of days) {
      if (!cell.isStudyDay || cell.taskDate > todayIso) continue;
      totalCount += 1;
      if (cell.symbol === "complete") completedCount += 1;
    }

    const executionRate =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const programLabel =
      assignments.length === 0
        ? "듣기학습"
        : assignments.length === 1
          ? assignments[0]!.title
          : `듣기학습 (${assignments.length}개 과제)`;

    return {
      studentId: student.id,
      studentName: student.name,
      classLabel: student.classNames.join(", ") || "—",
      programLabel,
      days,
      completedCount,
      totalCount,
      executionRate,
    };
  });

  return {
    year: options.year,
    month: options.month,
    todayIso,
    daysInMonth,
    rows,
  };
}
