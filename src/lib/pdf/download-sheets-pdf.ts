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
    fontEmbedCSS = await getFontEmbedCSS(pages[0]!);
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
