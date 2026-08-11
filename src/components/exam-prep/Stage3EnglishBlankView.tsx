"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage3Action,
  gradeStage3Action,
  loadStage3StudentDataAction,
  requestStage3HintAction,
  requestStage3RevealAction,
  saveStage3DraftAction,
} from "@/lib/exam-prep/stage3-actions";
import {
  BLANK_INPUT_CH,
  type InputSizeHint,
} from "@/lib/exam-prep/korean-blank-normalize";
import {
  buildEnglishWithBlankSlots,
  STAGE3_DEFAULT_THRESHOLDS,
  type ExamStage3BlankPublic,
  type ExamStage3Progress,
  type Stage3BlankAnswerState,
} from "@/lib/exam-prep/stage3-types";

type SentenceRow = {
  id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
};

function LinkedKorean({
  text,
  linkedTexts,
}: {
  text: string;
  linkedTexts: string[];
}) {
  if (!text) return <span className="text-slate-400">(해석 없음)</span>;
  // simple sequential highlight of linked phrases
  let remaining = text;
  const nodes: ReactNode[] = [];
  let key = 0;
  const needles = linkedTexts.filter(Boolean).sort((a, b) => b.length - a.length);
  while (remaining.length > 0) {
    let best: { idx: number; needle: string } | null = null;
    for (const n of needles) {
      const idx = remaining.indexOf(n);
      if (idx >= 0 && (best == null || idx < best.idx)) {
        best = { idx, needle: n };
      }
    }
    if (!best) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (best.idx > 0) {
      nodes.push(<span key={key++}>{remaining.slice(0, best.idx)}</span>);
    }
    nodes.push(
      <strong
        key={key++}
        className="font-semibold underline decoration-2 decoration-slate-700"
      >
        {best.needle}
      </strong>
    );
    remaining = remaining.slice(best.idx + best.needle.length);
  }
  return <span className="leading-relaxed">{nodes}</span>;
}

function InlineBlankInput({
  blank,
  state,
  disabled,
  inputRef,
  onChange,
  onKeyDown,
}: {
  blank: ExamStage3BlankPublic;
  state: Stage3BlankAnswerState | undefined;
  disabled: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const size: InputSizeHint = blank.inputSize;
  const ch = BLANK_INPUT_CH[size];
  const status = state?.isCorrect;
  const border =
    status === true
      ? "border-emerald-500 bg-emerald-50"
      : status === false
        ? "border-rose-400 bg-rose-50"
        : "border-slate-300 bg-white";

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      disabled={disabled || status === true}
      value={state?.value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{ width: `${ch}ch`, minWidth: "3.5rem", maxWidth: "12rem" }}
      className={`mx-0.5 inline-block rounded border px-1.5 py-0.5 text-center text-sm outline-none focus:ring-2 focus:ring-brand-200 ${border}`}
      aria-label="영문 빈칸"
    />
  );
}

