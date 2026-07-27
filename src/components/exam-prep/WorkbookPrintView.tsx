"use client";

import type { ReactNode } from "react";
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

const CIRCLED = ["①", "②", "③", "④", "⑤"];
const PURPLE = "#7c3aed";

function renderMarkedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={`t${key++}`}>{text.slice(last, m.index)}</span>);
    }
    nodes.push(
      <u key={`u${key++}`} className="underline decoration-slate-800">
        {m[1]}
      </u>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`t${key++}`}>{text.slice(last)}</span>);
  }
  return nodes.length > 0 ? nodes : [text];
}

function formatAnswer(a: unknown): string {
  if (a == null) return "-";
  if (typeof a === "object" && a !== null) {
    const o = a as Record<string, unknown>;
    if (typeof o.display === "string") return o.display;
    if (typeof o.choiceNumber === "number") {
      return CIRCLED[o.choiceNumber - 1] ?? String(o.choiceNumber);
    }
    if (o.optionId != null) {
      const n = Number(o.optionId);
      if (n >= 1 && n <= 5) return CIRCLED[n - 1]!;
      return String(o.optionId);
    }
  }
  if (typeof a === "number" && a >= 1 && a <= 5) return CIRCLED[a - 1]!;
  return typeof a === "string" ? a : JSON.stringify(a);
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
  const allQuestions = steps.flatMap((s) =>
    s.questions.map((q) => ({ ...q, stepTitle: s.title, stepOrder: s.stepOrder }))
  );
  const hasCsat = allQuestions.some((q) => q.type === "csat_mcq");

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
            {showAnswers ? "문제지만 보기" : "정답·해설 보기"}
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()}>
            인쇄 / PDF 저장
          </Button>
        </div>
      </div>

      <div
        id="exam-prep-print-root"
        className="mx-auto max-w-[210mm] bg-white px-6 py-8 shadow-sm print:max-w-none print:px-8 print:py-6 print:shadow-none"
      >
        <header className="mb-4 border-b-2 pb-2" style={{ borderColor: PURPLE }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                [{academyName}] 유형별 문제 · {workbookTitle}
              </p>
              <h1 className="mt-0.5 text-lg font-bold text-slate-900">
                {passageTitle}
              </h1>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="h-10 w-auto object-contain" />
          </div>
        </header>

        {!hasCsat && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-bold text-slate-800">본문</h2>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
              {passageText}
            </p>
          </section>
        )}

        {!showAnswers ? (
          <div className="columns-1 gap-8 md:columns-2 print:columns-2 [column-rule:1px_solid_#e2e8f0]">
            {allQuestions.map((q, idx) => (
              <article
                key={`${q.stepOrder}-${q.order}-${idx}`}
                className="mb-5 break-inside-avoid"
              >
                <p
                  className="mb-1 text-[13px] font-semibold"
                  style={{ color: PURPLE }}
                >
                  {idx + 1}. {q.text}
                </p>
                {q.type === "csat_mcq" ? (
                  <CsatQuestionBody data={q.data} />
                ) : (
                  <LegacyQuestionBody data={q.data} type={q.type} />
                )}
              </article>
            ))}
          </div>
        ) : (
          <div>
            <h2
              className="mb-4 text-xl font-bold"
              style={{ color: "#0f172a", borderBottom: `2px solid ${PURPLE}` }}
            >
              정답 및 해설
            </h2>
            <div className="columns-1 gap-8 md:columns-2 print:columns-2">
              {allQuestions.map((q, idx) => {
                const summary = Array.isArray(q.data.passageSummary)
                  ? (q.data.passageSummary as string[])
                  : [];
                return (
                  <article
                    key={`ans-${idx}`}
                    className="mb-6 break-inside-avoid text-[12.5px] leading-relaxed"
                  >
                    <p className="mb-2 font-bold text-slate-900">
                      {idx + 1}{" "}
                      <span style={{ color: PURPLE }}>
                        {formatAnswer(q.correctAnswer)}
                      </span>
                    </p>
                    {summary.length > 0 && (
                      <div className="mb-2">
                        <p
                          className="mb-1 font-semibold"
                          style={{ color: PURPLE }}
                        >
                          ■ 지문 주요 내용 정리
                        </p>
                        <ul className="list-disc space-y-0.5 pl-5 text-slate-700">
                          {summary.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.explanation ? (
                      <div>
                        <p
                          className="mb-1 font-semibold"
                          style={{ color: PURPLE }}
                        >
                          ■ 해설
                        </p>
                        <p className="whitespace-pre-wrap text-slate-700">
                          {q.explanation}
                        </p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {!showAnswers &&
          steps.map((step) =>
            step.questions.some((q) => q.type !== "csat_mcq") ? null : null
          )}
      </div>
    </div>
  );
}

function CsatQuestionBody({ data }: { data: Record<string, unknown> }) {
  const passage = String(data.passageModified ?? data.passageOriginal ?? "");
  const choices = (
    Array.isArray(data.choices) ? data.choices : []
  ) as Array<{ number?: number; text: string }>;
  const shortChoices = choices.length > 0 && choices.every((c) => c.text.length <= 8);

  return (
    <div className="text-[12.5px] leading-relaxed text-slate-800">
      <p className="mb-2 whitespace-pre-wrap font-serif">
        {renderMarkedText(passage)}
      </p>
      <div
        className={
          shortChoices
            ? "mt-2 flex flex-wrap gap-x-4 gap-y-1"
            : "mt-2 space-y-1"
        }
      >
        {choices.map((c, i) => (
          <p key={i}>
            {CIRCLED[(c.number ?? i + 1) - 1] ?? `${i + 1}.`} {c.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function LegacyQuestionBody({
  data,
  type,
}: {
  data: Record<string, unknown>;
  type: string;
}) {
  if (type === "grammar_vocab_choice" && Array.isArray(data.options)) {
    return (
      <ul className="mt-1 space-y-1 text-[12.5px]">
        {(data.options as { text: string }[]).map((o, i) => (
          <li key={i}>
            {CIRCLED[i] ?? `${i + 1}.`} {o.text}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof data.displayText === "string") {
    return (
      <p className="mt-1 font-mono text-[12.5px] text-slate-700">
        {data.displayText}
      </p>
    );
  }
  return (
    <p className="mt-1 text-[11px] text-slate-400">
      {EXAM_STEP_LABELS[type as ExamStepType] ?? type}
    </p>
  );
}
