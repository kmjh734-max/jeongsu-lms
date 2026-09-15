"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { STAGE4_PASS_SCORE } from "@/lib/vocab/build-stage3-questions";
import { cleanMeaningFeedback } from "@/lib/vocab/grade-stage3";
import type { VocabFinalTestAnswer, VocabFinalTestAttempt } from "@/types/database";

interface VocabStage3ResultViewProps {
  setId: string;
  setTitle: string;
  attempt: VocabFinalTestAttempt;
  answers: VocabFinalTestAnswer[];
  stageNumber?: number;
  hubHref?: string;
  autoReturnSeconds?: number;
}

const ROW_GRID =
  "grid grid-cols-[24px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3";

function AnswerRow({ a }: { a: VocabFinalTestAnswer }) {
  const ok = a.is_correct;
  const mine = (a.student_answer ?? "").trim();
  // 예전에 저장된 내부 오류 문구("…시간이 초과" 등)는 보여 주지 않는다
  const feedback =
    a.question_type === "meaning" ? cleanMeaningFeedback(a.ai_feedback) : null;

  return (
    <li
      className={`border-t border-slate-100 px-3.5 py-2.5 ${
        ok ? "" : "bg-rose-50"
      }`}
    >
      <div className={ROW_GRID}>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            ok ? "bg-green-50 text-green-700" : "bg-rose-700 text-white"
          }`}
          aria-label={ok ? "정답" : "오답"}
        >
          <Icon name={ok ? "check" : "x"} size={ok ? 12 : 11} strokeWidth={2.8} />
        </span>
        <span className="break-words text-sm font-semibold text-slate-900">
          {a.question_text}
        </span>
        <span
          className={`break-words text-[13px] ${
            ok
              ? "text-slate-700"
              : mine
                ? "text-rose-700 line-through"
                : "text-rose-700"
          }`}
        >
          {mine || "미응답"}
        </span>
        <span
          className={`break-words text-[13px] ${
            ok ? "text-slate-500" : "font-semibold text-green-700"
          }`}
        >
          {a.correct_answer}
        </span>
      </div>
      {feedback && (
        <p className="mt-1 pl-9 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-600">피드백</span> ·{" "}
          {feedback}
        </p>
      )}
    </li>
  );
}

function AnswerTable({
  title,
  all,
  shown,
}: {
  title: string;
  all: VocabFinalTestAnswer[];
  shown: VocabFinalTestAnswer[];
}) {
  const wrongCount = all.filter((a) => !a.is_correct).length;
  return (
    <section className="self-start overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 px-3.5 pb-2.5 pt-3.5">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <span className="text-xs tabular-nums text-slate-500">
          {all.length}문항 · {wrongCount > 0 ? `${wrongCount}개 틀림` : "모두 정답"}
        </span>
      </div>
      <div
        className={`${ROW_GRID} px-3.5 py-1.5 text-[11px] font-semibold text-slate-400`}
      >
        <span />
        <span>문제</span>
        <span>내 답</span>
        <span>정답</span>
      </div>
      <ul>
        {shown.map((a) => (
          <AnswerRow key={a.id} a={a} />
        ))}
      </ul>
    </section>
  );
}

export function VocabStage3ResultView({
  setId,
  setTitle,
  attempt,
  answers,
  stageNumber = 4,
  hubHref,
  autoReturnSeconds = 0,
}: VocabStage3ResultViewProps) {
  const router = useRouter();
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  const hub = setHref;
  const wrongTotal = answers.filter((a) => !a.is_correct).length;
  // 불합격이면 틀린 문제부터 보여 준다
  const [onlyWrong, setOnlyWrong] = useState(!attempt.passed && wrongTotal > 0);
  const meaningAnswers = answers.filter((a) => a.question_type === "meaning");
  const spellingAnswers = answers.filter((a) => a.question_type === "spelling");
  const needed = Math.max(0, STAGE4_PASS_SCORE - attempt.score);
  const pick = (list: VocabFinalTestAnswer[]) =>
    onlyWrong ? list.filter((a) => !a.is_correct) : list;
  const shownMeaning = pick(meaningAnswers);
  const shownSpelling = pick(spellingAnswers);
  const wrongCount = Math.max(0, attempt.total_questions - attempt.correct_count);

  useEffect(() => {
    if (autoReturnSeconds <= 0) return;
    const t = window.setTimeout(() => {
      router.push(hub);
      router.refresh();
    }, autoReturnSeconds * 1000);
    return () => window.clearTimeout(t);
  }, [autoReturnSeconds, hub, router]);

  const submittedAt = new Date(attempt.submitted_at).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <Link
        href={setHref}
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1 self-start px-1 text-[13px] font-medium text-slate-500 transition hover:text-slate-900 sm:min-h-0"
      >
        <Icon name="left" size={16} />
        <span className="truncate">{setTitle}</span>
      </Link>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* 점수 */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:self-start">
          <div className="flex flex-col gap-4 rounded-lg bg-side px-6 py-6 text-white sm:px-[26px] sm:py-7">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-side-muted">
                {stageNumber}단계 종합테스트 결과
              </span>
              <span className="text-lg font-bold leading-snug">
                {attempt.passed
                  ? "합격! 이 단어장을 끝냈어요"
                  : needed > 0
                    ? `${needed}점만 더 올리면 합격이에요`
                    : "아쉬워요. 다시 도전해 보세요"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[56px] font-extrabold leading-none tracking-tighter tabular-nums sm:text-[64px]">
                {attempt.score}
              </span>
              <span className="text-xl font-semibold text-side-text">점</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {attempt.passed ? (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#1f7a4d] px-3 text-[13px] font-bold">
                  <Icon name="trophy" size={14} strokeWidth={2} />
                  합격
                </span>
              ) : (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-rose-700 px-3 text-[13px] font-bold">
                  불합격
                </span>
              )}
              <span className="text-[13px] text-side-text">
                {STAGE4_PASS_SCORE}점 이상 합격
              </span>
            </div>
            <div className="h-px bg-[#223a58]" />
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["정답", attempt.correct_count],
                  ["오답", wrongCount],
                  ["문항", attempt.total_questions],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-side-muted">{label}</span>
                  <span className="text-xl font-bold tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {attempt.passed ? (
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <ButtonLink href={hub} className="h-11 w-full px-5 text-[15px]">
                단어장으로
              </ButtonLink>
              <ButtonLink
                href={`/student/vocab/${setId}/stage4`}
                variant="secondary"
                className="h-11 w-full px-5 text-[15px]"
              >
                <Icon name="rotate" size={16} strokeWidth={2} />
                한 번 더 풀기
              </ButtonLink>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <ButtonLink
                href={`/student/vocab/${setId}/stage4`}
                className="h-11 w-full px-5 text-[15px]"
              >
                <Icon name="rotate" size={16} strokeWidth={2} />
                다시 도전하기
              </ButtonLink>
              <ButtonLink
                href={hub}
                variant="secondary"
                className="h-11 w-full px-5 text-[15px]"
              >
                단어장으로
              </ButtonLink>
            </div>
          )}
          {!attempt.passed && wrongTotal > 0 && (
            <p className="text-center text-xs leading-relaxed text-slate-500">
              틀린 {wrongTotal}문제의 정답을 먼저 확인하고 다시 도전해 보세요.
              다시 풀면 뜻 쓰기·스펠링 문제가 새로 섞여요.
            </p>
          )}
          <p className="text-center text-xs text-slate-400">
            {submittedAt} 제출
          </p>
        </div>

        {/* 문항별 결과 */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white"
              role="tablist"
            >
              {(
                [
                  [false, "전체", answers.length],
                  [true, "틀린 문제만", wrongTotal],
                ] as const
              ).map(([value, label, count]) => {
                const on = onlyWrong === value;
                return (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setOnlyWrong(value)}
                    className={`flex h-9 items-center gap-1.5 px-3.5 text-[13px] font-semibold transition ${
                      on
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                    <span className="tabular-nums text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-500">
              틀린 문제는 빨간색으로 표시돼요
            </span>
          </div>

          {shownMeaning.length === 0 && shownSpelling.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-card">
              {onlyWrong ? "틀린 문제가 없어요. 모두 맞혔어요!" : "문항이 없어요."}
            </div>
          ) : (
            <div className="grid gap-4 min-[1400px]:grid-cols-2">
              {shownMeaning.length > 0 && (
                <AnswerTable
                  title="뜻 문제"
                  all={meaningAnswers}
                  shown={shownMeaning}
                />
              )}
              {shownSpelling.length > 0 && (
                <AnswerTable
                  title="스펠링 문제"
                  all={spellingAnswers}
                  shown={shownSpelling}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
