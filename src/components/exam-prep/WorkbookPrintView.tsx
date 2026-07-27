"use client";

import { Button } from "@/components/ui/Button";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
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
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500">
              {academyName} · 내신대비학습
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              {workbookTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600">지문: {passageTitle}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" className="h-12 w-auto object-contain" />
        </header>

        <section className="mb-8 break-inside-avoid">
          <h2 className="mb-2 text-sm font-bold text-slate-800">본문</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {passageText}
          </p>
        </section>

        {steps.map((step) => (
          <section
            key={`${step.stepOrder}-${step.stepType}`}
            className="mb-8 break-inside-avoid"
          >
            <h2 className="mb-3 border-b border-slate-100 pb-1 text-base font-bold text-slate-900">
              {step.stepOrder}단계 ·{" "}
              {step.title ||
                EXAM_STEP_LABELS[step.stepType as ExamStepType] ||
                step.stepType}
            </h2>
            <ol className="space-y-4">
              {step.questions.map((q) => (
                <li key={`${step.stepOrder}-${q.order}`} className="text-sm">
                  <p className="font-medium text-slate-900">
                    {q.order}. {q.text ?? q.type}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({q.points}점)
                    </span>
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
        ))}
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
      <div className="mt-1 space-y-1 text-slate-700">
        {data.english ? (
          <p className="whitespace-pre-wrap">{String(data.english)}</p>
        ) : null}
        {data.korean ? (
          <p className="text-slate-500">{String(data.korean)}</p>
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
      <div className="mt-1 space-y-1">
        {data.englishHint ? (
          <p className="font-mono text-xs text-slate-500">
            {String(data.englishHint)}
          </p>
        ) : null}
        {data.baseForm ? (
          <p className="text-xs">기본형: {String(data.baseForm)}</p>
        ) : null}
        <p className="font-mono">{String(data.displayText ?? "")}</p>
        <p className="text-slate-400">→ ________________</p>
      </div>
    );
  }
  if (type === "grammar_vocab_choice") {
    const options = Array.isArray(data.options)
      ? (data.options as Array<{ id: string; text: string }>)
      : [];
    return (
      <div className="mt-1">
        <p className="font-mono">{String(data.displayText ?? "")}</p>
        <ul className="mt-1 list-none space-y-0.5 pl-1">
          {options.map((o, i) => (
            <li key={o.id}>
              {String.fromCharCode(65 + i)}. {o.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (type === "error_correction") {
    return (
      <p className="mt-1 font-mono text-slate-700">
        {String(data.corruptedText ?? "")}
      </p>
    );
  }
  if (type === "translation_practice") {
    return (
      <p className="mt-1 font-mono">{String(data.english ?? "")}</p>
    );
  }
  if (type === "sentence_order" || type === "paragraph_order") {
    const items = Array.isArray(data.items)
      ? (data.items as Array<{ id: string; text: string }>)
      : [];
    return (
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {items.map((it) => (
          <li key={it.id}>{it.text}</li>
        ))}
      </ul>
    );
  }
  if (type === "writing") {
    return (
      <div className="mt-1 text-slate-700">
        {data.koreanPrompt ? <p>{String(data.koreanPrompt)}</p> : null}
        {Array.isArray(data.cueWords) ? (
          <p className="text-xs text-slate-500">
            제시어: {(data.cueWords as string[]).join(" · ")}
          </p>
        ) : null}
        <p className="mt-2 text-slate-400">→ _______________________________</p>
      </div>
    );
  }
  return null;
}

function stringifyAnswer(v: unknown): string {
  if (v == null) return "-";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "text" in v) {
    return String((v as { text: unknown }).text ?? "");
  }
  if (typeof v === "object" && v !== null && "optionId" in v) {
    return String((v as { optionId: unknown }).optionId);
  }
  if (typeof v === "object" && v !== null && "blanks" in v) {
    const blanks = (v as { blanks: Array<{ id?: string; answer?: string }> })
      .blanks;
    if (Array.isArray(blanks)) {
      return blanks.map((b) => b.answer ?? "").filter(Boolean).join(", ");
    }
  }
  if (typeof v === "object" && v !== null && "order" in v) {
    return JSON.stringify((v as { order: unknown }).order);
  }
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
