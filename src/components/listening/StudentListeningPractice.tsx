"use client";

import { continuationQuestionDisplayText } from "@/lib/listening/fix-continuation-question";
import { normalizeTableData } from "@/lib/listening/table-data";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
import type { ListeningTableData } from "@/lib/listening/types";
import { useMemo, useState } from "react";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

export interface StudentListeningQuestion {
  id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  audio_url: string | null;
  script_text?: string;
  script_translation?: string;
  answer_clue?: string;
  explanation?: string;
  table_data?: ListeningTableData | null;
}

interface StudentListeningPracticeProps {
  setTitle: string;
  questions: StudentListeningQuestion[];
}

export function StudentListeningPractice({
  setTitle,
  questions,
}: StudentListeningPracticeProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const q = questions[index];
  const selected = q ? answers[q.id] : undefined;
  const table = q ? normalizeTableData(q.table_data) : null;
  const blankLine = q ? continuationQuestionDisplayText(q.order_index) : null;

  const score = useMemo(() => {
    let correct = 0;
    for (const item of questions) {
      if (answers[item.id] === item.correct_answer) correct++;
    }
    return { correct, total: questions.length };
  }, [answers, questions]);

  if (!q) {
    return <p className="text-slate-600">문항이 없습니다.</p>;
  }

  const displayChoices = q.choices
    .map((text, i) => ({ text: text.trim(), num: i + 1 }))
    .filter((c) => c.text);

  function selectAnswer(num: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: num }));
  }

  function goPrev() {
    if (index > 0) {
      setIndex(index - 1);
      setShowScript(false);
    }
  }

  function goNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setShowScript(false);
    }
  }

  function handleFinalSubmit() {
    setSubmitted(true);
    setShowScript(false);
  }

  const allAnswered = questions.every((item) => answers[item.id] != null);
  const isCorrect = submitted && selected === q.correct_answer;
  const isWrong = submitted && selected != null && selected !== q.correct_answer;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-600">
          {index + 1}번 / 총 {questions.length}문항
          {q.question_type ? ` · ${q.question_type}` : ""}
        </p>
      </header>

      {submitted && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center">
          <p className="text-lg font-semibold text-indigo-900">
            채점 결과: {score.correct} / {score.total}
          </p>
          <p className="mt-1 text-sm text-indigo-700">
            {score.correct === score.total
              ? "모든 문항을 맞혔습니다!"
              : "틀린 문항은 다시 들어 보세요."}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{q.order_index}번</p>
        {q.instruction && (
          <p className="mt-2 text-base leading-relaxed text-slate-900">
            {q.instruction}
          </p>
        )}

        <div className="mt-4">
          {q.audio_url ? (
            <audio
              key={q.audio_url}
              controls
              src={q.audio_url}
              className="w-full"
              preload="auto"
            />
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              음원이 아직 준비되지 않았습니다.
            </p>
          )}
        </div>

        {table && (
          <div className="mt-4">
            <ListeningTableDisplay table={table} />
          </div>
        )}

        {blankLine && !table && (
          <p className="mt-4 font-mono text-base text-slate-900">{blankLine}</p>
        )}

        <ul className="mt-4 space-y-2">
          {displayChoices.map(({ text, num }) => {
            const isSelected = selected === num;
            const choiceCorrect = submitted && num === q.correct_answer;
            const choiceWrong = submitted && isSelected && num !== q.correct_answer;
            return (
              <li key={num}>
                <button
                  type="button"
                  onClick={() => selectAnswer(num)}
                  disabled={submitted}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    choiceWrong
                      ? "border-red-300 bg-red-50"
                      : choiceCorrect
                        ? "border-green-400 bg-green-50"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="mr-2 font-semibold text-slate-600">
                    {CIRCLED[num - 1] ?? `${num}.`}
                  </span>
                  {text}
                </button>
              </li>
            );
          })}
        </ul>

        {submitted && (
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p>
              <span className="font-medium text-slate-700">내 답:</span>{" "}
              {selected != null ? CIRCLED[selected - 1] ?? selected : "—"}
              {isCorrect && (
                <span className="ml-2 text-emerald-700">정답</span>
              )}
              {isWrong && <span className="ml-2 text-red-600">오답</span>}
            </p>
            <p>
              <span className="font-medium text-slate-700">정답:</span>{" "}
              {CIRCLED[q.correct_answer - 1] ?? q.correct_answer}
            </p>
            {table?.mismatch_reason && (
              <p className="text-slate-700">
                <span className="font-medium">불일치 이유:</span>{" "}
                {table.mismatch_reason}
              </p>
            )}
            {q.answer_clue && !table && (
              <p className="text-emerald-800">
                <span className="font-medium">정답 근거:</span> {q.answer_clue}
              </p>
            )}
            {q.explanation && (
              <p className="text-slate-600">
                <span className="font-medium">해설:</span> {q.explanation}
              </p>
            )}
            {q.script_text && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowScript((v) => !v)}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  {showScript ? "대본 숨기기" : "대본 보기"}
                </button>
                {showScript && (
                  <pre className="mt-2 whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
                    {q.script_text}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
        >
          이전 문제
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index >= questions.length - 1}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
        >
          다음 문제
        </button>
        {!submitted ? (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!allAnswered}
            className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            제출하기
          </button>
        ) : null}
      </div>

      {!submitted && !allAnswered && (
        <p className="text-xs text-slate-500">
          모든 문항에 답을 선택한 뒤 제출할 수 있습니다. ({Object.keys(answers).length}/
          {questions.length} 완료)
        </p>
      )}
    </div>
  );
}
