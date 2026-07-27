"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { teacherGradeAnswerAction } from "@/lib/exam-prep/staff-actions";

export type ReviewAnswerRow = {
  id: string;
  student_answer: unknown;
  ai_feedback: string | null;
  grading_status: string;
  score: number | null;
  question_text: string | null;
  question_type: string;
  model_answer: unknown;
  points: number;
};

export function WritingReviewPanel({ rows }: { rows: ReviewAnswerRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">검토 대기 중인 서술형 답안이 없습니다.</p>
    );
  }

  async function grade(id: string, isCorrect: boolean) {
    setLoadingId(id);
    setMessage(null);
    const res = await teacherGradeAnswerAction({ answerId: id, isCorrect });
    setLoadingId(null);
    if (!res.ok) {
      setMessage(res.message);
      return;
    }
    setMessage(isCorrect ? "정답 처리했습니다." : "오답 처리했습니다.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {rows.map((r) => (
        <article
          key={r.id}
          className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
        >
          <p className="text-xs font-medium text-amber-800">
            {r.question_type} · 검토 대기
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {r.question_text ?? "서술형"}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-2 text-xs">
              <p className="mb-1 font-semibold text-slate-600">학생 답</p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                {formatAnswer(r.student_answer)}
              </pre>
            </div>
            <div className="rounded-lg bg-white p-2 text-xs">
              <p className="mb-1 font-semibold text-slate-600">모범답</p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                {formatAnswer(r.model_answer)}
              </pre>
            </div>
          </div>
          {r.ai_feedback && (
            <p className="mt-2 text-xs text-slate-600">AI: {r.ai_feedback}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={loadingId === r.id}
              onClick={() => void grade(r.id, true)}
            >
              정답
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loadingId === r.id}
              onClick={() => void grade(r.id, false)}
            >
              오답
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatAnswer(v: unknown): string {
  if (v == null) return "(없음)";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "text" in v) {
    return String((v as { text: unknown }).text ?? "");
  }
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
