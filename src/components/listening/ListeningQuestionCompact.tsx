"use client";

import { useState } from "react";
import {
  ListeningQuestionEditor,
  type ListeningQuestionData,
} from "@/components/listening/ListeningQuestionEditor";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningQuestionCompactProps {
  setId: string;
  question: ListeningQuestionData;
  speechSpeed?: number;
  onUpdated: () => void;
}

export function ListeningQuestionCompact({
  setId,
  question,
  speechSpeed,
  onUpdated,
}: ListeningQuestionCompactProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAudio = Boolean(question.audio_url?.trim());
  const answerLabel =
    question.correct_answer >= 1 && question.correct_answer <= 5
      ? CIRCLED[question.correct_answer - 1]
      : `${question.correct_answer}`;

  if (expanded) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          ← {question.order_index}번 접기
        </button>
        <ListeningQuestionEditor
          setId={setId}
          question={question}
          speechSpeed={speechSpeed}
          onUpdated={onUpdated}
        />
      </div>
    );
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {question.order_index}번 · {question.question_type}
            <span
              className={`ml-2 text-xs font-normal ${hasAudio ? "text-emerald-600" : "text-amber-600"}`}
            >
              {hasAudio ? "음원 있음" : "음원 없음"}
            </span>
          </p>
          {question.instruction && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
              {question.instruction}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            대본 {question.segments.length}줄 · 정답 {answerLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-800 hover:bg-indigo-100"
        >
          펼쳐서 수정
        </button>
      </div>
    </article>
  );
}
