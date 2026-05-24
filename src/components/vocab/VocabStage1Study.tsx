"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { recordStage1Item } from "@/app/student/vocab/actions";
import {
  isSpeechSupported,
  speakEnglish,
  stopSpeaking,
} from "@/lib/vocab/speak-client";
import type { VocabItem } from "@/types/database";

interface VocabStage1StudyProps {
  setId: string;
  setTitle: string;
  items: VocabItem[];
  initialSeenIds: string[];
  stage1Completed: boolean;
}

export function VocabStage1Study({
  setId,
  setTitle,
  items,
  initialSeenIds,
  stage1Completed,
}: VocabStage1StudyProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(stage1Completed ? [] : initialSeenIds)
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const speechOk = isSpeechSupported();

  const total = items.length;
  const current = items[index];
  const seenCount = stage1Completed ? index + 1 : seenIds.size;
  const roundPercent =
    total > 0 ? Math.round((seenCount / total) * 100) : 0;

  const goTo = useCallback((next: number) => {
    stopSpeaking();
    setIndex(next);
    setFlipped(false);
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!speechOk || !current || flipped) return;
    const t = window.setTimeout(() => speakEnglish(current.word), 300);
    return () => window.clearTimeout(t);
  }, [index, speechOk, current, flipped]);

  useEffect(() => () => stopSpeaking(), []);

  function handleResponse(known: boolean) {
    if (!current || pending) return;

    startTransition(async () => {
      const result = await recordStage1Item(setId, current.id, known);
      setMessage(result.message);
      if (result.ok) {
        if (!stage1Completed) {
          setSeenIds((prev) => new Set([...prev, current.id]));
        }
        if (result.message.includes("1단계를 완료")) {
          router.push(`/student/vocab/${setId}`);
          router.refresh();
          return;
        }
        if (index < total - 1) goTo(index + 1);
      }
    });
  }

  if (total === 0) {
    return (
      <div className="text-center text-slate-600">단어가 없습니다.</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-2">
      <div>
        <Link
          href={`/student/vocab/${setId}`}
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어장으로
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          {setTitle} · 1단계{stage1Completed ? " (다시 보기)" : ""}
        </h1>
        <ProgressBar
          percent={roundPercent}
          label={`학습 ${seenCount} / ${total}`}
        />
      </div>

      <div className="relative w-full" style={{ perspective: "1200px" }}>
        <div
          className={`relative h-[min(72vh,560px)] min-h-[420px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-white to-brand-50 px-8 py-12 [backface-visibility:hidden]">
            <p className="text-sm font-semibold text-brand-600">영어 단어</p>
            <p className="text-center text-4xl font-bold sm:text-5xl">
              {current.word}
            </p>
            {speechOk && (
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm"
                onClick={() => speakEnglish(current.word)}
              >
                🔊 발음 듣기
              </button>
            )}
            <Button type="button" className="px-8" onClick={() => setFlipped(true)}>
              뜻 보기
            </Button>
          </div>

          <div className="absolute inset-0 flex flex-col rounded-3xl border-2 border-slate-200 bg-white px-8 py-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-sm font-semibold text-slate-500">뜻 · 예문</p>
            <p className="mt-4 text-3xl font-bold text-brand-800">
              {current.meaning}
            </p>
            {current.example_sentence && (
              <div className="mt-4 flex-1 overflow-y-auto rounded-xl bg-slate-50 p-4">
                <p className="text-slate-800">{current.example_sentence}</p>
                {current.example_meaning && (
                  <p className="mt-2 text-slate-600">{current.example_meaning}</p>
                )}
              </div>
            )}
            <div className="mt-auto flex gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={pending}
                onClick={() => handleResponse(true)}
              >
                알아요
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={pending}
                onClick={() => handleResponse(false)}
              >
                몰라요
              </Button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <p className="text-center text-sm text-slate-600">{message}</p>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          이전 단어
        </Button>
        <span className="text-sm text-slate-600">
          {index + 1} / {total}
        </span>
        <Button
          type="button"
          variant="ghost"
          disabled={index >= total - 1}
          onClick={() => goTo(index + 1)}
        >
          다음 단어
        </Button>
      </div>
    </div>
  );
}
