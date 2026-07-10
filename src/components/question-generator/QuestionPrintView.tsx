"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  paginateExamQuestions,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";
import {
  cleanQuestionText,
  normalizePassage,
  reflowPassageForPrint,
} from "@/lib/question-generator/text-utils";

type QuestionRow = {
  id: string;
  instruction: string;
  question_text: string;
  passage_original: string;
  passage_modified: string | null;
  choices: Array<{ number: number; text: string }> | null;
  correct_answer: unknown;
  explanation: string;
  question_type?: string;
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];

/** A4 본문 열 폭(mm) — 여백·중간 구분선 반영 */
const COL_WIDTH_MM = 88;
const QUESTION_GAP_PX = 14;
const COLUMN_SAFETY_PX = 12;

function formatAnswer(a: unknown): string {
  if (Array.isArray(a)) return a.join(" / ");
  if (typeof a === "number" && a >= 1 && a <= 5) {
    return CIRCLED[a - 1] ?? String(a);
  }
  return String(a ?? "");
}

function extractBannerNo(sourceDetail: string): string | null {
  const m = sourceDetail.match(/(\d{1,2})\s*번/);
  return m ? m[1] : null;
}

function padNo(n: number): string {
  return String(n).padStart(2, "0");
}

function questionPassage(q: QuestionRow): string {
  const mod = (q.passage_modified || "").trim();
  const orig = (q.passage_original || "").trim();
  if (mod && normalizePassage(mod) !== normalizePassage(orig)) return mod;
  return orig || mod;
}

function buildClipboardText(
  mode: "exam" | "answers",
  title: string,
  grade: string,
  sourceDetail: string,
  questions: QuestionRow[]
): string {
  if (mode === "answers") {
    const lines: string[] = [
      grade ? `${grade} 해설지` : "해설지",
      title,
      "",
    ];
    questions.forEach((q, i) => {
      lines.push(`${padNo(i + 1)}  ${formatAnswer(q.correct_answer)}`);
      lines.push(q.explanation);
      lines.push("");
    });
    return lines.join("\n");
  }

  const bannerNo = extractBannerNo(sourceDetail);
  const lines: string[] = [
    grade ? `${grade} 변형문제` : "변형문제",
    title,
    sourceDetail,
    "",
  ];
  if (bannerNo) lines.push(`┃3월 ${bannerNo}번┃`, "");

  questions.forEach((q, i) => {
    const extra = cleanQuestionText(q.question_text);
    lines.push(`${padNo(i + 1)}  ${q.instruction}`);
    const paras = reflowPassageForPrint(questionPassage(q));
    if (paras.length) lines.push(paras.join("\n\n"));
    if (extra) lines.push(extra);
    if (q.choices?.length) {
      for (const c of q.choices) {
        lines.push(`${CIRCLED[c.number - 1] ?? c.number}  ${c.text}`);
      }
    }
    lines.push("");
  });
  return lines.join("\n");
}

