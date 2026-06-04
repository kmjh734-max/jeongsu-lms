"use client";

import { DictationSection } from "@/components/listening/DictationSection";
import { continuationQuestionDisplayText } from "@/lib/listening/fix-continuation-question";
import type {
  DictationSetSettings,
  DictationStartPayloadClient,
} from "@/lib/listening/dictation/types";
import { DEFAULT_DICTATION_SETTINGS } from "@/lib/listening/dictation/types";
import { normalizeTableData } from "@/lib/listening/table-data";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
import type { ListeningTableData } from "@/lib/listening/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

export interface StudentListeningQuestion {
  id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  audio_url: string | null;
  script_text?: string;
  script_translation?: string;
  answer_clue?: string;
  explanation?: string;
  table_data?: ListeningTableData | null;
}

interface QuestionDictationStatus {
  passed: boolean;
  bestScore: number | null;
  attemptCount: number;
}

interface SchedulePracticeMode {
  dailyTaskId: string;
  requireDictationPass: boolean;
  dictationPassScore: number;
  initialProgress?: Record<
    string,
    { objectiveCompleted: boolean; dictationCompleted: boolean; completed: boolean }
  >;
}

interface StudentListeningPracticeProps {
  setId: string;
  setTitle: string;
  questions: StudentListeningQuestion[];
  dictationSettings?: Partial<DictationSetSettings>;
  scheduleMode?: SchedulePracticeMode;
}

