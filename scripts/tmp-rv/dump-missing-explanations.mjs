// 해설이 빈 듣기 문항을 대본·보기·정답까지 통째로 꺼낸다(해설을 직접 써 넣으려고).
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

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
    .select("id, order_index, question_type, instruction, question_text, script_text, choices, correct_answer, answer_clue, explanation")
    .eq("set_id", s.id)
    .order("order_index");
  for (const q of qs) {
    if (String(q.explanation ?? "").trim()) continue;
    out.push({
      id: q.id,
      set: s.title,
      no: q.order_index,
      type: q.question_type,
      instruction: q.instruction,
      questionText: q.question_text,
      script: String(q.script_text ?? "").replace(/\s*\n\s*/g, "\n"),
      choices: q.choices,
      answer: q.correct_answer,
      clue: q.answer_clue,
    });
  }
}

fs.writeFileSync(
  "C:/Users/kmjh7/AppData/Local/Temp/claude/c--video-app/e53d3a81-1126-4979-9ae9-90ccca3a0846/scratchpad/missing-exp.json",
  JSON.stringify(out, null, 2),
  "utf8"
);
console.log("문항", out.length, "개");
