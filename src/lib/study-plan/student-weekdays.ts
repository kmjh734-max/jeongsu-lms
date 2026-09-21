import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 이 학생이 다니는 반의 수업 요일(0=월 … 6=일).
 *
 * 반이 여러 개면 모든 반의 요일을 합친다. 요일을 적어 두지 않은 반은 넘어간다.
 */
export async function studentClassWeekdays(
  admin: SupabaseClient,
  studentId: string,
): Promise<number[]> {
  const { data: members } = await admin
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);
  const classIds = [...new Set((members ?? []).map((m) => String(m.class_id)))];
  if (classIds.length === 0) return [];

  const { data: classes } = await admin
    .from("classes")
    .select("weekdays")
    .in("id", classIds);

  const days = new Set<number>();
  for (const c of classes ?? []) {
    for (const d of (c.weekdays as number[] | null) ?? []) {
      if (Number.isInteger(d) && d >= 0 && d <= 6) days.add(d);
    }
  }
  return [...days].sort((a, b) => a - b);
}
