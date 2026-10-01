// 문법 은행 전수 점검 — 한 줄이라도 모양이 어긋난 것이 있는지 본다.
//   node scripts/grammar-bank/bank-audit.mjs
//
// 바깥 서비스는 부르지 않는다. 은행을 읽어 세어 보기만 한다.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .select("id, source_file, number, level, level_name, chapter_no, chapter, unit, "
            + "question_kind, prompt, body, choices, answer, explanation, tier")
    .range(from, from + 999);
  if (error) throw new Error(error.message);
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}
console.log(`전체 ${rows.length}개`);

const tree = JSON.parse(fs.readFileSync("tmp-grammar-bank/unit-tree.json", "utf8"));
const seat = (r) => `${r.level}-${r.chapter_no}`;

const 흠 = {
  "답 없음": [],
  "발문 없음": [],
  "본문 없음": [],
  "선택지 하나뿐": [],
  "정답 번호가 선택지 밖": [],
  "단계 없음": [],
  "단원이 목차 밖": [],
  "세부 목차 비었음": [],
  "세부 목차가 트리 밖": [],
  "난이도 없음": [],
};

const MARKS = "①②③④⑤⑥⑦⑧⑨⑩";
for (const r of rows) {
  const where = `${r.source_file} #${r.number}`;
  const body = Array.isArray(r.body) ? r.body : [];
  const choices = Array.isArray(r.choices) ? r.choices : [];
  if (!String(r.answer ?? "").trim()) 흠["답 없음"].push(where);
  if (!String(r.prompt ?? "").trim()) 흠["발문 없음"].push(where);
  if (!body.some((b) => String(b ?? "").trim()) && !choices.length) 흠["본문 없음"].push(where);
  if (choices.length === 1) 흠["선택지 하나뿐"].push(where);
  const picked = [...String(r.answer ?? "")].filter((c) => MARKS.includes(c))
    .map((c) => MARKS.indexOf(c) + 1);
  if (picked.length && choices.length && Math.max(...picked) > choices.length) {
    흠["정답 번호가 선택지 밖"].push(where);
  }
  if (!r.level || !r.level_name) 흠["단계 없음"].push(where);
  if (!tree[seat(r)]) 흠["단원이 목차 밖"].push(`${where} (${r.level_name} ${r.chapter})`);
  else if (!String(r.unit ?? "").trim()) 흠["세부 목차 비었음"].push(where);
  else if (!tree[seat(r)].includes(r.unit)) {
    흠["세부 목차가 트리 밖"].push(`${where} (${r.level_name} ${r.chapter} / ${r.unit})`);
  }
  if (!r.tier) 흠["난이도 없음"].push(where);
}

let total = 0;
for (const [name, list] of Object.entries(흠)) {
  total += list.length;
  console.log(`  ${name}: ${list.length}개`);
  for (const one of list.slice(0, 5)) console.log(`      · ${one}`);
}
console.log(total === 0 ? "\n모두 깨끗하다." : `\n손볼 곳 ${total}군데`);
