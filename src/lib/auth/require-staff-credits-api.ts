import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** admin 또는 teacher — 자기 학원 크레딧 조회용 */
export async function requireStaffCreditsApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active, academy_id, name")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher")
  ) {
    return {
      error: NextResponse.json(
        { ok: false, message: "학원 스태프 권한이 필요합니다." },
        { status: 403 }
      ),
    };
  }

  if (profile.is_active === false) {
    return {
      error: NextResponse.json(
        { ok: false, message: "비활성화된 계정입니다." },
        { status: 403 }
      ),
    };
  }

  if (!profile.academy_id) {
    return {
      error: NextResponse.json(
        { ok: false, message: "소속 학원 정보가 없습니다." },
        { status: 403 }
      ),
    };
  }

  return { supabase, user, profile };
}
