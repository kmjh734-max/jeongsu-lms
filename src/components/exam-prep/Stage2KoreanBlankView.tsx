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
  completeStage2Action,
  gradeStage2Action,
  loadStage2StudentDataAction,
  requestStage2HintAction,
  requestStage2RevealAction,
  saveStage2DraftAction,
} from "@/lib/exam-prep/stage2-actions";
import {
  BLANK_INPUT_CH,
  type InputSizeHint,
} from "@/lib/exam-prep/korean-blank-normalize";
import {
  buildKoreanWithBlankSlots,
  STAGE2_DEFAULT_THRESHOLDS,
  type ExamKoreanBlankPublic,
  type ExamStage2Progress,
  type Stage2BlankAnswerState,
} from "@/lib/exam-prep/stage2-types";
import {
  buildHighlightSegments,
  type VocabMark,
} from "@/lib/exam-prep/vocab-marks";

type SentenceRow = {
  id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
};

function LinkedEnglish({
  text,
  blanks,
}: {
  text: string;
  blanks: ExamKoreanBlankPublic[];
}) {
  const marks: VocabMark[] = blanks
    .filter((b) => b.linkedEnglishText)
    .map((b, i) => ({
      id: `link-${b.id}`,
      englishText: b.linkedEnglishText!,
      koreanText: "",
      englishOccurrence: b.linkedEnglishOccurrence ?? 0,
      styleKey: (["vocab-1", "vocab-2", "vocab-3", "vocab-4", "vocab-5", "vocab-6"] as const)[
        i % 6
      ]!,
    }));
  const segs = buildHighlightSegments(text, marks, "english");
  return (
    <span className="leading-relaxed">
      {segs.map((seg, i) =>
        seg.mark ? (
          <strong
            key={i}
            className="font-semibold underline decoration-2 decoration-slate-700"
          >
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

function InlineBlankInput({
  blank,
  state,
  disabled,
  inputRef,
  onChange,
  onKeyDown,
}: {
  blank: ExamKoreanBlankPublic;
  state: Stage2BlankAnswerState | undefined;
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
      disabled={disabled || status === true}
      value={state?.value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{ width: `${ch}ch`, minWidth: "3.5rem", maxWidth: "12rem" }}
      className={`mx-0.5 inline-block rounded border px-1.5 py-0.5 text-center text-sm outline-none focus:ring-2 focus:ring-brand-200 ${border}`}
      aria-label="우리말 빈칸"
    />
  );
}

export function Stage2KoreanBlankView({
  assignmentStudentId,
  stepId,
  onGoStage1,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage1?: () => void;
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
  const [blanks, setBlanks] = useState<ExamKoreanBlankPublic[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [states, setStates] = useState<
    Record<string, Stage2BlankAnswerState>
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

  const applyProgress = useCallback((progress: ExamStage2Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision);
    setStageDone(Boolean(progress.completed_at));
    const nextAnswers: Record<string, string> = {};
    const nextStates: Record<string, Stage2BlankAnswerState> = {};
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
    const result = await loadStage2StudentDataAction({ assignmentStudentId });
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
        const result = await saveStage2DraftAction({
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
      const dir = e.shiftKey ? -1 : 1;
      focusBlank(idx + dir);
    }
  }

  async function grade(blankIds?: string[]) {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await gradeStage2Action({
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
    setMessage(
      `채점 완료 · 정답 진행률 ${result.score}% (${result.progress.correct_blank_ids.length}/${blanks.filter((b) => b.isRequired).length || blanks.length})`
    );
  }

  async function handleHint(blankId: string) {
    setBusy(true);
    const result = await requestStage2HintAction({
      assignmentStudentId,
      blankId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setMessage(`힌트: ${result.hint}`);
  }

  async function handleReveal(blankId: string) {
    setBusy(true);
    const result = await requestStage2RevealAction({
      assignmentStudentId,
      blankId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setMessage("정답을 확인했습니다. 직접 다시 입력해 주세요.");
  }

  async function handleComplete() {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const result = await completeStage2Action({
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
          {errorCode === "stage1_required" && (
            <Button type="button" onClick={() => onGoStage1?.()}>
              1단계로 이동
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
      <header className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 2단계 · 우리말 빈칸 완성하기
          <span className="ml-2 text-slate-500">(2 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          영문을 읽고 우리말 해석의 빈칸을 완성해 보세요.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {required.length || blanks.length}개 중 {correctCount}개 정답
        </p>
      </header>

      <div className="space-y-4">
        {sentences.map((s) => {
          const sBlanks = blanks
            .filter((b) => b.sentenceId === s.id)
            .sort((a, b) => a.koreanStart - b.koreanStart);
          if (sBlanks.length === 0) return null;
          const slots = buildKoreanWithBlankSlots(
            s.korean_text ?? "",
            sBlanks.map((b) => ({
              id: b.id,
              korean_start: b.koreanStart,
              korean_end: b.koreanEnd,
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
              <p className="mt-2 text-sm text-slate-900">
                <LinkedEnglish text={s.english_text} blanks={sBlanks} />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
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
                      {st?.isCorrect === null && (st?.value ?? "") === "" && (
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
                        attempts >= STAGE2_DEFAULT_THRESHOLDS.hintAfterWrong &&
                        b.hasHint &&
                        !st.hintUsed && (
                          <button
                            type="button"
                            className="underline"
                            disabled={busy}
                            onClick={() => void handleHint(b.id)}
                          >
                            힌트 보기
                          </button>
                        )}
                      {st?.isCorrect === false &&
                        attempts >=
                          STAGE2_DEFAULT_THRESHOLDS.revealAfterWrong &&
                        !st.answerRevealed && (
                          <button
                            type="button"
                            className="underline"
                            disabled={busy}
                            onClick={() => void handleReveal(b.id)}
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
                            setBlankValue(b.id, st.value ?? "");
                            setStates((prev) => ({
                              ...prev,
                              [b.id]: {
                                ...prev[b.id]!,
                                isCorrect: null,
                              },
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
          <p className="mt-1">다음 단계는 준비 중입니다.</p>
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
          {busy ? "처리 중…" : "전체 채점"}
        </Button>
        <Button
          type="button"
          disabled={!allRequiredCorrect || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          2단계 학습 완료
        </Button>
      </div>
    </div>
  );
}
