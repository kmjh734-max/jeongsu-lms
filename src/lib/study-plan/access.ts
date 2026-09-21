import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 학습일정표·교재 목차를 쓰는 학원.
 *
 * 여기에 적힌 학원에서만 메뉴가 보이고 화면에 들어갈 수 있다.
 * 열어 달라는 말을 들은 곳만 한 줄씩 넣는다.
 * (학원 slug는 super-admin 학원 목록에 있는 그 값이다)
 */
const OPENED_SLUGS = ["jeongsu"];

/** 이 학원에서 학습일정표·교재 목차를 쓸 수 있는지 */
export async function isStudyPlanEnabled(academyId: string | null | undefined): Promise<boolean> {
  if (!academyId) return false;
  const { data } = await createAdminClient()
    .from("academies")
    .select("slug")
    .eq("id", academyId)
    .maybeSingle();
  return OPENED_SLUGS.includes(String(data?.slug ?? ""));
}

/** 학습일정표·교재 목차로 가는 메뉴 주소 */
export function isStudyPlanNavItem(href: string): boolean {
  return href === "/admin/study-plans" || href === "/admin/textbooks" || href === "/student/plan";
}
