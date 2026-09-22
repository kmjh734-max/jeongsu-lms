// 한 회차 안에서 정답 번호가 한쪽으로 쏠린 것을 보기 자리 맞바꿈으로 고른다.
//   node scripts/tmp-rv/balance-listening-answers.mjs [--적용]
//
// 자리를 바꾸면 안 되는 문항은 건드리지 않는다:
//  - 그림·표 문항(번호가 그림/표에 박혀 있다)
//  - 어색한 대화처럼 방송 번호를 따라가는 문항
//  - 시각·날짜·금액처럼 보기가 순서대로 놓인 문항
//  - 해설에 동그라미 번호가 하나로 떨어지지 않는 문항(고치면 해설이 어긋난다)
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
const SKIP_TYPE = /그림|표|어색한|순서/;
/** 보기가 순서대로 놓인 갈래(자리를 바꾸면 차례가 깨진다) */
const ORDERED_VALUE = /^[$₩]?\s*\d[\d,.:]*\s*(p\.?m\.?|a\.?m\.?)?$/i;
const ORDERED_KO = /^\d+월\s*\d+일$/;

function reorderable(q) {
  if (SKIP_TYPE.test(String(q.question_type ?? ""))) return false;
  if (q.table_data) return false;
  const choices = Array.isArray(q.choices) ? q.choices : [];
  if (choices.length !== 5) return false;
  // ①②③④⑤ 만 적힌 보기(그림·표)는 못 바꾼다
  if (choices.every((c) => MARKS.includes(String(c).trim()))) return false;
  // 시각·날짜·금액처럼 차례가 있는 보기는 못 바꾼다
  const t = choices.map((c) => String(c).trim());
  if (t.every((c) => ORDERED_VALUE.test(c)) || t.every((c) => ORDERED_KO.test(c))) return false;
  // 해설이 지금 정답 번호 하나만 가리켜야 고칠 수 있다
  // 요일처럼 차례가 있는 낱말 보기도 못 바꾼다
  const WEEKDAYS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  if (t.every((c) => WEEKDAYS.includes(c))) return false;
  // 해설에 동그라미 번호가 있으면 지금 정답 하나만 가리켜야 한다(없으면 고칠 것도 없다)
  const exp = String(q.explanation ?? "");
  const found = [...exp].filter((ch) => MARKS.includes(ch));
  const want = MARKS[Number(q.correct_answer) - 1];
  if (!want) return false;
  if (found.some((ch) => ch !== want)) return false;
  return true;
}

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title")
  .eq("academy_id", prof.academy_id)
  .order("title");

let moved = 0;
let touchedSets = 0;

for (const s of sets) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("id, order_index, question_type, choices, correct_answer, explanation, table_data")
    .eq("set_id", s.id)
    .order("order_index");

  const counts = () => {
    const c = [0, 0, 0, 0, 0];
    for (const q of qs) {
      const a = Number(q.correct_answer);
      if (a >= 1 && a <= 5) c[a - 1] += 1;
    }
    return c;
  };

  const changes = [];
  for (let round = 0; round < 8; round++) {
    const c = counts();
    const max = Math.max(...c);
    const min = Math.min(...c);
    if (max - min < 4 && min > 0) break;
    const from = c.indexOf(max);
    const to = c.indexOf(min);
    // 그 번호가 정답인 문항 중 자리를 바꿔도 되는 것 하나를 고른다
    const target = qs.find((q) => Number(q.correct_answer) === from + 1 && reorderable(q));
    if (!target) break;
    const choices = [...target.choices];
    [choices[from], choices[to]] = [choices[to], choices[from]];
    const before = MARKS[from];
    const after = MARKS[to];
    const explanation = String(target.explanation ?? "").split(before).join(after);
    target.choices = choices;
    target.correct_answer = to + 1;
    target.explanation = explanation;
    changes.push({ id: target.id, no: target.order_index, before, after, choices, explanation });
  }

  if (changes.length === 0) continue;
  touchedSets += 1;
  moved += changes.length;
  console.log(`${s.title} — ${counts().join("/")} (${changes.map((x) => `${x.no}번 ${x.before}→${x.after}`).join(", ")})`);
  if (apply) {
    for (const ch of changes) {
      const { error } = await admin
        .from("listening_questions")
        .update({ choices: ch.choices, correct_answer: Number(ch.after === "①" ? 1 : MARKS.indexOf(ch.after) + 1), explanation: ch.explanation })
        .eq("id", ch.id);
      if (error) throw new Error(`${s.title} ${ch.no}번: ${error.message}`);
    }
  }
}

console.log(`${apply ? "적용함" : "미리보기"} — 세트 ${touchedSets}개 · 문항 ${moved}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");
