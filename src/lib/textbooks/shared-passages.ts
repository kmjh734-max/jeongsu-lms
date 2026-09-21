import type { SupabaseClient } from "@supabase/supabase-js";

/** 교과서 본문을 실제로 가지고 있는 학원 */
const OWNER_SLUG = "jeongsu";

/**
 * 교과서 본문을 함께 쓰도록 연 학원.
 *
 * 여기에 적힌 학원만 교과서 본문을 볼 수 있다. 열어 달라는 말을 들은 곳만 한 줄씩 넣는다.
 * (학원 slug는 super-admin 학원 목록에 있는 그 값이다)
 */
const OPENED_SLUGS = ["bornenglish", "gukje"];

/**
 * 이 학원이 교과서 본문을 어느 학원 것으로 봐야 하는지 알려 준다.
 * 열어 주지 않은 학원은 제 학원 것만 보므로, 넣어 둔 본문이 없으면 아무것도 보이지 않는다.
 */
export async function resolveTextbookPassageAcademyId(
  admin: SupabaseClient,
  academyId: string,
): Promise<string> {
  const { data: mine } = await admin.from("academies").select("slug").eq("id", academyId).maybeSingle();
  const slug = String(mine?.slug ?? "");
  if (slug === OWNER_SLUG || !OPENED_SLUGS.includes(slug)) return academyId;

  const { data: owner } = await admin.from("academies").select("id").eq("slug", OWNER_SLUG).maybeSingle();
  return (owner?.id as string | undefined) ?? academyId;
}
