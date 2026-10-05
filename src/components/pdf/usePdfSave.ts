"use client";

import { useState } from "react";
import { downloadSheetsPdf, pdfFileName, type PdfPaper } from "@/lib/pdf/download-sheets-pdf";

/**
 * 「PDF로 저장」 버튼이 쓰는 상태. 화면마다 쪽을 골라 save에 넘기면 된다.
 * busy는 「문제지 2/5」처럼 진행을, error는 실패 까닭을 준다.
 */
export function usePdfSave() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function save(label: string, pages: HTMLElement[], nameParts: Array<string | null | undefined>, paper?: PdfPaper) {
    if (busy) return;
    setError(null);
    if (pages.length === 0) {
      setError("저장할 쪽이 아직 없습니다.");
      return;
    }
    setBusy(`${label} 0/${pages.length}`);
    try {
      await downloadSheetsPdf(pages, pdfFileName(...nameParts, label), {
        paper,
        onProgress: (done, total) => setBusy(`${label} ${done}/${total}`),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF를 만들지 못했습니다.");
    } finally {
      setBusy(null);
    }
  }
  /** 버튼 아래에 띄울 한 줄 */
  const status = busy ? `PDF 만드는 중… ${busy}` : error;
  return { busy, error, save, status };
}
