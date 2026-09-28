// 교재가 매긴 난도를 원본 파일에서 되돌린다(난도 매기기와 별개로 두기 위해).
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const want = new Map(); // `${source_file}\u0000${number}` → 난도(또는 null)
for (const v of JSON.parse(fs.readFileSync("tmp-grammar-bank/variants.json", "utf8"))) {
  want.set(`${v.origin_file}\u0000${v.origin_number}`, v.difficulty ?? null);
}
for (const f of fs.readdirSync("scripts/grammar-bank/cheonilmun").filter((x) => x.endsWith(".json"))) {
  const doc = JSON.parse(fs.readFileSync(`scripts/grammar-bank/cheonilmun/${f}`, "utf8"));
  for (const q of doc.questions ?? []) {
    const file = `[${doc.book}] Ch${String(doc.chapter_no).padStart(2, "0")} ${q.kind}${q.round ?? ""}`;
    want.set(`${file}\u0000${q.number}`, q.difficulty ?? null);
  }
}

let rows = [];
for (let from = 0; ; from += 1000) {
  const { data } = await admin.from("grammar_bank_questions").select("id, source_file, number, difficulty").range(from, from + 999);
  if (!data || data.length === 0) break;
  rows = rows.concat(data);
  if (data.length < 1000) break;
}

const buckets = new Map();
for (const r of rows) {
  const target = want.get(`${r.source_file}\u0000${r.number}`) ?? null;
  if (target === r.difficulty) continue;
  if (!buckets.has(target)) buckets.set(target, []);
  buckets.get(target).push(r.id);
}
for (const [target, ids] of buckets) {
  for (let i = 0; i < ids.length; i += 400) {
    const { error } = await admin.from("grammar_bank_questions").update({ difficulty: target }).in("id", ids.slice(i, i + 400));
    if (error) throw new Error(error.message);
  }
  console.log(`난도 ${target ?? "(없음)"} 로 되돌림 ${ids.length}개`);
}
