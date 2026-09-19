import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 수업자료 하나(lesson_material_projects) = 지문 하나. 지문은 문장 단위(lesson_material_items)로 나뉘어
 * 저장되어 있으므로 순서대로 이어 붙여 한 지문으로 만든다.
 */
export type MaterialPassageFull = {
  projectId: string;
  /** 대조 결과를 걸 첫 문장 id (school_exam_items.matched_item_id) */
  firstItemId: string;
  folder: string;
  title: string;
  text: string;
  updatedAt: string;
};

export async function loadAcademyMaterialPassages(
  admin: SupabaseClient,
  academyId: string,
  projectIds?: string[]
): Promise<MaterialPassageFull[]> {
  let pq = admin
    .from("lesson_material_projects")
    .select("id, title, updated_at, folder:lesson_material_folders(name)")
    .eq("academy_id", academyId)
    .limit(2000);
  if (projectIds?.length) pq = pq.in("id", projectIds);
  const { data: projects } = await pq;
  const list = projects ?? [];
  if (list.length === 0) return [];

  // 문장 조각은 많을 수 있어 여러 번에 나눠 읽는다
  const ids = list.map((p) => p.id as string);
  const items: { id: string; project_id: string; english_text: string; order_index: number }[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await admin
      .from("lesson_material_items")
      .select("id, project_id, english_text, order_index")
      .in("project_id", ids.slice(i, i + 200))
      .order("order_index")
      .limit(20000);
    items.push(...((data ?? []) as typeof items));
  }
  const byProject = new Map<string, typeof items>();
  for (const it of items) byProject.set(it.project_id, [...(byProject.get(it.project_id) ?? []), it]);

  return list
    .map((p) => {
      const rows = (byProject.get(p.id as string) ?? []).sort((a, b) => a.order_index - b.order_index);
      const folder = Array.isArray(p.folder) ? p.folder[0] : p.folder;
      return {
        projectId: p.id as string,
        firstItemId: rows[0]?.id ?? "",
        folder: (folder?.name as string | undefined) ?? "미분류",
        title: (p.title as string) || "수업자료",
        text: rows.map((r) => String(r.english_text ?? "").trim()).filter(Boolean).join(" "),
        updatedAt: String(p.updated_at ?? ""),
      };
    })
    .filter((p) => p.firstItemId && p.text);
}
