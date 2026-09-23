// 듣기 세트를 문항별로 읽기 좋게 꺼낸다(검토용, API 안 씀).
//   node scripts/tmp-rv/dump-set.mjs "중1 1회" "중1 2회" ...
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const outPath =
  outAt >= 0
    ? args[outAt + 1]
    : "C:/Users/kmjh7/AppData/Local/Temp/claude/c--video-app/e53d3a81-1126-4979-9ae9-90ccca3a0846/scratchpad/set-dump.txt";
const titles = outAt >= 0 ? [...args.slice(0, outAt), ...args.slice(outAt + 2)] : args;
if (titles.length === 0) throw new Error("쓰는 법: node dump-set.mjs \"중1 1회\" ...");

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id)
  .in("title", titles);

const out = [];
for (const t of titles) {
  const s = sets.find((x) => x.title === t);
  if (!s) {
    out.push(`##### ${t} — 못 찾음`);
    continue;
  }
  const { data: qs } = await admin
    .from("listening_questions")
    .select("order_index, question_type, instruction, question_text, script_text, choices, correct_answer, explanation, table_data")
    .eq("set_id", s.id)
    .order("order_index");
  out.push(`##### ${t}`);
  for (const q of qs) {
    out.push(`--- ${q.order_index}번 [${q.question_type}] 답${q.correct_answer}`);
    out.push(`지시: ${q.instruction ?? ""}`);
    if (q.question_text) out.push(`문제: ${q.question_text}`);
    out.push(`대본: ${String(q.script_text ?? "").replace(/\s*\n\s*/g, " | ")}`);
    if (q.table_data?.rows) {
      out.push(`표: ${q.table_data.rows.map((r) => `${r.label} ${r.value}`).join("  //  ")}`);
      if (q.table_data.mismatch_reason) out.push(`표설명: ${q.table_data.mismatch_reason}`);
    }
    out.push(`보기: ${(q.choices ?? []).map((c, i) => `${i + 1})${c}`).join("  ")}`);
    out.push(`해설: ${q.explanation ?? ""}`);
  }
}

fs.writeFileSync(outPath, out.join("\n"), "utf8");
console.log("적음:", outPath, "| 줄", out.length);
