"use client";

import Link from "next/link";
import { useEffect } from "react";

/** 적중 자료집 위 단추 + 넘치는 쪽 줄이기 */
export function HitBookTools({ backHref }: { backHref?: string }) {
  useEffect(() => {
    /*
     * 한 장(A4)에 넘치면 차례로 줄인다 — 지문 글씨(f1~f4), 그래도 넘치면 우리 자료 카드를 빼고(f5), 더 줄인다(f6).
     * 선생님 지적(2026-10-15): 인쇄하면 A4 아래가 잘린다. 카드 상자는 남은 높이만 쓰므로 넘치는 것은 시험 문제 쪽이다.
     */
    const LEVELS = ["f1", "f2", "f3", "f4", "f5", "f6"];
    const over = (pg: HTMLElement) =>
      pg.scrollHeight > pg.clientHeight + 1 ||
      [...pg.querySelectorAll<HTMLElement>(".leadbox")].some((b) => b.offsetHeight > 0 && b.offsetHeight < 60);
    const fit = () => {
      for (const pg of document.querySelectorAll<HTMLElement>(".hb .pg.item")) {
        pg.classList.remove(...LEVELS);
        for (const c of LEVELS) {
          if (!over(pg)) break;
          pg.classList.add(c);
        }
      }
    };
    void document.fonts.ready.then(fit);
    window.addEventListener("beforeprint", fit);
    return () => window.removeEventListener("beforeprint", fit);
  }, []);
  return (
    <div className="hb-tools print:hidden">
      {backHref ? (
        <Link href={backHref} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold leading-9 text-slate-700">
          ← 분석 보고서로
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => window.print()}
        className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white"
      >
        인쇄 · PDF로 저장
      </button>
    </div>
  );
}
