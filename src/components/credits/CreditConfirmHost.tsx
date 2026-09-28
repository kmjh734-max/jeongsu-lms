"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialSample } from "@/components/credits/MaterialSample";
import {
  setCreditConfirmListener,
  setCreditConfirmSkipped,
  type CreditConfirmRequest,
} from "@/lib/credits/confirm-store";

type Pending = CreditConfirmRequest & { resolve: (ok: boolean) => void };

type Quote = {
  lines: Array<{ feature: string; label: string; unitCost: number; quantity: number; cost: number }>;
  total: number;
  balance: number;
  after: number;
  enough: boolean;
  canCharge: boolean;
};

const won = (n: number) => n.toLocaleString("ko-KR");

/**
 * "만들까요?" 창. 학원·선생님 화면에 하나만 떠 있고, 크레딧이 나가는 곳이면 어디서든 부른다.
 *
 * 선생님 요청(2026-09-28): 제작을 누르면 곧바로 만들어져 크레딧이 나가 버린다.
 * 잘못 눌러도 되돌릴 수 없으니, 견본과 드는 값을 보여 주고 한 번 더 묻는다.
 * 견본은 값이 들지 않는 고정 예시다(진짜로 만들어 보여 주면 그게 곧 생성이다).
 */
export function CreditConfirmHost({ chargeHref }: { chargeHref: string }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCreditConfirmListener((req) => setPending(req as Pending | null));
    return () => setCreditConfirmListener(null);
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      if (ok && skip) setCreditConfirmSkipped(true);
      pending?.resolve(ok);
      setPending(null);
      setQuote(null);
      setSkip(false);
    },
    [pending, skip]
  );

  useEffect(() => {
    if (!pending) return;
    let alive = true;
    setLoading(true);
    setQuote(null);
    void fetch("/api/credits/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: pending.items }),
    })
      .then((r) => r.json())
      .then((body: Quote & { ok?: boolean }) => {
        if (!alive) return;
        if (body?.ok) setQuote(body);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, close]);

  if (!pending) return null;

  const total = quote?.total ?? 0;
  const free = !loading && quote !== null && total === 0;
  const blocked = quote !== null && !quote.enough;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-confirm-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0 flex-grow">
            <h2 id="credit-confirm-title" className="text-lg font-extrabold tracking-tight text-slate-900">
              {pending.title}을(를) 만들까요?
            </h2>
            {pending.subject ? <p className="mt-1 text-[13px] text-slate-500">{pending.subject}</p> : null}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => close(false)}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex min-h-0 flex-grow flex-col gap-6 overflow-y-auto px-6 py-5 sm:flex-row">
          {pending.sample ? (
            <div className="flex flex-shrink-0 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">예시</span>
                <span className="text-[11.5px] text-slate-500">모양을 보여 주는 견본입니다</span>
              </div>
              <MaterialSample kind={pending.sample} />
            </div>
          ) : null}

          <div className="flex min-w-0 flex-grow flex-col gap-4">
            {pending.description ? (
              <p className="text-[13px] leading-[1.75] text-slate-600">{pending.description}</p>
            ) : null}

            {pending.contents?.length ? (
              <div>
                <div className="text-[11.5px] font-bold tracking-wide text-slate-500">들어가는 것</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pending.contents.map((c) => (
                    <span key={c} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] text-slate-500">
                드는 크레딧을 확인하고 있어요…
              </div>
            ) : free ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13px] font-semibold text-emerald-800">
                이 작업은 크레딧이 들지 않습니다.
              </div>
            ) : quote ? (
              <div className={`flex flex-col gap-2.5 rounded-xl border-2 px-4 py-4 ${blocked ? "border-rose-300 bg-rose-50" : "border-amber-300 bg-amber-50"}`}>
                <div className="flex items-center gap-2">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={blocked ? "#9f1239" : "#b45309"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  </svg>
                  <span className={`text-[13px] font-bold ${blocked ? "text-rose-900" : "text-amber-900"}`}>
                    {blocked ? "크레딧이 모자랍니다" : "만들면 크레딧이 나갑니다"}
                  </span>
                </div>

                {quote.lines.map((l) => (
                  <div key={l.feature} className="flex justify-between text-[12.5px] text-amber-900">
                    <span>
                      {l.label}
                      {l.quantity > 1 ? ` × ${l.quantity}` : ""}
                    </span>
                    <span className="tabular-nums">{won(l.cost)}</span>
                  </div>
                ))}

                <div className={`flex justify-between border-t pt-2 text-[13px] font-bold ${blocked ? "border-rose-200 text-rose-900" : "border-amber-200 text-amber-900"}`}>
                  <span>이번에 드는 크레딧</span>
                  <span className="tabular-nums text-[15px]">{won(total)}</span>
                </div>
                <div className={`flex justify-between text-[12.5px] ${blocked ? "text-rose-800" : "text-amber-800"}`}>
                  <span>남은 크레딧</span>
                  <span className="tabular-nums">
                    {won(quote.balance)} → {won(quote.after)}
                  </span>
                </div>
                <p className={`text-[11.5px] leading-[1.65] ${blocked ? "text-rose-800" : "text-amber-800"}`}>
                  {blocked
                    ? quote.canCharge
                      ? "충전한 뒤에 만들 수 있습니다."
                      : "원장님께 충전을 요청해 주세요."
                    : "한 번 만들면 되돌릴 수 없습니다. 지문과 자료 종류가 맞는지 확인해 주세요."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] text-slate-500">
                드는 크레딧을 확인하지 못했습니다. 만들면 남은 크레딧에서 나갑니다.
              </div>
            )}

            {!blocked && !free ? (
              <div className="flex items-center gap-2">
                <input
                  id="credit-confirm-skip"
                  type="checkbox"
                  checked={skip}
                  onChange={(e) => setSkip(e.target.checked)}
                  className="h-4 w-4 accent-violet-600"
                />
                <label htmlFor="credit-confirm-skip" className="text-[12.5px] text-slate-500">
                  다음부터 이 확인 창을 건너뛰기
                </label>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => close(false)}
            className="inline-flex h-12 items-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          {blocked ? (
            quote?.canCharge ? (
              <Link
                href={chargeHref}
                onClick={() => close(false)}
                className="inline-flex h-12 items-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white hover:bg-violet-700"
              >
                충전하러 가기
              </Link>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => close(true)}
              disabled={loading}
              className="inline-flex h-12 items-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {free ? "만들기" : `${won(total)} 크레딧으로 만들기`}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
