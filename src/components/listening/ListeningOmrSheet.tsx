"use client";

import { useMemo, useState } from "react";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

export interface OmrQuestionItem {
  id: string;
  orderIndex: number;
}

export interface OmrSubmitResult {
  questionId: string;
  orderIndex: number;
  studentAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

export type OmrAttemptResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  submittedAt: string;
  results: OmrSubmitResult[];
};

interface ListeningOmrSheetProps {
  setId: string;
  setTitle: string;
  questions: OmrQuestionItem[];
  canSubmit: boolean;
  answers: Record<string, number>;
  onAnswersChange: (answers: Record<string, number>) => void;
  result: OmrAttemptResult | null;
  onResultChange: (result: OmrAttemptResult | null) => void;
}

export function ListeningOmrSheet({
  setId,
  setTitle,
  questions,
  canSubmit,
  answers,
  onAnswersChange,
  result,
  onResultChange,
}: ListeningOmrSheetProps) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.orderIndex - b.orderIndex),
    [questions]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = sorted.filter((q) => answers[q.id] != null).length;

  function selectAnswer(questionId: string, choice: number) {
    if (!canSubmit || result) return;
    if (answers[questionId] === choice) {
      const next = { ...answers };
      delete next[questionId];
      onAnswersChange(next);
      return;
    }
    onAnswersChange({ ...answers, [questionId]: choice });
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    if (answeredCount === 0) {
      setError("최소 1문항 이상 마킹해 주세요.");
      return;
    }

    const unanswered = sorted.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered}문항이 비어 있습니다. 그대로 제출할까요?`
      )
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/listening/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId,
          answers,
          source: "qr_omr",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        score?: number;
        correctCount?: number;
        totalCount?: number;
        submittedAt?: string;
        results?: OmrSubmitResult[];
      };

      if (!data.ok || data.score == null || !data.results) {
        setError(data.message ?? "제출에 실패했습니다.");
        return;
      }

      onResultChange({
        score: data.score,
        correctCount: data.correctCount ?? 0,
        totalCount: data.totalCount ?? sorted.length,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        results: data.results,
      });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForRetry() {
    onResultChange(null);
    onAnswersChange({});
    setError(null);
  }

  const resultByQuestion = new Map(
    (result?.results ?? []).map((r) => [r.questionId, r])
  );

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">OMR 답안지</h2>
          <p className="mt-1 text-sm text-slate-600">{setTitle}</p>
        </div>
        {result && (
          <div className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-center text-white">
            <p className="text-xs font-semibold opacity-90">채점 결과</p>
            <p className="text-2xl font-black tabular-nums">{result.score}점</p>
            <p className="text-xs">
              {result.correctCount}/{result.totalCount} 정답
            </p>
          </div>
        )}
      </div>

      {!canSubmit && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          답안 제출은 <span className="font-semibold">학생 계정</span>으로 로그인한
          뒤 이용할 수 있습니다. 위에서 음원은 계속 들을 수 있습니다.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-sky-200 text-xs text-sky-800">
              <th className="w-12 py-2 text-left font-bold">번호</th>
              {CIRCLED.map((label) => (
                <th key={label} className="w-10 py-2 text-center font-bold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => {
              const selected = answers[q.id];
              const graded = resultByQuestion.get(q.id);
              const rowTone = graded
                ? graded.isCorrect
                  ? "bg-emerald-50/80"
                  : "bg-red-50/60"
                : "";
              return (
                <tr
                  key={q.id}
                  className={`border-b border-sky-50 ${rowTone}`}
                >
                  <td className="py-2 font-bold tabular-nums text-slate-800">
                    {q.orderIndex}
                  </td>
                  {CIRCLED.map((_, i) => {
                    const choice = i + 1;
                    const isSelected = selected === choice;
                    const isCorrectMark =
                      result && graded?.correctAnswer === choice;
                    const isWrongMark =
                      result &&
                      isSelected &&
                      !graded?.isCorrect &&
                      graded?.studentAnswer === choice;
                    return (
                      <td key={choice} className="py-1.5 text-center">
                        <button
                          type="button"
                          disabled={!canSubmit || Boolean(result)}
                          onClick={() => selectAnswer(q.id, choice)}
                          aria-label={`${q.orderIndex}번 ${CIRCLED[i]} 선택`}
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                            isWrongMark
                              ? "border-red-500 bg-red-500 text-white"
                              : isCorrectMark
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : isSelected
                                  ? "border-sky-600 bg-sky-600 text-white"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-sky-400"
                          } disabled:cursor-default`}
                        >
                          {isSelected || isCorrectMark ? "●" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          마킹 {answeredCount}/{sorted.length}문항
        </p>
        {canSubmit && !result && (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "채점 중…" : "답안 제출 · 채점"}
          </button>
        )}
        {canSubmit && result && (
          <button
            type="button"
            onClick={resetForRetry}
            className="rounded-xl border border-sky-300 bg-white px-5 py-2.5 text-sm font-semibold text-sky-800"
          >
            다시 풀기
          </button>
        )}
      </div>

      {result && (
        <p className="mt-3 text-center text-xs text-slate-500">
          제출 완료 · 학습 현황·리포트에 반영됩니다
        </p>
      )}
    </div>
  );
}
