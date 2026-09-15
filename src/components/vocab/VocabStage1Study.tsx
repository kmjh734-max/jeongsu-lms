"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { VocabStudyHeader } from "@/components/vocab/VocabStudyHeader";
import { recordStage1Item } from "@/app/student/vocab/actions";
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
import type { VocabItem } from "@/types/database";

interface VocabStage1StudyProps {
  setId: string;
  setTitle: string;
  items: VocabItem[];
  initialSeenIds: string[];
  stage1Completed: boolean;
  /** 완료 후 이동 경로 (기본: 학생 단어장 허브) */
  hubHref?: string;
  /** 로그인 없이 localStorage에만 저장 */
  guestMode?: boolean;
}

/** 진행 칸을 하나씩 그릴 최대 단어 수 (넘으면 얇은 막대) */
const MAX_SEGMENTS = 40;

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
  hubHref,
  guestMode = false,
}: VocabStage1StudyProps) {
  const router = useRouter();
  const hub = hubHref ?? "/student/vocab";
  const setHref = hubHref ?? `/student/vocab/${setId}`;
  const [index, setIndex] = useState(() => {
    if (stage1Completed) return 0;
    const seen = new Set(initialSeenIds);
    const firstUnseen = items.findIndex((it) => !seen.has(it.id));
    return firstUnseen >= 0 ? firstUnseen : 0;
  });
  const [flipped, setFlipped] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(stage1Completed ? [] : initialSeenIds)
  );
  const seenIdsRef = useRef(seenIds);
  seenIdsRef.current = seenIds;
  const [message, setMessage] = useState<string | null>(null);
  const lastHandledRef = useRef<string | null>(null);
  const [speechOk, setSpeechOk] = useState(false);

  const total = items.length;
  const current = items[index];
  const seenCount = stage1Completed ? index + 1 : seenIds.size;
  const roundPercent =
    total > 0 ? Math.round((seenCount / total) * 100) : 0;

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
    if (!speechOk || !current || flipped) return;
    const t = window.setTimeout(() => speakEnglish(current.word), 80);
    return () => window.clearTimeout(t);
  }, [index, speechOk, current, flipped]);

  useEffect(() => () => stopSpeaking(), []);

  // 스페이스 키로 카드 뒤집기 (버튼·입력칸에 초점이 있을 때는 그대로 둔다)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== " " && e.code !== "Space") return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(el.tagName))
      ) {
        return;
      }
      e.preventDefault();
      setFlipped((f) => !f);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function finishToHub() {
    router.push(hub);
    if (!guestMode) router.refresh();
  }

  function handleResponse(known: boolean) {
    if (!current) return;

    const handleKey = `${index}-${current.id}`;
    if (lastHandledRef.current === handleKey) return;
    lastHandledRef.current = handleKey;

    const itemId = current.id;
    const currentIndex = index;

    const nextSeen = new Set(seenIdsRef.current);
    if (!stage1Completed) nextSeen.add(itemId);
    seenIdsRef.current = nextSeen;
    if (!stage1Completed) {
      setSeenIds(nextSeen);
    }

    const allSeenNow = !stage1Completed && nextSeen.size >= total;
    const atLastCard = currentIndex >= total - 1;

    if ((allSeenNow && atLastCard) || (stage1Completed && atLastCard)) {
      finishToHub();
    } else if (!atLastCard) {
      goTo(currentIndex + 1);
    } else {
      const firstUnseen = items.findIndex((it) => !nextSeen.has(it.id));
      if (firstUnseen >= 0) goTo(firstUnseen);
    }

    if (guestMode) {
      if (!stage1Completed) {
        const prev = loadExamGuestProgress(setId);
        saveExamGuestProgress(setId, {
          ...prev,
          stage1Seen: [...nextSeen],
          stage1Done: allSeenNow || prev.stage1Done,
        });
      }
      return;
    }

    void recordStage1Item(setId, itemId, known).then((result) => {
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      if (result.message.includes("1단계를 완료")) {
        router.refresh();
      }
    });
  }

  if (total === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
        단어가 없어요.
      </div>
    );
  }

  const longMeaning = (current.meaning ?? "").length > 24;

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <VocabStudyHeader
        backHref={setHref}
        backLabel={setTitle}
        stageLabel={stage1Completed ? "1단계 · 다시 보기" : "1단계"}
        title="뜻 익히기"
        progressLabel={`학습 ${seenCount} / ${total}`}
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
                {index + 1} / {total}
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

        <div className="flex min-h-[50px] w-full justify-center sm:min-h-[44px]">
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

        {total <= MAX_SEGMENTS ? (
          <div className="hidden min-w-0 flex-1 justify-center gap-1 sm:flex">
            {items.map((it, i) => {
              const done =
                i !== index &&
                (stage1Completed ? i < index : seenIds.has(it.id));
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
          {index + 1} / {total}
        </span>

        <Button
          type="button"
          variant="secondary"
          className="h-11 sm:h-9"
          disabled={index >= total - 1}
          onClick={() => goTo(index + 1)}
        >
          다음 단어
          <Icon name="chevron" size={16} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
