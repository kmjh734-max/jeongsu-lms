"use client";

import { useEffect, useState } from "react";

/** 화면을 옮길 때마다 묻지 않도록 잠시 기억해 둔다(쓰면 곧 줄어드니 짧게). */
const CACHE_MS = 30_000;
let balanceCache: { at: number; value: number } | null = null;

/** 기능을 쓴 뒤 곧바로 다시 읽게 할 때 부른다. */
export function invalidateCreditBalance() {
  balanceCache = null;
}

/**
 * 학원 크레딧 잔액. refreshKey가 바뀌면(예: 화면 이동) 다시 읽되 30초 안에는 기억한 값을 쓴다.
 * enabled=false(학생 등)면 아예 묻지 않는다.
 */
export function useCreditBalance(refreshKey?: string, enabled = true): number | null {
  const [balance, setBalance] = useState<number | null>(() =>
    enabled && balanceCache ? balanceCache.value : null
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async (force: boolean) => {
      if (!force && balanceCache && Date.now() - balanceCache.at < CACHE_MS) {
        setBalance(balanceCache.value);
        return;
      }
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
        const value = typeof n === "number" ? n : 0;
        balanceCache = { at: Date.now(), value };
        setBalance(value);
      } catch {
        if (!cancelled) setBalance((prev) => prev ?? 0);
      }
    };
    void load(false);
    // 다른 탭에서 쓰고 돌아왔을 때는 새로 읽는다
    const onFocus = () => void load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshKey, enabled]);

  return enabled ? balance : null;
}
