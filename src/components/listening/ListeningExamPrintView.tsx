"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
const ACCENT = "#7f1d1d";

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

  function handlePrint() {
    const prevTitle = document.title;
    const safeName = studentName.trim() || "학생";
    document.title = `${safeName}_${examTitle.trim() || title}`;
    window.print();
    window.setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  }

  const displayTitle = examTitle.trim() || title;

  return (
    <div className="min-h-screen bg-stone-300/60 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-medium text-rose-900 hover:underline"
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
                  placeholder="예: 중2-A"
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
              A4 · 2단(열) · 내용이 넘치면 자동으로 다음 페이지로 이어집니다.
              {showScript && " (대본 포함)"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] py-8 print:py-0">
        <article
          id="listening-print-root"
          className="listening-exam-page listening-exam-sheet relative mx-auto shadow-xl print:shadow-none"
        >
          <div
            className="pointer-events-none absolute inset-x-[11mm] top-[9mm] h-[0.6pt]"
            style={{ backgroundColor: ACCENT }}
            aria-hidden
          />

          <header className="mb-[5mm] border-b border-stone-300 pb-[4mm]">
            <div className="flex items-start gap-[5mm]">
              <div className="shrink-0 rounded-md bg-white p-[1.5mm] ring-1 ring-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SRC}
                  alt="학원 로고"
                  className="h-[18mm] w-auto max-w-[44mm] object-contain"
                />
              </div>

              <div className="min-w-0 flex-1 text-center">
                <p
                  className="text-[8pt] font-medium tracking-[0.42em] text-stone-500"
                  style={{ letterSpacing: "0.38em" }}
                >
                  ENGLISH LISTENING
                </p>
                <h1 className="mt-[2mm] text-[15pt] font-bold leading-tight tracking-tight text-stone-900">
                  {displayTitle}
                </h1>
                <p className="mt-[1mm] text-[9pt] text-stone-600">{gradeLabel}</p>
              </div>

              <div className="w-[44mm] shrink-0" aria-hidden />
            </div>

            <div className="mt-[4mm] overflow-hidden rounded border border-stone-300 text-[8.5pt]">
              <div className="grid grid-cols-[18mm_1fr] border-b border-stone-200 bg-stone-50/80">
                <div
                  className="border-r border-stone-200 px-2 py-1.5 text-center text-[7.5pt] font-bold text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  날짜
                </div>
                <div className="px-3 py-1.5 font-medium text-stone-800">
                  {examDate || "\u00a0"}
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-stone-200 bg-white">
                <MetaField label="반" value={className} />
                <MetaField label="번호" value={studentNo} />
                <MetaField label="이름" value={studentName} emphasize />
              </div>
            </div>
          </header>

          {questions.length === 0 ? (
            <p className="py-24 text-center text-[10pt] text-stone-500">
              출력할 문항이 없습니다.
            </p>
          ) : (
            <div className="listening-exam-columns">
              {questions.map((q) => (
                <ExamQuestion key={q.id} question={q} showScript={showScript} />
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <p className="listening-exam-end mt-[6mm] border-t border-stone-200 pt-[3mm] text-center text-[8pt] tracking-[0.35em] text-stone-400">
              — 끝 —
            </p>
          )}
        </article>
      </div>
    </div>
  );
}

function MetaField({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <div
        className="border-b border-stone-100 px-2 py-0.5 text-center text-[7pt] font-bold text-white"
        style={{ backgroundColor: ACCENT }}
      >
        {label}
      </div>
      <div
        className={`min-h-[8mm] px-2 py-1.5 text-center text-stone-800 ${emphasize ? "font-semibold" : ""}`}
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
  const instruction = q.instruction?.trim();
  const headline = instruction || passageText || "듣기 문항";

  return (
    <section className="listening-exam-q text-[8.5pt] leading-[1.58] text-stone-900">
      <p className="text-justify">
        <span className="mr-[1mm] font-bold text-stone-900">{q.order_index}</span>
        <span>{headline}</span>
      </p>

      {passageText && instruction && (
        <p className="mt-[1mm] text-justify text-[8.5pt] text-stone-700">
          {passageText}
        </p>
      )}

      <ul className="mt-[1.5mm] space-y-[0.4mm] pl-[2mm]">
        {q.choices.map((choice, i) => (
          <li key={i} className="flex gap-[1.5mm] text-[8.5pt]">
            <span className="shrink-0 text-stone-600">
              {CIRCLED[i] ?? `${i + 1}.`}
            </span>
            <span className="text-justify">{choice}</span>
          </li>
        ))}
      </ul>

      {showScript && q.segments.length > 0 && (
        <div className="mt-[2mm] rounded border border-dashed border-stone-300 bg-stone-50 px-[2mm] py-[1.5mm] text-[7.5pt] leading-snug text-stone-600">
          {q.segments.map((seg) => (
            <p key={seg.id}>
              <span className="font-semibold">{seg.speaker_type}:</span> {seg.text}
            </p>
          ))}
          {q.script_translation && (
            <p className="mt-[1mm] border-t border-stone-200 pt-[1mm] italic text-stone-500">
              {q.script_translation}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
