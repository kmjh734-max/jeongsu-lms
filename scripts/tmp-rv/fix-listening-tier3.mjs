// 문항별 검토 4차 — 답은 맞지만 문항이 허술하던 것을 고친다(API 안 씀).
//   node scripts/tmp-rv/fix-listening-tier3.mjs [--적용]
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

const FIXES = [
  {
    set: "고2 3회", no: 8,
    why: "대화는 휴대폰 수리인데 보기가 행사용 항목(개최 기간·모집 인원)이라 대조가 되지 않았다",
    choices: ["수리 완료 예정일", "접수 마감일", "준비물", "하루 접수 대수", "수리 비용"],
    explanation:
      "수리 완료 예정일(9월 5~7일), 맡기는 방법(카운터에서 접수서 작성), 준비물(휴대폰과 신분증), 하루 접수 대수(15대), 수리 비용(45달러)은 언급되지만 접수 마감일은 언급되지 않았다. 따라서 답은 ②이다.",
  },
  {
    set: "고2 1회", no: 12,
    why: "대본에는 '싼 것'과 '파란 것'만 나오는데 정답 보기가 대본에 없는 '중간 크기'를 가리켰다",
    choices: [
      "I rode a bike like that last year.",
      "The seat was uncomfortable.",
      "Sunday is better than Friday.",
      "We can tune it before riding.",
      "Then let's put a deposit on the blue bike now.",
    ],
    explanation:
      "더 괜찮은 파란 자전거가 거의 다 나갔다는 말을 들었으므로, 지금 그 자전거에 예약금을 걸자는 ⑤가 가장 자연스럽다.",
  },
  {
    set: "고1 6회", no: 14,
    why: "대화는 기숙사 카트·짐 옮기기인데 오답 보기 넷이 수영장·사물함 이야기라 정답 하나만 말이 됐다",
    choices: [
      "That sounds sensible after today's schedule change.",
      "You should reserve the loading bay for tonight.",
      "Let's put off the whole move until next month.",
      "Your student card opens every dorm room.",
      "Heavy boxes are easier to carry without a cart.",
    ],
  },
  {
    set: "고2 2회", no: 14,
    why: "대화는 시내 셔틀 시간 변경인데 오답 보기 넷이 어린이집·반려동물 이야기였다",
    choices: [
      "That seems reasonable given the change in hours.",
      "You should reserve a seat on the express line tonight.",
      "Let's stop taking the shuttle for the rest of the week.",
      "Your transit card works on every platform bench.",
      "Crowded platforms are best before the morning rush.",
    ],
  },
  {
    set: "고2 8회", no: 10,
    why: "조건이 '지난 목요일에 발견'인데 표에 요일이 없어 확인할 방법이 없었다",
    // 발견 날짜에 요일을 적고, 목요일이 두 줄이 되게 두어 나머지 조건으로 가리게 한다
    tableDates: ["2026-09-09 (Wed)", "2026-09-10 (Thu)", "2026-09-12 (Sat)", "2026-09-10 (Thu)", "2026-09-13 (Sun)"],
  },
];

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin.from("listening_sets").select("id, title").eq("academy_id", prof.academy_id);

let n = 0;
for (const f of FIXES) {
  const s = sets.find((x) => x.title === f.set);
  if (!s) {
    console.log(`[못 찾음] ${f.set}`);
    continue;
  }
  const { data: q } = await admin
    .from("listening_questions")
    .select("id, choices, explanation, table_data")
    .eq("set_id", s.id)
    .eq("order_index", f.no)
    .single();
  if (!q) {
    console.log(`[못 찾음] ${f.set} ${f.no}번`);
    continue;
  }

  const patch = {};
  if (f.choices) patch.choices = f.choices;
  if (f.explanation) patch.explanation = f.explanation;
  if (f.tableDates && q.table_data?.rows) {
    const rows = q.table_data.rows.map((r, i) => ({
      ...r,
      value: String(r.value).replace(/Found Date:\s*[^/]+/, `Found Date: ${f.tableDates[i]} `),
    }));
    patch.table_data = { ...q.table_data, rows };
  }
  if (Object.keys(patch).length === 0) {
    console.log(`[이미 맞음] ${f.set} ${f.no}번`);
    continue;
  }

  console.log(`${f.set} ${f.no}번 — ${f.why}`);
  if (patch.choices) {
    console.log(`   전) ${(q.choices ?? []).join(" / ")}`);
    console.log(`   후) ${patch.choices.join(" / ")}`);
  }
  if (patch.table_data) {
    console.log(`   표 발견 날짜: ${patch.table_data.rows.map((r) => (String(r.value).match(/Found Date:\s*([^/]+)/) || [])[1]?.trim()).join(" / ")}`);
  }

  if (apply) {
    const { error } = await admin.from("listening_questions").update(patch).eq("id", q.id);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  n += 1;
}

console.log(`${apply ? "적용함" : "미리보기"} — ${n}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");
