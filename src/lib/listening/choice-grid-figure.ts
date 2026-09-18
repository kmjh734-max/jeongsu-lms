/**
 * 그림 선택지 문항(구입할 물건·묘사·날씨 등)의 선택지 그림을 한 장으로 합친다.
 *
 * 예전에는 선택지마다 1장씩 5장을 그려서 문항 하나에 그림값이 다섯 배로 들었다.
 * 실제 시·도교육청 문제지도 ①~⑤가 한 그림판 안에 나란히 인쇄되므로,
 * 5칸짜리 그림 한 장이 학생·선생님이 보는 결과와 같다.
 *
 * 칸 배치는 위 3칸 · 아래 2칸(가운데 정렬)이라 빈 칸이 남지 않는다.
 * 그림 모델에는 3×2로 그리게 하고(칸 자리를 가장 잘 지킨다) 아래 줄을 캔버스에서
 * 반 칸만큼 옮겨 붙인다 — 자리 이동이라 그림이 잘리지 않는다.
 * 그린 뒤 비전 검수로 칸마다 설명대로 그려졌는지, 특히 정답 칸이 정답 설명과 맞는지 본다.
 */
import {
  buildVerifyBody,
  flattenPngOnWhite,
  generateImagePngBytes,
} from "@/lib/listening/generate-choice-images";
import { BW_FIGURE_RULES } from "@/lib/listening/print-bw";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

export type ChoiceGridCheck = {
  ok: boolean;
  problems: string[];
  /** 칸마다 실제로 그려진 것 */
  panels: Array<{ label: string; count: number; drawn: string; matchesPlan: boolean }>;
  /** 정답 칸이 정답 설명과 맞는지 */
  answerOk: boolean;
  note: string;
};

/** 그림 모델이 그리는 원본 칸 배치 (3×2, 오른쪽 아래는 비움) */
export const SOURCE_COLS = 3;
export const SOURCE_ROWS = 2;
/** 인쇄용 최종 배치 — 위 3칸 · 아래 2칸(가운데), 칸은 정사각형 */
export const GRID_TOP_CELLS = 3;
export const GRID_BOTTOM_CELLS = 2;
/** 칸 안에서 그림이 차지하는 비율 — 남는 흰 여백을 잘라 내고 이만큼 키워 인쇄에서 크게 보이게 */
const CELL_FILL = 0.82;
/** 원본을 너무 크게 늘리면 선이 뭉개진다 */
const MAX_UPSCALE = 3;

type GridRect = { x: number; y: number; w: number; h: number };

/** 최종 판 크기 — 칸이 정사각형이라 3:2 (가로로 넓어 인쇄 폭을 꽉 쓴다) */
export function gridSheetSize(sourceWidth: number): { width: number; height: number } {
  const cell = Math.round(sourceWidth / SOURCE_COLS);
  return { width: cell * SOURCE_COLS, height: cell * SOURCE_ROWS };
}

/** 최종 칸 자리 — 위 3칸은 그대로, 아래 2칸은 반 칸만큼 오른쪽으로 옮겨 가운데 정렬 */
export function gridCellRects(width: number, height: number): GridRect[] {
  const cw = width / SOURCE_COLS;
  const ch = height / SOURCE_ROWS;
  const shift = cw / 2;
  const rects: GridRect[] = [];
  for (let i = 0; i < GRID_TOP_CELLS; i++) {
    rects.push({ x: i * cw, y: 0, w: cw, h: ch });
  }
  for (let i = 0; i < GRID_BOTTOM_CELLS; i++) {
    rects.push({ x: shift + i * cw, y: ch, w: cw, h: ch });
  }
  return rects;
}

/** 칸 안에서 흰 여백을 뺀 실제 그림 자리 (없으면 null) */
/**
 * 잉크 줄 수를 보고 본 그림이 있는 구간만 고른다.
 * 그림 모델이 칸 경계를 넘겨 그리면 옆 칸 그림의 끄트머리가 이 칸에 함께 잡혀,
 * 그 조각까지 넣어 키우는 바람에 본 그림이 칸 밖으로 밀려 잘려 보였다.
 * 빈 줄(gap 이상)로 끊긴 덩어리 중 잉크가 가장 많은 덩어리만 남긴다.
 */