export function StudentListeningPractice({
  setId,
  setTitle,
  questions,
  dictationSettings: dictationSettingsProp,
  scheduleMode,
}: StudentListeningPracticeProps) {
  const router = useRouter();
  const dictationSettings: DictationSetSettings = {
    ...DEFAULT_DICTATION_SETTINGS,
    ...dictationSettingsProp,
  };

  const initialObjective = useMemo(() => {
    const m: Record<string, boolean> = {};
    if (scheduleMode?.initialProgress) {
      for (const [qid, p] of Object.entries(scheduleMode.initialProgress)) {
        if (p.objectiveCompleted) m[qid] = true;
      }
    }
    return m;
  }, [scheduleMode]);

  const initialDictation = useMemo(() => {
    const m: Record<string, QuestionDictationStatus> = {};
    if (scheduleMode?.initialProgress) {
      for (const [qid, p] of Object.entries(scheduleMode.initialProgress)) {
        if (p.completed || p.dictationCompleted) {
          m[qid] = { passed: true, bestScore: null, attemptCount: 1 };
        }
      }
    }
    return m;
  }, [scheduleMode]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [objectiveSubmitted, setObjectiveSubmitted] =
    useState<Record<string, boolean>>(initialObjective);
  const [dictationByQuestion, setDictationByQuestion] = useState<
    Record<string, QuestionDictationStatus>
  >(initialDictation);
  const [showScript, setShowScript] = useState(false);
  const [dictationKey, setDictationKey] = useState(0);
  const [dictationPrefetch, setDictationPrefetch] = useState<
    Record<string, DictationStartPayloadClient | null>
  >({});
  const dictationPrefetching = useRef<Set<string>>(new Set());
  const dictationPrefetchedIds = useRef<Set<string>>(new Set());
  const objectiveAudioRef = useRef<HTMLAudioElement | null>(null);

  function pauseObjectiveAudio() {
    const el = objectiveAudioRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  }

  const q = questions[index];
  const selected = q ? answers[q.id] : undefined;
  const table = q ? normalizeTableData(q.table_data) : null;
  const blankLine = q ? continuationQuestionDisplayText(q.order_index) : null;

  const reportScheduleProgress = useCallback(
    async (
      questionId: string,
      patch: {
        objectiveCompleted: boolean;
        dictationCompleted?: boolean;
        dictationScore?: number;
      }
    ) => {
      if (!scheduleMode) return;
      await fetch("/api/listening/daily-task/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyTaskId: scheduleMode.dailyTaskId,
          questionId,
          objectiveCompleted: patch.objectiveCompleted,
          dictationCompleted: patch.dictationCompleted,
          dictationScore: patch.dictationScore,
        }),
      });
    },
    [scheduleMode]
  );

  const loadDictationStatus = useCallback(async () => {
    if (scheduleMode) return;
    const res = await fetch(`/api/listening/dictation/status?setId=${setId}`);
    const data = (await res.json()) as {
      ok?: boolean;
      questions?: Record<string, QuestionDictationStatus>;
    };
    if (data.ok && data.questions) {
      setDictationByQuestion(data.questions);
    }
  }, [setId]);

  useEffect(() => {
    void loadDictationStatus();
  }, [loadDictationStatus]);

  useEffect(() => {
    if (!scheduleMode || questions.length === 0) return;
    const firstOpen = questions.findIndex((item) => {
      const p = scheduleMode.initialProgress?.[item.id];
      if (p?.completed) return false;
      if (
        p?.objectiveCompleted &&
        (!scheduleMode.requireDictationPass || p.dictationCompleted)
      ) {
        return false;
      }
      return true;
    });
    if (firstOpen > 0) setIndex(firstOpen);
  }, [scheduleMode, questions]);

  const warmupDictation = useCallback(
    async (questionId: string) => {
      if (!dictationSettings.dictation_enabled) return;
      await fetch("/api/listening/dictation/warmup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, questionId }),
      });
    },
    [setId, dictationSettings.dictation_enabled]
  );

  const prefetchDictationStart = useCallback(
    async (questionId: string) => {
      if (!dictationSettings.dictation_enabled) return;
      if (dictationPrefetchedIds.current.has(questionId)) return;
      if (dictationPrefetching.current.has(questionId)) return;
      dictationPrefetching.current.add(questionId);

      try {
        const res = await fetch("/api/listening/dictation/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, questionId }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          attemptId?: string;
          passageLines?: DictationStartPayloadClient["passageLines"];
          blanks?: DictationStartPayloadClient["blanks"];
        };
        if (data.ok && data.attemptId && data.passageLines?.length) {
          dictationPrefetchedIds.current.add(questionId);
          setDictationPrefetch((prev) => ({
            ...prev,
            [questionId]: {
              attemptId: data.attemptId!,
              passageLines: data.passageLines!,
              blanks: data.blanks ?? [],
            },
          }));
        }
      } finally {
        dictationPrefetching.current.delete(questionId);
      }
    },
    [setId, dictationSettings.dictation_enabled]
  );

  useEffect(() => {
    if (!dictationSettings.dictation_enabled) return;
    for (const item of questions) {
      void warmupDictation(item.id);
    }
  }, [questions, dictationSettings.dictation_enabled, warmupDictation]);

  useEffect(() => {
    if (!dictationSettings.dictation_enabled) return;
    if (!q) return;
    if (!objectiveSubmitted[q.id]) {
      void warmupDictation(q.id);
      void prefetchDictationStart(q.id);
    }
    const next = questions[index + 1];
    if (next && !objectiveSubmitted[next.id]) {
      void warmupDictation(next.id);
      void prefetchDictationStart(next.id);
    }
  }, [
    q?.id,
    index,
    questions,
    dictationSettings.dictation_enabled,
    objectiveSubmitted,
    warmupDictation,
    prefetchDictationStart,
  ]);

  const dictationRequired =
    dictationSettings.dictation_enabled && questions.length > 0;

  const currentDictationPassed = q
    ? (dictationByQuestion[q.id]?.passed ?? false)
    : false;

  const objectiveDone = q ? !!objectiveSubmitted[q.id] : false;

  const isCorrect =
    objectiveDone && q && selected != null && selected === q.correct_answer;
  const isWrong =
    objectiveDone && q && selected != null && selected !== q.correct_answer;

  const canGoNext = useMemo(() => {
    if (!q || index >= questions.length - 1) return false;
    if (!objectiveDone) return false;
    if (
      dictationRequired &&
      dictationSettings.dictation_lock_next_until_pass &&
      !currentDictationPassed
    ) {
      return false;
    }
    return true;
  }, [
    q,
    index,
    questions.length,
    objectiveDone,
    dictationRequired,
    dictationSettings.dictation_lock_next_until_pass,
    currentDictationPassed,
  ]);

  function isQuestionFullyDone(questionId: string): boolean {
    if (!objectiveSubmitted[questionId]) return false;
    if (!dictationRequired) return true;
    return !!dictationByQuestion[questionId]?.passed;
  }

  function priorQuestionsBlocked(targetIndex: number): boolean {
    if (scheduleMode) {
      for (let i = 0; i < targetIndex; i++) {
        if (!isQuestionFullyDone(questions[i]!.id)) return true;
      }
      return false;
    }
    if (!dictationRequired || !dictationSettings.dictation_lock_next_until_pass) {
      return false;
    }
    for (let i = 0; i < targetIndex; i++) {
      if (!isQuestionFullyDone(questions[i]!.id)) return true;
    }
    return false;
  }

  const allComplete =
    questions.length > 0 &&
    questions.every((item) => {
      if (!objectiveSubmitted[item.id]) return false;
      if (!dictationRequired) return true;
      if (!dictationSettings.dictation_lock_next_until_pass) return true;
      return dictationByQuestion[item.id]?.passed;
    });

  const scheduleRedirectStarted = useRef(false);

  useEffect(() => {
    if (!scheduleMode || !allComplete || scheduleRedirectStarted.current) return;
    scheduleRedirectStarted.current = true;
    const timer = setTimeout(() => {
      router.push("/student/listening");
    }, 1200);
    return () => clearTimeout(timer);
  }, [allComplete, scheduleMode, router]);

  if (!q) {
    return <p className="text-slate-600">문항이 없습니다.</p>;
  }

  const displayChoices = q.choices
    .map((text, i) => ({ text: text.trim(), num: i + 1 }))
    .filter((c) => c.text);

  function selectAnswer(num: number) {
    if (objectiveDone) return;
    setAnswers((prev) => ({ ...prev, [q.id]: num }));
  }

  function submitObjective() {
    if (selected == null) return;
    pauseObjectiveAudio();
    setObjectiveSubmitted((prev) => ({ ...prev, [q.id]: true }));
    setShowScript(false);
    if (scheduleMode) {
      void reportScheduleProgress(q.id, { objectiveCompleted: true });
      if (!dictationRequired) {
        setDictationByQuestion((prev) => ({
          ...prev,
          [q.id]: { passed: true, bestScore: null, attemptCount: 1 },
        }));
      }
    }
    if (dictationRequired) {
      setDictationKey((k) => k + 1);
      void prefetchDictationStart(q.id);
    }
  }

  function handleDictationPassed(dictationScore?: number) {
    setDictationByQuestion((prev) => ({
      ...prev,
      [q.id]: {
        passed: true,
        bestScore: dictationScore ?? prev[q.id]?.bestScore ?? null,
        attemptCount: (prev[q.id]?.attemptCount ?? 0) + 1,
      },
    }));
    if (scheduleMode) {
      void reportScheduleProgress(q.id, {
        objectiveCompleted: true,
        dictationCompleted: true,
        dictationScore: dictationScore ?? scheduleMode.dictationPassScore,
      });
    } else {
      void loadDictationStatus();
    }
  }

  function goPrev() {
    if (index > 0) {
      pauseObjectiveAudio();
      setIndex(index - 1);
      setShowScript(false);
    }
  }

  function goNext() {
    if (!canGoNext) return;
    const next = index + 1;
    if (priorQuestionsBlocked(next)) return;
    pauseObjectiveAudio();
    setIndex(next);
    setShowScript(false);
  }

  function tryGoToIndex(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    if (priorQuestionsBlocked(nextIndex)) return;
    pauseObjectiveAudio();
    setIndex(nextIndex);
    setShowScript(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-600">
          {index + 1}번 / 총 {questions.length}문항
          {q.question_type ? ` · ${q.question_type}` : ""}
        </p>
      </header>

      {allComplete && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
          {scheduleMode
            ? "오늘 듣기학습을 모두 완료했습니다. 잠시 후 목록으로 이동합니다."
            : "모든 문항의 객관식·Dictation을 완료했습니다."}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{q.order_index}번</p>
        {q.instruction && (
          <p className="mt-2 text-base leading-relaxed text-slate-900">{q.instruction}</p>
        )}

        <div className="mt-4">
          {q.audio_url ? (
            <audio
              ref={objectiveAudioRef}
              key={q.audio_url}
              controls
              src={q.audio_url}
              className="w-full"
              preload="auto"
            />
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              음원이 아직 준비되지 않았습니다.
            </p>
          )}
        </div>

        {table && (
          <div className="mt-4">
            <ListeningTableDisplay table={table} />
          </div>
        )}

        {blankLine && !table && (
          <p className="mt-4 font-mono text-base text-slate-900">{blankLine}</p>
        )}

        <ul className="mt-4 space-y-2">
          {displayChoices.map(({ text, num }) => {
            const isSelected = selected === num;
            const choiceCorrect = objectiveDone && num === q.correct_answer;
            const choiceWrong = objectiveDone && isSelected && num !== q.correct_answer;
            return (
              <li key={num}>
                <button
                  type="button"
                  onClick={() => selectAnswer(num)}
                  disabled={objectiveDone}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    choiceWrong
                      ? "border-red-300 bg-red-50"
                      : choiceCorrect
                        ? "border-green-400 bg-green-50"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="mr-2 font-semibold text-slate-600">
                    {CIRCLED[num - 1] ?? `${num}.`}
                  </span>
                  {text}
                </button>
              </li>
            );
          })}
        </ul>

        {!objectiveDone && (
          <button
            type="button"
            onClick={submitObjective}
            disabled={selected == null}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            답안 제출
          </button>
        )}

        {objectiveDone && (
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p>
              <span className="font-medium text-slate-700">내 답:</span>{" "}
              {selected != null ? CIRCLED[selected - 1] ?? selected : "—"}
              {isCorrect && <span className="ml-2 text-emerald-700">정답</span>}
              {isWrong && <span className="ml-2 text-red-600">오답</span>}
            </p>
            <p>
              <span className="font-medium text-slate-700">정답:</span>{" "}
              {CIRCLED[q.correct_answer - 1] ?? q.correct_answer}
            </p>
            {q.answer_clue && !table && (
              <p className="text-emerald-800">
                <span className="font-medium">정답 근거:</span> {q.answer_clue}
              </p>
            )}
            {q.explanation && (
              <p className="text-slate-600">
                <span className="font-medium">해설:</span> {q.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {objectiveDone && dictationRequired && !currentDictationPassed && (
        <DictationSection
          key={`${q.id}-${dictationKey}`}
          setId={setId}
          questionId={q.id}
          audioUrl={q.audio_url}
          passScore={dictationSettings.dictation_pass_score}
          enabled
          onPassed={handleDictationPassed}
          prefetched={dictationPrefetch[q.id] ?? null}
        />
      )}

      {objectiveDone &&
        dictationRequired &&
        currentDictationPassed && (
          <p className="text-sm text-emerald-700">
            Dictation 통과 완료
            {dictationByQuestion[q.id]?.bestScore != null
              ? ` (최고 ${dictationByQuestion[q.id]!.bestScore}점)`
              : ""}
          </p>
        )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
        >
          이전 문제
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          title={
            !canGoNext && dictationRequired && objectiveDone && !currentDictationPassed
              ? `Dictation ${dictationSettings.dictation_pass_score}점 이상 필요`
              : undefined
          }
        >
          다음 문제
        </button>
      </div>

      {!canGoNext && objectiveDone && dictationRequired && !currentDictationPassed && (
        <p className="text-xs text-amber-700">
          Dictation에서 {dictationSettings.dictation_pass_score}점 이상 받으면 다음
          문제로 넘어갈 수 있습니다.
        </p>
      )}

      {priorQuestionsBlocked(index) && index > 0 && (
        <p className="text-xs text-red-600">
          이전 문항 Dictation을 통과한 뒤에 진행할 수 있습니다.
        </p>
      )}

      <div className="flex flex-wrap gap-1 pt-2">
        {questions.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => tryGoToIndex(i)}
            disabled={priorQuestionsBlocked(i)}
            className={`h-8 w-8 rounded text-xs font-medium ${
              i === index
                ? "bg-indigo-600 text-white"
                : dictationByQuestion[item.id]?.passed
                  ? "bg-emerald-100 text-emerald-800"
                  : objectiveSubmitted[item.id]
                    ? "bg-amber-100 text-amber-900"
                    : "bg-slate-100 text-slate-600"
            } disabled:opacity-40`}
          >
            {item.order_index}
          </button>
        ))}
      </div>
    </div>
  );
}
