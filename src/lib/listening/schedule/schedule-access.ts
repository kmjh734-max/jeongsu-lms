import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function assertScheduleManager() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false as const, message: "권한이 없습니다.", status: 403 };
  }
  return { ok: true as const, profile, admin: createAdminClient() };
}

export async function assertStudentProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { ok: false as const, message: "학생 권한이 필요합니다.", status: 403 };
  }
  return { ok: true as const, profile, admin: createAdminClient() };
}

export async function teacherCanAccessSet(
  profileId: string,
  role: string,
  setId: string
): Promise<boolean> {
  if (role === "admin") return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listening_sets")
    .select("id, teacher_id, created_by")
    .eq("id", setId)
    .maybeSingle();
  if (!data) return false;
  return data.teacher_id === profileId || data.created_by === profileId;
}

export async function teacherCanAccessClass(
  profileId: string,
  role: string,
  classId: string
): Promise<boolean> {
  if (role === "admin") return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .maybeSingle();
  return data?.teacher_id === profileId;
}
