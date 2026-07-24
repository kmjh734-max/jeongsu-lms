import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import type { Profile } from "@/types/database";

export async function requireExamPrepStaff(): Promise<Profile> {
  if (!isExamPrepEnabled()) {
    throw new Response(
      JSON.stringify({
        ok: false,
        message: "이 학원에서는 내신대비학습을 사용하지 않습니다.",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    throw new Response(
      JSON.stringify({ ok: false, message: "권한이 없습니다." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  if (profile.role === "teacher" && profile.is_active === false) {
    throw new Response(
      JSON.stringify({ ok: false, message: "비활성 계정입니다." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!profile.academy_id) {
    throw new Response(
      JSON.stringify({
        ok: false,
        message: "소속 학원 정보가 없습니다.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return profile;
}

export async function requireExamPrepStudent(): Promise<Profile> {
  if (!isExamPrepEnabled()) {
    throw new Response(
      JSON.stringify({
        ok: false,
        message: "이 학원에서는 내신대비학습을 사용하지 않습니다.",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    throw new Response(
      JSON.stringify({ ok: false, message: "권한이 없습니다." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  if (profile.is_active === false) {
    throw new Response(
      JSON.stringify({ ok: false, message: "비활성 계정입니다." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return profile;
}
