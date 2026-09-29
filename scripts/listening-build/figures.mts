/**
 * 세트에 적어 둔 그림 계획대로 그림을 만들고, 번호를 찍고, 문항에 올린다.
 *
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/listening-build/figures.mts scripts/listening-build/sets/중1-32회.ts [--다시]
 *
 * grid5·figure5 는 번호 ①~⑤를 직접 찍는다(그림 쪽에 맡기면 번호가 빠지거나 겹친다).
 * scene 은 한 장짜리 상황 그림이라 번호를 찍지 않는다.
 * 이미 올라간 그림이 있으면 건너뛴다. --다시 를 붙이면 다시 만든다.
 */
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { pathToFileURL } from "url";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateImagePngBytes, choiceImageStoragePath, uploadPng } from "@/lib/listening/generate-choice-images";
import type { SetSpec } from "./spec.ts";

/** make-figure.mts 와 같은 규칙 (그쪽은 실행 파일이라 가져오지 않고 여기에 둔다) */
const SCENE_RULES = [
  "Black-and-white line-art illustration for a printed Korean listening worksheet.",
  "Clean even black outlines on a plain white background. Shade only with thin hatching or dots. No colour, no photorealism, no grey wash.",
  "ABSOLUTELY NO writing anywhere in the picture: no letters, no words, no numbers, no brand names, no company logos, no swoosh or tick marks, no trademarks.",
  "Posters, signs, calendars, price tags and timetables are blank: draw the frame and empty ruled boxes only.",
  "Do NOT draw any circled numbers, callout markers or labels of any kind — the numbers are added later.",
  "Wide landscape composition. Every listed object is fully inside the frame, clearly separated from the others, nothing cropped or overlapping.",
  "",
].join(" ");

const specPath = process.argv[2];
if (!specPath) throw new Error("쓰는 법: node ... figures.mts <세트 파일> [--다시]");
const redo = process.argv.includes("--다시");

const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
const spec = mod.spec;

const outDir = join("scripts", "listening-build", "figs");
mkdirSync(outDir, { recursive: true });
const tag = spec.title.replace(/\s+/g, "");

const admin = createAdminClient();
const { data: set } = await admin
  .from("listening_sets")
  .select("id")
  .eq("title", spec.title)
  .single();
if (!set) throw new Error(`세트를 먼저 올려 주세요: ${spec.title}`);

const { data: rows } = await admin
  .from("listening_questions")
  .select("id, order_index, choice_image_urls")
  .eq("set_id", set.id)
  .order("order_index");
const byOrder = new Map((rows ?? []).map((r) => [r.order_index as number, r]));

/** 다섯 칸 그림의 번호 자리 — 가로로 나란히 놓인 물건 아래 */
const GRID5_SPOTS: Array<[number, number]> = [
  [0.13, 0.71],
  [0.32, 0.71],
  [0.51, 0.71],
  [0.7, 0.71],
  [0.89, 0.71],
];

for (const q of spec.questions) {
  const fig = q.figure;
  if (!fig) continue;
  const row = byOrder.get(q.order);
  if (!row) {
    console.log(`${q.order}번: 문항을 못 찾음 — 건너뜀`);
    continue;
  }
  const already = (row.choice_image_urls as string[] | null)?.length;
  if (already && !redo) {
    console.log(`${q.order}번: 이미 올라가 있음 — 건너뜀`);
    continue;
  }

  const raw = join(outDir, `${tag}-q${q.order}.png`);
  if (!existsSync(raw) || redo) {
    const bytes = await generateImagePngBytes(SCENE_RULES + fig.scene, { size: "1536x1024" });
    writeFileSync(raw, bytes);
    console.log(`${q.order}번: 그림 만듦 (${bytes.length}바이트)`);
  } else {
    console.log(`${q.order}번: 있는 그림 씀`);
  }

  let toUpload = raw;
  const needsLabels = fig.kind === "grid5" || fig.kind === "figure5";
  if (needsLabels) {
    const spots = (fig.spots as Array<[number, number]> | undefined) ?? GRID5_SPOTS;
    const stamped = join(outDir, `${tag}-q${q.order}-라벨.png`);
    execFileSync("python", [
      join("scripts", "listening-build", "stamp-labels.py"),
      raw,
      stamped,
      ...spots.map(([x, y]) => `${x},${y}`),
    ]);
    toUpload = stamped;
    console.log(`${q.order}번: 번호 ①~⑤ 찍음`);
  }

  const path = choiceImageStoragePath(set.id as string, row.id as string, 0, String(Date.now()));
  const url = await uploadPng(admin, path, readFileSync(toUpload));
  const { error } = await admin
    .from("listening_questions")
    .update({ choice_image_urls: [url], needs_image_choices: true })
    .eq("id", row.id);
  if (error) throw new Error(`${q.order}번 저장 실패: ${error.message}`);
  console.log(`${q.order}번: 올림`);
}

console.log("그림 끝:", spec.title);
