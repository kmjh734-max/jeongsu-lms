"use client";

import { useCallback, useEffect, useState } from "react";
import type { DictationBlankItemClient } from "@/lib/listening/dictation/types";
import type { DictationBlankScoreResult } from "@/lib/listening/dictation/types";

type DictationUiState =
  | "idle"
  | "loading"
  | "ready"
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
}

export function DictationSection({
  setId,
  questionId,
  audioUrl,
  passScore,
  enabled,
  onPassed,
}: DictationSectionProps) {
  const [uiState, setUiState] = useState<DictationUiState>("idle");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [blankItems, setBlankItems] = useState<DictationBlankItemClient[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<DictationBlankScoreResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const loadBlanks = useCallback(async () => {
    if (!enabled) return;
    setUiState("loading");
    setError(null);
    setResults([]);
    setScore(null);

    const res = await fetch("/api/listening/dictation/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questionId }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      attemptId?: string;
      blankItems?: DictationBlankItemClient[];
    };

    if (!data.ok || !data.attemptId || !data.blankItems?.length) {
      setError(data.message ?? "Dictation을 불러오지 못했습니다.");
      setUiState("idle");
      return;
    }

    setAttemptId(data.attemptId);
    setBlankItems(data.blankItems);
    setAnswers({});
    setUiState("ready");
  }, [enabled, setId, questionId]);

  useEffect(() => {
    if (enabled && uiState === "idle") {
      void loadBlanks();
    }
  }, [enabled, uiState, loadBlanks]);

  async function handleSubmit() {
    if (!attemptId) return;
    const missing = blankItems.some((b) => !answers[b.id]?.trim());
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
    setUiState("idle");
    await loadBlanks();
  }

  if (!enabled) return null;

  return (
    <section className="mt-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <h3 className="text-sm font-semibold text-violet-900">Dictation</h3>
      <p className="mt-1 text-xs text-violet-800">
        이제 들은 내용을 바탕으로 Dictation을 진행합니다. 빈칸에 들은 단어를
        입력하세요. {passScore}점 이상이면 다음 문제로 넘어갈 수 있습니다.
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
        <p className="mt-4 text-sm text-violet-700">Dictation 문항 준비 중…</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {(uiState === "ready" ||
        uiState === "submitting" ||
        uiState === "submitted_pass" ||
        uiState === "submitted_fail") &&
        blankItems.length > 0 && (
          <div className="mt-4 space-y-4">
            {blankItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-violet-100 bg-white p-3">
                <p className="font-mono text-sm text-slate-900">{item.display_sentence}</p>
                <label className="mt-2 block text-xs text-slate-500">
                  {item.id}
                  <input
                    type="text"
                    value={answers[item.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    disabled={
                      uiState === "submitting" ||
                      uiState === "submitted_pass" ||
                      uiState === "submitted_fail"
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    placeholder="영어로 입력"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
              </div>
            ))}

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
                        r.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <span className="font-medium">{r.id}</span>
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
                onClick={handleRetry}
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