function mainInkRange(counts: number[], gap: number): { start: number; end: number } | null {
  const bands: Array<{ start: number; end: number; ink: number }> = [];
  let cur: { start: number; end: number; ink: number } | null = null;
  let blank = 0;
  for (let i = 0; i < counts.length; i++) {
    const c = counts[i]!;
    if (c > 0) {
      if (!cur) cur = { start: i, end: i, ink: 0 };
      cur.end = i;
      cur.ink += c;
      blank = 0;
    } else if (cur) {
      blank += 1;
      if (blank >= gap) {
        bands.push(cur);
        cur = null;
      }
    }
  }
  if (cur) bands.push(cur);
  if (bands.length === 0) return null;
  const best = bands.reduce((a, b) => (b.ink > a.ink ? b : a));

  /*
   * 한 그림이 띠로 끊겨 있을 수 있다(스티커 위쪽 'LUNCH' 띠처럼). 가장 큰 덩어리만 남기면
   * 그 띠가 잘려 ④⑤의 글자가 사라졌다. 가까이 붙어 있고 잉크가 어느 정도 있는 덩어리는
   * 같은 그림으로 보고 함께 남기되, 멀리 떨어진 옆 칸 끄트머리는 그대로 버린다.
   */
  const near = Math.max(4, Math.round(counts.length * 0.16));
  const minInk = best.ink * 0.04;
  let start = best.start;
  let end = best.end;
  let grew = true;
  while (grew) {
    grew = false;
    for (const band of bands) {
      if (band.ink < minInk) continue;
      if (band.end < start && start - band.end <= near) {
        start = band.start;
        grew = true;
      } else if (band.start > end && band.start - end <= near) {
        end = band.end;
        grew = true;
      }
    }
  }
  return { start, end };
}

