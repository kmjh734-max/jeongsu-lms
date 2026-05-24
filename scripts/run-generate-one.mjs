import { readFile } from "fs/promises";

async function loadEnv() {
  const text = await readFile(".env.local", "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function main() {
  await loadEnv();
  const { generateQuestionAudio } = await import("../src/lib/listening/generate-audio.ts");
  const setId = "54d5cc54-cef5-42a2-9480-0885055055af";
  const questionId = "068efafd-d049-4e90-8508-b89df4434cc2";
  try {
    const r = await generateQuestionAudio({
      setId,
      questionId,
      apiKey: process.env.OPENAI_API_KEY,
      speechSpeed: 0.9,
    });
    console.log("SUCCESS", r.audioUrl);
  } catch (e) {
    console.error("ERROR:", e.message);
    if (e.stderr) console.error(e.stderr.toString());
  }
}

main();
