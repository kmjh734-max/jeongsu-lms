"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage9Action,
  gradeStage9Action,
  loadStage9StudentDataAction,
  requestStage9HintAction,
  requestStage9RevealAction,
  saveStage9DraftAction,
} from "@/lib/exam-prep/stage9-actions";
import {
  STAGE9_DEFAULT_THRESHOLDS,
  type ExamStage9ProblemPublic,
  type ExamStage9Progress,
  type Stage9AnswerState,
} from "@/lib/exam-prep/stage9-types";

export function Stage9ParagraphView({
  assignmentStudentId,
  stepId,
  onGoStage8,
  canStartStage10 = false,
  onStartStage10,
  onStage9Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage8?: () => void;
  canStartStage10?: boolean;
  onStartStage10?: () => void;
  onStage9Completed?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [passage, setPassage] = useState<{
    id: string;
    title: string;
    school_level?: string | null;
    grade?: string | null;
    source?: string | null;
    exam_name?: string | null;
    passage_number?: string | null;
  } | null>(null);
  const [problem, setProblem] = useState<ExamStage9ProblemPublic | null>(null);
  const [answer, setAnswer] = useState<Stage9AnswerState>({
    orderedBlockIds: [],
    selectedLabels: [],
    attempts: 0,
    isCorrect: null,
    hintUsed: false,
    answerRevealed: false,
  });
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealLabels, setRevealLabels] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyProgress = useCallback((progress: ExamStage9Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision ?? 0);
    setStageDone(Boolean(progress.completed_at));
    setAnswer(progress.answers);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    const result = await loadStage9StudentDataAction({ assignmentStudentId });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      setErrorCode("code" in result ? (result.code as string) : null);
      if ("passage" in result && result.passage) setPassage(result.passage);
      return;
    }
    setPassage(result.passage);
    setProblem(result.problem);
    applyProgress(result.progress);
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const blockById = useMemo(() => {
    const m = new Map(problem?.blocks.map((b) => [b.id, b]) ?? []);
    return m;
  }, [problem]);

  const labelToId = useMemo(() => {
    const m = new Map(problem?.blocks.map((b) => [b.displayLabel, b.id]) ?? []);
    return m;
  }, [problem]);

  const usedLabels = new Set(answer.selectedLabels);
  const locked = stageDone || answer.isCorrect === true;
  const canComplete = answer.isCorrect === true;

  function scheduleSave(next: Stage9AnswerState) {
    if (!passage || !problem || stageDone) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void saveStage9DraftAction({
        assignmentStudentId,
        passageId: passage.id,
        orderedBlockIds: next.orderedBlockIds,
        selectedLabels: next.selectedLabels,
        expectedRevision: revision,
        contentVersion: problem.contentVersion,
      }).then((res) => {
        if (res.ok) applyProgress(res.progress);
      });
    }, 400);
  }

  function setOrder(orderedBlockIds: string[]) {
    if (locked || !problem) return;
    const selectedLabels = orderedBlockIds.map(
      (id) => blockById.get(id)?.displayLabel ?? "?"
    );
    const next: Stage9AnswerState = {
      ...answer,
      orderedBlockIds,
      selectedLabels,
      isCorrect: null,
    };
    setAnswer(next);
    setFeedback(null);
    scheduleSave(next);
  }

  function addLabel(label: string) {
    if (locked || usedLabels.has(label)) return;
    const id = labelToId.get(label);
    if (!id) return;
    if (answer.orderedBlockIds.includes(id)) return;
    if (answer.orderedBlockIds.length >= (problem?.blocks.length ?? 0)) return;
    setOrder([...answer.orderedBlockIds, id]);
  }

  function removeAt(index: number) {
    if (locked) return;
    setOrder(answer.orderedBlockIds.filter((_, i) => i !== index));
  }

  function move(index: number, to: number) {
    if (locked || to < 0 || to >= answer.orderedBlockIds.length) return;
    const next = [...answer.orderedBlockIds];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setOrder(next);
  }

  function reset() {
    if (locked) return;
    if (!window.confirm("현재 선택한 문단 순서를 초기화하시겠습니까?")) return;
    const next: Stage9AnswerState = {
      ...answer,
      orderedBlockIds: [],
      selectedLabels: [],
      isCorrect: null,
    };
    setAnswer(next);
    scheduleSave(next);
  }

  async function grade() {
    if (!passage || !problem) return;
    setBusy(true);
    setMessage(null);
    const result = await gradeStage9Action({
      assignmentStudentId,
      passageId: passage.id,
      orderedBlockIds: answer.orderedBlockIds,
      contentVersion: problem.contentVersion,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      if ("progress" in result && result.progress) applyProgress(result.progress);
      return;
    }
    applyProgress(result.progress);
    setFeedback(result.feedback);
    setMessage(
      result.isCorrect
        ? `정답입니다 · ${result.score}점`
        : `오답입니다 · 문단의 흐름을 다시 확인해 보세요.`
    );
  }

  async function handleComplete() {
    if (!passage) return;
    setBusy(true);
    const result = await completeStage9Action({
      assignmentStudentId,
      passageId: passage.id,
      stepId,
    });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) {
      setStageDone(true);
      onStage9Completed?.();
    }
  }

  async function hint() {
    setBusy(true);
    const result = await requestStage9HintAction({ assignmentStudentId });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setFeedback(result.hint);
  }

  async function reveal() {
    setBusy(true);
    const result = await requestStage9RevealAction({ assignmentStudentId });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setRevealLabels(result.labels);
    setMessage("정답 순서를 확인했습니다. 직접 다시 배열한 뒤 채점하세요.");
  }

  if (loading) {
    return <p className="text-sm text-slate-500">9단계를 불러오는 중…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">{error}</p>
        {errorCode === "stage8_required" && (
          <Button type="button" onClick={onGoStage8}>
            8단계로 이동
          </Button>
        )}
        <Button type="button" onClick={() => void reload()}>
          다시 시도
        </Button>
        <Link href="/student/exam-prep" className="block text-brand-700">
          목록으로
        </Link>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium text-slate-500">내신대비학습</p>
        <h2 className="text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {[passage?.school_level, passage?.grade, passage?.source]
            .filter(Boolean)
            .join(" · ")}
          {passage?.passage_number ? ` · ${passage.passage_number}` : ""}
        </p>
        <p className="mt-2 text-sm font-medium text-brand-800">
          현재 단계: 9단계 · 문단 배열하기 · 9 / 10
        </p>
        <p className="mt-1 text-sm text-slate-700">
          다음 문단을 글의 흐름에 맞게 배열해 보세요.
        </p>
      </header>

      {problem.fixedPrefix.trim() && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-1 text-xs font-medium text-slate-500">고정 도입부</p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">
            {problem.fixedPrefix}
          </p>
        </section>
      )}

      <section className="space-y-3">
        {problem.blocks.map((b) => (
          <article
            key={b.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="mb-2 text-sm font-semibold text-slate-900">
              ({b.displayLabel})
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {b.blockText}
            </p>
          </article>
        ))}
      </section>

      {problem.fixedSuffix.trim() && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-1 text-xs font-medium text-slate-500">고정 마무리</p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">
            {problem.fixedSuffix}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-900">순서 답안</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {problem.blocks.map((b) => (
            <button
              key={b.id}
              type="button"
              disabled={locked || usedLabels.has(b.displayLabel)}
              onClick={() => addLabel(b.displayLabel)}
              className="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
              aria-label={`문단 ${b.displayLabel} 선택`}
            >
              {b.displayLabel}
            </button>
          ))}
        </div>

        <ol className="space-y-2">
          {Array.from({ length: problem.blocks.length }).map((_, index) => {
            const id = answer.orderedBlockIds[index];
            const label = id ? blockById.get(id)?.displayLabel : null;
            return (
              <li
                key={`slot-${index}`}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="w-16 text-xs text-slate-500">
                  {index + 1}번째
                </span>
                {label ? (
                  <>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => removeAt(index)}
                      className="rounded border bg-white px-3 py-1 font-semibold"
                      aria-label={`${index + 1}번째 ${label} 제거`}
                    >
                      [{label}]
                    </button>
                    {!locked && (
                      <span className="flex gap-1">
                        <button
                          type="button"
                          className="text-xs text-slate-600"
                          onClick={() => move(index, index - 1)}
                        >
                          왼쪽
                        </button>
                        <button
                          type="button"
                          className="text-xs text-slate-600"
                          onClick={() => move(index, index + 1)}
                        >
                          오른쪽
                        </button>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">[선택]</span>
                )}
              </li>
            );
          })}
        </ol>

        {problem.answerMode === "drag_blocks" && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500">
              문단 이동 (위/아래 · 드래그 대신 버튼)
            </p>
            {answer.orderedBlockIds.map((id, index) => (
              <div
                key={id}
                className="flex items-center justify-between gap-2 rounded border bg-white px-2 py-1 text-sm"
              >
                <span>
                  {index + 1}. ({blockById.get(id)?.displayLabel})
                </span>
                {!locked && (
                  <span className="flex gap-1">
                    <Button type="button" onClick={() => move(index, 0)}>
                      맨 위
                    </Button>
                    <Button type="button" onClick={() => move(index, index - 1)}>
                      위
                    </Button>
                    <Button type="button" onClick={() => move(index, index + 1)}>
                      아래
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        move(index, answer.orderedBlockIds.length - 1)
                      }
                    >
                      맨 아래
                    </Button>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm font-medium text-slate-800">
          {answer.selectedLabels.length > 0
            ? answer.selectedLabels.join(" → ")
            : "아직 순서를 선택하지 않았습니다."}
        </p>
        {answer.isCorrect === true && (
          <p className="mt-1 text-sm text-emerald-700">
            전체 문단의 순서를 정확히 완성했습니다.
          </p>
        )}
        {answer.isCorrect === false && (
          <p className="mt-1 text-sm text-red-700">
            문단의 흐름을 다시 확인해 보세요.
          </p>
        )}
      </section>

      {(feedback || answer.hintText) && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {feedback || answer.hintText}
        </p>
      )}
      {revealLabels && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
          정답 예시(직접 배열): {revealLabels.join(" → ")}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">9단계 학습을 완료했습니다.</p>
          <p className="mt-1">
            {canStartStage10
              ? "10단계 영작 연습하기를 시작할 수 있습니다."
              : "다음 단계는 준비 중이거나 아직 공개되지 않았습니다."}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || locked} onClick={reset}>
          선택 초기화
        </Button>
        <Button
          type="button"
          disabled={busy || locked}
          onClick={() => void grade()}
        >
          채점하기
        </Button>
        {answer.attempts >= STAGE9_DEFAULT_THRESHOLDS.structureHintAfter &&
          !locked && (
            <Button type="button" disabled={busy} onClick={() => void hint()}>
              힌트
            </Button>
          )}
        {answer.attempts >= STAGE9_DEFAULT_THRESHOLDS.revealAfterWrong &&
          !locked && (
            <Button type="button" disabled={busy} onClick={() => void reveal()}>
              정답 순서 확인
            </Button>
          )}
        <Button
          type="button"
          disabled={!canComplete || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          9단계 학습 완료
        </Button>
        {stageDone && canStartStage10 && (
          <Button type="button" onClick={onStartStage10}>
            10단계 시작하기
          </Button>
        )}
        <Link
          href="/student/exam-prep"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
