"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";

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
      setError("한 문항 이상 마킹해 주세요.");
      return;
    }

    const unanswered = sorted.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered}문항이 비어 있어요. 그대로 제출할까요?`
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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-slate-900">답안지</h2>
          <p className="mt-0.5 truncate text-xs text-slate-500">{setTitle}</p>
        </div>
        {result ? (
          <div className="inline-flex items-baseline gap-2 rounded-md bg-brand-50 px-3 py-1.5 text-brand-700">
            <span className="text-xs font-semibold">채점 결과</span>
            <span className="text-xl font-bold tabular-nums">{result.score}점</span>
            <span className="text-xs font-semibold tabular-nums">
              {result.correctCount}/{result.totalCount} 정답
            </span>
          </div>
        ) : (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
            마킹 {answeredCount}/{sorted.length}
          </span>
        )}
      </div>

      {!canSubmit && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
          답안 제출은 <span className="font-semibold">학생 계정</span>으로 로그인한
          뒤 할 수 있어요. 음원은 위에서 계속 들을 수 있어요.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="-mx-1 mt-4 overflow-x-auto px-1">
        <table className="w-full min-w-[300px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="w-12 py-2 text-left font-semibold">번호</th>
              {CIRCLED.map((label) => (
                <th key={label} className="py-2 text-center font-semibold">
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
                  ? "bg-green-50/70"
                  : "bg-rose-50/70"
                : "";
              return (
                <tr
                  key={q.id}
                  className={`border-b border-slate-100 last:border-b-0 ${rowTone}`}
                >
                  <td className="py-1.5 pl-1 font-semibold tabular-nums text-slate-800">
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
                          aria-pressed={isSelected}
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] text-xs font-semibold tabular-nums transition ${
                            isWrongMark
                              ? "border-rose-600 bg-rose-600 text-white"
                              : isCorrectMark
                                ? "border-green-700 bg-green-700 text-white"
                                : isSelected
                                  ? "border-brand-600 bg-brand-600 text-white"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-brand-400 hover:text-brand-600"
                          } disabled:cursor-default`}
                        >
                          {choice}
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

      <div className="mt-4 flex flex-col gap-2">
        {canSubmit && !result && (
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="h-11 w-full text-[15px]"
          >
            {submitting ? "채점 중…" : "답안 제출 · 채점"}
          </Button>
        )}
        {canSubmit && result && (
          <Button
            variant="secondary"
            onClick={resetForRetry}
            className="h-11 w-full text-[15px]"
          >
            <Icon name="rotate" size={16} />
            다시 풀기
          </Button>
        )}
        {result && (
          <p className="text-center text-xs text-slate-500">
            제출했어요 · 학습 현황과 리포트에 반영돼요
          </p>
        )}
      </div>
    </div>
  );
}
