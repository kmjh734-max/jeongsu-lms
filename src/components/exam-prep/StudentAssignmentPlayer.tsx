"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  saveDraftAnswersAction,
  startOrResumeAttemptAction,
  submitStepAttemptAction,
} from "@/lib/exam-prep/student-actions";
import {
  EXAM_STEP_LABELS,
  type ExamPassage,
  type ExamPassageSentence,
  type ExamStage1Progress,
  type ExamStepType,
  type ExamWorkbookQuestionPublic,
  type ExamWorkbookStep,
} from "@/lib/exam-prep/types";
import { Stage1FamiliarizeView } from "@/components/exam-prep/Stage1FamiliarizeView";
import { Stage2KoreanBlankView } from "@/components/exam-prep/Stage2KoreanBlankView";
import { Stage3EnglishBlankView } from "@/components/exam-prep/Stage3EnglishBlankView";
import { Stage4TranslationView } from "@/components/exam-prep/Stage4TranslationView";
import { Stage5VerbFormView } from "@/components/exam-prep/Stage5VerbFormView";
import { Stage6ChoiceView } from "@/components/exam-prep/Stage6ChoiceView";
import { Stage7ErrorView } from "@/components/exam-prep/Stage7ErrorView";
import { Stage8ReorderView } from "@/components/exam-prep/Stage8ReorderView";
import { Stage9ParagraphView } from "@/components/exam-prep/Stage9ParagraphView";
import { Stage10WritingView } from "@/components/exam-prep/Stage10WritingView";

type AttemptSummary = {
  step_id: string;
  status: string;
  score: number | null;
  attempt_number: number;
};

type SubmitResultItem = {
  questionId: string;
  isCorrect: boolean | null;
  score: number;
  gradingStatus: string;
  showAnswer: boolean;
  correctAnswer?: unknown;
  explanation?: string | null;
};

type BlankMeta = { id: string; baseForm?: string };

