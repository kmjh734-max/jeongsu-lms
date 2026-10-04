// 새로 만든 문항을 넣는다. 같은 학년·단원·세부 항목의 기존 문항에서 나머지 열을 빌려 온다.
//   node scripts/grammar-bank/insert-new.mjs <json> <source_file>
import fs from "node:fs";
import pg from "pg";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const client = new pg.Client({
  host: "aws-1-ap-southeast-1.pooler.supabase.com", port: 5432, database: "postgres",
  user: `postgres.${ref}`, password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false },
});
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const sourceFile = process.argv[3];
await client.connect();
try {
  await client.query("begin");
  const ids = [];
  for (const [i, r] of rows.entries()) {
    const { rows: [tpl] } = await client.query(
      `select * from public.grammar_bank_questions where level_name=$1 and chapter_no=$2 and unit=$3 and excluded_reason is null order by id limit 1`,
      [r.level_name, r.chapter_no, r.unit]);
    if (!tpl) throw new Error(`no template for ${r.level_name} ${r.chapter_no} ${r.unit}`);
    const row = { ...tpl, source_file: sourceFile, number: i + 1, tier: r.tier ?? 3,
      prompt: r.prompt, body: JSON.stringify(r.body), choices: JSON.stringify(r.choices),
      answer: r.answer, explanation: r.explanation ?? null, difficulty: null, badges: "[]",
      point_label: tpl.point_label, excluded_reason: null };
    delete row.id; delete row.created_at;
    const cols = Object.keys(row);
    const res = await client.query(
      `insert into public.grammar_bank_questions (${cols.join(",")}) values (${cols.map((_, k) => `$${k + 1}`).join(",")}) returning id`,
      cols.map((c) => row[c]));
    ids.push(res.rows[0].id);
  }
  await client.query("commit");
  console.log(`넣음 ${ids.length}: ${ids[0]}..${ids.at(-1)}`);
} catch (e) {
  await client.query("rollback"); console.error("되돌림:", e.message); process.exit(1);
} finally { await client.end(); }
