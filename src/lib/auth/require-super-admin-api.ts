import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireSuperAdminApi() {
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
    .select("id, role, academy_id, email, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    return {
      error: NextResponse.json(
        { ok: false, message: "슈퍼관리자 권한이 필요합니다." },
        { status: 403 }
      ),
    };
  }

  return { supabase, user, profile };
}
