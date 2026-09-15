"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** 학원 크레딧 잔액. refreshKey가 바뀌면(예: 화면 이동) 다시 읽는다. */
export function useCreditBalance(refreshKey?: string): number | null {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/credits?balanceOnly=1", {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          ok?: boolean;
          wallet?: { balance?: number };
        };
        if (cancelled || !json.ok) return;
        const n = json.wallet?.balance;
        setBalance(typeof n === "number" ? n : 0);
      } catch {
        if (!cancelled) setBalance((prev) => prev ?? 0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return balance;
}

export function HeaderCreditsBadge({ href }: { href: string }) {
  const balance = useCreditBalance();
  const loading = balance === null;

  return (
    <Link
      href={href}
      prefetch={false}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition sm:text-sm ${
        !loading && balance! <= 0
          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200/80"
          : "bg-slate-100 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200/80"
      }`}
      title="크레딧 내역 보기"
    >
      <span className="hidden text-[11px] font-medium text-slate-500 sm:inline">
        크레딧
      </span>
      {loading ? (
        <span className="inline-block h-3.5 w-8 animate-pulse rounded bg-slate-300/80" />
      ) : (
        balance!.toLocaleString("ko-KR")
      )}
    </Link>
  );
}
