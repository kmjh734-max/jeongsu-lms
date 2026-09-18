"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import {
  VocabStageComplete,
  type StageCompletePhase,
} from "@/components/vocab/VocabStageComplete";
import { completeStage3 } from "@/app/student/vocab/actions";
import {
  gradeExampleBlankAnswer,
  type ExampleBlankQuestion,
} from "@/lib/vocab/example-blank";
import { useStudyRecorder } from "@/lib/vocab/use-study-recorder";

function shuffleQuestions(questions: ExampleBlankQuestion[]): ExampleBlankQuestion[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 버튼을 눌러도 입력칸 초점(휴대폰 키보드)이 유지되게 */
const keepInputFocus = (e: MouseEvent) => e.preventDefault();

/** 정답을 맞힌 뒤 위쪽에 잠깐 보여 주는 표시 (다음 문제는 바로 나온다) */
const CORRECT_FLASH_MS = 1100;

interface VocabStage3ExampleBlankProps {
  setId: string;
  setTitle: string;
  itemCount: number;
  questions: ExampleBlankQuestion[];
  excludedCount: number;
  /** 지난번에 이미 맞힌 문제의 단어 (이어 하기) */
  initialCorrectIds?: string[];
  hubHref?: string;
  /** 완료 화면의 다음 단계 버튼 */
  nextHref?: string;
  nextLabel?: string;
}

type Attempt = { itemId: string; answer: string; round: number };

function displayAnswerOf(q: ExampleBlankQuestion): string {
  return q.acceptedAnswers.length > 1 ? q.acceptedAnswers.join(" / ") : q.word;
}

export function VocabStage3ExampleBlank({
  setId,
  setTitle,
  itemCount,
  questions: initialQuestions,
  excludedCount,
  initialCorrectIds = [],
  hubHref,
  nextHref,
  nextLabel,
}: VocabStage3ExampleBlankProps) {
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumedIds] = useState(() => {
    const ids = new Set(initialQuestions.map((q) => q.itemId));
    return initialCorrectIds.filter((id) => ids.has(id));
  });
  const [resumedCount, setResumedCount] = useState(resumedIds.length);
  // 서버 렌더와 첫 화면이 같도록 처음엔 원래 순서, 화면에 붙은 뒤 한 번 섞는다
  const [queue, setQueue] = useState(() => {
    const done = new Set(resumedIds);
    return initialQuestions.filter((q) => !done.has(q.itemId));
  });
  const shuffledRef = useRef(false);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [round, setRound] = useState(1);
  const [mastered, setMastered] = useState(resumedIds.length);
  const [message, setMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<"study" | StageCompletePhase>("study");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ word: string; n: number } | null>(null);
  /** 이번에 한 번이라도 틀린 문제 */
  const [wrongQs, setWrongQs] = useState<ExampleBlankQuestion[]>([]);
  /** 같은 문제를 두 번 채점하지 않게 (Enter 연타·버튼 동시 클릭) */
  const lockRef = useRef(false);
  /** 이번에 맞힌 답 — 완료할 때 서버가 다시 확인한다 */
  const correctRef = useRef(new Map<string, string>());

  const recorder = useStudyRecorder<Attempt>({
    stage: 3,
    setId,
    enabled: true,
    onError: (msg) => setMessage(msg),
  });

  const total = initialQuestions.length;
  const current = queue[0];
  const progressPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  useLayoutEffect(() => {
    if (shuffledRef.current) return;
    shuffledRef.current = true;
    setQueue((q) => shuffleQuestions(q));
    // 처음 한 번만 섞는다 (틀린 문제 다시 풀기 순서는 유지)
  }, []);

  useEffect(() => {
    lockRef.current = false;
  }, [queue, wrong]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), CORRECT_FLASH_MS);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (phase !== "study" || !current) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [current, wrong, phase]);

  // 다 풀었거나(마지막 정답) 풀 문제가 없으면 완료 저장
  const autoFinishRef = useRef(false);
  useEffect(() => {
    if (autoFinishRef.current || itemCount === 0 || queue.length > 0) return;
    if (phase !== "study") return;
    autoFinishRef.current = true;
    void finishStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length, itemCount, phase]);

  async function finishStage() {
    setPhase("saving");
    setSaveError(null);
    // 남은 입력 기록과 완료 확인을 함께 보낸다 (완료는 맞힌 답으로 서버가 다시 확인)
    const [, result] = await Promise.all([
      recorder.flush(),
      completeStage3(
        setId,
        [...correctRef.current].map(([itemId, answer]) => ({ itemId, answer }))
      ).catch(() => ({
        ok: false as const,
        message: "인터넷 연결을 확인하고 다시 저장해 주세요.",
      })),
    ]);
    if (!result.ok) {
      setSaveError(result.message);
      setPhase("error");
      return;
    }
    setPhase("done");
  }

  function checkAnswer() {
    if (!current || wrong || phase !== "study") return;
    if (lockRef.current) return;
    // 답을 비우고 누르면 '모름' — 틀린 것으로 보고 정답을 보여 준다
    const trimmed = answer.trim();
    lockRef.current = true;
    setMessage(null);

    const isCorrect = trimmed ? gradeExampleBlankAnswer(current.acceptedAnswers, trimmed) : false;
    recorder.push({ itemId: current.itemId, answer: trimmed, round });

    if (isCorrect) {
      correctRef.current.set(current.itemId, trimmed);
      setMastered((m) => m + 1);
      setFlash((f) => ({ word: trimmed, n: (f?.n ?? 0) + 1 }));
      setQueue(queue.slice(1));
      setAnswer("");
    } else {
      setWrong(true);
      setWrongQs((qs) =>
        qs.some((q) => q.itemId === current.itemId) ? qs : [...qs, current]
      );
      setRound((r) => r + 1);
    }
  }

  function continueAfterWrong() {
    if (!current || phase !== "study") return;
    const rest = queue.slice(1);
    setQueue([...rest, current]);
    setAnswer("");
    setWrong(false);
    setMessage(null);
    inputRef.current?.focus();
  }

  function restartAll() {
    setQueue(shuffleQuestions(initialQuestions));
    setMastered(0);
    setResumedCount(0);
    setWrongQs([]);
    setAnswer("");
    setWrong(false);
    setMessage(null);
    correctRef.current.clear();
    inputRef.current?.focus();
  }

  if (itemCount === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  if (phase !== "study" || !current) {
    const answeredNow = total - resumedCount;
    return (
      <div className="flex w-full flex-col gap-5 sm:gap-6">
        <VocabStudyHeader
          backHref={setHref}
          backLabel={setTitle}
          stageLabel="3단계"
          title="예문 빈칸"
          progressLabel={`맞춘 문제 ${total} / ${total}`}
          percent={100}
        />
        <VocabStageComplete
          phase={phase === "study" ? "saving" : phase}
          stageLabel="3단계 · 예문 빈칸"
          title="3단계 완료!"
          subtitle={
            total === 0
              ? "예문이 있는 단어가 없어 3단계는 바로 넘어가요"
              : `예문 빈칸 ${total}문제를 모두 맞혔어요${
                  resumedCount > 0 ? ` (지난번에 맞힌 ${resumedCount}개 포함)` : ""
                }`
          }
          stats={
            total === 0
              ? []
              : [
                  {
                    label: "한 번에 맞힘",
                    value: Math.max(0, answeredNow - wrongQs.length),
                    tone: "good",
                  },
                  {
                    label: "틀렸던 문제",
                    value: wrongQs.length,
                    tone: wrongQs.length > 0 ? "bad" : "neutral",
                  },
                  { label: "전체 문제", value: total },
                ]
          }
          reviewTitle="틀렸던 단어"
          reviewWords={wrongQs.map((q) => ({
            id: q.itemId,
            word: displayAnswerOf(q),
            meaning: q.exampleMeaning,
          }))}
          errorMessage={saveError}
          onRetry={() => void finishStage()}
          next={nextHref ? { href: nextHref, label: nextLabel ?? "종합테스트 시작" } : null}
          back={{ href: setHref, label: "단어장으로" }}
          notifyToday
        />
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

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 sm:mt-2 sm:gap-[22px]">
        {excludedCount > 0 && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
            예문이 없는 단어 {excludedCount}개는 3단계에서 빠졌어요.
          </p>
        )}
        {resumedCount > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-brand-100 bg-brand-50 px-3.5 py-2 text-[13px] text-brand-700">
            <span>지난번에 맞힌 {resumedCount}개는 건너뛰고 이어서 풀어요</span>
            <button
              type="button"
              onMouseDown={keepInputFocus}
              onClick={restartAll}
              className="shrink-0 font-semibold underline-offset-2 hover:underline"
            >
              처음부터
            </button>
          </div>
        )}

        <div className="flex flex-col gap-[18px] rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-7">
          <p
            className={`flex h-5 items-center justify-center gap-1 text-center text-[13px] font-semibold ${
              flash ? "text-green-700" : "text-slate-500"
            }`}
            aria-live="polite"
          >
            {flash ? (
              <>
                <Icon name="check" size={14} strokeWidth={2.6} />
                정답! {flash.word}
              </>
            ) : (
              "빈칸에 들어갈 영어 단어를 입력하세요"
            )}
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
                    {wrong ? displayAnswerOf(current) : " "}
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
                ? "border-rose-600 bg-rose-50 text-rose-700 caret-transparent"
                : "border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
            }`}
            value={answer}
            onChange={(e) => {
              // 틀린 답을 보여 주는 동안에는 입력을 받지 않는다 (키보드는 그대로 둔다)
              if (wrong) return;
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
            enterKeyHint="next"
            aria-label="빈칸 영어 단어 입력"
            aria-invalid={wrong || undefined}
          />

          {wrong && (
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
                    {displayAnswerOf(current)}
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400">
                틀린 문제는 마지막에 한 번 더 나와요 · Enter로 다음
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
              onMouseDown={keepInputFocus}
              onClick={continueAfterWrong}
            >
              다음으로
              <Icon name="chevron" size={16} strokeWidth={2} />
            </Button>
          ) : (
            <Button
              key="check"
              type="button"
              className="h-12 w-full px-5 text-[15px] sm:h-11 sm:w-[200px]"
              onMouseDown={keepInputFocus}
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
