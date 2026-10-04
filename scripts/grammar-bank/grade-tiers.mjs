// 문법 은행 난도 매기기 — 규칙으로만 가른다(바깥 서비스 호출 없음).
//
//   node scripts/grammar-bank/grade-tiers.mjs          (매기고 올린다)
//   node scripts/grammar-bank/grade-tiers.mjs --dry    (세어만 본다)
//
// 1단계 기본 · 2단계 실력 · 3단계 고난도
// 교재가 매긴 난도(difficulty)는 건드리지 않는다. 그건 판단 근거로만 쓴다.
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

const dry = process.argv.includes("--dry");

/**
 * 문항을 하나하나 풀어 보고 매긴 난도(2026-10-04 전수 확인). 규칙보다 먼저다.
 * 교재 표시(상·중·하)가 문항 모양과 어긋나는 것(예: 다섯 문장 중 하나 고르기가 「상」)을 바로잡은 것이라,
 * 규칙을 다시 돌려도 이 값이 지워지지 않게 한다.
 */
const OVERRIDES = JSON.parse(fs.readFileSync(new URL("./tier-overrides.json", import.meta.url), "utf8"));

/** 여러 개를 고르게 하거나 개수를 세게 하는 발문 */
const HARD_PROMPT = /(모두 고르|두 개|세 개|개수|두 군데|고난도|알맞지 않은 것을 모두)/;
/** 조건을 달아 쓰게 하는 서술형 */
const HARD_WRITE = /(조건|단, |틀린 부분을 (모두 )?찾아|어색한 부분을 (모두 )?찾아|두 군데)/;
/** 두 곳 중에서 고르는 단순 드릴 */
const TWO_WAY = /\[[^\][]{1,24}\s*\/\s*[^\][]{1,24}\]/;

function markCount(answer) {
  return (String(answer ?? "").match(/[①②③④⑤⑥]/g) ?? []).length;
}

function tierOf(q) {
  if (OVERRIDES[q.id] != null) return OVERRIDES[q.id];
  const badges = q.badges ?? [];
  const kind = q.question_kind ?? "";
  const prompt = String(q.prompt ?? "");
  const body = (q.body ?? []).join(" ");
  const choices = q.choices ?? [];

  // 교재가 매겨 둔 난도가 있으면 그것이 먼저다.
  if (q.difficulty === "상") return 3;
  if (q.difficulty === "중") return 2;
  if (q.difficulty === "하") return 1;

  // 3단계 — 답이 여럿이거나, 개수를 세거나, 조건을 달아 쓰게 하는 것
  if (badges.includes("고난도")) return 3;
  if (HARD_PROMPT.test(prompt)) return 3;
  if (markCount(q.answer) >= 2) return 3;
  if (choices.length === 0 && HARD_WRITE.test(prompt)) return 3;
  // 낱말을 늘어놓아 문장 전체를 만드는 것
  if (kind === "배열 영작" || /배열하/.test(prompt)) return 3;

  // 1단계 — 두 곳 중 고르기, 형태만 바꿔 쓰기, 낱말 수준 보기
  if (TWO_WAY.test(body)) return 1;
  if (choices.length === 0) {
    const answer = String(q.answer ?? "");
    const words = answer.split(/\s+/).filter(Boolean).length;
    const lines = (q.body ?? []).length;
    if (words <= 4 && lines <= 3 && !/우리말|영작|배열/.test(prompt)) return 1;
  }
  if (choices.length > 0 && choices.every((c) => String(c.text ?? "").length <= 24)) {
    return 1;
  }

  // 나머지는 2단계
  return 2;
}

let rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .select("id, difficulty, badges, prompt, body, choices, answer, question_kind")
    .range(from, from + 999);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) break;
  rows = rows.concat(data);
  if (data.length < 1000) break;
}
console.log(`읽은 문항 ${rows.length}개`);

const buckets = { 1: [], 2: [], 3: [] };
for (const row of rows) buckets[tierOf(row)].push(row.id);
for (const tier of [1, 2, 3]) {
  console.log(`  ${tier}단계 ${buckets[tier].length}개`);
}

if (dry) process.exit(0);

for (const tier of [1, 2, 3]) {
  const ids = buckets[tier];
  for (let i = 0; i < ids.length; i += 400) {
    const slice = ids.slice(i, i + 400);
    const { error } = await admin
      .from("grammar_bank_questions")
      .update({ tier })
      .in("id", slice);
    if (error) throw new Error(error.message);
  }
  console.log(`${tier}단계 올림 ${ids.length}개`);
}
