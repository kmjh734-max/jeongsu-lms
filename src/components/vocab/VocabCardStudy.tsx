"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { recordVocabProgress } from "@/app/student/vocab/actions";
import type { VocabItem, VocabProgressStatus } from "@/types/database";

export interface VocabStudyItem extends VocabItem {
  progressStatus: VocabProgressStatus;
}

interface VocabCardStudyProps {
  setId: string;
  setTitle: string;
  items: VocabStudyItem[];
}

export function VocabCardStudy({
  setId,
  setTitle,
  items,
}: VocabCardStudyProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const total = items.length;
  const current = items[index];
  const knownCount = items.filter((i) => i.progressStatus === "known").length;
  const progressPercent =
    total > 0 ? Math.round((knownCount / total) * 100) : 0;

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setFlipped(false);
    setMessage(null);
  }, []);

  function handlePrev() {
    if (index > 0) goTo(index - 1);
  }

  function handleNext() {
    if (index < total - 1) goTo(index + 1);
  }

  function handleResponse(known: boolean) {
    if (!current || pending) return;

    startTransition(async () => {
      const result = await recordVocabProgress(current.id, known);
      setMessage(result.message);
      if (result.ok) {
        if (index < total - 1) {
          goTo(index + 1);
        } else {
          router.refresh();
        }
      }
    });
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-slate-600">이 단어장에 등록된 단어가 없습니다.</p>
        <ButtonLink href="/student/vocab" variant="secondary" className="mt-4">
          단어장 목록
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <Link
          href="/student/vocab"
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어장 목록
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">{setTitle}</h1>
        <div className="mt-3">
          <ProgressBar
            percent={progressPercent}
            label={`${index + 1} / ${total} · 알아요 ${knownCount}개`}
          />
        </div>
      </div>

      <div
        className="relative min-h-[280px] sm:min-h-[320px]"
        style={{ perspective: "1000px" }}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-white to-brand-50 p-8 shadow-[0_12px_40px_rgb(15_23_42/0.12)] [backface-visibility:hidden]">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              영어 단어
            </p>
            <p className="mt-4 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
              {current.word}
            </p>
            <Button
              type="button"
              className="mt-8"
              onClick={() => setFlipped(true)}
            >
              뜻 보기
            </Button>
          </div>

          <div className="absolute inset-0 flex flex-col rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgb(15_23_42/0.12)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              뜻 · 예문
            </p>
            <p className="mt-3 text-2xl font-bold text-brand-800">{current.meaning}</p>
            {current.example_sentence && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-slate-800">{current.example_sentence}</p>
                {current.example_meaning && (
                  <p className="mt-2 text-slate-600">{current.example_meaning}</p>
                )}
              </div>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 min-w-[120px]"
                disabled={pending}
                onClick={() => handleResponse(true)}
              >
                알아요
              </Button>
              <Button
                type="button"
                className="flex-1 min-w-[120px]"
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
        <p className="text-center text-sm text-slate-600" role="status">
          {message}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={index === 0}
          onClick={handlePrev}
        >
          이전 단어
        </Button>
        <span className="text-sm font-medium text-slate-600">
          {index + 1} / {total}
        </span>
        <Button
          type="button"
          variant="ghost"
          disabled={index >= total - 1}
          onClick={handleNext}
        >
          다음 단어
        </Button>
      </div>

      {index >= total - 1 && (
        <p className="text-center text-sm text-slate-500">
          마지막 단어입니다. 알아요/몰라요를 누르면 학습 기록이 저장됩니다.
        </p>
      )}
    </div>
  );
}
