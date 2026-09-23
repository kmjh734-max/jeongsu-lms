/** 대본을 고친 문항만 받아쓰기 빈칸을 다시 만든다. */
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";

const TARGETS: Array<[string, number]> = [
  ["중2 4회", 8], ["중2 6회", 8], ["중2 7회", 8], ["중2 8회", 8], ["중2 10회", 8],
];

const admin = createAdminClient();
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin.from("listening_sets").select("id, title").eq("academy_id", prof!.academy_id);

for (const [title, no] of TARGETS) {
  const s = sets!.find((x) => x.title === title);
  if (!s) continue;
  const { data: q } = await admin
    .from("listening_questions").select("id").eq("set_id", s.id).eq("order_index", no).single();
  if (!q) continue;
  await admin
    .from("listening_questions")
    .update({ dictation_blank_items: null, dictation_blank_variants: null, dictation_prepared_at: null })
    .eq("id", q.id);
  const r = await ensureDictationPreparedForSet(s.id);
  console.log(`${title} ${no}번 — 됨 ${r.ok} · 건너뜀 ${r.skipped} · 실패 ${r.failed}${r.messages.length ? ` · ${r.messages.join(", ")}` : ""}`);
}
