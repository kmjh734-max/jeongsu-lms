// 표·그림 문항에서 표 설명·해설이 가리키는 번호와 저장된 정답이 어긋난 것을 찾는다(API 안 씀).
//   node scripts/tmp-rv/audit-table-answers.mjs [--적용]
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const apply = process.argv.includes("--적용");

const MARKS = "①②③④⑤";
/** 글 안의 동그라미 번호들(중복 뺀 것) */
const marksIn = (t) => [...new Set([...String(t ?? "")].filter((ch) => MARKS.includes(ch)))];

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id)
  .order("title");

const bad = [];
let checked = 0;

for (const s of sets) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("id, order_index, question_type, choices, correct_answer, explanation, table_data")
    .eq("set_id", s.id)
    .order("order_index");

  for (const q of qs) {
    const marksOnly =
      Array.isArray(q.choices) && q.choices.length === 5 && q.choices.every((c) => MARKS.includes(String(c).trim()));
    if (!marksOnly) continue;
    checked += 1;

    const ans = Number(q.correct_answer);
    // 표 설명(mismatch_reason)과 해설이 가리키는 번호를 모은다
    const fromReason = marksIn(q.table_data?.mismatch_reason);
    const fromExp = marksIn(q.explanation);
    const votes = [];
    if (fromReason.length === 1) votes.push(MARKS.indexOf(fromReason[0]) + 1);
    if (fromExp.length === 1) votes.push(MARKS.indexOf(fromExp[0]) + 1);
    if (votes.length === 0) continue;
    // 두 곳이 같은 번호를 가리키고, 그것이 저장된 정답과 다르면 정답이 틀린 것이다
    const uniq = [...new Set(votes)];
    if (uniq.length === 1 && uniq[0] !== ans) {
      bad.push({
        id: q.id,
        set: s.title,
        no: q.order_index,
        type: q.question_type,
        was: ans,
        now: uniq[0],
        reason: q.table_data?.mismatch_reason ?? "",
        exp: String(q.explanation ?? "").slice(0, 80),
      });
    } else if (uniq.length > 1) {
      console.log(`[살핌] ${s.title} ${q.order_index}번 — 표 설명과 해설이 서로 다름(${uniq.join(",")}), 정답 ${ans}`);
    }
  }
}

console.log(`①~⑤ 보기 문항 ${checked}개 중 어긋난 것 ${bad.length}개`);
for (const b of bad) {
  console.log(`  · ${b.set} ${b.no}번 [${b.type}] 정답 ${b.was} → ${b.now}`);
  if (b.reason) console.log(`      표 설명: ${b.reason}`);
  console.log(`      해설: ${b.exp}`);
}

if (apply) {
  for (const b of bad) {
    const { error } = await admin.from("listening_questions").update({ correct_answer: b.now }).eq("id", b.id);
    if (error) throw new Error(`${b.set} ${b.no}번: ${error.message}`);
  }
  console.log(`적용함 — ${bad.length}개`);
} else if (bad.length) {
  console.log("적용하려면 --적용 을 붙이세요.");
}
