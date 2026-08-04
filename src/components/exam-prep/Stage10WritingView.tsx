"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage10Action,
  gradeStage10Action,
  loadStage10OverallSummaryAction,
  loadStage10StudentDataAction,
  requestStage10HintAction,
  requestStage10RevealAction,
  saveStage10DraftAction,
} from "@/lib/exam-prep/stage10-actions";
import {
  STAGE10_DEFAULT_THRESHOLDS,
  type ExamStage10ItemPublic,
  type ExamStage10Progress,
  type Stage10ItemAnswerState,
  type Stage10SegmentAnswer,
} from "@/lib/exam-prep/stage10-types";

function emptyState(): Stage10ItemAnswerState {
  return {
    segmentAnswers: {},
    fullSentenceAnswer: "",
    attempts: 0,
    isCorrect: null,
    hintUsed: false,
    answerRevealed: false,
  };
}

export function Stage10WritingView({
  assignmentStudentId,
  stepId,
  onGoStage9,
  onStage10Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage9?: () => void;
  onStage10Completed?: () => void;
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
  const [items, setItems] = useState<ExamStage10ItemPublic[]>([]);
  const [states, setStates] = useState<Record<string, Stage10ItemAnswerState>>(
    {}
  );
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [overallDone, setOverallDone] = useState(false);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof loadStage10OverallSummaryAction>
  > | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string | null>>({});
  const [reveals, setReveals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyProgress = useCallback((progress: ExamStage10Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision ?? 0);
    setStageDone(Boolean(progress.completed_at));
    setStates(progress.answers ?? {});
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    const result = await loadStage10StudentDataAction({ assignmentStudentId });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      setErrorCode("code" in result ? (result.code as string) : null);
      if ("passage" in result && result.passage) setPassage(result.passage);
      return;
    }
    setPassage(result.passage);
    setItems(result.items);
    applyProgress(result.progress);
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const required = items.filter((i) => i.isRequired);
  const correctCount = required.filter(
    (i) => states[i.id]?.isCorrect === true
  ).length;
  const canComplete =
    required.length > 0 &&
    required.every((i) => states[i.id]?.isCorrect === true);

  function scheduleSave(next: Record<string, Stage10ItemAnswerState>) {
    if (!passage || stageDone) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void saveStage10DraftAction({
        assignmentStudentId,
        passageId: passage.id,
        itemAnswers: next,
        expectedRevision: revision,
      }).then((res) => {
        if (res.ok) applyProgress(res.progress);
      });
    }, 600);
  }

  function patchItem(itemId: string, patch: Partial<Stage10ItemAnswerState>) {
    setStates((prev) => {
      const cur = prev[itemId] ?? emptyState();
      if (cur.isCorrect === true) return prev;
      const next = {
        ...prev,
        [itemId]: { ...cur, ...patch, isCorrect: null },
      };
      scheduleSave(next);
      return next;
    });
    setFeedback((f) => ({ ...f, [itemId]: null }));
  }

  function setSegment(
    itemId: string,
    segmentId: string,
    ans: Stage10SegmentAnswer
  ) {
    const cur = states[itemId] ?? emptyState();
    patchItem(itemId, {
      segmentAnswers: {
        ...cur.segmentAnswers,
        [segmentId]: ans,
      },
    });
  }

  async function grade(itemIds?: string[]) {
    if (!passage) return;
    setBusy(true);
    setMessage(null);
    const result = await gradeStage10Action({
      assignmentStudentId,
      passageId: passage.id,
      itemIds,
      itemAnswers: states,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      if ("progress" in result && result.progress) applyProgress(result.progress);
      return;
    }
    applyProgress(result.progress);
    if (result.feedback) setFeedback(result.feedback);
    setMessage(`채점 완료 · 점수 ${result.score}점`);
  }

  async function handleComplete() {
    if (!passage) return;
    setBusy(true);
    const result = await completeStage10Action({
      assignmentStudentId,
      passageId: passage.id,
      stepId,
    });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) {
      setStageDone(true);
      setOverallDone(Boolean(result.overallCompleted));
      onStage10Completed?.();
      const sum = await loadStage10OverallSummaryAction({
        assignmentStudentId,
      });
      setSummary(sum);
    }
  }

  async function hint(itemId: string) {
    setBusy(true);
    const result = await requestStage10HintAction({
      assignmentStudentId,
      itemId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setFeedback((f) => ({ ...f, [itemId]: result.hint }));
  }

  async function reveal(itemId: string) {
    setBusy(true);
    const result = await requestStage10RevealAction({
      assignmentStudentId,
      itemId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setReveals((r) => ({ ...r, [itemId]: result.answer }));
    setMessage("정답을 확인했습니다. 직접 다시 입력한 뒤 채점하세요.");
  }

  if (loading) {
    return <p className="text-sm text-slate-500">10단계를 불러오는 중…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">{error}</p>
        {errorCode === "stage9_required" && (
          <Button type="button" onClick={onGoStage9}>
            9단계로 이동
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
          현재 단계: 10단계 · 영작 연습하기 · 10 / 10
        </p>
        <p className="mt-1 text-sm text-slate-700">
          우리말과 같은 뜻이 되도록 주어진 단어를 순서대로 사용하여 영작하세요.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {required.length}문항 중 {correctCount}문항 정답
        </p>
      </header>

      {items.map((item) => {
        const st = states[item.id] ?? emptyState();
        const locked = stageDone || st.isCorrect === true;
        return (
          <section
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-slate-900">
              {item.itemOrder}번
              {st.isCorrect === true && (
                <span className="ml-2 text-emerald-700"> ✓ 정답</span>
              )}
              {st.isCorrect === false && (
                <span className="ml-2 text-red-700"> ✗ 오답</span>
              )}
            </p>
            <p className="mt-1 text-sm text-slate-700">{item.koreanPrompt}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              제시어: {item.cues.map((c) => c.cueText).join(" → ")}
            </p>

            {item.inputMode === "full_sentence" ? (
              <textarea
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
                disabled={locked}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={st.fullSentenceAnswer ?? ""}
                onChange={(e) =>
                  patchItem(item.id, { fullSentenceAnswer: e.target.value })
                }
                placeholder="영어 문장을 작성하세요"
              />
            ) : (
              <div className="mt-3 flex flex-wrap items-end gap-1 text-sm leading-relaxed">
                {item.segments.map((seg) => {
                  if (seg.segmentType === "fixed_text") {
                    return (
                      <span key={seg.id} className="whitespace-pre-wrap">
                        {seg.fixedText}
                      </span>
                    );
                  }
                  const sans = st.segmentAnswers[seg.id];
                  const segLocked = locked || sans?.isCorrect === true;
                  if (item.blankDisplayMode === "token_slots") {
                    const count = seg.tokenSlotCount ?? 1;
                    const tokens = [...(sans?.tokens ?? [])];
                    while (tokens.length < count) tokens.push("");
                    return (
                      <span
                        key={seg.id}
                        className="mx-0.5 inline-flex flex-wrap gap-1"
                      >
                        {Array.from({ length: count }).map((_, ti) => (
                          <input
                            key={`${seg.id}-${ti}`}
                            type="text"
                            disabled={segLocked}
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            className="min-w-[3.5rem] max-w-[8rem] rounded border border-slate-300 px-1.5 py-1 text-sm"
                            value={tokens[ti] ?? ""}
                            aria-label={`${item.itemOrder}번 구간 ${ti + 1}번째 단어`}
                            onChange={(e) => {
                              const next = [...tokens];
                              next[ti] = e.target.value;
                              setSegment(item.id, seg.id, {
                                inputMode: "token_slots",
                                tokens: next,
                                assembledValue: next.join(" ").trim(),
                              });
                            }}
                          />
                        ))}
                      </span>
                    );
                  }
                  return (
                    <input
                      key={seg.id}
                      type="text"
                      disabled={segLocked}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="mx-1 min-w-[10rem] flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                      value={sans?.value ?? ""}
                      aria-label={`${item.itemOrder}번 영작 구간`}
                      onChange={(e) =>
                        setSegment(item.id, seg.id, {
                          inputMode: "phrase_input",
                          value: e.target.value,
                        })
                      }
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busy || locked}
                onClick={() => void grade([item.id])}
              >
                이 문항 채점
              </Button>
              {st.attempts >= STAGE10_DEFAULT_THRESHOLDS.grammarHintAfter &&
                !locked && (
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void hint(item.id)}
                  >
                    힌트
                  </Button>
                )}
              {st.attempts >= STAGE10_DEFAULT_THRESHOLDS.fullRevealAfter &&
                !locked && (
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => void reveal(item.id)}
                  >
                    정답 확인
                  </Button>
                )}
              {!locked && (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    patchItem(item.id, {
                      segmentAnswers: {},
                      fullSentenceAnswer: "",
                      isCorrect: null,
                    });
                  }}
                >
                  이 문항 초기화
                </Button>
              )}
            </div>
            {(feedback[item.id] || st.hintText) && (
              <p className="mt-2 text-sm text-slate-700">
                {feedback[item.id] || st.hintText}
              </p>
            )}
            {reveals[item.id] && (
              <p className="mt-2 rounded bg-slate-100 px-2 py-1 text-sm">
                정답 예시(직접 입력): {reveals[item.id]}
              </p>
            )}
          </section>
        );
      })}

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {(stageDone || overallDone) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">10단계 학습을 모두 완료했습니다!</p>
          <p className="mt-1">전체 진행률: 100% · 완료한 단계: 10 / 10</p>
          {summary && summary.ok && (
            <ul className="mt-2 space-y-1 text-xs">
              {summary.stages.map((s) => (
                <li key={s.stage}>
                  {s.stage}단계: {s.completed ? "완료" : "미완료"}
                  {s.score != null ? ` · ${s.score}점` : ""}
                  {s.attempts ? ` · 시도 ${s.attempts}` : ""}
                </li>
              ))}
            </ul>
          )}
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
        <Button
          type="button"
          disabled={!canComplete || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          10단계 학습 완료
        </Button>
        <Link
          href={`/student/exam-prep/${assignmentStudentId}`}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          1단계부터 다시 복습하기
        </Link>
        <Link
          href="/student/exam-prep"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          내신대비학습 목록으로 이동
        </Link>
      </div>
    </div>
  );
}
