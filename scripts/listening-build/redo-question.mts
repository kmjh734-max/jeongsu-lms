/**
 * 한 문항의 대본·해설을 세트 파일 내용으로 다시 맞추고 음성을 새로 만든다.
 *
 *   node ... redo-question.mts <세트 파일> <문항 번호>
 */
import { pathToFileURL } from "url";
import { resolve } from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuestionAudio } from "@/lib/listening/generate-audio";
import type { SetSpec } from "./spec.ts";
import { scriptTextOf } from "./spec.ts";

const [specPath, orderArg] = process.argv.slice(2);
if (!specPath || !orderArg) throw new Error("쓰는 법: node ... redo-question.mts <세트 파일> <문항 번호>");
const order = Number(orderArg);

const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
const spec = mod.spec;
const q = spec.questions.find((x) => x.order === order);
if (!q) throw new Error(`${order}번이 없습니다.`);

const admin = createAdminClient();
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: set } = await admin
  .from("listening_sets")
  .select("id")
  .eq("academy_id", prof!.academy_id)
  .eq("title", spec.title)
  .single();
if (!set) throw new Error("세트를 못 찾았습니다.");

const { data: row } = await admin
  .from("listening_questions")
  .select("id")
  .eq("set_id", set.id)
  .eq("order_index", order)
  .single();
if (!row) throw new Error("문항을 못 찾았습니다.");

await admin
  .from("listening_questions")
  .update({
    script_text: scriptTextOf(q),
    script_translation: q.translation,
    choices: q.choices,
    correct_answer: q.answer,
    answer_clue: q.clue,
    explanation: q.explanation,
    audio_url: null,
  })
  .eq("id", row.id);

await admin.from("listening_question_segments").delete().eq("question_id", row.id);
await admin.from("listening_question_segments").insert(
  q.lines.map(([speaker, text], i) => ({
    question_id: row.id,
    order_index: i,
    speaker_type: speaker,
    text,
  })),
);

const res = await generateQuestionAudio({ setId: set.id as string, questionId: row.id as string });
console.log(`${order}번 다시 만듦:`, res.ok === false ? `실패 ${res.error ?? ""}` : "음성 새로 만듦");