export function Stage3EnglishBlankView({
  assignmentStudentId,
  stepId,
  onGoStage2,
  canStartStage4 = false,
  onStartStage4,
  onStage3Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage2?: () => void;
  canStartStage4?: boolean;
  onStartStage4?: () => void;
  onStage3Completed?: () => void;
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
  const [blanks, setBlanks] = useState<ExamStage3BlankPublic[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [states, setStates] = useState<
    Record<string, Stage3BlankAnswerState>
  >({});
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blankOrder = useMemo(
    () => [...blanks].sort((a, b) => a.blankOrder - b.blankOrder),
    [blanks]
  );

  const applyProgress = useCallback((progress: ExamStage3Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision);
    setStageDone(Boolean(progress.completed_at));
    const nextAnswers: Record<string, string> = {};
    const nextStates: Record<string, Stage3BlankAnswerState> = {};
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
    const result = await loadStage3StudentDataAction({ assignmentStudentId });
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
    setBlanks(result.blanks);
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
        const result = await saveStage3DraftAction({
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

  function setBlankValue(blankId: string, value: string) {
    if (stageDone || states[blankId]?.isCorrect === true) return;
    setAnswers((prev) => {
      const next = { ...prev, [blankId]: value };
      persistDraft(next, revision);
      return next;
    });
    setStates((prev) => ({
      ...prev,
      [blankId]: {
        value,
        isCorrect: null,
        attempts: prev[blankId]?.attempts ?? 0,
        hintUsed: prev[blankId]?.hintUsed ?? false,
        answerRevealed: prev[blankId]?.answerRevealed ?? false,
        revealedAnswer: prev[blankId]?.revealedAnswer,
        hintText: prev[blankId]?.hintText,
      },
    }));
  }

  function focusBlank(index: number) {
    const id = blankOrder[index]?.id;
    if (!id) return;
    inputRefs.current[id]?.focus();
    inputRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function onBlankKeyDown(
    blankId: string,
    e: KeyboardEvent<HTMLInputElement>
  ) {
    const idx = blankOrder.findIndex((b) => b.id === blankId);
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      focusBlank(idx + (e.shiftKey ? -1 : 1));
    }
  }

  async function grade(blankIds?: string[]) {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await gradeStage3Action({
      assignmentStudentId,
      passageId: passage.id,
      blankIds,
      answers,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    const req = blanks.filter((b) => b.isRequired);
    setMessage(
      `채점 완료 · ${result.progress.correct_blank_ids.length}/${req.length || blanks.length}개 정답`
    );
  }

  async function handleComplete() {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await completeStage3Action({
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
    onStage3Completed?.();
  }

  const required = blanks.filter((b) => b.isRequired);
  const correctCount = required.filter(
    (b) => states[b.id]?.isCorrect === true
  ).length;
  const allRequiredCorrect =
    required.length > 0 && correctCount === required.length;

  const metaBits = [
    [passage?.school_level, passage?.grade].filter(Boolean).join(" · "),
    passage?.source || passage?.exam_name,
    passage?.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  if (loading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        2단계 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorCode === "stage2_required" && (
            <Button type="button" onClick={() => onGoStage2?.()}>
              2단계로 이동
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
      <header className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 2단계 · 영문 빈칸 완성하기
          <span className="ml-2 text-slate-500">(2 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          우리말 해석을 읽고 영문의 빈칸을 완성해 보세요.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          총 {required.length || blanks.length}개 중 {correctCount}개 정답
        </p>
      </header>

      <div className="space-y-4">
        {sentences.map((s) => {
          const sBlanks = blanks
            .filter((b) => b.sentenceId === s.id)
            .sort((a, b) => a.englishStart - b.englishStart);
          if (sBlanks.length === 0) return null;
          const slots = buildEnglishWithBlankSlots(
            s.english_text ?? "",
            sBlanks.map((b) => ({
              id: b.id,
              english_start: b.englishStart,
              english_end: b.englishEnd,
            }))
          );
          const linked = sBlanks
            .map((b) => b.linkedKoreanText)
            .filter((x): x is string => Boolean(x));
          return (
            <article
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold text-slate-400">
                {s.sentence_order}.
              </p>
              <p className="mt-2 text-sm text-slate-800">
                <LinkedKorean
                  text={s.korean_text ?? ""}
                  linkedTexts={linked}
                />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-900">
                {slots.map((seg, i) =>
                  seg.type === "text" ? (
                    <span key={i}>{seg.text}</span>
                  ) : (
                    <InlineBlankInput
                      key={seg.blankId}
                      blank={sBlanks.find((b) => b.id === seg.blankId)!}
                      state={states[seg.blankId]}
                      disabled={stageDone}
                      inputRef={(el) => {
                        inputRefs.current[seg.blankId] = el;
                      }}
                      onChange={(v) => setBlankValue(seg.blankId, v)}
                      onKeyDown={(e) => onBlankKeyDown(seg.blankId, e)}
                    />
                  )
                )}
              </p>
              <div className="mt-3 space-y-2">
                {sBlanks.map((b) => {
                  const st = states[b.id];
                  const attempts = st?.attempts ?? 0;
                  return (
                    <div
                      key={b.id}
                      className="flex flex-wrap items-center gap-2 text-xs text-slate-600"
                    >
                      {st?.isCorrect === true && (
                        <span className="font-medium text-emerald-700">
                          정답
                        </span>
                      )}
                      {st?.isCorrect === false && (
                        <span className="font-medium text-rose-700">오답</span>
                      )}
                      {st?.isCorrect === null && !(st?.value ?? "") && (
                        <span className="text-slate-400">미입력</span>
                      )}
                      {st?.hintText && (
                        <span className="text-sky-700">힌트: {st.hintText}</span>
                      )}
                      {st?.revealedAnswer && (
                        <span className="text-amber-800">
                          정답 확인: {st.revealedAnswer} (직접 입력 필요)
                        </span>
                      )}
                      {st?.isCorrect === false &&
                        attempts >= STAGE3_DEFAULT_THRESHOLDS.hintAfterWrong &&
                        !st.hintUsed && (
                          <button
                            type="button"
                            className="underline"
                            disabled={busy}
                            onClick={() =>
                              void requestStage3HintAction({
                                assignmentStudentId,
                                blankId: b.id,
                              }).then((r) => {
                                if (!r.ok) setMessage(r.message);
                                else {
                                  applyProgress(r.progress);
                                  setMessage(`힌트: ${r.hint}`);
                                }
                              })
                            }
                          >
                            힌트 보기
                          </button>
                        )}
                      {st?.isCorrect === false &&
                        attempts >=
                          STAGE3_DEFAULT_THRESHOLDS.revealAfterWrong &&
                        !st.answerRevealed && (
                          <button
                            type="button"
                            className="underline"
                            disabled={busy}
                            onClick={() =>
                              void requestStage3RevealAction({
                                assignmentStudentId,
                                blankId: b.id,
                              }).then((r) => {
                                if (!r.ok) setMessage(r.message);
                                else {
                                  applyProgress(r.progress);
                                  setMessage(
                                    "정답을 확인했습니다. 직접 다시 입력해 주세요."
                                  );
                                }
                              })
                            }
                          >
                            정답 확인
                          </button>
                        )}
                      {st?.isCorrect === false && (
                        <button
                          type="button"
                          className="underline"
                          disabled={busy || stageDone}
                          onClick={() => {
                            setStates((prev) => ({
                              ...prev,
                              [b.id]: { ...prev[b.id]!, isCorrect: null },
                            }));
                            focusBlank(
                              blankOrder.findIndex((x) => x.id === b.id)
                            );
                          }}
                        >
                          다시 풀기
                        </button>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busy || stageDone}
                  onClick={() => void grade(sBlanks.map((b) => b.id))}
                >
                  이 문장 채점
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">2단계 학습을 완료했습니다.</p>
          {canStartStage4 ? (
            <p className="mt-1">
              3단계 「해석 연습하기」를 시작할 수 있습니다.
            </p>
          ) : (
            <p className="mt-1">
              3단계가 아직 공개되지 않았거나 준비 중입니다.
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          href="/student/exam-prep"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          이전 화면
        </Link>
        <Button
          type="button"
          variant="secondary"
          disabled={busy || stageDone}
          onClick={() => void grade()}
        >
          {busy ? "처리 중…" : "전체 채점하기"}
        </Button>
        <Button
          type="button"
          disabled={!allRequiredCorrect || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          2단계 학습 완료
        </Button>
        {stageDone && canStartStage4 && (
          <Button type="button" onClick={() => onStartStage4?.()}>
            3단계 시작하기
          </Button>
        )}
      </div>
    </div>
  );
}
