"use client";

import { DictationPassageLineView } from "@/components/listening/DictationPassageLine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DictationBlankInputClient,
  DictationPassageLineClient,
  DictationStartPayloadClient,
} from "@/lib/listening/dictation/types";
import type { DictationBlankScoreResult } from "@/lib/listening/dictation/types";

type DictationUiState =
  | "loading"
  | "ready"
  | "error"
  | "submitting"
  | "submitted_pass"
  | "submitted_fail";

interface DictationSectionProps {
  setId: string;
  questionId: string;
  audioUrl: string | null;
  passScore: number;
  enabled: boolean;
  onPassed: (score?: number) => void;
  prefetched?: DictationStartPayloadClient | null;
  /** 스케줄 일일 과제 — 통과 점수를 배정 기준으로 맞춤 */
  dailyTaskId?: string;
}

export function DictationSection({
  setId,
  questionId,
  audioUrl,
  passScore,
  enabled,
  onPassed,
  prefetched,
  dailyTaskId,
}: DictationSectionProps) {
  const [uiState, setUiState] = useState<DictationUiState>(
    prefetched?.attemptId ? "ready" : "loading"
  );
  const [attemptId, setAttemptId] = useState<string | null>(
    prefetched?.attemptId ?? null
  );
  const [passageLines, setPassageLines] = useState<DictationPassageLineClient[]>(
    prefetched?.passageLines ?? []
  );
  const [blankInputs, setBlankInputs] = useState<DictationBlankInputClient[]>(
    prefetched?.blanks ?? []
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<DictationBlankScoreResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const loadGeneration = useRef(0);
  const onPassedRef = useRef(onPassed);
  onPassedRef.current = onPassed;

  const resultsById = useMemo(() => {
    const map = new Map<string, DictationBlankScoreResult>();
    for (const r of results) map.set(r.id, r);
    return map;
  }, [results]);

  const allBlankIds = useMemo(() => {
    const ids: string[] = [];
    for (const line of passageLines) {
      for (const id of line.blankIds) ids.push(id);
    }
    if (ids.length === 0) return blankInputs.map((b) => b.id);
    return ids;
  }, [passageLines, blankInputs]);

  function applyPayload(payload: DictationStartPayloadClient) {
    setAttemptId(payload.attemptId);
    setPassageLines(payload.passageLines);
    setBlankInputs(payload.blanks);
    setAnswers({});
    setUiState("ready");
  }

  const loadBlanks = useCallback(
    async (opts?: { retry?: boolean; prefetchedPayload?: DictationStartPayloadClient | null }) => {
      if (!enabled) return;

      if (opts?.prefetchedPayload?.attemptId && !opts.retry) {
        if (!opts.prefetchedPayload.blanks?.length) {
          void loadBlanks({ retry: true });
          return;
        }
        applyPayload(opts.prefetchedPayload);
        return;
      }

      const gen = ++loadGeneration.current;
      setUiState("loading");
      setError(null);
      setResults([]);
      setScore(null);

      try {
        const url = opts?.retry
          ? "/api/listening/dictation/generate"
          : "/api/listening/dictation/start";

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, questionId, dailyTaskId }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          message?: string;
          alreadyPassed?: boolean;
          score?: number;
        } & Partial<DictationStartPayloadClient>;

        if (gen !== loadGeneration.current) return;

        if (data.ok && data.alreadyPassed) {
          onPassedRef.current(data.score);
          setUiState("submitted_pass");
          setScore(data.score ?? null);
          return;
        }

        if (!data.ok || !data.attemptId || !data.passageLines?.length) {
          setError(data.message ?? "Dictation을 불러오지 못했습니다.");
          setUiState("error");
          return;
        }

        const blanks = data.blanks ?? [];
        if (blanks.length === 0) {
          if (!opts?.retry) {
            await loadBlanks({ retry: true });
            return;
          }
          setError(data.message ?? "Dictation 빈칸을 불러오지 못했습니다.");
          setUiState("error");
          return;
        }

        applyPayload({
          attemptId: data.attemptId,
          passageLines: data.passageLines,
          blanks,
        });
      } catch (e) {
        if (gen !== loadGeneration.current) return;
        setError(
          e instanceof Error
            ? e.message
            : "Dictation을 불러오는 중 오류가 발생했습니다."
        );
        setUiState("error");
      }
    },
    [enabled, setId, questionId, dailyTaskId]
  );

  useEffect(() => {
    if (!enabled) return;
    void loadBlanks({ prefetchedPayload: prefetched ?? null });
  }, [enabled, questionId, prefetched, loadBlanks]);

  async function handleSubmit() {
    if (!attemptId) return;
    if (allBlankIds.length === 0) {
      setError("채점할 빈칸이 없습니다. 다시 하기를 눌러 주세요.");
      return;
    }

    setUiState("submitting");
    setError(null);
    const res = await fetch("/api/listening/dictation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        studentAnswers: answers,
        passScore,
        dailyTaskId,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      score?: number;
      passed?: boolean;
      results?: DictationBlankScoreResult[];
    };

    if (!data.ok) {
      setError(data.message ?? "제출 실패");
      setUiState("ready");
      return;
    }

    const scoreValue = data.score ?? 0;
    setScore(scoreValue);
    setResults(data.results ?? []);
    // UI 통과 기준(배정 점수)으로 한 번 더 확인
    const passedClient = scoreValue >= passScore;
    if (passedClient) {
      setUiState("submitted_pass");
      onPassed(scoreValue);
    } else {
      setUiState("submitted_fail");
    }
  }

  async function handleRetry() {
    await loadBlanks({ retry: true });
  }

  const inputDisabled =
    uiState === "submitting" ||
    uiState === "submitted_pass" ||
    uiState === "submitted_fail";
  const showResults =
    uiState === "submitted_pass" || uiState === "submitted_fail";

  if (!enabled) return null;

  return (
    <section className="mt-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <h3 className="text-sm font-semibold text-violet-900">Dictation</h3>
      <p className="mt-1 text-xs text-violet-800">
        지문의 빈칸에 들은 단어를 입력하세요. 모르는 빈칸은 비워 두어도 제출할 수
        있습니다. {passScore}점 이상이면 다음 문제로 넘어갈 수 있습니다.
      </p>

      {audioUrl && (
        <div className="mt-3 space-y-2">
          <audio
            key={`${audioUrl}-${playbackRate}`}
            controls
            src={audioUrl}
            className="w-full"
            preload="auto"
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = playbackRate;
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlaybackRate(0.8)}
              className={`rounded-md px-2 py-1 text-xs ${
                playbackRate === 0.8
                  ? "bg-violet-600 text-white"
                  : "border border-violet-300 text-violet-800"
              }`}
            >
              0.8x
            </button>
            <button
              type="button"
              onClick={() => setPlaybackRate(1)}
              className={`rounded-md px-2 py-1 text-xs ${
                playbackRate === 1
                  ? "bg-violet-600 text-white"
                  : "border border-violet-300 text-violet-800"
              }`}
            >
              1.0x
            </button>
          </div>
        </div>
      )}

      {uiState === "loading" && (
        <p className="mt-4 text-sm text-violet-700">Dictation 불러오는 중…</p>
      )}

      {error && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
          {uiState === "error" && (
            <button
              type="button"
              onClick={() => void loadBlanks()}
              className="rounded-lg border border-violet-400 bg-white px-3 py-1.5 text-xs font-medium text-violet-800"
            >
              다시 불러오기
            </button>
          )}
        </div>
      )}

      {(uiState === "ready" ||
        uiState === "submitting" ||
        uiState === "submitted_pass" ||
        uiState === "submitted_fail") &&
        passageLines.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-violet-100 bg-white p-3">
              <p className="mb-2 text-xs font-medium text-slate-500">대본</p>
              <div className="space-y-2">
                {passageLines.map((line, i) => (
                  <DictationPassageLineView
                    key={i}
                    line={line}
                    answers={answers}
                    onAnswerChange={(id, value) =>
                      setAnswers((prev) => ({ ...prev, [id]: value }))
                    }
                    disabled={inputDisabled}
                    resultsById={resultsById}
                    showResults={showResults}
                  />
                ))}
              </div>
            </div>

            {allBlankIds.length === 0 && (
              <p className="text-sm text-amber-800">
                빈칸을 불러오지 못했습니다. 「다시 하기」를 누르거나 선생님에게
                문의하세요.
              </p>
            )}

            {uiState === "ready" || uiState === "submitting" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uiState === "submitting"}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {uiState === "submitting" ? "채점 중…" : "Dictation 제출"}
              </button>
            ) : null}

            {score != null && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold text-slate-900">
                  점수: {score}점 / 100점 (통과 기준 {passScore}점)
                </p>
                {uiState === "submitted_fail" && (
                  <p className="mt-1 text-amber-800">
                    {passScore}점 미만입니다. 빈칸을 새로 바꾸어 다시 연습합니다.
                  </p>
                )}
                {uiState === "submitted_pass" && (
                  <p className="mt-1 text-emerald-700">
                    통과했습니다. 다음 문제로 이동할 수 있습니다.
                  </p>
                )}
                {showResults && results.some((r) => !r.isCorrect) && (
                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    {results
                      .filter((r) => !r.isCorrect)
                      .map((r) => (
                        <li key={r.id}>
                          정답: <span className="font-medium">{r.correctAnswer}</span>
                          {r.studentAnswer ? ` (입력: ${r.studentAnswer})` : ""}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {uiState === "submitted_fail" && (
              <button
                type="button"
                onClick={() => void handleRetry()}
                className="rounded-lg border border-violet-400 bg-white px-4 py-2 text-sm font-medium text-violet-800"
              >
                다시 하기 (빈칸 새로 생성)
              </button>
            )}
          </div>
        )}
    </section>
  );
}
