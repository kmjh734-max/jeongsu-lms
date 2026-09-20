/**
 * 적어 둔 세트를 DB에 올린다.
 *
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/listening-build/build-set.mts scripts/listening-build/sets/고1-11회.ts [--음성]
 *
 * --음성 을 붙이면 Edge 목소리로 음성까지 만든다(값 0원). 그림은 따로 만들어 upload-figure.mts로 올린다.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { pathToFileURL } from "url";
import { resolve } from "path";
import type { SetSpec } from "./spec.ts";
import { scriptTextOf } from "./spec.ts";

const specPath = process.argv[2];
if (!specPath) throw new Error("쓰는 법: node ... build-set.mts <세트 파일> [--음성]");
const withAudio = process.argv.includes("--음성");

const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
const spec = mod.spec;
if (!spec?.questions?.length) throw new Error("문항이 없습니다.");

const admin = createAdminClient();
const { data: prof } = await admin
  .from("profiles")
  .select("id, academy_id")
  .eq("username", "js83719392")
  .single();
if (!prof) throw new Error("선생님 계정을 못 찾았습니다.");

// 폴더
let folderId: string | null = null;
if (spec.folder) {
  const { data: found } = await admin
    .from("listening_folders")
    .select("id")
    .eq("academy_id", prof.academy_id)
    .eq("name", spec.folder)
    .maybeSingle();
  if (found) folderId = found.id as string;
  else {
    const { data: made, error } = await admin
      .from("listening_folders")
      .insert({ academy_id: prof.academy_id, name: spec.folder, created_by: prof.id })
      .select("id")
      .single();
    if (error) throw new Error(`폴더를 만들지 못했습니다: ${error.message}`);
    folderId = made.id as string;
    console.log(`폴더 만듦: ${spec.folder}`);
  }
}

// 세트 — 같은 이름이 있으면 그 세트를 비우고 다시 채운다
const { data: existing } = await admin
  .from("listening_sets")
  .select("id")
  .eq("academy_id", prof.academy_id)
  .eq("title", spec.title)
  .maybeSingle();

let setId: string;
if (existing) {
  setId = existing.id as string;
  await admin.from("listening_questions").delete().eq("set_id", setId);
  await admin
    .from("listening_sets")
    .update({ grade_level: spec.gradeLevel, speech_speed: spec.speechSpeed, folder_id: folderId })
    .eq("id", setId);
  console.log(`이미 있는 세트를 비우고 다시 채웁니다: ${spec.title}`);
} else {
  const { data: made, error } = await admin
    .from("listening_sets")
    .insert({
      academy_id: prof.academy_id,
      title: spec.title,
      grade_level: spec.gradeLevel,
      speech_speed: spec.speechSpeed,
      folder_id: folderId,
      created_by: prof.id,
      teacher_id: prof.id,
      is_published: false,
    })
    .select("id")
    .single();
  if (error || !made) throw new Error(`세트를 만들지 못했습니다: ${error?.message}`);
  setId = made.id as string;
  console.log(`세트 만듦: ${spec.title}`);
}

// 문항
for (const q of [...spec.questions].sort((a, b) => a.order - b.order)) {
  const { data: row, error } = await admin
    .from("listening_questions")
    .insert({
      set_id: setId,
      order_index: q.order,
      question_type: q.type,
      instruction: q.instruction,
      question_text: q.questionText ?? "",
      script_text: scriptTextOf(q),
      script_translation: q.translation,
      choices: q.choices,
      correct_answer: q.answer,
      answer_clue: q.clue,
      explanation: q.explanation,
      table_data: q.table ?? null,
      visual_choice_type: q.figure ? (q.figure.kind === "plain" ? "scene" : "picture_mismatch") : "none",
      needs_image_choices: !!q.figure,
      needs_review: false,
      quality_score: 100,
    })
    .select("id")
    .single();
  if (error || !row) throw new Error(`${q.order}번 저장 실패: ${error?.message}`);

  const segs = q.lines.map(([speaker, text], i) => ({
    question_id: row.id,
    order_index: i,
    speaker_type: speaker,
    text,
  }));
  const { error: segErr } = await admin.from("listening_question_segments").insert(segs);
  if (segErr) throw new Error(`${q.order}번 대본 저장 실패: ${segErr.message}`);
}
console.log(`문항 ${spec.questions.length}개 저장`);

if (withAudio) {
  const t = Date.now();
  const res = await generateSetQuestionAudio({ setId });
  const ok = res.filter((r) => r.ok !== false).length;
  console.log(`음성 ${ok}/${res.length}개 · ${Math.round((Date.now() - t) / 1000)}초`);
}

console.log(`끝. 세트 id = ${setId}`);
