import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

export async function canViewStudentReport(
  supabase: SupabaseClient,
  viewerRole: UserRole,
  viewerId: string,
  studentId: string
): Promise<boolean> {
  if (viewerRole === "admin") {
    const [{ data: viewer }, { data: student }] = await Promise.all([
      supabase
        .from("profiles")
        .select("academy_id")
        .eq("id", viewerId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, role, academy_id")
        .eq("id", studentId)
        .eq("role", "student")
        .maybeSingle(),
    ]);
    if (!viewer?.academy_id || !student) return false;
    return student.academy_id === viewer.academy_id;
  }
  if (viewerRole !== "teacher") return false;

  const { data: student } = await supabase
    .from("profiles")
    .select("id, role, created_by")
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();

  if (!student) return false;
  if (student.created_by === viewerId) return true;

  const { data: teacherClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", viewerId);

  const classIds = (teacherClasses ?? []).map((c) => c.id as string);
  if (classIds.length === 0) return false;

  const { data: membership } = await supabase
    .from("class_students")
    .select("id")
    .eq("student_id", studentId)
    .in("class_id", classIds)
    .limit(1)
    .maybeSingle();

  return Boolean(membership);
}
