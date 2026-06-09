"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ListeningPrintQrCode } from "@/components/listening/ListeningPrintQrCode";
import { LOGO_SRC } from "@/lib/branding";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import { buildStudentListeningHubUrl } from "@/lib/listening/listen-url";
import {
  isStandardTwentyQuestionExam,
  paginateExamQuestions,
  paginateStandardTwentyExam,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { ListeningTableData } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
const QUESTION_GAP_PX = 12;
const COLUMN_WIDTH_CLASS = "w-[91mm]";

type PrintScope = "exam" | "answers" | "all";

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

function answerLabel(correctAnswer: number): string {
  const idx = correctAnswer - 1;
  return CIRCLED[idx] ?? String(correctAnswer);
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
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [pages, setPages] = useState<ExamPageLayout[] | null>(null);

  const measureRef = useRef<HTMLDivElement>(null);
  const probeFirstRef = useRef<HTMLDivElement>(null);
  const probeNextRef = useRef<HTMLDivElement>(null);
  const listenUrl = buildStudentListeningHubUrl(setId);

  const useFixedTwentyLayout = isStandardTwentyQuestionExam(questions.length);
  const evenSpacing = useFixedTwentyLayout;

  const meta: PrintMeta = {
    examTitle: examTitle.trim() || title,
    gradeLabel,
    examDate,
    className,
    studentNo,
    studentName,
  };

  const resolvedPages = useMemo(() => {
    if (useFixedTwentyLayout) return paginateStandardTwentyExam();
    return pages;
  }, [useFixedTwentyLayout, pages]);

  useLayoutEffect(() => {
    if (useFixedTwentyLayout) return;

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
    useFixedTwentyLayout,
  ]);

  function runPrint(scope: PrintScope) {
    const prevTitle = document.title;
    const safeName = studentName.trim() || "학생";
    const suffix =
      scope === "answers" ? "_정답지" : scope === "exam" ? "" : "_전체";
    document.title = `${safeName}_${meta.examTitle}${suffix}`;

    const body = document.body;
    body.classList.remove(
      "listening-print-exam-only",
      "listening-print-answers-only"
    );
    if (scope === "exam") body.classList.add("listening-print-exam-only");
    if (scope === "answers") body.classList.add("listening-print-answers-only");

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = prevTitle;
        body.classList.remove(
          "listening-print-exam-only",
          "listening-print-answers-only"
        );
      }, 500);
    }, 80);
  }

  const totalPages = resolvedPages?.length ?? 0;
  const layoutReady = useFixedTwentyLayout || pages !== null;

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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runPrint("exam")}
                disabled={!layoutReady && questions.length > 0}
                className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                시험지 인쇄
              </button>
              <button
                type="button"
                onClick={() => runPrint("answers")}
                disabled={questions.length === 0}
                className="rounded-lg border border-sky-300 bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 disabled:opacity-50"
              >
                답지 인쇄
              </button>
              <button
                type="button"
                onClick={() => runPrint("all")}
                disabled={!layoutReady && questions.length > 0}
                className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                시험지+답지
              </button>
            </div>
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
              <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="rounded border-sky-300"
                />
                <span className="text-sm text-slate-700">
                  미리보기에 정답지 페이지 표시
                </span>
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {useFixedTwentyLayout
                ? "20문항 · 2페이지 균등 배치 (좌1~5·우6~10 / 좌11~15·우16~20)"
                : "A4 2단 · 보기 한 줄씩 · QR 듣기"}
              {resolvedPages && ` · 시험지 ${totalPages}페이지`}
            </p>
          </div>
        </div>
      </div>

      {!useFixedTwentyLayout && (
        <>
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
              evenSpacing={false}
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
              evenSpacing={false}
              measureOnly
            />
          </div>
        </>
      )}

      <div className="mx-auto max-w-[210mm] space-y-6 py-8 print:space-y-0 print:py-0">
        <div id="listening-print-root">
          <div className="exam-print-exam">
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
                evenSpacing={false}
              />
            ) : !layoutReady ? (
              <div className="listening-exam-page listening-exam-sheet mx-auto flex h-[297mm] items-center justify-center text-sm text-slate-500">
                시험지 레이아웃 계산 중…
              </div>
            ) : (
              resolvedPages!.map((layout, pageIndex) => (
                <ExamSheetPage
                  key={pageIndex}
                  meta={meta}
                  listenUrl={listenUrl}
                  pageIndex={pageIndex}
                  totalPages={resolvedPages!.length}
                  left={layout.left}
                  right={layout.right}
                  questions={questions}
                  showScript={showScript}
                  evenSpacing={evenSpacing}
                  isLastPage={pageIndex === resolvedPages!.length - 1}
                />
              ))
            )}
          </div>

          {questions.length > 0 && (
            <div
              className={
                includeAnswerKey
                  ? "exam-print-answers"
                  : "exam-print-answers hidden print:block"
              }
            >
              <ExamAnswerKeyPages meta={meta} questions={questions} />
            </div>
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
  evenSpacing,
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
  evenSpacing: boolean;
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
            선택하세요.
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
            evenSpacing={evenSpacing}
          />
          <QuestionColumn
            indices={right}
            questions={questions}
            showScript={showScript}
            evenSpacing={evenSpacing}
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
  evenSpacing,
  divided,
}: {
  indices: number[];
  questions: ListeningQuestionData[];
  showScript: boolean;
  evenSpacing: boolean;
  divided?: boolean;
}) {
  const borderClass = divided
    ? "border-l border-sky-200 pl-[3.5mm]"
    : "pr-[0.5mm]";

  if (evenSpacing) {
    return (
      <div className={`flex h-full min-h-0 flex-col ${borderClass}`}>
        {indices.map((qi, i) => {
          const hasTable = !!normalizeTableData(questions[qi].table_data);
          return (
            <div
              key={questions[qi].id}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="shrink-0 pt-[0.5mm]">
                <ExamQuestionBlock
                  question={questions[qi]}
                  showScript={showScript}
                  compact
                  tableCompact={hasTable}
                />
              </div>
              {i < indices.length - 1 ? (
                <div
                  aria-hidden
                  className="mt-[1mm] min-h-[2mm] flex-1 border-b border-sky-100/90"
                />
              ) : (
                <div className="min-h-0 flex-1" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`min-h-0 space-y-[2.5mm] ${borderClass}`}>
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
  compact,
  tableCompact,
}: {
  question: ListeningQuestionData;
  showScript: boolean;
  compact?: boolean;
  tableCompact?: boolean;
}) {
  const passageText = displayQuestionTextForOrder(
    q.order_index,
    q.question_text,
    { forStudent: true }
  );
  const instruction = q.instruction?.trim();
  const numLabel = String(q.order_index).padStart(2, "0");
  const table = normalizeTableData(q.table_data);
  const textSize = tableCompact
    ? "text-[7.5pt]"
    : compact
      ? "text-[8pt]"
      : "text-[8.5pt]";

  return (
    <section
      className={`${textSize} leading-[1.45] text-slate-900 ${
        tableCompact ? "leading-snug" : ""
      }`}
    >
      <div className="flex items-start gap-[2mm]">
        <span className="mt-[0.3mm] flex h-[5mm] w-[5mm] shrink-0 items-center justify-center rounded-sm bg-sky-500 text-[6.5pt] font-extrabold leading-none text-white">
          {numLabel}
        </span>
        <div className="min-w-0 flex-1">
          {instruction && (
            <p className="font-bold leading-snug text-slate-900">{instruction}</p>
          )}

          {passageText && passageText !== instruction && (
            <p className="mt-[0.5mm] leading-snug text-slate-800">
              {passageText}
            </p>
          )}

          {!instruction && !passageText && (
            <p className="font-bold text-slate-900">듣기 문항</p>
          )}

          {table && (
            <ExamPrintTable
              table={table}
              compact={compact}
              extraCompact={tableCompact}
            />
          )}

          <ul
            className={`mt-[1mm] list-none pl-0 ${
              tableCompact ? "space-y-0" : "space-y-[0.4mm]"
            }`}
          >
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
            <div className="mt-[1mm] rounded-md border border-sky-100 bg-sky-50/70 px-[2mm] py-[1mm] text-[7pt] leading-snug text-slate-700">
              {q.segments.map((seg) => (
                <p key={seg.id}>
                  <span className="font-bold text-sky-800">{seg.speaker_type}:</span>{" "}
                  {seg.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ExamPrintTable({
  table,
  compact,
  extraCompact,
}: {
  table: ListeningTableData;
  compact?: boolean;
  extraCompact?: boolean;
}) {
  const fontSize = extraCompact
    ? "text-[6pt]"
    : compact
      ? "text-[6.5pt]"
      : "text-[7pt]";
  const cellPad = extraCompact ? "py-[0.25mm]" : "py-[0.35mm]";

  return (
    <div
      className={`mt-[0.8mm] overflow-hidden rounded border border-sky-300 leading-[1.25] ${fontSize}`}
    >
      <p
        className={`border-b border-sky-200 bg-sky-50 px-[1.2mm] font-bold text-slate-900 ${
          extraCompact ? "py-[0.35mm]" : "py-[0.55mm]"
        }`}
      >
        {table.title}
      </p>
      <table className="w-full border-collapse leading-tight">
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.no} className="border-t border-sky-100/80">
              <td
                className={`w-[4.5mm] px-[0.8mm] ${cellPad} font-bold text-sky-800`}
              >
                {CIRCLED[row.no - 1] ?? row.no}
              </td>
              <td
                className={`w-[12mm] px-[0.8mm] ${cellPad} font-semibold text-slate-800`}
              >
                {row.label}
              </td>
              <td className={`px-[0.8mm] ${cellPad} text-slate-900`}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExamAnswerKeyPages({
  meta,
  questions,
}: {
  meta: PrintMeta;
  questions: ListeningQuestionData[];
}) {
  const useTwentyLayout = isStandardTwentyQuestionExam(questions.length);
  const pageLayouts = useTwentyLayout
    ? paginateStandardTwentyExam()
    : [
        {
          left: questions.slice(0, Math.ceil(questions.length / 2)).map((_, i) => i),
          right: questions
            .slice(Math.ceil(questions.length / 2))
            .map((_, i) => i + Math.ceil(questions.length / 2)),
        },
      ];

  return (
    <>
      {pageLayouts.map((layout, pageIndex) => (
        <ExamAnswerKeyPage
          key={pageIndex}
          meta={meta}
          questions={questions}
          left={layout.left}
          right={layout.right}
          pageIndex={pageIndex}
          totalPages={pageLayouts.length}
          evenSpacing={useTwentyLayout}
          isLastPage={pageIndex === pageLayouts.length - 1}
        />
      ))}
    </>
  );
}

function ExamAnswerKeyPage({
  meta,
  questions,
  left,
  right,
  pageIndex,
  totalPages,
  evenSpacing,
  isLastPage,
}: {
  meta: PrintMeta;
  questions: ListeningQuestionData[];
  left: number[];
  right: number[];
  pageIndex: number;
  totalPages: number;
  evenSpacing: boolean;
  isLastPage: boolean;
}) {
  const isFirst = pageIndex === 0;

  return (
    <article
      className={`listening-exam-page listening-exam-sheet relative mx-auto flex h-[297mm] max-h-[297mm] min-h-[297mm] flex-col overflow-hidden bg-white shadow-lg print:shadow-none ${
        !isLastPage ? "listening-exam-page-break" : ""
      }`}
    >
      <header className="shrink-0">
        {isFirst ? (
          <div className="listening-exam-chevron-band -mx-[11mm] mb-[3mm] px-[11mm] pb-[3mm] pt-[2.5mm]">
            <div className="flex items-center gap-[3mm]">
              <div
                className="listening-exam-ribbon flex min-w-0 flex-1 items-center gap-[2.5mm] py-[2.5mm] pl-[3mm] pr-[6mm] text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #0e7490 0%, #0891b2 55%, #38b6d0 100%)",
                }}
              >
                <span className="shrink-0 rounded bg-white/95 px-[2.5mm] py-[0.5mm] text-[8pt] font-extrabold text-cyan-800">
                  ANSWER KEY
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-[12pt] font-extrabold leading-tight">
                    {meta.examTitle} · 정답지
                  </h1>
                  <p className="text-[7.5pt] font-semibold text-cyan-50/95">
                    {meta.gradeLabel} · {meta.examDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-cyan-200 pb-[2mm] pt-[1mm]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8pt] font-bold text-slate-800">
                {meta.examTitle} · 정답지
              </span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[7pt] font-semibold text-cyan-800">
                {pageIndex + 1} / {totalPages}
              </span>
            </div>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden pt-[1.5mm]">
        <div className="grid h-full grid-cols-2 gap-x-[4mm]">
          <AnswerKeyColumn
            indices={left}
            questions={questions}
            evenSpacing={evenSpacing}
          />
          <AnswerKeyColumn
            indices={right}
            questions={questions}
            evenSpacing={evenSpacing}
            divided
          />
        </div>
      </div>

      <footer className="shrink-0 border-t border-cyan-200 py-[1.5mm] text-center text-[7pt] font-medium text-cyan-800">
        {isLastPage ? (
          <span className="tracking-[0.2em]">— 교사용 정답지 —</span>
        ) : (
          <span>
            {pageIndex + 1} / {totalPages}
          </span>
        )}
      </footer>
    </article>
  );
}

function AnswerKeyColumn({
  indices,
  questions,
  evenSpacing,
  divided,
}: {
  indices: number[];
  questions: ListeningQuestionData[];
  evenSpacing: boolean;
  divided?: boolean;
}) {
  const borderClass = divided
    ? "border-l border-cyan-200 pl-[3.5mm]"
    : "pr-[0.5mm]";

  if (evenSpacing) {
    return (
      <div className={`flex h-full min-h-0 flex-col ${borderClass}`}>
        {indices.map((qi, i) => (
          <div
            key={questions[qi].id}
            className={`flex min-h-0 flex-1 flex-col justify-start overflow-hidden px-[0.5mm] pt-[1mm] ${
              i < indices.length - 1 ? "border-b border-cyan-100" : ""
            }`}
          >
            <AnswerKeyItem question={questions[qi]} compact />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`min-h-0 space-y-[2mm] ${borderClass}`}>
      {indices.map((qi) => (
        <AnswerKeyItem key={questions[qi].id} question={questions[qi]} />
      ))}
    </div>
  );
}

function AnswerKeyItem({
  question: q,
  compact,
}: {
  question: ListeningQuestionData;
  compact?: boolean;
}) {
  const idx = q.correct_answer - 1;
  const choice = q.choices[idx] ?? "";
  const answerSize = compact ? "text-[12pt]" : "text-[14pt]";
  const choiceSize = compact ? "text-[7pt]" : "text-[8pt]";
  const scriptSize = compact ? "text-[5.5pt]" : "text-[6.5pt]";

  return (
    <div className="min-h-0">
      <div className="flex items-baseline gap-[2mm]">
        <span
          className={`w-[6mm] shrink-0 font-black tabular-nums text-slate-800 ${
            compact ? "text-[9pt]" : "text-[11pt]"
          }`}
        >
          {String(q.order_index).padStart(2, "0")}
        </span>
        <span className={`shrink-0 font-black text-cyan-700 ${answerSize}`}>
          {answerLabel(q.correct_answer)}
        </span>
        <span
          className={`min-w-0 flex-1 leading-snug text-slate-800 ${choiceSize} font-semibold`}
        >
          {choice}
        </span>
      </div>

      {q.segments.length > 0 && (
        <div
          className={`mt-[0.5mm] rounded border border-cyan-100 bg-cyan-50/60 px-[1.5mm] py-[0.5mm] leading-snug text-slate-700 ${scriptSize}`}
        >
          {q.segments.map((seg) => (
            <p key={seg.id}>
              <span className="font-bold text-cyan-800">{seg.speaker_type}:</span>{" "}
              {seg.text}
            </p>
          ))}
        </div>
      )}

      {q.answer_clue && (
        <p
          className={`mt-[0.4mm] leading-snug text-slate-600 ${
            compact ? "text-[5.5pt]" : "text-[6.5pt]"
          }`}
        >
          <span className="font-semibold text-cyan-800">근거</span> {q.answer_clue}
        </p>
      )}
    </div>
  );
}
