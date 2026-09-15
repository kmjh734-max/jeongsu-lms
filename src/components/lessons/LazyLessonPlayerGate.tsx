"use client";

import { useState, type ReactNode } from "react";

interface LazyLessonPlayerGateProps {
  title: string;
  children: ReactNode;
}

/** 클릭 전에는 iframe·Vimeo SDK·YouTube embed를 로드하지 않음 */
export function LazyLessonPlayerGate({ title, children }: LazyLessonPlayerGateProps) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="group relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg bg-[radial-gradient(circle_at_30%_30%,#1c3452,#0a1522_70%)] text-white transition"
        aria-label={`${title} 재생`}
      >
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/30 bg-white/15 transition group-hover:scale-105 group-hover:bg-white/25">
          <svg
            className="ml-1 h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-sm font-semibold">눌러서 재생</span>
      </button>
    );
  }

  return <>{children}</>;
}
