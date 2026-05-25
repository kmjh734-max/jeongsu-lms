"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ListeningQuestionEditor,
  type ListeningQuestionData,
} from "@/components/listening/ListeningQuestionEditor";
import { ListeningQuestionPreview } from "@/components/listening/ListeningQuestionPreview";
import {
  DIFFICULTY_MODE_OPTIONS,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import {
  MIDDLE1_LISTENING_EXAM_TYPES,
  tierLabel,
} from "@/lib/listening/exam-types";
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
  role,
}: ListeningSetManageClientProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [generationMode, setGenerationMode] =
    useState<ListeningGenerationMode>("exam");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [difficultyMode, setDifficultyMode] =
    useState<ListeningDifficultyMode>("auto");
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
        difficultyMode,
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
    const review = data.questions.filter((q) => q.needs_review).length;
    setMessage(
      review > 0
        ? `미리보기 생성됨. 검토 필요 ${review}문항 — 확인 후 저장하세요.`
        : "미리보기가 생성되었습니다. 확인 후 저장하세요."
    );
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
        difficultyMode,
        persist: true,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      reviewCount?: number;
    };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "문항 생성 실패");
      return;
    }
    setPreviewQuestions(null);
    const review = data.reviewCount ?? 0;
    setMessage(
      review > 0
        ? `저장 완료. 검토 필요 ${review}문항 — 대본·음원을 확인하세요.`
        : "AI 문항이 생성·저장되었습니다."
    );
    router.refresh();
  }

  async function mergeAllFinalAudio() {
    if (initialQuestions.length === 0) return;
    setBusy("merge-all");
    setMessage(null);
    const res = await fetch("/api/listening/merge-audio-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      results?: Array<{ orderIndex: number; ok: boolean; message?: string }>;
    };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "일괄 병합 실패");
      return;
    }
    const failed = (data.results ?? []).filter((r) => !r.ok);
    setMessage(
      failed.length
        ? `${data.message} — 실패: ${failed.map((f) => `${f.orderIndex}번`).join(", ")}`
        : data.message ?? "전체 최종 mp3 병합 완료"
    );
    router.refresh();
  }

  async function generateAllAudio() {
    if (initialQuestions.length === 0) {
      setMessage("먼저 문항을 생성·저장하세요.");
      return;
    }
    setBusy("audio-all");
    setMessage(null);
    const res = await fetch("/api/listening/generate-audio-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        speechSpeed: speechSpeedValue,
        questionIds: initialQuestions.map((q) => q.id),
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      results?: Array<{ orderIndex: number; ok: boolean; message?: string }>;
    };
    setBusy(null);
    if (!data.ok && !data.results?.some((r) => r.ok)) {
      setMessage(data.message ?? "일괄 음원 생성 실패");
      return;
    }
    const failed = (data.results ?? []).filter((r) => !r.ok);
    setMessage(
      failed.length > 0
        ? `${data.message ?? "완료"} (실패: ${failed.map((f) => `${f.orderIndex}번`).join(", ")})`
        : data.message ?? "전체 음원 생성이 완료되었습니다."
    );
    router.refresh();
  }

  async function deleteSet() {
    if (
      !window.confirm(
        `「${title}」 세트와 문항·음원·배정을 모두 삭제합니다. 계속할까요?`
      )
    ) {
      return;
    }
    setBusy("delete");
    const res = await fetch(`/api/listening/sets/${setId}`, { method: "DELETE" });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "삭제 실패");
      return;
    }
    router.push(role === "admin" ? "/admin/listening" : "/teacher/listening");
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
            중1 영어듣기평가 유형 · ANN/M/W · ElevenLabs 음원 (속도 {speechSpeedValue})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${role === "admin" ? "/admin" : "/teacher"}/listening/${setId}/print`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            시험지 출력
          </Link>
          <Link
            href={`${role === "admin" ? "/admin" : "/teacher"}/listening/${setId}/print?script=1`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            대본 포함 출력
          </Link>
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
          <button
            type="button"
            disabled={!!busy}
            onClick={deleteSet}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 disabled:opacity-50"
          >
            {busy === "delete" ? "삭제 중…" : "세트 삭제"}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">음성 속도</h2>
        <p className="mt-1 text-xs text-slate-500">
          중1 영어듣기평가형 권장: 느리게(0.85)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["very_slow", "아주 천천히 (0.75)"],
              ["slow", "느리게 (0.85)"],
              ["normal", "보통 (0.9)"],
              ["fast", "실전 (1.0)"],
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

        {generationMode === "exam" && (
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-600">난이도 (문장 길이·대화 길이)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTY_MODE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-xs ${
                    difficultyMode === opt.value
                      ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="difficultyMode"
                    className="sr-only"
                    checked={difficultyMode === opt.value}
                    onChange={() => setDifficultyMode(opt.value)}
                  />
                  <span className="font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-slate-500">{opt.description}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="text-sm">
            <span className="font-medium text-slate-700">문항 수</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {([5, 10, 20] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setQuestionCount(n);
                    setSelectedTypeIds([]);
                  }}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    questionCount === n
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700"
                  }`}
                >
                  {n}문항 (1~{n}번)
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="mt-2 w-16 rounded-md border border-slate-200 px-2 py-1"
            />
          </div>
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
                    {t.id}. {t.question_type}{" "}
                    <span className="text-slate-400">({tierLabel(t.difficulty_tier)})</span>
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
            <ListeningQuestionPreview key={q.order_index} question={q} showActions={false} />
          ))}
        </section>
      )}

      {initialQuestions.length > 0 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">음원 생성 (ElevenLabs)</h2>
          <p className="mt-1 text-xs text-slate-600">
            ANN/M/W 화자별 ElevenLabs 음성으로 segment를 만든 뒤 합쳐 final.mp3를 저장합니다.
            생성 후 미리듣기로 확인하세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy}
              onClick={generateAllAudio}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "audio-all"
                ? "전체 음원 생성 중…"
                : `전체 음원 생성 (${initialQuestions.length}문항)`}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={mergeAllFinalAudio}
              className="rounded-lg border border-emerald-400 bg-white px-4 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50"
            >
              {busy === "merge-all"
                ? "병합 중…"
                : `최종 mp3만 일괄 병합 (${initialQuestions.length}문항)`}
            </button>
          </div>
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
