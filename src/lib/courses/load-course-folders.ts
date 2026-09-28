import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseFolder } from "@/lib/courses/load-courses-page";

/** 학원의 강좌 폴더(옛 카테고리). 왼쪽 목록과 강좌 설정 드롭다운이 함께 쓴다. */
export async function loadCourseFolders(supabase: SupabaseClient): Promise<CourseFolder[]> {
  const { data } = await supabase
    .from("course_folders")
    .select("id, name, order_index")
    .order("order_index");
  return (data ?? []).map((f) => ({
    id: String(f.id),
    name: String(f.name),
    orderIndex: Number(f.order_index ?? 0),
  }));
}
