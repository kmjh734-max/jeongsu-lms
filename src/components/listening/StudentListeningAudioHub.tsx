"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ListeningAudioItem {
  orderIndex: number;
  audioUrl: string | null;
}

interface StudentListeningAudioHubProps {
  setTitle: string;
  items: ListeningAudioItem[];
  /** Exam hub 탭 안에 넣을 때 바깥 레이아웃 생략 */
  embedded?: boolean;
}

export function StudentListeningAudioHub({
  setTitle,
  items,
  embedded = false,
}: StudentListeningAudioHubProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
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

  const inner = (
    <>
        {!embedded && (
          <>
            <p className="text-center text-xs font-semibold tracking-[0.25em] text-sky-600">
              ENGLISH LISTENING
            </p>
            <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
              {setTitle}
            </h1>
          </>
        )}
        <p className={`text-center text-sm text-slate-500 ${embedded ? "" : "mt-1"}`}>
          음원 {readyCount}/{totalCount}개 준비됨
        </p>

        <div className={`rounded-2xl border border-sky-100 bg-white p-5 shadow-sm ${embedded ? "mt-0" : "mt-6"}`}>
          <button
            type="button"
            onClick={startAll}
            disabled={readyCount === 0}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-40"
          >
            전체 듣기 ({readyCount}문항 연속 재생)
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">
            1번부터 순서대로 자동 재생됩니다
          </p>
        </div>

        {(mode === "all" || mode === "single") && currentItem?.audioUrl && (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <p className="text-center text-sm font-semibold text-sky-800">
              {mode === "all"
                ? `전체 듣기 · ${queuePos + 1}/${playable.length} · ${currentItem.orderIndex}번`
                : `${currentItem.orderIndex}번 듣기`}
            </p>
            <audio
              ref={audioRef}
              key={currentItem.audioUrl}
              controls
              playsInline
              src={currentItem.audioUrl}
              className="mt-3 w-full"
              preload="auto"
              onEnded={mode === "all" ? playNextInQueue : undefined}
            />
            <button
              type="button"
              onClick={stopPlayback}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600"
            >
              재생 중지
            </button>
          </div>
        )}

        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-800">문항별 듣기</p>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {items.map((item) => {
              const hasAudio = Boolean(item.audioUrl);
              const isActive =
                mode === "single" && activeIndex === item.orderIndex;
              return (
                <li key={item.orderIndex}>
                  <button
                    type="button"
                    disabled={!hasAudio}
                    onClick={() => playOne(item.orderIndex)}
                    className={`w-full rounded-xl border px-1 py-2.5 text-center text-sm font-bold tabular-nums transition ${
                      isActive
                        ? "border-sky-500 bg-sky-500 text-white"
                        : hasAudio
                          ? "border-sky-200 bg-white text-sky-800 hover:border-sky-400 hover:bg-sky-50"
                          : "border-slate-100 bg-slate-50 text-slate-300"
                    }`}
                  >
                    {item.orderIndex}
                  </button>
                </li>
              );
            })}
          </ul>
          {items.some((i) => !i.audioUrl) && (
            <p className="mt-3 text-center text-xs text-amber-700">
              회색 번호는 음원이 아직 없습니다.
            </p>
          )}
        </div>
    </>
  );

  if (embedded) {
    return <div>{inner}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50/40 px-4 py-8">
      <div className="mx-auto max-w-lg">{inner}</div>
    </div>
  );
}
