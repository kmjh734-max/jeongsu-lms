"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import {
  completeStage2,
  recordStage2Attempt,
} from "@/app/student/vocab/actions";
import { gradeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import { isSpeechSupported, speakEnglish } from "@/lib/vocab/speak-client";
import {
  loadExamGuestProgress,
  saveExamGuestProgress,
} from "@/lib/vocab/exam-guest-progress";
import type { VocabItem } from "@/types/database";

function shuffleIds(ids: string[]): string[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface VocabStage2SpellingProps {
  setId: string;
  setTitle: string;
  items: VocabItem[];
  hubHref?: string;
  guestMode?: boolean;
}

export function VocabStage2Spelling({
  setId,
  setTitle,
  items,
  hubHref,
  guestMode = false,
}: VocabStage2SpellingProps) {
  const router = useRouter();
  const hub = hubHref ?? "/student/vocab";
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const itemById = new Map(items.map((i) => [i.id, i]));
  const [queue, setQueue] = useState(() => shuffleIds(items.map((i) => i.id)));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    showAnswer: boolean;
  } | null>(null);
  const [round, setRound] = useState(1);
  const [mastered, setMastered] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [speechOk, setSpeechOk] = useState(false);

  const total = items.length;
  const currentId = queue[0];
  const current = currentId ? itemById.get(currentId) : undefined;
  const progressPercent =
    total > 0 ? Math.round((mastered / total) * 100) : 0;
  const wrong = Boolean(feedback?.showAnswer);

  useEffect(() => {
    setSpeechOk(isSpeechSupported());
  }, []);

  useEffect(() => {
    if (!current || feedback?.showAnswer) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [currentId, current, feedback]);

  function checkAnswer() {
    if (!current || feedback?.showAnswer) return;
    const trimmed = answer.trim();
    if (!trimmed) {
      setMessage("답을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    setMessage(null);

    const isCorrect = gradeSpellingAnswer(current.word, trimmed);
    const itemId = current.id;
    const attemptRound = round;

    if (isCorrect) {
      setMastered((m) => m + 1);
      const next = queue.slice(1);
      if (next.length === 0) {
        void (async () => {
          if (guestMode) {
            const prev = loadExamGuestProgress(setId);
            saveExamGuestProgress(setId, { ...prev, stage2Done: true });
            router.push(hub);
            return;
          }
          await recordStage2Attempt(
            setId,
            itemId,
            trimmed,
            true,
            attemptRound
          );
          await completeStage2(setId);
          router.push(hub);
          router.refresh();
        })();
        return;
      }
      if (!guestMode) {
        void recordStage2Attempt(setId, itemId, trimmed, true, attemptRound);
      }
      setQueue(next);
      setAnswer("");
      setFeedback(null);
    } else {
      if (!guestMode) {
        void recordStage2Attempt(setId, itemId, trimmed, false, attemptRound);
      }
      setFeedback({ correct: false, showAnswer: true });
      setRound((r) => r + 1);
    }
  }

  function continueAfterWrong() {
    if (!current) return;
    const rest = queue.slice(1);
    setQueue([...rest, current.id]);
    setAnswer("");
    setFeedback(null);
    setMessage(null);
  }

  if (total === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white">
          <Icon name="check" size={24} strokeWidth={2.6} />
        </span>
        <p className="text-lg font-bold text-slate-900">2단계 완료</p>
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

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel="2단계"
        title="스펠링"
        progressLabel={`맞춘 단어 ${mastered} / ${total} · 남은 ${queue.length}개`}
        percent={progressPercent}
      />

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 sm:mt-6 sm:gap-[22px]">
        <div className="flex flex-col gap-[18px] rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-7">
          <p className="text-center text-[13px] font-semibold text-slate-500">
            한글 뜻에 맞는 영어 단어를 입력하세요
          </p>
          <p className="break-keep text-center text-[28px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[34px]">
            {current.meaning}
          </p>

          <input
            ref={inputRef}
            className={`h-14 w-full rounded-lg border-2 px-4 text-center text-2xl font-semibold tracking-wide transition placeholder:text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none sm:h-[60px] ${
              wrong
                ? "border-rose-600 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
            }`}
            value={answer}
            readOnly={wrong}
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
            placeholder="영어 스펠링 입력"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label="영어 스펠링 입력"
            aria-invalid={wrong || undefined}
          />

          {wrong && (
            <>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-rose-700 text-white">
                    <Icon name="x" size={14} strokeWidth={2.6} />
                  </span>
                  <span className="text-sm font-semibold text-rose-700">
                    아쉬워요
                  </span>
                  <span className="text-sm text-slate-500">정답</span>
                  <span className="break-all text-xl font-bold text-green-700">
                    {current.word}
                  </span>
                </div>
                {speechOk && (
                  <button
                    type="button"
                    aria-label="정답 발음 듣기"
                    className="-mr-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-brand-700"
                    onClick={() => speakEnglish(current.word)}
                  >
                    <Icon name="speaker" size={18} />
                  </button>
                )}
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
            >
              정답 확인
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
