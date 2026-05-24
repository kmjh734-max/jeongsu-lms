"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildParentReportMessage } from "@/lib/reports/build-parent-message";
import type { StudentReport } from "@/lib/reports/types";

interface ParentReportMessageProps {
  report: StudentReport;
  teacherComment: string;
}

export function ParentReportMessage({
  report,
  teacherComment,
}: ParentReportMessageProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const message = buildParentReportMessage(report, teacherComment);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyMessage("리포트 문구가 복사되었습니다.");
      window.setTimeout(() => setCopyMessage(null), 3000);
    } catch {
      setCopyMessage("복사에 실패했습니다. 직접 선택해 복사해 주세요.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-base font-semibold text-slate-900">
          학부모 발송용 문구
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
            리포트 문구 복사하기
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
            화면 인쇄하기
          </Button>
        </div>
      </div>
      {copyMessage && (
        <p className="mt-2 text-sm font-medium text-emerald-700 print:hidden" role="status">
          {copyMessage}
        </p>
      )}
      <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
        {message}
      </pre>
    </section>
  );
}
