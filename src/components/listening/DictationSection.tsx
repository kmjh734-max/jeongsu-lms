"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  onPassed: () => void;
  /** 객관식 풀이 중 백그라운드로 받아 둔 데이터 */
  prefetched?: DictationStartPayloadClient | null;
}

export function DictationSection({
  setId,
  questionId,
  audioUrl,
  passScore,
  enabled,
  onPassed,
  prefetched,
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

  const labelById = useCallback(() => {
    const map = new Map<string, string>();
    for (const b of blankInputs) map.set(b.id, b.label);
    return map;
  }, [blankInputs]);

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

      const url = opts?.retry
        ? "/api/listening/dictation/generate"
        : "/api/listening/dictation/start";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, questionId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
      } & Partial<DictationStartPayloadClient>;

      if (gen !== loadGeneration.current) return;

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
    },
    [enabled, setId, questionId]
  );

  useEffect(() => {
    if (!enabled) return;
    void loadBlanks({ prefetchedPayload: prefetched ?? null });
  }, [enabled, questionId, prefetched, loadBlanks]);

  async function handleSubmit() {
    if (!attemptId) return;
    const missing = blankInputs.some((b) => !answers[b.id]?.trim());
    if (missing) {
      setError("모든 빈칸에 답을 입력하세요.");
      return;
    }

    setUiState("submitting");
    setError(null);
    const res = await fetch("/api/listening/dictation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, studentAnswers: answers }),
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

    setScore(data.score ?? 0);
    setResults(data.results ?? []);
    if (data.passed) {
      setUiState("submitted_pass");
      onPassed();
    } else {
      setUiState("submitted_fail");
    }
  }

  async function handleRetry() {
    await loadBlanks({ retry: true });
  }

  const labels = labelById();

  if (!enabled) return null;

  return (
    <section className="mt-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <h3 className="text-sm font-semibold text-violet-900">Dictation</h3>
      <p className="mt-1 text-xs text-violet-800">
        이제 들은 내용을 바탕으로 Dictation을 진행합니다. 빈칸마다 들은 단어
        하나만 입력하세요. {passScore}점 이상이면 다음 문제로 넘어갈 수
        있습니다.
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
                  <p key={i} className="font-mono text-sm leading-relaxed text-slate-900">
                    <span className="mr-2 font-semibold text-violet-700">
                      {line.speaker}:
                    </span>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>

            {blankInputs.length === 0 && (
              <p className="text-sm text-amber-800">
                빈칸을 불러오지 못했습니다. 잠시 후 「다시 하기」를 누르거나 선생님에게
                문의하세요.
              </p>
            )}

            {blankInputs.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-600">빈칸 입력</p>
                {blankInputs.map((blank) => (
                  <div key={blank.id} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-center text-sm font-semibold text-violet-700">
                      {blank.label}
                    </span>
                    <input
                      type="text"
                      value={answers[blank.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [blank.id]: e.target.value }))
                      }
                      disabled={
                        uiState === "submitting" ||
                        uiState === "submitted_pass" ||
                        uiState === "submitted_fail"
                      }
                      className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="단어 하나 (영어)"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                ))}
              </div>
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
                <ul className="mt-3 space-y-2">
                  {results.map((r) => (
                    <li
                      key={r.id}
                      className={`rounded border px-2 py-1.5 text-xs ${
                        r.isCorrect
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <span className="font-medium">{labels.get(r.id) ?? ""}</span>
                      <br />
                      내 답: {r.studentAnswer || "—"} · 정답: {r.correctAnswer} ·{" "}
                      {r.feedback} ({r.blankScore}점)
                    </li>
                  ))}
                </ul>
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
