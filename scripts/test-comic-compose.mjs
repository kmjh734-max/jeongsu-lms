/**
 * Offline + optional live test for Korean speech-bubble burn-in.
 * Usage: node scripts/test-comic-compose.mjs
 * Live image: node scripts/test-comic-compose.mjs --live
 */
import fs from "fs";
import path from "path";
import { createCanvas } from "@napi-rs/canvas";
import { composeComicCaptionsOnImage } from "../src/lib/lesson-materials/compose-comic-captions.ts";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

async function makeBlankComic() {
  const c = createCanvas(1024, 1024);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#bfdbfe";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = "#fff";
  ctx.fillRect(10, 10, 492, 492);
  ctx.fillRect(522, 10, 492, 492);
  ctx.fillRect(10, 522, 492, 492);
  ctx.fillRect(522, 522, 492, 492);
  return c.toBuffer("image/png");
}

async function maybeGenerateLivePng() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const prompt = `Create ONE educational 2x2 four-panel manhwa illustration.
CRITICAL: Do NOT draw any letters, Hangul, English, numbers, logos, signs, or speech bubbles.
Leave upper area of each panel clear. Bright clean colorful educational manhwa.
Story: students realize that summing parts does not equal the whole system.`;
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`image gen HTTP ${res.status}: ${text.slice(0, 300)}`);
  const json = JSON.parse(text);
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("no b64_json in response");
  return Buffer.from(b64, "base64");
}

async function main() {
  loadEnvLocal();
  fs.mkdirSync("tmp", { recursive: true });
  const live = process.argv.includes("--live");
  const captions = [
    "부분만으로 충분해?",
    "아니, 합이 전체가 아니야",
    "숨은 상호작용을 봐야 해",
    "이제 전체를 이해했어!",
  ];

  const base = live ? await maybeGenerateLivePng() : await makeBlankComic();
  const out = await composeComicCaptionsOnImage(base, captions);
  const outPath = live
    ? "tmp/comic-live-with-bubbles.png"
    : "tmp/comic-compose-test.png";
  fs.writeFileSync(outPath, out);
  console.log("OK", outPath, out.length, "bytes", live ? "(live)" : "(blank)");
}

main().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
