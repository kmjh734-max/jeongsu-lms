import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import {
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  ensureDailyTasksForStudentRange,
  loadStartedTaskIds,
} from "@/lib/listening/schedule/generate-daily-tasks";
import { isTaskStarted } from "@/lib/listening/schedule/plan-daily-tasks";
import { buildQuestionQueueForAssignment } from "@/lib/listening/schedule/question-queue";
import { resolveStudentIdsForScheduleAssignment } from "@/lib/listening/schedule/resolve-students";
import { getStudentListeningEffectiveStartIso } from "@/lib/listening/schedule/student-effective-start";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

/** 배정 창의 「하루 문항」 선택 범위와 같게 */
export const QUESTIONS_PER_DAY_MIN = 1;
export const QUESTIONS_PER_DAY_MAX = 20;
export const TITLE_MAX_LENGTH = 100;
/** 학생 화면이 미리 만들어 두는 기간(ensureStudentScheduleDailyTasks futureDays)과 같게 */
export const EDIT_REBUILD_HORIZON_DAYS = 45;

export interface ScheduleEditBody {
  title?: string;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string | null;
  questionsPerDay?: number;
  requireDictationPass?: boolean;
  dictationPassScore?: number;
  removeSetIds?: string[];
}

const EDIT_KEYS: Array<keyof ScheduleEditBody> = [
  "title",
  "daysOfWeek",
  "startDate",
  "endDate",
  "questionsPerDay",
  "requireDictationPass",
  "dictationPassScore",
  "removeSetIds",
];

export function hasScheduleEditFields(body: object): boolean {
  return EDIT_KEYS.some((key) => key in body);
}

export type ScheduleEditPatch = Partial<
  Pick<
    ScheduleAssignmentRow,
    | "title"
    | "days_of_week"
    | "start_date"
    | "end_date"
    | "questions_per_day"
    | "require_dictation_pass"
    | "dictation_pass_score"
  >
>;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  return toDateOnlyString(parseDateOnly(value)) === value;
}

function normalizeDays(days: number[]): number[] {
  return [...new Set(days)].sort((a, b) => a - b);
}

/**
 * 고칠 값 검사 + 바뀐 것만 모은다 (DB 없이 계산만).
 * rulesChanged: 날마다 나갈 문항이 달라지는 변경(요일·시작·끝·하루 문항 수)
 */
