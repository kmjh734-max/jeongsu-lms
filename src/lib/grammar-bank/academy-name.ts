import { createAdminClient } from "@/lib/supabase/admin";

/** 인쇄물 머리글·꼬리말에 넣을 학원 이름 */
export async function loadAcademyName(
  academyId: string | null | undefined,
): Promise<string> {
  if (!academyId) return "";
  const { data } = await createAdminClient()
    .from("academies")
    .select("name")
    .eq("id", academyId)
    .maybeSingle();
  return String(data?.name ?? "");
}
