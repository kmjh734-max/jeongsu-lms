import type { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = ReturnType<typeof createAdminClient>;

/** 학생이 세트에 배정됐는지 (개별·반 배정). service role RPC의 auth.uid() 대신 명시적 studentId 사용 */
export async function isStudentAssignedListeningSet(
  supabase: AdminClient | SupabaseClient,
  studentId: string,
  setId: string
): Promise<boolean> {
  const { data: direct } = await supabase
    .from("listening_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .limit(1)
    .maybeSingle();

  if (direct) return true;

  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);

  const classIds = (classLinks ?? []).map((r) => r.class_id as string);

  if (classIds.length > 0) {
    const { data: classAssign } = await supabase
      .from("listening_assignments")
      .select("id")
      .eq("set_id", setId)
      .in("class_id", classIds)
      .limit(1)
      .maybeSingle();

    if (classAssign) return true;
  }

  const { data: scheduleTask } = await supabase
    .from("listening_daily_tasks")
    .select("id")
    .eq("student_id", studentId)
    .eq("set_id", setId)
    .limit(1)
    .maybeSingle();

  if (scheduleTask) return true;

  const { data: scheduleSets } = await supabase
    .from("listening_schedule_assignment_sets")
    .select("assignment_id")
    .eq("set_id", setId);

  const assignmentIds = (scheduleSets ?? []).map(
    (r) => r.assignment_id as string
  );
  if (assignmentIds.length === 0) return false;

  const { data: directSchedule } = await supabase
    .from("listening_schedule_assignments")
    .select("id")
    .eq("is_active", true)
    .eq("target_type", "student")
    .eq("target_student_id", studentId)
    .in("id", assignmentIds)
    .limit(1)
    .maybeSingle();

  if (directSchedule) return true;

  if (classIds.length === 0) return false;

  const { data: classSchedule } = await supabase
    .from("listening_schedule_assignments")
    .select("id")
    .eq("is_active", true)
    .eq("target_type", "class")
    .in("target_class_id", classIds)
    .in("id", assignmentIds)
    .limit(1)
    .maybeSingle();

  return !!classSchedule;
}
