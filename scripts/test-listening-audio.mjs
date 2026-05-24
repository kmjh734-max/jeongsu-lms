import { readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";

async function loadEnv() {
  const text = await readFile(".env.local", "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function main() {
  await loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openai = process.env.OPENAI_API_KEY;
  console.log("supabase url:", url);
  console.log("has service key:", !!key);
  console.log("has openai:", !!openai);

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: bErr } = await admin.storage.listBuckets();
  console.log(
    "buckets:",
    buckets?.map((b) => b.name),
    "err:",
    bErr?.message ?? "none"
  );

  const bucket = "listening-audio";
  const hasBucket = buckets?.some((b) => b.name === bucket);
  if (!hasBucket) {
    console.error("MISSING BUCKET listening-audio — run migration 022 in Supabase SQL");
  }

  const testPath = `listening/test/diag-${Date.now()}.mp3`;

  const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openai}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: "Hello, this is a test.",
      voice: "alloy",
      speed: 0.9,
      response_format: "mp3",
    }),
  });
  console.log("tts status:", ttsRes.status);
  if (!ttsRes.ok) {
    console.log("tts err:", (await ttsRes.text()).slice(0, 300));
    return;
  }
  const buf = Buffer.from(await ttsRes.arrayBuffer());
  console.log("tts bytes:", buf.length);

  const { error: upErr } = await admin.storage.from(bucket).upload(testPath, buf, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  console.log("upload error:", upErr?.message ?? "none");

  const publicUrl = `${url}/storage/v1/object/public/${bucket}/${testPath}`;
  console.log("public url:", publicUrl);

  const head = await fetch(publicUrl, { method: "HEAD" });
  console.log("public HEAD:", head.status, head.headers.get("content-type"));

  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, set_id, audio_url, order_index")
    .order("created_at", { ascending: false })
    .limit(5);
  console.log("recent questions audio_url:", questions);

  const qid = questions?.[0]?.id;
  if (qid) {
    const { data: segs } = await admin
      .from("listening_question_segments")
      .select("id, order_index, speaker_type, text, audio_url")
      .eq("question_id", qid);
    console.log("segments for latest q:", segs?.length, segs);
  }

  await admin.storage.from(bucket).remove([testPath]).catch(() => {});
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
