import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleAssignmentRow } from "@/lib/listening/schedule/types";

export async function resolveStudentIdsForScheduleAssignment(
  admin: SupabaseClient,
  assignment: Pick<
    ScheduleAssignmentRow,
    "target_type" | "target_class_id" | "target_student_id"
  >
): Promise<string[]> {
  if (assignment.target_type === "student" && assignment.target_student_id) {
    return [assignment.target_student_id];
  }

  if (assignment.target_type === "class" && assignment.target_class_id) {
    const { data } = await admin
      .from("class_students")
      .select("student_id")
      .eq("class_id", assignment.target_class_id);

    return (data ?? [])
      .map((r) => r.student_id as string)
      .filter(Boolean);
  }

  return [];
}
