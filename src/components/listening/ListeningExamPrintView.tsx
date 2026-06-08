"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ListeningPrintQrCode } from "@/components/listening/ListeningPrintQrCode";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import {
  paginateExamQuestions,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
const QUESTION_GAP_PX = 14;
/** A4 본문 단 너비 (210mm - 좌우 패딩 11mm×2) */
const CONTENT_WIDTH_CLASS = "w-[188mm]";

interface ListeningExamPrintViewProps {
  title: string;
  gradeLabel?: string;
  questions: ListeningQuestionData[];
  backHref: string;
  showScript?: boolean;
  listenUrl: string;
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
  listenUrl,
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

    setPages(
      paginateExamQuestions(questionHeights, {
        firstPageMaxPx: firstBody.clientHeight,
        nextPageMaxPx: nextBody.clientHeight,
        questionGapPx: QUESTION_GAP_PX,
      })
    );
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
              A4 1단 · 보기 한 줄씩 · QR 듣기 · 넘치면 다음 페이지
              {pages && ` (${totalPages}페이지)`}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={measureRef}
        className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
        aria-hidden
      >
        <div className={CONTENT_WIDTH_CLASS}>
          {questions.map((q) => (
            <div key={q.id} data-measure-q={q.id} className="mb-[3.5mm]">
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
          listenUrl={listenUrl}
          pageIndex={0}
          totalPages={1}
          items={[]}
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
          listenUrl={listenUrl}
          pageIndex={1}
          totalPages={2}
          items={[]}
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
              listenUrl={listenUrl}
              pageIndex={0}
              totalPages={1}
              items={[]}
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
                listenUrl={listenUrl}
                pageIndex={pageIndex}
                totalPages={pages.length}
                items={layout.items}
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
  listenUrl,
  pageIndex,
  totalPages,
  items,
  questions,
  showScript,
  isLastPage,
  measureOnly,
}: {
  meta: PrintMeta;
  listenUrl: string;
  pageIndex: number;
  totalPages: number;
  items: number[];
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
        <header className="shrink-0 pb-[3mm]">
          <div className="flex items-stretch gap-[3mm]">
            <div className="flex shrink-0 flex-col justify-center">
              <div className="rounded-xl bg-white p-[2mm] shadow-sm ring-1 ring-blue-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SRC}
                  alt="학원 로고"
                  className="h-[14mm] w-auto max-w-[36mm] object-contain"
                />
              </div>
            </div>

            <div
              className="flex min-w-0 flex-1 flex-col justify-center rounded-r-2xl px-[4mm] py-[2.5mm] text-white shadow-[0_3px_12px_rgba(47,111,184,0.35)]"
              style={{
                background:
                  "linear-gradient(135deg, #6ba8eb 0%, #4a8fd4 45%, #2f6fb8 100%)",
              }}
            >
              <p className="text-[7pt] font-semibold tracking-[0.25em] text-blue-50/90">
                ENGLISH LISTENING
              </p>
              <h1 className="mt-[1mm] text-[13pt] font-bold leading-tight">
                {meta.examTitle}
              </h1>
              <p className="mt-[0.5mm] text-[8pt] text-blue-50/90">
                {meta.gradeLabel}
              </p>
            </div>

            <div className="flex w-[26mm] shrink-0 flex-col items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white px-[1.5mm] py-[2mm] text-center shadow-sm">
              <ListeningPrintQrCode url={listenUrl} sizePx={84} />
              <p className="mt-[1mm] text-[6.5pt] font-bold text-blue-800">
                듣기 QR
              </p>
            </div>
          </div>

          <table className="mt-[3mm] w-full border-collapse overflow-hidden rounded-lg border border-slate-300 text-[8pt] shadow-sm">
            <tbody>
              <tr>
                <th className="w-[12%] border-r border-slate-300 bg-slate-100 px-2 py-1.5 font-bold text-slate-600">
                  날짜
                </th>
                <td className="bg-white px-3 py-1.5 font-medium text-slate-900">
                  {meta.examDate || "\u00a0"}
                </td>
              </tr>
              <tr className="border-t border-slate-300">
                <th className="border-r border-slate-300 bg-slate-100 px-2 py-1.5 font-bold text-slate-600">
                  반
                </th>
                <td className="border-r border-slate-200 bg-white px-2 py-1.5 text-center">
                  {meta.className || "\u00a0"}
                </td>
                <th className="w-[10%] border-r border-slate-300 bg-slate-100 px-2 py-1.5 font-bold text-slate-600">
                  번호
                </th>
                <td className="w-[10%] border-r border-slate-200 bg-white px-2 py-1.5 text-center">
                  {meta.studentNo || "\u00a0"}
                </td>
                <th className="w-[10%] border-r border-slate-300 bg-slate-100 px-2 py-1.5 font-bold text-slate-600">
                  이름
                </th>
                <td className="bg-white px-2 py-1.5 text-center font-semibold">
                  {meta.studentName || "\u00a0"}
                </td>
              </tr>
            </tbody>
          </table>
        </header>
      ) : (
        <header className="shrink-0 border-b border-dotted border-slate-300 pb-[2mm] pt-[1mm]">
          <div className="flex items-center justify-between text-[7.5pt]">
            <span className="font-semibold text-slate-600">{meta.examTitle}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
              {pageIndex + 1} / {totalPages}
            </span>
          </div>
        </header>
      )}

      <div
        data-body-zone
        className="min-h-0 flex-1 overflow-hidden pt-[2.5mm]"
      >
        <div className="space-y-[3.5mm]">
          {items.map((qi) => (
            <ExamQuestionBlock
              key={questions[qi].id}
              question={questions[qi]}
              showScript={showScript}
            />
          ))}
        </div>
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

function ExamQuestionBlock({
  question: q,
  showScript,
}: {
  question: ListeningQuestionData;
  showScript: boolean;
}) {
  const passageText = displayQuestionTextForOrder(
    q.order_index,
    q.question_text,
    { forStudent: true }
  );
  const instruction = q.instruction?.trim();
  const numLabel = String(q.order_index).padStart(2, "0");

  return (
    <section className="text-[8.5pt] leading-[1.6] text-slate-900">
      <div className="flex items-end gap-[2mm]">
        <span className="pb-[0.5mm] text-[15pt] font-extralight leading-none text-slate-300">
          {numLabel}
        </span>
        <div className="mb-[1.5mm] flex-1 border-b border-dotted border-slate-300" />
      </div>

      {instruction && (
        <p className="mt-[1mm] font-bold leading-snug text-slate-900">
          {instruction}
        </p>
      )}

      {passageText && passageText !== instruction && (
        <p className="mt-[1mm] leading-snug text-slate-800">{passageText}</p>
      )}

      {!instruction && !passageText && (
        <p className="mt-[1mm] font-bold text-slate-900">듣기 문항</p>
      )}

      <ul className="mt-[2mm] list-none space-y-[1mm] pl-0">
        {q.choices.map((choice, i) => (
          <li key={i} className="flex gap-[2mm] leading-snug">
            <span className="w-[4mm] shrink-0 text-slate-600">
              {CIRCLED[i] ?? `${i + 1}.`}
            </span>
            <span className="min-w-0 flex-1 break-words">{choice}</span>
          </li>
        ))}
      </ul>

      {showScript && q.segments.length > 0 && (
        <div className="mt-[2mm] rounded-md border border-dashed border-slate-300 bg-slate-50 px-[2mm] py-[1.5mm] text-[7.5pt] leading-snug text-slate-600">
          {q.segments.map((seg) => (
            <p key={seg.id}>
              <span className="font-semibold text-slate-700">
                {seg.speaker_type}:
              </span>{" "}
              {seg.text}
            </p>
          ))}
          {q.script_translation && (
            <p className="mt-[1mm] italic text-slate-500">
              {q.script_translation}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
