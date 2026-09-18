import type { SupabaseClient } from "@supabase/supabase-js";

/** 학원에서 이미 쓰는 강좌 카테고리 (보이는 강좌 기준, 가나다순) */
export async function loadCourseCategories(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("courses").select("category").not("category", "is", null);
  return [...new Set((data ?? []).map((r) => (r.category as string).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ko")
  );
}
