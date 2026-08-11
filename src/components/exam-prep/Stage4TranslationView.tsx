"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage4Action,
  loadStage4StudentDataAction,
  revealStage4ModelAction,
  saveStage4DraftAction,
  submitStage4AllAction,
  submitStage4SentenceAction,
} from "@/lib/exam-prep/stage4-actions";
import {
  STAGE4_DEFAULTS,
  isBlankOrWhitespace,
  type ExamStage4Progress,
  type Stage4SentenceAnswerState,
} from "@/lib/exam-prep/stage4-types";

type SentencePublic = {
  id: string;
  sentence_order: number;
  english_text: string;
  isRequired: boolean;
  minimumPassScore: number;
};

export function Stage4TranslationView({
  assignmentStudentId,
  stepId,
  onGoStage3,
  canStartStage5 = false,
  onStartStage5,
  onStage4Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage3?: () => void;
  canStartStage5?: boolean;
  onStartStage5?: () => void;
  onStage4Completed?: () => void;
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
  const [sentences, setSentences] = useState<SentencePublic[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [states, setStates] = useState<
    Record<string, Stage4SentenceAnswerState>
  >({});
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("임시 저장됨");
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localBackup = useRef<Record<string, string>>({});

  const required = useMemo(
    () => sentences.filter((s) => s.isRequired),
    [sentences]
  );
  const passedCount = required.filter((s) => states[s.id]?.isPass).length;
  const allPassed = required.length > 0 && passedCount === required.length;

  const applyProgress = useCallback((progress: ExamStage4Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision);
    setStageDone(Boolean(progress.completed_at));
    const nextDrafts: Record<string, string> = {};
    const nextStates: Record<string, Stage4SentenceAnswerState> = {};
    for (const [id, st] of Object.entries(progress.answers ?? {})) {
      nextDrafts[id] = st.value ?? "";
      nextStates[id] = st;
    }
    setDrafts((prev) => ({ ...prev, ...nextDrafts }));
    setStates(nextStates);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadStage4StudentDataAction({ assignmentStudentId });
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
    setSentences(result.sentences as SentencePublic[]);
    applyProgress(result.progress);
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persistDraft = useCallback(
    (next: Record<string, string>, rev: number) => {
      if (!passage || stageDone) return;
      localBackup.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("저장 중");
      debounceRef.current = setTimeout(async () => {
        const result = await saveStage4DraftAction({
          assignmentStudentId,
          passageId: passage.id,
          answers: next,
          expectedRevision: rev,
        });
        if (result.ok && result.progress) {
          setRevision(result.progress.revision);
          setSaveStatus("임시 저장됨");
        } else {
          setSaveStatus("저장 실패 · 로컬에 보관됨");
          setMessage(result.ok ? null : result.message);
        }
      }, 800);
    },
    [assignmentStudentId, passage, stageDone]
  );

  function setDraft(sentenceId: string, value: string) {
    if (stageDone || states[sentenceId]?.status === "passed") return;
    setDrafts((prev) => {
      const next = { ...prev, [sentenceId]: value };
      persistDraft(next, revision);
      return next;
    });
  }

  async function submitOne(sentenceId: string) {
    if (!passage) return;
    const text = drafts[sentenceId] ?? "";
    if (isBlankOrWhitespace(text)) {
      setMessage("공백만 있는 답안은 제출할 수 없습니다.");
      return;
    }
    if (
      !confirm(
        "작성한 해석을 제출하시겠습니까?\n제출 후에는 피드백을 확인할 수 있습니다."
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await submitStage4SentenceAction({
      assignmentStudentId,
      passageId: passage.id,
      sentenceId,
      answerText: text,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.progress) applyProgress(result.progress);
    setMessage(result.message);
  }

  async function submitAll() {
    if (!passage) return;
    const payload: Record<string, string> = {};
    for (const s of required) {
      const t = drafts[s.id] ?? "";
      if (isBlankOrWhitespace(t)) {
        setMessage(`${s.sentence_order}번 문장 해석을 입력해 주세요.`);
        return;
      }
      if (states[s.id]?.status === "passed") continue;
      payload[s.id] = t;
    }
    if (Object.keys(payload).length === 0) {
      setMessage("제출할 문장이 없습니다.");
      return;
    }
    if (
      !confirm(
        "작성한 해석을 제출하시겠습니까?\n제출 후에는 피드백을 확인할 수 있습니다."
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await submitStage4AllAction({
      assignmentStudentId,
      passageId: passage.id,
      answers: payload,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    await reload();
    setMessage("전체 제출이 완료되었습니다.");
  }

  async function handleComplete() {
    if (!passage || !allPassed) return;
    setBusy(true);
    const result = await completeStage4Action({
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
    onStage4Completed?.();
  }

  const metaBits = [
    [passage?.school_level, passage?.grade].filter(Boolean).join(" · "),
    passage?.source || passage?.exam_name,
    passage?.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  if (loading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
        3단계 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <p className="font-semibold">{error}</p>
        <div className="flex flex-wrap gap-2">
          {errorCode === "stage3_required" && (
            <Button type="button" onClick={() => onGoStage3?.()}>
              3단계로 이동
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
          현재 단계: 3단계 · 해석 연습하기
          <span className="ml-2 text-slate-500">(3 / 10)</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          영어 문장을 읽고 자연스러운 우리말 해석을 써 보세요.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {required.length}문장 중 {passedCount}문장 통과 · {saveStatus}
        </p>
      </header>

      <div className="space-y-4">
        {sentences.map((s) => {
          const st = states[s.id];
          const locked = stageDone || st?.status === "passed";
          return (
            <article
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold text-slate-400">
                {s.sentence_order}.
                {s.isRequired ? "" : " (선택)"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-900">
                {s.english_text}
              </p>
              <textarea
                className="mt-3 min-h-[6rem] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
                value={drafts[s.id] ?? ""}
                disabled={locked}
                placeholder="자연스러운 우리말 해석을 입력하세요"
                onChange={(e) => setDraft(s.id, e.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{(drafts[s.id] ?? "").trim().length}자</span>
                {st?.status && <span>상태: {st.status}</span>}
                {st?.latestScore != null && (
                  <span>
                    점수 {st.latestScore}
                    {st.isPass ? " · 통과" : ""}
                  </span>
                )}
              </div>

              {st && st.status !== "draft" && (
                <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  {st.overallFeedback && (
                    <p>
                      <span className="font-medium">총평: </span>
                      {st.overallFeedback}
                    </p>
                  )}
                  {st.naturalnessFeedback && (
                    <p className="text-slate-600">{st.naturalnessFeedback}</p>
                  )}
                  {(st.meaningResults ?? []).map((m) => (
                    <p key={m.meaningPointId} className="text-xs text-slate-700">
                      [{m.status}] {m.feedback} ({m.earnedScore}점)
                    </p>
                  ))}
                  {(st.missingMeanings ?? []).map((m) => (
                    <p key={m} className="text-xs text-amber-800">
                      빠진 의미: {m}
                    </p>
                  ))}
                  {(st.mistranslations ?? []).map((m) => (
                    <p key={m} className="text-xs text-rose-700">
                      오역: {m}
                    </p>
                  ))}
                  {st.revealedModelTranslation && (
                    <p className="text-xs text-emerald-800">
                      모범 해석: {st.revealedModelTranslation}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy || locked}
                  onClick={() => void submitOne(s.id)}
                >
                  이 문장 제출
                </Button>
                {st &&
                  !st.isPass &&
                  st.attempts >= STAGE4_DEFAULTS.revealAfterAttempts &&
                  !st.modelTranslationRevealed && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        void revealStage4ModelAction({
                          assignmentStudentId,
                          sentenceId: s.id,
                        }).then((r) => {
                          if (!r.ok) setMessage(r.message);
                          else if (r.progress) applyProgress(r.progress);
                        })
                      }
                    >
                      모범 해석 확인
                    </Button>
                  )}
                {st && st.status === "needs_retry" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy || stageDone}
                    onClick={() => {
                      setStates((prev) => ({
                        ...prev,
                        [s.id]: {
                          ...prev[s.id]!,
                          status: "draft",
                          isPass: false,
                        },
                      }));
                    }}
                  >
                    다시 풀기
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">3단계 학습을 완료했습니다.</p>
          {canStartStage5 ? (
            <p className="mt-1">
              4단계 「동사형 연습하기」를 시작할 수 있습니다.
            </p>
          ) : (
            <p className="mt-1">
              4단계가 아직 공개되지 않았거나 준비 중입니다.
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link
          href="/student/exam-prep"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          이전 화면
        </Link>
        <Button
          type="button"
          variant="secondary"
          disabled={busy || stageDone}
          onClick={() => void submitAll()}
        >
          전체 해석 제출하기
        </Button>
        <Button
          type="button"
          disabled={!allPassed || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          3단계 학습 완료
        </Button>
        {stageDone && canStartStage5 && (
          <Button type="button" onClick={() => onStartStage5?.()}>
            4단계 시작하기
          </Button>
        )}
      </div>
    </div>
  );
}
