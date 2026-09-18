"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { shouldPersistProgress } from "@/lib/lesson-progress/save-throttle";
import {
  isCompletionReached,
  isForwardSeekBeyondMax,
  isNaturalPlayheadAdvance,
  watchedPercentFromSeconds,
} from "@/lib/lesson-progress/watch-tracker";
import Link from "next/link";
import { Icon } from "@/components/layout/NavIcon";

async function postLessonProgress(payload: {
  lessonId: string;
  watchedSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
}): Promise<{
  ok: boolean;
  message?: string;
  isCompleted?: boolean;
  progressPercent?: number;
  watchedSeconds?: number;
}> {
  const res = await fetch("/api/student/lesson-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  try {
    const data = await res.json();
    if (!res.ok && data.ok !== true) {
      return {
        ok: false,
        message: data.message ?? `저장 실패 (${res.status})`,
      };
    }
    return data;
  } catch {
    return { ok: false, message: "서버 응답을 읽을 수 없습니다." };
  }
}

export interface VimeoLessonPlayerProps {
  lessonId: string;
  videoId: string;
  title: string;
  initialIsCompleted: boolean;
  initialProgressPercent: number;
  initialWatchedSeconds: number;
  nextHref?: string | null;
  nextTitle?: string | null;
}

/** Vimeo Player SDK — 시청률 저장, 이어보기, 영상 내 앞으로 건너뛰기 차단 */
export function VimeoLessonPlayer({
  lessonId,
  videoId,
  title,
  initialIsCompleted,
  initialProgressPercent,
  initialWatchedSeconds,
  nextHref,
  nextTitle,
}: VimeoLessonPlayerProps) {
  const router = useRouter();
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<import("@vimeo/player").default | null>(null);

  /** 90% 이상 도달 시 수강 완료 처리됨 (시청률 추적은 100%까지 계속) */
  const markedCompleteRef = useRef(initialIsCompleted);
  const maxWatchedSecondsRef = useRef(Math.max(0, initialWatchedSeconds));
  const lastTickSecondsRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const lastSavedPercentRef = useRef(initialProgressPercent);
  const lastSavedSecondsRef = useRef(Math.max(0, initialWatchedSeconds));
  const persistInFlightRef = useRef(false);
  const resumeGraceUntilRef = useRef(0);

  const resumeSeconds =
    !initialIsCompleted && initialWatchedSeconds > 0
      ? initialWatchedSeconds
      : 0;

  const [displayPercent, setDisplayPercent] = useState(initialProgressPercent);
  const displayPercentRef = useRef(initialProgressPercent);
  displayPercentRef.current = displayPercent;
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [seekNotice, setSeekNotice] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  // 영상 쪽에서 자체 안내를 띄우면 준비 신호가 안 올 수 있어, 잠시 뒤 도는 표시는 걷는다
  const [spinnerTimedOut, setSpinnerTimedOut] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSpinnerTimedOut(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  const persistProgress = useCallback(
    async (
      watchedSeconds: number,
      progressPercent: number,
      complete: boolean
    ) => {
      if (persistInFlightRef.current && !complete) return;
      persistInFlightRef.current = true;
      try {
        const data = await postLessonProgress({
          lessonId,
          watchedSeconds,
          progressPercent,
          isCompleted: complete,
        });
        if (data.ok) {
          setSaveError(null);
          const savedPct = data.progressPercent ?? progressPercent;
          const savedSec = data.watchedSeconds ?? watchedSeconds;
          lastSavedPercentRef.current = savedPct;
          lastSavedSecondsRef.current = savedSec;
          setDisplayPercent(Math.max(savedPct, progressPercent));
          if (data.isCompleted || complete) {
            setIsCompleted(true);
            markedCompleteRef.current = true;
            if (complete) router.refresh();
          }
        } else {
          setSaveError(data.message ?? "진행률 저장에 실패했습니다.");
        }
      } finally {
        persistInFlightRef.current = false;
      }
    },
    [lessonId, router]
  );

  const persistProgressRef = useRef(persistProgress);
  persistProgressRef.current = persistProgress;

  const handleCompleteRef = useRef<
    (watchedSeconds: number, duration: number) => Promise<void>
  >(async () => {});

  handleCompleteRef.current = async (
    watchedSeconds: number,
    duration: number
  ) => {
    if (markedCompleteRef.current) return;
    markedCompleteRef.current = true;
    const pct = watchedPercentFromSeconds(watchedSeconds, duration);
    setDisplayPercent(pct);
    setIsCompleted(true);
    setStatusMessage("수강 완료되었습니다.");
    await persistProgressRef.current(
      Math.floor(watchedSeconds),
      pct,
      true
    );
  };

  const seekToSeconds = useCallback(async (seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      await player.setCurrentTime(seconds);
    } catch {
      /* ignore */
    }
  }, []);

  const syncFromPlayhead = useCallback(
    async (seconds: number, duration: number, forceSave = false) => {
      if (duration <= 0) return;

      const inResumeGrace = Date.now() < resumeGraceUntilRef.current;
      const enforceAntiSkip = !inResumeGrace;

      if (
        enforceAntiSkip &&
        !isNaturalPlayheadAdvance(seconds, lastTickSecondsRef.current)
      ) {
        const max = maxWatchedSecondsRef.current;
        await seekToSeconds(max);
        setSeekNotice("앞으로 건너뛸 수 없습니다. 이어서 시청해 주세요.");
        lastTickSecondsRef.current = max;
        return;
      }

      lastTickSecondsRef.current = seconds;
      if (seconds > maxWatchedSecondsRef.current) {
        maxWatchedSecondsRef.current = seconds;
      }

      const pct = watchedPercentFromSeconds(
        maxWatchedSecondsRef.current,
        duration
      );
      setDisplayPercent(pct);
      setSeekNotice(null);

      if (
        isCompletionReached(maxWatchedSecondsRef.current, duration) &&
        !markedCompleteRef.current
      ) {
        void handleCompleteRef.current(
          maxWatchedSecondsRef.current,
          duration
        );
      }

      const now = Date.now();
      const watchedSec = Math.floor(maxWatchedSecondsRef.current);
      if (
        forceSave ||
        shouldPersistProgress(
          pct,
          watchedSec,
          lastSaveTimeRef.current,
          lastSavedPercentRef.current,
          lastSavedSecondsRef.current,
          now
        )
      ) {
        lastSaveTimeRef.current = now;
        await persistProgressRef.current(watchedSec, pct, false);
      }
    },
    [seekToSeconds]
  );

  const syncFromPlayheadRef = useRef(syncFromPlayhead);
  syncFromPlayheadRef.current = syncFromPlayhead;

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let player: import("@vimeo/player").default | null = null;
    let pollId: number | undefined;

    const onTimeupdate = (data: { seconds: number; duration: number }) => {
      void syncFromPlayheadRef.current(data.seconds, data.duration, false);
    };

    const onSeeked = async (data: { seconds: number }) => {
      if (!player) return;
      if (isForwardSeekBeyondMax(data.seconds, maxWatchedSecondsRef.current)) {
        const max = maxWatchedSecondsRef.current;
        try {
          await player.setCurrentTime(max);
        } catch {
          /* ignore */
        }
        lastTickSecondsRef.current = max;
        setSeekNotice("앞으로 건너뛸 수 없습니다. 이어서 시청해 주세요.");
      }
    };

    const onEnded = async (data: { duration: number }) => {
      if (data.duration <= 0) return;
      maxWatchedSecondsRef.current = Math.max(
        maxWatchedSecondsRef.current,
        data.duration
      );
      setDisplayPercent(100);
      if (!markedCompleteRef.current) {
        markedCompleteRef.current = true;
        setIsCompleted(true);
        setStatusMessage("수강 완료되었습니다.");
      }
      await persistProgressRef.current(
        Math.floor(data.duration),
        100,
        true
      );
    };

    void (async () => {
      try {
        const { default: Player } = await import("@vimeo/player");
        if (disposed || !containerRef.current) return;

        const numericId = Number(videoId);
        if (!Number.isFinite(numericId)) {
          setPlayerError("Vimeo 영상 ID가 올바르지 않습니다.");
          return;
        }

        player = new Player(containerRef.current, {
          id: numericId,
          width: containerRef.current.clientWidth || 640,
          responsive: true,
          title: false,
          byline: false,
          portrait: false,
          // 재생 칸을 눌러서 연 것이므로 바로 재생, 배속 조절 허용
          autoplay: true,
          speed: true,
          playsinline: true,
        });
        playerRef.current = player;

        await player.ready();
        if (disposed) return;

        player.on("timeupdate", onTimeupdate);
        player.on("seeked", onSeeked);
        player.on("ended", onEnded);

        setPlayerReady(true);
        setPlayerError(null);

        if (resumeSeconds > 0 && !markedCompleteRef.current) {
          const seekTo = Math.max(0, resumeSeconds - 1);
          try {
            await player.setCurrentTime(seekTo);
            lastTickSecondsRef.current = seekTo;
            resumeGraceUntilRef.current = Date.now() + 4000;
          } catch {
            /* ignore */
          }
        }

        pollId = window.setInterval(() => {
          if (disposed || !player) return;
          void (async () => {
            try {
              const [seconds, duration] = await Promise.all([
                player!.getCurrentTime(),
                player!.getDuration(),
              ]);
              if (duration > 0) {
                await syncFromPlayheadRef.current(seconds, duration, false);
              }
            } catch {
              /* ignore */
            }
          })();
        }, 2000);
      } catch (err) {
        console.error("[VimeoLessonPlayer] init failed:", err);
        if (!disposed) {
          setPlayerError(
            "Vimeo 플레이어를 연결하지 못했습니다. 새로고침 후 다시 시도해 주세요."
          );
          setPlayerReady(false);
        }
      }
    })();

    return () => {
      disposed = true;
      setPlayerReady(false);
      if (pollId !== undefined) window.clearInterval(pollId);
      if (player) {
        player.off("timeupdate", onTimeupdate);
        player.off("seeked", onSeeked);
        player.off("ended", onEnded);
        void player.destroy().catch(() => {});
      }
      playerRef.current = null;
    };
  }, [videoId, resumeSeconds]);

  useEffect(() => {
    const flushProgress = () => {
      const sec = Math.floor(maxWatchedSecondsRef.current);
      const pct = displayPercentRef.current;
      if (sec <= 0 && pct <= 0) return;
      if (
        pct <= lastSavedPercentRef.current &&
        sec <= lastSavedSecondsRef.current
      ) {
        return;
      }
      void postLessonProgress({
        lessonId,
        watchedSeconds: sec,
        progressPercent: pct,
        isCompleted: false,
      }).then((data) => {
        if (data.ok) {
          lastSavedPercentRef.current = data.progressPercent ?? pct;
          lastSavedSecondsRef.current = data.watchedSeconds ?? sec;
        }
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushProgress();
    };
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushProgress);
    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushProgress);
      flushProgress();
    };
  }, [lessonId]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-black shadow-sm">
        {!playerReady && !playerError && !spinnerTimedOut ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
          </div>
        ) : null}
        <div
          id={containerId}
          ref={containerRef}
          className="relative aspect-video w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full"
          aria-label={title}
        />
      </div>

      {playerError && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{playerError}</p>
      )}

      {saveError && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p>
      )}

      {seekNotice && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{seekNotice}</p>
      )}

      {isCompleted && nextHref ? (
        <Link
          href={nextHref}
          className="flex items-center justify-between gap-3 rounded-xl bg-brand-600 px-4 py-3.5 text-white shadow-sm hover:bg-brand-700"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-white/80">수강 완료 · 다음 강의</span>
            <span className="block truncate text-[15px] font-bold">{nextTitle ?? "다음 강의 보기"}</span>
          </span>
          <Icon name="play" size={16} filled strokeWidth={1} />
        </Link>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-slate-700">
            시청률 <b className="ml-1 text-lg tabular-nums text-slate-900">{displayPercent}%</b>
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
              <Icon name="check" size={12} strokeWidth={2.6} />
              수강 완료
            </span>
          ) : (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              완료 기준 90%
            </span>
          )}
        </div>
        <div className="relative mt-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? "bg-green-700" : "bg-brand-600"
              }`}
              style={{ width: `${Math.min(100, displayPercent)}%` }}
            />
          </div>
          <span aria-hidden className="absolute -top-[3px] left-[90%] h-3.5 w-0.5 rounded-sm bg-slate-900" />
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
          {isCompleted || statusMessage
            ? (statusMessage ?? "수강을 완료했어요. 끝까지 보면 100%까지 표시돼요.")
            : "본 만큼 자동으로 저장되고 다시 들어오면 이어서 재생돼요. 앞으로 건너뛰기는 안 돼요."}
        </p>
      </div>
    </div>
  );
}