export function buildScheduleEditPatch(
  current: Pick<
    ScheduleAssignmentRow,
    | "title"
    | "days_of_week"
    | "start_date"
    | "end_date"
    | "questions_per_day"
    | "require_dictation_pass"
    | "dictation_pass_score"
  >,
  body: ScheduleEditBody,
  ctx: { todayIso: string; hasHistory: boolean }
):
  | { ok: true; patch: ScheduleEditPatch; rulesChanged: boolean }
  | { ok: false; message: string } {
  const patch: ScheduleEditPatch = {};
  let rulesChanged = false;

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return { ok: false, message: "과제명을 적어 주세요." };
    if (title.length > TITLE_MAX_LENGTH) {
      return {
        ok: false,
        message: `과제명은 ${TITLE_MAX_LENGTH}자까지 적을 수 있어요.`,
      };
    }
    if (title !== current.title) patch.title = title;
  }

  if (body.daysOfWeek !== undefined) {
    if (
      !Array.isArray(body.daysOfWeek) ||
      body.daysOfWeek.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
    ) {
      return { ok: false, message: "요일 값이 올바르지 않아요." };
    }
    const days = normalizeDays(body.daysOfWeek);
    if (days.length === 0) {
      return { ok: false, message: "학습 요일을 하나 이상 골라 주세요." };
    }
    if (days.join() !== normalizeDays(current.days_of_week ?? []).join()) {
      patch.days_of_week = days;
      rulesChanged = true;
    }
  }

  if (body.startDate !== undefined) {
    const start =
      typeof body.startDate === "string" ? body.startDate.slice(0, 10) : "";
    if (!isValidIsoDate(start)) {
      return { ok: false, message: "시작일을 확인해 주세요." };
    }
    if (start !== current.start_date) {
      if (ctx.hasHistory) {
        return {
          ok: false,
          message:
            "이미 학생들이 공부를 시작해서 시작일은 바꿀 수 없어요. 잠깐 멈추려면 「잠시 쉬기」를 써 주세요.",
        };
      }
      patch.start_date = start;
      rulesChanged = true;
    }
  }

  if (body.endDate !== undefined) {
    const raw =
      typeof body.endDate === "string" ? body.endDate.slice(0, 10) : "";
    const end = raw ? raw : null;
    if (end !== null && !isValidIsoDate(end)) {
      return { ok: false, message: "끝나는 날을 확인해 주세요." };
    }
    if (end !== (current.end_date ?? null)) {
      if (end !== null && end < ctx.todayIso) {
        return {
          ok: false,
          message: "끝나는 날은 오늘이나 그 뒤로 골라 주세요.",
        };
      }
      patch.end_date = end;
      rulesChanged = true;
    }
  }

  if (patch.start_date !== undefined || patch.end_date !== undefined) {
    const start = patch.start_date ?? current.start_date;
    const end =
      patch.end_date !== undefined ? patch.end_date : current.end_date;
    if (end && end < start) {
      return { ok: false, message: "끝나는 날이 시작일보다 앞이에요." };
    }
  }

  if (body.questionsPerDay !== undefined) {
    const n = body.questionsPerDay;
    if (
      typeof n !== "number" ||
      !Number.isInteger(n) ||
      n < QUESTIONS_PER_DAY_MIN ||
      n > QUESTIONS_PER_DAY_MAX
    ) {
      return {
        ok: false,
        message: `하루 문항 수는 ${QUESTIONS_PER_DAY_MIN}~${QUESTIONS_PER_DAY_MAX}문항 사이로 골라 주세요.`,
      };
    }
    if (n !== current.questions_per_day) {
      patch.questions_per_day = n;
      rulesChanged = true;
    }
  }

  if (body.requireDictationPass !== undefined) {
    if (typeof body.requireDictationPass !== "boolean") {
      return { ok: false, message: "받아쓰기 설정 값이 올바르지 않아요." };
    }
    if (body.requireDictationPass !== current.require_dictation_pass) {
      patch.require_dictation_pass = body.requireDictationPass;
    }
  }

  if (body.dictationPassScore !== undefined) {
    const score = body.dictationPassScore;
    if (
      typeof score !== "number" ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {
      return {
        ok: false,
        message: "받아쓰기 통과 점수는 0~100점 사이로 적어 주세요.",
      };
    }
    if (score !== current.dictation_pass_score) {
      patch.dictation_pass_score = score;
    }
  }

  return { ok: true, patch, rulesChanged };
}

type UpcomingTaskRow = {
  id: string;
  set_id: string;
  status: string;
  completed_count: number | null;
};

const PAGE_SIZE = 1000;

