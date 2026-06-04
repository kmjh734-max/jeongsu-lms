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
import { ListeningQuestionCompact } from "@/components/listening/ListeningQuestionCompact";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";
import { ListeningQuestionEditor } from "@/components/listening/ListeningQuestionEditor";
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
import type { DictationBlankLevel, DictationSetSettings } from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";

interface ListeningSetManageClientProps {
  setId: string;
  title: string;
  gradeLevel: ListeningGradeLevel;
  isPublished: boolean;
  speechSpeed: number | null;
  voiceAnnId: string | null;
  voiceMId: string | null;
  voiceWId: string | null;
  dictationSettings?: Partial<DictationSetSettings>;
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
  dictationSettings: initialDictation,
  questions: initialQuestions,
  role,
}: ListeningSetManageClientProps) {
  const router = useRouter();
  const [gradeLevel, setGradeLevel] = useState<ListeningGradeLevel>(initialGradeLevel);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [generationPlanMode, setGenerationPlanMode] =
    useState<ListeningGenerationPlanMode>("random");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15 | 20>(5);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [difficultyMode, setDifficultyMode] =
    useState<ListeningDifficultyMode>("auto");
  const [speechPreset, setSpeechPreset] = useState<SpeechSpeedPreset>(
    presetFromSpeed(initialSpeechSpeed)
  );
  const [dictation, setDictation] = useState<DictationSetSettings>({
    ...DEFAULT_DICTATION_SETTINGS,
    ...initialDictation,
  });

  useEffect(() => {
    setSpeechPreset(presetFromSpeed(initialSpeechSpeed));
  }, [initialSpeechSpeed]);

  useEffect(() => {
    if (!dictation.dictation_enabled || initialQuestions.length === 0) return;
    void fetch("/api/listening/dictation/ensure-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
  }, [setId, dictation.dictation_enabled, initialQuestions.length]);
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
  const useCompactQuestionList = initialQuestions.length >= 6;

  function confirmReplaceExistingQuestions(actionLabel: string): boolean {
    if (initialQuestions.length === 0) return true;
    return window.confirm(
      `이 세트에 저장된 문항 ${initialQuestions.length}개가 있습니다. ${actionLabel}하면 기존 문항·음원이 삭제되고 새 문항으로 바뀝니다. 계속할까요?`
    );
  }

  async function prebuildDictation() {
    setBusy("dictation-prebuild");
    setMessage(null);
    const res = await fetch("/api/listening/dictation/prebuild-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      prepared?: number;
      failed?: number;
    };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "Dictation 미리 생성 실패");
      return;
    }
    setMessage(data.message ?? "Dictation 미리 생성 완료");
    router.refresh();
  }

  async function saveDictationSettings(patch: Partial<DictationSetSettings>) {
    const next = { ...dictation, ...patch };
    setDictation(next);
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (data.ok) {
      setMessage("Dictation 설정이 저장되었습니다.");
      router.refresh();
    } else {
      setMessage(data.message ?? "Dictation 설정 저장 실패");
    }
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
        if (phase === "generating" || phase === "validating") {
          const apiCalls =
            plannedQuestionCount <= 5
              ? 1
              : Math.ceil(plannedQuestionCount / 5);
          setProgressDetail(
            apiCalls === 1
              ? `${plannedQuestionCount}문항 일괄 생성 중…`
              : `${plannedQuestionCount}문항 생성 중 (${apiCalls}회 일괄 호출)…`
          );
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
    setMessage("미리보기가 생성되었습니다. 확인 후 저장하세요.");
  }

  async function savePreview() {
    if (!previewQuestions?.length) return;
    if (!confirmReplaceExistingQuestions("미리보기 문항을 DB에 저장")) return;
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
        questions: previewQuestions.map((q, i) => ({
          ...q,
          order_index: generationSlots[i]?.slotIndex ?? i + 1,
        })),
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
    setProgressDetail(`${plannedQuestionCount}문항 생성·저장 중…`);

    const result = await generateQuestionsSequential({
      setId,
      slots: generationSlots,
      difficultyMode,
      persist: true,
      onProgress: (percent, phase, items) => {
        setProgressPercent(percent);
        setProgressPhase(phase);
        setProgressItems(items);
        if (phase === "generating" || phase === "validating") {
          const apiCalls =
            plannedQuestionCount <= 5
              ? 1
              : Math.ceil(plannedQuestionCount / 5);
          setProgressDetail(
            apiCalls === 1
              ? `${plannedQuestionCount}문항 일괄 생성 중…`
              : `${plannedQuestionCount}문항 생성 중 (${apiCalls}회 일괄 호출)…`
          );
        } else if (phase === "saving") setProgressDetail("DB 저장 중…");
      },
    });

    setBusy(null);
    resetProgress();
    if (result.error) {
      setMessage(result.error);
      router.refresh();
      return;
    }
    const base = `${plannedQuestionCount}문항이 생성·저장되었습니다. 「전체 음원 생성」만 누르면 학생 재생용 mp3까지 저장됩니다.`;
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
      (list ?? []).map((q) =>
        q.order_index === orderIndex
          ? { ...data.question!, order_index: orderIndex }
          : q
      )
    );
    setMessage(`${orderIndex}번 문항을 다시 생성했습니다.`);
  }

  async function generateAllAudio() {
    if (initialQuestions.length === 0) {
      setMessage("먼저 문항을 생성·저장하세요.");
      return;
    }
    setBusy("audio-seq");
    setMessage(null);
    resetProgress();
    setProgressDetail("문항별 음원·재생 mp3 생성 중…");

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
        <h2 className="text-sm font-semibold text-slate-800">Dictation 설정</h2>
        <p className="mt-1 text-xs text-slate-500">
          객관식 제출 후 문항별 받아쓰기. 통과 점수 미만이면 다음 문항 잠금(설정 시).
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={dictation.dictation_enabled}
            onChange={(e) => void saveDictationSettings({ dictation_enabled: e.target.checked })}
          />
          Dictation 사용
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-600">
            통과 기준 점수
            <input
              type="number"
              min={0}
              max={100}
              value={dictation.dictation_pass_score}
              onChange={(e) =>
                setDictation((d) => ({
                  ...d,
                  dictation_pass_score: Number(e.target.value) || 80,
                }))
              }
              onBlur={() =>
                void saveDictationSettings({
                  dictation_pass_score: dictation.dictation_pass_score,
                })
              }
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-slate-600">
            빈칸 개수
            <select
              value={dictation.dictation_blank_level}
              onChange={(e) =>
                void saveDictationSettings({
                  dictation_blank_level: e.target.value as DictationBlankLevel,
                })
              }
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            >
              <option value="auto">자동</option>
              <option value="few">적게</option>
              <option value="normal">보통</option>
              <option value="many">많게</option>
            </select>
          </label>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={dictation.dictation_randomize_on_retry}
            onChange={(e) =>
              void saveDictationSettings({
                dictation_randomize_on_retry: e.target.checked,
              })
            }
          />
          재시도 시 빈칸 랜덤 변경
        </label>
        <label className="mt-1 flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={dictation.dictation_lock_next_until_pass}
            onChange={(e) =>
              void saveDictationSettings({
                dictation_lock_next_until_pass: e.target.checked,
              })
            }
          />
          통과 전 다음 문제 잠금
        </label>
        {dictation.dictation_enabled && initialQuestions.length > 0 && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => void prebuildDictation()}
            className="mt-3 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-900 disabled:opacity-50"
          >
            {busy === "dictation-prebuild"
              ? "Dictation 미리 생성 중…"
              : `Dictation 미리 생성 (${initialQuestions.length}문항)`}
          </button>
        )}
        <p className="mt-1 text-xs text-slate-500">
          세트를 열거나 문항·음원을 저장하면 빈칸이 자동으로 준비됩니다. 아래 버튼은
          전체를 다시 만들 때만 사용하세요.
        </p>
      </section>

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
                    ? selectedTypeIds.length >= questionCount
                      ? `실제 생성: ${plannedQuestionCount}문항 (선택 유형 ${selectedTypeIds.length}개)`
                      : `실제 생성: ${plannedQuestionCount}문항 (선택 유형 ${selectedTypeIds.length}개 반복)`
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
            {busy === "gen-flow" ? "생성 중…" : "바로 생성·저장"}
          </button>
        </div>

        {generationPlanMode === "custom" && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-slate-600">
              유형 선택 — 비우면 1~{questionCount}번 유형 순서 · 유형 1개만 고르면 같은
              유형 {questionCount}문항 · 여러 개 고르면 {questionCount}문항까지 선택 유형 반복
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
                    : "문항 생성 진행"
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
          <h2 className="text-sm font-semibold text-slate-800">음원 생성</h2>
          <p className="mt-1 text-xs text-slate-600">
            「전체 음원 생성」 한 번이면 문항별 재생 mp3가 저장됩니다. 별도 병합 단계는
            필요 없습니다.
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
        <div className="space-y-3">
          {useCompactQuestionList ? (
            <>
              <p className="text-xs text-slate-500">
                문항이 많아 요약 목록으로 표시합니다. 수정할 문항만 펼치세요.
              </p>
              {initialQuestions.map((q) => (
                <ListeningQuestionCompact
                  key={q.id}
                  setId={setId}
                  question={q}
                  speechSpeed={speechSpeedValue}
                  onUpdated={() => router.refresh()}
                />
              ))}
            </>
          ) : (
            initialQuestions.map((q) => (
              <ListeningQuestionEditor
                key={q.id}
                setId={setId}
                question={q}
                speechSpeed={speechSpeedValue}
                onUpdated={() => router.refresh()}
              />
            ))
          )}
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
