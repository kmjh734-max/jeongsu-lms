// 지시문이 대본과 맞는지 한눈에 보려고, 갈래별로 지시문 + 대본 첫머리를 모은다(API 안 씀).
//   node scripts/tmp-rv/scan-instructions.mjs [갈래키워드]
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const key = process.argv[2] ?? "";

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id)
  .order("title");

const out = [];
for (const s of sets) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("order_index, question_type, instruction, script_text, choices, correct_answer")
    .eq("set_id", s.id)
    .order("order_index");
  for (const q of qs) {
    const type = String(q.question_type ?? "");
    if (key && !type.includes(key)) continue;
    const script = String(q.script_text ?? "").replace(/\s*\n\s*/g, " ").slice(0, 190);
    out.push(
      `${s.title} ${q.order_index}번 [${type}] 답${q.correct_answer}\n  지시: ${q.instruction ?? ""}\n  대본: ${script}\n  보기: ${(q.choices ?? []).join(" / ")}`
    );
  }
}

const path = "C:/Users/kmjh7/AppData/Local/Temp/claude/c--video-app/e53d3a81-1126-4979-9ae9-90ccca3a0846/scratchpad/scan-instructions.txt";
fs.writeFileSync(path, out.join("\n"), "utf8");
console.log("적음:", path, "| 문항", out.length);
