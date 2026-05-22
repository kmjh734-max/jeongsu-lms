import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabStageProgressRow } from "@/components/vocab/VocabStageProgressTable";

export async function loadSetStageProgressRows(
  supabase: SupabaseClient,
  setId: string
): Promise<VocabStageProgressRow[]> {
  const { data: assignments } = await supabase
    .from("vocab_assignments")
    .select("student_id, class_id")
    .eq("set_id", setId);

  const studentIds = new Set<string>();
  for (const a of assignments ?? []) {
    if (a.student_id) studentIds.add(a.student_id);
  }

  const classIds = (assignments ?? [])
    .map((a) => a.class_id)
    .filter((id): id is string => Boolean(id));

  if (classIds.length > 0) {
    const { data: classStudents } = await supabase
      .from("class_students")
      .select("student_id")
      .in("class_id", classIds);
    for (const row of classStudents ?? []) {
      studentIds.add(row.student_id);
    }
  }

  if (studentIds.size === 0) return [];

  const ids = [...studentIds];

  const [{ data: students }, { data: progressRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, login_id")
      .in("id", ids)
      .eq("role", "student")
      .order("name"),
    supabase
      .from("vocab_stage_progress")
      .select("*")
      .eq("set_id", setId)
      .in("student_id", ids),
  ]);

  const progressByStudent = new Map(
    (progressRows ?? []).map((p) => [p.student_id as string, p])
  );

  return (students ?? []).map((s) => {
    const p = progressByStudent.get(s.id);
    return {
      studentId: s.id,
      studentName: (s.name as string) || (s.login_id as string) || "—",
      stage1Completed: Boolean(p?.stage1_completed),
      stage2Completed: Boolean(p?.stage2_completed),
      stage3Passed: Boolean(p?.stage3_passed),
      stage3LastScore: (p?.stage3_last_score as number) ?? 0,
      stage3BestScore: (p?.stage3_best_score as number) ?? 0,
      stage3AttemptCount: (p?.stage3_attempt_count as number) ?? 0,
    };
  });
}
