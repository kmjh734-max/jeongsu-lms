/**
 * 여섯 컷을 인쇄용 한 장으로 합친다.
 *
 * 한글 소제목은 우리가 캔버스에 직접 쓴다. 그림 모델에 한글을 시키면 획이 뭉개져서
 * 읽을 수 없는 글자가 나온다(예전 말풍선이 그랬다). 그림 모델에는 글자 없는 그림만 받고,
 * 소제목은 폰트로 얹으니 인쇄에서도 흑백에서도 그대로 읽힌다.
 *
 * 칸 선은 그리지 않는다 — 선생님 요청. 컷 둘레의 흰 여백은 잘라 내고 칸에 꽉 차게 키운다.
 */
import fs from "fs";
import path from "path";

/** 컷 그림 자리 (3:2 가로) */
const PANEL_W = 880;
const PANEL_H = 587;
/** 소제목 줄 높이 */
const TITLE_H = 96;
const GAP_X = 26;
const GAP_Y = 30;
const MARGIN = 26;
/* 2×2 — 예전 4컷 배치로 되돌렸다(선생님 요청 2026-09-17) */
const COLS = 2;

const INK_THRESHOLD = 244;
/** 원본을 너무 키우면 선이 뭉개진다 */
const MAX_UPSCALE = 2.2;

export type SheetPanel = {
  title: string;
  /** 그림 PNG. 이 컷을 못 그렸으면 null */
  bytes: Buffer | null;
};

let fontReady: boolean | null = null;

/** 한글 폰트를 캔버스에 등록한다. 한 번만 하면 된다. */
async function ensureKoreanFont(): Promise<boolean> {
  if (fontReady !== null) return fontReady;
  const { GlobalFonts } = await import("@napi-rs/canvas");
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "public", "fonts", "NotoSansKR-Regular.otf"),
    path.join("/var/task", "public", "fonts", "NotoSansKR-Regular.otf"),
    path.join(cwd, ".next", "server", "public", "fonts", "NotoSansKR-Regular.otf"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file) && GlobalFonts.registerFromPath(file, "LessonKR")) {
        fontReady = true;
        return true;
      }
    } catch {
      // 다음 후보로
    }
  }
  fontReady = false;
  return false;
}

type Rect = { x: number; y: number; w: number; h: number };

/** 컷 수에 맞춘 판 크기 — 3칸씩 줄을 채운다 */
export function sheetSize(panelCount: number): { width: number; height: number; rows: number } {
  const rows = Math.max(1, Math.ceil(panelCount / COLS));
  return {
    width: MARGIN * 2 + PANEL_W * COLS + GAP_X * (COLS - 1),
    height: MARGIN * 2 + (PANEL_H + TITLE_H) * rows + GAP_Y * (rows - 1),
    rows,
  };
}

/** 컷 자리 — 마지막 줄이 덜 찼으면 가운데로 모은다 */
function panelRects(panelCount: number): Rect[] {
  const { rows } = sheetSize(panelCount);
  const rects: Rect[] = [];
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(COLS, panelCount - row * COLS);
    const rowW = PANEL_W * inRow + GAP_X * (inRow - 1);
    const startX = MARGIN + (PANEL_W * COLS + GAP_X * (COLS - 1) - rowW) / 2;
    for (let i = 0; i < inRow; i++) {
      rects.push({
        x: startX + i * (PANEL_W + GAP_X),
        y: MARGIN + row * (PANEL_H + TITLE_H + GAP_Y),
        w: PANEL_W,
        h: PANEL_H,
      });
    }
  }
  return rects;
}

/** 흰 여백을 뺀 실제 그림 자리 */
function inkBounds(
  data: Uint8ClampedArray,
  w: number,
  h: number
): { x: number; y: number; w: number; h: number } | null {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3]! < 16) continue;
      if (data[i]! > INK_THRESHOLD && data[i + 1]! > INK_THRESHOLD && data[i + 2]! > INK_THRESHOLD) {
        continue;
      }
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0 || maxY < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** 소제목을 칸 폭에 맞춰 최대 두 줄로 끊는다 */
function wrapTitle(
  ctx: { measureText: (s: string) => { width: number } },
  text: string,
  maxWidth: number
): string[] {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && ctx.measureText(next).width > maxWidth) {
      lines.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= 2) return lines;
  return [lines[0]!, lines.slice(1).join(" ")];
}

/**
 * 컷들을 3열로 붙이고 컷마다 밑에 한국어 소제목을 적는다.
 * 그림이 없는 컷은 자리를 비우지 않고 아예 빼서, 한 컷이 실패해도 판이 멀쩡하게 나온다.
 */
export async function composeIllustrationSheet(panels: SheetPanel[]): Promise<Buffer> {
  const drawn = panels.filter((p) => p.bytes && p.bytes.length > 0);
  if (drawn.length === 0) throw new Error("삽화를 한 컷도 그리지 못했습니다.");

  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const hasFont = await ensureKoreanFont();
  const { width, height } = sheetSize(drawn.length);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const rects = panelRects(drawn.length);

  for (let i = 0; i < drawn.length; i++) {
    const rect = rects[i]!;
    const panel = drawn[i]!;
    try {
      const img = await loadImage(panel.bytes!);
      const src = createCanvas(img.width, img.height);
      const sctx = src.getContext("2d");
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, img.width, img.height);
      sctx.drawImage(img, 0, 0);
      const region = sctx.getImageData(0, 0, img.width, img.height);
      const ink =
        inkBounds(region.data as unknown as Uint8ClampedArray, img.width, img.height) ?? {
          x: 0,
          y: 0,
          w: img.width,
          h: img.height,
        };
      const scale = Math.min(rect.w / ink.w, rect.h / ink.h, MAX_UPSCALE);
      const dw = ink.w * scale;
      const dh = ink.h * scale;
      ctx.drawImage(
        src,
        ink.x,
        ink.y,
        ink.w,
        ink.h,
        rect.x + (rect.w - dw) / 2,
        rect.y + (rect.h - dh) / 2,
        dw,
        dh
      );
    } catch {
      // 이 컷만 비운다 — 나머지는 그대로 인쇄된다
    }
  }

  // 소제목 — 회색 가로선 위에 진한 글씨(흑백 인쇄에서도 그림과 구분된다)
  const family = hasFont ? "LessonKR" : "sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < drawn.length; i++) {
    const rect = rects[i]!;
    const title = drawn[i]!.title.trim();
    if (!title) continue;
    const bandTop = rect.y + rect.h;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w * 0.06, bandTop + 10);
    ctx.lineTo(rect.x + rect.w * 0.94, bandTop + 10);
    ctx.stroke();

    let size = 46;
    ctx.font = `bold ${size}px "${family}"`;
    let lines = wrapTitle(ctx, title, rect.w * 0.92);
    if (lines.length > 1) {
      size = 38;
      ctx.font = `bold ${size}px "${family}"`;
      lines = wrapTitle(ctx, title, rect.w * 0.92);
    }
    ctx.fillStyle = "#0f172a";
    const lineH = size * 1.28;
    const startY = bandTop + 10 + (TITLE_H - 10 - lines.length * lineH) / 2 + lineH / 2;
    lines.forEach((line, li) => {
      ctx.fillText(line, rect.x + rect.w / 2, startY + li * lineH);
    });
  }

  return canvas.toBuffer("image/png");
}
