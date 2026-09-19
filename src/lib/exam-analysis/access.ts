import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";

/** 시험지 분석 API: 학원 관리자·선생님만. 실패하면 응답, 통과하면 profile */
export async function requireExamStaff(): Promise<{ profile: Profile & { academy_id: string } } | { error: NextResponse }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 }) };
  if (!["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { error: NextResponse.json({ ok: false, message: "학원 선생님만 쓸 수 있어요." }, { status: 403 }) };
  }
  return { profile: profile as Profile & { academy_id: string } };
}

/** 이 분석이 내 학원 것인지 */
export async function loadOwnAnalysis(id: string, academyId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("school_exam_analyses")
    .select("id, academy_id, status, page_count")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.academy_id !== academyId) return null;
  return data;
}
