"use client";

import { useEffect, useState, type ReactNode } from "react";

interface LazyLessonPlayerGateProps {
  title: string;
  /** 미리보기 그림 */
  thumbnail?: string | null;
  /** "58분" 같은 길이 */
  durationLabel?: string;
  /** 이어보기 안내("42%까지 봤어요") */
  resumeLabel?: string;
  /** Vimeo면 화면을 열자마자 플레이어 코드를 미리 받아 둔다 */
  warmVimeo?: boolean;
  children: ReactNode;
}

/**
 * 누르기 전에는 영상 창을 띄우지 않는다(화면이 빨리 뜬다).
 * 대신 미리보기 그림을 보여 주고, 플레이어 코드와 영상 서버 연결은 미리 준비해 두어
 * 누르면 곧바로 재생된다.
 */
export function LazyLessonPlayerGate({
  title,
  thumbnail,
  durationLabel,
  resumeLabel,
  warmVimeo = false,
  children,
}: LazyLessonPlayerGateProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!warmVimeo) return;
    const warm = () => void import("@vimeo/player").catch(() => {});
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm);
    else window.setTimeout(warm, 300);
  }, [warmVimeo]);

  if (started) return <>{children}</>;

  return (
    <>
      {warmVimeo ? (
        <>
          <link rel="preconnect" href="https://player.vimeo.com" />
          <link rel="preconnect" href="https://i.vimeocdn.com" />
          <link rel="preconnect" href="https://f.vimeocdn.com" />
        </>
      ) : null}
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_30%,#1c3452,#0a1522_70%)] text-white shadow-sm"
        aria-label={`${title} 재생`}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
        <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition group-hover:scale-105">
          <svg className="ml-1 h-9 w-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-left sm:p-4">
          <span className="min-w-0">
            {resumeLabel ? (
              <span className="mb-1 inline-block rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold">
                {resumeLabel}
              </span>
            ) : null}
            <span className="block truncate text-sm font-semibold drop-shadow sm:text-base">{title}</span>
          </span>
          {durationLabel ? (
            <span className="shrink-0 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold tabular-nums">
              {durationLabel}
            </span>
          ) : null}
        </span>
      </button>
    </>
  );
}
