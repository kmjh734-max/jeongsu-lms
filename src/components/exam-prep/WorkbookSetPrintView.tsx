"use client";

import { Button } from "@/components/ui/Button";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import type { PrintStageBlock } from "@/lib/exam-prep/build-print-model";

type WorkbookSlice = {
  workbookTitle: string;
  passageTitle: string;
  metaLine?: string;
  stages: PrintStageBlock[];
};

function WorkbookBody({
  workbook,
  showAnswers,
  academyName,
  logoSrc,
  index,
}: {
  workbook: WorkbookSlice;
  showAnswers: boolean;
  academyName: string;
  logoSrc: string;
  index: number;
}) {
  return (
    <div
      className={`exam-prep-workbook-print mx-auto max-w-[210mm] bg-white px-8 py-8 shadow-sm print:max-w-none print:px-0 print:py-0 print:shadow-none ${
        index > 0 ? "mt-10 break-before-page print:mt-0" : ""
      }`}
    >
      <header className="mb-6 border-b-2 border-slate-900 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-600">
              {academyName} · 10단계 WORKBOOK
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              {workbook.workbookTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-700">
              {workbook.passageTitle}
              {workbook.metaLine ? ` · ${workbook.metaLine}` : ""}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" className="h-12 w-auto object-contain" />
        </div>
      </header>

      {workbook.stages.map((stage) => (
        <section
          key={`${workbook.workbookTitle}-${stage.stageNumber}`}
          className="mb-8 break-inside-avoid border-b border-slate-200 pb-6 last:border-0"
        >
          <div className="mb-3">
            <h2 className="text-[15px] font-bold text-slate-900">
              WORKBOOK {stage.stageNumber} {stage.title}
            </h2>
            <p className="mt-1 text-sm text-slate-800">
              <span className="font-bold">WORKBOOK</span> {stage.prompt}
            </p>
          </div>
          <ol className="space-y-4">
            {stage.items.map((item) => (
              <li
                key={`${stage.stageNumber}-${item.order}-${item.label ?? ""}`}
                className="text-[13px] leading-[1.75] text-slate-900"
              >
                {item.label || item.order > 0 ? (
                  <p className="mb-1 font-semibold">
                    {item.label
                      ? item.label.startsWith("(")
                        ? item.label
                        : `${item.label}.`
                      : `${item.order}.`}
                  </p>
                ) : null}
                {item.english ? (
                  <p className="font-serif whitespace-pre-wrap">{item.english}</p>
                ) : null}
                {item.englishWithBlanks ? (
                  <p className="font-serif whitespace-pre-wrap">
                    {item.englishWithBlanks}
                  </p>
                ) : null}
                {item.korean ? (
                  <p className="mt-1 whitespace-pre-wrap text-slate-800">
                    {item.korean}
                  </p>
                ) : null}
                {item.koreanWithBlanks ? (
                  <p className="mt-1 whitespace-pre-wrap text-slate-800">
                    {item.koreanWithBlanks}
                  </p>
                ) : null}
                {item.cues && item.cues.length > 0 ? (
                  <p className="mt-1 rounded bg-slate-100 px-2 py-1 font-serif text-sm text-slate-800">
                    {item.cues.join(", ")}
                  </p>
                ) : null}
                {item.writingLines?.map((line, i) => (
                  <p key={i} className="mt-1 font-serif tracking-wide">
                    {line}
                  </p>
                ))}
                {item.chunks && item.chunks.length > 0 ? (
                  <p className="mt-1 font-serif text-slate-800">
                    ({item.chunks.join(" / ")})
                  </p>
                ) : null}
                {showAnswers && item.answerLines && item.answerLines.length > 0 ? (
                  <div className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-900">
                    <strong>정답:</strong> {item.answerLines.join(" · ")}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function WorkbookSetPrintView({
  setTitle,
  workbooks,
  missingPassageTitles,
  showAnswers,
  backHref,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: {
  setTitle: string;
  workbooks: WorkbookSlice[];
  missingPassageTitles?: string[];
  showAnswers: boolean;
  backHref: string;
  academyName?: string;
  logoSrc?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <a href={backHref} className="text-sm text-brand-700 hover:underline">
            ← 지문 목록
          </a>
          <p className="mt-0.5 text-sm font-medium text-slate-800">
            세트 출력 · {setTitle} ({workbooks.length}개 워크북)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href);
              if (showAnswers) url.searchParams.delete("answers");
              else url.searchParams.set("answers", "1");
              window.location.href = url.toString();
            }}
          >
            {showAnswers ? "문제지만 보기" : "정답 포함"}
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()}>
            인쇄 / PDF 저장
          </Button>
        </div>
      </div>

      {missingPassageTitles && missingPassageTitles.length > 0 ? (
        <div className="no-print mx-auto max-w-[210mm] px-4 py-3 text-sm text-amber-800">
          워크북이 없는 지문: {missingPassageTitles.join(", ")} — 세트 워크북
          생성을 먼저 해 주세요.
        </div>
      ) : null}

      {workbooks.length === 0 ? (
        <p className="mx-auto max-w-[210mm] px-4 py-10 text-sm text-slate-600">
          출력할 워크북이 없습니다. 세트 워크북을 먼저 생성해 주세요.
        </p>
      ) : (
        workbooks.map((wb, i) => (
          <WorkbookBody
            key={`${wb.workbookTitle}-${i}`}
            workbook={wb}
            showAnswers={showAnswers}
            academyName={academyName}
            logoSrc={logoSrc}
            index={i}
          />
        ))
      )}
    </div>
  );
}
