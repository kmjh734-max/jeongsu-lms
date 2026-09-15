"use client";

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
