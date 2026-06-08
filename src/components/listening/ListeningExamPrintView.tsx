"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import {
  paginateExamQuestions,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
const QUESTION_GAP_PX = 12;
const COLUMN_WIDTH_CLASS = "w-[91mm]";

interface ListeningExamPrintViewProps {
  title: string;
  gradeLabel?: string;
  questions: ListeningQuestionData[];
  backHref: string;
  showScript?: boolean;
}

interface PrintMeta {
  examTitle: string;
  gradeLabel: string;
  examDate: string;
  className: string;
  studentNo: string;
  studentName: string;
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
  const [pages, setPages] = useState<ExamPageLayout[] | null>(null);

  const measureRef = useRef<HTMLDivElement>(null);
  const probeFirstRef = useRef<HTMLDivElement>(null);
  const probeNextRef = useRef<HTMLDivElement>(null);

  const meta: PrintMeta = {
    examTitle: examTitle.trim() || title,
    gradeLabel,
    examDate,
    className,
    studentNo,
    studentName,
  };

  useLayoutEffect(() => {
    const measureRoot = measureRef.current;
    const probeFirst = probeFirstRef.current;
    const probeNext = probeNextRef.current;
    if (!measureRoot || !probeFirst || !probeNext) return;

    const firstBody = probeFirst.querySelector<HTMLElement>("[data-body-zone]");
    const nextBody = probeNext.querySelector<HTMLElement>("[data-body-zone]");
    if (!firstBody || !nextBody) return;

    const questionHeights = questions.map((q) => {
      const el = measureRoot.querySelector<HTMLElement>(
        `[data-measure-q="${q.id}"]`
      );
      return el?.offsetHeight ?? 96;
    });

    const layouts = paginateExamQuestions(questionHeights, {
      firstColumnMaxPx: firstBody.clientHeight,
      nextColumnMaxPx: nextBody.clientHeight,
      questionGapPx: QUESTION_GAP_PX,
    });

    setPages(layouts);
  }, [
    questions,
    showScript,
    examTitle,
    gradeLabel,
    examDate,
    className,
    studentNo,
    studentName,
    title,
  ]);

  function handlePrint() {
    const prevTitle = document.title;
    const safeName = studentName.trim() || "학생";
    document.title = `${safeName}_${meta.examTitle}`;
    window.print();
    window.setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  }

  const totalPages = pages?.length ?? 0;

  return (
    <div className="min-h-screen bg-neutral-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-medium text-neutral-700 hover:underline"
            >
              ← 편집으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pages && questions.length > 0}
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              인쇄 / PDF 저장
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-3 text-xs font-semibold text-neutral-500">
              출력 설정
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs text-neutral-600">
                  시험지 제목
                </span>
                <input
                  className="ui-input"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-600">날짜</span>
                <input
                  className="ui-input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-600">반</span>
                <input
                  className="ui-input"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-600">번호</span>
                <input
                  className="ui-input"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs text-neutral-600">이름</span>
                <input
                  className="ui-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              A4 · 2단 · 좌열 채운 뒤 우열 · 넘치면 다음 페이지
              {pages && ` (현재 ${totalPages}페이지)`}
            </p>
          </div>
        </div>
      </div>

      {/* 측정용 (화면 밖) */}
      <div
        ref={measureRef}
        className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
        aria-hidden
      >
        <div className={COLUMN_WIDTH_CLASS}>
          {questions.map((q) => (
            <div key={q.id} data-measure-q={q.id}>
              <ExamQuestionBlock question={q} showScript={showScript} />
            </div>
          ))}
        </div>
      </div>

      <div
        ref={probeFirstRef}
        className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
        aria-hidden
      >
        <ExamSheetPage
          meta={meta}
          pageIndex={0}
          totalPages={1}
          left={[]}
          right={[]}
          questions={questions}
          showScript={showScript}
          measureOnly
        />
      </div>
      <div
        ref={probeNextRef}
        className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
        aria-hidden
      >
        <ExamSheetPage
          meta={meta}
          pageIndex={1}
          totalPages={2}
          left={[]}
          right={[]}
          questions={questions}
          showScript={showScript}
          measureOnly
        />
      </div>

