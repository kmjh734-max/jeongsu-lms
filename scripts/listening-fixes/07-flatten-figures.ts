/**
 * 새로 그린 고1 그림 불일치 그림 마무리 (무료 — 그림을 새로 부르지 않는다).
 *   - 투명 배경(RGBA)으로 받은 그림을 흰 바탕에 합친다: 어두운 화면·인쇄에서 번진 것처럼 보였다.
 *   - 그림 속 글자 오타를 덮어 고친다: 14회 "Lemonode" → "Lemonade", 9회 "7.00 p.m." → "7:00 p.m."
 *     (정답 라벨이 아닌 곳의 오타라 학생이 불일치로 오해하지 않게)
 * 원본(정수학원)만 고친다. 사본 복사는 05-regen-figures.ts --propagate --apply 로 한다.
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/07-flatten-figures.ts [--out=폴더]   (미리보기 PNG만 저장)
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/07-flatten-figures.ts --apply
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { APPLY, admin, findTemplate, loadAll, updateQuestion, writeBackup } from "./lib";
import {
  LISTENING_IMAGES_BUCKET,
  choiceImageStoragePath,
  publicChoiceImageUrl,
} from "../../src/lib/listening/generate-choice-images";

type TextPatch = {
  rect: [number, number, number, number];
  fill: string;
  text: string;
  font: string;
  color: string;
  stroke?: { color: string; width: number };
};

const ROUNDS = [1, 6, 7, 9, 11, 14, 18];

const PATCHES: Record<number, TextPatch[]> = {
  14: [
    {
      rect: [93, 693, 253, 728],
      fill: "rgb(251,170,23)",
      text: "Lemonade",
      font: 'bold 30px "Comic Sans MS", Arial, sans-serif',
      color: "#ffffff",
      stroke: { color: "rgb(214,120,10)", width: 3 },
    },
  ],
  9: [
    {
      rect: [590, 816, 857, 882],
      fill: "rgb(255,224,116)",
      text: "Starts at 7:00 p.m.",
      font: 'bold 34px Arial, sans-serif',
      color: "#111111",
    },
  ],
};

function argValue(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
}
const OUT_DIR = resolve(argValue("out") ?? resolve(process.cwd(), "scripts", "listening-fixes", "backups", "figures"));

async function finish(bytes: Buffer, patches: TextPatch[]): Promise<Buffer> {
  const img = await loadImage(bytes);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, img.width, img.height);
  ctx.drawImage(img, 0, 0);
  for (const p of patches) {
    const [x0, y0, x1, y1] = p.rect;
    ctx.fillStyle = p.fill;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    // 칸 안에 들어가도록 글자 크기를 줄인다
    let font = p.font;
    ctx.font = font;
    const maxWidth = x1 - x0 - 16;
    for (let size = Number(font.match(/(\d+)px/)?.[1] ?? 30); size > 10; size--) {
      font = p.font.replace(/\d+px/, `${size}px`);
      ctx.font = font;
      if (ctx.measureText(p.text).width <= maxWidth) break;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2 + 1;
    if (p.stroke) {
      ctx.lineWidth = p.stroke.width;
      ctx.strokeStyle = p.stroke.color;
      ctx.strokeText(p.text, cx, cy);
    }
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, cx, cy);
  }
  return canvas.toBuffer("image/png");
}

async function main() {
  const d = await loadAll({ gradeLevels: ["high1"] });
  mkdirSync(OUT_DIR, { recursive: true });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  for (const round of ROUNDS) {
    const q = findTemplate(d, `고1 듣기 ${round}회`, 4);
    if (!q) continue;
    const url = (q.choice_image_urls as string[] | undefined)?.[0] ?? "";
    if (!/choice-1-\d+\.png/.test(url)) {
      console.log(`${round}회: 새 그림이 아니라 건너뜀`);
      continue;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${round}회 그림 받기 실패 HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const hasAlpha = bytes[25] === 6 || bytes[25] === 4;
    const patches = PATCHES[round] ?? [];
    if (!hasAlpha && patches.length === 0) {
      console.log(`${round}회: 흰 배경·오타 없음 — 그대로`);
      continue;
    }
    const out = await finish(bytes, patches);
    const preview = resolve(OUT_DIR, `fig${round}-final.png`);
    writeFileSync(preview, out);
    console.log(`${round}회: ${hasAlpha ? "투명 배경 → 흰 배경" : ""}${patches.length ? ` · 글자 수정 ${patches.map((p) => p.text).join(", ")}` : ""}  (미리보기 ${preview})`);
    if (!APPLY) continue;
    console.log(`  백업: ${writeBackup(`07-flatten-figure-${round}`, d, [q])}`);
    const path = choiceImageStoragePath(q.set_id, q.id, 0, String(Date.now()));
    const { error } = await admin.storage
      .from(LISTENING_IMAGES_BUCKET)
      .upload(path, out, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`upload ${round}회: ${error.message}`);
    const newUrl = `${publicChoiceImageUrl(supabaseUrl, path)}?v=${Date.now()}`;
    await updateQuestion(q.id, { choice_image_urls: [newUrl] });
    console.log(`  저장: ${newUrl}`);
  }
  if (!APPLY) console.log("\n(미리보기만 했습니다. 저장하려면 --apply)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
