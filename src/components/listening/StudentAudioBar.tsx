"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/layout/NavIcon";

type Variant = "light" | "dark" | "inset";
type Size = "md" | "lg";

interface StudentAudioBarProps {
  src: string;
  /** light: 밝은 카드 안, dark: 남색 줄, inset: 남색 카드 안쪽 */
  variant?: Variant;
  size?: Size;
  playbackRate?: number;
  /** 바깥에서 멈추기·되감기 등에 쓰는 오디오 요소 참조 */
  audioRef?: RefObject<HTMLAudioElement | null>;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const STYLES: Record<
  Variant,
  { wrap: string; button: string; track: string; fill: string; knob: string; time: string }
> = {
  light: {
    wrap: "border border-slate-200 bg-slate-50",
    button: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-200",
    track: "bg-slate-200",
    fill: "bg-brand-600",
    knob: "bg-brand-600",
    time: "text-slate-500",
  },
  dark: {
    wrap: "bg-side",
    button: "bg-white text-side hover:bg-slate-100 focus-visible:ring-white/50",
    track: "bg-[#223a58]",
    fill: "bg-white",
    knob: "bg-white",
    time: "text-side-text",
  },
  inset: {
    wrap: "bg-white/[0.06] ring-1 ring-inset ring-white/10",
    button: "bg-white text-side hover:bg-slate-100 focus-visible:ring-white/50",
    track: "bg-white/15",
    fill: "bg-white",
    knob: "bg-white",
    time: "text-side-text",
  },
};

/** 재생·일시정지, 탐색 막대, 시간을 보여 주는 음원 줄 (내부는 기본 audio 요소) */
export function StudentAudioBar({
  src,
  variant = "light",
  size = "md",
  // 학생 듣기는 기본 0.8배속 (선생님 요청, 2026-09-18) — 음 높이는 그대로 두고 느리게
  playbackRate = 0.8,
  audioRef,
  autoPlay = false,
  onEnded,
  className = "",
}: StudentAudioBarProps) {
  const innerRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const rateRef = useRef(playbackRate);
  rateRef.current = playbackRate;

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const setRefs = useCallback(
    (el: HTMLAudioElement | null) => {
      innerRef.current = el;
      if (audioRef) audioRef.current = el;
    },
    [audioRef]
  );

  useEffect(() => {
    const el = innerRef.current;
    if (el) el.playbackRate = playbackRate;
  }, [playbackRate]);

  function toggle() {
    const el = innerRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {
        /* 자동재생 정책 등 — 다시 누르면 됨 */
      });
    } else {
      el.pause();
    }
  }

  function seekTo(time: number) {
    const el = innerRef.current;
    if (!el || !Number.isFinite(duration) || duration <= 0) return;
    const next = Math.min(duration, Math.max(0, time));
    try {
      el.currentTime = next;
    } catch {
      /* ignore */
    }
    setCurrent(next);
  }

  function seekFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    seekFromClientX(e.clientX);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    seekFromClientX(e.clientX);
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  function onSliderKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      seekTo(current + 5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekTo(current - 5);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }

  const s = STYLES[variant];
  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const lg = size === "lg";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg ${s.wrap} ${
        lg ? "h-16 px-4" : variant === "light" ? "h-[52px] px-3.5" : "h-11 px-3"
      } ${className}`.trim()}
    >
      <audio
        ref={setRefs}
        src={src}
        preload="auto"
        playsInline
        autoPlay={autoPlay}
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onTimeUpdate={(e) => {
          if (!draggingRef.current) setCurrent(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          e.currentTarget.playbackRate = rateRef.current;
          setDuration(e.currentTarget.duration);
          setFailed(false);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setFailed(true)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "일시정지" : "재생"}
        className={`flex shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-4 ${s.button} ${
          lg ? "h-11 w-11" : variant === "light" ? "h-[34px] w-[34px]" : "h-7 w-7"
        }`}
      >
        {playing ? (
          <Icon name="pause" size={lg ? 18 : 13} strokeWidth={2.6} />
        ) : (
          <Icon
            name="play"
            size={lg ? 18 : 13}
            strokeWidth={1}
            filled
            className="translate-x-px"
          />
        )}
      </button>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="재생 위치"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(current)}
        aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onSliderKey}
        className="group relative flex min-w-0 flex-1 cursor-pointer touch-none items-center py-3 focus:outline-none"
      >
        <div className={`h-1 w-full overflow-hidden rounded-full ${s.track}`}>
          <div className={`h-full rounded-full ${s.fill}`} style={{ width: `${percent}%` }} />
        </div>
        <span
          className={`pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100 ${s.knob}`}
          style={{ left: `${percent}%` }}
        />
      </div>

      <span className={`shrink-0 text-xs tabular-nums ${s.time}`}>
        {failed ? "재생할 수 없어요" : `${formatTime(current)} / ${formatTime(duration)}`}
      </span>
    </div>
  );
}
