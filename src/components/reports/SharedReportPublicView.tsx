"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ACADEMY_NAME } from "@/lib/branding";
import { A4ReportDocument } from "@/components/reports/A4ReportDocument";
import { ReportPrintPreview } from "@/components/reports/ReportPrintPreview";
import type { StudentReport } from "@/lib/reports/types";

interface SharedReportPublicViewProps {
  report: StudentReport;
  parentMessage: string;
  aiReportText: string;
  expiresAt: string;
  studentName: string;
}

function formatExpiresLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 학부모 공개 리포트 보기 전용 */
export function SharedReportPublicView({
  report,
  parentMessage,
  aiReportText,
  expiresAt,
  studentName,
}: SharedReportPublicViewProps) {
  const [printOpen, setPrintOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{ACADEMY_NAME}</p>
            <h1 className="text-lg font-bold text-slate-800">
              {studentName} 학생 학습 리포트
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {formatExpiresLabel(expiresAt)}까지 열람 가능
            </p>
          </div>
          <Button type="button" onClick={() => setPrintOpen(true)}>
            PDF 저장 / 인쇄
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          <A4ReportDocument
            report={report}
            parentMessage={parentMessage}
            learningReportText={aiReportText}
            showLogo
          />
        </div>
      </main>

      <ReportPrintPreview
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        report={report}
        parentMessage={parentMessage}
        learningReportText={aiReportText}
      />
    </div>
  );
}
