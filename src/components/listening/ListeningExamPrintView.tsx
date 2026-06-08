"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

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

function splitIntoTwoPages<T>(items: T[]): [T[], T[]] {
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

  const [page1, page2] = useMemo(
    () => splitIntoTwoPages(questions),
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

  const pages: { pageNum: number; items: ListeningQuestionData[] }[] =
    questions.length === 0
      ? [{ pageNum: 1, items: [] }]
      : [
          { pageNum: 1, items: page1 },
          { pageNum: 2, items: page2 },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              ← 편집으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152a45]"
            >
              인쇄 / PDF 저장
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              출력 설정
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs font-medium text-slate-600">
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
                <span className="mb-1 block text-xs font-medium text-slate-600">
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
                <span className="mb-1 block text-xs font-medium text-slate-600">
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
                <span className="mb-1 block text-xs font-medium text-slate-600">
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
                <span className="mb-1 block text-xs font-medium text-slate-600">
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
            <p className="mt-3 text-xs text-slate-500">
              문항 {questions.length}개 · 2쪽(A4)으로 나뉘어 출력됩니다.
              {showScript && " 대본이 포함됩니다."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] space-y-8 py-8 print:space-y-0 print:py-0">
        <div id="listening-print-root" className="space-y-8 print:space-y-0">
          {pages.map((page) => (
            <ExamPage
              key={page.pageNum}
              pageNum={page.pageNum}
              totalPages={pages.length}
              examTitle={examTitle.trim() || title}
              gradeLabel={gradeLabel}
              examDate={examDate}
              className={className}
              studentNo={studentNo}
              studentName={studentName}
              questions={page.items}
              showScript={showScript}
              isLastPage={page.pageNum === pages.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamPage({
  pageNum,
  totalPages,
  examTitle,
  gradeLabel,
  examDate,
  className,
  studentNo,
  studentName,
  questions,
  showScript,
  isLastPage,
}: {
  pageNum: number;
  totalPages: number;
  examTitle: string;
  gradeLabel: string;
  examDate: string;
  className: string;
  studentNo: string;
  studentName: string;
  questions: ListeningQuestionData[];
  showScript: boolean;
  isLastPage: boolean;
}) {
  return (
    <article
      className={`listening-exam-page relative mx-auto box-border w-[210mm] min-h-[297mm] overflow-hidden bg-white shadow-lg print:shadow-none ${
        !isLastPage ? "listening-exam-page-break" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28mm] bg-gradient-to-r from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f]"
        aria-hidden
      />

      <div className="relative flex h-full flex-col px-[14mm] pb-[12mm] pt-[10mm]">
        <header className="text-center">
          <div className="mx-auto flex h-[18mm] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt={ACADEMY_NAME}
              className="h-[14mm] w-auto max-w-[70mm] object-contain drop-shadow-sm"
            />
          </div>
          <p className="mt-1 text-[9pt] font-semibold tracking-[0.2em] text-[#1e3a5f]">
            {ACADEMY_NAME}
          </p>

          <div className="mx-auto mt-3 flex max-w-[140mm] items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1e3a5f]/40 to-transparent" />
            <span className="text-[7.5pt] font-bold uppercase tracking-[0.35em] text-slate-500">
              Listening
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1e3a5f]/40 to-transparent" />
          </div>

          <h1 className="mt-3 text-[15pt] font-bold leading-snug text-slate-900">
            {examTitle}
          </h1>
          <p className="mt-1 text-[9.5pt] text-slate-600">
            영어 듣기 능력 평가 · {gradeLabel}
          </p>

          <div className="mx-auto mt-4 grid max-w-[168mm] grid-cols-4 overflow-hidden rounded-lg border border-[#1e3a5f]/25 text-[9pt]">
            <MetaCell label="날짜" value={examDate || " "} />
            <MetaCell label="반" value={className || " "} />
            <MetaCell label="번호" value={studentNo || " "} />
            <MetaCell label="이름" value={studentName || " "} emphasize />
          </div>
        </header>

        <div className="mt-5 flex-1 border-t border-slate-200/80 pt-5">
          {questions.length === 0 && pageNum === 1 ? (
            <p className="py-16 text-center text-[10pt] text-slate-500">
              출력할 문항이 없습니다.
            </p>
          ) : questions.length > 0 ? (
            <ol className="space-y-5" start={questions[0]?.order_index}>
              {questions.map((q) => (
                <ExamQuestion
                  key={q.id}
                  question={q}
                  showScript={showScript}
                />
              ))}
            </ol>
          ) : null}
        </div>

        <footer className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3 text-[8pt] text-slate-500">
          <span className="font-medium text-[#1e3a5f]/70">{ACADEMY_NAME}</span>
          <span>
            {pageNum} / {totalPages}
          </span>
        </footer>
      </div>

      <div
        className="pointer-events-none absolute inset-[6mm] rounded-sm border border-[#1e3a5f]/10"
        aria-hidden
      />
    </article>
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
    <div className="border-r border-[#1e3a5f]/15 last:border-r-0">
      <div className="bg-[#1e3a5f]/[0.06] px-2 py-1 text-[7.5pt] font-bold text-[#1e3a5f]">
        {label}
      </div>
      <div
        className={`px-2 py-1.5 text-slate-800 ${emphasize ? "font-semibold" : ""}`}
      >
        {value}
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
  const headline =
    q.instruction?.trim() || passageText || "듣기 문항";

  return (
    <li className="break-inside-avoid text-[10pt] leading-[1.65] text-slate-900">
      <div className="flex gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-[9pt] font-bold text-white">
          {q.order_index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{headline}</p>
          {passageText && q.instruction?.trim() && (
            <p className="mt-1.5 whitespace-pre-wrap border-l-2 border-[#1e3a5f]/25 pl-3 text-[9.5pt] text-slate-700">
              {passageText}
            </p>
          )}
          <ul className="mt-2.5 grid gap-1 sm:grid-cols-1">
            {q.choices.map((choice, i) => (
              <li
                key={i}
                className="flex gap-1.5 rounded-md bg-slate-50/80 px-2 py-1 text-[9.5pt]"
              >
                <span className="shrink-0 font-medium text-[#1e3a5f]">
                  {CIRCLED[i] ?? `${i + 1}.`}
                </span>
                <span>{choice}</span>
              </li>
            ))}
          </ul>
          {showScript && q.segments.length > 0 && (
            <div className="mt-2.5 rounded-md border border-dashed border-slate-300 bg-slate-50/50 px-3 py-2 text-[8.5pt] text-slate-600">
              <p className="mb-1 text-[7.5pt] font-bold uppercase tracking-wider text-slate-400">
                Script
              </p>
              {q.segments.map((seg) => (
                <p key={seg.id} className="leading-relaxed">
                  <span className="font-semibold text-slate-700">
                    {seg.speaker_type}:
                  </span>{" "}
                  {seg.text}
                </p>
              ))}
              {q.script_translation && (
                <p className="mt-1.5 border-t border-slate-200 pt-1.5 italic text-slate-500">
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
