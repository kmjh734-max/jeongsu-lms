import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";

export type PriorIncompleteTask = {
  id: string;
  task_date: string;
  status: string;
};

/** 같은 스케줄에서 더 이른 날짜의 미완료 일일 과제 */
export async function findPriorIncompleteDailyTask(
  admin: SupabaseClient,
  opts: {
    studentId: string;
    assignmentId: string;
    beforeTaskDate: string;
  }
): Promise<PriorIncompleteTask | null> {
  const { data } = await admin
    .from("listening_daily_tasks")
    .select("id, task_date, status")
    .eq("student_id", opts.studentId)
    .eq("assignment_id", opts.assignmentId)
    .lt("task_date", opts.beforeTaskDate)
    .neq("status", "completed")
    .order("task_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as PriorIncompleteTask | null) ?? null;
}

/**
 * 미래 날짜 차단 + lock_next_until_today_complete 시 이전 미완료 과제 차단.
 * (기본값 true — 미완료인데 다음 날로 넘어가는 문제 방지)
 */
export async function assertDailyTaskAccessible(
  admin: SupabaseClient,
  opts: {
    studentId: string;
    task: {
      id: string;
      assignment_id: string;
      task_date: string;
    };
    todayIso?: string;
  }
): Promise<
  | { ok: true }
  | { ok: false; message: string; blockingTaskId?: string }
> {
  const todayIso = opts.todayIso ?? getTodayIsoKorea();
  if (opts.task.task_date > todayIso) {
    return { ok: false, message: "아직 시작일 전인 학습입니다." };
  }

  const { data: assignment } = await admin
    .from("listening_schedule_assignments")
    .select("lock_next_until_today_complete")
    .eq("id", opts.task.assignment_id)
    .maybeSingle();

  // null/undefined도 잠금 ON (마이그레이션 기본값과 동일)
  const lockEnabled = assignment?.lock_next_until_today_complete !== false;
  if (!lockEnabled) return { ok: true };

  const blocking = await findPriorIncompleteDailyTask(admin, {
    studentId: opts.studentId,
    assignmentId: opts.task.assignment_id,
    beforeTaskDate: opts.task.task_date,
  });

  if (!blocking) return { ok: true };

  return {
    ok: false,
    message: `이전 학습(${blocking.task_date})을 먼저 완료해 주세요.`,
    blockingTaskId: blocking.id,
  };
}

/** 배정별: 해당 날짜 이전에 미완료가 있는지 (달력 잠금용) */
export async function loadAssignmentPriorIncompleteDates(
  admin: SupabaseClient,
  studentId: string,
  assignmentIds: string[],
  todayIso: string
): Promise<Map<string, string>> {
  /** assignmentId -> earliest incomplete task_date (<= today) */
  const earliest = new Map<string, string>();
  if (assignmentIds.length === 0) return earliest;

  const { data } = await admin
    .from("listening_daily_tasks")
    .select("assignment_id, task_date, status")
    .eq("student_id", studentId)
    .in("assignment_id", assignmentIds)
    .lte("task_date", todayIso)
    .neq("status", "completed")
    .order("task_date", { ascending: true });

  for (const row of data ?? []) {
    const aid = row.assignment_id as string;
    const date = row.task_date as string;
    if (!earliest.has(aid)) earliest.set(aid, date);
  }
  return earliest;
}
