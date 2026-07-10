"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  cleanQuestionText,
  normalizePassage,
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

/** 문항용 지문: 변형이 있으면 변형, 없으면 원문 */
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
      lines.push(
        `${padNo(i + 1)}  ${formatAnswer(q.correct_answer)}`
      );
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
    lines.push(questionPassage(q));
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

export function QuestionPrintView({
  jobId,
  backHref,
  mode = "exam",
}: {
  jobId: string;
  backHref: string;
  mode?: "exam" | "answers";
}) {
  const [title, setTitle] = useState("영어 변형문제");
  const [grade, setGrade] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /** 주제·제목 위주면 대의파악(상하) 레이아웃 */
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

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm text-slate-700 hover:underline">
            ← 결과로
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
          {mode === "answers"
            ? "해설지 · 브라우저에서 PDF로 저장"
            : isMainIdeaSheet
              ? "대의파악 양식 · 문항마다 발문 → 지문(상) → 선택지(하)"
              : "문제지 · 문항마다 상하 구성"}
        </p>
      </div>

      <div
        id="qg-print-root"
        className="mx-auto max-w-[210mm] space-y-6 py-6 print:space-y-0 print:py-0"
      >
        {mode === "exam" ? (
          <article className="qg-print-page qg-print-sheet">
            <header className="qg-print-header">
              <div>
                <p className="qg-print-kicker">
                  {grade
                    ? `${grade} ${isMainIdeaSheet ? "주제·제목" : "변형문제"}`
                    : isMainIdeaSheet
                      ? "주제·제목"
                      : "변형문제"}
                </p>
                <h1 className="qg-print-title">{title}</h1>
                {sourceDetail && (
                  <p className="qg-print-sub">{sourceDetail}</p>
                )}
                {bannerNo && (
                  <p className="qg-print-banner">┃3월 {bannerNo}번┃</p>
                )}
              </div>
              <p className="qg-print-meta">{questions.length}문항</p>
            </header>

            {/* 상하 구분 카드 × 2열 */}
            <div className="qg-print-stack">
              {questions.map((q, i) => {
                const extra = cleanQuestionText(q.question_text);
                const passage = questionPassage(q);
                return (
                  <section key={q.id} className="qg-print-card">
                    <p className="qg-print-q-head">
                      <span className="qg-print-q-num">{padNo(i + 1)}</span>{" "}
                      {q.instruction}
                    </p>
                    {passage && (
                      <div className="qg-print-passage qg-print-passage-block">
                        {passage}
                      </div>
                    )}
                    {extra ? (
                      <p className="qg-print-extra">{extra}</p>
                    ) : null}
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
              })}
            </div>
          </article>
        ) : (
          <article className="qg-print-page qg-print-sheet">
            <header className="qg-print-header qg-print-header-answer">
              <h1 className="qg-print-title">{title} · 해설지</h1>
            </header>
            <div className="qg-print-answer-blocks">
              {questions.map((q, i) => (
                <section key={q.id} className="qg-print-answer-block">
                  <p className="qg-print-answer-head">
                    <strong>{padNo(i + 1)}</strong>{" "}
                    <span className="qg-print-answer-mark">
                      {formatAnswer(q.correct_answer)}
                    </span>
                  </p>
                  <p className="qg-print-answer-body">{q.explanation}</p>
                </section>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
