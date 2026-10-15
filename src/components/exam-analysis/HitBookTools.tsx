"use client";

import Link from "next/link";
import { useEffect } from "react";

/** 적중 자료집 위 단추 + 넘치는 쪽 줄이기 */
export function HitBookTools({ backHref }: { backHref?: string }) {
  useEffect(() => {
    // 한 장에 넘치면 글씨·카드를 조금씩 줄인다(f1 → f4)
    const fit = () => {
      for (const pg of document.querySelectorAll<HTMLElement>(".hb .pg.item")) {
        pg.classList.remove("f1", "f2", "f3", "f4");
        for (const c of ["f1", "f2", "f3", "f4"]) {
          if (pg.scrollHeight <= pg.clientHeight + 1) break;
          pg.classList.add(c);
        }
      }
    };
    void document.fonts.ready.then(fit);
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
