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
        className="group relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg transition hover:border-brand-300 hover:from-slate-700 hover:to-slate-800"
        aria-label={`${title} 재생`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 transition group-hover:bg-white/25 group-hover:scale-105">
          <svg
            className="ml-1 h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-sm font-medium">강의 재생</span>
        <span className="max-w-[90%] truncate text-xs text-slate-300">{title}</span>
      </button>
    );
  }

  return <>{children}</>;
}
