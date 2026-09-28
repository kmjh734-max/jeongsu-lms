import type { SupabaseClient } from "@supabase/supabase-js";
import { isAcademyFeatureOn } from "@/lib/academies/features";

/** 교과서 본문을 실제로 가지고 있는 학원 */
const OWNER_SLUG = "jeongsu";

/**
 * 이 학원이 교과서 본문을 어느 학원 것으로 봐야 하는지 알려 준다.
 *
 * 열어 둔 학원은 정수학원에 쌓아 둔 본문을 함께 본다.
 * 열지 않은 학원은 제 학원 것만 보므로, 넣어 둔 본문이 없으면 아무것도 보이지 않는다.
 * 어느 학원을 열지는 슈퍼관리자 화면의 「기능」 탭에서 정한다.
 */
export async function resolveTextbookPassageAcademyId(
  admin: SupabaseClient,
  academyId: string,
): Promise<string> {
  const { data: mine } = await admin.from("academies").select("slug").eq("id", academyId).maybeSingle();
  if (String(mine?.slug ?? "") === OWNER_SLUG) return academyId;
  if (!(await isAcademyFeatureOn(admin, academyId, "textbook_passages"))) return academyId;

  const { data: owner } = await admin.from("academies").select("id").eq("slug", OWNER_SLUG).maybeSingle();
  return (owner?.id as string | undefined) ?? academyId;
}

/** 이 학원이 교과서 본문을 쓸 수 있는지 — 화면에 단추를 보일지 정할 때 쓴다 */
export async function isTextbookPassageOpen(
  admin: SupabaseClient,
  academyId: string | null | undefined,
): Promise<boolean> {
  return isAcademyFeatureOn(admin, academyId, "textbook_passages");
}
