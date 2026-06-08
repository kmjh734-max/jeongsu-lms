"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ListeningPrintQrCode } from "@/components/listening/ListeningPrintQrCode";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import { buildStudentListeningHubUrl } from "@/lib/listening/listen-url";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { ListeningTableData } from "@/lib/listening/types";
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
  setId: string;
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
  setId,
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
  const listenUrl = buildStudentListeningHubUrl(setId);

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
        firstColumnMaxPx: firstBody.clientHeight,
        nextColumnMaxPx: nextBody.clientHeight,
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
    setId,
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
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className="text-sm font-medium text-slate-700 hover:underline"
            >
              ← 편집으로 돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!pages && questions.length > 0}
              className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              인쇄 / PDF 저장
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
            <p className="mb-3 text-xs font-semibold text-sky-700">출력 설정</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs text-slate-600">
                  시험지 제목
                </span>
                <input
                  className="ui-input"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">날짜</span>
                <input
                  className="ui-input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-600">반</span>
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
            <p className="mt-3 text-xs text-slate-500">
              A4 2단 · 보기 한 줄씩 · QR로 전체/문항별 듣기
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
        <div className={COLUMN_WIDTH_CLASS}>
          {questions.map((q) => (
            <div key={q.id} data-measure-q={q.id} className="mb-[3mm]">
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
          listenUrl={listenUrl}
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
              listenUrl={listenUrl}
              pageIndex={0}
              totalPages={1}
              left={[]}
              right={[]}
              questions={questions}
              showScript={showScript}
            />
          ) : !pages ? (
            <div className="listening-exam-page listening-exam-sheet mx-auto flex h-[297mm] items-center justify-center text-sm text-slate-500">
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
  listenUrl,
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
  listenUrl: string;
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
        <header className="shrink-0">
          <div className="listening-exam-chevron-band -mx-[11mm] mb-[3mm] px-[11mm] pb-[3mm] pt-[2.5mm]">
            <div className="flex items-center gap-[3mm]">
              <div className="flex shrink-0 items-center rounded-lg bg-white/90 px-[2mm] py-[1.5mm] shadow-sm ring-1 ring-sky-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SRC}
                  alt="학원 로고"
                  className="h-[12mm] w-auto max-w-[32mm] object-contain"
                />
              </div>

              <div className="listening-exam-ribbon flex min-w-0 flex-1 items-center gap-[2.5mm] py-[2mm] pl-[3mm] pr-[6mm] text-white">
                <span className="shrink-0 rounded bg-white/95 px-[2mm] py-[0.5mm] text-[7pt] font-extrabold tracking-wide text-sky-700">
                  LISTENING
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-[11pt] font-extrabold leading-tight">
                    {meta.examTitle}
                  </h1>
                  <p className="text-[7pt] font-semibold text-sky-50/95">
                    {meta.gradeLabel}
                  </p>
                </div>
              </div>

              <div className="flex w-[24mm] shrink-0 flex-col items-center rounded-lg bg-white/95 px-[1mm] py-[1.5mm] shadow-sm ring-1 ring-sky-200">
                <ListeningPrintQrCode url={listenUrl} sizePx={72} />
                <p className="mt-[0.5mm] text-[6pt] font-bold text-sky-800">
                  듣기 QR
                </p>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse overflow-hidden rounded-lg border border-sky-200 text-[8pt]">
            <tbody>
              <tr>
                <th className="w-[12%] border-r border-sky-200 bg-sky-100 px-2 py-1.5 font-bold text-sky-900">
                  날짜
                </th>
                <td
                  colSpan={5}
                  className="bg-white px-3 py-1.5 font-semibold text-slate-900"
                >
                  {meta.examDate || "\u00a0"}
                </td>
              </tr>
              <tr className="border-t border-sky-200">
                <th className="border-r border-sky-200 bg-sky-100 px-2 py-1.5 font-bold text-sky-900">
                  반
                </th>
                <td className="w-[14%] border-r border-sky-100 bg-white px-2 py-1.5 text-center font-semibold text-slate-900">
                  {meta.className || "\u00a0"}
                </td>
                <th className="w-[10%] border-r border-sky-200 bg-sky-100 px-2 py-1.5 font-bold text-sky-900">
                  번호
                </th>
                <td className="w-[10%] border-r border-sky-100 bg-white px-2 py-1.5 text-center font-semibold text-slate-900">
                  {meta.studentNo || "\u00a0"}
                </td>
                <th className="w-[10%] border-r border-sky-200 bg-sky-100 px-2 py-1.5 font-bold text-sky-900">
                  이름
                </th>
                <td className="bg-white px-2 py-1.5 text-center font-bold text-slate-900">
                  {meta.studentName || "\u00a0"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-[2.5mm] rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 px-[3mm] py-[2mm] text-[7.5pt] leading-snug text-sky-900">
            <span className="font-bold text-sky-700">▶ 듣기 안내</span> QR
            스캔 후{" "}
            <span className="font-semibold text-sky-800">전체 듣기</span> 또는{" "}
            <span className="font-semibold text-sky-800">문항별 듣기</span>를
            선택하세요. 아래 문항은{" "}
            <span className="font-semibold">위에서 아래</span>로 진행합니다.
          </div>
        </header>
      ) : (
        <header className="shrink-0 border-b border-sky-200 pb-[2mm] pt-[1mm]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-[2mm]">
              <span className="shrink-0 rounded bg-sky-500 px-[2mm] py-[0.3mm] text-[6.5pt] font-bold text-white">
                LISTENING
              </span>
              <span className="truncate text-[7.5pt] font-bold text-slate-800">
                {meta.examTitle}
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[7pt] font-semibold text-sky-800">
              {pageIndex + 1} / {totalPages}
            </span>
          </div>
        </header>
      )}

      <div
        data-body-zone
        className="min-h-0 flex-1 overflow-hidden pt-[2mm]"
      >
        <div className="grid h-full grid-cols-2 gap-x-[4mm]">
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
      </div>

      <footer className="shrink-0 border-t border-sky-200 py-[1.5mm] text-center text-[7pt] font-medium text-sky-700/80">
        {isLastPage && !measureOnly ? (
          <span className="tracking-[0.25em]">— 끝 —</span>
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
      className={`min-h-0 space-y-[2.5mm] ${divided ? "border-l border-sky-200 pl-[3.5mm]" : "pr-[0.5mm]"}`}
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
    q.question_text,
    { forStudent: true }
  );
  const instruction = q.instruction?.trim();
  const numLabel = String(q.order_index).padStart(2, "0");
  const table = normalizeTableData(q.table_data);

  return (
    <section className="text-[8.5pt] leading-[1.55] text-slate-900">
      <div className="flex items-start gap-[2mm]">
        <span className="mt-[0.3mm] flex h-[5.5mm] w-[5.5mm] shrink-0 items-center justify-center rounded-sm bg-sky-500 text-[7pt] font-extrabold leading-none text-white">
          {numLabel}
        </span>
        <div className="min-w-0 flex-1">
          {instruction && (
            <p className="font-bold leading-snug text-slate-900">{instruction}</p>
          )}

          {passageText && passageText !== instruction && (
            <p className="mt-[0.6mm] leading-snug text-slate-800">
              {passageText}
            </p>
          )}

          {!instruction && !passageText && (
            <p className="font-bold text-slate-900">듣기 문항</p>
          )}

          {table && <ExamPrintTable table={table} />}

          <ul className="mt-[1.2mm] list-none space-y-[0.6mm] pl-0">
            {q.choices.map((choice, i) => (
              <li key={i} className="flex gap-[1.5mm] leading-snug">
                <span className="w-[4mm] shrink-0 font-semibold text-sky-700">
                  {CIRCLED[i] ?? `${i + 1}.`}
                </span>
                <span className="min-w-0 flex-1 break-words text-slate-900">
                  {choice}
                </span>
              </li>
            ))}
          </ul>

          {showScript && q.segments.length > 0 && (
            <div className="mt-[1.2mm] rounded-md border border-sky-100 bg-sky-50/70 px-[2mm] py-[1.5mm] text-[7.5pt] leading-snug text-slate-700">
              {q.segments.map((seg) => (
                <p key={seg.id}>
                  <span className="font-bold text-sky-800">{seg.speaker_type}:</span>{" "}
                  {seg.text}
                </p>
              ))}
              {q.script_translation && (
                <p className="mt-[0.8mm] italic text-slate-600">
                  {q.script_translation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** 14번(표 정보 불일치) 등 — 학생용 시험지(정답 표시 없음) */
function ExamPrintTable({ table }: { table: ListeningTableData }) {
  return (
    <div className="mt-[1.2mm] overflow-hidden rounded border border-sky-300 text-[7pt] leading-[1.35]">
      <p className="border-b border-sky-200 bg-sky-50 px-[1.5mm] py-[0.8mm] font-bold text-slate-900">
        {table.title}
      </p>
      <table className="w-full border-collapse">
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.no} className="border-t border-sky-100">
              <td className="w-[5mm] px-[1mm] py-[0.5mm] align-top font-bold text-sky-800">
                {CIRCLED[row.no - 1] ?? row.no}
              </td>
              <td className="w-[15mm] px-[1mm] py-[0.5mm] align-top font-semibold text-slate-800">
                {row.label}
              </td>
              <td className="px-[1mm] py-[0.5mm] align-top text-slate-900">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
