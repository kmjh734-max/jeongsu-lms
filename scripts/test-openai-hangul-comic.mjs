import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

async function main() {
  loadEnvLocal();
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("no key");

  const captions = [
    "부분만으로 충분해?",
    "합이 전체가 아니야",
    "상호작용을 봐야 해",
    "이제 이해했어!",
  ];

  const prompt = `Educational 2x2 four-panel manhwa comic, bright flat colors, clean line art.
Layout: panel1 top-left, panel2 top-right, panel3 bottom-left, panel4 bottom-right with clear borders.
Same two student characters in every panel.

CRITICAL — each panel MUST contain a white speech bubble with CLEAR, readable Korean Hangul text.
Use EXACTLY these quoted strings (do not invent English):
Panel1 bubble: "${captions[0]}"
Panel2 bubble: "${captions[1]}"
Panel3 bubble: "${captions[2]}"
Panel4 bubble: "${captions[3]}"

Story: students realize parts alone do not make the whole.`;

  fs.mkdirSync("tmp", { recursive: true });

  for (const model of ["gpt-image-2", "gpt-image-1.5", "gpt-image-1"]) {
    const body = {
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    };
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(model, res.status, text.slice(0, 220).replace(/\s+/g, " "));
    if (!res.ok) continue;
    const json = JSON.parse(text);
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) continue;
    const out = path.join("tmp", `comic-openai-hangul-${model}.png`);
    fs.writeFileSync(out, Buffer.from(b64, "base64"));
    console.log("wrote", out);
    break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
