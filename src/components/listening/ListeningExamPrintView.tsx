"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
const ACCENT = "#9f1239";

interface ListeningExamPrintViewProps {
  title: string;
  gradeLabel?: string;
  questions: ListeningQuestionData[];
  backHref: string;
  showScript?: boolean;
}

function defaultExamDate() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function splitIntoTwoColumns<T>(items: T[]): [T[], T[]] {
  if (items.length === 0) return [[], []];
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function ListeningExamPrintView({
  title,
  gradeLabel = "중학교 1학년",
  questions,
  backHref,
  showScript = false,
}: ListeningExamPrintViewProps) {
  const [examTitle, setExamTitle] = useState(title);
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [examDate, setExamDate] = useState(defaultExamDate);

  const [leftColumn, rightColumn] = useMemo(
    () => splitIntoTwoColumns(questions),
    [questions]
  );

  function handlePrint() {
    const prevTitle = document.title;
    const safeName = studentName.trim() || "학생";
    document.title = `${safeName}_${examTitle.trim() || title}`;
    window.print();
    window.setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  }

  return (
    <div className="min-h-screen bg-stone-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-medium text-rose-800 hover:underline"
            >
              ← 편집으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-900"
            >
              인쇄 / PDF 저장
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
              출력 설정
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  시험지 제목
                </span>
                <input
                  className="ui-input"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="시험지 제목"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  날짜
                </span>
                <input
                  className="ui-input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  placeholder="2026년 5월 21일"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  반
                </span>
                <input
                  className="ui-input"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="예: 중1-A"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  번호
                </span>
                <input
                  className="ui-input"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  placeholder="예: 12"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-stone-600">
                  이름
                </span>
                <input
                  className="ui-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="학생 이름"
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-stone-500">
              문항 {questions.length}개 · A4 1장 2단(열)으로 출력됩니다.
              {showScript && " 대본이 포함됩니다."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] py-8 print:py-0">
        <article
          id="listening-print-root"
          className="listening-exam-page relative mx-auto box-border w-[210mm] min-h-[297mm] bg-[#fcfaf8] px-[12mm] pb-[10mm] pt-[11mm] shadow-lg print:min-h-0 print:shadow-none"
        >
          <header className="border-b border-stone-300/80 pb-[4mm]">
            <div className="flex items-start justify-between gap-[4mm]">
              <div className="shrink-0 rounded-lg bg-white p-[2mm] shadow-[0_1px_3px_rgb(0_0_0/0.06)] ring-1 ring-stone-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SRC}
                  alt="학원 로고"
                  className="h-[22mm] w-auto max-w-[52mm] object-contain"
                />
              </div>

              <div className="min-w-0 flex-1 pt-[1mm] text-right">
                <p className="text-[7.5pt] font-medium uppercase tracking-[0.28em] text-stone-400">
                  English Listening
                </p>
                <h1 className="mt-1 text-[14pt] font-bold leading-tight text-stone-900">
                  {examTitle.trim() || title}
                </h1>
                <p className="mt-1 text-[9pt] text-stone-500">{gradeLabel}</p>
              </div>
            </div>

            <div className="mt-[4mm] grid grid-cols-4 overflow-hidden rounded-md border border-stone-300/70 bg-white text-[8.5pt] shadow-sm">
              <MetaCell label="날짜" value={examDate} />
              <MetaCell label="반" value={className} />
              <MetaCell label="번호" value={studentNo} />
              <MetaCell label="이름" value={studentName} emphasize />
            </div>
          </header>

          <div className="mt-[4mm] flex-1">
            {questions.length === 0 ? (
              <p className="py-20 text-center text-[10pt] text-stone-500">
                출력할 문항이 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-[5mm]">
                <QuestionColumn
                  questions={leftColumn}
                  showScript={showScript}
                />
                <QuestionColumn
                  questions={rightColumn}
                  showScript={showScript}
                  divided
                />
              </div>
            )}
          </div>

          <footer className="mt-[5mm] border-t border-stone-200 pt-[2mm] text-center text-[7pt] tracking-widest text-stone-400">
            — 끝 —
          </footer>

          <div
            className="pointer-events-none absolute inset-[5mm] rounded border border-stone-300/40"
            aria-hidden
          />
        </article>
      </div>
    </div>
  );
}

function QuestionColumn({
  questions,
  showScript,
  divided,
}: {
  questions: ListeningQuestionData[];
  showScript: boolean;
  divided?: boolean;
}) {
  if (questions.length === 0) {
    return (
      <div
        className={divided ? "min-h-[40mm] border-l border-stone-200/80 pl-[4mm]" : ""}
      />
    );
  }

  return (
    <ol
      className={`space-y-[3.5mm] ${divided ? "border-l border-stone-200/80 pl-[4mm]" : "pr-[2mm]"}`}
      start={questions[0]?.order_index}
    >
      {questions.map((q) => (
        <ExamQuestion key={q.id} question={q} showScript={showScript} />
      ))}
    </ol>
  );
}

function MetaCell({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="border-r border-stone-200 last:border-r-0">
      <div
        className="px-2 py-0.5 text-[7pt] font-bold text-white"
        style={{ backgroundColor: ACCENT }}
      >
        {label}
      </div>
      <div
        className={`min-h-[7mm] px-2 py-1 text-stone-800 ${emphasize ? "font-semibold" : ""}`}
      >
        {value || "\u00a0"}
      </div>
    </div>
  );
}

function ExamQuestion({
  question: q,
  showScript,
}: {
  question: ListeningQuestionData;
  showScript: boolean;
}) {
  const passageText = displayQuestionTextForOrder(
    q.order_index,
    q.question_text
  );
  const headline = q.instruction?.trim() || passageText || "듣기 문항";

  return (
    <li className="break-inside-avoid text-[8.5pt] leading-[1.55] text-stone-900">
      <div className="flex gap-[2mm]">
        <span
          className="flex h-[5mm] w-[5mm] shrink-0 items-center justify-center rounded-full text-[7.5pt] font-bold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          {q.order_index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug text-stone-900">{headline}</p>
          {passageText && q.instruction?.trim() && (
            <p className="mt-[1mm] whitespace-pre-wrap border-l-2 border-stone-300 pl-[2mm] text-[8pt] leading-snug text-stone-600">
              {passageText}
            </p>
          )}
          <ul className="mt-[1.5mm] space-y-[0.5mm]">
            {q.choices.map((choice, i) => (
              <li key={i} className="flex gap-[1mm] text-[8pt] text-stone-800">
                <span className="shrink-0 font-medium text-stone-500">
                  {CIRCLED[i] ?? `${i + 1}.`}
                </span>
                <span>{choice}</span>
              </li>
            ))}
          </ul>
          {showScript && q.segments.length > 0 && (
            <div className="mt-[1.5mm] rounded border border-dashed border-stone-300 bg-white/70 px-[2mm] py-[1.5mm] text-[7.5pt] text-stone-600">
              {q.segments.map((seg) => (
                <p key={seg.id} className="leading-snug">
                  <span className="font-semibold text-stone-700">
                    {seg.speaker_type}:
                  </span>{" "}
                  {seg.text}
                </p>
              ))}
              {q.script_translation && (
                <p className="mt-[1mm] border-t border-stone-200 pt-[1mm] italic text-stone-500">
                  {q.script_translation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
