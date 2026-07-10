"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type QuestionRow = {
  id: string;
  category: string;
  question_type: string;
  option_key: string | null;
  instruction: string;
  question_text: string;
  passage_original: string;
  passage_modified: string | null;
  choices: Array<{ number: number; text: string }> | null;
  correct_answer: unknown;
  explanation: string;
  status: string;
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function formatAnswer(a: unknown): string {
  if (Array.isArray(a)) return a.join(" / ");
  if (typeof a === "number" && a >= 1 && a <= 5) {
    return CIRCLED[a - 1] ?? String(a);
  }
  return String(a ?? "");
}

function buildClipboardText(
  title: string,
  questions: QuestionRow[]
): string {
  const lines: string[] = [title, ""];
  questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.instruction}`);
    if (q.passage_modified || q.passage_original) {
      lines.push(q.passage_modified || q.passage_original);
    }
    if (q.question_text) lines.push(q.question_text);
    if (q.choices?.length) {
      for (const c of q.choices) {
        lines.push(`${CIRCLED[c.number - 1] ?? c.number} ${c.text}`);
      }
    }
    lines.push("");
  });
  lines.push("— 정답 —");
  questions.forEach((q, i) => {
    lines.push(
      `${i + 1}. ${formatAnswer(q.correct_answer)} | ${q.explanation}`
    );
  });
  return lines.join("\n");
}

export function QuestionPrintView({
  jobId,
  backHref,
}: {
  jobId: string;
  backHref: string;
}) {
  const [title, setTitle] = useState("영어 변형문제");
  const [grade, setGrade] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [includeAnswers, setIncludeAnswers] = useState(true);
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
    setGrade(job?.request_config?.grade || job?.english_source_passages?.grade || "");
    setQuestions(data.questions ?? []);
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const leftRight = useMemo(() => {
    const mid = Math.ceil(questions.length / 2);
    return {
      left: questions.slice(0, mid),
      right: questions.slice(mid),
    };
  }, [questions]);

  function runPrint() {
    const prev = document.title;
    document.title = title;
    window.print();
    window.setTimeout(() => {
      document.title = prev;
    }, 500);
  }

  async function copyAll() {
    const text = buildClipboardText(title, questions);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function renderQuestion(q: QuestionRow, index: number) {
    return (
      <section key={q.id} className="qg-print-q">
        <p className="qg-print-q-head">
          <span className="qg-print-q-num">{index}.</span> {q.instruction}
        </p>
        {(q.passage_modified || q.passage_original) && (
          <div className="qg-print-passage">
            {q.passage_modified || q.passage_original}
          </div>
        )}
        {q.question_text && (
          <p className="qg-print-extra">{q.question_text}</p>
        )}
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

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm text-slate-700 hover:underline">
            ← 결과로
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
              />
              정답지 포함
            </label>
            <Button type="button" variant="secondary" onClick={() => void copyAll()}>
              {copied ? "복사됨" : "클립보드 복사"}
            </Button>
            <Button type="button" onClick={runPrint}>
              PDF 저장 / 인쇄
            </Button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-xs text-slate-500">
          인쇄 대화상자에서 「PDF로 저장」을 선택하면 PDF 파일로 저장할 수 있습니다. A4 · 2단
        </p>
      </div>

      <div id="qg-print-root" className="mx-auto max-w-[210mm] space-y-6 py-6 print:space-y-0 print:py-0">
        <article className="qg-print-page qg-print-sheet">
          <header className="qg-print-header">
            <div>
              <p className="qg-print-kicker">영어 변형문제</p>
              <h1 className="qg-print-title">{title}</h1>
              {grade && <p className="qg-print-sub">{grade}</p>}
            </div>
            <p className="qg-print-meta">A4 2단 · {questions.length}문항</p>
          </header>

          <div className="qg-print-guide">
            Φ 다음 글을 읽고 물음에 답하시오.
          </div>

          <div className="qg-print-cols">
            <div className="qg-print-col">
              {leftRight.left.map((q, i) => renderQuestion(q, i + 1))}
            </div>
            <div className="qg-print-col qg-print-col-right">
              {leftRight.right.map((q, i) =>
                renderQuestion(q, leftRight.left.length + i + 1)
              )}
            </div>
          </div>
        </article>

        {includeAnswers && questions.length > 0 && (
          <article className="qg-print-page qg-print-sheet qg-print-page-break">
            <header className="qg-print-header qg-print-header-answer">
              <h1 className="qg-print-title">{title} · 정답지</h1>
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
