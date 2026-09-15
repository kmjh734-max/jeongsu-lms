import type { SupabaseClient } from "@supabase/supabase-js";
import { computeStudentListeningEffectiveStartIso } from "@/lib/listening/schedule/student-effective-start";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

/**
 * 학생 한 명의 진행 중인 듣기 스케줄 과제와, 과제마다 책임지기 시작하는 날.
 *
 * 오늘 과제 만들기 · 오늘 요약 · 달력이 한 요청에서 같은 과제 목록을 각각 다시 읽고,
 * 과제마다 반 가입일을 따로 물었다. 한 번 읽어 넘겨 쓰도록 모았다.
 */
export interface StudentScheduleContext {
  assignments: ScheduleAssignmentRow[];
  /** 과제 id → 유효 시작일 (getStudentListeningEffectiveStartIso 와 같은 값) */
  effectiveStartByAssignment: Map<string, string>;
}

export async function loadStudentScheduleContext(
  admin: SupabaseClient,
  studentId: string
): Promise<StudentScheduleContext> {
  const byId = new Map<string, ScheduleAssignmentRow>();

  const [{ data: direct }, { data: classRows }] = await Promise.all([
    admin
      .from("listening_schedule_assignments")
      .select("*")
      .eq("is_active", true)
      .eq("target_type", "student")
      .eq("target_student_id", studentId),
    admin
      .from("class_students")
      .select("class_id, created_at")
      .eq("student_id", studentId),
  ]);

  for (const row of (direct ?? []) as ScheduleAssignmentRow[]) {
    byId.set(row.id, row);
  }

  // 반 가입 시각 — 반 배정 과제의 유효 시작일 계산에 쓴다 (class_id, student_id 는 유일)
  const joinedAtByClass = new Map<string, string | null>();
  for (const row of classRows ?? []) {
    joinedAtByClass.set(row.class_id as string, (row.created_at as string | null) ?? null);
  }

  const classIds = [...joinedAtByClass.keys()];
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

  const assignments = [...byId.values()];
  const effectiveStartByAssignment = new Map<string, string>();
  for (const a of assignments) {
    effectiveStartByAssignment.set(
      a.id,
      computeStudentListeningEffectiveStartIso(
        a,
        a.target_class_id ? joinedAtByClass.get(a.target_class_id) : null
      )
    );
  }

  return { assignments, effectiveStartByAssignment };
}
