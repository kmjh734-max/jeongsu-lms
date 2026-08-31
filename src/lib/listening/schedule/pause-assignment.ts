import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { bootstrapDailyTasksForAssignment } from "@/lib/listening/schedule/generate-daily-tasks";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

/** 오늘·이후 미완료 일일 과제 삭제 (일시정지 시 학생 화면·밀린 과제 방지) */
export async function clearIncompleteTasksFromDate(
  admin: SupabaseClient,
  assignmentId: string,
  fromDateIso: string
): Promise<number> {
  const { data: rows } = await admin
    .from("listening_daily_tasks")
    .select("id")
    .eq("assignment_id", assignmentId)
    .gte("task_date", fromDateIso)
    .in("status", ["pending", "in_progress"]);

  const ids = (rows ?? []).map((r) => r.id as string);
  if (ids.length === 0) return 0;

  await admin.from("listening_daily_tasks").delete().in("id", ids);
  return ids.length;
}

export async function pauseScheduleAssignment(
  admin: SupabaseClient,
  assignmentId: string,
  todayIso = getTodayIsoKorea()
): Promise<{ clearedTasks: number }> {
  const clearedTasks = await clearIncompleteTasksFromDate(
    admin,
    assignmentId,
    todayIso
  );

  await admin
    .from("listening_schedule_assignments")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId);

  return { clearedTasks };
}

export async function resumeScheduleAssignment(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow,
  options?: { bootstrap?: boolean }
): Promise<void> {
  await admin
    .from("listening_schedule_assignments")
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignment.id);

  if (options?.bootstrap !== false) {
    await bootstrapDailyTasksForAssignment(admin, assignment);
  }
}
