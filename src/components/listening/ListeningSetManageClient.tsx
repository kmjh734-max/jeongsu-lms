"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningAudioBar } from "@/components/listening/ListeningAudioBar";
import {
  GenerationProgress,
  type ItemProgressRow,
} from "@/components/listening/GenerationProgress";
import {
  ListeningMenu,
  ListeningMenuDivider,
  ListeningMenuItem,
} from "@/components/listening/ListeningMenu";
import {
  ListeningQuestionEditor,
  questionNeedsReview,
  type ListeningQuestionData,
} from "@/components/listening/ListeningQuestionEditor";
import { ListeningQuestionPreview } from "@/components/listening/ListeningQuestionPreview";
import { ListeningVoiceSettings } from "@/components/listening/ListeningVoiceSettings";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  generateAudioSequential,
  generateQuestionsSequential,
} from "@/lib/listening/client-generation";
import type { DictationBlankLevel, DictationSetSettings } from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";
import { type ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { getExamTypesForGrade, tierLabel } from "@/lib/listening/exam-types";
import {
  gradeLevelShort,
  isHighSchoolListeningGrade,
  LISTENING_GRADE_OPTIONS,
  questionCountOptionsForGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import {
  planCustomGenerationSlots,
  planRandomGenerationSlots,
  type ListeningGenerationPlanMode,
} from "@/lib/listening/generation-slots";
import type { GenerationPhase } from "@/lib/listening/progress-weights";
import {
  SPEECH_SPEED_MAP,
  SPEECH_SPEED_OPTIONS,
  presetFromSpeed,
  type SpeechSpeedPreset,
} from "@/lib/listening/speech-speed";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

type Step = 1 | 2 | 3 | 4;

const BLANK_LEVEL_LABEL: Record<DictationBlankLevel, string> = {
  auto: "알아서",
  few: "적게",
  normal: "보통",
  many: "많게",
};

interface ListeningSetManageClientProps {
  setId: string;
  title: string;
  gradeLevel: ListeningGradeLevel;
  speechSpeed: number | null;
  voiceAnnId: string | null;
  voiceMId: string | null;
  voiceWId: string | null;
  dictationSettings?: Partial<DictationSetSettings>;
  questions: ListeningQuestionData[];
  role: "admin" | "teacher";
  /** 커리큘럼 잠금 — 교사는 수정 불가 */
  isLocked?: boolean;
  /** 뒤로 가기 줄에 보일 폴더 이름 */
  folderName?: string | null;
  /** 진행 중인 배정 대상 이름 */
  assignedTargets?: string[];
  /** 주소의 ?step= 값 */
  initialStep?: string;
}

function hasAudio(q: ListeningQuestionData): boolean {
  return Boolean(q.audio_url?.trim());
}

function defaultStep(questions: ListeningQuestionData[]): Step {
  if (questions.length === 0) return 1;
  if (questions.some(questionNeedsReview)) return 2;
  if (questions.some((q) => !hasAudio(q))) return 3;
  return 2;
}

function parseStep(raw: string | undefined): Step | null {
  const n = Number(raw);
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : null;
}

function SavedHint({ show, text = "저장했어요" }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
      <Icon name="check" size={13} strokeWidth={2.4} />
      {text}
    </span>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
        checked ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function ListeningSetManageClient({
  setId,
  title,
  gradeLevel: initialGradeLevel,
  speechSpeed: initialSpeechSpeed,
  voiceAnnId,
  voiceMId,
  voiceWId,
  dictationSettings: initialDictation,
  questions: initialQuestions,
  role,
  isLocked = false,
  folderName,
  assignedTargets = [],
  initialStep,
}: ListeningSetManageClientProps) {
  const readOnly = role === "teacher" && isLocked;
  const basePath = role === "admin" ? "/admin/listening" : "/teacher/listening";
  const router = useRouter();

  const [step, setStep] = useState<Step>(
    () => parseStep(initialStep) ?? defaultStep(initialQuestions)
  );
  const [gradeLevel, setGradeLevel] = useState<ListeningGradeLevel>(initialGradeLevel);
  const [generationPlanMode, setGenerationPlanMode] =
    useState<ListeningGenerationPlanMode>("random");
  const [questionCount, setQuestionCount] = useState<number>(
    isHighSchoolListeningGrade(initialGradeLevel) ? 17 : 5
  );
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [difficultyMode] = useState<ListeningDifficultyMode>("auto");
  const [speechPreset, setSpeechPreset] = useState<SpeechSpeedPreset>(
    presetFromSpeed(initialSpeechSpeed)
  );
  const [speedSaved, setSpeedSaved] = useState(false);
  const [dictation, setDictation] = useState<DictationSetSettings>({
    ...DEFAULT_DICTATION_SETTINGS,
    ...initialDictation,
  });
  const [dictationDraft, setDictationDraft] = useState<DictationSetSettings>(dictation);
  const [dictationSaved, setDictationSaved] = useState(false);
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
  const [selectedId, setSelectedId] = useState<string | null>(
    () =>
      initialQuestions.find(questionNeedsReview)?.id ?? initialQuestions[0]?.id ?? null
  );
  const editorDirtyRef = useRef(false);

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

  // 목록이 새로 오면 고른 문항이 사라졌는지 확인
  useEffect(() => {
    if (selectedId && initialQuestions.some((q) => q.id === selectedId)) return;
    setSelectedId(initialQuestions[0]?.id ?? null);
  }, [initialQuestions, selectedId]);

  useEffect(() => {
    if (!speedSaved) return;
    const t = window.setTimeout(() => setSpeedSaved(false), 4000);
    return () => window.clearTimeout(t);
  }, [speedSaved]);

  const isGenerating =
    busy === "preview" || busy === "ai" || busy === "save" || busy === "gen-flow";
  const isAudioBusy = busy === "audio-all" || busy === "audio-seq";

  const examTypes = useMemo(() => getExamTypesForGrade(gradeLevel), [gradeLevel]);

  const generationSlots = useMemo(() => {
    if (generationPlanMode === "random") {
      return planRandomGenerationSlots({ questionCount, examTypes });
    }
    return planCustomGenerationSlots({ questionCount, selectedTypeIds, examTypes });
  }, [generationPlanMode, questionCount, selectedTypeIds, examTypes]);

  const plannedQuestionCount = generationSlots.length;
  const speechSpeedValue = SPEECH_SPEED_MAP[speechPreset];

  const total = initialQuestions.length;
  const flaggedCount = initialQuestions.filter(questionNeedsReview).length;
  const audioReady = initialQuestions.filter(hasAudio).length;
  const stepDone: Record<Step, boolean> = {
    1: total > 0,
    2: total > 0 && flaggedCount === 0,
    3: total > 0 && audioReady === total,
    4: total > 0 && audioReady === total && flaggedCount === 0,
  };

  const onEditorDirty = useCallback((dirty: boolean) => {
    editorDirtyRef.current = dirty;
  }, []);

  function confirmLeaveEditor(): boolean {
    if (!editorDirtyRef.current) return true;
    const ok = window.confirm("저장하지 않은 내용이 있어요. 그래도 넘어갈까요?");
    if (ok) editorDirtyRef.current = false;
    return ok;
  }

  function goStep(next: Step) {
    if (next === step) return;
    if (step === 2 && !confirmLeaveEditor()) return;
    setStep(next);
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(next));
    window.history.replaceState(window.history.state, "", url.toString());
  }

  function selectQuestion(id: string) {
    if (id === selectedId) return;
    if (!confirmLeaveEditor()) return;
    setSelectedId(id);
  }

  function confirmReplaceExistingQuestions(): boolean {
    if (initialQuestions.length === 0) return true;
    return window.confirm(
      `이 세트에 문항 ${initialQuestions.length}개가 있어요. 새로 저장하면 지금 문항과 음성이 지워지고 새 문항으로 바뀌어요. 계속할까요?`
    );
  }

  const resetProgress = useCallback(() => {
    setProgressPercent(0);
    setProgressPhase("idle");
    setProgressDetail(null);
    setProgressItems([]);
  }, []);

  // ---- ① 문항 만들기 ----

  async function changeGradeLevel(level: ListeningGradeLevel) {
    if (level === gradeLevel) return;
    const previous = gradeLevel;
    setGradeLevel(level);
    setSelectedTypeIds([]);
    const options = questionCountOptionsForGrade(level);
    if (!options.includes(questionCount)) {
      setQuestionCount(isHighSchoolListeningGrade(level) ? 17 : 20);
    }
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade_level: level }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!data.ok) {
      setGradeLevel(previous);
      setMessage(data.message ?? "학년을 저장하지 못했어요.");
    }
  }

  function selectQuestionCount(n: number) {
    setQuestionCount(n);
    if (selectedTypeIds.length > n) {
      setSelectedTypeIds((prev) => prev.slice(0, n));
    }
  }

  function toggleTypeId(id: number) {
    setSelectedTypeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= questionCount) return prev;
      return [...prev, id].sort((a, b) => a - b);
    });
  }

  function generatingDetail(phase: GenerationPhase) {
    if (phase === "generating" || phase === "validating") {
      setProgressDetail(`${plannedQuestionCount}문항을 만들고 있어요…`);
    } else if (phase === "saving") {
      setProgressDetail("저장하고 있어요…");
    }
  }

  async function generatePreview() {
    setBusy("preview");
    setMessage(null);
    setPreviewQuestions(null);
    resetProgress();
    setProgressDetail("문항을 만들고 있어요…");

    const result = await generateQuestionsSequential({
      setId,
      slots: generationSlots,
      difficultyMode,
      persist: false,
      onProgress: (percent, phase, items) => {
        setProgressPercent(percent);
        setProgressPhase(phase);
        setProgressItems(items);
        generatingDetail(phase);
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
    setMessage("미리보기를 만들었어요. 살펴보고 저장해 주세요.");
  }

  async function savePreview() {
    if (!previewQuestions?.length) return;
    if (!confirmReplaceExistingQuestions()) return;
    setBusy("save");
    setMessage(null);
    resetProgress();
    setProgressDetail("저장하고 있어요…");
    const items: ItemProgressRow[] = previewQuestions.map((q) => ({
      orderIndex: q.order_index,
      status: "saving",
    }));
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
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    resetProgress();
    if (!data.ok) {
      setMessage(data.message ?? "저장하지 못했어요.");
      return;
    }
    setPreviewQuestions(null);
    setMessage("문항을 저장했어요. ② 검토·수정에서 하나씩 살펴보세요.");
    router.refresh();
  }

  async function generateAndSave() {
    if (!confirmReplaceExistingQuestions()) return;
    setBusy("gen-flow");
    setMessage(null);
    setPreviewQuestions(null);
    resetProgress();
    setProgressDetail(`${plannedQuestionCount}문항을 만들어 저장하고 있어요…`);

    const result = await generateQuestionsSequential({
      setId,
      slots: generationSlots,
      difficultyMode,
      persist: true,
      onProgress: (percent, phase, items) => {
        setProgressPercent(percent);
        setProgressPhase(phase);
        setProgressItems(items);
        generatingDetail(phase);
      },
    });

    setBusy(null);
    resetProgress();
    if (result.error) {
      setMessage(result.error);
      router.refresh();
      return;
    }
    setMessage(
      `${plannedQuestionCount}문항을 만들어 저장했어요. 검토한 뒤 ③ 음성 만들기에서 음성을 만들어 주세요.`
    );
    router.refresh();
  }

  async function regeneratePreviewItem(orderIndex: number) {
    setRegeneratingIndex(orderIndex);
    const prev = previewQuestions?.find((q) => q.order_index === orderIndex);
    const slot = generationSlots.find((s) => s.slotIndex === orderIndex);
    const res = await fetch("/api/listening/generate-question-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        typeId: slot?.typeId ?? orderIndex,
        orderIndex,
        mode: "exam",
        difficultyMode,
        persist: false,
        previousProblems: prev?.problems,
        previousQuestion: prev
          ? {
              situation_type: prev.situation_type,
              choices: prev.choices,
              correct_answer: prev.correct_answer,
              script_text: prev.script_text,
            }
          : undefined,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      question?: GeneratedListeningQuestion;
    };
    setRegeneratingIndex(null);
    if (!data.ok || !data.question) {
      setMessage(data.message ?? "다시 만들지 못했어요.");
      return;
    }
    setPreviewQuestions((list) =>
      (list ?? []).map((q) =>
        q.order_index === orderIndex ? { ...data.question!, order_index: orderIndex } : q
      )
    );
    setMessage(`${orderIndex}번 문항을 다시 만들었어요.`);
  }

  // ---- ③ 음성 ----

  async function saveSpeechSpeed(preset: SpeechSpeedPreset) {
    const previous = speechPreset;
    setSpeechPreset(preset);
    setSpeedSaved(false);
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speech_speed: SPEECH_SPEED_MAP[preset] }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (data.ok) {
      setSpeedSaved(true);
      router.refresh();
    } else {
      setSpeechPreset(previous);
      setMessage(data.message ?? "속도를 저장하지 못했어요.");
    }
  }

  async function generateAllAudio() {
    if (initialQuestions.length === 0) {
      setMessage("먼저 문항을 만들어 저장해 주세요.");
      return;
    }
    setBusy("audio-seq");
    setMessage(null);
    resetProgress();
    setProgressDetail("문항별 음성을 만들고 있어요…");

    const result = await generateAudioSequential({
      setId,
      questions: initialQuestions.map((q) => ({ id: q.id, order_index: q.order_index })),
      speechSpeed: speechSpeedValue,
      onProgress: (percent, detail, items) => {
        setProgressPercent(percent);
        setProgressDetail(detail);
        setProgressItems(items);
      },
    });

    setBusy(null);
    resetProgress();
    setMessage(result.message ?? "음성을 다 만들었어요.");
    router.refresh();
  }

  async function generateOneAudio(q: ListeningQuestionData) {
    setBusy(`audio-${q.id}`);
    setMessage(null);
    const res = await fetch("/api/listening/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questionId: q.id, speechSpeed: speechSpeedValue }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string; audioUrl?: string };
    setBusy(null);
    if (!data.ok || !data.audioUrl) {
      setMessage(data.message ?? `${q.order_index}번 음성을 만들지 못했어요.`);
      return;
    }
    setMessage(`${q.order_index}번 음성을 만들었어요.`);
    router.refresh();
  }

  // ---- ④ 받아쓰기 ----

  const dictationDirty =
    JSON.stringify(dictationDraft) !== JSON.stringify(dictation);

  function editDictation(patch: Partial<DictationSetSettings>) {
    setDictationDraft((d) => ({ ...d, ...patch }));
    setDictationSaved(false);
  }

  async function saveDictationSettings() {
    setBusy("dictation-save");
    setDictationSaved(false);
    const next = { ...dictationDraft };
    const res = await fetch(`/api/listening/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (data.ok) {
      setDictation(next);
      setDictationSaved(true);
      router.refresh();
    } else {
      setMessage(data.message ?? "받아쓰기 설정을 저장하지 못했어요.");
    }
  }

  async function prebuildDictation() {
    setBusy("dictation-prebuild");
    setMessage(null);
    const res = await fetch("/api/listening/dictation/prebuild-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "받아쓰기를 미리 만들지 못했어요.");
      return;
    }
    setMessage("받아쓰기 빈칸을 미리 만들었어요.");
    router.refresh();
  }

  // ---- 세트 ----

  async function deleteSet() {
    if (!window.confirm(`「${title}」 세트와 문항·음성·배정을 모두 지울까요?`)) return;
    setBusy("delete");
    const res = await fetch(`/api/listening/sets/${setId}`, { method: "DELETE" });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "세트를 지우지 못했어요.");
      return;
    }
    router.push(`${basePath}/sets`);
    router.refresh();
  }

  // ---- 화면 ----

  const steps: Array<{ n: Step; title: string; sub: string; warn?: boolean }> = [
    { n: 1, title: "문항 만들기", sub: total > 0 ? `${total}문항` : "아직 없어요" },
    {
      n: 2,
      title: "검토·수정",
      sub:
        total === 0
          ? "문항을 먼저 만들어요"
          : flaggedCount > 0
            ? `${flaggedCount}개 확인 필요`
            : "확인할 것 없음",
      warn: flaggedCount > 0,
    },
    { n: 3, title: "음성 만들기", sub: total > 0 ? `${audioReady}/${total}` : "—" },
    {
      n: 4,
      title: "받아쓰기",
      sub: dictation.dictation_enabled ? `${dictation.dictation_pass_score}점 통과` : "끔",
    },
  ];

  const assignedSummary =
    assignedTargets.length === 0
      ? null
      : assignedTargets.length === 1
        ? assignedTargets[0]
        : `${assignedTargets[0]} 외 ${assignedTargets.length - 1}`;

  const selectedIndex = initialQuestions.findIndex((q) => q.id === selectedId);
  const selectedQuestion = selectedIndex >= 0 ? initialQuestions[selectedIndex] : null;
  const prevQuestion = selectedIndex > 0 ? initialQuestions[selectedIndex - 1] : null;
  const nextQuestion =
    selectedIndex >= 0 && selectedIndex < total - 1 ? initialQuestions[selectedIndex + 1] : null;

  const planHint =
    generationPlanMode === "random" || selectedTypeIds.length === 0
      ? `${plannedQuestionCount}문항을 1번 유형부터 차례로 만들어요.`
      : selectedTypeIds.length === 1
        ? `${selectedTypeIds[0]}번 유형으로 ${plannedQuestionCount}문항을 만들어요.`
        : selectedTypeIds.length >= questionCount
          ? `고른 유형 ${selectedTypeIds.length}개로 ${plannedQuestionCount}문항을 만들어요.`
          : `고른 유형 ${selectedTypeIds.length}개를 돌려 가며 ${plannedQuestionCount}문항을 만들어요.`;

  const showGenProgress =
    (busy === "preview" || busy === "gen-flow" || busy === "save") &&
    (progressItems.length > 0 || progressPercent > 0);

  return (
    <div className="space-y-4">
      {/* 머리 */}
      <div className="space-y-2.5">
        <Link
          href={`${basePath}/sets`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Icon name="left" size={16} />
          듣기학습 · {folderName ?? "전체"}
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
              {isLocked ? <Icon name="lock" size={18} className="text-slate-400" /> : null}
              <span className="truncate">{title}</span>
            </h1>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex h-[22px] items-center rounded bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                {gradeLevelShort(gradeLevel)} · {total}문항
              </span>
              {assignedSummary ? (
                <span
                  className="inline-flex h-[22px] items-center gap-1 rounded bg-brand-50 px-2 text-xs font-semibold text-brand-700"
                  title={assignedTargets.join(", ")}
                >
                  <Icon name="users" size={12} strokeWidth={2} />
                  {assignedSummary}에 배정 중
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ButtonLink href={`${basePath}/${setId}/print`} variant="secondary">
              <Icon name="print" size={16} />
              시험지 인쇄
            </ButtonLink>
            <ButtonLink href={`${basePath}/assign?set=${setId}`}>
              <Icon name="calendar" size={16} />
              배정
            </ButtonLink>
            <ListeningMenu
              label="세트 메뉴"
              triggerClassName="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ListeningMenuItem icon="file" href={`${basePath}/${setId}/print?script=1`}>
                대본 넣어 인쇄
              </ListeningMenuItem>
              <ListeningMenuDivider />
              <ListeningMenuItem
                icon="trash"
                danger
                disabled={readOnly || busy === "delete"}
                onClick={() => void deleteSet()}
              >
                세트 지우기
              </ListeningMenuItem>
            </ListeningMenu>
          </div>
        </div>
      </div>

      {readOnly ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <Icon name="lock" size={16} />
          학원 교재라 수정할 수 없어요. 인쇄와 배정은 할 수 있어요.
        </p>
      ) : isLocked ? (
        <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Icon name="lock" size={16} className="text-slate-400" />
          학원 교재예요. 선생님 계정에서는 고칠 수 없고, 관리자만 고칠 수 있어요.
        </p>
      ) : null}

      {/* 단계 */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4" role="tablist" aria-label="세트 만들기 단계">
        {steps.map((s) => {
          const current = s.n === step;
          const done = !current && stepDone[s.n];
          return (
            <button
              key={s.n}
              type="button"
              role="tab"
              aria-selected={current}
              onClick={() => goStep(s.n)}
              className={`flex items-center gap-3 rounded-lg bg-white px-3.5 py-3 text-left transition ${
                current
                  ? "border-[1.5px] border-brand-600 ring-[3px] ring-brand-50"
                  : "border border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums ${
                  done
                    ? "bg-green-700 text-white"
                    : current
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Icon name="check" size={15} strokeWidth={2.8} /> : s.n}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-bold ${
                    current || done ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
                <span
                  className={`block truncate text-xs ${
                    s.warn ? "font-medium text-amber-700" : "text-slate-500"
                  }`}
                >
                  {s.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {message ? (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-800"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="알림 닫기"
            className="shrink-0 rounded p-0.5 text-brand-700 hover:bg-brand-100"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ) : null}

      {/* ① 문항 만들기 */}
      {step === 1 ? (
        <div className="space-y-4">
          <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
            <div>
              <h2 className="text-base font-bold text-slate-900">문항 만들기</h2>
              <p className="mt-1 text-sm text-slate-500">
                유형만 참고해 새 대본과 문항을 만들어요. 기출 문제를 그대로 옮기지 않아요.
              </p>
            </div>

            {readOnly ? (
              <p className="text-sm text-slate-500">학원 교재는 문항을 새로 만들 수 없어요.</p>
            ) : (
              <>
                <div>
                  <p className="ui-label">학년</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {LISTENING_GRADE_OPTIONS.map((opt) => {
                      const on = gradeLevel === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={!!busy}
                          onClick={() => void changeGradeLevel(opt.value)}
                          className={`rounded-md border px-3 py-2.5 text-left transition disabled:opacity-60 ${
                            on
                              ? "border-brand-600 bg-brand-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <span className={`block text-sm font-semibold ${on ? "text-brand-700" : "text-slate-900"}`}>
                            {opt.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="ui-label">만드는 방식</p>
                    <div className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
                      {(
                        [
                          { value: "random" as const, label: "차례대로" },
                          { value: "custom" as const, label: "유형 고르기" },
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
                          className={`px-3.5 py-1.5 text-[13px] font-semibold transition ${
                            generationPlanMode === opt.value
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="ui-label">문항 수</p>
                    <div className="flex flex-wrap gap-1.5">
                      {questionCountOptionsForGrade(gradeLevel).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => selectQuestionCount(n)}
                          className={`h-[30px] rounded-md px-3 text-[13px] font-semibold transition ${
                            questionCount === n
                              ? "bg-brand-600 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {n}문항
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {generationPlanMode === "custom" ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs text-slate-500">
                      안 고르면 1번 유형부터 차례로 · 하나만 고르면 그 유형으로만 · 여러 개면 돌려 가며{" "}
                      {questionCount}문항까지 만들어요.
                    </p>
                    <div className="grid max-h-56 gap-1 overflow-y-auto sm:grid-cols-2">
                      {examTypes.map((t) => (
                        <label
                          key={t.id}
                          className="flex cursor-pointer items-start gap-2 rounded px-1.5 py-1 text-xs text-slate-700 hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypeIds.includes(t.id)}
                            onChange={() => toggleTypeId(t.id)}
                            className="mt-0.5 h-3.5 w-3.5 accent-brand-600"
                          />
                          <span>
                            {t.id}. {t.question_type}{" "}
                            <span className="text-slate-400">({tierLabel(t.difficulty_tier)})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">
                    <p>{planHint}</p>
                    {total > 0 ? (
                      <p className="mt-0.5 text-amber-700">
                        지금 문항 {total}개가 있어요. 새로 저장하면 바뀌어요.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      disabled={!!busy || isGenerating}
                      onClick={() => void generatePreview()}
                    >
                      {busy === "preview" ? "만드는 중…" : "미리보기 만들기"}
                    </Button>
                    <Button disabled={!!busy || isGenerating} onClick={() => void generateAndSave()}>
                      <Icon name="sparkle" size={16} />
                      {busy === "gen-flow" ? "만드는 중…" : "바로 만들어 저장"}
                    </Button>
                  </div>
                </div>

                {showGenProgress ? (
                  <GenerationProgress
                    title={busy === "save" ? "저장하고 있어요" : "문항을 만들고 있어요"}
                    percent={progressPercent}
                    detailMessage={progressDetail ?? undefined}
                    items={progressItems}
                  />
                ) : null}
              </>
            )}
          </section>

          {previewQuestions && previewQuestions.length > 0 ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  미리보기 <span className="text-slate-400">{previewQuestions.length}문항</span>
                </h2>
                <Button disabled={!!busy || isGenerating} onClick={() => void savePreview()}>
                  {busy === "save" ? "저장 중…" : "이 문항들 저장"}
                </Button>
              </div>
              {previewQuestions.map((q) => (
                <ListeningQuestionPreview
                  key={q.order_index}
                  question={q}
                  showActions
                  regenerateBusy={regeneratingIndex === q.order_index}
                  onRegenerate={() => void regeneratePreviewItem(q.order_index)}
                />
              ))}
            </section>
          ) : null}
        </div>
      ) : null}

      {/* ② 검토·수정 */}
      {step === 2 ? (
        total === 0 ? (
          <EmptyStep
            text="아직 문항이 없어요. 먼저 문항을 만들어 주세요."
            action={<Button onClick={() => goStep(1)}>① 문항 만들기로</Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="self-start rounded-lg border border-slate-200 bg-white px-2 py-2.5 shadow-card">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <span className="text-sm font-bold text-slate-900">문항 {total}</span>
                {flaggedCount > 0 ? (
                  <span className="text-xs font-semibold text-amber-700">확인 필요 {flaggedCount}</span>
                ) : null}
              </div>
              <ul className="flex gap-1 overflow-x-auto pb-1 lg:max-h-[calc(100vh-18rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
                {initialQuestions.map((q) => {
                  const on = q.id === selectedId;
                  const flag = questionNeedsReview(q);
                  return (
                    <li key={q.id} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => selectQuestion(q.id)}
                        aria-current={on ? "true" : undefined}
                        className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left transition ${
                          on ? "bg-brand-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`w-5 text-[13px] font-bold tabular-nums ${
                            on ? "text-brand-700" : "text-slate-500"
                          }`}
                        >
                          {q.order_index}
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-[13px] ${
                            on ? "font-semibold text-brand-700" : "font-medium text-slate-900"
                          }`}
                        >
                          {q.question_type}
                        </span>
                        {flag ? (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                            확인 필요
                          </span>
                        ) : hasAudio(q) ? (
                          <Icon name="speaker" size={14} className="text-green-700" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {selectedQuestion ? (
              <ListeningQuestionEditor
                key={selectedQuestion.id}
                setId={setId}
                question={selectedQuestion}
                speechSpeed={speechSpeedValue}
                onUpdated={() => router.refresh()}
                readOnly={readOnly}
                onDirtyChange={onEditorDirty}
                footer={
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!prevQuestion}
                      onClick={() => prevQuestion && selectQuestion(prevQuestion.id)}
                    >
                      <Icon name="left" size={15} />
                      {prevQuestion ? `${prevQuestion.order_index}번` : "처음"}
                    </Button>
                    <span className="hidden text-center text-[13px] text-slate-500 sm:block">
                      검토를 마치면{" "}
                      <button
                        type="button"
                        onClick={() => goStep(3)}
                        className="font-bold text-slate-900 hover:text-brand-700"
                      >
                        ③ 음성 만들기
                      </button>
                      로 넘어가요
                    </span>
                    {nextQuestion ? (
                      <Button variant="secondary" size="sm" onClick={() => selectQuestion(nextQuestion.id)}>
                        {nextQuestion.order_index}번
                        <Icon name="chevron" size={15} />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => goStep(3)}>
                        음성 만들기
                        <Icon name="chevron" size={15} />
                      </Button>
                    )}
                  </div>
                }
              />
            ) : null}
          </div>
        )
      ) : null}

      {/* ③ 음성 만들기 */}
      {step === 3 ? (
        total === 0 ? (
          <EmptyStep
            text="음성을 만들 문항이 없어요. 먼저 문항을 만들어 주세요."
            action={<Button onClick={() => goStep(1)}>① 문항 만들기로</Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-card">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">음성 만들기</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    대본을 읽어 학생이 들을 음성을 만들어요. 지시문과 선택지는 읽지 않아요.
                  </p>
                </div>
                {!readOnly ? (
                  <Button
                    className="shrink-0"
                    disabled={!!busy || isAudioBusy}
                    onClick={() => void generateAllAudio()}
                  >
                    <Icon name="speaker" size={16} />
                    {isAudioBusy ? "만드는 중…" : `전체 음성 만들기 (${total}문항)`}
                  </Button>
                ) : null}
              </div>
              {isAudioBusy && (progressItems.length > 0 || progressPercent > 0) ? (
                <div className="border-b border-slate-100 p-4">
                  <GenerationProgress
                    title="음성을 만들고 있어요"
                    percent={progressPercent}
                    detailMessage={progressDetail ?? undefined}
                    items={progressItems}
                  />
                </div>
              ) : null}
              <div className="flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-slate-500">
                <span>문항별 음성</span>
                <span className={audioReady === total ? "text-green-700" : "text-amber-700"}>
                  {audioReady}/{total} 준비됨
                </span>
              </div>
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {initialQuestions.map((q) => {
                  const ready = hasAudio(q);
                  const rowBusy = busy === `audio-${q.id}`;
                  return (
                    <li
                      key={q.id}
                      className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5 md:grid-cols-[28px_minmax(0,160px)_minmax(0,1fr)_auto]"
                    >
                      <span className="text-[13px] font-bold tabular-nums text-slate-500">
                        {q.order_index}
                      </span>
                      <span className="truncate text-[13px] font-medium text-slate-900">
                        {q.question_type}
                      </span>
                      <div className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
                        {ready ? (
                          <ListeningAudioBar src={q.audio_url!} compact />
                        ) : (
                          <span className="inline-flex h-[22px] items-center rounded bg-slate-100 px-2 text-xs font-semibold text-slate-500">
                            음성 없음
                          </span>
                        )}
                      </div>
                      {!readOnly ? (
                        <Button
                          variant={ready ? "ghost" : "secondary"}
                          size="sm"
                          disabled={!!busy}
                          onClick={() => void generateOneAudio(q)}
                        >
                          {rowBusy ? "만드는 중…" : ready ? "다시 만들기" : "만들기"}
                        </Button>
                      ) : (
                        <span />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="space-y-4">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
                <h3 className="text-sm font-bold text-slate-900">읽는 속도</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SPEECH_SPEED_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      disabled={!!busy || readOnly}
                      onClick={() => void saveSpeechSpeed(key)}
                      aria-pressed={speechPreset === key}
                      className={`h-[30px] rounded-md px-3 text-[13px] font-semibold transition disabled:opacity-60 ${
                        speechPreset === key
                          ? "bg-brand-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  속도를 바꾸면 음성을 다시 만들어야 바뀐 속도로 들려요.
                </p>
                <div className="mt-1">
                  <SavedHint show={speedSaved} />
                </div>
              </section>
              <ListeningVoiceSettings
                setId={setId}
                initialVoiceAnnId={voiceAnnId}
                initialVoiceMId={voiceMId}
                initialVoiceWId={voiceWId}
                readOnly={readOnly}
              />
            </div>
          </div>
        )
      ) : null}

      {/* ④ 받아쓰기 */}
      {step === 4 ? (
        <section className="max-w-2xl rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">받아쓰기</h2>
              <p className="mt-1 text-sm text-slate-500">
                객관식을 푼 뒤 문항마다 대본 빈칸을 채워요.
              </p>
            </div>
            <Switch
              label="받아쓰기 사용"
              checked={dictationDraft.dictation_enabled}
              disabled={readOnly}
              onChange={(v) => editDictation({ dictation_enabled: v })}
            />
          </div>

          <div className={`space-y-4 p-5 ${dictationDraft.dictation_enabled ? "" : "opacity-50"}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="ui-label">기본 통과 점수</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={dictationDraft.dictation_pass_score}
                    disabled={readOnly || !dictationDraft.dictation_enabled}
                    onChange={(e) =>
                      editDictation({ dictation_pass_score: Number(e.target.value) || 0 })
                    }
                    className="ui-input w-24"
                  />
                  <span className="text-sm text-slate-600">점</span>
                </div>
                <span className="mt-1 block text-xs text-slate-500">
                  배정할 때 반·학생마다 바꿀 수 있어요.
                </span>
              </label>
              <label className="block">
                <span className="ui-label">빈칸 수</span>
                <select
                  value={dictationDraft.dictation_blank_level}
                  disabled={readOnly || !dictationDraft.dictation_enabled}
                  onChange={(e) =>
                    editDictation({ dictation_blank_level: e.target.value as DictationBlankLevel })
                  }
                  className="ui-select"
                >
                  {(Object.keys(BLANK_LEVEL_LABEL) as DictationBlankLevel[]).map((k) => (
                    <option key={k} value={k}>
                      {BLANK_LEVEL_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={dictationDraft.dictation_randomize_on_retry}
                  disabled={readOnly || !dictationDraft.dictation_enabled}
                  onChange={(e) => editDictation({ dictation_randomize_on_retry: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                />
                다시 할 때 빈칸 위치 바꾸기
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={dictationDraft.dictation_lock_next_until_pass}
                  disabled={readOnly || !dictationDraft.dictation_enabled}
                  onChange={(e) =>
                    editDictation({ dictation_lock_next_until_pass: e.target.checked })
                  }
                  className="h-4 w-4 accent-brand-600"
                />
                통과해야 다음 문제로
              </label>
            </div>
          </div>

          {!readOnly ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  disabled={!dictationDirty || busy === "dictation-save"}
                  onClick={() => void saveDictationSettings()}
                >
                  {busy === "dictation-save" ? "저장 중…" : "저장"}
                </Button>
                {dictationDirty ? (
                  <span className="text-xs font-medium text-amber-700">저장 안 한 내용이 있어요</span>
                ) : (
                  <SavedHint show={dictationSaved} />
                )}
              </div>
              {dictation.dictation_enabled && total > 0 ? (
                <Button
                  variant="secondary"
                  disabled={!!busy}
                  onClick={() => void prebuildDictation()}
                >
                  {busy === "dictation-prebuild" ? "만드는 중…" : `받아쓰기 미리 만들기 (${total}문항)`}
                </Button>
              ) : null}
            </div>
          ) : null}
          {!readOnly && dictation.dictation_enabled && total > 0 ? (
            <p className="px-5 pb-4 text-xs text-slate-500">
              세트를 열거나 문항·음성을 저장하면 빈칸은 알아서 준비돼요. 전부 새로 만들 때만 눌러
              주세요.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function EmptyStep({ text, action }: { text: string; action: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-sm text-slate-600">{text}</p>
      <div className="mt-4 flex justify-center">{action}</div>
    </div>
  );
}
