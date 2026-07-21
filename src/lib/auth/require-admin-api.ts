import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminApi() {
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
    .select("id, role, academy_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return {
      error: NextResponse.json(
        { ok: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      ),
    };
  }

  // 학원 관리자는 반드시 academy_id가 있어야 함
  if (profile.role === "admin" && !profile.academy_id) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          message:
            "학원 정보가 없는 관리자 계정입니다. EngCore Admin에서 학원 관리자로 연결해 주세요.",
        },
        { status: 403 }
      ),
    };
  }

  return { supabase, user, profile };
}
