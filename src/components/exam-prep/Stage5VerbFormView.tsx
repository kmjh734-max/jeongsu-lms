"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage5Action,
  gradeStage5Action,
  loadStage5StudentDataAction,
  requestStage5HintAction,
  requestStage5RevealAction,
  saveStage5DraftAction,
} from "@/lib/exam-prep/stage5-actions";
import {
  STAGE5_DEFAULT_THRESHOLDS,
  buildEnglishWithVerbSlots,
  type ExamStage5ItemPublic,
  type ExamStage5Progress,
  type Stage5ItemAnswerState,
} from "@/lib/exam-prep/stage5-types";

type SentenceRow = {
  id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
};

export function Stage5VerbFormView({
  assignmentStudentId,
  stepId,
  onGoStage4,
  canStartStage6: _canStartStage6 = false,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage4?: () => void;
  /** 6단계는 미구현 — 자리만 예약 */
  canStartStage6?: boolean;
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
  const [items, setItems] = useState<ExamStage5ItemPublic[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [states, setStates] = useState<Record<string, Stage5ItemAnswerState>>(
    {}
  );
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemOrder = useMemo(
    () => [...items].sort((a, b) => a.blankOrder - b.blankOrder),
    [items]
  );

  const applyProgress = useCallback((progress: ExamStage5Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision);
    setStageDone(Boolean(progress.completed_at));
    const nextAnswers: Record<string, string> = {};
    const nextStates: Record<string, Stage5ItemAnswerState> = {};
    for (const [id, st] of Object.entries(progress.answers ?? {})) {
      nextAnswers[id] = st.value ?? "";
      nextStates[id] = st;
    }
    setAnswers(nextAnswers);
    setStates(nextStates);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    const result = await loadStage5StudentDataAction({ assignmentStudentId });
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
    (nextAnswers: Record<string, string>, rev: number) => {
      if (!passage || stageDone) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await saveStage5DraftAction({
          assignmentStudentId,
          passageId: passage.id,
          answers: nextAnswers,
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
      }, 700);
    },
    [assignmentStudentId, passage, stageDone, applyProgress]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function setItemValue(itemId: string, value: string) {
    if (stageDone || states[itemId]?.isCorrect === true) return;
    setAnswers((prev) => {
      const next = { ...prev, [itemId]: value };
      persistDraft(next, revision);
      return next;
    });
    setStates((prev) => ({
      ...prev,
      [itemId]: {
        value,
        isCorrect: null,
        attempts: prev[itemId]?.attempts ?? 0,
        hintUsed: prev[itemId]?.hintUsed ?? false,
        answerRevealed: prev[itemId]?.answerRevealed ?? false,
        revealedAnswer: prev[itemId]?.revealedAnswer,
        hintText: prev[itemId]?.hintText,
        categoryFeedback: prev[itemId]?.categoryFeedback,
      },
    }));
  }

  function focusItem(index: number) {
    const id = itemOrder[index]?.id;
    if (!id) return;
    inputRefs.current[id]?.focus();
    inputRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function onKeyDown(itemId: string, e: KeyboardEvent<HTMLInputElement>) {
    const idx = itemOrder.findIndex((b) => b.id === itemId);
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      focusItem(idx + (e.shiftKey ? -1 : 1));
    }
  }

  async function grade(itemIds?: string[]) {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await gradeStage5Action({
      assignmentStudentId,
      passageId: passage.id,
      itemIds,
      answers,
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
    const result = await requestStage5HintAction({
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
    const result = await requestStage5RevealAction({
      assignmentStudentId,
      itemId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setMessage("정답을 확인했습니다. 직접 다시 입력해 제출하세요.");
  }

  async function handleComplete() {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await completeStage5Action({
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
  const incorrectIds = itemOrder
    .filter((b) => states[b.id]?.isCorrect === false)
    .map((b) => b.id);

  const metaBits = [
    [passage?.school_level, passage?.grade].filter(Boolean).join(" · "),
    passage?.source || passage?.exam_name,
    passage?.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  if (loading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        5단계 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorCode === "stage4_required" && (
            <Button type="button" onClick={() => onGoStage4?.()}>
              4단계로 이동
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
      <header className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 5단계 · 동사형 연습하기
          <span className="ml-2 text-slate-500">(5 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          괄호 안에 주어진 단어를 문맥에 맞는 알맞은 형태로 고쳐 쓰세요.
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
          const slots = buildEnglishWithVerbSlots(
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
                  const st = states[item.id];
                  const num =
                    sItems.findIndex((b) => b.id === item.id) + 1;
                  return (
                    <span
                      key={seg.itemId}
                      className={`mx-0.5 inline-flex items-baseline gap-0.5 rounded px-1 font-medium ${
                        st?.isCorrect === true
                          ? "bg-emerald-50 text-emerald-800"
                          : st?.isCorrect === false
                            ? "bg-rose-50 text-rose-800"
                            : "bg-indigo-50 text-indigo-900"
                      }`}
                      title={`${num}번 문제`}
                    >
                      ({item.cueDisplayText || "…"})
                      <sup className="text-[10px] text-slate-400">{num}</sup>
                    </span>
                  );
                })}
              </p>

              <div className="mt-4 space-y-3">
                {sItems.map((item, idx) => {
                  const st = states[item.id];
                  const locked =
                    stageDone || st?.isCorrect === true;
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
                    >
                      <p className="text-xs font-medium text-indigo-800">
                        {idx + 1}. 제시어: ({item.cueDisplayText})
                        {item.grammarLabels.length > 0 && (
                          <span className="ml-2 font-normal text-slate-500">
                            {item.grammarLabels.join(" · ")}
                          </span>
                        )}
                      </p>
                      <input
                        ref={(el) => {
                          inputRefs.current[item.id] = el;
                        }}
                        type="text"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        disabled={locked}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 disabled:bg-slate-100"
                        value={answers[item.id] ?? ""}
                        onChange={(e) =>
                          setItemValue(item.id, e.target.value)
                        }
                        onKeyDown={(e) => onKeyDown(item.id, e)}
                        placeholder="알맞은 형태로 입력"
                        style={{
                          minWidth: "8rem",
                          width: "100%",
                        }}
                      />
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {st?.isCorrect === true && (
                          <span className="text-emerald-700">정답</span>
                        )}
                        {st?.isCorrect === false && (
                          <span className="text-rose-700">오답</span>
                        )}
                        {st?.isCorrect === null &&
                          !(answers[item.id] ?? "").trim() && (
                            <span className="text-slate-500">미입력</span>
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
                        {st?.revealedAnswer && (
                          <span className="text-slate-700">
                            정답 확인: {st.revealedAnswer}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(st?.attempts ?? 0) >=
                          STAGE5_DEFAULT_THRESHOLDS.hintAfterWrong &&
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
                          STAGE5_DEFAULT_THRESHOLDS.revealAfterWrong &&
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
                    </div>
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
          <p className="font-semibold">5단계 학습을 완료했습니다.</p>
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
          5단계 학습 완료
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
