"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage7Action,
  gradeStage7Action,
  loadStage7StudentDataAction,
  requestStage7HintAction,
  requestStage7RevealAction,
  saveStage7DraftAction,
} from "@/lib/exam-prep/stage7-actions";
import {
  STAGE7_DEFAULT_THRESHOLDS,
  buildDisplayWithCandidateSlots,
  resultLabelKo,
  type ExamStage7CandidatePublic,
  type ExamStage7Progress,
  type Stage7AnswerState,
} from "@/lib/exam-prep/stage7-types";

type SentenceRow = {
  id: string;
  sentence_order: number;
  display_text: string;
  paragraph_number: number;
  is_paragraph_start: boolean;
};

export function Stage7ErrorView({
  assignmentStudentId,
  stepId,
  onGoStage6,
  onStage7Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage6?: () => void;
  onStage7Completed?: () => void;
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
  const [requiredCount, setRequiredCount] = useState(3);
  const [guideText, setGuideText] = useState("");
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [candidates, setCandidates] = useState<ExamStage7CandidatePublic[]>(
    []
  );
  const [states, setStates] = useState<Record<string, Stage7AnswerState>>({});
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [canCompleteServer, setCanCompleteServer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedCount = useMemo(
    () => Object.values(states).filter((s) => s.selected).length,
    [states]
  );

  const fullyCorrect = useMemo(() => {
    const exact = Object.values(states).filter(
      (s) => s.result === "correct_selection_and_correction"
    ).length;
    const hasWrongSelection = Object.values(states).some(
      (s) => s.selected && s.result === "wrong_selection"
    );
    const hasIncomplete = Object.values(states).some(
      (s) =>
        s.selected &&
        s.result !== "correct_selection_and_correction" &&
        s.result !== "wrong_selection"
    );
    return (
      exact >= requiredCount &&
      selectedCount === requiredCount &&
      !hasWrongSelection &&
      !hasIncomplete
    );
  }, [states, requiredCount, selectedCount]);

  const applyProgress = useCallback((progress: ExamStage7Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision ?? 0);
    setStageDone(Boolean(progress.completed_at));
    setStates(progress.answers ?? {});
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadStage7StudentDataAction({ assignmentStudentId });
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
    setRequiredCount(result.requiredErrorCount);
    setGuideText(result.guideText);
    setSentences(result.sentences as SentenceRow[]);
    setCandidates(result.candidates);
    applyProgress(result.progress);
    if ("canComplete" in result) {
      setCanCompleteServer(Boolean(result.canComplete));
    }
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persist = useCallback(
    (next: Record<string, Stage7AnswerState>, rev: number) => {
      if (!passage || stageDone) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const answers: Record<
          string,
          { selected: boolean; correctionValue: string }
        > = {};
        for (const [id, st] of Object.entries(next)) {
          answers[id] = {
            selected: st.selected,
            correctionValue: st.correctionValue,
          };
        }
        const result = await saveStage7DraftAction({
          assignmentStudentId,
          passageId: passage.id,
          answers,
          expectedRevision: rev,
        });
        if (result.ok && result.progress) {
          setRevision(result.progress.revision);
        } else if (!result.ok) {
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

  function toggleCandidate(id: string) {
    if (stageDone || states[id]?.result === "correct_selection_and_correction") {
      return;
    }
    setCanCompleteServer(false);
    setStates((prev) => {
      const cur = prev[id];
      const willSelect = !cur?.selected;
      if (willSelect && selectedCount >= requiredCount && !cur?.selected) {
        setMessage(
          `어색한 곳은 ${requiredCount}개까지 선택할 수 있습니다. 기존 선택을 해제한 후 다시 선택해 주세요.`
        );
        return prev;
      }
      const next = {
        ...prev,
        [id]: {
          selected: willSelect,
          correctionValue: cur?.correctionValue ?? "",
          selectionCorrect: null,
          correctionCorrect: null,
          result: null,
          attempts: cur?.attempts ?? 0,
          hintUsed: cur?.hintUsed ?? false,
          positionRevealed: cur?.positionRevealed ?? false,
          answerRevealed: cur?.answerRevealed ?? false,
          hintText: cur?.hintText,
          revealedCorrection: cur?.revealedCorrection,
          categoryFeedback: cur?.categoryFeedback,
        },
      };
      persist(next, revision);
      return next;
    });
  }

  function setCorrection(id: string, value: string) {
    if (stageDone || states[id]?.result === "correct_selection_and_correction") {
      return;
    }
    setCanCompleteServer(false);
    setStates((prev) => {
      const cur = prev[id];
      if (!cur?.selected) return prev;
      const next = {
        ...prev,
        [id]: {
          ...cur,
          correctionValue: value,
          selectionCorrect: null,
          correctionCorrect: null,
          result: null,
        },
      };
      persist(next, revision);
      return next;
    });
  }

  async function grade() {
    if (!passage || stageDone) return;
    setBusy(true);
    setMessage(null);
    const answers: Record<
      string,
      { selected: boolean; correctionValue: string }
    > = {};
    for (const [id, st] of Object.entries(states)) {
      answers[id] = {
        selected: st.selected,
        correctionValue: st.correctionValue,
      };
    }
    const result = await gradeStage7Action({
      assignmentStudentId,
      passageId: passage.id,
      answers,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setMessage(result.message);
    if ("canComplete" in result) {
      setCanCompleteServer(Boolean(result.canComplete));
    }
  }

  async function handleComplete() {
    if (!passage) return;
    setBusy(true);
    const result = await completeStage7Action({
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
    onStage7Completed?.();
  }

  const selectedList = candidates.filter((c) => states[c.id]?.selected);
  const exactFixCount = Object.values(states).filter(
    (s) => s.result === "correct_selection_and_correction"
  ).length;

  const metaBits = [
    [passage?.school_level, passage?.grade].filter(Boolean).join(" · "),
    passage?.source || passage?.exam_name,
    passage?.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  if (loading) {
    return (
      <p className="rounded-xl border bg-white p-6 text-sm text-slate-600">
        7단계 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <p className="font-semibold">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorCode === "stage6_required" && (
            <Button type="button" onClick={() => onGoStage6?.()}>
              6단계로 이동
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => void reload()}>
            다시 시도
          </Button>
          <Link href="/student/exam-prep" className="rounded-lg border px-4 py-2">
            이전 화면
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 7단계 · 어색한 곳 찾아 고쳐 쓰기
          <span className="ml-2 text-slate-500">(7 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">{guideText}</p>
        <p className="mt-2 text-xs text-slate-500">
          어색한 곳 선택: {selectedCount} / {requiredCount} · 정확히 고쳐 쓴
          항목: {exactFixCount} / {requiredCount}
        </p>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900">
        {sentences.map((s, idx) => {
          const sCands = candidates
            .filter((c) => c.sentenceId === s.id)
            .sort((a, b) => a.displayStart - b.displayStart);
          const slots = buildDisplayWithCandidateSlots(
            s.display_text,
            sCands.map((c) => ({
              id: c.id,
              english_start: c.displayStart,
              english_end: c.displayEnd,
            }))
          );
          const prev = sentences[idx - 1];
          const showBreak =
            s.is_paragraph_start ||
            (prev && prev.paragraph_number !== s.paragraph_number);
          return (
            <span key={s.id}>
              {showBreak && idx > 0 ? <br /> : null}
              {showBreak && idx > 0 ? <br /> : null}
              {slots.map((seg, i) => {
                if (seg.type === "text") {
                  return <span key={`${s.id}-t-${i}`}>{seg.text}</span>;
                }
                const cand = sCands.find((c) => c.id === seg.id)!;
                const st = states[cand.id];
                const selected = Boolean(st?.selected);
                const num = selectedList.findIndex((c) => c.id === cand.id) + 1;
                return (
                  <button
                    key={cand.id}
                    type="button"
                    disabled={stageDone}
                    onClick={() => toggleCandidate(cand.id)}
                    className={`mx-0.5 inline-flex min-h-[28px] items-center rounded px-0.5 underline decoration-2 underline-offset-4 ${
                      selected
                        ? "bg-rose-100 font-semibold text-rose-900 decoration-rose-600"
                        : "decoration-slate-400 hover:bg-slate-50"
                    }`}
                    aria-pressed={selected}
                    aria-label={`밑줄 후보 ${cand.displayedText}${
                      selected ? ", 선택됨" : ""
                    }`}
                  >
                    {cand.displayedText}
                    {selected && num > 0 && (
                      <sup className="ml-0.5 text-[10px]">({num})</sup>
                    )}
                  </button>
                );
              })}{" "}
            </span>
          );
        })}
      </article>

      {selectedList.length > 0 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            선택한 어색한 부분 {selectedCount} / {requiredCount}
          </h3>
          {selectedList.map((cand, idx) => {
            const st = states[cand.id];
            const locked =
              stageDone ||
              st?.result === "correct_selection_and_correction";
            return (
              <div key={cand.id} className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-medium text-rose-800">
                  ({idx + 1}) {cand.displayedText} →
                </p>
                <input
                  ref={(el) => {
                    inputRefs.current[cand.id] = el;
                  }}
                  type="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={locked}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                  value={st?.correctionValue ?? ""}
                  onChange={(e) => setCorrection(cand.id, e.target.value)}
                  placeholder="알맞게 고쳐 쓰세요"
                />
                {st?.result && (
                  <p className="mt-2 text-xs text-slate-700">
                    {resultLabelKo(st.result)}
                  </p>
                )}
                {st?.categoryFeedback && (
                  <p className="mt-1 text-xs text-amber-800">
                    {st.categoryFeedback}
                  </p>
                )}
                {st?.hintText && (
                  <p className="mt-1 text-xs text-slate-600">
                    힌트: {st.hintText}
                  </p>
                )}
                {st?.revealedCorrection && (
                  <p className="mt-1 text-xs text-slate-700">
                    정답 확인: {st.revealedCorrection}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(st?.attempts ?? 0) >=
                    STAGE7_DEFAULT_THRESHOLDS.hintAfterWrong &&
                    !st?.hintUsed &&
                    st?.result !== "correct_selection_and_correction" && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          const r = await requestStage7HintAction({
                            assignmentStudentId,
                            candidateId: cand.id,
                          });
                          setBusy(false);
                          if (r.ok) applyProgress(r.progress);
                          else setMessage(r.message);
                        }}
                      >
                        힌트
                      </Button>
                    )}
                  {(st?.attempts ?? 0) >=
                    STAGE7_DEFAULT_THRESHOLDS.answerRevealAfterWrong &&
                    !st?.answerRevealed && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          const r = await requestStage7RevealAction({
                            assignmentStudentId,
                            candidateId: cand.id,
                            mode: "answer",
                          });
                          setBusy(false);
                          if (r.ok) {
                            applyProgress(r.progress);
                            setMessage(
                              "정답을 확인했습니다. 직접 다시 선택·입력하세요."
                            );
                          } else setMessage(r.message);
                        }}
                      >
                        정답 확인
                      </Button>
                    )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">7단계 학습을 완료했습니다.</p>
          <p className="mt-1">다음 단계는 준비 중입니다.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || stageDone} onClick={() => void grade()}>
          채점하기
        </Button>
        <Button
          type="button"
          disabled={
            !(fullyCorrect || canCompleteServer) || stageDone || busy
          }
          onClick={() => void handleComplete()}
        >
          7단계 학습 완료
        </Button>
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
