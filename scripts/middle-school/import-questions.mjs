/**
 * 중학교 문제 은행: parse-questions.py 의 questions.json → ms_questions (정수학원)
 *
 *   node --env-file=.env.local scripts/middle-school/import-questions.mjs [동아(윤)] [--적용]
 *
 * 과·출처마다 지우고 다시 넣는다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--적용");
const only = args.find((a) => !a.startsWith("--")) ?? "동아(윤)";
const PUBLISHER = { "동아(윤)": "동아(윤정미)", "동아(이)": "동아(이병민)" };

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: academy } = await sb.from("academies").select("id").eq("slug", "jeongsu").single();
const all = JSON.parse(fs.readFileSync(path.join(here, "questions.json"), "utf8")).filter((q) => q.publisher === only);

const byUnit = new Map();
for (const q of all) {
  const k = `${q.grade}|${q.lesson}`;
  if (!byUnit.has(k)) byUnit.set(k, []);
  byUnit.get(k).push(q);
}

for (const [k, qs] of byUnit) {
  const [grade, lesson] = k.split("|");
  const { data: unit } = await sb
    .from("ms_units")
    .select("id")
    .eq("academy_id", academy.id)
    .eq("grade", grade)
    .eq("publisher", PUBLISHER[only] ?? only)
    .eq("lesson_no", Number(lesson.replace("과", "")))
    .single();
  const rows = qs.map((q) => ({
    unit_id: unit.id,
    source: q.src,
    no: q.no,
    area: q.area ?? "",
    kind: q.kind,
    stem: q.stem,
    group_lead: q.group?.lead ?? null,
    group_lines: q.group?.lines ?? null,
    body: q.body,
    choices: q.choices,
    answer: q.answer ?? "",
    explanation: q.explanation ?? "",
    point: q.point ?? "",
    needs_image: !!q.needsImage,
    review: q.review ?? "",
  }));
  const sources = [...new Set(rows.map((r) => r.source))];
  console.log(`${grade} ${lesson} · ${rows.length}문항 (${sources.join(", ")}) · 검수 필요 ${rows.filter((r) => r.review).length}`);
  if (!apply) continue;
  await sb.from("ms_questions").delete().eq("unit_id", unit.id).in("source", sources);
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await sb.from("ms_questions").insert(rows.slice(i, i + 200));
    if (error) throw error;
  }
}
console.log(apply ? "넣음" : "(미리 보기 — --적용 으로 넣는다)");
