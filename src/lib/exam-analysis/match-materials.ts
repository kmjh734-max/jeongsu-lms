import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAcademyMaterialPassages } from "@/lib/exam-analysis/material-passages";

/**
 * 시험지 지문이 학원 수업자료(lesson_material_items) 지문과 같은지 글자로 대조한다.
 * 맞은 것만 출처를 단다 — 짐작한 출처는 두지 않는다.
 * 시험지는 지문을 조금 바꿔 내기도 하므로, 지문 앞부분의 5단어 묶음 가운데 30% 이상이 수업자료에 있으면 같은 지문으로 본다.
 */
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/<\/?u>/g, " ")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function shingles(ws: string[], n = 5): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= ws.length; i++) out.push(ws.slice(i, i + n).join(" "));
  return out;
}

export async function matchLessonMaterials(
  admin: SupabaseClient,
  academyId: string,
  excerpts: { key: string; excerpt: string | null }[]
): Promise<Map<string, { itemId: string; label: string }>> {
  const result = new Map<string, { itemId: string; label: string }>();
  const wanted = excerpts.filter((e) => e.excerpt && words(e.excerpt).length >= 8);
  if (wanted.length === 0) return result;

  // 수업자료 하나 = 지문 하나(문장들을 이어 붙인 것)와 대조한다
  const pool = (await loadAcademyMaterialPassages(admin, academyId)).map((m) => ({
    id: m.firstItemId,
    label: `${m.folder} · ${m.title}`,
    set: new Set(shingles(words(m.text))),
  }));
  if (pool.length === 0) return result;

  for (const { key, excerpt } of wanted) {
    const sh = shingles(words(excerpt!));
    if (sh.length === 0) continue;
    let best: { id: string; label: string; score: number } | null = null;
    for (const m of pool) {
      let hit = 0;
      for (const s of sh) if (m.set.has(s)) hit++;
      const score = hit / sh.length;
      if (!best || score > best.score) best = { id: m.id, label: m.label, score };
    }
    if (best && best.score >= 0.3) result.set(key, { itemId: best.id, label: best.label });
  }
  return result;
}

/** 저장된 문항표를 수업자료와 다시 대조해 적중 칸을 채운다(끄면 비운다). AI는 쓰지 않는다. */
export async function refreshMaterialMatches(
  admin: SupabaseClient,
  analysisId: string,
  academyId: string,
  enabled: boolean
): Promise<number> {
  const { data: items } = await admin
    .from("school_exam_items")
    .select("id, passage_excerpt")
    .eq("analysis_id", analysisId);
  const rows = items ?? [];
  const matches = enabled
    ? await matchLessonMaterials(
        admin,
        academyId,
        rows.map((r) => ({ key: r.id as string, excerpt: (r.passage_excerpt as string | null) ?? null }))
      )
    : new Map<string, { itemId: string; label: string }>();
  await Promise.all(
    rows.map((r) => {
      const m = matches.get(r.id as string);
      return admin
        .from("school_exam_items")
        .update({ matched_item_id: m?.itemId ?? null, matched_label: m?.label ?? null })
        .eq("id", r.id as string);
    })
  );
  await admin.from("school_exam_analyses").update({ match_materials: enabled }).eq("id", analysisId);
  return matches.size;
}
