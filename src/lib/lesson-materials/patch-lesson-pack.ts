import type { createClient } from "@/lib/supabase/server";
import type { LessonPackData } from "@/lib/lesson-materials/generate-lesson-pack";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * lesson_pack_json의 일부 필드만 바꿔 저장한다. 어법 선택·어휘 선택·워크북 제작·1장 자료가 같은
 * 지문에 동시에 캐시를 저장하므로, 읽은 뒤 누가 먼저 저장했으면(updated_at이 바뀌었으면) 다시
 * 읽어 합친다. 예전에는 나중 저장이 앞 저장을 덮어 캐시가 사라졌고, 다음 제작 때 같은 지문을
 * 다시 만들며 크레딧을 또 받았다(2026-09-15 어법·어휘 4지문 두 번 차감).
 */
export async function patchLessonPack(
  supabase: ServerSupabase,
  projectId: string,
  fallback: Partial<LessonPackData>,
  patch: Partial<LessonPackData>
): Promise<void> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data } = await supabase
      .from("lesson_material_projects")
      .select("lesson_pack_json, updated_at")
      .eq("id", projectId)
      .maybeSingle();
    if (!data) return;
    const base = ((data.lesson_pack_json as Partial<LessonPackData> | null) ?? fallback) || {};
    const next: LessonPackData = {
      ...base,
      ...patch,
      headerLabel: base.headerLabel || "26년도 1학기 중간고사 대비",
      vocab: base.vocab ?? [],
      updatedAt: new Date().toISOString(),
    };
    let update = supabase
      .from("lesson_material_projects")
      .update({ lesson_pack_json: next, updated_at: new Date().toISOString() })
      .eq("id", projectId);
    update = data.updated_at ? update.eq("updated_at", data.updated_at) : update.is("updated_at", null);
    const { data: saved } = await update.select("id");
    if (saved && saved.length > 0) return;
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 160));
  }
  console.error("[patchLessonPack] gave up after concurrent saves", projectId);
}
