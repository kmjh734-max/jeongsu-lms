// 검수 결과(JSON 배열 [{id, ...열}])를 Postgres 에 한 번에 적는다. 바깥 모델은 부르지 않는다.
//   node scripts/grammar-bank/bulk-update.mjs tmp-grammar-bank/xxx.json
// 열은 prompt, body, choices, answer, explanation, excluded_reason 만 받는다.
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
const ALLOWED = ["prompt", "body", "choices", "answer", "explanation", "excluded_reason"];
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
await client.connect();
let n = 0;
try {
  await client.query("begin");
  for (const r of rows) {
    const sets = [], vals = [];
    for (const k of ALLOWED) {
      if (!(k in r)) continue;
      vals.push(k === "body" || k === "choices" ? JSON.stringify(r[k]) : r[k]);
      sets.push(`${k} = $${vals.length}${k === "body" || k === "choices" ? "::jsonb" : ""}`);
    }
    if (!sets.length) continue;
    vals.push(r.id);
    await client.query(`update public.grammar_bank_questions set ${sets.join(", ")} where id = $${vals.length}`, vals);
    n++;
    if (n % 1000 === 0) process.stdout.write(`\r ${n}/${rows.length}`);
  }
  await client.query("commit");
  console.log(`\n적음 ${n}`);
} catch (e) {
  await client.query("rollback"); console.error("\n되돌림:", e.message); process.exit(1);
} finally { await client.end(); }
