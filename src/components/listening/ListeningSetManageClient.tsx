"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ListeningQuestionEditor,
  type ListeningQuestionData,
} from "@/components/listening/ListeningQuestionEditor";

interface ListeningSetManageClientProps {
  setId: string;
  title: string;
  isPublished: boolean;
  questions: ListeningQuestionData[];
  role: "admin" | "teacher";
}

export function ListeningSetManageClient({
  setId,
  title,
  isPublished: initialPublished,
  questions: initialQuestions,
}: ListeningSetManageClientProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [questionCount, setQuestionCount] = useState(5);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function generateQuestions() {
    setBusy("ai");
    setMessage(null);
    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, count: questionCount, persist: true }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "문항 생성 실패");
      return;
    }
    setMessage("AI 문항이 생성·저장되었습니다.");
    router.refresh();
  }

  async function togglePublish() {
    setBusy("publish");
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !isPublished }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "게시 설정 실패");
      return;
    }
    setIsPublished(!isPublished);
    setMessage(!isPublished ? "학생에게 공개되었습니다." : "비공개로 변경되었습니다.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            ANN / M / W 화자별 대본 → segment TTS → 최종 mp3
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!busy}
            onClick={togglePublish}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            {busy === "publish"
              ? "처리 중…"
              : isPublished
                ? "비공개로"
                : "학생에게 공개"}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
        <h2 className="text-sm font-semibold text-slate-800">AI 문항 생성</h2>
        <p className="mt-1 text-xs text-slate-600">
          중1 수준 · 다중 화자 segments 포함 · 기존 시험 복제 없음
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            문항 수
            <input
              type="number"
              min={1}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="ml-2 w-16 rounded-md border border-slate-200 px-2 py-1"
            />
          </label>
          <button
            type="button"
            disabled={!!busy}
            onClick={generateQuestions}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "ai" ? "생성 중…" : "AI로 문항 추가"}
          </button>
        </div>
      </section>

      {initialQuestions.length === 0 ? (
        <p className="text-sm text-slate-600">아직 문항이 없습니다. AI로 문항을 생성해 주세요.</p>
      ) : (
        <div className="space-y-4">
          {initialQuestions.map((q) => (
            <ListeningQuestionEditor
              key={q.id}
              setId={setId}
              question={q}
              onUpdated={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {message && (
        <p className="text-sm text-slate-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
