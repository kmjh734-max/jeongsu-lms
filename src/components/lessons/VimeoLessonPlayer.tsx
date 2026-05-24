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
}

/** Vimeo Player SDK — 시청률 저장, 이어보기, 영상 내 앞으로 건너뛰기 차단 */
export function VimeoLessonPlayer({
  lessonId,
  videoId,
  title,
  initialIsCompleted,
  initialProgressPercent,
  initialWatchedSeconds,
}: VimeoLessonPlayerProps) {
  const router = useRouter();
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<import("@vimeo/player").default | null>(null);

  const completionSentRef = useRef(initialIsCompleted);
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
          setDisplayPercent(savedPct);
          if (data.isCompleted || complete) {
            setIsCompleted(true);
            completionSentRef.current = true;
            router.refresh();
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
    if (completionSentRef.current) return;
    completionSentRef.current = true;
    const finalPercent = Math.max(
      watchedPercentFromSeconds(watchedSeconds, duration),
      90
    );
    setDisplayPercent(finalPercent);
    setIsCompleted(true);
    setStatusMessage("수강 완료되었습니다.");
    await persistProgressRef.current(
      Math.floor(watchedSeconds),
      finalPercent,
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
      if (completionSentRef.current || duration <= 0) return;

      const inResumeGrace = Date.now() < resumeGraceUntilRef.current;
      const enforceAntiSkip = !completionSentRef.current && !inResumeGrace;

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

      if (isCompletionReached(maxWatchedSecondsRef.current, duration)) {
        await handleCompleteRef.current(
          maxWatchedSecondsRef.current,
          duration
        );
        return;
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
      if (completionSentRef.current || !player) return;
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
      if (completionSentRef.current) return;
      maxWatchedSecondsRef.current = Math.max(
        maxWatchedSecondsRef.current,
        data.duration
      );
      if (isCompletionReached(maxWatchedSecondsRef.current, data.duration)) {
        await handleCompleteRef.current(
          maxWatchedSecondsRef.current,
          data.duration
        );
      } else {
        await syncFromPlayheadRef.current(
          maxWatchedSecondsRef.current,
          data.duration,
          true
        );
      }
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
        });
        playerRef.current = player;

        await player.ready();
        if (disposed) return;

        player.on("timeupdate", onTimeupdate);
        player.on("seeked", onSeeked);
        player.on("ended", onEnded);

        setPlayerReady(true);
        setPlayerError(null);

        if (resumeSeconds > 0 && !completionSentRef.current) {
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
          if (disposed || !player || completionSentRef.current) return;
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
      if (completionSentRef.current) return;
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
    <div className="space-y-6">
      {resumeSeconds > 0 && !isCompleted && (
        <p className="rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          {initialProgressPercent}%까지 시청하셨습니다.{" "}
          <strong>이어서 재생</strong>됩니다. (앞으로 건너뛰기는 할 수 없습니다)
        </p>
      )}

      <div className="overflow-hidden rounded-xl bg-black shadow-lg">
        <div
          id={containerId}
          ref={containerRef}
          className="relative aspect-video w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full"
          aria-label={title}
        />
      </div>

      {!playerReady && !playerError && (
        <p className="text-xs text-slate-500">
          Vimeo 플레이어 연결 중… 연결되면 시청률이 저장되고 앞으로 건너뛰기가
          제한됩니다.
        </p>
      )}

      {playerError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {playerError}
        </p>
      )}

      {saveError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {saveError}
        </p>
      )}

      {seekNotice && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {seekNotice}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">누적 시청률</p>
            <p className="text-2xl font-bold text-brand-700">
              {displayPercent}%
            </p>
          </div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              ✓ 수강 완료
            </span>
          ) : (
            <span className="text-sm text-slate-500">
              완료 기준: 90% 이상 시청
            </span>
          )}
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${Math.min(100, displayPercent)}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-600">
          시청한 만큼 자동 저장되며, 다시 들어오면 이어서 재생됩니다. 영상
          안에서 앞으로 건너뛰기는 할 수 없습니다. 90% 이상 시청하면 수강 완료
          처리됩니다.
        </p>

        {playerReady && !isCompleted && (
          <p className="mt-2 text-xs text-emerald-700">
            Vimeo 플레이어 연결됨 — 시청률이 저장되고 있습니다.
          </p>
        )}

        {isCompleted || statusMessage ? (
          <p className="mt-2 text-sm font-medium text-green-700">
            {statusMessage ?? "수강 완료되었습니다."}
          </p>
        ) : (
          <p className="mt-2 text-sm text-amber-700">
            아직 수강 완료 기준에 도달하지 않았습니다.
          </p>
        )}
      </div>
    </div>
  );
}
