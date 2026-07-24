import { NextResponse } from "next/server";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireNeltStaff(): Promise<
  | { ok: true; profile: Profile; supabase: SupabaseClient; academyId: string }
  | { ok: false; error: NextResponse }
> {
  if (!isNeltEnabled()) {
    return {
      ok: false,
      error: NextResponse.json(
        { ok: false, message: "이 학원에서는 NELT 성장 리포트를 사용하지 않습니다." },
        { status: 404 }
      ),
    };
  }

  const profile = await getCurrentProfile();
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher") ||
    !profile.academy_id
  ) {
    return {
      ok: false,
      error: NextResponse.json(
        { ok: false, message: "권한이 없습니다." },
        { status: 403 }
      ),
    };
  }

  const supabase = await createClient();
  return {
    ok: true,
    profile,
    supabase,
    academyId: profile.academy_id,
  };
}
