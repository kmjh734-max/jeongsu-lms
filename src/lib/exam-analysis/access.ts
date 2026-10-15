import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { isAcademyFeatureOn } from "@/lib/academies/features";

/** 시험지 분석 API: 학원 관리자·선생님만. 실패하면 응답, 통과하면 profile */
export async function requireExamStaff(): Promise<{ profile: Profile & { academy_id: string } } | { error: NextResponse }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 }) };
  if (!["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { error: NextResponse.json({ ok: false, message: "학원 선생님만 쓸 수 있어요." }, { status: 403 }) };
  }
  return { profile: profile as Profile & { academy_id: string } };
}

/** 이 학원에 수업자료 대조가 열려 있는지 (정수학원만 — 선생님 결정 2026-10-02) */
export async function materialMatchOpen(academyId: string | null | undefined): Promise<boolean> {
  return isAcademyFeatureOn(createAdminClient(), academyId, "exam_material_match");
}

const MATCH_CLOSED = "이 학원에서는 수업자료 대조를 쓸 수 없어요.";

/** 수업자료 대조 API 공통 — 닫힌 학원이면 응답을 돌려준다 */
export async function requireMaterialMatch(academyId: string): Promise<NextResponse | null> {
  if (await materialMatchOpen(academyId)) return null;
  return NextResponse.json({ ok: false, message: MATCH_CLOSED }, { status: 403 });
}

/** 수업자료 대조 서버 액션 공통 — 닫힌 학원이면 던진다 */
export async function assertMaterialMatch(academyId: string): Promise<void> {
  if (!(await materialMatchOpen(academyId))) throw new Error(MATCH_CLOSED);
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
