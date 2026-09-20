/**
 * 그림 불일치용 장면 그림 한 장 — 라벨 없이 받아 둔다.
 *
 * 그림 만드는 쪽에 ①②③④⑤를 맡기면 번호가 빠지거나 두 번 찍히는 일이 잦아서(2026-09-21),
 * 여기서는 라벨 없는 장면만 받고 번호는 stamp-labels.py로 직접 찍는다.
 *
 *   node ... make-figure.mts <나갈파일.png> "<장면 설명>"
 */
import { writeFileSync } from "fs";
import { generateImagePngBytes } from "@/lib/listening/generate-choice-images";

export const SCENE_RULES = [
  "Black-and-white line-art illustration for a printed Korean listening worksheet.",
  "Clean even black outlines on a plain white background. Shade only with thin hatching or dots. No colour, no photorealism, no grey wash.",
  "ABSOLUTELY NO writing anywhere in the picture: no letters, no words, no numbers, no brand names, no company logos, no swoosh or tick marks, no trademarks.",
  "Posters, signs, calendars, price tags and timetables are blank: draw the frame and empty ruled boxes only.",
  "Do NOT draw any circled numbers, callout markers or labels of any kind — the numbers are added later.",
  "Wide landscape composition. Every listed object is fully inside the frame, clearly separated from the others, nothing cropped or overlapping.",
  "",
].join(" ");

const out = process.argv[2]!;
const scene = process.argv.slice(3).join(" ");
if (!out || !scene) {
  throw new Error('쓰는 법: node ... make-figure.mts <나갈파일.png> "<장면 설명>"');
}

const bytes = await generateImagePngBytes(SCENE_RULES + scene, { size: "1536x1024" });
writeFileSync(out, bytes);
console.log("만듦:", out, bytes.length, "바이트");
