"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import { VocabStageComplete } from "@/components/vocab/VocabStageComplete";
import { recordStage1Items } from "@/app/student/vocab/actions";
import {
  isSpeechSupported,
  speakEnglish,
  stopSpeaking,
} from "@/lib/vocab/speak-client";
import { wordsMatchForBlank } from "@/lib/vocab/example-blank";
import {
  loadExamGuestProgress,
  saveExamGuestProgress,
} from "@/lib/vocab/exam-guest-progress";
import { useStudyRecorder } from "@/lib/vocab/use-study-recorder";
import type { VocabItem } from "@/types/database";

interface VocabStage1StudyProps {
  setId: string;
  setTitle: string;
  items: VocabItem[];
  initialSeenIds: string[];
  stage1Completed: boolean;
  /** 지난번까지의 알아요/몰라요 (이어 할 때 완료 화면 집계용) */
  initialStatuses?: Record<string, "known" | "review">;
  /** 단어장(단계 목록) 경로 (기본: 학생 단어장 화면) */
  hubHref?: string;
  /** 완료 화면의 다음 단계 버튼 (없으면 단어장 버튼만) */
  nextHref?: string;
  nextLabel?: string;
  /** 로그인 없이 localStorage에만 저장 */
  guestMode?: boolean;
}

/** 진행 칸을 하나씩 그릴 최대 단어 수 (넘으면 얇은 막대) */
const MAX_SEGMENTS = 40;

type Phase = "study" | "saving" | "done" | "error";
type Response = { itemId: string; known: boolean };

