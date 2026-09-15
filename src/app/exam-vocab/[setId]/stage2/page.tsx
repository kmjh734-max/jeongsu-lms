"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VocabStage2Spelling } from "@/components/vocab/VocabStage2Spelling";
import { loadExamGuestProgress } from "@/lib/vocab/exam-guest-progress";
import type { VocabItem } from "@/types/database";

export default function ExamVocabStage2Page() {
  const params = useParams();
  const router = useRouter();
  const setId = String(params.setId ?? "");
  const hub = `/exam-vocab/${setId}`;
  const [title, setTitle] = useState("보기 단어");
  const [items, setItems] = useState<VocabItem[] | null>(null);

  useEffect(() => {
    if (!setId) return;
    const progress = loadExamGuestProgress(setId);
    if (!progress.stage1Done) {
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
        <VocabStage2Spelling
          setId={setId}
          setTitle={title}
          items={items}
          hubHref={hub}
          nextHref={`${hub}/stage4`}
          nextLabel="3단계 종합테스트 시작"
          guestMode
        />
      </div>
    </div>
  );
}
