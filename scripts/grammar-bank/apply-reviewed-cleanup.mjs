import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const report = JSON.parse(
  fs.readFileSync("tmp-grammar-bank/audit_v2_report.json", "utf8"),
);
const updates = report.updates;
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let cursor = 0;
let changed = 0;
const workers = Array.from({ length: 20 }, async () => {
  while (cursor < updates.length) {
    const index = cursor++;
    const { id, ...patch } = updates[index];
    const { data, error } = await admin
      .from("grammar_bank_questions")
      .update(patch)
      .eq("id", id)
      .select("id");
    if (error) throw new Error(`${id}: ${error.message}`);
    if (data?.length !== 1) throw new Error(`${id}: 수정 대상이 정확히 1개가 아닙니다.`);
    changed += 1;
    if (changed % 250 === 0) process.stdout.write(`\r수정 ${changed}/${updates.length}`);
  }
});

await Promise.all(workers);
console.log(`\n기호·꼬리말 정리 완료: ${changed}문항`);
