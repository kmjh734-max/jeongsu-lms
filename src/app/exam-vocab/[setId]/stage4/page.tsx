"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VocabStage3Test } from "@/components/vocab/VocabStage3Test";
import { buildStage3Questions } from "@/lib/vocab/build-stage3-questions";
import { loadExamGuestProgress } from "@/lib/vocab/exam-guest-progress";
import type { VocabItem } from "@/types/database";

export default function ExamVocabStage4Page() {
  const params = useParams();
  const router = useRouter();
  const setId = String(params.setId ?? "");
  const hub = `/exam-vocab/${setId}`;
  const [title, setTitle] = useState("보기 단어");
  const [items, setItems] = useState<VocabItem[] | null>(null);

  useEffect(() => {
    if (!setId) return;
    const progress = loadExamGuestProgress(setId);
    if (!progress.stage2Done) {
      router.replace(hub);
      return;
    }
    void fetch(`/api/exam-vocab/${setId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          router.replace(hub);
          return;
        }
        setTitle(data.set?.title || "보기 단어");
        setItems(data.items ?? []);
      })
      .catch(() => router.replace(hub));
  }, [setId, hub, router]);

  const questions = useMemo(
    () => (items ? buildStage3Questions(items) : []),
    [items]
  );

  if (!items) {
    return (
      <div className="min-h-screen bg-canvas px-4 py-16">
        <p className="text-center text-sm text-slate-500">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <VocabStage3Test
          setId={setId}
          setTitle={title}
          questions={questions}
          stageNumber={3}
          hubHref={hub}
          guestMode
        />
      </div>
    </div>
  );
}
