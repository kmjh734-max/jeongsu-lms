"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { A4ReportDocument } from "@/components/reports/A4ReportDocument";
import { SharedReportHtmlView } from "@/components/reports/SharedReportHtmlView";
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

/**
 * 리포트 미리보기 — 기본은 학부모가 실제로 보는 휴대폰 화면 그대로다.
 *
 * 전에는 여기서 A4 문서를 보여 주는데 카카오톡 링크는 휴대폰 화면을 열어서,
 * 선생님이 본 것과 학부모가 받은 것이 서로 달랐다. 이제 같은 것을 보여 주고
 * A4는 인쇄·PDF 용으로 단추를 눌러 따로 본다.
 */
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
  /** "phone" = 학부모가 받는 화면, "a4" = 인쇄용 문서 */
  const [look, setLook] = useState<"phone" | "a4">("phone");

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
    // 인쇄는 언제나 A4 문서로 — 휴대폰 화면을 그대로 뽑으면 종이에서 읽기 어렵다
    setLook("a4");
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
          <p className="text-sm font-bold text-slate-900">리포트 미리보기</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {pdfFileName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {([["phone", "학부모 화면"], ["a4", "인쇄용 A4"]] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setLook(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  look === key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button type="button" onClick={handlePrint}>
            PDF 저장
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto py-8 print:py-0">
        {look === "phone" ? (
          // 학부모가 받는 화면 그대로 — 휴대폰 너비에 맞춰 가운데에 놓는다
          <div className="no-print mx-auto w-full max-w-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <SharedReportHtmlView
              report={report}
              parentMessage={parentMessage}
              aiReportText={learningReportText ?? ""}
              studentName={report.student.name}
              expiresAt={new Date(Date.now() + 30 * 86400000).toISOString()}
              shareToken=""
              academyName={academyName}
              logoSrc={logoSrc}
            />
          </div>
        ) : null}
        <div id="a4-print-root" className={look === "a4" ? "" : "hidden print:block"}>
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