/** 예문 속 단어(변화형 포함)를 파란 글씨로 강조 */
function HighlightedExample({ sentence, word }: { sentence: string; word: string }) {
  const target = word.trim();
  const parts = sentence.split(/([\w'-]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        const isToken = i % 2 === 1;
        const hit =
          isToken &&
          (target.length < 3
            ? part.toLowerCase() === target.toLowerCase()
            : wordsMatchForBlank(target, part));
        return hit ? (
          <b key={i} className="font-semibold text-brand-700">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

export function VocabStage1Study({
  setId,
  setTitle,
  items,
  initialSeenIds,
  stage1Completed,
  initialStatuses,
  hubHref,
  nextHref,
  nextLabel,
  guestMode = false,
}: VocabStage1StudyProps) {
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  // 지금 단어장에 있는 단어만 센다 (지워진 단어 기록으로 일찍 끝나지 않게)
  const [validSeenIds] = useState(() => {
    const current = new Set(items.map((it) => it.id));
    return initialSeenIds.filter((id) => current.has(id));
  });
  /** 지금 넘기는 카드 묶음 (처음엔 전체, 끝낸 뒤 '몰라요 다시 보기'면 그 단어들) */
  const [deck, setDeck] = useState<VocabItem[]>(items);
  const [reviewPass, setReviewPass] = useState(false);
  // 저장 뒤 화면을 새로 받으면 stage1Completed가 true로 바뀐다. 처음 끝낸 것인지는 들어올 때 값으로 판단한다.
  const [completedAtStart] = useState(stage1Completed);
  const [index, setIndex] = useState(() => {
    if (stage1Completed) return 0;
    const seen = new Set(validSeenIds);
    const firstUnseen = items.findIndex((it) => !seen.has(it.id));
    return firstUnseen >= 0 ? firstUnseen : 0;
  });
  const [flipped, setFlipped] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(stage1Completed ? [] : validSeenIds)
  );
  const seenIdsRef = useRef(seenIds);
  seenIdsRef.current = seenIds;
  const [message, setMessage] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);
  const [speechOk, setSpeechOk] = useState(false);
  const [phase, setPhase] = useState<Phase>("study");
  const [saveError, setSaveError] = useState<string | null>(null);
  /** 단어별 마지막 답 (true = 알아요) — 지난번 기록 + 이번 기록 */
  const statusRef = useRef<Map<string, boolean>>(
    new Map(
      Object.entries(initialStatuses ?? {}).map(([id, st]) => [id, st === "known"])
    )
  );
  const [summary, setSummary] = useState<{ known: number; unknown: VocabItem[] }>({
    known: 0,
    unknown: [],
  });

  /** 1단계를 처음 끝내는 중인지 (본 카드를 세고, 다 보면 완료) */
  const trackSeen = !stage1Completed && !reviewPass;
  const trackSeenRef = useRef(trackSeen);
  trackSeenRef.current = trackSeen;
  const total = items.length;
  const deckTotal = deck.length;
  const current = deck[index];
  const seenCount = trackSeen ? seenIds.size : Math.min(index + 1, deckTotal);
  const countTotal = trackSeen ? total : deckTotal;
  const roundPercent =
    countTotal > 0 ? Math.round((seenCount / countTotal) * 100) : 0;

  const recorder = useStudyRecorder<Response>({
    stage: 1,
    setId,
    enabled: !guestMode,
    // 동시에 저장될 때 서로 덮어쓰지 않게 지금까지 본 카드를 함께 보낸다
    extra: () =>
      trackSeenRef.current ? { seenIds: [...seenIdsRef.current] } : {},
    onError: (msg) => setMessage(msg),
  });

  useEffect(() => {
    setSpeechOk(isSpeechSupported());
  }, []);

  const goTo = useCallback((next: number) => {
    stopSpeaking();
    lastHandledRef.current = null;
    setIndex(next);
    setFlipped(false);
    setMessage(null);
  }, []);

  useEffect(() => {
    if (phase !== "study" || !speechOk || !current || flipped) return;
    const t = window.setTimeout(() => speakEnglish(current.word), 80);
    return () => window.clearTimeout(t);
  }, [index, speechOk, current, flipped, phase]);

  useEffect(() => () => stopSpeaking(), []);

  /** 마지막 카드 뒤: 남은 기록을 저장하고 완료 화면으로 */
  async function saveAndFinish(firstPass: boolean) {
    stopSpeaking();
    setSummary({
      known: items.filter((it) => statusRef.current.get(it.id) === true).length,
      unknown: items.filter((it) => statusRef.current.get(it.id) === false),
    });
    if (guestMode) {
      setPhase("done");
      return;
    }
    setPhase("saving");
    setSaveError(null);
    // 처음 끝낼 때는 서버 액션으로 마무리한다 (완료를 확인하고 단어장 화면 캐시를 새로 고친다)
    const result = firstPass
      ? await recorder.flush((batch) =>
          recordStage1Items(setId, batch, [...seenIdsRef.current])
        )
      : await recorder.flush();
    if (!result.ok) {
      setSaveError(result.message);
      setPhase("error");
      return;
    }
    if (firstPass && result.completed === false) {
      setSaveError("아직 넘기지 않은 카드가 있어요. 새로고침한 뒤 이어서 넘겨 주세요.");
      setPhase("error");
      return;
    }
    setPhase("done");
  }

  function handleResponse(known: boolean) {
    if (!current || phase !== "study") return;

    const handleKey = `${reviewPass ? "r" : "f"}-${index}-${current.id}`;
    if (lastHandledRef.current === handleKey) return;
    lastHandledRef.current = handleKey;

    const itemId = current.id;
    const currentIndex = index;
    statusRef.current.set(itemId, known);

    const nextSeen = new Set(seenIdsRef.current);
    if (trackSeen) {
      nextSeen.add(itemId);
      seenIdsRef.current = nextSeen;
      setSeenIds(nextSeen);
    }

    if (guestMode) {
      if (trackSeen) {
        const prev = loadExamGuestProgress(setId);
        saveExamGuestProgress(setId, {
          ...prev,
          stage1Seen: [...nextSeen],
          stage1Done: nextSeen.size >= total || prev.stage1Done,
        });
      }
    } else {
      // 답마다 서버를 기다리지 않는다 — 모아서 보내고 바로 다음 카드
      recorder.push({ itemId, known });
    }

    const atLastCard = currentIndex >= deckTotal - 1;
    const allSeenNow = trackSeen && nextSeen.size >= total;

    if (allSeenNow || (!trackSeen && atLastCard)) {
      void saveAndFinish(allSeenNow);
    } else if (!atLastCard) {
      goTo(currentIndex + 1);
    } else {
      const firstUnseen = deck.findIndex((it) => !nextSeen.has(it.id));
      if (firstUnseen >= 0) goTo(firstUnseen);
    }
  }

  function startUnknownReview() {
    if (summary.unknown.length === 0) return;
    setDeck(summary.unknown);
    setReviewPass(true);
    setPhase("study");
    goTo(0);
  }

  // 키보드: 스페이스 = 카드 뒤집기, 뒤집은 뒤 ← 몰라요 · → 알아요
  // (버튼·입력칸에 초점이 있을 때 스페이스는 그대로 둔다)
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (phase !== "study") return;
    const el = e.target as HTMLElement | null;
    if (
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      (el &&
        (el.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)))
    ) {
      return;
    }
    if (e.key === " " || e.code === "Space") {
      if (el && ["BUTTON", "A"].includes(el.tagName)) return;
      e.preventDefault();
      setFlipped((f) => !f);
      return;
    }
    if (!flipped || e.repeat) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleResponse(true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleResponse(false);
    }
  };
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (total === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  if (phase !== "study") {
    const firstFinish = !completedAtStart && !reviewPass;
    const unknownCount = summary.unknown.length;
    return (
      <div className="flex w-full flex-col gap-5 sm:gap-6">
        <VocabStudyHeader
          backHref={setHref}
          backLabel={setTitle}
          stageLabel="1단계"
          title="뜻 익히기"
          progressLabel={
            reviewPass ? `다시 보기 ${deckTotal} / ${deckTotal}` : `학습 ${total} / ${total}`
          }
          percent={100}
        />
        <VocabStageComplete
          phase={phase}
          stageLabel="1단계 · 뜻 익히기"
          title={firstFinish ? "1단계 완료!" : "다시 보기 완료!"}
          subtitle={
            reviewPass
              ? `몰라요 단어 ${deckTotal}개를 다시 봤어요`
              : firstFinish
                ? `${total}개 단어를 모두 익혔어요${nextHref ? ". 이제 스펠링을 연습해요." : ""}`
                : `${total}개 단어를 다시 봤어요`
          }
          stats={[
            { label: "알아요", value: summary.known, tone: "good" },
            {
              label: "몰라요",
              value: unknownCount,
              tone: unknownCount > 0 ? "bad" : "neutral",
            },
            { label: "전체 단어", value: total },
          ]}
          reviewTitle="몰라요 한 단어"
          reviewWords={summary.unknown.map((it) => ({
            id: it.id,
            word: it.word,
            meaning: it.meaning,
          }))}
          errorMessage={saveError}
          onRetry={() => void saveAndFinish(firstFinish)}
          next={nextHref ? { href: nextHref, label: nextLabel ?? "2단계 시작" } : null}
          back={{ href: setHref, label: "단어장으로" }}
          extraAction={
            unknownCount > 0
              ? { label: `몰라요 단어 ${unknownCount}개 다시 보기`, onClick: startUnknownReview }
              : null
          }
          notifyToday={!guestMode && firstFinish}
        />
      </div>
    );
  }

  const longMeaning = (current.meaning ?? "").length > 24;

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel={
          reviewPass
            ? "1단계 · 몰라요 단어 다시 보기"
            : stage1Completed
              ? "1단계 · 다시 보기"
              : "1단계"
        }
        title="뜻 익히기"
        progressLabel={
          trackSeen ? `학습 ${seenCount} / ${total}` : `${seenCount} / ${deckTotal}`
        }
        percent={roundPercent}
      />

      <div className="flex flex-col items-center gap-4 sm:gap-5">
        <div
          className="relative w-full max-w-[640px]"
          style={{ perspective: "1200px" }}
        >
          <div
            key={current.id}
            role="button"
            tabIndex={0}
            aria-label={flipped ? "카드 앞면 보기" : "뜻 보기"}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className={`relative h-[min(62vh,480px)] min-h-[340px] w-full cursor-pointer rounded-xl transition-transform duration-300 [transform-style:preserve-3d] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:h-[380px] sm:min-h-0 ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* 앞면: 영어 단어 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-6 shadow-[0_10px_30px_rgba(15,26,42,0.08)] [backface-visibility:hidden] sm:gap-[18px]">
              <span className="absolute left-5 top-5 text-xs font-semibold text-slate-400 sm:left-6">
                영어 단어
              </span>
              <span className="absolute right-5 top-5 text-xs font-semibold tabular-nums text-slate-400 sm:right-6">
                {index + 1} / {deckTotal}
              </span>
              <p className="max-w-full break-words text-center text-[40px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[56px]">
                {current.word}
              </p>
              {speechOk && (
                <button
                  type="button"
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-[13px] font-semibold text-brand-700 transition hover:bg-brand-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(current.word);
                  }}
                >
                  <Icon name="speaker" size={16} />
                  발음 듣기
                </button>
              )}
              <span className="absolute bottom-5 left-6 right-6 text-center text-[13px] text-slate-400">
                <span className="hidden sm:inline">
                  카드를 누르거나 스페이스 키를 누르면 뜻이 보여요
                </span>
                <span className="sm:hidden">카드를 누르면 뜻이 보여요</span>
              </span>
            </div>

            {/* 뒷면: 뜻 · 예문 */}
            <div className="absolute inset-0 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-[22px] shadow-[0_10px_30px_rgba(15,26,42,0.08)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  뜻 · 예문
                </span>
                {speechOk && (
                  <button
                    type="button"
                    aria-label="발음 듣기"
                    className="-mr-2 -mt-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-700 transition hover:bg-brand-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglish(current.word);
                    }}
                  >
                    <Icon name="speaker" size={18} />
                  </button>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p className="break-words text-base font-semibold text-slate-500">
                  {current.word}
                </p>
                <p
                  className={`mt-2 whitespace-pre-line break-keep font-bold leading-tight tracking-tight text-slate-900 ${
                    longMeaning ? "text-2xl" : "text-[30px] sm:text-[34px]"
                  }`}
                >
                  {current.meaning}
                </p>
              </div>
              {current.example_sentence && (
                <div className="max-h-[45%] shrink-0 overflow-y-auto rounded-lg bg-slate-50 p-3.5">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-900">
                    <HighlightedExample
                      sentence={current.example_sentence}
                      word={current.word}
                    />
                  </p>
                  {current.example_meaning && (
                    <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-500">
                      {current.example_meaning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-[50px] w-full flex-col items-center gap-1.5 sm:min-h-[44px]">
          {flipped ? (
            <div className="grid w-full grid-cols-2 gap-2.5 sm:w-[420px]">
              <Button
                type="button"
                variant="secondary"
                className="h-[50px] text-base sm:h-11 sm:text-[15px]"
                onClick={() => handleResponse(false)}
              >
                몰라요
              </Button>
              <Button
                type="button"
                className="h-[50px] text-base sm:h-11 sm:text-[15px]"
                onClick={() => handleResponse(true)}
              >
                알아요
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="h-[50px] w-full px-5 text-base sm:h-11 sm:w-[200px] sm:text-[15px]"
              onClick={() => setFlipped(true)}
            >
              뜻 보기
            </Button>
          )}
          <p className="hidden text-xs text-slate-400 sm:block">
            {flipped
              ? "키보드 ← 몰라요 · → 알아요"
              : "스페이스 키로 뜻 보기"}
          </p>
        </div>

        {message && (
          <p className="text-center text-sm text-rose-700" role="status">
            {message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          className="h-11 sm:h-9"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          <Icon name="left" size={16} strokeWidth={2} />
          이전 단어
        </Button>

        {deckTotal <= MAX_SEGMENTS ? (
          <div className="hidden min-w-0 flex-1 justify-center gap-1 sm:flex">
            {deck.map((it, i) => {
              const done =
                i !== index && (trackSeen ? seenIds.has(it.id) : i < index);
              return (
                <span
                  key={it.id}
                  className={`h-1 max-w-[10px] flex-1 rounded-sm ${
                    i === index
                      ? "bg-brand-600"
                      : done
                        ? "bg-green-700"
                        : "bg-slate-200"
                  }`}
                />
              );
            })}
          </div>
        ) : (
          <div className="hidden min-w-0 max-w-md flex-1 sm:block">
            <div className="h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-green-700 transition-all duration-300"
                style={{ width: `${roundPercent}%` }}
              />
            </div>
          </div>
        )}
        <span className="text-sm tabular-nums text-slate-500 sm:hidden">
          {index + 1} / {deckTotal}
        </span>

        <Button
          type="button"
          variant="secondary"
          className="h-11 sm:h-9"
          disabled={index >= deckTotal - 1}
          onClick={() => goTo(index + 1)}
        >
          다음 단어
          <Icon name="chevron" size={16} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
