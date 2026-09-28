// 들여온 교재(천일문 중등 GRAMMAR)의 변형문항 적재
//
// 은행은 한 서고다. 교재를 가르지 않고 JSON의 target(레벨·단원) 자리에 합쳐 넣는다.
//
//   node scripts/grammar-bank/cheonilmun/load.mjs            (이 폴더의 모든 장)
//   node scripts/grammar-bank/cheonilmun/load.mjs 1권-ch01.json
//
// 파일을 읽어 그대로 넣기만 한다. 바깥 서비스는 부르지 않는다.
import fs from "node:fs";
import path from "node:path";
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

const dir = "scripts/grammar-bank/cheonilmun";
const only = process.argv[2];
const files = only
  ? [only]
  : fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

for (const file of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));

  const points = (doc.points ?? []).map((p) => ({
    book: doc.book,
    chapter_no: doc.chapter_no,
    chapter: doc.chapter,
    unit_no: p.unit_no ?? null,
    unit: p.unit ?? null,
    point_no: p.point_no,
    point: p.point,
    frequent: p.frequent === true,
  }));
  if (points.length > 0) {
    const { error } = await admin
      .from("grammar_bank_points")
      .upsert(points, { onConflict: "book,chapter_no,point_no" });
    if (error) throw new Error(`${file} 개념: ${error.message}`);
  }

  const unitOf = new Map(
    (doc.points ?? []).map((p) => [p.point_no, { unit_no: p.unit_no, unit: p.unit }]),
  );

  const rows = (doc.questions ?? []).map((q) => {
    const first = (q.point_nos ?? [])[0];
    const unit = q.unit_no != null ? { unit_no: q.unit_no, unit: null } : unitOf.get(first);
    return {
      source_file: `[${doc.book}] Ch${String(doc.chapter_no).padStart(2, "0")} ${q.kind}${q.round ?? ""}`,
      number: q.number,
      level: doc.target.level,
      level_name: doc.target.level_name,
      chapter_no: doc.target.chapter_no,
      chapter: doc.target.chapter,
      kind: q.kind,
      round: q.round ?? q.unit_no ?? null,
      unit_no: unit?.unit_no ?? null,
      unit:
        q.unit_no != null
          ? (doc.points ?? []).find((p) => p.unit_no === q.unit_no)?.unit ?? null
          : unit?.unit ?? null,
      point_nos: q.point_nos ?? [],
      point_label: q.point_label ?? null,
      question_kind: q.question_kind ?? null,
      difficulty: q.difficulty ?? null,
      badges: q.badges ?? [],
      prompt: q.prompt ?? "",
      body: q.body ?? [],
      choices: q.choices ?? [],
      answer: q.answer ?? null,
      explanation: null,
    };
  });

  const { error } = await admin
    .from("grammar_bank_questions")
    .upsert(rows, { onConflict: "source_file,number" });
  if (error) throw new Error(`${file} 문항: ${error.message}`);
  console.log(`${file} — 개념 ${points.length}개, 문항 ${rows.length}개`);
}

const { count } = await admin
  .from("grammar_bank_questions")
  .select("id", { count: "exact", head: true });
console.log(`은행 문항 합계: ${count}개`);
