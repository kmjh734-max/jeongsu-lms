"use client";

import { useState } from "react";

const REASONS = {
  listening: ["정답이 이상해요", "음성이 이상해요", "그림이 이상해요", "기타"],
  vocab: ["뜻·해석이 이상해요", "예문이 이상해요", "기타"],
} as const;

/**
 * "이상해요" 신고 버튼 — 학생·선생님이 문항·단어의 오류를 알리면 슈퍼관리자 화면에 모인다.
 */
export function ReportProblemButton({
  kind,
  setId,
  targetId,
  targetLabel,
}: {
  kind: "listening" | "vocab";
  setId?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<{ busy: boolean; done: string | null; error: string | null }>({
    busy: false,
    done: null,
    error: null,
  });

  async function send() {
    if (!reason) return;
    setState({ busy: true, done: null, error: null });
    try {
      const res = await fetch("/api/content-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, setId, targetId, targetLabel, reason, message }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!data.ok) throw new Error(data.message ?? "보내지 못했어요.");
      setState({ busy: false, done: data.message ?? "보냈어요.", error: null });
      setTimeout(() => {
        setOpen(false);
        setReason("");
        setMessage("");
        setState({ busy: false, done: null, error: null });
      }, 1800);
    } catch (e) {
      setState({ busy: false, done: null, error: e instanceof Error ? e.message : "보내지 못했어요." });
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 22V4a1 1 0 0 1 1-1h11l-2 4 2 4H5" />
        </svg>
        이상해요
      </button>
      {open ? (
        <div
          className="absolute right-0 z-40 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {state.done ? (
            <p className="py-2 text-sm font-semibold text-emerald-700">{state.done}</p>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-900">무엇이 이상한가요?</p>
              <div className="mt-2 flex flex-col gap-1">
                {REASONS[kind].map((r) => (
                  <label key={r} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50">
                    <input type="radio" name={`report-${kind}`} checked={reason === r} onChange={() => setReason(r)} />
                    {r}
                  </label>
                ))}
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="자세히 적어 주면 더 빨리 고칠 수 있어요(선택)"
                className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand-500"
              />
              {state.error ? <p className="mt-1 text-xs text-rose-700">{state.error}</p> : null}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-md px-3 text-xs text-slate-500 hover:bg-slate-50">
                  닫기
                </button>
                <button
                  type="button"
                  disabled={!reason || state.busy}
                  onClick={() => void send()}
                  className="h-8 rounded-md bg-brand-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {state.busy ? "보내는 중…" : "보내기"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
