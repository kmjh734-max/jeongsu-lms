"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { A4ReportDocument } from "@/components/reports/A4ReportDocument";
import { buildReportPdfFileName } from "@/lib/reports/report-pdf-filename";
import type { StudentReport } from "@/lib/reports/types";

interface ReportPrintPreviewProps {
  open: boolean;
  onClose: () => void;
  report: StudentReport;
  parentMessage: string;
  learningReportText?: string;
  academyName?: string;
  logoSrc?: string;
}

/** A4 출력 미리보기 모달 — 확인 후 PDF 저장/인쇄 */
export function ReportPrintPreview({
  open,
  onClose,
  report,
  parentMessage,
  learningReportText,
  academyName,
  logoSrc,
}: ReportPrintPreviewProps) {
  const pdfFileName = buildReportPdfFileName(
    report.student.name,
    report.rangeLabel
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  function handlePrint() {
    const prevTitle = document.title;
    document.title = pdfFileName.replace(/\.pdf$/i, "");
    window.print();
    window.setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  }

  return createPortal(
    <div
      id="report-print-modal"
      className="fixed inset-0 z-[100] flex flex-col bg-slate-900/60"
      role="dialog"
      aria-modal="true"
      aria-label="리포트 출력 미리보기"
    >
      <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800">A4 리포트 미리보기</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            저장 파일명:{" "}
            <span className="font-mono font-medium text-[#1e3a5f]">
              {pdfFileName}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handlePrint}>
            PDF 저장 / 인쇄
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto py-8 print:py-0">
        <div id="a4-print-root">
          <A4ReportDocument
            report={report}
            parentMessage={parentMessage}
            learningReportText={learningReportText}
            academyName={academyName}
            logoSrc={logoSrc}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
