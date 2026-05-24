"use client";

import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningQuestionPreviewProps {
  question: GeneratedListeningQuestion;
  onGenerateAudio?: () => void;
  audioBusy?: boolean;
  showAudioButton?: boolean;
}

export function ListeningQuestionPreview({
  question,
  onGenerateAudio,
  audioBusy,
  showAudioButton,
}: ListeningQuestionPreviewProps) {
  const filledChoices = question.choices.filter((c) => c.trim());

  return (
    <article className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
      <header className="mb-3 border-b border-slate-100 pb-2">
        <p className="text-xs font-medium text-indigo-600">
          {question.order_index}번 · {question.question_type}
        </p>
        {question.instruction && (
          <p className="mt-2 text-sm font-medium text-slate-900">{question.instruction}</p>
        )}
      </header>

      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500">대본 (segments)</p>
        <ul className="mt-1 space-y-1 text-sm text-slate-700">
          {question.segments.map((seg, i) => (
            <li key={i}>
              <span className="font-semibold text-slate-500">[{seg.speaker}]</span>{" "}
              {seg.text}
            </li>
          ))}
        </ul>
      </div>

      {question.question_text && (
        <p className="mb-2 text-sm text-slate-800 whitespace-pre-wrap">{question.question_text}</p>
      )}

      <ul className="mb-3 space-y-1 text-sm">
        {filledChoices.map((c, i) => (
          <li key={i} className={question.correct_answer === i + 1 ? "font-semibold text-indigo-700" : ""}>
            {CIRCLED[i] ?? `${i + 1}.`} {c}
            {question.correct_answer === i + 1 ? " ✓" : ""}
          </li>
        ))}
      </ul>

      {question.explanation && (
        <p className="text-xs text-slate-600">
          <span className="font-medium">해설:</span> {question.explanation}
        </p>
      )}

      {showAudioButton && onGenerateAudio && (
        <button
          type="button"
          disabled={audioBusy}
          onClick={onGenerateAudio}
          className="mt-3 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 disabled:opacity-50"
        >
          {audioBusy ? "음원 생성 중…" : "음원 생성 (저장 후)"}
        </button>
      )}
    </article>
  );
}
