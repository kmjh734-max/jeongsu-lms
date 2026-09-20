"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { StudentAudioBar } from "@/components/listening/StudentAudioBar";

export interface ListeningAudioItem {
  orderIndex: number;
  audioUrl: string | null;
}

interface StudentListeningAudioHubProps {
  setTitle: string;
  items: ListeningAudioItem[];
  /** Exam hub 안에 넣을 때 바깥 레이아웃 생략 */
  embedded?: boolean;
  /** 상단 고정 영역용 촘촘한 레이아웃 */
  compact?: boolean;
}

export function StudentListeningAudioHub({
  setTitle,
  items,
  embedded = false,
  compact = false,
}: StudentListeningAudioHubProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<"idle" | "all" | "single">("idle");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [queuePos, setQueuePos] = useState(0);

  const playable = items.filter((i) => i.audioUrl);
  const currentItem =
    mode === "all" && playable.length > 0
      ? playable[Math.min(queuePos, playable.length - 1)]
      : mode === "single" && activeIndex != null
        ? items.find((i) => i.orderIndex === activeIndex) ?? null
        : null;

  const playNextInQueue = useCallback(() => {
    setQueuePos((pos) => {
      const next = pos + 1;
      if (next >= playable.length) {
        setMode("idle");
        return 0;
      }
      return next;
    });
  }, [playable.length]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentItem?.audioUrl) return;
    el.load();
    void el.play().catch(() => {
      /* 사용자가 재생 버튼을 누르면 됨 */
    });
  }, [currentItem?.audioUrl, currentItem?.orderIndex]);

  function startAll() {
    if (playable.length === 0) return;
    setMode("all");
    setActiveIndex(null);
    setQueuePos(0);
  }

  function playOne(orderIndex: number) {
    setMode("single");
    setActiveIndex(orderIndex);
    setQueuePos(0);
  }

  function stopPlayback() {
    setMode("idle");
    setActiveIndex(null);
    setQueuePos(0);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
    }
  }

  const readyCount = playable.length;
  const totalCount = items.length;
  const isPlaying = (mode === "all" || mode === "single") && Boolean(currentItem?.audioUrl);

  const inner = (
    <div className="flex flex-col gap-2.5">
      {!embedded && (
        <div>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-side-muted">
            <Icon name="headphones" size={16} />
            듣기 평가
          </p>
          <h1 className="mt-2 text-xl font-bold leading-snug text-white">{setTitle}</h1>
        </div>
      )}
      {!compact && (
        <p className="text-sm tabular-nums text-side-text">
          음원 {readyCount}/{totalCount}개 준비됨
        </p>
      )}

      {isPlaying && currentItem?.audioUrl ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold tabular-nums text-white">
              {mode === "all"
                ? `전체 듣기 · ${queuePos + 1}/${playable.length} · ${currentItem.orderIndex}번`
                : `${currentItem.orderIndex}번 듣기`}
            </p>
            <button
              type="button"
              onClick={stopPlayback}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold text-side-text transition hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" size={14} strokeWidth={2.2} />
              재생 중지
            </button>
          </div>
          <StudentAudioBar
            key={currentItem.audioUrl}
            src={currentItem.audioUrl}
            variant="inset"
            audioRef={audioRef}
            showSpeed
            onEnded={mode === "all" ? playNextInQueue : undefined}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={startAll}
          disabled={readyCount === 0}
          className={`flex w-full items-center justify-center gap-1.5 rounded-md bg-white font-bold text-side transition hover:bg-slate-100 disabled:opacity-40 ${
            compact ? "h-10 text-sm" : "h-11 text-[15px]"
          }`}
        >
          <Icon name="play" size={13} strokeWidth={1} filled />
          전체 듣기 ({readyCount}문항)
        </button>
      )}
      {!compact && !isPlaying && (
        <p className="text-center text-xs text-side-muted">
          1번부터 순서대로 자동 재생돼요
        </p>
      )}

      <div className={compact ? "" : "mt-2"}>
        {!compact && (
          <p className="mb-2 text-sm font-bold text-white">문항별 듣기</p>
        )}
        <ul
          className={`grid gap-1.5 ${
            compact ? "grid-cols-8 sm:grid-cols-10" : "grid-cols-5 gap-2"
          }`}
        >
          {items.map((item) => {
            const hasAudio = Boolean(item.audioUrl);
            const isActive =
              (mode === "single" && activeIndex === item.orderIndex) ||
              (mode === "all" && currentItem?.orderIndex === item.orderIndex);
            return (
              <li key={item.orderIndex}>
                <button
                  type="button"
                  disabled={!hasAudio}
                  onClick={() => playOne(item.orderIndex)}
                  aria-label={`${item.orderIndex}번 듣기`}
                  className={`flex w-full items-center justify-center rounded-md font-semibold tabular-nums transition ${
                    compact ? "h-8 text-xs" : "h-10 text-sm"
                  } ${
                    isActive
                      ? "bg-white text-side"
                      : hasAudio
                        ? "bg-white/[0.08] text-white hover:bg-white/15"
                        : "cursor-not-allowed text-side-muted/50 ring-1 ring-inset ring-white/10"
                  }`}
                >
                  {item.orderIndex}
                </button>
              </li>
            );
          })}
        </ul>
        {items.some((i) => !i.audioUrl) && (
          <p className="mt-2 text-center text-xs text-amber-300">
            흐린 번호는 음원이 아직 없어요.
          </p>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div>{inner}</div>;
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-6">
      <div className="mx-auto max-w-lg rounded-lg bg-side p-5 shadow-card">{inner}</div>
    </div>
  );
}