function inkBounds(
  data: Uint8ClampedArray,
  regionW: number,
  regionH: number
): GridRect | null {
  const isInk = (x: number, y: number): boolean => {
    const i = (y * regionW + x) * 4;
    if (data[i + 3]! < 24) return false;
    // 흰색에 가까우면 여백으로 본다
    return !(data[i]! > 242 && data[i + 1]! > 242 && data[i + 2]! > 242);
  };

  const rows = new Array<number>(regionH).fill(0);
  for (let y = 0; y < regionH; y++) {
    for (let x = 0; x < regionW; x++) if (isInk(x, y)) rows[y]! += 1;
  }
  // 가로로 끊긴 덩어리는 나누지 않는다 (사과와 우유갑처럼 한 칸에 물건 두 개가 떨어져 있을 수 있다)
  const yRange = mainInkRange(rows, Math.max(3, Math.round(regionH * 0.04)));
  if (!yRange) return null;

  let minX = regionW;
  let maxX = -1;
  for (let y = yRange.start; y <= yRange.end; y++) {
    for (let x = 0; x < regionW; x++) {
      if (!isInk(x, y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: yRange.start, w: maxX - minX + 1, h: yRange.end - yRange.start + 1 };
}

/**
 * 선택지 5개 → 한 장 프롬프트.
 * 번호(①~⑤)는 그림 모델에게 맡기지 않는다 — medium 품질에서는 번호가 아예 그려지지 않았다.
 * 모델은 칸 안의 그림만 그리고, 칸 선과 번호는 우리가 캔버스로 정확한 자리에 얹는다.
 */
export function buildChoiceGridPrompt(prompts: string[], extraNote?: string): string {
  const list = prompts
    .slice(0, 5)
    .map((p, i) => `Cell ${i + 1} — ${String(p ?? "").trim()}`)
    .join("\n");
  return `Korean middle-school English listening exam picture-choice sheet.

ONE square image on a plain pure-white background.
Imagine the square split into a 3 x 2 grid of six equal areas (each one third wide, one half tall):
area 1 = top-left, area 2 = top-middle, area 3 = top-right, area 4 = bottom-left, area 5 = bottom-middle,
area 6 = bottom-right and stays completely empty white.

Draw one picture centred in each of areas 1-5, filling about two thirds of its area with a clear white margin all around it:
${list}

Rules:
- Draw NO grid, NO frame, NO border, NO dividing line and NO box of any kind. The six areas are imaginary and separated only by white space.
- Draw NO numbers, NO circled digits, NO empty circles, NO badges, NO tags and NO captions anywhere. The number is printed on top of the sheet afterwards, so keep the TOP-LEFT CORNER of every area clear white and empty. The only letters allowed are words explicitly requested above (spell those correctly, in the cell that asks for them and nowhere else).
- Black-and-white textbook illustration, clean thick black outlines, no photorealism, no 3D, no shadows, no gradients, no watermark.
${BW_FIGURE_RULES}
- Each picture is ONE clear object or scene, drawn well inside its own area with white space around it — it must never cross into, touch or overlap a neighbouring area.
- The detail that tells the cells apart (pattern, printed word, shape, count) is drawn LARGE and THICK inside that picture — few, big details rather than many small ones — so it stays readable when the sheet is printed small.
- EVERY detail written for a cell must be visible in that cell: the stated shape, pattern, count and printed word. A cell whose description lists two details (for example "stars AND the word HOME") must show BOTH of them.
- A detail that is NOT written for a cell must not appear there. The cells differ only by the details listed above, and every difference must stay obvious when printed small.
${extraNote ? "\n" + extraNote : ""}
VERIFY: five pictures placed top-left / top-middle / top-right / bottom-left / bottom-middle, bottom-right empty, no lines, no numbers, no stray circles, each area's top-left corner clear.`.slice(0, 3800);
}

/**
 * 원본(3×2)을 인쇄용 판으로 다시 짠다.
 * 칸마다 흰 여백을 잘라 내고 정사각형 칸에 꽉 차게 키운 뒤 번호(①~⑤)만 얹는다.
 * 칸 선은 그리지 않는다 — 선생님 요청(그림만 있으면 되고, 선 때문에 ④⑤가 잘려 보였다).
 * 빈 여섯째 칸이 없어지고 그림이 크게 인쇄돼 별·글자 같은 정답 단서가 종이에서도 보인다.
 */
export async function overlayGridLabels(bytes: Buffer): Promise<Buffer> {
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const img = await loadImage(bytes);
  const srcW = img.width;
  const srcH = img.height;

  // 원본을 한 번 캔버스에 올려 칸마다 잉크 자리를 잰다
  const srcCanvas = createCanvas(srcW, srcH);
  const srcCtx = srcCanvas.getContext("2d");
  srcCtx.fillStyle = "#ffffff";
  srcCtx.fillRect(0, 0, srcW, srcH);
  srcCtx.drawImage(img, 0, 0);

  const srcCellW = srcW / SOURCE_COLS;
  const srcCellH = srcH / SOURCE_ROWS;

  const { width, height } = gridSheetSize(srcW);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const rects = gridCellRects(width, height);

  for (let i = 0; i < rects.length; i++) {
    const target = rects[i]!;
    const sx = Math.round((i % SOURCE_COLS) * srcCellW);
    const sy = Math.round(Math.floor(i / SOURCE_COLS) * srcCellH);
    const sw = Math.round(srcCellW);
    const sh = Math.round(srcCellH);
    const region = srcCtx.getImageData(sx, sy, sw, sh);
    const ink = inkBounds(region.data as unknown as Uint8ClampedArray, sw, sh);
    if (!ink) continue;
    const scale = Math.min(
      (target.w * CELL_FILL) / ink.w,
      (target.h * CELL_FILL) / ink.h,
      MAX_UPSCALE
    );
    const dw = ink.w * scale;
    const dh = ink.h * scale;
    ctx.drawImage(
      srcCanvas,
      sx + ink.x,
      sy + ink.y,
      ink.w,
      ink.h,
      target.x + (target.w - dw) / 2,
      target.y + (target.h - dh) / 2,
      dw,
      dh
    );
  }

  // 동그라미 숫자 — 글꼴에 ①이 없을 수 있어 원 + 숫자를 직접 그린다
  const r = Math.max(14, Math.round((width / SOURCE_COLS) * 0.085));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(r * 1.25)}px sans-serif`;
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]!;
    const cx = rect.x + r * 1.2;
    const cy = rect.y + r * 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = Math.max(2, Math.round(r / 8));
    ctx.stroke();
    ctx.fillStyle = "#111111";
    ctx.fillText(String(i + 1), cx, cy + r * 0.05);
  }

  return canvas.toBuffer("image/png");
}

/** 그림판 검수 (칸 수 · 칸별 내용 · 정답 칸) */
export async function verifyChoiceGrid(
  png: Buffer,
  prompts: string[],
  answerIndex?: number
): Promise<ChoiceGridCheck> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      problems: ["OPENAI_API_KEY 없음 — 검수 불가"],
      panels: [],
      answerOk: false,
      note: "",
    };
  }
  const models = [
    process.env.OPENAI_MODEL_LISTENING_IMAGE_PLAN?.trim(),
    "gpt-5.5",
    "gpt-4.1",
    "gpt-4o",
  ].filter(Boolean) as string[];

  const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
  const plan = prompts
    .slice(0, 5)
    .map((p, i) => `${CIRCLED[i]}: ${String(p ?? "").trim()}`)
    .join("\n");
  const answerNo =
    answerIndex && answerIndex >= 1 && answerIndex <= 5 ? answerIndex : null;
  const answerPlan = answerNo ? String(prompts[answerNo - 1] ?? "").trim() : "";
  const systemPrompt = [
    "You strictly check a Korean listening-exam picture-choice sheet.",
    "The sheet has five boxed cells: cells 1, 2, 3 fill the top row (left, middle, right) and cells 4, 5 sit side by side, centred, in the bottom row.",
    "Each cell carries a small circled number 1-5 at its top-left, printed on the sheet afterwards.",
    "A cell also containing a second circle, badge or blank bubble that belongs to no object is a fault: set matches_plan=false and say so in `missing`.",
    "Read the image literally (exact objects, shapes, patterns, counts, printed words, positions).",
    'JSON only: {"panels":[{"label":"1","count":1,"drawn":"what is actually drawn in this cell","matches_plan":true,"missing":"which required detail is missing or wrong, else empty"}, ...for cells 1,2,3,4,5],"panelCount":5,"panelsDistinct":true,"cleanBackground":true,"misspelledWords":[],"answerCellMatches":true,"note":"..."}.',
    "count = 1 when this cell contains one picture, 0 when the cell is empty, 2+ when it holds several unrelated pictures.",
    "matches_plan = true ONLY when EVERY detail of that cell's description (shape, pattern, count, printed word) is visible in that cell and no detail belonging to another cell appears there; otherwise false with `missing` filled in.",
    "panelsDistinct = false when two cells look the same. cleanBackground = false if the background is not plain white (dark vignette, glow, blur).",
    "answerCellMatches answers the ANSWER CELL question when one is given, else true.",
  ].join(" ");
  let lastErr = "verify failed";

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          buildVerifyBody(model, [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Intended panels:\n${plan}\n${
                    answerNo
                      ? `\nANSWER CELL: cell ${answerNo} is the keyed answer and must show exactly "${answerPlan}" — every detail of it. Set answerCellMatches=false if any part of it is missing or wrong.`
                      : ""
                  }\n\nCheck each cell: is the circled number there exactly once, and does the drawing show every detail of its description?`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ])
        ),
      });
      const text = await res.text();
      if (!res.ok) {
        lastErr = `vision ${model} HTTP ${res.status}: ${text.slice(0, 200)}`;
        continue;
      }
      const json = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
      const parsed = JSON.parse(String(json.choices?.[0]?.message?.content ?? "{}")) as {
        panels?: Array<{
          label?: string;
          count?: number;
          drawn?: string;
          matches_plan?: boolean;
          missing?: string;
        }>;
        panelCount?: number;
        panelsDistinct?: boolean;
        cleanBackground?: boolean;
        misspelledWords?: string[];
        answerCellMatches?: boolean;
        note?: string;
      };
      const panels = CIRCLED.map((label, idx) => {
        const num = String(idx + 1);
        const hit = (parsed.panels ?? []).find((x) => {
          const l = String(x.label ?? "").trim();
          return l === num || l === label;
        });
        return {
          label,
          count: Number(hit?.count ?? 0),
          drawn: String(hit?.drawn ?? ""),
          // 판정이 빠진 칸은 통과로 보지 않는다 (예전에는 !== false라 누락이 통과됐다)
          matchesPlan: hit?.matches_plan === true,
          missing: String(hit?.missing ?? ""),
        };
      });
      const problems: string[] = [];
      for (const p of panels) {
        if (p.count === 0) problems.push(`${p.label} 칸이 비어 있음`);
        else if (p.count > 1) problems.push(`${p.label} 칸에 그림이 ${p.count}개`);
        else if (!p.matchesPlan) {
          problems.push(
            `${p.label} 칸이 설명과 다름${p.missing ? ` (${p.missing})` : ""}`
          );
        }
      }
      if (Number(parsed.panelCount ?? 5) !== 5) problems.push(`칸이 ${parsed.panelCount}개`);
      if (parsed.panelsDistinct === false) problems.push("칸끼리 구분이 안 됨");
      if (parsed.cleanBackground === false) problems.push("배경이 깨끗하지 않음");
      const misspelled = (parsed.misspelledWords ?? []).map(String).filter((w) => w.trim());
      if (misspelled.length) problems.push(`철자 오류: ${misspelled.join(", ")}`);
      const answerOk = answerNo ? parsed.answerCellMatches !== false : true;
      if (!answerOk) {
        problems.push(`정답 칸(${CIRCLED[answerNo! - 1]})이 정답 설명과 다름`);
      }
      return {
        ok: problems.length === 0,
        problems,
        panels: panels.map(({ label, count, drawn, matchesPlan }) => ({
          label,
          count,
          drawn,
          matchesPlan,
        })),
        answerOk,
        note: String(parsed.note ?? ""),
      };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return {
    ok: false,
    problems: [`검수 실패: ${lastErr}`],
    panels: [],
    answerOk: false,
    note: lastErr,
  };
}

