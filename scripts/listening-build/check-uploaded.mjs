/** 올라간 듣기 세트를 확인한다: node --env-file=.env.local <이 파일> "중1 42회" */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다.");
const db = createClient(url, key, { auth: { persistSession: false } });

const title = process.argv[2];
if (!title) throw new Error('쓰는 법: node --env-file=.env.local lschk.mjs "중1 42회"');

const { data: sets, error: e1 } = await db
  .from("listening_sets")
  .select("id, title")
  .eq("title", title)
  .order("created_at", { ascending: false })
  .limit(1);
if (e1) throw new Error(e1.message);
if (!sets?.length) {
  console.log(`${title} — 세트를 찾지 못했습니다.`);
  process.exit(1);
}

const setId = sets[0].id;
const { data: qs, error: e2 } = await db
  .from("listening_questions")
  .select("id, audio_url, choice_image_urls")
  .eq("set_id", setId);
if (e2) throw new Error(e2.message);

const total = qs?.length ?? 0;
const audio = (qs ?? []).filter((q) => (q.audio_url ?? "").length > 0).length;
const figures = (qs ?? []).filter((q) => (q.choice_image_urls ?? []).length > 0).length;
console.log(`${title} — 문항 ${total} · 음성 ${audio} · 그림 ${figures}`);
