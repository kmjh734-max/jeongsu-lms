"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitWrongPracticeAction } from "@/lib/exam-prep/student-actions";
import type { ExamWorkbookQuestionPublic } from "@/lib/exam-prep/types";

export function WrongPracticeClient({
  wrongId,
  originalType,
  practice,
}: {
  wrongId: string;
  originalType: string;
  practice: ExamWorkbookQuestionPublic & { practice_type: string };
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState<unknown>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean | null;
    mastered?: boolean;
    feedback?: string | null;
    correctAnswer?: unknown;
  } | null>(null);

  async function submit() {
    setLoading(true);
    setResult(null);
    const res = await submitWrongPracticeAction({
      wrongAnswerId: wrongId,
      answer,
      transform: true,
    });
    setLoading(false);
    if (!res.ok) {
      setResult({ isCorrect: null, feedback: res.message });
      return;
    }
    setResult({
      isCorrect: res.isCorrect,
      mastered: res.mastered,
      feedback: res.feedback,
      correctAnswer: res.correctAnswer,
    });
    if (res.mastered) router.refresh();
  }

  const data = practice.question_data ?? {};
  const type = practice.practice_type || practice.question_type;

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          원유형 {originalType} → 연습 {type}
        </p>
        <Link
          href="/student/exam-prep/wrong"
          className="text-xs text-brand-700 hover:underline"
        >
          오답 목록
        </Link>
      </div>
      <h2 className="text-base font-semibold text-slate-900">
        {practice.question_text ?? "오답 변형 연습"}
      </h2>

      {(type === "english_blank" ||
        type === "korean_blank" ||
        type === "verb_form") && (
        <div className="space-y-2">
          {data.englishHint ? (
            <p className="rounded-lg bg-slate-50 p-3 font-mono text-sm">
              {String(data.englishHint)}
            </p>
          ) : null}
          {data.baseForm ? (
            <p className="text-sm text-brand-800">
              기본형: {String(data.baseForm)}
            </p>
          ) : null}
          <p className="font-mono text-sm">{String(data.displayText ?? "")}</p>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="빈칸 답"
            value={
              typeof answer === "object" &&
              answer !== null &&
              "blanks" in answer
                ? String(
                    ((answer as { blanks: Record<string, string> }).blanks ??
                      {})["blank_1"] ?? ""
                  )
                : ""
            }
            onChange={(e) =>
              setAnswer({ blanks: { blank_1: e.target.value } })
            }
          />
        </div>
      )}

      {type === "grammar_vocab_choice" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">{String(data.displayText ?? "")}</p>
          {(Array.isArray(data.options) ? data.options : []).map(
            (opt: { id: string; text: string }) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="wrong-opt"
                  checked={
                    typeof answer === "object" &&
                    answer !== null &&
                    "optionId" in answer &&
                    (answer as { optionId: string }).optionId === opt.id
                  }
                  onChange={() => setAnswer({ optionId: opt.id })}
                />
                {opt.text}
              </label>
            )
          )}
        </div>
      )}

      {(type === "error_correction" ||
        type === "translation_practice" ||
        type === "writing") && (
        <div className="space-y-2">
          {data.corruptedText ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 font-mono text-sm">
              {String(data.corruptedText)}
            </p>
          ) : null}
          {data.english ? (
            <p className="rounded-lg bg-slate-50 p-3 font-mono text-sm">
              {String(data.english)}
            </p>
          ) : null}
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={
              typeof answer === "object" &&
              answer !== null &&
              "text" in answer
                ? String((answer as { text: unknown }).text ?? "")
                : ""
            }
            onChange={(e) => setAnswer({ text: e.target.value })}
          />
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        disabled={loading || result?.mastered}
        onClick={() => void submit()}
      >
        {loading ? "채점 중…" : "제출"}
      </Button>

      {result && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            result.isCorrect
              ? "bg-emerald-50 text-emerald-800"
              : result.isCorrect === false
                ? "bg-rose-50 text-rose-800"
                : "bg-slate-50 text-slate-700"
          }`}
        >
          {result.mastered
            ? "정답! 숙달 처리되었습니다."
            : result.isCorrect === false
              ? "오답입니다. 다시 도전해 보세요."
              : result.feedback}
          {result.correctAnswer != null && (
            <pre className="mt-2 overflow-x-auto text-xs opacity-80">
              {JSON.stringify(result.correctAnswer, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
