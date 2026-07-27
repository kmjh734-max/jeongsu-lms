"use client";

import { Button } from "@/components/ui/Button";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { workbookPromptForStepType } from "@/lib/exam-prep/presets";
import { EXAM_STEP_LABELS, type ExamStepType } from "@/lib/exam-prep/types";

export type PrintStepBlock = {
  stepOrder: number;
  stepType: string;
  title: string | null;
  questions: Array<{
    order: number;
    text: string | null;
    type: string;
    data: Record<string, unknown>;
    points: number;
    correctAnswer?: unknown;
    explanation?: string | null;
  }>;
};

function stringifyAnswer(a: unknown): string {
  if (a == null) return "-";
  if (typeof a === "string" || typeof a === "number" || typeof a === "boolean") {
    return String(a);
  }
  try {
    return JSON.stringify(a, null, 2);
  } catch {
    return String(a);
  }
}

export function WorkbookPrintView({
  workbookTitle,
  passageTitle,
  passageText,
  steps,
  showAnswers,
  backHref,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: {
  workbookTitle: string;
  passageTitle: string;
  passageText: string;
  steps: PrintStepBlock[];
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
        className="mx-auto max-w-[210mm] bg-white px-8 py-10 shadow-sm print:max-w-none print:shadow-none"
      >
        <header className="mb-6 border-b border-slate-300 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                {academyName} · 10단계 WORKBOOK
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {workbookTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-600">지문: {passageTitle}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="h-12 w-auto object-contain" />
          </div>
        </header>

        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-2 text-sm font-bold text-slate-800">본문</h2>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
            {passageText}
          </p>
        </section>

        {steps.map((step) => {
          const prompt =
            workbookPromptForStepType(step.stepType) ||
            step.questions[0]?.text ||
            "";
          return (
            <section
              key={`${step.stepOrder}-${step.stepType}`}
              className="mb-10 break-inside-avoid"
            >
              <div className="mb-3 border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  {step.title ||
                    `${step.stepOrder}단계 · ${
                      EXAM_STEP_LABELS[step.stepType as ExamStepType] ||
                      step.stepType
                    }`}
                </h2>
                {prompt ? (
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      WORKBOOK
                    </span>{" "}
                    {prompt}
                  </p>
                ) : null}
              </div>
              <ol className="space-y-4">
                {step.questions.map((q) => (
                  <li key={`${step.stepOrder}-${q.order}`} className="text-[13px]">
                    <p className="mb-1 font-medium text-slate-900">
                      {q.order}.
                    </p>
                    <QuestionBody data={q.data} type={q.type} />
                    {showAnswers && (
                      <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                        <strong>정답:</strong>{" "}
                        <code className="whitespace-pre-wrap">
                          {stringifyAnswer(q.correctAnswer)}
                        </code>
                        {q.explanation ? (
                          <p className="mt-1">해설: {q.explanation}</p>
                        ) : null}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function QuestionBody({
  data,
  type,
}: {
  data: Record<string, unknown>;
  type: string;
}) {
  if (type === "comprehension") {
    return (
      <div className="space-y-1">
        <p className="leading-relaxed">{String(data.english ?? "")}</p>
        {data.korean ? (
          <p className="text-slate-600">{String(data.korean)}</p>
        ) : null}
      </div>
    );
  }
  if (
    type === "english_blank" ||
    type === "korean_blank" ||
    type === "verb_form"
  ) {
    return (
      <div className="space-y-1">
        {data.englishHint ? (
          <p className="font-serif leading-relaxed">
            {String(data.englishHint)}
          </p>
        ) : null}
        {data.koreanHint ? (
          <p className="text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        {data.baseForm ? (
          <p className="text-xs text-slate-500">
            (기본형: {String(data.baseForm)})
          </p>
        ) : null}
        <p className="font-mono leading-relaxed">
          {String(data.displayText ?? "")}
        </p>
      </div>
    );
  }
  if (type === "translation_practice") {
    return (
      <p className="font-serif leading-relaxed">{String(data.english ?? "")}</p>
    );
  }
  if (type === "grammar_vocab_choice") {
    const options = (
      Array.isArray(data.options) ? data.options : []
    ) as { text: string }[];
    return (
      <div className="space-y-1">
        <p className="leading-relaxed">{String(data.displayText ?? "")}</p>
        <ul className="mt-1 space-y-0.5">
          {options.map((o, i) => (
            <li key={i}>
              {String.fromCharCode(9312 + i)} {o.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (type === "error_correction") {
    return (
      <p className="leading-relaxed">{String(data.corruptedText ?? "")}</p>
    );
  }
  if (type === "sentence_order" || type === "paragraph_order") {
    const items = (
      Array.isArray(data.items) ? data.items : []
    ) as { text: string }[];
    return (
      <div className="space-y-1">
        {data.koreanHint ? (
          <p className="text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        <ul className="list-disc space-y-0.5 pl-5">
          {items.map((it, i) => (
            <li key={i}>{it.text}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (type === "writing") {
    const cues = Array.isArray(data.cueWords)
      ? (data.cueWords as string[])
      : [];
    return (
      <div className="space-y-1">
        <p>{String(data.koreanPrompt ?? "")}</p>
        {cues.length > 0 ? (
          <p className="text-xs text-slate-500">
            제시어: {cues.join(" · ")}
          </p>
        ) : null}
      </div>
    );
  }
  if (type === "csat_mcq") {
    return (
      <p className="text-xs text-slate-500">
        (구 형식 문항 — 10단계 WORKBOOK으로 다시 생성하세요)
      </p>
    );
  }
  return (
    <pre className="overflow-auto rounded bg-slate-50 p-2 text-[11px]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
