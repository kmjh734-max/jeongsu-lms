import type { ReactNode } from "react";
import { WORKBOOK_10_STEPS } from "@/lib/exam-prep/presets";

export function ExamPrepStageChrome({
  stageNumber,
  shortLabel,
  prompt,
  passageTitle,
  metaLine,
  progressLabel,
  children,
  className = "",
}: {
  stageNumber: number;
  shortLabel?: string;
  prompt?: string;
  passageTitle?: string;
  metaLine?: string;
  progressLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const preset = WORKBOOK_10_STEPS.find((s) => s.number === stageNumber);
  const title = shortLabel || preset?.shortLabel || `${stageNumber}단계`;
  const workbookPrompt = prompt || preset?.prompt || "";

  return (
    <section
      className={`exam-prep-workbook-sheet space-y-4 rounded-none border border-slate-300 bg-white p-4 sm:p-6 ${className}`}
    >
      <header className="border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900 sm:text-base">
            WORKBOOK {stageNumber} {title}
          </h2>
          {progressLabel ? (
            <span className="text-xs text-slate-500">{progressLabel}</span>
          ) : null}
        </div>
        {(passageTitle || metaLine) && (
          <p className="mt-1 text-xs text-slate-500">
            {[passageTitle, metaLine].filter(Boolean).join(" · ")}
          </p>
        )}
        {workbookPrompt ? (
          <p className="mt-2 text-sm text-slate-800">
            <span className="font-bold">WORKBOOK</span> {workbookPrompt}
          </p>
        ) : null}
      </header>
      <div className="exam-prep-workbook-body space-y-4 text-[14px] leading-[1.7] text-slate-900">
        {children}
      </div>
    </section>
  );
}
