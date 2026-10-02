// 은행을 파일로 내린다. 바깥 모델은 부르지 않는다.
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
    .select(
      "id, source_file, number, level, level_name, chapter_no, chapter, unit, "
        + "question_kind, prompt, body, choices, answer, explanation, tier",
    )
    .order("id", { ascending: true })
    .range(from, from + 999);
  if (error) throw new Error(error.message);
  rows.push(...(data ?? []));
  process.stdout.write(`\r dumped ${rows.length}`);
  if (!data || data.length < 1000) break;
}
fs.mkdirSync("tmp-grammar-bank", { recursive: true });
fs.writeFileSync("tmp-grammar-bank/bank-all.json", JSON.stringify(rows));
const books = new Map();
for (const r of rows) books.set(r.source_file, (books.get(r.source_file) ?? 0) + 1);
console.log(`\n문항 ${rows.length}개 / 출처 ${books.size}개`);
for (const [name, n] of [...books.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n}\t${name}`);
}
