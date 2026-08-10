import type { SupabaseClient } from "@supabase/supabase-js";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

function maxDateIso(...dates: Array<string | null | undefined>): string {
  const valid = dates.filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}/.test(d)));
  if (valid.length === 0) return getTodayIsoKorea();
  return valid.reduce((a, b) => (a >= b ? a : b));
}

/**
 * 학생이 이 스케줄 과제를 책임지기 시작하는 날.
 * - 반 배정: max(과제 start_date, 배정 생성일, 반 가입일)
 * - 개인 배정: max(과제 start_date, 배정 생성일)
 *
 * 반이 예전에 듣기를 하고 있어도, 늦게 들어오거나 새로 배정된 학생에게
 * 이전 날짜 미완료가 쌓이지 않게 한다.
 */
export async function getStudentListeningEffectiveStartIso(
  admin: SupabaseClient,
  assignment: ScheduleAssignmentRow & { created_at?: string | null },
  studentId: string
): Promise<string> {
  const assignmentCreatedIso = assignment.created_at
    ? getTodayIsoKorea(new Date(assignment.created_at))
    : null;

  let membershipIso: string | null = null;
  if (assignment.target_type === "class" && assignment.target_class_id) {
    const { data } = await admin
      .from("class_students")
      .select("created_at")
      .eq("class_id", assignment.target_class_id)
      .eq("student_id", studentId)
      .maybeSingle();
    if (data?.created_at) {
      membershipIso = getTodayIsoKorea(new Date(data.created_at as string));
    }
  }

  return maxDateIso(
    assignment.start_date,
    assignmentCreatedIso,
    membershipIso
  );
}

/** 유효 시작일 이전의 미완료 일일 과제 제거 (이미 생성된 과거 미완료 정리) */
export async function pruneIncompleteTasksBeforeEffectiveStart(
  admin: SupabaseClient,
  opts: {
    studentId: string;
    assignmentId: string;
    effectiveStartIso: string;
  }
): Promise<number> {
  const { data: rows } = await admin
    .from("listening_daily_tasks")
    .select("id")
    .eq("student_id", opts.studentId)
    .eq("assignment_id", opts.assignmentId)
    .lt("task_date", opts.effectiveStartIso)
    .in("status", ["pending", "in_progress"]);

  const ids = (rows ?? []).map((r) => r.id as string);
  if (ids.length === 0) return 0;

  // progress는 FK cascade
  await admin.from("listening_daily_tasks").delete().in("id", ids);
  return ids.length;
}
