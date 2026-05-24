"use client";

import { useState } from "react";

export interface StudentListeningQuestion {
  id: string;
  order_index: number;
  question_text: string;
  choices: string[];
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
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const q = questions[index];
  if (!q) {
    return <p className="text-slate-600">문항이 없습니다.</p>;
  }

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-600">
          {index + 1} / {questions.length}
        </p>
      </header>

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
          이 문항의 음원이 아직 준비되지 않았습니다.
        </p>
      )}

      <p className="text-base font-medium text-slate-900">{q.question_text}</p>

      <ul className="space-y-2">
        {q.choices.map((choice, i) => {
          const num = i + 1;
          const isSelected = selected === num;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => !submitted && setSelected(num)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="mr-2 font-semibold text-slate-500">{num}.</span>
                {choice}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected === null}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            답 확인
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={index >= questions.length - 1}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {index >= questions.length - 1 ? "마지막 문항" : "다음 문항"}
          </button>
        )}
      </div>
    </div>
  );
}
