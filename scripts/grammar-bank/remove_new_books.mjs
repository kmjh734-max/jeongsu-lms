// 새 교재에서 넣은 문항을 은행에서 다시 뺀다 — 되돌리는 길.
//
//   node scripts/grammar-bank/remove_new_books.mjs          (몇 개인지 세어만 본다)
//   node scripts/grammar-bank/remove_new_books.mjs --적용    (정말 뺀다)
//
// 새 교재 문항은 source_file 이 교재 이름이라 다른 자료와 겹치지 않는다.
// 바깥 서비스는 부르지 않는다.
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

const BOOKS = [
  "그래머큐 Starter 1",
  "그래머큐 Starter 2",
  "그래머큐 Intermediate 1",
  "그래머큐 Intermediate 2",
  "그래머큐 Advanced 1",
  "그래머큐 Advanced 2",
  "잘풀리는영문법_1권",
  "잘풀리는영문법_2권",
  "잘풀리는영문법_3권",
];

const apply = process.argv.includes("--적용");

let total = 0;
for (const book of BOOKS) {
  const { count } = await admin
    .from("grammar_bank_questions")
    .select("id", { count: "exact", head: true })
    .eq("source_file", book);
  if (count) console.log(`   ${book}: ${count}개`);
  total += count ?? 0;
}
console.log(`새 교재 문항 ${total}개`);

if (!apply) {
  console.log("세어만 봤습니다. 정말 빼려면 --적용 을 붙이세요.");
  process.exit(0);
}

for (const book of BOOKS) {
  const { error } = await admin
    .from("grammar_bank_questions")
    .delete()
    .eq("source_file", book);
  if (error) throw new Error(`${book}: ${error.message}`);
}
const { count: after } = await admin
  .from("grammar_bank_questions")
  .select("id", { count: "exact", head: true });
console.log(`뺀 뒤 은행: ${after}개`);
