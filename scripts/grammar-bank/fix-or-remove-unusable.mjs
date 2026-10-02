import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const report = JSON.parse(fs.readFileSync("tmp-grammar-bank/audit_v2_report.json", "utf8"));
const missingChoices = Object.values(report.mismatches).find((items) => items.length === 72);
if (!missingChoices) throw new Error("보기 유실 검수 목록을 찾지 못했습니다.");

// 12392는 선택형이 아니라 두 개의 서술형 답 앞에 문항 번호가 붙은 정상 문항이다.
const deleteIds = missingChoices.map(({ id }) => id).filter((id) => id !== 12392);
deleteIds.push(44404, 47668, 61644, 61707);

const answerFixes = new Map([
  [34378, "That's"],
  [36481, "Don't"],
  [40624, "isn't"],
  [40639, "doesn't it"],
]);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

for (const [id, answer] of answerFixes) {
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .update({ answer })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`${id}: ${error.message}`);
  if (data?.length !== 1) throw new Error(`${id}: 수정 대상이 정확히 1개가 아닙니다.`);
}

for (let i = 0; i < deleteIds.length; i += 100) {
  const ids = deleteIds.slice(i, i + 100);
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .delete()
    .in("id", ids)
    .select("id");
  if (error) throw new Error(error.message);
  if (data?.length !== ids.length) {
    throw new Error(`삭제 대상 ${ids.length}개 중 ${data?.length ?? 0}개만 확인됐습니다.`);
  }
}

console.log(`정답 교정 ${answerFixes.size}문항 / 복원 불가 문항 제외 ${deleteIds.length}문항`);
