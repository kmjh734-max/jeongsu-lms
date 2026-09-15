"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import {
  completeStage3,
  recordStage3ExampleAttempt,
} from "@/app/student/vocab/actions";
import {
  gradeExampleBlankAnswer,
  type ExampleBlankQuestion,
} from "@/lib/vocab/example-blank";

function shuffleQuestions(questions: ExampleBlankQuestion[]): ExampleBlankQuestion[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface VocabStage3ExampleBlankProps {
  setId: string;
  setTitle: string;
  itemCount: number;
  questions: ExampleBlankQuestion[];
  excludedCount: number;
  hubHref?: string;
}

export function VocabStage3ExampleBlank({
  setId,
  setTitle,
  itemCount,
  questions: initialQuestions,
  excludedCount,
  hubHref,
}: VocabStage3ExampleBlankProps) {
  const router = useRouter();
  const hub = hubHref ?? "/student/vocab";
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  // 서버 렌더와 첫 화면이 같도록 처음엔 원래 순서, 화면에 붙은 뒤 한 번 섞는다
  const [queue, setQueue] = useState(() => initialQuestions);
  const shuffledRef = useRef(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    showAnswer: boolean;
    displayAnswer: string;
  } | null>(null);
  const [round, setRound] = useState(1);
  const [mastered, setMastered] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [autoCompleting, setAutoCompleting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  /** 같은 문제를 두 번 채점하지 않게 (Enter 연타·버튼 동시 클릭) */
  const lockRef = useRef(false);
  const finishingRef = useRef(false);
  /** 이번에 맞힌 답 — 완료할 때 서버가 다시 확인한다 */
  const correctRef = useRef(new Map<string, string>());

  const total = initialQuestions.length;
  const current = queue[0];
  const progressPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const wrong = Boolean(feedback?.showAnswer);

  useLayoutEffect(() => {
    if (shuffledRef.current) return;
    shuffledRef.current = true;
    setQueue(shuffleQuestions(initialQuestions));
    // 처음 한 번만 섞는다 (틀린 문제 다시 풀기 순서는 유지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    lockRef.current = false;
  }, [queue, feedback]);

  useEffect(() => {
    if (!current || feedback?.showAnswer) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [current, feedback]);

  const finishStage = useCallback(async () => {
    const result = await completeStage3(
      setId,
      [...correctRef.current].map(([itemId, answer]) => ({ itemId, answer }))
    );
    if (!result.ok && total > 0) {
      finishingRef.current = false;
      setFinishing(false);
      lockRef.current = false;
      setMessage(result.message);
      return;
    }
    router.push(hub);
    router.refresh();
  }, [setId, router, hub, total]);

  useEffect(() => {
    if (total > 0 || itemCount === 0 || autoCompleting) return;
    setAutoCompleting(true);
    void finishStage();
  }, [total, itemCount, autoCompleting, finishStage]);

  function checkAnswer() {
    if (!current || feedback?.showAnswer) return;
    if (lockRef.current || finishingRef.current) return;
    const trimmed = answer.trim();
    if (!trimmed) {
      setMessage("답을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    lockRef.current = true;
    setMessage(null);

    const isCorrect = gradeExampleBlankAnswer(current.acceptedAnswers, trimmed);
    const displayAnswer =
      current.acceptedAnswers.length > 1
        ? current.acceptedAnswers.join(" / ")
        : current.word;
    const attemptRound = round;

    if (isCorrect) {
      correctRef.current.set(current.itemId, trimmed);
      setMastered((m) => m + 1);
      const next = queue.slice(1);
      if (next.length === 0) {
        finishingRef.current = true;
        setFinishing(true);
        const itemId = current.itemId;
        void (async () => {
          await recordStage3ExampleAttempt(setId, itemId, trimmed, attemptRound);
          await finishStage();
        })();
        return;
      }
      void recordStage3ExampleAttempt(
        setId,
        current.itemId,
        trimmed,
        attemptRound
      );
      setQueue(next);
      setAnswer("");
      setFeedback(null);
    } else {
      void recordStage3ExampleAttempt(
        setId,
        current.itemId,
        trimmed,
        attemptRound
      );
      setFeedback({ showAnswer: true, displayAnswer });
      setRound((r) => r + 1);
    }
  }

  function continueAfterWrong() {
    if (!current || finishingRef.current) return;
    const rest = queue.slice(1);
    setQueue([...rest, current]);
    setAnswer("");
    setFeedback(null);
    setMessage(null);
  }

  if (itemCount === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  if (total === 0) {
    return (
      <EmptyQuestionsView
        backHref={setHref}
        setTitle={setTitle}
        message="예문이 있는 단어가 없어 3단계를 자동 완료합니다."
      />
    );
  }

  if (!current) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white">
          <Icon name="check" size={24} strokeWidth={2.6} />
        </span>
        <p className="text-lg font-bold text-slate-900">3단계 완료</p>
        <Button
          type="button"
          className="h-11 w-full px-5 text-[15px] sm:w-[200px]"
          onClick={() => router.push(hub)}
        >
          단어장으로
        </Button>
      </div>
    );
  }

  const [before, ...afterParts] = current.blankSentence.split("______");
  const after = afterParts.join("______");
  const hasBlank = afterParts.length > 0;

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel="3단계"
        title="예문 빈칸"
        progressLabel={`맞춘 문제 ${mastered} / ${total} · 남은 ${queue.length}개`}
        percent={progressPercent}
      />

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 sm:mt-6 sm:gap-[22px]">
        {excludedCount > 0 && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
            예문이 없는 단어 {excludedCount}개는 3단계에서 빠졌어요.
          </p>
        )}

        <div className="flex flex-col gap-[18px] rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-7">
          <p className="text-center text-[13px] font-semibold text-slate-500">
            빈칸에 들어갈 영어 단어를 입력하세요
          </p>
          <div className="flex flex-col gap-2.5">
            {current.exampleMeaning && (
              <p className="break-keep text-center text-base leading-relaxed text-slate-600">
                {current.exampleMeaning}
              </p>
            )}
            <p className="break-words text-center text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
              {hasBlank ? (
                <>
                  {before}
                  <span
                    className={`mx-0.5 inline-block min-w-[4.5em] border-b-2 px-1 text-center ${
                      wrong
                        ? "border-green-700 text-green-700"
                        : "border-brand-600"
                    }`}
                  >
                    {wrong ? feedback?.displayAnswer : "\u00a0"}
                  </span>
                  {after}
                </>
              ) : (
                current.blankSentence
              )}
            </p>
          </div>

          <input
            ref={inputRef}
            className={`h-14 w-full rounded-lg border-2 px-4 text-center text-2xl font-semibold tracking-wide transition placeholder:text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none sm:h-[60px] ${
              wrong
                ? "border-rose-600 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
            }`}
            value={answer}
            readOnly={wrong || finishing}
            onChange={(e) => {
              setAnswer(e.target.value.toLowerCase());
              if (message === "답을 입력해주세요.") setMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (wrong) {
                  if (!e.repeat) continueAfterWrong();
                } else {
                  checkAnswer();
                }
              }
            }}
            placeholder="영어 단어 입력"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label="빈칸 영어 단어 입력"
            aria-invalid={wrong || undefined}
          />

          {wrong && feedback && (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-rose-700 text-white">
                    <Icon name="x" size={14} strokeWidth={2.6} />
                  </span>
                  <span className="text-sm font-semibold text-rose-700">
                    아쉬워요
                  </span>
                  <span className="text-sm text-slate-500">정답</span>
                  <span className="break-all text-xl font-bold text-green-700">
                    {feedback.displayAnswer}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400">
                틀린 단어는 마지막에 한 번 더 나와요
              </p>
            </>
          )}
        </div>

        <div className="flex justify-center">
          {wrong ? (
            <Button
              key="next"
              type="button"
              className="h-12 w-full gap-1.5 px-5 text-[15px] sm:h-11 sm:w-[200px]"
              onClick={continueAfterWrong}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  continueAfterWrong();
                }
              }}
            >
              다음으로
              <Icon name="chevron" size={16} strokeWidth={2} />
            </Button>
          ) : (
            <Button
              key="check"
              type="button"
              className="h-12 w-full px-5 text-[15px] sm:h-11 sm:w-[200px]"
              onClick={checkAnswer}
              disabled={finishing}
            >
              {finishing ? "저장 중…" : "정답 확인"}
            </Button>
          )}
        </div>

        {message && (
          <p
            className="text-center text-sm font-medium text-amber-700"
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyQuestionsView(props: {
  backHref: string;
  setTitle: string;
  message: string;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href={props.backHref}
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1 self-start px-1 text-[13px] font-medium text-slate-500 transition hover:text-slate-900 sm:min-h-0"
      >
        <Icon name="left" size={16} />
        {props.setTitle}
      </Link>
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card">
        <p className="text-xs font-semibold text-brand-700">3단계 예문 빈칸</p>
        <p className="text-sm text-slate-700">{props.message}</p>
        <p className="text-sm text-slate-400">잠시만 기다려 주세요...</p>
      </div>
    </div>
  );
}
