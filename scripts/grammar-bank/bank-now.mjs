// 지금 문법 은행에 무엇이 들어 있는지 본다
//   node scripts/grammar-bank/bank-now.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .select("level, level_name, chapter_no, chapter, kind, question_kind, source_file, tier")
    .range(from, from + 999);
  if (error) throw new Error(error.message);
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

console.log(`전체 문항 ${rows.length}개`);

const by = (fn) => {
  const m = new Map();
  for (const r of rows) m.set(fn(r), (m.get(fn(r)) ?? 0) + 1);
  return [...m].sort((a, b) => String(a[0]).localeCompare(String(b[0]), "ko"));
};

console.log("\n단계(level)별");
for (const [k, n] of by((r) => `${r.level} ${r.level_name}`)) console.log(`  ${k}: ${n}개`);

console.log("\n난이도(tier)별");
for (const [k, n] of by((r) => String(r.tier))) console.log(`  ${k}: ${n}개`);

console.log("\n유형(question_kind)별");
for (const [k, n] of by((r) => String(r.question_kind))) console.log(`  ${k}: ${n}개`);

const books = new Map();
for (const r of rows) {
  const head = String(r.source_file ?? "").slice(0, 24);
  books.set(head, (books.get(head) ?? 0) + 1);
}
console.log(`\n출처 파일 ${new Set(rows.map((r) => r.source_file)).size}개 · 앞머리 몇 가지`);
for (const [k, n] of [...books].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${k}… : ${n}개`);

const chapters = new Set(rows.map((r) => `${r.level}|${r.chapter_no}|${r.chapter}`));
console.log(`\n단원 ${chapters.size}개`);
