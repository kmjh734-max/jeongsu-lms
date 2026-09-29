// 새 교재의 변형문항을 문법 은행에 넣는다 (정수학원만)
//
// 은행에는 변형문제만 담는다(변형문제가 곧 우리 문항이다). 원본은 넣지 않는다.
// (source_file, number) 가 같은 줄은 덮어쓴다.
//
//   node scripts/grammar-bank/import_new_books.mjs [--적용]
//
// 바깥 서비스는 부르지 않는다. 파일을 읽어 그대로 넣기만 한다.
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

const SRC = "tmp-grammar-bank/new-variants.json";
if (!fs.existsSync(SRC)) {
  console.log(`${SRC} 가 없습니다.`);
  process.exit(1);
}
const variants = JSON.parse(fs.readFileSync(SRC, "utf8"));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

const rows = variants.map((v) => ({
  source_file: v.origin_file,
  number: num(v.origin_number),
  level: num(v.level),
  level_name: v.level_name ?? "",
  chapter_no: num(v.chapter_no) ?? 0,
  chapter: v.chapter ?? "",
  kind: v.kind ?? null,
  round: num(v.round),
  question_kind: v.question_kind ?? null,
  difficulty: v.difficulty ?? null,
  badges: v.badges ?? [],
  prompt: v.prompt ?? "",
  body: v.body ?? [],
  choices: v.choices ?? [],
  answer: v.answer ?? null,
  explanation: v.explanation ?? null,
}));

const books = new Map();
for (const r of rows) books.set(r.source_file, (books.get(r.source_file) ?? 0) + 1);
console.log(`넣을 줄 ${rows.length}개`);
for (const [b, n] of [...books].sort()) console.log(`   ${b}: ${n}개`);

const { count: before } = await admin
  .from("grammar_bank_questions")
  .select("id", { count: "exact", head: true });
console.log(`지금 은행: ${before}개`);

const SIZE = 500;
for (let i = 0; i < rows.length; i += SIZE) {
  const slice = rows.slice(i, i + SIZE);
  const { error } = await admin
    .from("grammar_bank_questions")
    .upsert(slice, { onConflict: "source_file,number" });
  if (error) {
    console.error(`${i}번째 묶음에서 멈춤: ${error.message}`);
    process.exit(1);
  }
}
// 전에 넣었다가 이번 파일에는 없는 줄을 지운다.
// 문항이 늘거나 줄면 번호가 밀려서, 그냥 덮어쓰기만 하면 헌 줄이 남는다.
// 헌 줄은 가리키는 원본이 달라져 있어 출처가 어긋난다.
for (const book of books.keys()) {
  const keep = new Set(rows.filter((r) => r.source_file === book).map((r) => r.number));
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .select("id, number")
    .eq("source_file", book);
  if (error) {
    console.error(`${book} 살펴보다 멈춤: ${error.message}`);
    process.exit(1);
  }
  const stale = (data ?? []).filter((r) => !keep.has(r.number)).map((r) => r.id);
  if (stale.length === 0) continue;
  const { error: gone } = await admin
    .from("grammar_bank_questions")
    .delete()
    .in("id", stale);
  if (gone) {
    console.error(`${book} 헌 줄 지우다 멈춤: ${gone.message}`);
    process.exit(1);
  }
  console.log(`   ${book}: 헌 줄 ${stale.length}개 지움`);
}

const { count: after } = await admin
  .from("grammar_bank_questions")
  .select("id", { count: "exact", head: true });
console.log(`넣은 뒤 은행: ${after}개 (${after - before}개 늘어남)`);
