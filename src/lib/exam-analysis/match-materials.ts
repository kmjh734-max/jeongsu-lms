import type { SupabaseClient } from "@supabase/supabase-js";

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

  const { data: materials } = await admin
    .from("lesson_material_items")
    .select("id, title, english_text, project:lesson_material_projects(title)")
    .eq("academy_id", academyId)
    .limit(3000);
  const pool = (materials ?? []).map((m) => {
    const project = Array.isArray(m.project) ? m.project[0] : m.project;
    return {
      id: m.id as string,
      label: [project?.title, m.title].filter(Boolean).join(" · "),
      set: new Set(shingles(words(String(m.english_text ?? "")))),
    };
  });
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
