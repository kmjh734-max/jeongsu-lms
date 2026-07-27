"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  saveDraftAnswersAction,
  startOrResumeAttemptAction,
  submitStepAttemptAction,
} from "@/lib/exam-prep/student-actions";
import {
  EXAM_STEP_LABELS,
  type ExamStepType,
  type ExamWorkbookQuestionPublic,
  type ExamWorkbookStep,
} from "@/lib/exam-prep/types";

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

type BlankMeta = { id: string };

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
}: {
  assignmentStudentId: string;
  steps: ExamWorkbookStep[];
  questions: ExamWorkbookQuestionPublic[];
  passageTitle: string;
  existingAttempts: AttemptSummary[];
}) {
  const router = useRouter();
  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.step_order - b.step_order),
    [steps]
  );

  const [activeStepId, setActiveStepId] = useState(sortedSteps[0]?.id ?? "");
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
      const passed =
        best != null && (best.score ?? 0) >= Number(prev.passing_score ?? 0);
      if (passed) set.add(step.id);
    }
    return set;
  }, [sortedSteps, bestByStep]);

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

      {activeStep && (
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
        {type === "verb_form" && data.baseForm ? (
          <p className="text-sm font-medium text-brand-800">
            기본형: {String(data.baseForm)}
          </p>
        ) : null}
        {type !== "korean_blank" && data.koreanHint ? (
          <p className="text-sm text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        <p className="font-mono text-sm text-slate-800">{displayText}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {blanks.map((b) => (
            <label key={b.id} className="block text-xs text-slate-600">
              {b.id}
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
          {String(data.corruptedText ?? "")}
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

  if (type === "grammar_vocab_choice") {
    const options = (
      Array.isArray(data.options) ? data.options : []
    ) as { id: string; text: string }[];
    const selected =
      typeof value === "object" &&
      value !== null &&
      "optionId" in value
        ? String((value as { optionId: unknown }).optionId ?? "")
        : typeof value === "string"
          ? value
          : "";
    return (
      <div className="space-y-2">
        {data.displayText ? (
          <p className="text-sm text-slate-700">{String(data.displayText)}</p>
        ) : null}
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={selected === opt.id}
              onChange={() => onChange({ optionId: opt.id })}
            />
            {opt.text}
          </label>
        ))}
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
