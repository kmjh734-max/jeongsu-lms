import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 어휘 진단은 「vocab_diagnostic」 기능을 켠 학원(정수학원)의 관리자만 쓴다.
 * 메뉴만 숨기지 않고 페이지·서버 액션 모두 여기서 막는다.
 */
export async function isVocabDiagOpen(academyId: string | null | undefined): Promise<boolean> {
  return isAcademyFeatureOn(createAdminClient(), academyId, "vocab_diagnostic");
}

export type DiagStaff = { userId: string; academyId: string };

/** 페이지용: 열려 있지 않으면 null */
export async function getDiagStaff(): Promise<DiagStaff | null> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) return null;
  if (!(await isVocabDiagOpen(profile.academy_id))) return null;
  return { userId: profile.id, academyId: profile.academy_id };
}

/** 서버 액션용: 열려 있지 않으면 던진다 */
export async function requireDiagStaff(): Promise<DiagStaff> {
  const staff = await getDiagStaff();
  if (!staff) throw new Error("어휘 진단을 쓸 수 있는 권한이 없습니다.");
  return staff;
}