function parseBogiLines(text: string): string[] {
  const cleaned = cleanQuestionText(text).trim();
  if (!cleaned) return [];
  // (1) ... (2) ... 또는 줄바꿈 단위
  const parts = cleaned.split(/(?=\(\d+\))/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts;
  return cleaned.split(/\n+/).map((s) => s.trim()).filter(Boolean);
}

function QuestionBlock({
  q,
  index,
}: {
  q: QuestionRow;
  index: number;
}) {
  const isCount = q.question_type === "content_count";
  const extra = cleanQuestionText(q.question_text);
  const paras = reflowPassageForPrint(questionPassage(q));
  const bogiLines = isCount ? parseBogiLines(q.question_text) : [];

  if (isCount) {
    return (
      <section className="qg-print-card qg-print-count-card">
        <p className="qg-print-q-head">
          <span className="qg-print-q-num qg-print-count-num">
            {padNo(index)}
          </span>{" "}
          {q.instruction}
        </p>
        {paras.length > 0 && (
          <div className="qg-print-count-box qg-print-passage-block">
            {paras.map((p, pi) => (
              <p key={pi} className="qg-print-passage-p">
                {p}
              </p>
            ))}
          </div>
        )}
        <p className="qg-print-bogi-label">&lt;보기&gt;</p>
        <div className="qg-print-count-box qg-print-bogi-box">
          {bogiLines.map((line, i) => (
            <p key={i} className="qg-print-bogi-line">
              {line}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="qg-print-card">
      <p className="qg-print-q-head">
        <span className="qg-print-q-num">{padNo(index)}</span> {q.instruction}
      </p>
      {paras.length > 0 && (
        <div className="qg-print-passage qg-print-passage-block">
          {paras.map((p, pi) => (
            <p key={pi} className="qg-print-passage-p">
              {p}
            </p>
          ))}
        </div>
      )}
      {extra ? <p className="qg-print-extra">{extra}</p> : null}
      {q.choices && q.choices.length > 0 && (
        <ul className="qg-print-choices">
          {q.choices.map((c) => (
            <li key={c.number}>
              <span className="qg-print-choice-mark">
                {CIRCLED[c.number - 1] ?? `${c.number}.`}
              </span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AnswerBlock({
  q,
  index,
}: {
  q: QuestionRow;
  index: number;
}) {
  return (
    <section className="qg-print-card qg-print-answer-card">
      <p className="qg-print-answer-head">
        <span className="qg-print-q-num">{padNo(index)}</span>{" "}
        <span className="qg-print-answer-mark">
          {formatAnswer(q.correct_answer)}
        </span>
      </p>
      <p className="qg-print-answer-body">{q.explanation}</p>
    </section>
  );
}

export function QuestionPrintView({
  jobId,
  backHref,
  mode = "exam",
  autoPrint = false,
}: {
  jobId: string;
  backHref: string;
  mode?: "exam" | "answers";
  autoPrint?: boolean;
}) {
  const [title, setTitle] = useState("영어 변형문제");
  const [grade, setGrade] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<ExamPageLayout[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);
  const printedRef = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/question-generator/jobs/${jobId}`);
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "불러오기 실패");
      return;
    }
    const job = data.job;
    setTitle(
      job?.request_config?.title ||
        job?.english_source_passages?.title ||
        "영어 변형문제"
    );
    setGrade(
      job?.request_config?.grade || job?.english_source_passages?.grade || ""
    );
    setSourceDetail(
      job?.request_config?.sourceDetail ||
        job?.english_source_passages?.source_detail ||
        ""
    );
    setQuestions(data.questions ?? []);
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isMainIdeaSheet = useMemo(() => {
    if (questions.length === 0) return false;
    const mainTypes = new Set(["topic", "title", "summary_mcq"]);
    const mainCount = questions.filter((q) =>
      mainTypes.has(q.question_type || "")
    ).length;
    return mainCount >= Math.ceil(questions.length * 0.6);
  }, [questions]);

  const bannerNo = extractBannerNo(sourceDetail);
  const sheetTitle = mode === "answers" ? `${title} · 해설지` : title;

  /** 측정 → A4 2단 페이지 분할 (문제지·해설지 공통) */
  useEffect(() => {
    if (questions.length === 0) {
      setPages([]);
      return;
    }

    const run = () => {
      const root = measureRef.current;
      if (!root) return;
      const heights = questions.map((q) => {
        const el = root.querySelector<HTMLElement>(`[data-measure-q="${q.id}"]`);
        return el ? Math.ceil(el.getBoundingClientRect().height) : 80;
      });

      const mmToPx = (mm: number) => (mm * 96) / 25.4;
      const firstColMax = mmToPx(250);
      const nextColMax = mmToPx(258);

      const layouts = paginateExamQuestions(heights, {
        firstColumnMaxPx: firstColMax,
        nextColumnMaxPx: nextColMax,
        questionGapPx: QUESTION_GAP_PX,
        columnSafetyPx: COLUMN_SAFETY_PX,
      }).filter((p) => p.left.length > 0 || p.right.length > 0);

      setPages(layouts);
    };

    const t = window.setTimeout(run, 50);
    void document.fonts?.ready?.then(() => {
      window.setTimeout(run, 30);
    });
    return () => window.clearTimeout(t);
  }, [questions, mode]);

  useEffect(() => {
    if (!autoPrint || printedRef.current) return;
    if (pages.length === 0 || questions.length === 0) return;

    printedRef.current = true;
    const t = window.setTimeout(() => {
      const prev = document.title;
      document.title = sheetTitle;
      window.print();
      window.setTimeout(() => {
        document.title = prev;
      }, 500);
    }, 900);
    return () => window.clearTimeout(t);
  }, [autoPrint, mode, pages.length, questions.length, sheetTitle]);

  function runPrint() {
    const prev = document.title;
    document.title = sheetTitle;
    window.print();
    window.setTimeout(() => {
      document.title = prev;
    }, 500);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(
      buildClipboardText(mode, title, grade, sourceDetail, questions)
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function renderHeader(compact: boolean) {
    const kind =
      mode === "answers"
        ? "해설지"
        : isMainIdeaSheet
          ? "주제·제목"
          : "변형문제";
    return (
      <header
        className={`qg-print-header ${compact ? "qg-print-header-compact" : ""} ${
          mode === "answers" ? "qg-print-header-answer-sheet" : ""
        }`}
      >
        <div>
          <p className="qg-print-kicker">
            {grade ? `${grade} ${kind}` : kind}
          </p>
          {!compact && <h1 className="qg-print-title">{title}</h1>}
          {!compact && sourceDetail && (
            <p className="qg-print-sub">{sourceDetail}</p>
          )}
          {bannerNo && !compact && mode === "exam" && (
            <p className="qg-print-banner">┃3월 {bannerNo}번┃</p>
          )}
          {compact && (
            <p className="qg-print-title qg-print-title-sm">{title}</p>
          )}
        </div>
        <p className="qg-print-meta">{questions.length}문항</p>
      </header>
    );
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const sheetPages =
    pages.length > 0
      ? pages
      : questions.length > 0
        ? [
            {
              left: questions.map((_, i) => i),
              right: [] as number[],
            },
          ]
        : [];

  return (
    <div className="qg-print-app min-h-screen bg-slate-200 print:min-h-0 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm text-slate-700 hover:underline">
            ← 뒤로
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => void copyAll()}>
              {copied ? "복사됨" : "클립보드 복사"}
            </Button>
            <Button type="button" onClick={runPrint}>
              PDF 저장 / 인쇄
            </Button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-xs text-slate-500">
          A4 2단 · 페이지 단위 분할 · 브라우저에서 PDF로 저장
          {mode === "answers" ? " (해설지)" : ""}
        </p>
      </div>

      {/* 측정용 (숨김) */}
      <div
        ref={measureRef}
        aria-hidden
        className="qg-print-measure no-print"
        style={{ width: `${COL_WIDTH_MM}mm` }}
      >
        {questions.map((q, i) => (
          <div key={q.id} data-measure-q={q.id}>
            {mode === "exam" ? (
              <QuestionBlock q={q} index={i + 1} />
            ) : (
              <AnswerBlock q={q} index={i + 1} />
            )}
          </div>
        ))}
      </div>

      <div id="qg-print-root" className="mx-auto max-w-[210mm] py-6 print:py-0">
        {sheetPages.map((page, pageIdx) => (
          <article
            key={pageIdx}
            className={`qg-print-page qg-print-sheet ${
              pageIdx < sheetPages.length - 1
                ? "qg-print-page-break"
                : "qg-print-page-last"
            }`}
          >
            {renderHeader(pageIdx > 0)}
            <div className="qg-print-cols">
              <div className="qg-print-col">
                {page.left.map((qi) => {
                  const q = questions[qi];
                  if (!q) return null;
                  return mode === "exam" ? (
                    <QuestionBlock key={q.id} q={q} index={qi + 1} />
                  ) : (
                    <AnswerBlock key={q.id} q={q} index={qi + 1} />
                  );
                })}
              </div>
              <div className="qg-print-col qg-print-col-right">
                {page.right.map((qi) => {
                  const q = questions[qi];
                  if (!q) return null;
                  return mode === "exam" ? (
                    <QuestionBlock key={q.id} q={q} index={qi + 1} />
                  ) : (
                    <AnswerBlock key={q.id} q={q} index={qi + 1} />
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
