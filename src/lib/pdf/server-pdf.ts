"use client";

import type { PdfPaper } from "@/lib/pdf/download-sheets-pdf";

/**
 * 화면의 쪽들을 HTML로 떠서 서버(/api/pdf/render)의 Chrome으로 PDF를 만든다. 글자가 글자로 남는다.
 *
 * 선생님 말씀(2026-10-20): PDF 저장이 빨랐으면 좋겠고, 그림이 아니라 글자로 저장되게.
 *
 * 쪽만 떼어 보내면 조상에 걸린 모양(워크북 모양 A/B/C 같은 조상 클래스, #print-root 아래 규칙)이
 * 빠지므로, 쪽마다 조상 줄기를 껍데기만 복제해 감싼다. 조상의 여백·확대·변형은 지운다.
 * 쪽은 15쪽씩 나눠 동시에 만들고 pdf-lib로 한 파일로 합친다(요청·응답 크기 상한도 피한다).
 */

const CHUNK_PAGES = 15;
const CONCURRENCY = 4;

/** 조상 껍데기에서 지울 모양 — 쪽의 크기·위치를 바꾸지 않게 */
const NEUTRAL: Array<[string, string]> = [
  ["display", "block"],
  ["position", "static"],
  ["margin", "0"],
  ["padding", "0"],
  ["border", "0"],
  ["transform", "none"],
  ["zoom", "1"],
  ["width", "auto"],
  ["min-width", "0"],
  ["max-width", "none"],
  ["height", "auto"],
  ["min-height", "0"],
  ["max-height", "none"],
  ["overflow", "visible"],
  ["box-shadow", "none"],
  ["background", "transparent"],
  ["gap", "0"],
];

/** 쪽 하나를 복제한다. 그림판(canvas)은 그림으로, 입력 칸은 지금 값으로 박고, 화면 전용 표시는 뺀다. */
function clonePage(page: HTMLElement): HTMLElement {
  const clone = page.cloneNode(true) as HTMLElement;
  const oc = page.querySelectorAll("canvas");
  const cc = clone.querySelectorAll("canvas");
  oc.forEach((c, i) => {
    const img = document.createElement("img");
    try {
      img.src = c.toDataURL("image/png");
    } catch {
      return;
    }
    img.setAttribute("style", c.getAttribute("style") ?? "");
    img.className = c.className;
    img.width = c.width;
    img.height = c.height;
    img.style.width = `${c.offsetWidth}px`;
    img.style.height = `${c.offsetHeight}px`;
    cc[i]?.replaceWith(img);
  });
  const oi = page.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input,textarea,select");
  const ci = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input,textarea,select");
  oi.forEach((el, i) => {
    const c = ci[i];
    if (!c) return;
    if (el instanceof HTMLTextAreaElement) c.textContent = el.value;
    else if (el instanceof HTMLSelectElement) {
      Array.from((c as HTMLSelectElement).options).forEach((o, k) => {
        if (k === el.selectedIndex) o.setAttribute("selected", "");
        else o.removeAttribute("selected");
      });
    } else if (el.type === "checkbox" || el.type === "radio") {
      if (el.checked) c.setAttribute("checked", "");
      else c.removeAttribute("checked");
    } else c.setAttribute("value", el.value);
  });
  clone.querySelectorAll(".print\\:hidden, .no-print").forEach((n) => n.remove());
  // 미리보기 그림자·확대는 종이에 없다
  clone.style.setProperty("box-shadow", "none", "important");
  clone.style.setProperty("margin", "0", "important");
  clone.style.setProperty("zoom", "1", "important");
  // 화면에서만 숨긴 쪽(정답지 탭 등)도 싣는다
  if (getComputedStyle(page).display === "none") clone.style.setProperty("display", "block", "important");
  return clone;
}

/** 쪽을 조상 껍데기로 감싼다. 바깥 껍데기를 돌려준다. */
function wrapWithAncestors(page: HTMLElement, clone: HTMLElement): HTMLElement {
  let node: HTMLElement = clone;
  for (let a = page.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
    const shell = a.cloneNode(false) as HTMLElement;
    for (const [k, v] of NEUTRAL) shell.style.setProperty(k, v, "important");
    shell.appendChild(node);
    node = shell;
  }
  // 조상이 없으면(쪽이 body 바로 아래) 쪽 나눔을 걸 껍데기를 하나 둔다
  if (node === clone) {
    const shell = document.createElement("div");
    shell.appendChild(node);
    node = shell;
  }
  return node;
}

