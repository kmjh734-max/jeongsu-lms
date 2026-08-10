"use client";

import { Button } from "@/components/ui/Button";
import type { StudentReport } from "@/lib/reports/types";

interface AiReportDraftSectionProps {
  report: StudentReport;
  value: string;
  onChange: (value: string) => void;
  generating: boolean;
  generateError: string | null;
  onGenerate: () => void | Promise<void>;
}

/** AI 학습 리포트 초안 (학부모 문구와 분리, 반영 버튼으로만 연동) */
export function AiReportDraftSection({
  report,
  value,
  onChange,
  generating,
  generateError,
  onGenerate,
}: AiReportDraftSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">AI 학습 리포트</h2>
        <Button
          type="button"
          size="sm"
          disabled={generating}
          onClick={() => void onGenerate()}
        >
          {generating ? "AI 리포트 작성 중..." : "AI 리포트 초안 생성"}
        </Button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        이 내용은 학부모 발송용 문구에 바로 반영되지 않으며, 아래의 「AI
        학습리포트 내용 반영」 버튼을 눌러야 반영됩니다.
      </p>

      <ul className="mt-3 list-inside list-disc space-y-0.5 text-sm text-slate-500">
        <li>{report.summary.videoLine}</li>
        <li>{report.summary.vocabLine}</li>
        <li>{report.summary.reviewLine}</li>
        <li>{report.summary.listeningScheduleLine}</li>
        <li>{report.summary.listeningDictationLine}</li>
        <li>{report.summary.listeningExamLine}</li>
      </ul>

      {generateError && (
        <p className="mt-2 text-sm font-medium text-amber-800" role="alert">
          {generateError}
        </p>
      )}

      <textarea
        className="ui-input mt-4 min-h-[180px] w-full resize-y text-sm leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="「AI 리포트 초안 생성」을 누르거나 직접 입력해 주세요."
        disabled={generating}
        aria-label="AI 학습 리포트"
      />
    </section>
  );
}
