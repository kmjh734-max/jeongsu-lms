import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  isStudyDay,
  nextStudyDateAfter,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import { ensureDailyTasksForStudentRange } from "@/lib/listening/schedule/generate-daily-tasks";
import { buildQuestionQueueForAssignment } from "@/lib/listening/schedule/question-queue";
import {
  getStudentListeningEffectiveStartIso,
  pruneIncompleteTasksBeforeEffectiveStart,
} from "@/lib/listening/schedule/student-effective-start";
import type { DailyTaskStatus, ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export interface StudentDailyTaskView {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  taskDate: string;
  setId: string;
  setTitle: string;
  questionIds: string[];
  questionRangeLabel: string;
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

function formatQuestionRangeLabel(orderIndexes: number[]): string {
  if (orderIndexes.length === 0) return "";
  const sorted = [...orderIndexes].sort((a, b) => a - b);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (first === last) return `${first}번`;
  return `${first}–${last}번`;
}

async function loadQuestionOrderIndexes(
  admin: SupabaseClient,
  questionIds: string[]
): Promise<Map<string, number>> {
  const unique = [...new Set(questionIds.filter(Boolean))];
  const map = new Map<string, number>();
  if (!unique.length) return map;

  const { data } = await admin
    .from("listening_questions")
    .select("id, order_index")
    .in("id", unique);

  for (const row of data ?? []) {
    map.set(row.id as string, row.order_index as number);
  }
  return map;
}

function mapTaskRow(
  row: Record<string, unknown>,
  assignmentTitle: string,
  setTitle: string,
  orderById?: Map<string, number>
): StudentDailyTaskView {
  const total = row.total_count as number;
  const completed = row.completed_count as number;
  const questionIds = (row.question_ids as string[]) ?? [];
  const orders = questionIds
    .map((id) => orderById?.get(id))
    .filter((n): n is number => typeof n === "number");
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    assignmentTitle,
    taskDate: row.task_date as string,
    setId: row.set_id as string,
    setTitle,
    questionIds,
    questionRangeLabel: formatQuestionRangeLabel(orders),
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
  const effectiveStartByAssignment = new Map<string, string>();
  await Promise.all(
    assignments.map(async (a) => {
      const start = await getStudentListeningEffectiveStartIso(
        admin,
        a,
        studentId
      );
      effectiveStartByAssignment.set(a.id, start);
      await pruneIncompleteTasksBeforeEffectiveStart(admin, {
        studentId,
        assignmentId: a.id,
        effectiveStartIso: start,
      });
    })
  );

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
  const questionIdsForLabels = [
    ...(missedRows ?? []).flatMap((r) => (r.question_ids as string[]) ?? []),
    ...(todayRows ?? []).flatMap((r) => (r.question_ids as string[]) ?? []),
  ];
  const orderById = await loadQuestionOrderIndexes(admin, questionIdsForLabels);

  const missedTasks: StudentDailyTaskView[] = [];
  for (const row of missedRows ?? []) {
    const assignmentId = row.assignment_id as string;
    if (!activeAssignmentIds.has(assignmentId)) continue;
    const effectiveStart =
      effectiveStartByAssignment.get(assignmentId) ?? "0000-01-01";
    if ((row.task_date as string) < effectiveStart) continue;

    const assignment = row.assignment as { title?: string } | null;
    missedTasks.push(
      mapTaskRow(
        row as Record<string, unknown>,
        assignment?.title ?? "듣기 과제",
        missedSetTitles.get(row.set_id as string) ?? "",
        orderById
      )
    );
  }

  const assignmentById = new Map(assignments.map((a) => [a.id, a]));
  const activeAssignmentIds = new Set(assignments.map((a) => a.id));
  let todayTask: StudentDailyTaskView | null = null;
  let nextStudyDate: string | null = null;

  for (const row of todayRows ?? []) {
    if (todayTask) break;
    const assignment = assignmentById.get(row.assignment_id as string);
    if (!assignment) continue;
    const effectiveStart =
      effectiveStartByAssignment.get(assignment.id) ?? assignment.start_date;
    if (todayIso < effectiveStart) continue;
    todayTask = mapTaskRow(
      row as Record<string, unknown>,
      assignment.title,
      "",
      orderById
    );
  }

  for (const assignment of assignments) {
    const effectiveStart =
      effectiveStartByAssignment.get(assignment.id) ?? assignment.start_date;
    const next = nextStudyDateAfter(
      todayIso < effectiveStart ? addDaysIso(effectiveStart, -1) : todayIso,
      assignment.days_of_week,
      assignment.end_date
    );
    // effectiveStart 이전 next 는 무시
    const nextOk =
      next && next >= effectiveStart
        ? next
        : nextStudyDateAfter(
            addDaysIso(effectiveStart, -1),
            assignment.days_of_week,
            assignment.end_date
          );
    if (nextOk && (!nextStudyDate || nextOk < nextStudyDate)) {
      nextStudyDate = nextOk;
    }
  }

  if (todayTask) {
    let displaySetId = todayTask.setId;
    const { data: progressRows } = await admin
      .from("listening_daily_task_progress")
      .select("question_id, completed")
      .eq("daily_task_id", todayTask.id)
      .eq("student_id", studentId);

    const incompleteQid = (progressRows ?? []).find((p) => !p.completed)
      ?.question_id as string | undefined;
    if (incompleteQid) {
      const { data: qRow } = await admin
        .from("listening_questions")
        .select("set_id")
        .eq("id", incompleteQid)
        .maybeSingle();
      if (qRow?.set_id) displaySetId = qRow.set_id as string;
    } else if (todayTask.questionIds[0]) {
      const { data: qRow } = await admin
        .from("listening_questions")
        .select("set_id")
        .eq("id", todayTask.questionIds[0])
        .maybeSingle();
      if (qRow?.set_id) displaySetId = qRow.set_id as string;
    }

    const titles = await loadSetTitles(admin, [displaySetId, todayTask.setId]);
    todayTask = {
      ...todayTask,
      setId: displaySetId,
      setTitle: titles.get(displaySetId) ?? titles.get(todayTask.setId) ?? "",
    };
  }

  const isStudyDayToday = assignments.some((a) => {
    const effectiveStart =
      effectiveStartByAssignment.get(a.id) ?? a.start_date;
    if (todayIso < effectiveStart) return false;
    return isDateInAssignment(todayIso, a);
  });

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
      const effectiveStart = await getStudentListeningEffectiveStartIso(
        admin,
        assignment,
        studentId
      );
      if (todayIso < effectiveStart) return;
      if (!isDateInAssignment(todayIso, assignment)) return;
      const queue = await buildQuestionQueueForAssignment(admin, assignment.id);
      if (queue.length === 0) return;
      await ensureDailyTasksForStudentRange(
        admin,
        assignment,
        studentId,
        todayIso,
        todayIso,
        queue,
        effectiveStart
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
      const effectiveStart = await getStudentListeningEffectiveStartIso(
        admin,
        assignment,
        studentId
      );
      let rangeFrom =
        assignment.start_date > lookbackFrom
          ? assignment.start_date
          : lookbackFrom;
      if (rangeFrom < effectiveStart) rangeFrom = effectiveStart;

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
        queue,
        effectiveStart
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
