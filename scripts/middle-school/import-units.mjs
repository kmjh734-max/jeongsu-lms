/**
 * 중학교 수업자료: parse-units.py 가 만든 units.json → ms_units · ms_texts (정수학원)
 *
 *   node --env-file=.env.local scripts/middle-school/import-units.mjs [동아(윤)] [--적용]
 *
 * --적용 없이 돌리면 넣을 것만 센다. 과마다 글(ms_texts)은 지우고 다시 넣는다.
 * 선생님 결정(2026-10-29): 우선 중1·중2 동아(윤)만.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--적용");
const only = args.find((a) => !a.startsWith("--")) ?? "동아(윤)";

/** 폴더 이름 → 교재 표기 */
const PUBLISHER = { "동아(윤)": "동아(윤정미)", "동아(이)": "동아(이병민)" };

const units = JSON.parse(fs.readFileSync(path.join(here, "units.json"), "utf8")).filter(
  (u) => u.publisher === only && /^\d+과$/.test(u.lesson),
);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: academy } = await sb.from("academies").select("id").eq("slug", "jeongsu").single();

function textRows(unitId, u) {
  const rows = [];
  u.dialogues.forEach((g, i) => {
    rows.push({
      unit_id: unitId,
      kind: "대화문",
      part: g.part,
      order_index: i,
      title: g.section || null,
      lines: g.turns.map((t) => ({ speaker: t.speaker, en: t.en, ko: t.ko ?? "" })),
      english_text: g.turns.map((t) => `${t.speaker}: ${t.en}`).join("\n"),
      korean_text: g.turns.map((t) => `${t.speaker}: ${t.ko ?? ""}`).join("\n"),
    });
  });
  u.passages.forEach((p, i) => {
    const lines = p.sentences.map((s) => ({ en: s.en, ko: s.ko ?? "", speaker: s.speaker ?? "" }));
    rows.push({
      unit_id: unitId,
      kind: "본문",
      part: p.part,
      order_index: 100 + i,
      title: p.title || null,
      lines,
      english_text: lines.map((s) => s.en).join(" "),
      korean_text: lines.map((s) => s.ko).join(" "),
    });
  });
  return rows;
}

let nText = 0;
for (const u of units) {
  const lessonNo = Number(u.lesson.replace("과", ""));
  const publisher = PUBLISHER[u.publisher] ?? u.publisher;
  const unitRow = {
    academy_id: academy.id,
    grade: u.grade,
    publisher,
    lesson_no: lessonNo,
    title: u.passages[0]?.passageTitle?.en ? u.title : u.title,
    words: u.words,
    grammar: u.grammar,
    updated_at: new Date().toISOString(),
  };
  const texts = textRows("x", u);
  nText += texts.length;
  console.log(`${u.grade} ${publisher} ${lessonNo}과 「${u.title}」 단어 ${u.words.length} · 문법 ${u.grammar.length} · 대화문 ${u.dialogues.length} · 본문 ${u.passages.length}`);
  if (!apply) continue;

  const { data: saved, error } = await sb
    .from("ms_units")
    .upsert(unitRow, { onConflict: "academy_id,grade,publisher,lesson_no" })
    .select("id")
    .single();
  if (error) throw error;
  await sb.from("ms_texts").delete().eq("unit_id", saved.id);
  const { error: e2 } = await sb.from("ms_texts").insert(textRows(saved.id, u));
  if (e2) throw e2;
}
console.log(`${units.length}과 · 글 ${nText}개 ${apply ? "넣음" : "(미리 보기 — --적용 으로 넣는다)"}`);
