/**
 * 손으로 라벨까지 찍은 그림을 문항에 올린다.
 *
 *   node ... upload-figure.mts <문항 id> <올릴파일.png>
 */
import { readFileSync } from "fs";
import { createAdminClient } from "@/lib/supabase/admin";
import { choiceImageStoragePath, uploadPng } from "@/lib/listening/generate-choice-images";

const [questionId, file] = process.argv.slice(2);
if (!questionId || !file) throw new Error("쓰는 법: node ... upload-figure.mts <문항 id> <파일.png>");

const admin = createAdminClient();
const { data: q, error } = await admin
  .from("listening_questions")
  .select("id, set_id, order_index")
  .eq("id", questionId)
  .single();
if (error || !q) throw new Error(`문항을 못 찾았습니다: ${error?.message ?? questionId}`);

const path = choiceImageStoragePath(q.set_id as string, q.id as string, 0, String(Date.now()));
const url = await uploadPng(admin, path, readFileSync(file));
const { error: upErr } = await admin
  .from("listening_questions")
  .update({ choice_image_urls: [url], needs_image_choices: true })
  .eq("id", q.id);
if (upErr) throw new Error(`저장 실패: ${upErr.message}`);

console.log(`${q.order_index}번 그림 올림:`, url);