function attrs(el: Element): string {
  const cls = el.getAttribute("class");
  const style = el.getAttribute("style");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `${cls ? ` class="${esc(cls)}"` : ""}${style ? ` style="${esc(style)}"` : ""}`;
}

/** 화면이 쓰는 CSS: 파일 CSS는 주소로(서버 Chrome이 받는다), 글 CSS는 내용으로 */
function collectCss(): string {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .filter((l) => l.href && !l.disabled)
    .map((l) => `<link rel="stylesheet" href="${l.href.replace(/"/g, "&quot;")}"${l.media ? ` media="${l.media}"` : ""}>`);
  const styles = Array.from(document.querySelectorAll("style")).map((s) => {
    try {
      const rules = s.sheet?.cssRules;
      if (rules) return Array.from(rules).map((r) => r.cssText).join("\n");
    } catch {
      /* 규칙을 못 읽으면 글 그대로 */
    }
    return s.textContent ?? "";
  });
  return `${links.join("")}<style>${styles.join("\n").replace(/<\/style/gi, "<\\/style")}</style>`;
}

export function buildHtml(pages: HTMLElement[], paper: PdfPaper): string {
  const parts = pages.map((page, i) => {
    const shell = wrapWithAncestors(page, clonePage(page));
    const pxPerMm = (page.offsetWidth || 1) / paper.w;
    const tall = page.offsetHeight > paper.h * pxPerMm * 1.02;
    // 종이 한 장짜리 쪽은 종이 크기로 자른다(소수점 차이로 빈 장이 끼지 않게). 긴 쪽은 이어지는 장으로 흘린다.
    if (!tall) {
      shell.style.setProperty("height", `${paper.h}mm`, "important");
      shell.style.setProperty("overflow", "hidden", "important");
    }
    if (i < pages.length - 1) shell.style.setProperty("break-after", "page", "important");
    return shell.outerHTML;
  });
  return `<!doctype html><html${attrs(document.documentElement)}><head><meta charset="utf-8"><base href="${location.href.replace(/"/g, "&quot;")}">${collectCss()}<style>@page{size:${paper.w}mm ${paper.h}mm;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important;height:auto!important;min-height:0!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}</style></head><body${attrs(document.body)}>${parts.join("")}</body></html>`;
}

async function gzip(text: string): Promise<{ body: BodyInit; encoding: string }> {
  if (typeof CompressionStream === "undefined") return { body: text, encoding: "identity" };
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return { body: await new Response(stream).arrayBuffer(), encoding: "gzip" };
}

async function renderChunk(html: string, paper: PdfPaper): Promise<ArrayBuffer> {
  const { body, encoding } = await gzip(JSON.stringify({ html, paper }));
  const res = await fetch("/api/pdf/render", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", "x-body-encoding": encoding },
    body,
  });
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("pdf")) {
    throw new Error((await res.text().catch(() => "")).slice(0, 200) || `PDF 서버 오류 (${res.status})`);
  }
  return res.arrayBuffer();
}

/** 쪽들을 서버에서 글자 PDF로 만들어 한 파일(Blob)로 돌려준다. */
export async function renderPagesToPdf(
  pages: HTMLElement[],
  paper: PdfPaper,
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const chunks: HTMLElement[][] = [];
  for (let i = 0; i < pages.length; i += CHUNK_PAGES) chunks.push(pages.slice(i, i + CHUNK_PAGES));
  // HTML은 화면이 바뀌기 전에 한꺼번에 뜬다(만드는 동안 선생님이 화면을 고쳐도 섞이지 않게)
  const htmls = chunks.map((c) => buildHtml(c, paper));
  const results: ArrayBuffer[] = new Array(chunks.length);
  let next = 0;
  let donePages = 0;
  const worker = async () => {
    while (next < chunks.length) {
      const k = next++;
      results[k] = await renderChunk(htmls[k]!, paper);
      donePages += chunks[k]!.length;
      onProgress?.(donePages, pages.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker));
  if (results.length === 1) return new Blob([results[0]!], { type: "application/pdf" });
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();
  for (const buf of results) {
    const doc = await PDFDocument.load(buf);
    const copied = await merged.copyPages(doc, doc.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

