"use client";

/**
 * 화면의 A4 쪽들을 그대로 찍어 PDF 파일로 내려받는다(선생님 말씀 2026-10-05: 인쇄 말고도
 * 문제지·정답지를 바로 저장할 수 있게). 인쇄 창 없이 파일이 받아진다.
 *
 * 쪽마다 그림으로 담는다 — 화면에 보이는 모양(글꼴·밑줄·표) 그대로 나오지만, PDF 안의 글자를
 * 고르거나 찾을 수는 없다. 쪽 요소는 실제 A4 크기(210mm 폭)로 그려져 있어야 한다.
 * 미리보기 확대·축소(조상 transform)는 쪽 요소 자체의 크기에 영향을 주지 않는다.
 */
export async function downloadSheetsPdf(
  pages: HTMLElement[],
  fileName: string,
  opts: { onProgress?: (done: number, total: number) => void; pixelRatio?: number } = {}
): Promise<void> {
  if (pages.length === 0) throw new Error("저장할 쪽이 없습니다.");
  const [{ toJpeg, getFontEmbedCSS }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;

  // 글꼴은 한 번만 읽어 모든 쪽에 쓴다(쪽마다 다시 받으면 느리다)
  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = (await usedFontEmbedCSS()) || (await getFontEmbedCSS(pages[0]!));
  } catch {
    fontEmbedCSS = undefined;
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const pageW = 210;
  const pageH = 297;
  for (let i = 0; i < pages.length; i++) {
    const el = pages[i]!;
    const url = await toJpeg(el, {
      quality: 0.92,
      pixelRatio: opts.pixelRatio ?? 2,
      backgroundColor: "#ffffff",
      cacheBust: false,
      fontEmbedCSS,
      // 미리보기 그림자는 종이에 없다
      style: { boxShadow: "none", margin: "0" },
    });
    if (i > 0) pdf.addPage("a4", "portrait");
    // 쪽 비율이 A4와 조금 달라도 폭에 맞추고 넘치는 높이는 자른다
    const ratio = el.offsetHeight / Math.max(1, el.offsetWidth);
    pdf.addImage(url, "JPEG", 0, 0, pageW, Math.min(pageH, pageW * ratio));
    opts.onProgress?.(i + 1, pages.length);
  }
  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

/*
 * 화면이 실제로 쓴 글꼴 조각만 담는다(2026-10-05, 선생님: PDF가 너무 오래 걸린다).
 * html-to-image 기본값은 연결된 글꼴 CSS의 @font-face를 전부 받아 넣는다. 한글 웹글꼴은 글자 범위별로
 * 수백 조각이라 5쪽에 20MB·21초가 걸렸다. 브라우저가 이미 내려받은(status=loaded) 조각만 고르면
 * 324KB·0.8초였다(같은 글꼴 다섯 벌로 잰 값). 고른 조각은 브라우저 캐시에서 바로 읽힌다.
 */
let fontCssCache: { key: string; css: string } | null = null;

async function usedFontEmbedCSS(): Promise<string> {
  if (typeof document === "undefined" || !document.fonts) return "";
  const norm = (s: string | null | undefined) => String(s ?? "").replace(/["']/g, "").replace(/\s+/g, "").toLowerCase();
  const faceKey = (family: string, weight?: string, style?: string, range?: string) =>
    [norm(family), norm(weight || "400"), norm(style || "normal"), norm(range || "u+0-10ffff")].join("|");
  const loaded = Array.from(document.fonts).filter((f) => f.status === "loaded");
  const want = new Set(loaded.map((f) => faceKey(f.family, f.weight, f.style, f.unicodeRange)));
  const cacheKey = [...want].sort().join(";");
  if (fontCssCache?.key === cacheKey) return fontCssCache.css;

  // @font-face 덩어리와 그 CSS의 주소(상대 경로 풀이용)를 모은다
  const blocks: Array<{ text: string; base: string }> = [];
  const fromRules = (rules: CSSRuleList, base: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) blocks.push({ text: rule.cssText, base });
      else if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) fromRules((rule as CSSGroupingRule).cssRules, base);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    const base = sheet.href || location.href;
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      rules = null; // 다른 출처(구글 글꼴 등) CSS는 규칙을 못 읽는다 — 글로 받아 나눈다
    }
    if (rules) fromRules(rules, base);
    else if (sheet.href) {
      try {
        const text = await (await fetch(sheet.href)).text();
        for (const m of text.match(/@font-face\s*{[^}]*}/g) ?? []) blocks.push({ text: m, base: sheet.href });
      } catch {
        /* 못 받은 CSS는 건너뛴다 */
      }
    }
  }

  const pick = (block: string, re: RegExp) => (block.match(re) ?? [])[1];
  const chosen = blocks.filter((b) =>
    want.has(
      faceKey(
        pick(b.text, /font-family:\s*([^;]+);/) ?? "",
        pick(b.text, /font-weight:\s*([^;]+);/),
        pick(b.text, /font-style:\s*([^;]+);/),
        pick(b.text, /unicode-range:\s*([^;]+);/)
      )
    )
  );
  const parts = await Promise.all(
    chosen.map(async (b) => {
      const raw = pick(b.text, /url\(\s*["']?([^"')]+)["']?\s*\)/);
      if (!raw) return "";
      try {
        const url = new URL(raw, b.base).href;
        const blob = await (await fetch(url)).blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(r.error);
          r.readAsDataURL(blob);
        });
        return b.text.replace(/src:[^;]+;/, `src: url(${dataUrl});`);
      } catch {
        return "";
      }
    })
  );
  const css = parts.filter(Boolean).join("\n");
  fontCssCache = { key: cacheKey, css };
  return css;
}

/** 파일 이름에 쓸 수 없는 글자를 뺀다 */
export function pdfFileName(...parts: Array<string | null | undefined>): string {
  return (
    parts
      .map((p) => String(p ?? "").trim())
      .filter(Boolean)
      .join("_")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 120) || "자료"
  );
}