/** 오늘·이후 과제를 「학생이 손댄 것」과 「아직 안 건드린 것」으로 나눈다 */
async function loadUpcomingTaskState(
  admin: SupabaseClient,
  assignmentId: string,
  todayIso: string
): Promise<{ started: UpcomingTaskRow[]; untouched: UpcomingTaskRow[] }> {
  const rows: UpcomingTaskRow[] = [];
  for (let page = 0; page < 50; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await admin
      .from("listening_daily_tasks")
      .select("id, set_id, status, completed_count")
      .eq("assignment_id", assignmentId)
      .gte("task_date", todayIso)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as UpcomingTaskRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  const candidates = rows.filter((row) => !isTaskStarted(row));
  const startedIds = await loadStartedTaskIds(
    admin,
    candidates.map((row) => row.id)
  );

  const started: UpcomingTaskRow[] = [];
  const untouched: UpcomingTaskRow[] = [];
  for (const row of rows) {
    if (isTaskStarted(row, startedIds)) started.push(row);
    else untouched.push(row);
  }
  return { started, untouched };
}

/**
 * 이 배정에서 이미 나간 기록.
 * - hasHistory: 오늘 이전 과제가 있거나, 오늘·이후 과제 중 학생이 시작한 것이 있음
 * - reachedSetIds: 그런 과제에 들어 있는 세트 (빼면 안 되는 세트)
 */
export async function loadScheduleTaskHistory(
  admin: SupabaseClient,
  assignmentId: string,
  setIds: string[],
  todayIso = getTodayIsoKorea()
): Promise<{ hasHistory: boolean; reachedSetIds: string[] }> {
  const reached = new Set<string>();

  const [pastBySet, upcoming] = await Promise.all([
    Promise.all(
      setIds.map(async (setId) => {
        const { data } = await admin
          .from("listening_daily_tasks")
          .select("id")
          .eq("assignment_id", assignmentId)
          .eq("set_id", setId)
          .lt("task_date", todayIso)
          .limit(1);
        return { setId, hit: (data ?? []).length > 0 };
      })
    ),
    loadUpcomingTaskState(admin, assignmentId, todayIso),
  ]);

  for (const { setId, hit } of pastBySet) if (hit) reached.add(setId);
  for (const row of upcoming.started) reached.add(row.set_id);

  let hasHistory = reached.size > 0 || upcoming.started.length > 0;
  if (!hasHistory) {
    // 지금은 빠진 세트로 나간 과거 과제도 기록이다
    const { data } = await admin
      .from("listening_daily_tasks")
      .select("id")
      .eq("assignment_id", assignmentId)
      .lt("task_date", todayIso)
      .limit(1);
    hasHistory = (data ?? []).length > 0;
  }

  return { hasHistory, reachedSetIds: [...reached] };
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let next = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const item = items[next++]!;
        await worker(item);
      }
    }
  );
  await Promise.all(runners);
}

function addDaysIso(iso: string, days: number): string {
  const d = parseDateOnly(iso);
  d.setDate(d.getDate() + days);
  return toDateOnlyString(d);
}

/**
 * 규칙(요일·기간·하루 문항 수·세트)을 바꾼 뒤 다시 짠다.
 * - 오늘 이전 과제, 학생이 시작한 오늘·이후 과제는 그대로 둔다.
 * - 아직 안 건드린 오늘·이후 과제는 지우고,
 *   학생마다 「남겨 둔 과제·끝낸 문항의 마지막 다음 문항」부터 새 규칙으로 채운다.
 */
export async function rebuildUpcomingScheduleTasks(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  opts?: { todayIso?: string; horizonDays?: number }
): Promise<{ removedTasks: number; keptStartedTasks: number }> {
  const todayIso = opts?.todayIso ?? getTodayIsoKorea();
  const horizonDays = opts?.horizonDays ?? EDIT_REBUILD_HORIZON_DAYS;

  const { started, untouched } = await loadUpcomingTaskState(
    admin,
    assignment.id,
    todayIso
  );

  const untouchedIds = untouched.map((row) => row.id);
  for (let i = 0; i < untouchedIds.length; i += 100) {
    const { error } = await admin
      .from("listening_daily_tasks")
      .delete()
      .in("id", untouchedIds.slice(i, i + 100));
    if (error) throw new Error(error.message);
  }

  const result = {
    removedTasks: untouchedIds.length,
    keptStartedTasks: started.length,
  };
  if (!assignment.is_active) return result;

  const [studentIds, queue] = await Promise.all([
    resolveStudentIdsForScheduleAssignment(admin, assignment),
    buildQuestionQueueForAssignment(admin, assignment.id),
  ]);
  if (studentIds.length === 0 || queue.length === 0) return result;

  const horizonTo = addDaysIso(todayIso, horizonDays);
  const toIso =
    assignment.end_date && assignment.end_date < horizonTo
      ? assignment.end_date
      : horizonTo;

  await runWithConcurrency(studentIds, 5, async (studentId) => {
    const effectiveStart = await getStudentListeningEffectiveStartIso(
      admin,
      assignment,
      studentId
    );
    const fromIso = effectiveStart > todayIso ? effectiveStart : todayIso;
    if (fromIso > toIso) return;
    await ensureDailyTasksForStudentRange(
      admin,
      assignment,
      studentId,
      fromIso,
      toIso,
      queue,
      effectiveStart
    );
  });

  return result;
}
