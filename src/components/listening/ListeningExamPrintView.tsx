"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ListeningPrintQrCode } from "@/components/listening/ListeningPrintQrCode";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import { buildStudentListeningHubUrl } from "@/lib/listening/listen-url";
import {
  moveLastOverflowItem,
  paginateExamQuestions,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { ListeningTableData } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;
/** 우열(구분선 패딩) 기준 최소 열 너비 — 이보다 넓게 측정하면 줄바꿈이 달라져 잘림 발생 */
const COLUMN_WIDTH_CLASS = "w-[89mm]";
const QUESTION_GAP_MM = 12;
const QUESTION_GAP_MM_WITH_SCRIPT = 4;
const COLUMN_SAFETY_PX = 28;
const COLUMN_SAFETY_PX_WITH_SCRIPT = 56;
const MAX_OVERFLOW_FIXES = 200;

function getExamLayoutConfig(showScript: boolean) {
  const gapMm = showScript ? QUESTION_GAP_MM_WITH_SCRIPT : QUESTION_GAP_MM;
  return {
    gapMm,
    gapPx: Math.round((gapMm * 96) / 25.4),
    gapStyle: { gap: `${gapMm}mm` } as const,
    columnSafetyPx: showScript ? COLUMN_SAFETY_PX_WITH_SCRIPT : COLUMN_SAFETY_PX,
  };
}

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
  studentName: string;
}

function answerLabel(correctAnswer: number): string {
  const idx = correctAnswer - 1;
  return CIRCLED[idx] ?? String(correctAnswer);
}

function examEditionLabel(
  questions: ListeningQuestionData[],
  pageIndex: number
): string {
  if (questions.length === 0) return "01";
  const idx = Math.min(
    questions.length - 1,
    pageIndex === 0 ? 0 : pageIndex * 8
  );
  return String(questions[idx]?.order_index ?? pageIndex + 1).padStart(2, "0");
}

function speakerLabel(type: string): string {
  const t = type.toUpperCase();
  if (t === "M" || t === "MAN") return "M";
  if (t === "W" || t === "WOMAN") return "W";
  if (t === "A" || t === "ANN") return "A";
  return type;
}

