"use client";

import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import { QuestionQualityBadges } from "@/components/listening/QuestionQualityBadges";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningQuestionPreviewProps {
  question: GeneratedListeningQuestion;
  onRegenerate?: () => void;
  onRevalidate?: () => void;
  onGenerateAudio?: () => void;
  regenerateBusy?: boolean;
  revalidateBusy?: boolean;
  audioBusy?: boolean;
  showActions?: boolean;
  audioNeedsRegeneration?: boolean;
}

export function ListeningQuestionPreview({
  question,
  onRegenerate,
  onRevalidate,
  onGenerateAudio,
  regenerateBusy,
  revalidateBusy,
  audioBusy,
  showActions,
  audioNeedsRegeneration,
}: ListeningQuestionPreviewProps) {
  const filledChoices = question.choices.filter((c) => c.trim());
  const passageText = displayQuestionTextForOrder(
    question.order_index,
    question.question_text
  );

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        question.needs_review ? "border-amber-300" : "border-indigo-100"
      }`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <p className="text-xs font-medium text-indigo-600">
            {question.order_index}번 · {question.question_type}
          </p>
          {question.instruction && (
            <p className="mt-2 text-sm font-medium text-slate-900">{question.instruction}</p>
          )}
        </div>
        <QuestionQualityBadges question={question} />
      </header>

      {audioNeedsRegeneration && (
        <p className="mb-2 rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-800">
          음원 재생성이 필요합니다.
        </p>
      )}

      {(question.quality_issues?.length ?? 0) > 0 && (
        <ul className="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          {question.quality_issues!.map((issue) => (
            <li key={issue.code}>· {issue.message}</li>
          ))}
        </ul>
      )}

      {question.problems && question.problems.length > 0 && (
        <ul className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-900">
          {question.problems.map((p, i) => (
            <li key={i}>· {p}</li>
          ))}
        </ul>
      )}

      {question.suggestions && question.suggestions.length > 0 && (
        <ul className="mb-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
          {question.suggestions.map((s, i) => (
            <li key={i}>· {s}</li>
          ))}
        </ul>
      )}

      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500">대본</p>
        <ul className="mt-1 space-y-1 text-sm text-slate-700">
          {question.segments.map((seg, i) => (
            <li key={i}>
              <span className="font-semibold text-slate-500">{seg.speaker}:</span> {seg.text}
            </li>
          ))}
        </ul>
        {question.script_translation && (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium">해석:</span> {question.script_translation}
          </p>
        )}
      </div>

      {passageText && (
        <p className="mb-2 whitespace-pre-wrap text-sm text-slate-800">{passageText}</p>
      )}

      <ul className="mb-3 space-y-1 text-sm">
        {filledChoices.map((c, i) => (
          <li
            key={i}
            className={
              question.correct_answer === i + 1 ? "font-semibold text-indigo-700" : ""
            }
          >
            {CIRCLED[i] ?? `${i + 1}.`} {c}
            {question.correct_answer === i + 1 ? " ✓" : ""}
          </li>
        ))}
      </ul>

      <p className="mb-2 text-xs text-slate-600">
        <span className="font-medium">정답:</span> {CIRCLED[question.correct_answer - 1] ?? question.correct_answer}
      </p>

      {question.answer_clue && (
        <p className="mb-2 text-xs text-emerald-800">
          <span className="font-medium">정답 근거:</span> {question.answer_clue}
        </p>
      )}

      {question.explanation && (
        <p className="text-xs text-slate-600">
          <span className="font-medium">해설:</span> {question.explanation}
        </p>
      )}

      {showActions && (onRegenerate || onRevalidate || onGenerateAudio) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onRegenerate && (
            <button
              type="button"
              disabled={regenerateBusy || revalidateBusy}
              onClick={onRegenerate}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 disabled:opacity-50"
            >
              {regenerateBusy ? "재생성 중…" : "이 문항 다시 생성"}
            </button>
          )}
          {onRevalidate && (
            <button
              type="button"
              disabled={regenerateBusy || revalidateBusy}
              onClick={onRevalidate}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
            >
              {revalidateBusy ? "검수 중…" : "정답/선택지 다시 검수"}
            </button>
          )}
          {onGenerateAudio && (
            <button
              type="button"
              disabled={audioBusy}
              onClick={onGenerateAudio}
              className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 disabled:opacity-50"
            >
              {audioBusy ? "음원 생성 중…" : "음원 생성"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
