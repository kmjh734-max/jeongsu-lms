"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VocabStage1Study } from "@/components/vocab/VocabStage1Study";
import {
  loadExamGuestProgress,
} from "@/lib/vocab/exam-guest-progress";
import type { VocabItem } from "@/types/database";

export default function ExamVocabStage1Page() {
  const params = useParams();
  const router = useRouter();
  const setId = String(params.setId ?? "");
  const hub = `/exam-vocab/${setId}`;
  const [title, setTitle] = useState("보기 단어");
  const [items, setItems] = useState<VocabItem[] | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!setId) return;
    const progress = loadExamGuestProgress(setId);
    setSeen(progress.stage1Seen);
    setDone(progress.stage1Done);
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
        <VocabStage1Study
          setId={setId}
          setTitle={title}
          items={items}
          initialSeenIds={seen}
          stage1Completed={done}
          hubHref={hub}
          nextHref={done ? undefined : `${hub}/stage2`}
          nextLabel="2단계 스펠링 시작"
          guestMode
        />
      </div>
    </div>
  );
}
