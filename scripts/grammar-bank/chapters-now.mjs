// 지금 은행의 단원 목록 — 새 교재를 어디에 붙일지 정할 때 쓴다
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
    .select("level, level_name, chapter_no, chapter")
    .range(from, from + 999);
  if (error) throw new Error(error.message);
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}
const m = new Map();
for (const r of rows) {
  const k = `${r.level}|${r.chapter_no}|${r.chapter}`;
  m.set(k, (m.get(k) ?? 0) + 1);
}
const list = [...m].map(([k, n]) => {
  const [level, no, ch] = k.split("|");
  return { level: Number(level), no: Number(no), ch, n };
});
list.sort((a, b) => a.level - b.level || a.no - b.no);
let last = null;
for (const r of list) {
  if (r.level !== last) {
    last = r.level;
    console.log(`\n[레벨 ${r.level}]`);
  }
  console.log(`  ${String(r.no).padStart(2)}. ${r.ch}  (${r.n}개)`);
}
console.log(`\n단원 ${list.length}개`);
