"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import { submitStage4 } from "@/app/student/vocab/actions";
import {
  STAGE4_PASS_SCORE,
  scoreStage4,
  type Stage3ClientQuestion,
} from "@/lib/vocab/build-stage3-questions";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import { gradeMeaningAnswer } from "@/lib/vocab/grade-stage3";
import {
  loadExamGuestProgress,
  saveExamGuestProgress,
} from "@/lib/vocab/exam-guest-progress";

function answerKey(q: Stage3ClientQuestion): string {
  return `${q.itemId}:${q.questionType}`;
}

interface VocabStage3TestProps {
  setId: string;
  setTitle: string;
  /** 로그인 학생에게는 정답 없이 온다 (서버 채점). QR 학습만 정답 포함 */
  questions: Stage3ClientQuestion[];
  /** 화면을 연 시점의 응시 횟수 — 같은 시험을 두 번 제출하지 않게 서버가 확인 */
  attemptNumber?: number;
  stageNumber?: number;
  hubHref?: string;
  guestMode?: boolean;
}

export function VocabStage3Test({
  setId,
  setTitle,
  questions,
  attemptNumber,
  stageNumber = 4,
  hubHref,
  guestMode = false,
}: VocabStage3TestProps) {
  const router = useRouter();
  const hub = hubHref ?? "/student/vocab";
  const setHref = hubHref ?? `/student/vocab/${setId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  const current = questions[index];
  const isLast = index >= questions.length - 1;
  const currentKey = current ? answerKey(current) : "";

  useEffect(() => {
    if (!current || submitting) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [index, current, submitting]);

  const goNext = useCallback(() => {
    setMessage(null);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  function finishGuest() {
    let correct = 0;
    for (const q of questions) {
      const ans = (answers[answerKey(q)] ?? "").trim();
      const expected = q.correctAnswer ?? "";
      const ok =
        q.questionType === "spelling"
          ? gradeSpellingAnswer(expected, ans)
          : gradeMeaningAnswer(expected, ans);
      if (ok) correct += 1;
    }
    const { score, passed } = scoreStage4(correct, questions.length);
    const prev = loadExamGuestProgress(setId);
    saveExamGuestProgress(setId, {
      ...prev,
      stage4Last: score,
      stage4Best: Math.max(prev.stage4Best, score),
      stage4Passed: prev.stage4Passed || passed,
      stage4Attempts: prev.stage4Attempts + 1,
    });
    setSubmitting(false);
    router.push(
      `${hub}?score=${score}&passed=${passed ? "1" : "0"}`
    );
  }

  function submitAll() {
    if (submitting || submittingRef.current) return;

    const unanswered = questions.filter(
      (q) => !(answers[answerKey(q)] ?? "").trim()
    ).length;
    if (unanswered > 0) {
      const msg = `미응답 ${unanswered}문항은 오답 처리됩니다. 제출할까요?`;
      if (!confirm(msg)) return;
    }
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setMessage(null);

    if (guestMode) {
      finishGuest();
      return;
    }

    const payload = questions.map((q) => ({
      itemId: q.itemId,
      studentAnswer: answers[answerKey(q)] ?? "",
    }));

    void submitStage4(setId, payload, attemptNumber)
      .then((result) => {
        if (!result.ok) {
          submittingRef.current = false;
          setSubmitting(false);
          setMessage(result.message);
          return;
        }
        // 이동이 끝날 때까지 다시 제출하지 못하게 잠가 둔다
        if (result.attemptId) {
          router.push(
            `/student/vocab/${setId}/stage4/result?attemptId=${result.attemptId}`
          );
        } else {
          router.push(hub);
          router.refresh();
        }
      })
      .catch(() => {
        submittingRef.current = false;
        setSubmitting(false);
        setMessage("제출하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.");
      });
  }

  function handleEnter() {
    if (!current || submitting) return;
    const value = (answers[currentKey] ?? "").trim();
    if (!value) {
      setMessage("답을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    setMessage(null);
    if (isLast) {
      submitAll();
    } else {
      goNext();
    }
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  const isMeaning = current?.questionType === "meaning";
  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel={`${stageNumber}단계`}
        title="종합테스트"
        progressLabel={`${index + 1} / ${questions.length}`}
        percent={progressPercent}
      />

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 sm:mt-6 sm:gap-[22px]">
        <div className="flex flex-col gap-[18px] rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-[22px] items-center rounded bg-brand-50 px-2 text-xs font-semibold text-brand-700">
              {isMeaning ? "뜻 쓰기" : "스펠링"}
            </span>
            <span className="text-xs font-semibold tabular-nums text-slate-400">
              {index + 1} / {questions.length}
            </span>
          </div>
          <p className="break-words text-center text-[28px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[34px]">
            {current.questionText}
          </p>
          {current.promptExtra && (
            <p className="-mt-2 text-center text-[13px] text-slate-500">
              {current.promptExtra}
            </p>
          )}
          <input
            ref={inputRef}
            className="h-14 w-full rounded-lg border-2 border-slate-300 bg-white px-4 text-center text-2xl font-semibold text-slate-900 transition placeholder:text-lg placeholder:font-normal placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:bg-slate-50 disabled:text-slate-400 sm:h-[60px]"
            value={answers[currentKey] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [currentKey]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleEnter();
              }
            }}
            placeholder={isMeaning ? "뜻 입력" : "영어 스펠링 입력"}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label={isMeaning ? "뜻 입력" : "영어 스펠링 입력"}
            disabled={submitting}
          />
          {message && (
            <p className="text-center text-sm text-rose-700" role="status">
              {message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:mx-auto sm:w-[420px]">
          <Button
            type="button"
            variant="secondary"
            className="h-12 px-5 text-[15px] sm:h-11"
            disabled={index === 0 || submitting}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <Icon name="left" size={16} strokeWidth={2} />
            이전
          </Button>
          <Button
            type="button"
            className="h-12 px-5 text-[15px] sm:h-11"
            disabled={submitting}
            onClick={handleEnter}
          >
            {isLast ? (
              submitting ? (
                "제출 중…"
              ) : (
                "제출"
              )
            ) : (
              <>
                다음
                <Icon name="chevron" size={16} strokeWidth={2} />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">
          뜻 쓰기 50% + 스펠링 50% · {STAGE4_PASS_SCORE}점 이상이면 합격 · Enter
          키로 다음 문제로 넘어가요
        </p>
      </div>
    </div>
  );
}
