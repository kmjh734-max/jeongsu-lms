"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage6Action,
  gradeStage6Action,
  loadStage6StudentDataAction,
  requestStage6HintAction,
  requestStage6RevealAction,
  saveStage6DraftAction,
} from "@/lib/exam-prep/stage6-actions";
import {
  STAGE6_DEFAULT_THRESHOLDS,
  buildEnglishWithChoiceSlots,
  type ExamStage6ItemPublic,
  type ExamStage6Progress,
  type Stage6AnswerState,
} from "@/lib/exam-prep/stage6-types";

type SentenceRow = {
  id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
};

export function Stage6ChoiceView({
  assignmentStudentId,
  stepId,
  onGoStage5,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage5?: () => void;
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
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [items, setItems] = useState<ExamStage6ItemPublic[]>([]);
  const [states, setStates] = useState<Record<string, Stage6AnswerState>>({});
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyProgress = useCallback((progress: ExamStage6Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision ?? 0);
    setStageDone(Boolean(progress.completed_at));
    setStates(progress.answers ?? {});
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    const result = await loadStage6StudentDataAction({ assignmentStudentId });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      setErrorCode("code" in result ? (result.code as string) : null);
      if ("passage" in result && result.passage) {
        setPassage(result.passage as typeof passage);
      }
      return;
    }
    setPassage(result.passage as typeof passage);
    setSentences(result.sentences as SentenceRow[]);
    setItems(result.items);
    applyProgress(result.progress);
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persistDraft = useCallback(
    (nextStates: Record<string, Stage6AnswerState>, rev: number) => {
      if (!passage || stageDone) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const selections: Record<string, string | null> = {};
        for (const [id, st] of Object.entries(nextStates)) {
          selections[id] = st.selectedOptionId;
        }
        const result = await saveStage6DraftAction({
          assignmentStudentId,
          passageId: passage.id,
          selections,
          expectedRevision: rev,
        });
        if (result.ok && result.progress) {
          setRevision(result.progress.revision);
        } else if (!result.ok && "code" in result && result.code === "stale") {
          setMessage(result.message);
          if ("progress" in result && result.progress) {
            applyProgress(result.progress);
          }
        }
      }, 500);
    },
    [assignmentStudentId, passage, stageDone, applyProgress]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function selectOption(itemId: string, optionId: string) {
    if (stageDone || states[itemId]?.isCorrect === true) return;
    setStates((prev) => {
      const next = {
        ...prev,
        [itemId]: {
          selectedOptionId: optionId,
          isCorrect: null,
          attempts: prev[itemId]?.attempts ?? 0,
          hintUsed: prev[itemId]?.hintUsed ?? false,
          answerRevealed: prev[itemId]?.answerRevealed ?? false,
          revealedOptionId: prev[itemId]?.revealedOptionId,
          revealedText: prev[itemId]?.revealedText,
          hintText: prev[itemId]?.hintText,
          categoryFeedback: prev[itemId]?.categoryFeedback,
          optionOrder: prev[itemId]?.optionOrder ?? [],
        },
      };
      persistDraft(next, revision);
      return next;
    });
  }

  async function grade(itemIds?: string[]) {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const selections: Record<string, string | null> = {};
    for (const [id, st] of Object.entries(states)) {
      selections[id] = st.selectedOptionId;
    }
    const result = await gradeStage6Action({
      assignmentStudentId,
      passageId: passage.id,
      itemIds,
      selections,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    const req = items.filter((b) => b.isRequired);
    setMessage(
      `채점 완료 · ${result.progress.correct_blank_ids.length}/${req.length || items.length}개 정답`
    );
  }

  async function handleHint(itemId: string) {
    setBusy(true);
    const result = await requestStage6HintAction({
      assignmentStudentId,
      itemId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
  }

  async function handleReveal(itemId: string) {
    setBusy(true);
    const result = await requestStage6RevealAction({
      assignmentStudentId,
      itemId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setMessage("정답을 확인했습니다. 직접 다시 선택해 제출하세요.");
  }

  async function handleComplete() {
    if (!passage || stageDone) return;
    setBusy(true);
    const result = await completeStage6Action({
      assignmentStudentId,
      passageId: passage.id,
      stepId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setStageDone(true);
    setMessage(result.message);
  }

  const required = items.filter((b) => b.isRequired);
  const correctCount = required.filter(
    (b) => states[b.id]?.isCorrect === true
  ).length;
  const allRequiredCorrect =
    required.length > 0 && correctCount === required.length;
  const incorrectIds = useMemo(
    () =>
      items
        .filter((b) => states[b.id]?.isCorrect === false)
        .map((b) => b.id),
    [items, states]
  );

  const metaBits = [
    [passage?.school_level, passage?.grade].filter(Boolean).join(" · "),
    passage?.source || passage?.exam_name,
    passage?.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  if (loading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        6단계 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorCode === "stage5_required" && (
            <Button type="button" onClick={() => onGoStage5?.()}>
              5단계로 이동
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => void reload()}>
            다시 시도
          </Button>
          <Link
            href="/student/exam-prep"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            이전 화면
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 6단계 · 어법·어휘 고르기
          <span className="ml-2 text-slate-500">(6 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          괄호 안에서 문맥에 맞는 올바른 어법과 어휘를 골라 보세요.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          총 {required.length || items.length}개 중 {correctCount}개 정답
        </p>
      </header>

      <div className="space-y-4">
        {sentences.map((s) => {
          const sItems = items
            .filter((b) => b.sentenceId === s.id)
            .sort((a, b) => a.englishStart - b.englishStart);
          if (sItems.length === 0) return null;
          const slots = buildEnglishWithChoiceSlots(
            s.english_text ?? "",
            sItems.map((b) => ({
              id: b.id,
              english_start: b.englishStart,
              english_end: b.englishEnd,
            }))
          );
          return (
            <article
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold text-slate-400">
                {s.sentence_order}.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {s.korean_text}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-900">
                {slots.map((seg, i) => {
                  if (seg.type === "text") {
                    return <span key={i}>{seg.text}</span>;
                  }
                  const item = sItems.find((b) => b.id === seg.itemId)!;
                  const num = sItems.findIndex((b) => b.id === item.id) + 1;
                  const st = states[item.id];
                  return (
                    <span
                      key={seg.itemId}
                      className={`mx-0.5 inline-block rounded px-1 font-medium ${
                        st?.isCorrect === true
                          ? "bg-emerald-50 text-emerald-800"
                          : st?.isCorrect === false
                            ? "bg-rose-50 text-rose-800"
                            : "bg-violet-50 text-violet-900"
                      }`}
                    >
                      [{item.options.map((o) => o.text).join(" / ")}]
                      <sup className="text-[10px] text-slate-400">{num}</sup>
                    </span>
                  );
                })}
              </p>

              <div className="mt-4 space-y-3">
                {sItems.map((item, idx) => {
                  const st = states[item.id];
                  const locked = stageDone || st?.isCorrect === true;
                  const orderedOpts = item.options;
                  return (
                    <fieldset
                      key={item.id}
                      disabled={locked}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
                    >
                      <legend className="px-1 text-xs font-medium text-violet-800">
                        {idx + 1}.{" "}
                        {item.questionCategory === "grammar" ? "어법" : "어휘"}
                        {(item.grammarSubLabels.length > 0 ||
                          item.vocabularySubLabels.length > 0) && (
                          <span className="ml-1 font-normal text-slate-500">
                            {(
                              item.grammarSubLabels.length
                                ? item.grammarSubLabels
                                : item.vocabularySubLabels
                            ).join(" · ")}
                          </span>
                        )}
                      </legend>
                      <div
                        className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                        role="radiogroup"
                        aria-label={`문제 ${idx + 1}`}
                      >
                        {orderedOpts.map((opt) => {
                          const selected = st?.selectedOptionId === opt.id;
                          return (
                            <label
                              key={opt.id}
                              className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                selected
                                  ? "border-violet-500 bg-white ring-1 ring-violet-400"
                                  : "border-slate-200 bg-white"
                              } ${locked ? "opacity-70" : ""}`}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                name={`item-${item.id}`}
                                checked={selected}
                                disabled={locked}
                                onChange={() => selectOption(item.id, opt.id)}
                              />
                              <span
                                aria-hidden
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-violet-600 bg-violet-600 text-white"
                                    : "border-slate-300"
                                }`}
                              >
                                {selected ? "✓" : ""}
                              </span>
                              <span className="font-mono">{opt.text}</span>
                              {selected && (
                                <span className="text-xs text-slate-500">
                                  (선택됨)
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {st?.isCorrect === true && (
                          <span className="text-emerald-700">정답</span>
                        )}
                        {st?.isCorrect === false && (
                          <span className="text-rose-700">오답</span>
                        )}
                        {!st?.selectedOptionId && st?.isCorrect == null && (
                          <span className="text-slate-500">미선택</span>
                        )}
                        {st?.categoryFeedback && st.isCorrect === false && (
                          <span className="text-amber-800">
                            {st.categoryFeedback}
                          </span>
                        )}
                        {st?.hintText && (
                          <span className="text-slate-600">
                            힌트: {st.hintText}
                          </span>
                        )}
                        {st?.revealedText && (
                          <span className="text-slate-700">
                            정답 확인: {st.revealedText}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(st?.attempts ?? 0) >=
                          STAGE6_DEFAULT_THRESHOLDS.hintAfterWrong &&
                          !st?.hintUsed &&
                          st?.isCorrect !== true && (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={busy || stageDone}
                              onClick={() => void handleHint(item.id)}
                            >
                              힌트
                            </Button>
                          )}
                        {(st?.attempts ?? 0) >=
                          STAGE6_DEFAULT_THRESHOLDS.revealAfterWrong &&
                          !st?.answerRevealed &&
                          st?.isCorrect !== true && (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={busy || stageDone}
                              onClick={() => void handleReveal(item.id)}
                            >
                              정답 확인
                            </Button>
                          )}
                        {st?.isCorrect === false && (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busy || stageDone}
                            onClick={() => void grade([item.id])}
                          >
                            다시 채점
                          </Button>
                        )}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">6단계 학습을 완료했습니다.</p>
          <p className="mt-1">다음 단계는 준비 중입니다.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy || stageDone}
          onClick={() => void grade()}
        >
          전체 채점하기
        </Button>
        {incorrectIds.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy || stageDone}
            onClick={() => void grade(incorrectIds)}
          >
            오답만 다시 풀기
          </Button>
        )}
        <Button
          type="button"
          disabled={!allRequiredCorrect || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          6단계 학습 완료
        </Button>
        <Link
          href="/student/exam-prep"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
