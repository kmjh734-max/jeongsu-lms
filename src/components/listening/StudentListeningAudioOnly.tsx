"use client";

import { useEffect, useRef } from "react";

interface StudentListeningAudioOnlyProps {
  orderIndex: number;
  setTitle: string;
  audioUrl: string | null;
}

export function StudentListeningAudioOnly({
  orderIndex,
  setTitle,
  audioUrl,
}: StudentListeningAudioOnlyProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    void el.play().catch(() => {
      /* 브라우저 자동재생 정책 — 사용자가 재생 버튼을 누르면 됨 */
    });
  }, [audioUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-slate-400">
          LISTENING
        </p>
        <h1 className="mt-2 text-2xl font-bold tabular-nums">{orderIndex}번</h1>
        <p className="mt-1 text-sm text-slate-400">{setTitle}</p>

        {audioUrl ? (
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <audio
              ref={audioRef}
              controls
              autoPlay
              playsInline
              src={audioUrl}
              className="w-full"
              preload="auto"
            />
            <p className="mt-3 text-xs text-slate-500">
              음원이 자동 재생되지 않으면 재생 버튼을 눌러 주세요.
            </p>
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-6 text-sm text-amber-200">
            이 문항의 음원이 아직 준비되지 않았습니다. 선생님께 문의해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
