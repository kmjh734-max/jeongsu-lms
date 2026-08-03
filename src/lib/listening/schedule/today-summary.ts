import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  isStudyDay,
  nextStudyDateAfter,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  ensureDailyTaskForStudentDate,
  ensureDailyTasksForStudentRange,
} from "@/lib/listening/schedule/generate-daily-tasks";
import { buildQuestionQueueForAssignment } from "@/lib/listening/schedule/question-queue";
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

const MISSED_TASK_LOOKBACK_DAYS = 14;

function lookbackIsoFrom(todayIso: string, days: number): string {
  const d = parseDateOnly(todayIso);
  d.setDate(d.getDate() - days);
  return toDateOnlyString(d);
}

async function loadSetTitles(
  admin: SupabaseClient,
  setIds: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(setIds.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;

  const { data } = await admin
    .from("listening_sets")
    .select("id, title")
    .in("id", unique);

  for (const row of data ?? []) {
    map.set(row.id as string, (row.title as string) ?? "");
  }
  return map;
}

function mapTaskRow(
  row: Record<string, unknown>,
  assignmentTitle: string,
  setTitle: string
): StudentDailyTaskView {
  const total = row.total_count as number;
  const completed = row.completed_count as number;
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    assignmentTitle,
    taskDate: row.task_date as string,
    setId: row.set_id as string,
    setTitle,
    questionIds: (row.question_ids as string[]) ?? [],
    status: row.status as DailyTaskStatus,
    completedCount: completed,
    totalCount: total,
    remainingCount: Math.max(0, total - completed),
  };
}

/** 기존 과제만 조회 — 페이지 로딩을 막지 않음 */
export async function getStudentScheduleTodaySummaryReadOnly(
  admin: SupabaseClient,
  studentId: string,
  todayIso = getTodayIsoKorea()
) {
  const assignments = await loadActiveAssignmentsForStudent(admin, studentId);

  const [{ data: missedRows }, { data: todayRows }] = await Promise.all([
    admin
      .from("listening_daily_tasks")
      .select(
        "id, assignment_id, task_date, set_id, question_ids, status, completed_count, total_count, assignment:listening_schedule_assignments(title)"
      )
      .eq("student_id", studentId)
      .lt("task_date", todayIso)
      .in("status", ["pending", "in_progress"])
      .order("task_date", { ascending: true }),
    admin
      .from("listening_daily_tasks")
      .select(
        "id, assignment_id, task_date, set_id, question_ids, status, completed_count, total_count"
      )
      .eq("student_id", studentId)
      .eq("task_date", todayIso),
  ]);

  const missedSetIds = (missedRows ?? []).map((r) => r.set_id as string);
  const missedSetTitles = await loadSetTitles(admin, missedSetIds);

  const missedTasks: StudentDailyTaskView[] = [];
  for (const row of missedRows ?? []) {
    const assignment = row.assignment as { title?: string } | null;
    missedTasks.push(
      mapTaskRow(
        row as Record<string, unknown>,
        assignment?.title ?? "듣기 과제",
        missedSetTitles.get(row.set_id as string) ?? ""
      )
    );
  }

  const assignmentById = new Map(assignments.map((a) => [a.id, a]));
  let todayTask: StudentDailyTaskView | null = null;
  let nextStudyDate: string | null = null;

  for (const row of todayRows ?? []) {
    if (todayTask) break;
    const assignment = assignmentById.get(row.assignment_id as string);
    if (!assignment) continue;
    todayTask = mapTaskRow(
      row as Record<string, unknown>,
      assignment.title,
      ""
    );
  }

  for (const assignment of assignments) {
    const next = nextStudyDateAfter(
      todayIso,
      assignment.days_of_week,
      assignment.end_date
    );
    if (next && (!nextStudyDate || next < nextStudyDate)) {
      nextStudyDate = next;
    }
  }

  if (todayTask) {
    const titles = await loadSetTitles(admin, [todayTask.setId]);
    todayTask = {
      ...todayTask,
      setTitle: titles.get(todayTask.setId) ?? todayTask.setTitle,
    };
  }

  const isStudyDayToday = assignments.some((a) =>
    isDateInAssignment(todayIso, a)
  );

  return {
    todayIso,
    isStudyDayToday,
    todayTask,
    missedTasks,
    nextStudyDate,
  };
}

/** 오늘 과제만 동기 생성 — 페이지 첫 응답을 빠르게 */
export async function ensureStudentTodayAndMissedTasks(
  admin: SupabaseClient,
  studentId: string,
  todayIso = getTodayIsoKorea()
): Promise<void> {
  const assignments = await loadActiveAssignmentsForStudent(admin, studentId);
  if (assignments.length === 0) return;

  await Promise.all(
    assignments.map(async (assignment) => {
      if (!isDateInAssignment(todayIso, assignment)) return;
      const queue = await buildQuestionQueueForAssignment(admin, assignment.id);
      if (queue.length === 0) return;
      await ensureDailyTaskForStudentDate(
        admin,
        assignment,
        studentId,
        todayIso,
        queue
      );
    })
  );
}

/** 누락된 일일 과제 생성 — 미래 구간 포함 (백그라운드용) */
function addDaysIso(iso: string, days: number): string {
  const d = parseDateOnly(iso);
  d.setDate(d.getDate() + days);
  return toDateOnlyString(d);
}

export async function ensureStudentScheduleDailyTasks(
  admin: SupabaseClient,
  studentId: string,
  todayIso = getTodayIsoKorea(),
  options?: { futureDays?: number }
): Promise<void> {
  const futureDays = options?.futureDays ?? 30;
  const assignments = await loadActiveAssignmentsForStudent(admin, studentId);
  const lookbackFrom = lookbackIsoFrom(todayIso, MISSED_TASK_LOOKBACK_DAYS);
  const futureTo = addDaysIso(todayIso, futureDays);

  await Promise.all(
    assignments.map(async (assignment) => {
      const rangeFrom =
        assignment.start_date > lookbackFrom
          ? assignment.start_date
          : lookbackFrom;
      const rangeTo =
        assignment.end_date && assignment.end_date < futureTo
          ? assignment.end_date
          : futureTo;
      if (rangeFrom > rangeTo) return;

      const queue = await buildQuestionQueueForAssignment(admin, assignment.id);
      await ensureDailyTasksForStudentRange(
        admin,
        assignment,
        studentId,
        rangeFrom,
        rangeTo,
        queue
      );
      await ensureDailyTaskForStudentDate(
        admin,
        assignment,
        studentId,
        todayIso,
        queue
      );
    })
  );
}

export async function getStudentScheduleTodaySummary(
  admin: SupabaseClient,
  studentId: string,
  todayIso = getTodayIsoKorea()
) {
  await ensureStudentTodayAndMissedTasks(admin, studentId, todayIso);
  return getStudentScheduleTodaySummaryReadOnly(admin, studentId, todayIso);
}
