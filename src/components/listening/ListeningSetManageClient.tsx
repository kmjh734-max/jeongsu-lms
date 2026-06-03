"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  GenerationProgress,
  type ItemProgressRow,
} from "@/components/listening/GenerationProgress";
import {
  generateAudioSequential,
  generateQuestionsSequential,
} from "@/lib/listening/client-generation";
import type { GenerationPhase } from "@/lib/listening/progress-weights";
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
  getExamTypesForGrade,
  tierLabel,
} from "@/lib/listening/exam-types";
import {
  gradeLevelShort,
  LISTENING_GRADE_OPTIONS,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import {
  planCustomGenerationSlots,
  planRandomGenerationSlots,
  type ListeningGenerationPlanMode,
} from "@/lib/listening/generation-slots";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { ListeningVoiceSettings } from "@/components/listening/ListeningVoiceSettings";
import {
  SPEECH_SPEED_MAP,
  presetFromSpeed,
  type SpeechSpeedPreset,
} from "@/lib/listening/speech-speed";

interface ListeningSetManageClientProps {
  setId: string;
  title: string;
  gradeLevel: ListeningGradeLevel;
  isPublished: boolean;
  speechSpeed: number | null;
  voiceAnnId: string | null;
  voiceMId: string | null;
  voiceWId: string | null;
  questions: ListeningQuestionData[];
  role: "admin" | "teacher";
}

export function ListeningSetManageClient({
  setId,
  title,
  gradeLevel: initialGradeLevel,
  isPublished: initialPublished,
  speechSpeed: initialSpeechSpeed,
  voiceAnnId,
  voiceMId,
  voiceWId,
  questions: initialQuestions,
  role,
}: ListeningSetManageClientProps) {
  const router = useRouter();
  const [gradeLevel, setGradeLevel] = useState<ListeningGradeLevel>(initialGradeLevel);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [generationPlanMode, setGenerationPlanMode] =
    useState<ListeningGenerationPlanMode>("custom");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15 | 20>(5);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [difficultyMode, setDifficultyMode] =
    useState<ListeningDifficultyMode>("auto");
  const [speechPreset, setSpeechPreset] = useState<SpeechSpeedPreset>(
    presetFromSpeed(initialSpeechSpeed)
  );

  useEffect(() => {
    setSpeechPreset(presetFromSpeed(initialSpeechSpeed));
  }, [initialSpeechSpeed]);
  const [previewQuestions, setPreviewQuestions] = useState<
    GeneratedListeningQuestion[] | null
  >(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [, setProgressPhase] = useState<GenerationPhase>("idle");
  const [progressDetail, setProgressDetail] = useState<string | null>(null);
  const [progressItems, setProgressItems] = useState<ItemProgressRow[]>([]);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const isGenerating =
    busy === "preview" || busy === "ai" || busy === "save" || busy === "gen-flow";
  const isAudioBusy = busy === "audio-all" || busy === "audio-seq";

  const examTypes = useMemo(
    () => getExamTypesForGrade(gradeLevel),
    [gradeLevel]
  );

  const generationSlots = useMemo(() => {
    if (generationPlanMode === "random") {
      return planRandomGenerationSlots({ questionCount, examTypes });
    }
    return planCustomGenerationSlots({
      questionCount,
      selectedTypeIds,
      examTypes,
    });
  }, [generationPlanMode, questionCount, selectedTypeIds, examTypes]);

  const plannedQuestionCount = generationSlots.length;

  function confirmReplaceExistingQuestions(actionLabel: string): boolean {
    if (initialQuestions.length === 0) return true;
    return window.confirm(
      `이 세트에 저장된 문항 ${initialQuestions.length}개가 있습니다. ${actionLabel}하면 기존 문항·음원이 삭제되고 새 문항으로 바뀝니다. 계속할까요?`
    );
  }

  async function saveSpeechSpeed(preset: SpeechSpeedPreset) {
    setSpeechPreset(preset);
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speech_speed: SPEECH_SPEED_MAP[preset] }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (data.ok) {
      setMessage(
        `음성 속도 ${SPEECH_SPEED_MAP[preset]}로 저장되었습니다. 반영하려면 「전체 음원 생성」 또는 문항별 「음원 생성」을 다시 실행하세요.`
      );
      router.refresh();
    } else {
      setMessage(data.message ?? "음성 속도 저장 실패");
    }
  }

  async function changeGradeLevel(level: ListeningGradeLevel) {
    if (level === gradeLevel) return;
    const previous = gradeLevel;
    setGradeLevel(level);
    setSelectedTypeIds([]);
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade_level: level }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!data.ok) {
      setGradeLevel(previous);
      setMessage(data.message ?? "학년 저장 실패");
    }
  }

  function selectQuestionCount(n: 5 | 10 | 15 | 20) {
    setQuestionCount(n);
    if (selectedTypeIds.length > n) {
      setSelectedTypeIds((prev) => prev.slice(0, n));
    }
  }

  const resetProgress = useCallback(() => {
    setProgressPercent(0);
    setProgressPhase("idle");
    setProgressDetail(null);
    setProgressItems([]);
  }, []);

  async function generatePreview() {
    setBusy("preview");
    setMessage(null);
    setPreviewQuestions(null);
    resetProgress();
    setProgressDetail("AI 문제 생성 중…");

    const result = await generateQuestionsSequential({
      setId,
      slots: generationSlots,
      difficultyMode,
      persist: false,
      onProgress: (percent, phase, items) => {
        setProgressPercent(percent);
        setProgressPhase(phase);
        setProgressItems(items);
        if (phase === "generating") {
          setProgressDetail("AI 문제 생성 중…");
        } else if (phase === "validating") {
          setProgressDetail("정답 명확성 검수 중…");
        }
      },
    });

    setBusy(null);
    resetProgress();
    if (result.error) {
      setMessage(result.error);
      if (result.questions.length) setPreviewQuestions(result.questions);
      return;
    }
    setPreviewQuestions(result.questions);
    setMessage(
      result.reviewCount > 0
        ? `미리보기 생성됨. 검토 필요 ${result.reviewCount}문항 — 확인 후 저장하세요.`
        : "미리보기가 생성되었습니다. 확인 후 저장하세요."
    );
  }

  async function savePreview() {
    if (!previewQuestions?.length) return;
    if (!confirmReplaceExistingQuestions("미리보기 문항을 DB에 저장")) return;
    const reviewPending = previewQuestions.filter((q) => q.needs_review).length;
    if (
      reviewPending > 0 &&
      !window.confirm(
        `검토 필요 문항이 ${reviewPending}개 있습니다. 그래도 저장할까요?`
      )
    ) {
      return;
    }
    setBusy("save");
    setMessage(null);
    resetProgress();
    setProgressDetail("DB 저장 중…");
    const items: ItemProgressRow[] = previewQuestions.map((q) => ({
      orderIndex: q.order_index,
      status: "pending",
    }));

    items.forEach((item) => {
      item.status = "saving";
    });
    setProgressItems([...items]);
    setProgressPercent(50);

    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questions: previewQuestions,
        replaceAll: true,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      schemaWarning?: string;
      schemaMigrationNeeded?: boolean;
    };
    if (!data.ok) {
      items.forEach((item) => {
        item.status = "error";
      });
      setBusy(null);
      resetProgress();
      setMessage(data.message ?? "저장 실패");
      return;
    }
    items.forEach((item) => {
      item.status = "saved";
    });
    if (data.schemaWarning) {
      setMessage(data.schemaWarning);
    }

    setBusy(null);
    resetProgress();
    setPreviewQuestions(null);
    setMessage((prev) =>
      prev && prev.includes("마이그레이션")
        ? prev
        : "문항이 저장되었습니다."
    );
    router.refresh();
  }

  async function generateAndSave() {
    if (!confirmReplaceExistingQuestions("문항을 생성·저장")) return;
    setBusy("gen-flow");
    setMessage(null);
    setPreviewQuestions(null);
    resetProgress();
    setProgressDetail("AI 문제 생성·검수·저장 중…");

    const result = await generateQuestionsSequential({
      setId,
      slots: generationSlots,
      difficultyMode,
      persist: true,
      onProgress: (percent, phase, items) => {
        setProgressPercent(percent);
        setProgressPhase(phase);
        setProgressItems(items);
        if (phase === "generating") setProgressDetail("AI 문제 생성 중…");
        else if (phase === "validating") setProgressDetail("정답 명확성 검수 중…");
        else if (phase === "saving") setProgressDetail("DB 저장 중…");
      },
    });

    setBusy(null);
    resetProgress();
    if (result.error) {
      setMessage(result.error);
      router.refresh();
      return;
    }
    const base =
      result.reviewCount > 0
        ? `저장 완료. 검토 필요 ${result.reviewCount}문항 — 대본·음원을 확인하세요.`
        : "AI 문항이 생성·저장되었습니다.";
    setMessage(result.schemaWarning ? `${base} ${result.schemaWarning}` : base);
    router.refresh();
  }

  async function regeneratePreviewItem(orderIndex: number) {
    setRegeneratingIndex(orderIndex);
    const prev = previewQuestions?.find((q) => q.order_index === orderIndex);
    const slot =
      generationSlots.find((s) => s.slotIndex === orderIndex) ??
      generationSlots[0];
    const res = await fetch("/api/listening/generate-question-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        typeId: slot?.typeId,
        orderIndex,
        mode: "exam",
        difficultyMode,
        persist: false,
        previousProblems: prev?.problems,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      question?: GeneratedListeningQuestion;
    };
    setRegeneratingIndex(null);
    if (!data.ok || !data.question) {
      setMessage(data.message ?? "재생성 실패");
      return;
    }
    setPreviewQuestions((list) =>
      (list ?? []).map((q) => (q.order_index === orderIndex ? data.question! : q))
    );
    setMessage(`${orderIndex}번 문항을 다시 생성했습니다.`);
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
    setBusy("audio-seq");
    setMessage(null);
    resetProgress();
    setProgressDetail("ElevenLabs 음원 생성 중…");

    const result = await generateAudioSequential({
      setId,
      questions: initialQuestions.map((q) => ({
        id: q.id,
        order_index: q.order_index,
      })),
      speechSpeed: speechSpeedValue,
      onProgress: (percent, detail, items) => {
        setProgressPercent(percent);
        setProgressDetail(detail);
        setProgressItems(items);
      },
    });

    setBusy(null);
    resetProgress();
    setMessage(result.message ?? "음원 생성 완료");
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
    setSelectedTypeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= questionCount) return prev;
      return [...prev, id].sort((a, b) => a - b);
    });
  }

  const speechSpeedValue = SPEECH_SPEED_MAP[speechPreset];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            ANN/M/W · ElevenLabs 음원 (속도 {speechSpeedValue})
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

      <ListeningVoiceSettings
        setId={setId}
        initialVoiceAnnId={voiceAnnId}
        initialVoiceMId={voiceMId}
        initialVoiceWId={voiceWId}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">음성 속도</h2>
        <p className="mt-1 text-xs text-slate-500">
          {gradeLevelShort(gradeLevel)} 영어듣기평가형 권장: 느리게(0.85). 저장 후
          「전체 음원 생성」으로 다시 만들어야 들리는 속도가 바뀝니다. 「최종 mp3만
          병합」은 기존 줄 음원을 이어붙이므로 속도가 변하지 않습니다.
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

        <div className="mt-3">
          <p className="text-xs font-medium text-slate-600">대상 학년 (문항 유형)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LISTENING_GRADE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={!!busy}
                onClick={() => void changeGradeLevel(opt.value)}
                className={`rounded-lg px-3 py-2 text-left text-sm ${
                  gradeLevel === opt.value
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span
                  className={`mt-0.5 block text-xs ${
                    gradeLevel === opt.value ? "text-indigo-100" : "text-slate-500"
                  }`}
                >
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

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

        <div className="mt-3">
          <p className="text-xs font-medium text-slate-600">생성 방식</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                {
                  value: "random" as const,
                  label: "랜덤 생성",
                  description: "유형을 고르지 않고 문항 수만큼 무작위 유형 배정",
                },
                {
                  value: "custom" as const,
                  label: "유형 선택",
                  description: "5·10·15·20문항 또는 아래에서 유형 직접 선택",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={!!busy}
                onClick={() => {
                  setGenerationPlanMode(opt.value);
                  if (opt.value === "random") setSelectedTypeIds([]);
                }}
                className={`rounded-lg px-3 py-2 text-left text-xs ${
                  generationPlanMode === opt.value
                    ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="mt-0.5 block text-slate-500">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="text-sm">
            <span className="font-medium text-slate-700">문항 수</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {([5, 10, 15, 20] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => selectQuestionCount(n)}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    questionCount === n
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700"
                  }`}
                >
                  {n}문항
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {generationPlanMode === "random"
                ? `실제 생성: ${plannedQuestionCount}문항 (유형 무작위)`
                : selectedTypeIds.length === 1
                  ? `실제 생성: ${plannedQuestionCount}문항 (유형 ${selectedTypeIds[0]}번 × ${plannedQuestionCount})`
                  : selectedTypeIds.length > 0
                    ? `실제 생성: ${plannedQuestionCount}문항 (선택 유형 ${selectedTypeIds.length}개)`
                    : `실제 생성: ${plannedQuestionCount}문항 (1~${plannedQuestionCount}번 유형 순서)`}
            </p>
          </div>
          <button
            type="button"
            disabled={!!busy || isGenerating}
            onClick={generatePreview}
            className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 disabled:opacity-50"
          >
            {busy === "preview" ? "생성 중…" : "미리보기 생성"}
          </button>
          <button
            type="button"
            disabled={!!busy || isGenerating}
            onClick={generateAndSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "ai" ? "생성 중…" : "바로 생성·저장"}
          </button>
        </div>

        {generationPlanMode === "custom" && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-slate-600">
              유형 선택 — 비우면 1~{questionCount}번 유형 순서 · 유형 1개만 고르면 같은
              유형 {questionCount}문항 · 여러 개 고르면 선택한 개수만큼만 생성
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {examTypes.map((t) => (
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

        {(busy === "preview" || busy === "gen-flow" || busy === "save" || isAudioBusy) &&
          (progressItems.length > 0 || progressPercent > 0) && (
          <div className="mt-4">
            <GenerationProgress
              title={
                isAudioBusy
                  ? "음원 생성 진행"
                  : busy === "save"
                    ? "저장 진행"
                    : "문항 생성·검수 진행"
              }
              percent={progressPercent}
              detailMessage={progressDetail ?? undefined}
              items={progressItems}
            />
          </div>
        )}
      </section>

      {previewQuestions && previewQuestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">문항 미리보기</h2>
            <button
              type="button"
              disabled={!!busy || isGenerating}
              onClick={savePreview}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "save" ? "저장 중…" : "이 문항들 DB에 저장"}
            </button>
          </div>
          {previewQuestions.map((q) => (
            <ListeningQuestionPreview
              key={q.order_index}
              question={q}
              showActions
              regenerateBusy={regeneratingIndex === q.order_index}
              onRegenerate={() => regeneratePreviewItem(q.order_index)}
            />
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
              disabled={!!busy || isAudioBusy}
              onClick={generateAllAudio}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isAudioBusy
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
          {isAudioBusy && progressItems.length > 0 && (
            <div className="mt-4">
              <GenerationProgress
                title="음원 생성 진행"
                percent={progressPercent}
                detailMessage={progressDetail ?? undefined}
                items={progressItems}
              />
            </div>
          )}
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
