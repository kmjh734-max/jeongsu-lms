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
/** 영역 표시가 없는 문항(PDF 최다빈출·최상위·최다오답) — 예상문제 1·2회와 같은 기준으로 발문에서 가른다 */
function guessArea(q) {
  const t = q.stem.replace(/<\/?u>/g, "");
  const lead = q.group?.lead ?? "";
  if (lead.includes("대화") || /대화|의사소통|표현/.test(t)) return "의사소통";
  if (q.group || /^(윗글|위 글|위의 글)/.test(t) || /글|요약|단락|제목|주제|요지|본문/.test(t)) return "본문";
  if (/영영풀이|단어|의미|뜻|철자|낱말/.test(t) && !/어법/.test(t)) return "단어";
  if (/어법|문법|문장|영작|배열|바꿔 쓰|바꾸어 쓰|고쳐 쓰/.test(t)) return "어법";
  return "단어";
}

const read = (name) => (fs.existsSync(path.join(here, name)) ? JSON.parse(fs.readFileSync(path.join(here, name), "utf8")) : []);
const all = [...read("questions.json"), ...read("questions-pdf.json")]
  .filter((q) => q.publisher === only)
  .map((q) => ({
    ...q,
    area: q.area || guessArea(q),
    // 「최다빈출 1」·「최다빈출 02」 → 두 자리로
    src: q.src.replace(/^(최다빈출|최상위|최다오답) (\d+)$/, (_m, k, n) => `${k} ${String(Number(n)).padStart(2, "0")}`),
  }));

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