/** 지문의 <u>밑줄</u>만 렌더 */
function renderPassageMarks(text: string): ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={`t${key++}`}>{text.slice(last, m.index)}</span>);
    }
    nodes.push(
      <u key={`u${key++}`} className="underline decoration-slate-700">
        {m[1]}
      </u>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`t${key++}`}>{text.slice(last)}</span>);
  }
  return nodes.length > 0 ? nodes : [text];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function StudentAssignmentPlayer({
  assignmentStudentId,
  steps,
  questions,
  passageTitle,
  existingAttempts,
  passage = null,
  sentences = [],
  stage1Progress = null,
  stage2Published = false,
  stage3Published = false,
  stage4Published = false,
  stage5Published = false,
  stage6Published = false,
  stage7Published = false,
  stage8Published = false,
  stage9Published = false,
  stage10Published = false,
  stage2Completed = false,
  stage3Completed = false,
  stage4Completed = false,
  stage5Completed = false,
  stage6Completed = false,
  stage7Completed = false,
  stage8Completed = false,
  stage9Completed = false,
}: {
  assignmentStudentId: string;
  steps: ExamWorkbookStep[];
  questions: ExamWorkbookQuestionPublic[];
  passageTitle: string;
  existingAttempts: AttemptSummary[];
  passage?: Pick<
    ExamPassage,
    | "id"
    | "title"
    | "school_level"
    | "grade"
    | "source"
    | "exam_name"
    | "passage_number"
  > | null;
  sentences?: ExamPassageSentence[];
  stage1Progress?: ExamStage1Progress | null;
  stage2Published?: boolean;
  stage3Published?: boolean;
  stage4Published?: boolean;
  stage5Published?: boolean;
  stage6Published?: boolean;
  stage7Published?: boolean;
  stage8Published?: boolean;
  stage9Published?: boolean;
  stage10Published?: boolean;
  stage2Completed?: boolean;
  stage3Completed?: boolean;
  stage4Completed?: boolean;
  stage5Completed?: boolean;
  stage6Completed?: boolean;
  stage7Completed?: boolean;
  stage8Completed?: boolean;
  stage9Completed?: boolean;
}) {
  const router = useRouter();
  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.step_order - b.step_order),
    [steps]
  );

  const [activeStepId, setActiveStepId] = useState(sortedSteps[0]?.id ?? "");
  const [stage1DoneLocal, setStage1DoneLocal] = useState(
    Boolean(stage1Progress?.completed_at)
  );
  const [stage2DoneLocal, setStage2DoneLocal] = useState(stage2Completed);
  const [stage3DoneLocal, setStage3DoneLocal] = useState(stage3Completed);
  const [stage4DoneLocal, setStage4DoneLocal] = useState(stage4Completed);
  const [stage5DoneLocal, setStage5DoneLocal] = useState(stage5Completed);
  const [stage6DoneLocal, setStage6DoneLocal] = useState(stage6Completed);
  const [stage7DoneLocal, setStage7DoneLocal] = useState(stage7Completed);
  const [stage8DoneLocal, setStage8DoneLocal] = useState(stage8Completed);
  const [stage9DoneLocal, setStage9DoneLocal] = useState(stage9Completed);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SubmitResultItem[] | null>(null);
  const [lastScore, setLastScore] = useState<{
    percent: number;
    passed: boolean;
    earned: number;
    maxPoints: number;
    correctCount: number;
    totalCount: number;
    needsReview: number;
  } | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStep = sortedSteps.find((s) => s.id === activeStepId);
  const stepQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.step_id === activeStepId && q.is_active)
        .sort((a, b) => a.question_order - b.question_order),
    [questions, activeStepId]
  );

  const bestByStep = useMemo(() => {
    const map = new Map<string, AttemptSummary>();
    for (const a of existingAttempts) {
      if (a.status !== "submitted") continue;
      const prev = map.get(a.step_id);
      if (!prev || (a.score ?? 0) > (prev.score ?? 0)) {
        map.set(a.step_id, a);
      }
    }
    return map;
  }, [existingAttempts]);

  const unlockedStepIds = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i]!;
      if (i === 0 || !step.sequential_unlock) {
        set.add(step.id);
        continue;
      }
      const prev = sortedSteps[i - 1]!;
      const best = bestByStep.get(prev.id);
      const passedByAttempt =
        best != null && (best.score ?? 0) >= Number(prev.passing_score ?? 0);
      const passedByStage1 =
        prev.step_type === "comprehension" &&
        (Boolean(stage1Progress?.completed_at) || stage1DoneLocal);
      const passedByStage2 =
        prev.step_type === "korean_blank" && stage2DoneLocal;
      const passedByStage3 =
        prev.step_type === "english_blank" && stage3DoneLocal;
      const passedByStage4 =
        prev.step_type === "translation_practice" && stage4DoneLocal;
      const passedByStage5 =
        prev.step_type === "verb_form" && stage5DoneLocal;
      const passedByStage6 =
        prev.step_type === "grammar_vocab_choice" && stage6DoneLocal;
      const passedByStage7 =
        prev.step_type === "error_correction" && stage7DoneLocal;
      const passedByStage8 =
        prev.step_type === "sentence_order" && stage8DoneLocal;
      const passedByStage9 =
        prev.step_type === "paragraph_order" && stage9DoneLocal;
      if (
        passedByAttempt ||
        passedByStage1 ||
        passedByStage2 ||
        passedByStage3 ||
        passedByStage4 ||
        passedByStage5 ||
        passedByStage6 ||
        passedByStage7 ||
        passedByStage8 ||
        passedByStage9
      )
        set.add(step.id);
    }
    return set;
  }, [
    sortedSteps,
    bestByStep,
    stage1Progress?.completed_at,
    stage1DoneLocal,
    stage2DoneLocal,
    stage3DoneLocal,
    stage4DoneLocal,
    stage5DoneLocal,
    stage6DoneLocal,
    stage7DoneLocal,
    stage8DoneLocal,
    stage9DoneLocal,
  ]);

  const scheduleDraft = useCallback(
    (nextAnswers: Record<string, unknown>, nextAttemptId: string | null) => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        void saveDraftAnswersAction({
          assignment_student_id: assignmentStudentId,
          step_id: activeStepId,
          attempt_id: nextAttemptId ?? undefined,
          draft_answers: nextAnswers,
        });
      }, 800);
    },
    [assignmentStudentId, activeStepId]
  );

  useEffect(() => {
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, []);

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      scheduleDraft(next, attemptId);
      return next;
    });
  }

  async function startStep(stepId: string) {
    setStarting(true);
    setMessage(null);
    setResults(null);
    setLastScore(null);
    const result = await startOrResumeAttemptAction(assignmentStudentId, stepId);
    setStarting(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    const attempt = result.attempt as {
      id: string;
      draft_answers?: Record<string, unknown> | null;
    };
    setAttemptId(attempt.id);
    setActiveStepId(stepId);
    setAnswers(
      (attempt.draft_answers && typeof attempt.draft_answers === "object"
        ? attempt.draft_answers
        : {}) as Record<string, unknown>
    );
  }

  async function submit() {
    if (!attemptId || !activeStepId) return;
    setSubmitting(true);
    setMessage(null);
    const result = await submitStepAttemptAction({
      assignment_student_id: assignmentStudentId,
      step_id: activeStepId,
      attempt_id: attemptId,
      answers,
    });
    setSubmitting(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setResults(result.results);
    const earned = result.results.reduce(
      (sum, r) => sum + (Number(r.score) || 0),
      0
    );
    const maxPoints = stepQuestions.reduce(
      (sum, q) => sum + (Number(q.points) || 0),
      0
    );
    const needsReview = result.results.filter(
      (r) => r.gradingStatus === "needs_review"
    ).length;
    setLastScore({
      percent: result.percent,
      passed: result.passed,
      earned,
      maxPoints,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      needsReview,
    });
    setAttemptId(null);
    router.refresh();
  }

  function stepTitle(step: ExamWorkbookStep) {
    const key = step.step_type as ExamStepType;
    return step.title || EXAM_STEP_LABELS[key] || step.step_type;
  }

  return (
    <div className="space-y-4">
      <div className="ui-section-card">
        <h2 className="text-lg font-semibold text-slate-900">{passageTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          앞 단계를 통과해야 다음 단계가 열립니다. 제출 후 부분 점수와 검토
          상태를 확인하세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedSteps.map((step) => {
          const best = bestByStep.get(step.id);
          const active = step.id === activeStepId;
          const unlocked = unlockedStepIds.has(step.id);
          const passed =
            best != null &&
            (best.score ?? 0) >= Number(step.passing_score ?? 0);
          return (
            <button
              key={step.id}
              type="button"
              disabled={!unlocked}
              title={
                unlocked
                  ? undefined
                  : "이전 단계를 통과해야 열립니다."
              }
              onClick={() => {
                if (!unlocked) return;
                setActiveStepId(step.id);
                setAttemptId(null);
                setResults(null);
                setLastScore(null);
                setAnswers({});
                setMessage(null);
              }}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                !unlocked
                  ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                  : active
                    ? "border-brand-500 bg-brand-50 text-brand-900"
                    : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span className="font-medium">
                {!unlocked ? "잠김 · " : passed ? "통과 · " : ""}
                {step.step_order}. {stepTitle(step)}
              </span>
              {best && (
                <span className="mt-0.5 block text-xs text-slate-500">
                  최고 {best.score ?? 0}점 / 통과 {step.passing_score}점
                </span>
              )}
              {!unlocked && (
                <span className="mt-0.5 block text-xs text-slate-400">
                  이전 단계 통과 필요
                </span>
              )}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="text-sm text-red-600" role="status">
          {message}
        </p>
      )}

      {activeStep &&
        activeStep.step_type === "comprehension" &&
        passage &&
        unlockedStepIds.has(activeStep.id) && (
          <Stage1FamiliarizeView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            passage={passage}
            sentences={sentences}
            initialProgress={stage1Progress}
            totalSteps={Math.max(sortedSteps.length, 10)}
            canStartStage2={stage2Published}
            onStage1Completed={() => setStage1DoneLocal(true)}
            onStartStage2={() => {
              setStage1DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "korean_blank"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "korean_blank" &&
        unlockedStepIds.has(activeStep.id) &&
        stage2Published && (
          <Stage2KoreanBlankView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage3={stage3Published}
            onStage2Completed={() => setStage2DoneLocal(true)}
            onStartStage3={() => {
              setStage2DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "english_blank"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage1={() => {
              const first = sortedSteps.find(
                (s) => s.step_type === "comprehension"
              );
              if (first) {
                setActiveStepId(first.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "english_blank" &&
        unlockedStepIds.has(activeStep.id) &&
        stage3Published && (
          <Stage3EnglishBlankView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage4={stage4Published}
            onStage3Completed={() => setStage3DoneLocal(true)}
            onStartStage4={() => {
              setStage3DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "translation_practice"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage2={() => {
              const s2 = sortedSteps.find((s) => s.step_type === "korean_blank");
              if (s2) {
                setActiveStepId(s2.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "translation_practice" &&
        unlockedStepIds.has(activeStep.id) &&
        stage4Published && (
          <Stage4TranslationView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage5={stage5Published}
            onStage4Completed={() => setStage4DoneLocal(true)}
            onStartStage5={() => {
              setStage4DoneLocal(true);
              const next = sortedSteps.find((s) => s.step_type === "verb_form");
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage3={() => {
              const s3 = sortedSteps.find((s) => s.step_type === "english_blank");
              if (s3) {
                setActiveStepId(s3.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "verb_form" &&
        unlockedStepIds.has(activeStep.id) &&
        stage5Published && (
          <Stage5VerbFormView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage6={stage6Published}
            onStage5Completed={() => setStage5DoneLocal(true)}
            onStartStage6={() => {
              setStage5DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "grammar_vocab_choice"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage4={() => {
              const s4 = sortedSteps.find(
                (s) => s.step_type === "translation_practice"
              );
              if (s4) {
                setActiveStepId(s4.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "grammar_vocab_choice" &&
        unlockedStepIds.has(activeStep.id) &&
        stage6Published && (
          <Stage6ChoiceView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage7={stage7Published}
            onStage6Completed={() => setStage6DoneLocal(true)}
            onStartStage7={() => {
              setStage6DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "error_correction"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage5={() => {
              const s5 = sortedSteps.find((s) => s.step_type === "verb_form");
              if (s5) {
                setActiveStepId(s5.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "error_correction" &&
        unlockedStepIds.has(activeStep.id) &&
        stage7Published && (
          <Stage7ErrorView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage8={stage8Published}
            onStage7Completed={() => setStage7DoneLocal(true)}
            onStartStage8={() => {
              setStage7DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "sentence_order"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage6={() => {
              const s6 = sortedSteps.find(
                (s) => s.step_type === "grammar_vocab_choice"
              );
              if (s6) {
                setActiveStepId(s6.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "sentence_order" &&
        unlockedStepIds.has(activeStep.id) &&
        stage8Published && (
          <Stage8ReorderView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage9={stage9Published}
            onStage8Completed={() => setStage8DoneLocal(true)}
            onStartStage9={() => {
              setStage8DoneLocal(true);
              const next = sortedSteps.find(
                (s) => s.step_type === "paragraph_order"
              );
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage7={() => {
              const s7 = sortedSteps.find(
                (s) => s.step_type === "error_correction"
              );
              if (s7) {
                setActiveStepId(s7.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "paragraph_order" &&
        unlockedStepIds.has(activeStep.id) &&
        stage9Published && (
          <Stage9ParagraphView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            canStartStage10={stage10Published}
            onStage9Completed={() => setStage9DoneLocal(true)}
            onStartStage10={() => {
              setStage9DoneLocal(true);
              const next = sortedSteps.find((s) => s.step_type === "writing");
              if (next) {
                setActiveStepId(next.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
            onGoStage8={() => {
              const s8 = sortedSteps.find(
                (s) => s.step_type === "sentence_order"
              );
              if (s8) {
                setActiveStepId(s8.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        activeStep.step_type === "writing" &&
        unlockedStepIds.has(activeStep.id) &&
        stage10Published && (
          <Stage10WritingView
            assignmentStudentId={assignmentStudentId}
            stepId={activeStep.id}
            onGoStage9={() => {
              const s9 = sortedSteps.find(
                (s) => s.step_type === "paragraph_order"
              );
              if (s9) {
                setActiveStepId(s9.id);
                setAttemptId(null);
                setAnswers({});
                setResults(null);
                setLastScore(null);
                setMessage(null);
              }
            }}
          />
        )}

      {activeStep &&
        !(
          activeStep.step_type === "comprehension" &&
          passage &&
          unlockedStepIds.has(activeStep.id)
        ) &&
        !(
          activeStep.step_type === "korean_blank" &&
          unlockedStepIds.has(activeStep.id) &&
          stage2Published
        ) &&
        !(
          activeStep.step_type === "english_blank" &&
          unlockedStepIds.has(activeStep.id) &&
          stage3Published
        ) &&
        !(
          activeStep.step_type === "translation_practice" &&
          unlockedStepIds.has(activeStep.id) &&
          stage4Published
        ) &&
        !(
          activeStep.step_type === "verb_form" &&
          unlockedStepIds.has(activeStep.id) &&
          stage5Published
        ) &&
        !(
          activeStep.step_type === "grammar_vocab_choice" &&
          unlockedStepIds.has(activeStep.id) &&
          stage6Published
        ) &&
        !(
          activeStep.step_type === "error_correction" &&
          unlockedStepIds.has(activeStep.id) &&
          stage7Published
        ) &&
        !(
          activeStep.step_type === "sentence_order" &&
          unlockedStepIds.has(activeStep.id) &&
          stage8Published
        ) &&
        !(
          activeStep.step_type === "paragraph_order" &&
          unlockedStepIds.has(activeStep.id) &&
          stage9Published
        ) &&
        !(
          activeStep.step_type === "writing" &&
          unlockedStepIds.has(activeStep.id) &&
          stage10Published
        ) && (
        <div className="ui-section-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">
                {stepTitle(activeStep)}
              </h3>
              <p className="text-xs text-slate-500">
                통과 점수 {activeStep.passing_score}점 · 최대{" "}
                {activeStep.max_attempts}회
              </p>
            </div>
            {!attemptId && !results && unlockedStepIds.has(activeStep.id) && (
              <Button
                type="button"
                disabled={starting}
                onClick={() => startStep(activeStep.id)}
              >
                {starting ? "시작 중..." : "학습 시작"}
              </Button>
            )}
          </div>

          {lastScore && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                lastScore.passed
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <p>
                환산 {lastScore.percent}점
                {lastScore.maxPoints > 0
                  ? ` (획득 ${lastScore.earned}/${lastScore.maxPoints}점)`
                  : ""}{" "}
                · 정답 {lastScore.correctCount}/{lastScore.totalCount} —{" "}
                {lastScore.passed
                  ? "통과했습니다. 다음 단계로 진행할 수 있습니다."
                  : `재도전이 필요합니다. (통과 ${activeStep.passing_score}점)`}
              </p>
              {lastScore.needsReview > 0 ? (
                <p className="mt-1 text-xs">
                  {lastScore.needsReview}문항은 강사·AI 검토 대기 중입니다.
                  검토 전 점수는 잠정값일 수 있습니다.
                </p>
              ) : null}
            </div>
          )}

          {!unlockedStepIds.has(activeStep.id) && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              이 단계는 잠겨 있습니다. 이전 단계를 통과 점수 이상으로 제출해
              주세요.
            </p>
          )}

          {attemptId && unlockedStepIds.has(activeStep.id) && (
            <>
              <ul className="space-y-4">
                {stepQuestions.map((q, idx) => (
                  <li
                    key={q.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="mb-2 text-sm font-medium text-slate-800">
                      {idx + 1}. {q.question_text}
                    </p>
                    <QuestionInput
                      question={q}
                      value={answers[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                      result={results?.find((r) => r.questionId === q.id)}
                    />
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled={submitting || stepQuestions.length === 0}
                onClick={submit}
              >
                {submitting ? "제출 중..." : "제출하기"}
              </Button>
            </>
          )}

          {!attemptId && results && (
            <ul className="space-y-3">
              {stepQuestions.map((q, idx) => {
                const r = results.find((x) => x.questionId === q.id);
                return (
                  <li
                    key={q.id}
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  >
                    <p className="font-medium text-slate-800">
                      {idx + 1}. {q.question_text}
                    </p>
                    {r && (
                      <p
                        className={`mt-1 text-xs ${
                          r.gradingStatus === "needs_review"
                            ? "text-amber-700"
                            : r.isCorrect === true
                              ? "text-green-700"
                              : r.isCorrect === false
                                ? "text-red-600"
                                : "text-slate-600"
                        }`}
                      >
                        {r.gradingStatus === "needs_review"
                          ? "강사·AI 검토 대기"
                          : r.isCorrect === true
                            ? "정답"
                            : r.isCorrect === false
                              ? "오답"
                              : "채점 중"}{" "}
                        · {r.score}/{q.points ?? 0}점
                      </p>
                    )}
                    {r?.showAnswer && r.correctAnswer !== undefined && (
                      <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                        {JSON.stringify(r.correctAnswer, null, 2)}
                      </pre>
                    )}
                    {r?.showAnswer && r.explanation && (
                      <p className="mt-1 text-xs text-slate-500">
                        {r.explanation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  result,
}: {
  question: ExamWorkbookQuestionPublic;
  value: unknown;
  onChange: (v: unknown) => void;
  result?: SubmitResultItem;
}) {
  const data = question.question_data ?? {};
  const type = question.question_type;

  if (type === "comprehension") {
    const confirmed =
      typeof value === "object" &&
      value !== null &&
      "confirmed" in value
        ? Boolean((value as { confirmed: unknown }).confirmed)
        : false;
    return (
      <div className="space-y-3">
        {"english" in data && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
            {String(data.english ?? "")}
          </p>
        )}
        {"korean" in data && data.korean != null && data.korean !== "" ? (
          <p className="text-sm text-slate-600">{String(data.korean)}</p>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onChange({ confirmed: e.target.checked })}
          />
          이해했습니다
        </label>
        <ResultHint result={result} />
      </div>
    );
  }

  if (type === "english_blank" || type === "korean_blank" || type === "verb_form") {
    const displayText = String(data.displayText ?? "");
    const blanks = (Array.isArray(data.blanks) ? data.blanks : []) as BlankMeta[];
    const blankAnswers =
      typeof value === "object" &&
      value !== null &&
      "blanks" in value
        ? ((value as { blanks: Record<string, string> }).blanks ?? {})
        : {};
    return (
      <div className="space-y-3">
        {type === "korean_blank" && data.englishHint ? (
          <p className="rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-800">
            {String(data.englishHint)}
          </p>
        ) : null}
        {type === "verb_form" && (data.baseForm || Array.isArray(data.baseForms)) ? (
          <p className="text-sm font-medium text-brand-800">
            기본형:{" "}
            {data.baseForm
              ? String(data.baseForm)
              : (data.baseForms as string[]).map((b) => `(${b})`).join(" ")}
          </p>
        ) : null}
        {type !== "korean_blank" && data.koreanHint ? (
          <p className="text-sm text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        <p className="font-mono text-sm text-slate-800">{displayText}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {blanks.map((b) => (
            <label key={b.id} className="block text-xs text-slate-600">
              {b.baseForm ? `(${b.baseForm})` : b.id}
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={blankAnswers[b.id] ?? ""}
                onChange={(e) =>
                  onChange({
                    blanks: { ...blankAnswers, [b.id]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>
        <ResultHint result={result} />
      </div>
    );
  }

  if (type === "translation_practice") {
    const text =
      typeof value === "object" &&
      value !== null &&
      "text" in value
        ? String((value as { text: unknown }).text ?? "")
        : typeof value === "string"
          ? value
          : "";
    return (
      <div className="space-y-2">
        {data.english ? (
          <p className="rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-800">
            {String(data.english)}
          </p>
        ) : null}
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="우리말 해석을 입력하세요"
        />
        <ResultHint result={result} />
      </div>
    );
  }

  if (type === "error_correction") {
    const text =
      typeof value === "object" &&
      value !== null &&
      "text" in value
        ? String((value as { text: unknown }).text ?? "")
        : typeof value === "string"
          ? value
          : "";
    return (
      <div className="space-y-2">
        {data.koreanHint ? (
          <p className="text-sm text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 font-mono text-sm text-slate-800">
          {renderPassageMarks(String(data.corruptedText ?? ""))}
        </p>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="올바른 영어 문장으로 고쳐 쓰세요"
        />
        <ResultHint result={result} />
      </div>
    );
  }

  if (type === "grammar_vocab_choice" || type === "csat_mcq") {
    const isCsat = type === "csat_mcq";
    const isInlineAb =
      !isCsat &&
      (String(data.format ?? "") === "inline_ab" ||
        Array.isArray(data.choiceBlanks));

    if (isInlineAb) {
      type AbBlank = {
        id: string;
        options: { id: string; text: string }[];
      };
      const blanks = (
        Array.isArray(data.choiceBlanks) ? data.choiceBlanks : []
      ) as AbBlank[];
      const selections =
        typeof value === "object" &&
        value !== null &&
        "selections" in value
          ? ((value as { selections: Record<string, string> }).selections ?? {})
          : {};
      return (
        <div className="space-y-3">
          {data.koreanHint ? (
            <p className="text-sm text-slate-600">{String(data.koreanHint)}</p>
          ) : null}
          <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 font-serif text-sm leading-relaxed text-slate-900">
            {String(data.displayText ?? "")}
          </p>
          <div className="space-y-3">
            {blanks.map((b, idx) => (
              <div key={b.id} className="space-y-1">
                <p className="text-xs font-medium text-slate-500">
                  ({idx + 1}) [{b.options.map((o) => o.text).join(" / ")}]
                </p>
                <div className="flex flex-wrap gap-2">
                  {b.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        selections[b.id] === opt.id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}-${b.id}`}
                        className="sr-only"
                        checked={selections[b.id] === opt.id}
                        onChange={() =>
                          onChange({
                            selections: { ...selections, [b.id]: opt.id },
                          })
                        }
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ResultHint result={result} />
        </div>
      );
    }

    const options = (
      isCsat
        ? Array.isArray(data.choices)
          ? (data.choices as { id?: string; number?: number; text: string }[]).map(
              (c) => ({
                id: String(c.id ?? c.number ?? ""),
                text: c.text,
                number: c.number,
              })
            )
          : []
        : ((Array.isArray(data.options) ? data.options : []) as {
            id: string;
            text: string;
          }[])
    ) as { id: string; text: string; number?: number }[];
    const selected =
      typeof value === "object" &&
      value !== null &&
      "optionId" in value
        ? String((value as { optionId: unknown }).optionId ?? "")
        : typeof value === "string"
          ? value
          : "";
    const passageHtml = String(
      data.passageModified ?? data.passageOriginal ?? data.displayText ?? ""
    );
    const CIRCLED = ["①", "②", "③", "④", "⑤"];
    return (
      <div className="space-y-3">
        {isCsat && (
          <p className="text-sm font-semibold text-violet-800">
            {String(data.instruction ?? question.question_text)}
          </p>
        )}
        {passageHtml ? (
          isCsat ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
              {renderPassageMarks(passageHtml)}
            </div>
          ) : (
            <p className="text-sm text-slate-700">{passageHtml}</p>
          )
        ) : null}
        <div className={`space-y-2 ${isCsat && options.every((o) => o.text.length < 12) ? "flex flex-wrap gap-3 space-y-0" : ""}`}>
          {options.map((opt, idx) => (
            <label
              key={opt.id}
              className="flex items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                className="mt-0.5"
                checked={selected === opt.id}
                onChange={() => onChange({ optionId: opt.id })}
              />
              <span>
                {CIRCLED[(opt.number ?? idx + 1) - 1] ?? `${idx + 1}.`}{" "}
                {opt.text}
              </span>
            </label>
          ))}
        </div>
        <ResultHint result={result} />
      </div>
    );
  }

  if (type === "sentence_order" || type === "paragraph_order") {
    return (
      <SentenceOrderInput
        questionId={question.id}
        items={(Array.isArray(data.items) ? data.items : []) as {
          id: string;
          text: string;
        }[]}
        koreanHint={
          data.koreanHint ? String(data.koreanHint) : null
        }
        value={
          typeof value === "object" &&
          value !== null &&
          "order" in value
            ? ((value as { order: string[] }).order ?? [])
            : []
        }
        onChange={(order) => onChange({ order })}
        result={result}
      />
    );
  }

  if (type === "writing") {
    const text =
      typeof value === "object" &&
      value !== null &&
      "text" in value
        ? String((value as { text: unknown }).text ?? "")
        : typeof value === "string"
          ? value
          : "";
    const cues = Array.isArray(data.cueWords)
      ? (data.cueWords as string[])
      : [];
    return (
      <div className="space-y-2">
        {data.koreanPrompt ? (
          <p className="text-sm text-slate-700">{String(data.koreanPrompt)}</p>
        ) : null}
        {cues.length > 0 && (
          <p className="text-xs text-slate-500">
            제시어: {cues.join(" · ")}
          </p>
        )}
        <textarea
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="영어 문장을 입력하세요"
        />
        <ResultHint result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        rows={3}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <ResultHint result={result} />
    </div>
  );
}

function ResultHint({ result }: { result?: SubmitResultItem }) {
  if (!result) return null;
  const review = result.gradingStatus === "needs_review";
  return (
    <p
      className={`text-xs ${
        review
          ? "text-amber-700"
          : result.isCorrect === true
            ? "text-green-700"
            : result.isCorrect === false
              ? "text-red-600"
              : "text-slate-500"
      }`}
    >
      {review
        ? "강사·AI 검토 대기"
        : result.isCorrect === true
          ? "정답"
          : result.isCorrect === false
            ? "오답"
            : result.gradingStatus}{" "}
      · {result.score}점
    </p>
  );
}

function SentenceOrderInput({
  questionId,
  items,
  koreanHint,
  value,
  onChange,
  result,
}: {
  questionId: string;
  items: { id: string; text: string }[];
  koreanHint: string | null;
  value: string[];
  onChange: (order: string[]) => void;
  result?: SubmitResultItem;
}) {
  const [pool, setPool] = useState(() => shuffle(items.map((i) => i.id)));
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const itemMap = useMemo(() => {
    const m = new Map(items.map((i) => [i.id, i.text]));
    return m;
  }, [items]);

  // reset pool when question changes
  useEffect(() => {
    setPool(shuffle(items.map((i) => i.id)));
  }, [questionId, items]);

  const remaining = pool.filter((id) => !value.includes(id));

  function addItem(id: string) {
    if (value.includes(id)) return;
    onChange([...value, id]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function onDrop(targetIndex: number) {
    if (dragFrom === null || dragFrom === targetIndex) {
      setDragFrom(null);
      return;
    }
    const next = [...value];
    const [moved] = next.splice(dragFrom, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragFrom(null);
  }

  return (
    <div className="space-y-3">
      {koreanHint && <p className="text-sm text-slate-600">{koreanHint}</p>}
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">조각 선택</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => addItem(id)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
            >
              {itemMap.get(id) ?? id}
            </button>
          ))}
          {remaining.length === 0 && (
            <span className="text-xs text-slate-400">모두 배치됨</span>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">
          배열 (클릭으로 제거 · 드래그로 순서 변경)
        </p>
        <ol className="space-y-1">
          {value.map((id, index) => (
            <li
              key={`${id}-${index}`}
              draggable
              onDragStart={() => setDragFrom(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              onClick={() => removeAt(index)}
              className="cursor-grab rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900"
            >
              {index + 1}. {itemMap.get(id) ?? id}
            </li>
          ))}
        </ol>
      </div>
      <ResultHint result={result} />
    </div>
  );
}
