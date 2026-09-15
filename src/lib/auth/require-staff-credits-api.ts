import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * admin 또는 teacher — 자기 학원 크레딧 조회용 (읽기 전용).
 * 메뉴가 화면을 옮길 때마다 잔액을 물어서, 인증 서버 왕복(getUser) 대신
 * 미들웨어·페이지와 같이 토큰 서명을 여기서 바로 확인한다(getClaims).
 */
export async function requireStaffCreditsApi() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const user = userId ? { id: userId } : null;

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
