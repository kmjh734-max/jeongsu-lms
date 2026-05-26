"use client";

import { useMemo, useState } from "react";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function displayQuestionText(
  orderIndex: number,
  questionText: string
): string | null {
  const t = questionText.trim();
  if (t) return t;
  if (orderIndex === 19) return "Man: ________";
  if (orderIndex === 20) return "Woman: ________";
  return null;
}

export interface StudentListeningQuestion {
  id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  audio_url: string | null;
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
  const [showResult, setShowResult] = useState(false);

  const q = questions[index];
  const selected = q ? answers[q.id] : undefined;

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
      setShowResult(false);
    }
  }

  function goNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setShowResult(false);
    }
  }

  function handleFinalSubmit() {
    setSubmitted(true);
    setShowResult(true);
  }

  const allAnswered = questions.every((item) => answers[item.id] != null);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-600">
          {index + 1}번 / 총 {questions.length}문항
          {q.question_type ? ` · ${q.question_type}` : ""}
        </p>
      </header>

      {submitted && showResult && (
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
        <p className="text-sm font-semibold text-slate-900">
          {q.order_index}번
        </p>
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

        {(() => {
          const passage = displayQuestionText(q.order_index, q.question_text);
          if (!passage) return null;
          return (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">지문</p>
              <p className="mt-1 font-mono text-base text-slate-900">{passage}</p>
            </div>
          );
        })()}

        <ul className="mt-4 space-y-2">
          {displayChoices.map(({ text, num }) => {
            const isSelected = selected === num;
            const isCorrect = submitted && num === q.correct_answer;
            const isWrong =
              submitted && isSelected && num !== q.correct_answer;
            return (
              <li key={num}>
                <button
                  type="button"
                  onClick={() => selectAnswer(num)}
                  disabled={submitted}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    isWrong
                      ? "border-red-300 bg-red-50"
                      : isCorrect
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
        ) : (
          <button
            type="button"
            onClick={() => setShowResult(true)}
            className="ml-auto rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            결과 보기
          </button>
        )}
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
