"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { A4ReportDocument } from "@/components/reports/A4ReportDocument";
import { buildReportPdfFileName } from "@/lib/reports/report-pdf-filename";
import type { StudentReport } from "@/lib/reports/types";

interface SharedReportPrintViewProps {
  report: StudentReport;
  parentMessage: string;
  aiReportText: string;
  shareToken: string;
}

/** 공유 링크 — A4 출력·PDF 저장 전용 */
export function SharedReportPrintView({
  report,
  parentMessage,
  aiReportText,
  shareToken,
}: SharedReportPrintViewProps) {
  const pdfFileName = buildReportPdfFileName(
    report.student.name,
    report.rangeLabel
  );
  const backHref = `/report/share/${shareToken}`;

  function handlePrint() {
    const prevTitle = document.title;
    document.title = pdfFileName.replace(/\.pdf$/i, "");
    window.print();
    window.setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">출력용 리포트</p>
            <p className="truncate text-xs text-slate-500">
              {report.student.name} · {report.rangeLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={backHref}
              className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← 모바일 보기
            </Link>
            <Button type="button" onClick={handlePrint}>
              PDF 저장 / 인쇄
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] py-8 print:py-0">
        <div id="shared-report-print-root">
          <A4ReportDocument
            report={report}
            parentMessage={parentMessage}
            learningReportText={aiReportText}
            showLogo
          />
        </div>
      </div>
    </div>
  );
}
