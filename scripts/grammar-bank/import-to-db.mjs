// 문법 은행 적재: tmp-grammar-bank/variants.json → grammar_bank_questions
//
// 은행에는 변형문제만 담는다(변형문제가 곧 우리 문항이다). 원본은 넣지 않는다.
//
//   node scripts/grammar-bank/import-to-db.mjs
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

const variants = JSON.parse(fs.readFileSync("tmp-grammar-bank/variants.json", "utf8"));

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

function fromVariant(v) {
  return {
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
  };
}

const rows = variants.map(fromVariant);
console.log(`넣을 줄 ${rows.length}개`);

const SIZE = 500;
for (let i = 0; i < rows.length; i += SIZE) {
  const slice = rows.slice(i, i + SIZE);
  const { error } = await admin
    .from("grammar_bank_questions")
    .upsert(slice, { onConflict: "source_file,number" });
  if (error) {
    console.error(`${i}번째 묶음에서 멈춤:`, error.message);
    process.exit(1);
  }
  process.stdout.write(`\r올린 줄 ${Math.min(i + SIZE, rows.length)} / ${rows.length}`);
}
process.stdout.write("\n");

const { count } = await admin
  .from("grammar_bank_questions")
  .select("id", { count: "exact", head: true });
console.log(`표에 담긴 줄: ${count}개`);
