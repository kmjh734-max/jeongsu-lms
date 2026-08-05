"use client";

import { Button } from "@/components/ui/Button";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import type { PrintStageBlock } from "@/lib/exam-prep/build-print-model";

export function WorkbookPrintView({
  workbookTitle,
  passageTitle,
  metaLine,
  stages,
  showAnswers,
  backHref,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: {
  workbookTitle: string;
  passageTitle: string;
  metaLine?: string;
  stages: PrintStageBlock[];
  showAnswers: boolean;
  backHref: string;
  academyName?: string;
  logoSrc?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <a href={backHref} className="text-sm text-brand-700 hover:underline">
          ← 검수로 돌아가기
        </a>
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

      <div
        id="exam-prep-print-root"
        className="exam-prep-workbook-print mx-auto max-w-[210mm] bg-white px-8 py-8 shadow-sm print:max-w-none print:px-0 print:py-0 print:shadow-none"
      >
        <header className="mb-6 border-b-2 border-slate-900 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-600">
                {academyName} · 10단계 WORKBOOK
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {workbookTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-700">
                {passageTitle}
                {metaLine ? ` · ${metaLine}` : ""}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="h-12 w-auto object-contain" />
          </div>
        </header>

        {stages.map((stage) => (
          <section
            key={stage.stageNumber}
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
                  key={`${stage.stageNumber}-${item.order}`}
                  className="text-[13px] leading-[1.75] text-slate-900"
                >
                  <p className="mb-1 font-semibold">
                    {item.label ? `${item.label}.` : `${item.order}.`}
                  </p>
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
                    <p className="mt-1 text-slate-700">
                      제시어: {item.cues.join(" → ")}
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

        {stages.length === 0 ? (
          <p className="text-sm text-slate-600">
            인쇄할 단계 문제가 없습니다. 지문에서 「워크북 생성」으로 1~10단계를
            만든 뒤 다시 열어 주세요.
          </p>
        ) : null}
      </div>
    </div>
  );
}
