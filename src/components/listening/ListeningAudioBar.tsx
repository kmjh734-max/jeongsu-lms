"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 관리 화면용 작은 재생 막대 (어두운 남색) */
export function ListeningAudioBar({
  src,
  caption,
  compact = false,
}: {
  src: string;
  /** 오른쪽 작은 글씨 (예: 여자 · 남자 목소리) */
  caption?: string;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [src]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg bg-side px-3 ${compact ? "h-9" : "h-11"}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "멈추기" : "듣기"}
        className={`flex shrink-0 items-center justify-center rounded-full bg-white text-side ${
          compact ? "h-6 w-6" : "h-7 w-7"
        }`}
      >
        <Icon name={playing ? "pause" : "play"} size={12} strokeWidth={playing ? 2.5 : 1} filled={!playing} />
      </button>
      <div
        className="h-1 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-full bg-[#223a58]"
        onClick={seek}
        role="presentation"
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-side-text">
        {formatTime(playing || current > 0 ? current : duration)}
      </span>
      {caption ? (
        <span className="hidden shrink-0 text-xs text-side-muted sm:inline">{caption}</span>
      ) : null}
    </div>
  );
}
