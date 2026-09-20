"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { StudentAudioBar } from "@/components/listening/StudentAudioBar";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    void el.play().catch(() => {
      /* 브라우저 자동재생 정책 — 사용자가 재생 버튼을 누르면 됨 */
    });
  }, [audioUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-side px-4 py-10 text-white">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-side-muted">
            <Icon name="headphones" size={24} />
          </span>
          <p className="mt-4 text-[13px] font-semibold text-side-muted">듣기</p>
          <h1 className="mt-1 text-[32px] font-bold leading-tight tabular-nums">
            {orderIndex}번
          </h1>
          <p className="mt-1 text-sm text-side-text">{setTitle}</p>
        </div>

        {audioUrl ? (
          <div className="mt-8 rounded-lg bg-side-card p-4 ring-1 ring-inset ring-white/5">
            <StudentAudioBar
              src={audioUrl}
              variant="inset"
              size="lg"
              audioRef={audioRef}
              autoPlay
              showSpeed
            />
            <p className="mt-3 text-center text-xs text-side-muted">
              자동으로 재생되지 않으면 재생 버튼을 눌러 주세요.
            </p>
          </div>
        ) : (
          <p className="mt-8 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-4 text-sm text-amber-200">
            <Icon name="alert" size={16} className="mt-0.5" />
            이 문항의 음원이 아직 준비되지 않았어요. 선생님께 말씀해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
