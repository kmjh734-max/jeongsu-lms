import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 외부지문 모음(수능특강 등)을 열어 준 학원.
 *
 * 선생님 요청(2026-10-05): 정수학원과 김철진 선생님에게만 연다.
 * 다른 학원을 열 때는 여기에 slug를 보탠다.
 */
const OPEN_SLUGS = new Set(["jeongsu", "jaywill55"]);

/** 이 학원이 외부지문을 불러올 수 있는지 — 화면에 단추를 보일지 정할 때도 쓴다 */
export async function isOutsidePassageOpen(
  admin: SupabaseClient,
  academyId: string | null | undefined,
): Promise<boolean> {
  if (!academyId) return false;
  const { data } = await admin.from("academies").select("slug").eq("id", academyId).maybeSingle();
  return OPEN_SLUGS.has(String(data?.slug ?? ""));
}
