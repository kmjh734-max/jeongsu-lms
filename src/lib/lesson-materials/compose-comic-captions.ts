import fs from "fs";
import path from "path";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

let fontFamily: string | null = null;

function candidateFontPaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "assets", "fonts", "NotoSansKR-Regular.otf"),
    path.join(cwd, "public", "fonts", "NotoSansKR-Regular.otf"),
    // Vercel / Next traced bundle layouts
    path.join(cwd, ".next", "server", "assets", "fonts", "NotoSansKR-Regular.otf"),
    path.join("/var/task", "assets", "fonts", "NotoSansKR-Regular.otf"),
  ];
}

function ensureKoreanFont(): string {
  if (fontFamily && GlobalFonts.has(fontFamily)) return fontFamily;

  const tried: string[] = [];
  for (const fontPath of candidateFontPaths()) {
    tried.push(fontPath);
    if (!fs.existsSync(fontPath)) continue;
    const family = "NotoSansKR";
    const ok = GlobalFonts.registerFromPath(fontPath, family);
    if (ok || GlobalFonts.has(family)) {
      fontFamily = family;
      return family;
    }
  }

  throw new Error(
    `한글 폰트를 불러오지 못했습니다. 확인 경로: ${tried.join(" | ")}`
  );
}

function wrapText(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  text: string,
  maxWidth: number
): string[] {
  const chars = [...text.trim()];
  if (chars.length === 0) return [];
  const lines: string[] = [];
  let cur = "";
  for (const ch of chars) {
    const trial = cur + ch;
    if (ctx.measureText(trial).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = trial;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function drawSpeechBubble(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  opts: {
    cx: number;
    cy: number;
    text: string;
    maxWidth: number;
    fontFamily: string;
  }
) {
  const { cx, cy, text, maxWidth, fontFamily } = opts;
  if (!text.trim()) return;

  const fontSize = Math.max(18, Math.round(opts.maxWidth / 18));
  // Regular OTF only — avoid synthetic bold weight that may drop glyphs.
  ctx.font = `${fontSize}px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(ctx, text, maxWidth - 28);
  if (lines.length === 0) return;

  // Sanity: Hangul must measure > 0 when font loaded
  const sampleW = ctx.measureText(lines.join("")).width;
  if (sampleW < 1) {
    throw new Error("한글 글자 폭이 0입니다. 폰트 로드를 확인하세요.");
  }

  const lineHeight = fontSize * 1.35;
  const padX = 16;
  const padY = 12;
  const contentW = Math.min(
    maxWidth,
    Math.max(...lines.map((l) => ctx.measureText(l).width)) + padX * 2
  );
  const contentH = lines.length * lineHeight + padY * 2;
  const x = cx - contentW / 2;
  const y = cy - contentH / 2;
  const r = 16;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + contentW, y, x + contentW, y + contentH, r);
  ctx.arcTo(x + contentW, y + contentH, x, y + contentH, r);
  ctx.arcTo(x, y + contentH, x, y, r);
  ctx.arcTo(x, y, x + contentW, y, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  const tailX = cx;
  const tailY = y + contentH;
  ctx.beginPath();
  ctx.moveTo(tailX - 10, tailY - 2);
  ctx.lineTo(tailX, tailY + 16);
  ctx.lineTo(tailX + 12, tailY - 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillRect(tailX - 9, tailY - 4, 20, 6);

  ctx.fillStyle = "#0f172a";
  lines.forEach((line, i) => {
    const ty = y + padY + lineHeight * (i + 0.5);
    ctx.fillText(line, cx, ty);
  });
}

const FALLBACK_CAPTIONS = [
  "이게 정말 맞을까?",
  "잠깐, 문제가 보이네",
  "다시 생각해 보자",
  "이제 이해가 됐어!",
];

/** Burn Korean speech-bubble captions into a 2x2 comic PNG. */
export async function composeComicCaptionsOnImage(
  pngBytes: Buffer,
  captions: string[]
): Promise<Buffer> {
  const family = ensureKoreanFont();

  const img = await loadImage(pngBytes);
  const w = img.width || 1024;
  const h = img.height || 1024;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const caps = [0, 1, 2, 3].map((i) => {
    const raw = String(captions[i] ?? "").trim();
    return raw || FALLBACK_CAPTIONS[i]!;
  });

  const panelW = w / 2;
  const panelH = h / 2;
  const positions = [
    { cx: panelW * 0.5, cy: panelH * 0.18 },
    { cx: panelW * 1.5, cy: panelH * 0.18 },
    { cx: panelW * 0.5, cy: panelH * 1.18 },
    { cx: panelW * 1.5, cy: panelH * 1.18 },
  ];

  positions.forEach((pos, i) => {
    drawSpeechBubble(ctx, {
      cx: pos.cx,
      cy: pos.cy,
      text: caps[i] ?? "",
      maxWidth: panelW * 0.82,
      fontFamily: family,
    });
  });

  return canvas.toBuffer("image/png");
}
