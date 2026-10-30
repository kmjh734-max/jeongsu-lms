"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import { submitSynonymTest, type SubmitSynonymResult } from "@/app/student/vocab/actions";
import { type SynonymClientQuestion } from "@/lib/vocab/synonym-test";
import { notifyStudentTodayChanged } from "@/lib/student/today-refresh";

const LETTERS = ["①", "②", "③", "④"];

/**
 * 4단계 동반의어 객관식(테스트지처럼 한 화면에 모든 문항). 다 고르고 내면 바로 채점 결과를 보여 준다.
 * 점수와 상관없이 제출하면 5단계 종합테스트로 갈 수 있다. 다시 풀면 새 문항(보기 순서·오답이 바뀐다)이 나온다.
 */
export function VocabSynonymTest({
  setId,
  setTitle,
  questions: latestQuestions,
  attemptNumber,
  alreadyPassed,
  bestScore,
}: {
  setId: string;
  setTitle: string;
  questions: SynonymClientQuestion[];
  attemptNumber: number;
  alreadyPassed: boolean;
  bestScore: number;
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  // 제출하면 서버가 다음 회차 문항으로 화면을 새로 보낸다. 채점 결과는 낸 문항 위에 보여 줘야 정답이 맞는다
  const [submitted, setSubmitted] = useState<SynonymClientQuestion[] | null>(null);
  const questions = submitted ?? latestQuestions;
  const [result, setResult] = useState<SubmitSynonymResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setHref = `/student/vocab/${setId}`;
  const answered = questions.filter((q) => picked[q.itemId] !== undefined).length;
  const graded = new Map((result?.results ?? []).map((r) => [r.itemId, r] as const));

  async function submit() {
    if (submitting || answered < questions.length) return;
    setSubmitting(true);
    setError(null);
    setSubmitted(latestQuestions);
    const res = await submitSynonymTest(
      setId,
      questions.map((q) => ({ itemId: q.itemId, choice: picked[q.itemId] ?? -1 })),
      attemptNumber
    );
    setSubmitting(false);
    if (!res.ok) {
      setSubmitted(null);
      setError(res.message ?? "제출하지 못했어요.");
      return;
    }
    setResult(res);
    notifyStudentTodayChanged();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel="4단계"
        title="동반의어"
        progressLabel={
          result ? `채점 완료 · ${result.score}점` : `고른 문항 ${answered} / ${questions.length}`
        }
        percent={Math.round((answered / Math.max(1, questions.length)) * 100)}
      />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        {result ? (
          <div
            className={`rounded-lg border px-5 py-4 ${
              result.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className={`text-lg font-bold ${result.passed ? "text-emerald-800" : "text-amber-800"}`}>
              {result.score}점 · {result.passed ? "통과" : "응시 완료"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {result.passed
                ? "5단계 종합테스트를 시작할 수 있어요."
                : `틀린 문제의 정답을 확인해 보세요. 다시 풀어도 되고, 5단계 종합테스트로 넘어가도 돼요.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href={`${setHref}/stage4`}>5단계 종합테스트 시작</ButtonLink>
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  setSubmitted(null);
                  setPicked({});
                  router.refresh();
                }}
              >
                다시 풀기
              </Button>
              <ButtonLink href={setHref} variant="secondary">
                단어장으로
              </ButtonLink>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
            단어와 뜻이 같은 말(=) 또는 반대인 말(↔)을 고르세요. 한 번 풀면 5단계로 갈 수 있어요.
            {alreadyPassed ? ` 이미 통과했어요(최고 ${bestScore}점).` : ""}
          </p>
        )}

        <ol className="flex flex-col gap-3">
          {questions.map((q, qi) => {
            const g = graded.get(q.itemId);
            return (
              <li
                key={q.itemId}
                className={`rounded-lg border bg-white px-4 py-3.5 shadow-card sm:px-5 ${
                  g ? (g.correct ? "border-emerald-200" : "border-rose-200") : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-bold tabular-nums text-slate-400">{qi + 1}.</span>
                  <span className="text-[17px] font-bold text-slate-900">{q.word}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                      q.relation === "synonym" ? "bg-brand-50 text-brand-700" : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    {q.relation === "synonym" ? "= 동의어" : "↔ 반의어"}
                  </span>
                  {q.meaning ? <span className="text-xs text-slate-500">{q.meaning}</span> : null}
                  {g ? (
                    <span className={`ml-auto text-xs font-bold ${g.correct ? "text-emerald-700" : "text-rose-600"}`}>
                      {g.correct ? "정답" : "오답"}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {q.choices.map((c, ci) => {
                    const mine = picked[q.itemId] === ci;
                    const isAnswer = g && g.answerIndex === ci;
                    const tone = g
                      ? isAnswer
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                        : mine
                          ? "border-rose-300 bg-rose-50 text-rose-800 line-through"
                          : "border-slate-200 bg-white text-slate-500"
                      : mine
                        ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200"
                        : "border-slate-200 bg-white text-slate-800 hover:border-brand-300";
                    return (
                      <button
                        key={ci}
                        type="button"
                        disabled={Boolean(result) || submitting}
                        onClick={() => setPicked((p) => ({ ...p, [q.itemId]: ci }))}
                        className={`flex min-h-[44px] items-center gap-2 rounded-md border px-3 py-2 text-left text-[15px] font-medium transition ${tone}`}
                      >
                        <span className="text-slate-400">{LETTERS[ci]}</span>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {!result ? (
          <div className="sticky bottom-3 flex flex-col items-stretch gap-2 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-600">
              {answered < questions.length
                ? `${questions.length - answered}문항을 더 골라 주세요.`
                : "다 골랐어요. 제출하면 바로 채점해요."}
            </span>
            <Button onClick={() => void submit()} disabled={submitting || answered < questions.length}>
              {submitting ? "채점하는 중…" : "제출하기"}
            </Button>
          </div>
        ) : null}
        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}
