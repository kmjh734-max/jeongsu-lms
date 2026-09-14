import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 자료함 지문의 순서 번호(order_index)는 폴더 안에서의 순서다. 새로 들어오는 지문(새로
 * 만들기·옮기기·복사)은 그 폴더의 맨 뒤에 붙인다.
 *
 * 예전에는 새 지문·복사본을 모두 0번으로 넣고, 옮길 때는 예전 폴더의 번호를 그대로 들고
 * 갔다. 번호가 겹치면 마지막으로 고친 시각으로 줄을 세워서, 옮기거나 내용을 고칠 때마다
 * 순서가 뒤바뀌었다.
 */
export async function nextOrderIndexInFolder(
  supabase: SupabaseClient,
  academyId: string,
  folderId: string | null,
  excludeIds: string[] = []
): Promise<number> {
  let q = supabase
    .from("lesson_material_projects")
    .select("order_index")
    .eq("academy_id", academyId)
    .is("deleted_at", null)
    .order("order_index", { ascending: false })
    .limit(1);
  q = folderId ? q.eq("folder_id", folderId) : q.is("folder_id", null);
  // 옮기는 지문 자신은 빼고 센다(같은 폴더 안에서 다시 옮기는 경우).
  if (excludeIds.length > 0) q = q.not("id", "in", `(${excludeIds.join(",")})`);
  const { data } = await q;
  const top = data?.[0]?.order_index;
  return typeof top === "number" ? top + 1 : 0;
}
