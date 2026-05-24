import { writeFile, mkdtemp, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile as rf } from "fs/promises";

const exec = promisify(execFile);

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

async function silence(path, sec) {
  const ff = (await import("ffmpeg-static")).default;
  await exec(ff, [
    "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(sec),
    "-c:a", "libmp3lame", "-q:a", "9", "-y", path,
  ]);
}

async function concat(paths, out) {
  const ff = (await import("ffmpeg-static")).default;
  const list = paths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  const listPath = join(out, "..", "list.txt");
  await writeFile(listPath, list);
  await exec(ff, [
    "-f", "concat", "-safe", "0", "-i", listPath,
    "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-q:a", "4", "-y", out,
  ]);
}

async function main() {
  await loadEnv();
  const dir = await mkdtemp(join(tmpdir(), "listen-test-"));
  const a = join(dir, "a.mp3");
  const b = join(dir, "b.mp3");
  const s = join(dir, "s.mp3");
  const out = join(dir, "final.mp3");

  await writeFile(a, await tts("Hello one"));
  await writeFile(b, await tts("Hello two"));
  await silence(s, 0.5);

  try {
    await concat([a, s, b], out);
    const stat = await import("fs/promises").then((fs) => fs.stat(out));
    console.log("concat OK, size:", stat.size);
  } catch (e) {
    console.error("concat FAIL:", e.stderr?.toString() || e.message);
  }

  await rm(dir, { recursive: true, force: true });
}

main();
