"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cleanQuestionText } from "@/lib/question-generator/text-utils";

type QuestionRow = {
  id: string;
  instruction: string;
  question_text: string;
  passage_original: string;
  passage_modified: string | null;
  choices: Array<{ number: number; text: string }> | null;
  correct_answer: unknown;
  explanation: string;
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function formatAnswer(a: unknown): string {
  if (Array.isArray(a)) return a.join(" / ");
  if (typeof a === "number" && a >= 1 && a <= 5) {
    return CIRCLED[a - 1] ?? String(a);
  }
  return String(a ?? "");
}

function passageBody(q: QuestionRow): string {
  return (q.passage_modified || q.passage_original || "").trim();
}

function shouldShowPassage(questions: QuestionRow[], index: number): boolean {
  if (index === 0) return true;
  return passageBody(questions[index]) !== passageBody(questions[index - 1]);
}

function extractBannerNo(sourceDetail: string): string | null {
  const m = sourceDetail.match(/(\d{1,2})\s*번/);
  return m ? m[1] : null;
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
        `${i + 1}. ${formatAnswer(q.correct_answer)} — ${q.explanation}`
      );
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
  if (bannerNo) lines.push(`┃3월 ${bannerNo}번┃`);
  lines.push("");

  questions.forEach((q, i) => {
    const extra = cleanQuestionText(q.question_text);
    lines.push(`${i + 1}. ${q.instruction}`);
    if (shouldShowPassage(questions, i)) lines.push(passageBody(q));
    if (extra) lines.push(extra);
    if (q.choices?.length) {
      for (const c of q.choices) {
        lines.push(`${CIRCLED[c.number - 1] ?? c.number} ${c.text}`);
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

  const sharedLeadPassage = useMemo(() => {
    if (mode !== "exam" || questions.length < 2) return null;
    const first = passageBody(questions[0]);
    if (!first) return null;
    let sameCount = 1;
    for (let i = 1; i < questions.length; i++) {
      if (passageBody(questions[i]) === first) sameCount += 1;
      else break;
    }
    return sameCount >= 2 ? first : null;
  }, [questions, mode]);

  const leftRight = useMemo(() => {
    const mid = Math.ceil(questions.length / 2);
    return {
      left: questions.slice(0, mid),
      right: questions.slice(mid),
    };
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

  function renderQuestion(q: QuestionRow, index: number, globalIndex: number) {
    const extra = cleanQuestionText(q.question_text);
    const body = passageBody(q);
    const coveredByLead =
      sharedLeadPassage != null && body === sharedLeadPassage;
    const showPassage =
      !coveredByLead && shouldShowPassage(questions, globalIndex - 1);

    return (
      <section key={q.id} className="qg-print-q">
        <p className="qg-print-q-head">
          <span className="qg-print-q-num">{index}.</span> {q.instruction}
        </p>
        {showPassage && <div className="qg-print-passage">{body}</div>}
        {extra && <p className="qg-print-extra">{extra}</p>}
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
            : "문제지 · 브라우저에서 PDF로 저장"}
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
                  {grade ? `${grade} 변형문제` : "변형문제"}
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

            {sharedLeadPassage && (
              <div className="qg-print-passage qg-print-passage-lead">
                {sharedLeadPassage}
              </div>
            )}

            <div className="qg-print-cols">
              <div className="qg-print-col">
                {leftRight.left.map((q, i) => renderQuestion(q, i + 1, i + 1))}
              </div>
              <div className="qg-print-col qg-print-col-right">
                {leftRight.right.map((q, i) =>
                  renderQuestion(
                    q,
                    leftRight.left.length + i + 1,
                    leftRight.left.length + i + 1
                  )
                )}
              </div>
            </div>
          </article>
        ) : (
          <article className="qg-print-page qg-print-sheet">
            <header className="qg-print-header qg-print-header-answer">
              <h1 className="qg-print-title">{title} · 해설지</h1>
            </header>
            <ol className="qg-print-answer-list">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <strong>{i + 1}.</strong> {formatAnswer(q.correct_answer)}
                  <span className="qg-print-answer-exp"> — {q.explanation}</span>
                </li>
              ))}
            </ol>
          </article>
        )}
      </div>
    </div>
  );
}
