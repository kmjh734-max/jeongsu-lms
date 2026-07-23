import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { listeningSetIsLocked } from "@/lib/listening/listening-api-auth";

export async function assertScheduleManager() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false as const, message: "권한이 없습니다.", status: 403 };
  }
  if (!profile.academy_id) {
    return {
      ok: false as const,
      message:
        "소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요.",
      status: 403,
    };
  }
  return {
    ok: true as const,
    profile: { ...profile, academy_id: profile.academy_id as string },
    admin: createAdminClient(),
  };
}

export async function assertStudentProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return { ok: false as const, message: "학생 권한이 필요합니다.", status: 403 };
  }
  return { ok: true as const, profile, admin: createAdminClient() };
}

/** Own set, or locked curriculum in the same academy. Always academy-scoped. */
export async function teacherCanAccessSet(
  profileId: string,
  role: string,
  setId: string,
  academyId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("listening_sets")
    .select("id, teacher_id, created_by, academy_id, is_locked, description")
    .eq("id", setId)
    .maybeSingle();
  if (!data) return false;
  if (!data.academy_id || data.academy_id !== academyId) return false;

  if (role === "admin") return true;

  const owns =
    data.teacher_id === profileId || data.created_by === profileId;
  return owns || listeningSetIsLocked(data);
}

export async function teacherCanAccessClass(
  profileId: string,
  role: string,
  classId: string,
  academyId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("classes")
    .select("id, teacher_id, academy_id")
    .eq("id", classId)
    .maybeSingle();
  if (!data) return false;
  if (!data.academy_id || data.academy_id !== academyId) return false;
  if (role === "admin") return true;
  return data.teacher_id === profileId;
}
