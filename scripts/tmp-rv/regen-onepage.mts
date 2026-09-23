/**
 * 1장 재료를 새 기준으로 다시 만든다(중요표현·함축의미 검수가 들어간 뒤).
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/tmp-rv/regen-onepage.mts <몇 개>
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOnePageContent } from "@/lib/lesson-materials/generate-one-page";
import { isOnePageContentFresh, onePageSentences } from "@/lib/lesson-materials/one-page";

const limit = Number(process.argv[2] ?? 1);
const admin = createAdminClient();
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: projects } = await admin
  .from("lesson_material_projects")
  .select("id, title, lesson_pack_json")
  .eq("academy_id", prof!.academy_id)
  .not("lesson_pack_json", "is", null)
  .order("created_at", { ascending: false })
  .limit(80);

const stale = [];
for (const p of projects ?? []) {
  const pack = p.lesson_pack_json as Record<string, unknown>;
  if (!pack?.onePageContent) continue;
  const { data: items } = await admin
    .from("lesson_material_items")
    .select("english_text, korean_text")
    .eq("project_id", p.id)
    .order("order_index");
  const sentences = onePageSentences(items ?? []);
  const fresh = isOnePageContentFresh(pack.onePageContent as never, sentences.map((s) => s.english));
  if (!fresh) stale.push({ p, sentences });
}
console.log(`재료가 옛 형식인 지문 ${stale.length}개 · 이번에 ${Math.min(limit, stale.length)}개를 다시 만듭니다`);

for (const { p, sentences } of stale.slice(0, limit)) {
  const at = Date.now();
  const { content, usage, notes } = await generateOnePageContent({
    title: p.title as string,
    sentences: sentences.map((s) => s.english),
  });
  const pack = { ...(p.lesson_pack_json as Record<string, unknown>), onePageContent: content };
  await admin.from("lesson_material_projects").update({ lesson_pack_json: pack }).eq("id", p.id);

  const won = ((usage.inputTokens / 1e6) * 0.25 + (usage.outputTokens / 1e6) * 2) * 1400;
  console.log(`\n===== ${p.title}  (${Math.round((Date.now() - at) / 1000)}초 · 약 ${won.toFixed(0)}원)`);
  console.log(`어법 ${content.grammar.length} · 낱말 ${content.vocab.length} · 지칭 ${content.references?.length ?? 0}`);
  console.log(`중요표현 ${content.paraphrases.length}개:`);
  for (const x of content.paraphrases) console.log(`   · ${x.expression} — ${x.meaningKo}`);
  console.log(`함축의미 ${content.implications?.length ?? 0}개:`);
  for (const x of content.implications ?? []) console.log(`   · ${x.expression} — ${x.meaningKo}`);
  const drop = notes.filter((n) => n.includes("제외"));
  if (drop.length) console.log(`검수: ${drop.join(" / ")}`);
}
