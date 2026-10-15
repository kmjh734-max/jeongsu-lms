"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { HitBookSummary } from "@/lib/exam-analysis/hit-book";

/**
 * 적중 자료집 — 보고서 화면의 상자 하나.
 *
 * 선생님 지시(2026-10-15): 「대조하기」와 「적중 자료집 보기」가 따로 놀고, 보기를 눌러야 일을 하는 것 같다.
 * 그래서 하나로 묶는다 — 「만들기」를 누르면 대조해 담고, 여기 요약을 띄우고, 「보기 · 인쇄」는 담아 둔 것을 연다.
 */
export function ExamHitBookPanel({ analysisId }: { analysisId: string }) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<HitBookSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(`/api/exam-analysis/${analysisId}/hit-book`)
      .then((r) => r.json())
      .then((j: { ok: boolean; summary?: HitBookSummary | null }) => {
        if (alive && j.ok) setSummary(j.summary ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [analysisId]);

  useEffect(() => {
    if (!busy) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  async function make() {
    setBusy(true);
    setMessage(null);
    try {
      const r = await fetch(`/api/exam-analysis/${analysisId}/hit-book`, { method: "POST" });
      const j = (await r.json()) as { ok: boolean; summary?: HitBookSummary; message?: string };
      if (!j.ok || !j.summary) throw new Error(j.message ?? "적중 자료집을 만들지 못했어요.");
      setSummary(j.summary);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "적중 자료집을 만들지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  const bookHref = `${pathname.replace(/\/$/, "")}/hit-book`;
  const total = summary ? Math.round(summary.samePct + summary.similarPct) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm font-bold text-slate-900">적중 자료집</span>
          <p className="mt-0.5 text-xs text-slate-500">
            시험지를 올리기 전에 만든 변형문제 · 동형모의고사 · 워크북 · 1장 테스트지 · 1장 요약자료에서 시험이 물은
            <b> 바로 그 자리</b>를 찾아, 문항마다 A4 한 장으로 정리합니다.
            {summary ? ` · ${new Date(summary.at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })} 만듦` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {summary && !busy ? (
            <a href={bookHref} className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold leading-9 text-white hover:bg-brand-700">
              보기 · 인쇄
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => void make()}
            disabled={busy || !loaded}
            className={`h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-50 ${
              summary ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {busy ? `만드는 중… ${seconds}초` : summary ? "다시 만들기" : "적중 자료집 만들기"}
          </button>
        </div>
      </div>

      {busy ? (
        <p className="mt-2 text-xs text-slate-500">문항마다 같은 지문의 우리 자료를 찾아 대조하고 있어요. 30초 안팎 걸립니다.</p>
      ) : null}
      {message ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}

      {summary ? (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800">
              <div className="text-[11px] font-medium opacity-80">① 동일 유형 · 동일 포인트</div>
              <div className="text-lg font-bold tabular-nums">
                {summary.samePct.toFixed(1)}% <span className="text-xs font-semibold">· {summary.sameCount}문항</span>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800">
              <div className="text-[11px] font-medium opacity-80">② 유사 유형</div>
              <div className="text-lg font-bold tabular-nums">
                {summary.similarPct.toFixed(1)}% <span className="text-xs font-semibold">· {summary.similarCount}문항</span>
              </div>
            </div>
            <div className="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-white">
              <div className="text-[11px] font-medium opacity-90">적중 (배점 기준)</div>
              <div className="text-lg font-bold tabular-nums">
                {total}%{" "}
                <span className="text-xs font-semibold">
                  · {summary.total}문항 중 {summary.sameCount + summary.similarCount}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
              <div className="text-[11px] font-medium opacity-80">시험 전에 다룬 우리 자료</div>
              <div className="text-lg font-bold tabular-nums">{summary.materials}개</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {summary.items.map((x) => (
              <span
                key={x.no}
                title={`${x.typeName} · ${
                  x.verdict === "same" ? "동일 유형 · 동일 포인트" : x.verdict === "similar" ? "유사 유형" : "다루지 않음"
                }${x.verdict !== "none" ? ` · 자료 ${x.count}개` : ""}`}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums ${
                  x.verdict === "same"
                    ? "bg-red-600 text-white"
                    : x.verdict === "similar"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {x.no}
              </span>
            ))}
            <span className="ml-1 text-[11px] text-slate-500">빨강 ① · 파랑 ② · 회색 다루지 않음</span>
          </div>
        </>
      ) : loaded && !busy ? (
        <p className="mt-3 text-xs text-slate-500">아직 만들지 않았어요. 「적중 자료집 만들기」를 눌러 주세요.</p>
      ) : null}
    </div>
  );
}
