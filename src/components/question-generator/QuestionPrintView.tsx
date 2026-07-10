"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import {
  paginateExamQuestions,
  type ExamPageLayout,
} from "@/lib/listening/paginate-exam-questions";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
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
const BRANDING_STORAGE_KEY = "qg-print-branding";

type PrintBranding = {
  headerKicker: string;
  headerTitle: string;
  headerSub: string;
  footerLeft: string;
  footerRight: string;
  showLogo: boolean;
};

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

function parseBogiLines(text: string): string[] {
  const cleaned = cleanQuestionText(text).trim();
  if (!cleaned) return [];
  const parts = cleaned
    .split(/(?=\(\d+\))/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts;
  return cleaned.split(/\n+/).map((s) => s.trim()).filter(Boolean);
}

/** <u>…</u> 및 일반 텍스트를 인쇄용 노드로 변환 */
function renderMarkedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`t${key++}`}>{text.slice(last, m.index)}</span>
      );
    }
    nodes.push(
      <u key={`u${key++}`} className="qg-print-u">
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

function PassageParas({ text }: { text: string }) {
  const raw = (text || "").replace(/\r\n/g, "\n").trim();
  const blocks = raw
    ? raw
        .split(/\n\s*\n+/)
        .map((para) =>
          para
            .split(/\n/)
            .map((l) => l.trim())
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(Boolean)
    : [];

  if (blocks.length === 0) return null;

  return (
    <div className="qg-print-passage qg-print-passage-block">
      {blocks.map((p, pi) => (
        <p key={pi} className="qg-print-passage-p">
          {renderMarkedText(p)}
        </p>
      ))}
    </div>
  );
}

function QuestionBlock({
  q,
  index,
}: {
  q: QuestionRow;
  index: number;
}) {
  const isCount = q.question_type === "content_count";
  const isInsertion = q.question_type === "sentence_insertion";
  const isIrrelevant = q.question_type === "irrelevant_sentence";
  const extra = cleanQuestionText(q.question_text);
  const passage = questionPassage(q);
  const bogiLines = isCount ? parseBogiLines(q.question_text) : [];
  const showChoices =
    !isCount &&
    !isInsertion &&
    q.choices &&
    q.choices.length > 0;

  if (isCount) {
    return (
      <section className="qg-print-card qg-print-count-card">
        <p className="qg-print-q-head">
          <span className="qg-print-q-num qg-print-count-num">
            {padNo(index)}
          </span>{" "}
          {q.instruction}
        </p>
        {passage.trim() && (
          <div className="qg-print-count-box qg-print-passage-block">
            {reflowPassageForPrint(passage).map((p, pi) => (
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
      {isInsertion && extra ? (
        <div className="qg-print-given-box">{extra}</div>
      ) : null}
      {passage.trim() ? <PassageParas text={passage} /> : null}
      {!isInsertion && extra ? (
        <p className="qg-print-extra">{extra}</p>
      ) : null}
      {showChoices && (
        <ul
          className={`qg-print-choices${
            isIrrelevant ? " qg-print-choices-numbers" : ""
          }`}
        >
          {q.choices!.map((c) => (
            <li key={c.number}>
              <span className="qg-print-choice-mark">
                {CIRCLED[c.number - 1] ?? `${c.number}.`}
              </span>
              {c.text.trim() ? <span>{c.text}</span> : null}
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

function loadStoredBranding(): Partial<PrintBranding> | null {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PrintBranding>;
  } catch {
    return null;
  }
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
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<ExamPageLayout[]>([]);
  const [branding, setBranding] = useState<PrintBranding>({
    headerKicker: ACADEMY_NAME,
    headerTitle: "",
    headerSub: "",
    footerLeft: ACADEMY_NAME,
    footerRight: "영어 변형문제",
    showLogo: true,
  });
  const [brandingReady, setBrandingReady] = useState(false);
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
    const nextTitle =
      job?.request_config?.title ||
      job?.english_source_passages?.title ||
      "영어 변형문제";
    const nextGrade =
      job?.request_config?.grade || job?.english_source_passages?.grade || "";
    const nextDetail =
      job?.request_config?.sourceDetail ||
      job?.english_source_passages?.source_detail ||
      "";
    setTitle(nextTitle);
    setGrade(nextGrade);
    setSourceDetail(nextDetail);
    setQuestions(data.questions ?? []);

    setBranding((prev) => {
      const stored = typeof window !== "undefined" ? loadStoredBranding() : null;
      const kind = mode === "answers" ? "해설지" : "변형문제";
      return {
        headerKicker:
          stored?.headerKicker ??
          prev.headerKicker ??
          `${ACADEMY_NAME}${nextGrade ? ` · ${nextGrade}` : ""}`,
        headerTitle: stored?.headerTitle || nextTitle,
        headerSub: stored?.headerSub ?? nextDetail,
        footerLeft: stored?.footerLeft ?? ACADEMY_NAME,
        footerRight: stored?.footerRight ?? `영어 ${kind}`,
        showLogo: stored?.showLogo ?? true,
      };
    });
    setBrandingReady(true);
  }, [jobId, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!brandingReady) return;
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
    } catch {
      /* ignore */
    }
  }, [branding, brandingReady]);

  const bannerNo = extractBannerNo(sourceDetail);
  const sheetTitle =
    branding.headerTitle ||
    (mode === "answers" ? `${title} · 해설지` : title);

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
      // 머릿말·꼬릿말 공간 확보
      const firstColMax = mmToPx(232);
      const nextColMax = mmToPx(240);

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
  }, [questions, mode, branding.headerTitle, branding.headerSub]);

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

  function patchBranding(patch: Partial<PrintBranding>) {
    setBranding((prev) => ({ ...prev, ...patch }));
  }

  function resetBranding() {
    const kind = mode === "answers" ? "해설지" : "변형문제";
    setBranding({
      headerKicker: `${ACADEMY_NAME}${grade ? ` · ${grade}` : ""}`,
      headerTitle: title,
      headerSub: sourceDetail,
      footerLeft: ACADEMY_NAME,
      footerRight: `영어 ${kind}`,
      showLogo: true,
    });
  }

  function renderHeader(compact: boolean, pageIdx: number, totalPages: number) {
    return (
      <header
        className={`qg-print-header ${compact ? "qg-print-header-compact" : ""} ${
          mode === "answers" ? "qg-print-header-answer-sheet" : ""
        }`}
      >
        <div className="qg-print-header-main">
          {branding.showLogo && (
            <div className="qg-print-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt={ACADEMY_NAME}
                className="qg-print-logo-img"
              />
            </div>
          )}
          <div className="qg-print-header-text">
            {branding.headerKicker && (
              <p className="qg-print-kicker">{branding.headerKicker}</p>
            )}
            {!compact && branding.headerTitle && (
              <h1 className="qg-print-title">{branding.headerTitle}</h1>
            )}
            {!compact && branding.headerSub && (
              <p className="qg-print-sub">{branding.headerSub}</p>
            )}
            {bannerNo && !compact && mode === "exam" && (
              <p className="qg-print-banner">┃3월 {bannerNo}번┃</p>
            )}
            {compact && branding.headerTitle && (
              <p className="qg-print-title qg-print-title-sm">
                {branding.headerTitle}
              </p>
            )}
          </div>
        </div>
        <div className="qg-print-header-aside">
          <p className="qg-print-meta">{questions.length}문항</p>
          <p className="qg-print-page-no">
            {pageIdx + 1}/{totalPages}
          </p>
        </div>
      </header>
    );
  }

  function renderFooter() {
    return (
      <footer className="qg-print-footer">
        <div className="qg-print-footer-left">
          {branding.showLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={LOGO_SRC}
              alt=""
              className="qg-print-footer-logo"
            />
          )}
          <span>{branding.footerLeft || ACADEMY_NAME}</span>
        </div>
        <span className="qg-print-footer-right">
          {branding.footerRight || "영어 변형문제"}
        </span>
      </footer>
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
          <Button type="button" onClick={runPrint}>
            PDF 저장 / 인쇄
          </Button>
        </div>

        <div className="mx-auto mt-3 max-w-4xl rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">
              머릿말 · 꼬릿말 (인쇄에 반영)
            </p>
            <button
              type="button"
              className="text-xs text-brand-700 hover:underline"
              onClick={resetBranding}
            >
              기본값으로
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-600">
              머릿말 상단
              <input
                className="ui-input mt-1 py-1.5 text-sm"
                value={branding.headerKicker}
                onChange={(e) => patchBranding({ headerKicker: e.target.value })}
                placeholder={ACADEMY_NAME}
              />
            </label>
            <label className="block text-xs text-slate-600">
              머릿말 제목
              <input
                className="ui-input mt-1 py-1.5 text-sm"
                value={branding.headerTitle}
                onChange={(e) => patchBranding({ headerTitle: e.target.value })}
                placeholder="자료 제목"
              />
            </label>
            <label className="block text-xs text-slate-600 sm:col-span-2">
              머릿말 부제
              <input
                className="ui-input mt-1 py-1.5 text-sm"
                value={branding.headerSub}
                onChange={(e) => patchBranding({ headerSub: e.target.value })}
                placeholder="출처·설명"
              />
            </label>
            <label className="block text-xs text-slate-600">
              꼬릿말 왼쪽
              <input
                className="ui-input mt-1 py-1.5 text-sm"
                value={branding.footerLeft}
                onChange={(e) => patchBranding({ footerLeft: e.target.value })}
                placeholder={ACADEMY_NAME}
              />
            </label>
            <label className="block text-xs text-slate-600">
              꼬릿말 오른쪽
              <input
                className="ui-input mt-1 py-1.5 text-sm"
                value={branding.footerRight}
                onChange={(e) => patchBranding({ footerRight: e.target.value })}
                placeholder="영어 변형문제"
              />
            </label>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={branding.showLogo}
              onChange={(e) => patchBranding({ showLogo: e.target.checked })}
            />
            학원 로고 표시 (머릿말·꼬릿말)
          </label>
        </div>
      </div>

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
            {renderHeader(pageIdx > 0, pageIdx, sheetPages.length)}
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
            {renderFooter()}
          </article>
        ))}
      </div>
    </div>
  );
}
