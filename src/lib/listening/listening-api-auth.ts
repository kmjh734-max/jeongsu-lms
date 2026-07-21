import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function assertListeningSetAccess(setId: string) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false as const, message: "권한이 없습니다.", status: 403 };
  }

  const admin = createAdminClient();
  const { data: setRow, error: setErr } = await admin
    .from("listening_sets")
    .select("id, teacher_id, created_by, academy_id")
    .eq("id", setId)
    .maybeSingle();

  if (setErr || !setRow) {
    return { ok: false as const, message: "듣기 세트를 찾을 수 없습니다.", status: 200 };
  }

  if (
    profile.role === "admin" &&
    profile.academy_id &&
    setRow.academy_id &&
    setRow.academy_id !== profile.academy_id
  ) {
    return {
      ok: false as const,
      message: "다른 학원 세트에는 접근할 수 없습니다.",
      status: 403,
    };
  }

  if (
    profile.role === "teacher" &&
    setRow.teacher_id !== profile.id &&
    setRow.created_by !== profile.id
  ) {
    return { ok: false as const, message: "이 세트에 대한 권한이 없습니다.", status: 403 };
  }

  if (
    profile.role === "teacher" &&
    profile.academy_id &&
    setRow.academy_id &&
    setRow.academy_id !== profile.academy_id
  ) {
    return {
      ok: false as const,
      message: "다른 학원 세트에는 접근할 수 없습니다.",
      status: 403,
    };
  }

  return { ok: true as const, profile, admin, setRow };
}
