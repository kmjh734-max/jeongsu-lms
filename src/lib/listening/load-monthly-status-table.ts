import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getKoreaDayUtcBounds,
  getMonthDateRange,
  getTodayIsoKorea,
} from "@/lib/date/korea-today";
import { isStudyDay, parseDateOnly } from "@/lib/listening/schedule/days-of-week";
import { getStudentListeningEffectiveStartIso } from "@/lib/listening/schedule/student-effective-start";
import type {
  DailyTaskStatus,
  ScheduleAssignmentRow,
} from "@/lib/listening/schedule/types";
import type {
  HomeworkDayCell,
  HomeworkDaySymbol,
  ListeningOmrAttemptRow,
  ListeningOmrStudentSummary,
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

type ExamAttemptRow = {
  student_id: string;
  set_id: string;
  score: number;
  correct_count: number;
  total_count: number;
  submitted_at: string;
};

async function loadTeacherListeningSetIds(
  admin: SupabaseClient,
  teacherId: string
): Promise<Set<string>> {
  const { data } = await admin
    .from("listening_sets")
    .select("id")
    .or(`teacher_id.eq.${teacherId},created_by.eq.${teacherId}`);

  return new Set((data ?? []).map((row) => row.id as string));
}

function buildStudentDays(
  assignments: ScheduleAssignmentRow[],
  tasksByDate: Map<string, TaskRow[]>,
  year: number,
  month: number,
  daysInMonth: number,
  todayIso: string,
  effectiveStartByAssignmentId: Map<string, string>
): HomeworkDayCell[] {
  const days: HomeworkDayCell[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const taskDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = parseDateOnly(taskDate);
    const weekday = dateObj.getDay();
    const studyAssignments = assignments.filter((a) =>
      isDateInAssignment(
        taskDate,
        a,
        effectiveStartByAssignmentId.get(a.id)
      )
    );
    const isStudyDayFlag = studyAssignments.length > 0;
    const rows = tasksByDate.get(taskDate) ?? [];
    const aggregated = aggregateTasksForDay(rows);

    const completedCount = aggregated.completedCount;
    const totalCount =
      aggregated.totalCount > 0
        ? aggregated.totalCount
        : (studyAssignments[0]?.questions_per_day ?? 0);
    const symbol = toDaySymbol(
      aggregated.status,
      taskDate,
      todayIso,
      isStudyDayFlag,
      completedCount,
      totalCount
    );

    days.push({
      day,
      weekday,
      taskDate,
      symbol,
      isToday: taskDate === todayIso,
      isStudyDay: isStudyDayFlag,
      completedCount,
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
      omrByStudent: [],
    };
  }

  const studentById = new Map(
    students.map((s) => [
      s.id,
      { name: s.name, classLabel: s.classNames.join(", ") || "—" },
    ])
  );
  const studentIds = students.map((s) => s.id);
  const monthBounds = {
    start: getKoreaDayUtcBounds(start).start,
    end: getKoreaDayUtcBounds(end).end,
  };
  const teacherSetIdsPromise =
    role === "teacher"
      ? loadTeacherListeningSetIds(admin, viewerId)
      : Promise.resolve(null as Set<string> | null);

  const [assignmentsByStudent, { data: taskRows }, examQuery, teacherSetIds] =
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
        .select(
          "student_id, set_id, score, correct_count, total_count, submitted_at"
        )
        .in("student_id", studentIds)
        .gte("submitted_at", monthBounds.start)
        .lte("submitted_at", monthBounds.end)
        .order("submitted_at", { ascending: false }),
      teacherSetIdsPromise,
    ]);

  let examRows = (examQuery.data ?? []) as ExamAttemptRow[];
  if (teacherSetIds && teacherSetIds.size > 0) {
    examRows = examRows.filter((row) => teacherSetIds.has(row.set_id));
  } else if (teacherSetIds && teacherSetIds.size === 0) {
    examRows = [];
  }

  const setTitleById = new Map<string, string>();
  const examSetIds = [...new Set(examRows.map((row) => row.set_id))];
  if (examSetIds.length > 0) {
    const { data: setRows } = await admin
      .from("listening_sets")
      .select("id, title")
      .in("id", examSetIds);
    for (const set of setRows ?? []) {
      setTitleById.set(set.id as string, set.title as string);
    }
  }

  const omrAttemptsByStudent = new Map<string, ListeningOmrAttemptRow[]>();

  for (const row of examRows) {
    const sid = row.student_id;
    const student = studentById.get(sid);
    if (!student) continue;

    const attempt: ListeningOmrAttemptRow = {
      studentId: sid,
      studentName: student.name,
      classLabel: student.classLabel,
      setId: row.set_id,
      setTitle: setTitleById.get(row.set_id) ?? "듣기 시험",
      examDate: getTodayIsoKorea(new Date(row.submitted_at)),
      score: row.score,
      correctCount: row.correct_count,
      totalCount: row.total_count,
    };

    const list = omrAttemptsByStudent.get(sid) ?? [];
    list.push(attempt);
    omrAttemptsByStudent.set(sid, list);
  }

  const tasksByStudentDate = new Map<string, Map<string, TaskRow[]>>();
  const taskIds: string[] = [];
  for (const row of (taskRows ?? []) as TaskRow[]) {
    const sid = row.student_id;
    const date = row.task_date;
    const byDate = tasksByStudentDate.get(sid) ?? new Map<string, TaskRow[]>();
    const list = byDate.get(date) ?? [];
    list.push(row);
    byDate.set(date, list);
    tasksByStudentDate.set(sid, byDate);
    taskIds.push(row.id);
  }

  const accuracyByStudent = new Map<
    string,
    { correctCount: number; answeredCount: number }
  >();
  for (const id of studentIds) {
    accuracyByStudent.set(id, { correctCount: 0, answeredCount: 0 });
  }
  if (taskIds.length > 0) {
    for (let i = 0; i < taskIds.length; i += 200) {
      const chunk = taskIds.slice(i, i + 200);
      const { data: progressRows } = await admin
        .from("listening_daily_task_progress")
        .select("student_id, objective_completed, objective_correct")
        .in("daily_task_id", chunk)
        .eq("objective_completed", true);
      for (const p of progressRows ?? []) {
        const sid = p.student_id as string;
        const bucket = accuracyByStudent.get(sid);
        if (!bucket) continue;
        // 구데이터는 objective_correct=null → 채점 불가. 채점된 문항만 집계
        if (p.objective_correct === true) {
          bucket.correctCount += 1;
          bucket.answeredCount += 1;
        } else if (p.objective_correct === false) {
          bucket.answeredCount += 1;
        }
      }
    }
  }

  const rows: ListeningStatusRow[] = await Promise.all(
    students.map(async (student) => {
      const assignments = assignmentsByStudent.get(student.id) ?? [];
      const effectiveStartByAssignmentId = new Map<string, string>();
      await Promise.all(
        assignments.map(async (a) => {
          effectiveStartByAssignmentId.set(
            a.id,
            await getStudentListeningEffectiveStartIso(admin, a, student.id)
          );
        })
      );
      const tasksByDate = tasksByStudentDate.get(student.id) ?? new Map();
      const days = buildStudentDays(
        assignments,
        tasksByDate,
        options.year,
        options.month,
        daysInMonth,
        todayIso,
        effectiveStartByAssignmentId
      );

      let completedCount = 0;
      let totalCount = 0;
      const missedDates: string[] = [];
      for (const cell of days) {
        if (!cell.isStudyDay || cell.taskDate > todayIso) continue;
        totalCount += 1;
        if (cell.symbol === "complete") {
          completedCount += 1;
        } else if (cell.symbol === "missing" || cell.symbol === "partial") {
          missedDates.push(cell.taskDate);
        }
      }

      const executionRate =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const programLabel =
        assignments.length === 0
          ? "듣기학습"
          : assignments.length === 1
            ? assignments[0]!.title
            : `듣기학습 (${assignments.length}개 과제)`;

      const accuracy = accuracyByStudent.get(student.id) ?? {
        correctCount: 0,
        answeredCount: 0,
      };

      return {
        studentId: student.id,
        studentName: student.name,
        classLabel: student.classNames.join(", ") || "—",
        programLabel,
        days,
        completedCount,
        totalCount,
        executionRate,
        correctCount: accuracy.correctCount,
        answeredCount: accuracy.answeredCount,
        missedDates,
      };
    })
  );

  const omrByStudent: ListeningOmrStudentSummary[] = students
    .flatMap((student) => {
      const attempts = (omrAttemptsByStudent.get(student.id) ?? []).sort(
        (a, b) => b.examDate.localeCompare(a.examDate)
      );
      if (attempts.length === 0) return [];

      const scores = attempts.map((a) => a.score);
      const summary: ListeningOmrStudentSummary = {
        studentId: student.id,
        studentName: student.name,
        classLabel: student.classNames.join(", ") || "—",
        attemptCount: attempts.length,
        bestScore: Math.max(...scores),
        latestScore: attempts[0]!.score,
        latestDate: attempts[0]!.examDate,
        attempts,
      };
      return [summary];
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));

  return {
    year: options.year,
    month: options.month,
    todayIso,
    daysInMonth,
    rows,
    omrByStudent,
  };
}