/** 그림판을 그리고 검수한다 (저장하지 않음). 통과한 그림이 없으면 bytes = null */
export async function drawCheckedChoiceGrid(opts: {
  prompts: string[];
  /** 정답 번호(1~5) — 정답 칸은 정답 설명과 반드시 맞아야 통과 */
  answerIndex?: number;
  maxRetries?: number;
  onAttempt?: (info: { attempt: number; check: ChoiceGridCheck; bytes: Buffer }) => void;
}): Promise<{ bytes: Buffer | null; check: ChoiceGridCheck | null; attempts: number }> {
  const prompts = (opts.prompts ?? []).map((p) => String(p ?? "").trim()).filter(Boolean);
  if (prompts.length !== 5) {
    throw new Error("그림 선택지 5개가 있어야 한 장으로 합칠 수 있습니다.");
  }
  let prompt = buildChoiceGridPrompt(prompts);
  let last: ChoiceGridCheck | null = null;
  const max = opts.maxRetries ?? 2;
  for (let attempt = 0; attempt <= max; attempt++) {
    const drawn = await flattenPngOnWhite(await generateImagePngBytes(prompt));
    const bytes = await overlayGridLabels(drawn);
    const check = await verifyChoiceGrid(bytes, prompts, opts.answerIndex);
    last = check;
    opts.onAttempt?.({ attempt: attempt + 1, check, bytes });
    if (check.ok) return { bytes, check, attempts: attempt + 1 };
    prompt = buildChoiceGridPrompt(
      prompts,
      `PREVIOUS DRAWING FAILED QA — ${check.problems.join(", ")}. ${check.note}
Fix exactly those problems: a 3 x 2 grid, one picture centred in each of cells 1-5, bottom-right area empty,
and every cell showing EVERY detail written for it (shape, pattern, count, printed word).`
    );
  }
  return { bytes: null, check: last, attempts: max + 1 };
}
