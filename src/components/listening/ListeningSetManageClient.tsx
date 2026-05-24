"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ListeningQuestionEditor,
  type ListeningQuestionData,
} from "@/components/listening/ListeningQuestionEditor";
import { ListeningQuestionPreview } from "@/components/listening/ListeningQuestionPreview";
import { MIDDLE1_LISTENING_EXAM_TYPES } from "@/lib/listening/exam-types";
import type { GeneratedListeningQuestion, ListeningGenerationMode } from "@/lib/listening/types";
import {
  SPEECH_SPEED_MAP,
  presetFromSpeed,
  type SpeechSpeedPreset,
} from "@/lib/listening/speech-speed";

interface ListeningSetManageClientProps {
  setId: string;
  title: string;
  isPublished: boolean;
  speechSpeed: number | null;
  questions: ListeningQuestionData[];
  role: "admin" | "teacher";
}

export function ListeningSetManageClient({
  setId,
  title,
  isPublished: initialPublished,
  speechSpeed: initialSpeechSpeed,
  questions: initialQuestions,
}: ListeningSetManageClientProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [generationMode, setGenerationMode] =
    useState<ListeningGenerationMode>("exam");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [speechPreset, setSpeechPreset] = useState<SpeechSpeedPreset>(
    presetFromSpeed(initialSpeechSpeed)
  );
  const [previewQuestions, setPreviewQuestions] = useState<
    GeneratedListeningQuestion[] | null
  >(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const effectiveTypeIds = useMemo(() => {
    if (generationMode !== "exam") return undefined;
    if (selectedTypeIds.length > 0) return selectedTypeIds;
    return MIDDLE1_LISTENING_EXAM_TYPES.slice(0, questionCount).map((t) => t.id);
  }, [generationMode, selectedTypeIds, questionCount]);

  async function saveSpeechSpeed(preset: SpeechSpeedPreset) {
    setSpeechPreset(preset);
    await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speech_speed: SPEECH_SPEED_MAP[preset] }),
    });
  }

  async function generatePreview() {
    setBusy("preview");
    setMessage(null);
    setPreviewQuestions(null);
    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        count: questionCount,
        mode: generationMode,
        selectedTypeIds: effectiveTypeIds,
        persist: false,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      questions?: GeneratedListeningQuestion[];
    };
    setBusy(null);
    if (!data.ok || !data.questions?.length) {
      setMessage(data.message ?? "문항 생성 실패");
      return;
    }
    setPreviewQuestions(data.questions);
    setMessage("미리보기가 생성되었습니다. 확인 후 저장하세요.");
  }

  async function savePreview() {
    if (!previewQuestions?.length) return;
    setBusy("save");
    setMessage(null);
    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questions: previewQuestions }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "저장 실패");
      return;
    }
    setPreviewQuestions(null);
    setMessage("문항이 저장되었습니다.");
    router.refresh();
  }

  async function generateAndSave() {
    setBusy("ai");
    setMessage(null);
    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        count: questionCount,
        mode: generationMode,
        selectedTypeIds: effectiveTypeIds,
        persist: true,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "문항 생성 실패");
      return;
    }
    setPreviewQuestions(null);
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

  function toggleTypeId(id: number) {
    setSelectedTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const speechSpeedValue = SPEECH_SPEED_MAP[speechPreset];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            중1 영어듣기평가 유형 · ANN/M/W · segment TTS (속도 {speechSpeedValue})
          </p>
        </div>
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

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">음성 속도</h2>
        <p className="mt-1 text-xs text-slate-500">기본: 보통(0.9) — 중1 학생 기준 약간 느리게</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["slow", "느림 (0.8)"],
              ["normal", "보통 (0.9)"],
              ["fast", "빠름 (1.0)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={!!busy}
              onClick={() => saveSpeechSpeed(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                speechPreset === key
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
        <h2 className="text-sm font-semibold text-slate-800">AI 문항 생성</h2>
        <p className="mt-1 text-xs text-slate-600">
          기출 복사 없음 · 참고 유형만 반영 · 새 대본/문항 자체 제작
        </p>

        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={generationMode === "free"}
              onChange={() => setGenerationMode("free")}
            />
            자유 생성
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={generationMode === "exam"}
              onChange={() => setGenerationMode("exam")}
            />
            중1 영어듣기평가 유형
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            문항 수
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="ml-2 w-16 rounded-md border border-slate-200 px-2 py-1"
            />
          </label>
          <button
            type="button"
            disabled={!!busy}
            onClick={generatePreview}
            className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 disabled:opacity-50"
          >
            {busy === "preview" ? "생성 중…" : "미리보기 생성"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={generateAndSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "ai" ? "생성 중…" : "바로 생성·저장"}
          </button>
        </div>

        {generationMode === "exam" && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-slate-600">
              유형 선택 (비우면 1~{questionCount}번 유형 순서 적용)
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {MIDDLE1_LISTENING_EXAM_TYPES.map((t) => (
                <label key={t.id} className="flex items-start gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedTypeIds.includes(t.id)}
                    onChange={() => toggleTypeId(t.id)}
                    className="mt-0.5"
                  />
                  <span>
                    {t.id}. {t.question_type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      {previewQuestions && previewQuestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">문항 미리보기</h2>
            <button
              type="button"
              disabled={!!busy}
              onClick={savePreview}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "save" ? "저장 중…" : "이 문항들 DB에 저장"}
            </button>
          </div>
          {previewQuestions.map((q) => (
            <ListeningQuestionPreview key={q.order_index} question={q} />
          ))}
        </section>
      )}

      {initialQuestions.length === 0 && !previewQuestions?.length ? (
        <p className="text-sm text-slate-600">아직 문항이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {initialQuestions.map((q) => (
            <ListeningQuestionEditor
              key={q.id}
              setId={setId}
              question={q}
              speechSpeed={speechSpeedValue}
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