function renderScriptWithBlanks(text: string, blankOffset: { n: number }) {
  const parts = text.split(/(_{4,}|\[blank\])/gi);
  return parts.map((part, i) => {
    if (/_{4,}|\[blank\]/i.test(part)) {
      const no = blankOffset.n++;
      return (
        <span key={i} className="listening-exam-blank-marker">
          {no}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function PrintScriptPanel({
  segments,
  compact = false,
}: {
  segments: ListeningQuestionData["segments"];
  compact?: boolean;
}) {
  const blankOffset = { n: 1 };

  return (
    <div
      className={`listening-exam-script-col${compact ? " listening-exam-script-col--compact" : ""}`}
    >
      <p className="listening-exam-script-title">MINI SCRIPT</p>
      {segments.map((seg) => (
        <p key={seg.id} className="leading-snug">
          <span className="listening-exam-speaker">
            {speakerLabel(seg.speaker_type)}:
          </span>{" "}
          {renderScriptWithBlanks(seg.text, blankOffset)}
        </p>
      ))}
    </div>
  );
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
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [pages, setPages] = useState<ExamPageLayout[] | null>(null);
  const [pagesVerified, setPagesVerified] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);
  const probeFirstRef = useRef<HTMLDivElement>(null);
  const probeNextRef = useRef<HTMLDivElement>(null);
  const overflowFixAttempts = useRef(0);
  const listenUrl = buildStudentListeningHubUrl(setId);

  const meta: PrintMeta = {
    examTitle: examTitle.trim() || title,
    gradeLabel,
    studentName,
  };

  const resolvedPages = pages;
  const layoutConfig = getExamLayoutConfig(showScript);

  useLayoutEffect(() => {
    if (questions.length === 0) {
      setPages([]);
      setPagesVerified(true);
      return;
    }

    const measureRoot = measureRef.current;
    const probeFirst = probeFirstRef.current;
    const probeNext = probeNextRef.current;
    if (!measureRoot || !probeFirst || !probeNext) return;

    const measureAndPaginate = () => {
      const firstBody = probeFirst.querySelector<HTMLElement>("[data-body-zone]");
      const nextBody = probeNext.querySelector<HTMLElement>("[data-body-zone]");
      if (!firstBody || !nextBody) return;

      const questionHeights = questions.map((q) => {
        const examEl = measureRoot.querySelector<HTMLElement>(
          `[data-measure-q="${q.id}"]`
        );
        const answerEl = measureRoot.querySelector<HTMLElement>(
          `[data-measure-answer-q="${q.id}"]`
        );
        const examH = Math.ceil(examEl?.offsetHeight ?? 96);
        const answerH = answerEl ? Math.ceil(answerEl.offsetHeight) : 0;
        return Math.max(examH, answerH);
      });

      overflowFixAttempts.current = 0;
      setPagesVerified(false);
      setPages(
        paginateExamQuestions(questionHeights, {
          firstColumnMaxPx: firstBody.clientHeight,
          nextColumnMaxPx: nextBody.clientHeight,
          questionGapPx: layoutConfig.gapPx,
          columnSafetyPx: layoutConfig.columnSafetyPx,
        })
      );
    };

    measureAndPaginate();
    void document.fonts?.ready?.then(measureAndPaginate);
  }, [
    questions,
    showScript,
    examTitle,
    gradeLabel,
    studentName,
    title,
    setId,
    layoutConfig.gapPx,
    layoutConfig.columnSafetyPx,
  ]);

  useLayoutEffect(() => {
    if (!pages || questions.length === 0) return;

    const root = document.getElementById("listening-print-root");
    if (!root) return;

    let overflow: { page: number; side: "left" | "right" } | null = null;
    root.querySelectorAll<HTMLElement>("[data-exam-column]").forEach((col) => {
      if (overflow) return;
      const bodyZone = col.closest<HTMLElement>("[data-body-zone]");
      const maxH = bodyZone?.clientHeight ?? 0;
      if (maxH <= 0) return;

      const columnOverflow = col.scrollHeight > maxH + 2;
      const bodyBottom = bodyZone.getBoundingClientRect().bottom;
      const questionOverflow = Array.from(
        col.querySelectorAll<HTMLElement>("[data-exam-question]")
      ).some((qEl) => qEl.getBoundingClientRect().bottom > bodyBottom + 1);

      if (!columnOverflow && !questionOverflow) return;
      const page = Number(col.dataset.page);
      const side = col.dataset.side;
      if (!Number.isFinite(page) || (side !== "left" && side !== "right")) {
        return;
      }
      overflow = { page, side };
    });

    if (!overflow) {
      overflowFixAttempts.current = 0;
      setPagesVerified(true);
      return;
    }

    if (overflowFixAttempts.current >= MAX_OVERFLOW_FIXES) {
      setPagesVerified(true);
      return;
    }

    overflowFixAttempts.current += 1;
    setPagesVerified(false);
    setPages((prev) => {
      if (!prev) return prev;
      return (
        moveLastOverflowItem(prev, overflow!.page, overflow!.side) ?? prev
      );
    });
  }, [pages, questions, showScript, examTitle, gradeLabel, studentName]);

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
  const layoutReady = pages !== null && pagesVerified;

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
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-xs text-neutral-600">이름</span>
                <input
                  className="ui-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="인쇄 파일명에 사용 (선택)"
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
              A4 2단 · 문항 높이에 맞춰 배치 · 넘치면 다음 페이지
              {resolvedPages && ` · 시험지 ${totalPages}페이지`}
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
            <div key={q.id}>
              <div data-measure-q={q.id}>
                <ExamQuestionBlock question={q} showScript={showScript} />
              </div>
              <div data-measure-answer-q={q.id}>
                <AnswerKeyItem question={q} compactScript={showScript} />
              </div>
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
          questionGapStyle={layoutConfig.gapStyle}
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
          questionGapStyle={layoutConfig.gapStyle}
        />
      </div>

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
                questionGapStyle={layoutConfig.gapStyle}
              />
            ) : !pages ? (
              <div className="listening-exam-page listening-exam-sheet mx-auto flex h-[297mm] items-center justify-center text-sm text-slate-500">
                시험지 레이아웃 계산 중…
              </div>
            ) : (
              <>
                {!layoutReady && (
                  <div className="listening-exam-page listening-exam-sheet mx-auto flex h-[297mm] items-center justify-center text-sm text-slate-500">
                    시험지 레이아웃 계산 중…
                  </div>
                )}
                <div
                  className={
                    layoutReady
                      ? undefined
                      : "pointer-events-none fixed -left-[200vw] top-0 opacity-0"
                  }
                  aria-hidden={!layoutReady}
                >
                  {resolvedPages!.map((layout, pageIndex) => (
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
                      questionGapStyle={layoutConfig.gapStyle}
                      isLastPage={pageIndex === resolvedPages!.length - 1}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {questions.length > 0 && layoutReady && (
            <div
              className={
                includeAnswerKey
                  ? "exam-print-answers"
                  : "exam-print-answers hidden print:block"
              }
            >
              <ExamAnswerKeyPages
                meta={meta}
                questions={questions}
                pageLayouts={resolvedPages!}
                questionGapStyle={layoutConfig.gapStyle}
              />
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
  isLastPage,
  measureOnly,
  questionGapStyle,
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
  questionGapStyle: { gap: string };
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
          <div className="listening-exam-header-bar">
            <div className="listening-exam-header-edition">
              <span className="listening-exam-header-edition-label">
                LISTENING
              </span>
              <span className="listening-exam-header-edition-no">
                {examEditionLabel(questions, pageIndex)}회
              </span>
            </div>
            <div className="listening-exam-header-main">
              <p className="listening-exam-header-sub">Listening Practice</p>
              <h1 className="listening-exam-header-title">{meta.examTitle}</h1>
              <p className="listening-exam-header-sub">{meta.gradeLabel}</p>
            </div>
            <div className="listening-exam-header-qr">
              <ListeningPrintQrCode url={listenUrl} sizePx={72} />
              <p className="listening-exam-header-qr-label">듣기 QR</p>
            </div>
          </div>

          <table className="listening-exam-info-table">
            <tbody>
              <tr>
                <th>이름</th>
                <td>{meta.studentName || "\u00a0"}</td>
              </tr>
            </tbody>
          </table>

          <div className="listening-exam-guide">
            <strong>LISTENING TIP</strong> QR로 음원을 듣고 아래 문항의
            답을 골라 OMR에 마킹하세요.
          </div>
        </header>
      ) : (
        <header className="listening-exam-subheader shrink-0">
          <span className="listening-exam-subheader-title">
            {meta.examTitle}
          </span>
          <span className="listening-exam-subheader-page">
            {pageIndex + 1} / {totalPages}
          </span>
        </header>
      )}

      <div data-body-zone className="listening-exam-body-zone">
        <div className="listening-exam-body-cols">
          <QuestionColumn
            indices={left}
            questions={questions}
            showScript={showScript}
            pageIndex={pageIndex}
            side="left"
            questionGapStyle={questionGapStyle}
          />
          <QuestionColumn
            indices={right}
            questions={questions}
            showScript={showScript}
            divided
            pageIndex={pageIndex}
            side="right"
            questionGapStyle={questionGapStyle}
          />
        </div>
      </div>

      <footer className="listening-exam-footer shrink-0">
        <span>{meta.examTitle}</span>
        {isLastPage && !measureOnly ? (
          <span>— 끝 —</span>
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
  pageIndex,
  side,
  questionGapStyle,
}: {
  indices: number[];
  questions: ListeningQuestionData[];
  showScript: boolean;
  divided?: boolean;
  pageIndex: number;
  side: "left" | "right";
  questionGapStyle: { gap: string };
}) {
  const borderClass = divided ? "listening-exam-col-divider" : "pr-[0.5mm]";

  return (
    <div
      data-exam-column
      data-page={pageIndex}
      data-side={side}
      className={`listening-exam-col-stack ${borderClass}`}
      style={questionGapStyle}
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
  const hasScript = showScript && q.segments.length > 0;
  const typeName = q.question_type?.trim();

  const questionBody = (
    <>
      {typeName ? (
        <div className="listening-exam-type-head">
          <span className="listening-exam-type-label">
            유형 {q.order_index}
          </span>
          <span className="listening-exam-type-name">{typeName}</span>
        </div>
      ) : null}

      {instruction && (
        <p className="listening-exam-q-instruction">{instruction}</p>
      )}

      {passageText && passageText !== instruction && (
        <p className="listening-exam-q-passage">{passageText}</p>
      )}

      {!instruction && !passageText && (
        <p className="listening-exam-q-instruction">듣기 문항</p>
      )}

      {table && <ExamPrintTable table={table} />}

      <ul className="listening-exam-choices mt-[1mm] list-none pl-0">
        {q.choices.map((choice, i) => (
          <li key={i} className="flex gap-[2mm] leading-snug">
            <span className="listening-exam-choice-mark">
              {CIRCLED[i] ?? `${i + 1}.`}
            </span>
            <span className="listening-exam-choice-text min-w-0 flex-1 break-words">
              {choice}
            </span>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <section className="listening-exam-q-block" data-exam-question>
      {hasScript ? (
        <div className="grid grid-cols-2 gap-[2.5mm]">
          <div className="flex items-start gap-[2mm]">
            <span className="listening-exam-q-num">{numLabel}</span>
            <div className="min-w-0 flex-1">{questionBody}</div>
          </div>
          <PrintScriptPanel segments={q.segments} compact={showScript} />
        </div>
      ) : (
        <div className="flex items-start gap-[2mm]">
          <span className="listening-exam-q-num">{numLabel}</span>
          <div className="min-w-0 flex-1">{questionBody}</div>
        </div>
      )}
    </section>
  );
}

function ExamPrintTable({ table }: { table: ListeningTableData }) {
  return (
    <div className="listening-exam-print-table">
      <p className="listening-exam-print-table-title">{table.title}</p>
      <table className="w-full border-collapse leading-tight">
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.no}>
              <td className="col-no py-[0.7mm]">
                {CIRCLED[row.no - 1] ?? row.no}
              </td>
              <td className="col-label py-[0.7mm]">{row.label}</td>
              <td className="py-[0.7mm]">{row.value}</td>
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
  pageLayouts,
  questionGapStyle,
}: {
  meta: PrintMeta;
  questions: ListeningQuestionData[];
  pageLayouts: ExamPageLayout[];
  questionGapStyle: { gap: string };
}) {
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
          isLastPage={pageIndex === pageLayouts.length - 1}
          questionGapStyle={questionGapStyle}
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
  isLastPage,
  questionGapStyle,
}: {
  meta: PrintMeta;
  questions: ListeningQuestionData[];
  left: number[];
  right: number[];
  pageIndex: number;
  totalPages: number;
  isLastPage: boolean;
  questionGapStyle: { gap: string };
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
          <div className="listening-exam-answer-key-bar">
            <p className="listening-exam-answer-key-title">
              {meta.examTitle} · 정답지
            </p>
            <p className="listening-exam-answer-key-sub">{meta.gradeLabel}</p>
          </div>
        ) : (
          <div className="listening-exam-subheader">
            <span className="listening-exam-subheader-title">
              {meta.examTitle} · 정답지
            </span>
            <span className="listening-exam-subheader-page">
              {pageIndex + 1} / {totalPages}
            </span>
          </div>
        )}
      </header>

      <div data-body-zone className="listening-exam-body-zone">
        <div className="listening-exam-body-cols">
          <AnswerKeyColumn
            indices={left}
            questions={questions}
            pageIndex={pageIndex}
            side="left"
            questionGapStyle={questionGapStyle}
          />
          <AnswerKeyColumn
            indices={right}
            questions={questions}
            divided
            pageIndex={pageIndex}
            side="right"
            questionGapStyle={questionGapStyle}
          />
        </div>
      </div>

      <footer className="listening-exam-footer shrink-0">
        <span>교사용 정답지</span>
        {isLastPage ? (
          <span>— 끝 —</span>
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
  divided,
  pageIndex,
  side,
  questionGapStyle,
}: {
  indices: number[];
  questions: ListeningQuestionData[];
  divided?: boolean;
  pageIndex: number;
  side: "left" | "right";
  questionGapStyle: { gap: string };
}) {
  const borderClass = divided ? "listening-exam-col-divider" : "pr-[0.5mm]";

  return (
    <div
      data-exam-column
      data-page={pageIndex}
      data-side={side}
      className={`listening-exam-col-stack ${borderClass}`}
      style={questionGapStyle}
    >
      {indices.map((qi) => (
        <AnswerKeyItem key={questions[qi].id} question={questions[qi]} />
      ))}
    </div>
  );
}

function AnswerKeyItem({
  question: q,
  compactScript = false,
}: {
  question: ListeningQuestionData;
  compactScript?: boolean;
}) {
  const idx = q.correct_answer - 1;
  const choice = q.choices[idx] ?? "";
  const answerSize = "text-[15pt]";
  const choiceSize = "text-[10pt]";
  const scriptSize = "text-[10pt]";
  const clueSize = "text-[9.5pt]";

  return (
    <div className="min-h-0" data-exam-question>
      <div className="flex items-baseline gap-[2mm]">
        <span className="listening-exam-q-num shrink-0 tabular-nums">
          {String(q.order_index).padStart(2, "0")}
        </span>
        <span className={`shrink-0 font-normal text-[#234b8c] ${answerSize}`}>
          {answerLabel(q.correct_answer)}
        </span>
        <span
          className={`min-w-0 flex-1 leading-snug font-normal text-slate-800 ${choiceSize}`}
        >
          {choice}
        </span>
      </div>

      {q.segments.length > 0 && (
        <div className={`mt-[0.8mm] ${scriptSize}`}>
          <PrintScriptPanel segments={q.segments} compact={compactScript} />
        </div>
      )}

      {q.answer_clue && (
        <p className={`mt-[0.5mm] leading-snug text-slate-600 ${clueSize}`}>
          <span className="font-semibold text-[#234b8c]">근거</span>{" "}
          {q.answer_clue}
        </p>
      )}
    </div>
  );
}