      <div className="mx-auto max-w-[210mm] space-y-6 py-8 print:space-y-0 print:py-0">
        <div id="listening-print-root">
          {questions.length === 0 ? (
            <ExamSheetPage
              meta={meta}
              pageIndex={0}
              totalPages={1}
              left={[]}
              right={[]}
              questions={questions}
              showScript={showScript}
            />
          ) : !pages ? (
            <div className="listening-exam-page listening-exam-sheet mx-auto flex h-[297mm] items-center justify-center text-sm text-neutral-500">
              시험지 레이아웃 계산 중…
            </div>
          ) : (
            pages.map((layout, pageIndex) => (
              <ExamSheetPage
                key={pageIndex}
                meta={meta}
                pageIndex={pageIndex}
                totalPages={pages.length}
                left={layout.left}
                right={layout.right}
                questions={questions}
                showScript={showScript}
                isLastPage={pageIndex === pages.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExamSheetPage({
  meta,
  pageIndex,
  totalPages,
  left,
  right,
  questions,
  showScript,
  isLastPage,
  measureOnly,
}: {
  meta: PrintMeta;
  pageIndex: number;
  totalPages: number;
  left: number[];
  right: number[];
  questions: ListeningQuestionData[];
  showScript: boolean;
  isLastPage?: boolean;
  measureOnly?: boolean;
}) {
  const isFirst = pageIndex === 0;

  return (
    <article
      className={`listening-exam-page listening-exam-sheet relative mx-auto flex h-[297mm] max-h-[297mm] min-h-[297mm] flex-col overflow-hidden bg-white shadow-lg print:shadow-none ${
        !isLastPage && !measureOnly ? "listening-exam-page-break" : ""
      }`}
    >
      {isFirst ? (
        <header className="shrink-0 border-b border-neutral-200 pb-[4mm]">
          <div className="flex items-center gap-[4mm]">
            <div className="shrink-0 rounded-lg bg-neutral-50 p-[2mm] ring-1 ring-neutral-200/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt="학원 로고"
                className="h-[16mm] w-auto max-w-[40mm] object-contain"
              />
            </div>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[7.5pt] font-medium tracking-[0.32em] text-neutral-400">
                E N G L I S H &nbsp; L I S T E N I N G
              </p>
              <h1 className="mt-[1.5mm] text-[14pt] font-bold text-neutral-900">
                {meta.examTitle}
              </h1>
              <p className="mt-[0.5mm] text-[8.5pt] text-neutral-500">
                {meta.gradeLabel}
              </p>
            </div>
            <div className="w-[40mm] shrink-0" aria-hidden />
          </div>

          <table className="mt-[3.5mm] w-full border-collapse text-[8pt]">
            <tbody>
              <tr className="border border-neutral-300">
                <th className="w-[14%] border-r border-neutral-300 bg-neutral-100 px-2 py-1.5 font-semibold text-neutral-600">
                  날짜
                </th>
                <td className="px-3 py-1.5 text-neutral-900" colSpan={5}>
                  {meta.examDate || "\u00a0"}
                </td>
              </tr>
              <tr className="border border-neutral-300 border-t-0">
                <th className="border-r border-neutral-300 bg-neutral-100 px-2 py-1.5 font-semibold text-neutral-600">
                  반
                </th>
                <td className="w-[18%] border-r border-neutral-300 px-2 py-1.5 text-center">
                  {meta.className || "\u00a0"}
                </td>
                <th className="w-[12%] border-r border-neutral-300 bg-neutral-100 px-2 py-1.5 font-semibold text-neutral-600">
                  번호
                </th>
                <td className="w-[12%] border-r border-neutral-300 px-2 py-1.5 text-center">
                  {meta.studentNo || "\u00a0"}
                </td>
                <th className="w-[12%] border-r border-neutral-300 bg-neutral-100 px-2 py-1.5 font-semibold text-neutral-600">
                  이름
                </th>
                <td className="px-2 py-1.5 text-center font-medium">
                  {meta.studentName || "\u00a0"}
                </td>
              </tr>
            </tbody>
          </table>
        </header>
      ) : (
        <header className="shrink-0 border-b border-neutral-200 pb-[2mm] pt-[1mm]">
          <div className="flex items-center justify-between text-[7.5pt] text-neutral-500">
            <span className="font-medium tracking-wide text-neutral-600">
              {meta.examTitle}
            </span>
            <span>
              {pageIndex + 1} / {totalPages}
            </span>
          </div>
        </header>
      )}

      <div
        data-body-zone
        className="grid min-h-0 flex-1 grid-cols-2 gap-x-[6mm] overflow-hidden pt-[3mm]"
      >
        <QuestionColumn
          indices={left}
          questions={questions}
          showScript={showScript}
        />
        <QuestionColumn
          indices={right}
          questions={questions}
          showScript={showScript}
          divided
        />
      </div>

      <footer className="shrink-0 border-t border-neutral-200 py-[2mm] text-center text-[7pt] text-neutral-400">
        {isLastPage && !measureOnly ? (
          <span className="tracking-[0.3em]">— 끝 —</span>
        ) : (
          <span>
            {pageIndex + 1} / {totalPages}
          </span>
        )}
      </footer>
    </article>
  );
}

function QuestionColumn({
  indices,
  questions,
  showScript,
  divided,
}: {
  indices: number[];
  questions: ListeningQuestionData[];
  showScript: boolean;
  divided?: boolean;
}) {
  return (
    <div
      className={`min-h-0 space-y-[3mm] ${divided ? "border-l border-neutral-200 pl-[4mm]" : "pr-[1mm]"}`}
    >
      {indices.map((qi) => (
        <ExamQuestionBlock
          key={questions[qi].id}
          question={questions[qi]}
          showScript={showScript}
        />
      ))}
    </div>
  );
}

function ExamQuestionBlock({
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
    <section className="text-[8.5pt] leading-[1.6] text-neutral-900">
      <p className="text-justify">
        <span className="mr-[1mm] font-bold tabular-nums">{q.order_index}</span>
        {headline}
      </p>
      {passageText && instruction && (
        <p className="mt-[0.8mm] text-justify text-neutral-700">{passageText}</p>
      )}
      <ul className="mt-[1.2mm] space-y-[0.3mm]">
        {q.choices.map((choice, i) => (
          <li key={i} className="flex gap-[1mm] text-justify">
            <span className="shrink-0 text-neutral-500">
              {CIRCLED[i] ?? `${i + 1}.`}
            </span>
            <span>{choice}</span>
          </li>
        ))}
      </ul>
      {showScript && q.segments.length > 0 && (
        <div className="mt-[1.5mm] border-l-2 border-neutral-200 pl-[2mm] text-[7.5pt] leading-snug text-neutral-600">
          {q.segments.map((seg) => (
            <p key={seg.id}>
              <span className="font-medium">{seg.speaker_type}:</span> {seg.text}
            </p>
          ))}
          {q.script_translation && (
            <p className="mt-[0.8mm] italic text-neutral-500">
              {q.script_translation}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
