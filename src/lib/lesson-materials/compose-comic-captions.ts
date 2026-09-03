import fs from "fs";
import path from "path";
import sharp from "sharp";

const FALLBACK_CAPTIONS = [
  "이게 정말 맞을까?",
  "잠깐, 문제가 보이네",
  "다시 생각해 보자",
  "이제 이해가 됐어!",
];

function candidateFontPaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "public", "fonts", "NotoSansKR-Regular.otf"),
    path.join(cwd, "assets", "fonts", "NotoSansKR-Regular.otf"),
    path.join(cwd, ".next", "server", "chunks", "public", "fonts", "NotoSansKR-Regular.otf"),
    path.join("/var/task", "public", "fonts", "NotoSansKR-Regular.otf"),
    path.join("/var/task", "assets", "fonts", "NotoSansKR-Regular.otf"),
  ];
}

function loadKoreanFontBase64(): string {
  const tried: string[] = [];
  for (const fontPath of candidateFontPaths()) {
    tried.push(fontPath);
    if (!fs.existsSync(fontPath)) continue;
    return fs.readFileSync(fontPath).toString("base64");
  }
  throw new Error(
    `한글 폰트 파일을 찾지 못했습니다: ${tried.join(" | ")}`
  );
}

function wrapByChars(text: string, maxChars: number): string[] {
  const chars = [...text.trim()];
  if (chars.length === 0) return [];
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += maxChars) {
    lines.push(chars.slice(i, i + maxChars).join(""));
  }
  return lines.slice(0, 3);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBubbleSvg(opts: {
  width: number;
  height: number;
  captions: string[];
  fontBase64: string;
}): string {
  const { width, height, captions, fontBase64 } = opts;
  const panelW = width / 2;
  const panelH = height / 2;
  const positions = [
    { cx: panelW * 0.5, cy: panelH * 0.2 },
    { cx: panelW * 1.5, cy: panelH * 0.2 },
    { cx: panelW * 0.5, cy: panelH * 1.2 },
    { cx: panelW * 1.5, cy: panelH * 1.2 },
  ];

  const fontSize = Math.max(20, Math.round(panelW / 16));
  const lineHeight = fontSize * 1.35;
  const maxChars = Math.max(8, Math.floor(panelW / (fontSize * 0.95)));

  const bubbles = positions
    .map((pos, i) => {
      const text = captions[i] ?? "";
      if (!text.trim()) return "";
      const lines = wrapByChars(text, maxChars);
      const padX = 18;
      const padY = 14;
      const approxCharW = fontSize * 0.95;
      const contentW = Math.min(
        panelW * 0.86,
        Math.max(...lines.map((l) => [...l].length * approxCharW)) + padX * 2
      );
      const contentH = lines.length * lineHeight + padY * 2;
      const x = pos.cx - contentW / 2;
      const y = pos.cy - contentH / 2;
      const r = 16;
      const tailX = pos.cx;
      const tailY = y + contentH;

      const textNodes = lines
        .map((line, li) => {
          const ty = y + padY + lineHeight * (li + 0.72);
          return `<text x="${pos.cx}" y="${ty}" text-anchor="middle" font-family="NotoSansKR" font-size="${fontSize}" fill="#0f172a">${escapeXml(line)}</text>`;
        })
        .join("\n");

      return `
      <g>
        <rect x="${x}" y="${y}" width="${contentW}" height="${contentH}" rx="${r}" ry="${r}" fill="rgba(255,255,255,0.97)" stroke="#334155" stroke-width="3"/>
        <polygon points="${tailX - 10},${tailY - 1} ${tailX},${tailY + 16} ${tailX + 12},${tailY - 1}" fill="rgba(255,255,255,0.97)" stroke="#334155" stroke-width="3"/>
        <rect x="${tailX - 9}" y="${tailY - 5}" width="20" height="8" fill="rgba(255,255,255,0.97)"/>
        ${textNodes}
      </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>
      @font-face {
        font-family: "NotoSansKR";
        src: url("data:font/otf;base64,${fontBase64}");
      }
    </style>
  </defs>
  ${bubbles}
</svg>`;
}

/**
 * Burn Korean speech-bubble captions into a 2x2 comic PNG using sharp + SVG.
 * Avoids @napi-rs/canvas native/font issues on Vercel.
 */
export async function composeComicCaptionsOnImage(
  pngBytes: Buffer,
  captions: string[]
): Promise<Buffer> {
  const fontBase64 = loadKoreanFontBase64();
  const meta = await sharp(pngBytes).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;

  const caps = [0, 1, 2, 3].map((i) => {
    const raw = String(captions[i] ?? "").trim();
    return raw || FALLBACK_CAPTIONS[i]!;
  });

  const svg = buildBubbleSvg({
    width,
    height,
    captions: caps,
    fontBase64,
  });

  const overlay = await sharp(Buffer.from(svg)).png().toBuffer();
  return sharp(pngBytes)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}
