import { writeFile, mkdtemp, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { readFile as rf } from "fs/promises";

function id3v2Size(buf) {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "ID3") return 0;
  const size =
    ((buf[6] & 0x7f) << 21) |
    ((buf[7] & 0x7f) << 14) |
    ((buf[8] & 0x7f) << 7) |
    (buf[9] & 0x7f);
  return 10 + size;
}

function firstMpegFrameOffset(buf) {
  const afterId3 = id3v2Size(buf);
  for (let i = afterId3; i < buf.length - 1; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) return i;
  }
  return afterId3;
}

function concatMp3Buffers(buffers) {
  const parts = [];
  for (let i = 0; i < buffers.length; i++) {
    const raw = buffers[i];
    parts.push(i === 0 ? raw : raw.subarray(firstMpegFrameOffset(raw)));
  }
  return Buffer.concat(parts);
}

async function loadEnv() {
  const text = await rf(".env.local", "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function tts(text) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: "alloy",
      response_format: "mp3",
    }),
  });
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await loadEnv();
  const dir = await mkdtemp(join(tmpdir(), "listen-test-"));
  const a = await tts("Hello one");
  const b = await tts("Hello two");
  const out = join(dir, "final.mp3");

  const merged = concatMp3Buffers([a, b]);
  await writeFile(out, merged);
  console.log("concat OK, size:", merged.length);
  await rm(dir, { recursive: true, force: true });
}

main();
