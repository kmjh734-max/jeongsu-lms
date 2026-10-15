"use client";

import { useEffect, useState } from "react";
import type { HitBookSummary } from "@/lib/exam-analysis/hit-book";
import { readUploadedMaterial } from "@/lib/exam-analysis/read-upload-client";

type SavedUpload = { name: string; chars: number };

/**
 * 적중 자료집 — 보고서 화면의 상자 하나.
 *
 * 선생님 지시(2026-10-15): 「대조하기」와 「적중 자료집 보기」가 따로 놀고, 보기를 눌러야 일을 하는 것 같다.
 * 그래서 하나로 묶는다 — 「만들기」를 누르면 대조해 담고, 여기 요약을 띄우고, 「보기 · 인쇄」는 담아 둔 것을 연다.
 */
export function ExamHitBookPanel({
  analysisId,
  excerpts = [],
}: {
  analysisId: string;
  /** 시험지 문항들의 지문 앞부분 — 스캔본 PDF에서 읽을 쪽을 고르는 데 쓴다 */
  excerpts?: string[];
}) {
  const [summary, setSummary] = useState<HitBookSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [step, setStep] = useState<string | null>(null);
  // 선생님 개인 자료 — 새로 고른 파일, 예전에 올려 담아 둔 것, HWP 경고
  const [files, setFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState<SavedUpload[]>([]);
  const [hwpWarn, setHwpWarn] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/exam-analysis/${analysisId}/hit-book`)
      .then((r) => r.json())
      .then((j: { ok: boolean; summary?: HitBookSummary | null; uploads?: SavedUpload[] }) => {
        if (alive && j.ok) {
          setSummary(j.summary ?? null);
          setSaved(j.uploads ?? []);
        }
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

  /** 파일 고르기 — HWP는 읽지 않고 PDF로 올려 달라고 알린다(선생님 지시 2026-10-15) */
  function pick(list: FileList | null) {
    const all = Array.from(list ?? []);
    const hwp = all.filter((f) => /\.(hwp|hwpx)$/i.test(f.name));
    setHwpWarn(hwp.map((f) => f.name));
    const ok = all.filter((f) => !/\.(hwp|hwpx)$/i.test(f.name));
    setFiles((prev) => [...prev.filter((p) => !ok.some((f) => f.name === p.name)), ...ok]);
  }

  async function make() {
    setBusy(true);
    setMessage(null);
    try {
      const uploads: Array<{ name: string; text: string }> = [];
      const notes: string[] = [];
      for (const [i, f] of files.entries()) {
        setStep(`올린 자료 읽는 중 (${i + 1}/${files.length}) — ${f.name}`);
        try {
          const read = await readUploadedMaterial(
            f,
            analysisId,
            (m) => setStep(`올린 자료 읽는 중 (${i + 1}/${files.length}) — ${m}`),
            excerpts
          );
          if (read.note) notes.push(read.note);
          if (read.text.trim().length > 40) uploads.push({ name: read.name, text: read.text });
          else notes.push(`${f.name}에서 글을 읽지 못했어요.`);
        } catch (e) {
          notes.push(e instanceof Error ? e.message : `${f.name}을 읽지 못했어요.`);
        }
      }
      setStep("대조하는 중…");
      const json = JSON.stringify({ uploads, keep: saved.map((u) => u.name) });
      const gz = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      const r = await fetch(`/api/exam-analysis/${analysisId}/hit-book`, {
        method: "POST",
        headers: { "content-type": "application/octet-stream", "x-hitbook-gzip": "1" },
        body: gz,
      });
      const j = (await r.json()) as { ok: boolean; summary?: HitBookSummary; uploads?: SavedUpload[]; message?: string };
      if (!j.ok || !j.summary) throw new Error(j.message ?? "적중 자료집을 만들지 못했어요.");
      setSummary(j.summary);
      setSaved(j.uploads ?? []);
      setFiles([]);
      if (notes.length) setMessage(notes.join(" "));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "적중 자료집을 만들지 못했어요.");
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  const bookHref = `/hit-book/${analysisId}`;
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

      {/* 선생님 개인 자료 */}
      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600">
            <b className="text-slate-800">직접 만든 자료도 함께 대조</b> — 시험 전에 학생들에게 준 PDF를 올리면 같은 자리를 찾아 넣습니다.
            한글(HWP)은 「파일 → PDF로 저장」 한 뒤 올려 주세요. 글자가 든 PDF는 바로 읽고, 스캔·그림 PDF는 쪽마다 읽어 몇 분 걸립니다.
            EngCore에서 만든 자료는 올리지 않아도 이미 대조합니다.
          </div>
          <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-brand-200 bg-white px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50">
            PDF 자료 추가
            <input
              type="file"
              multiple
              accept=".pdf,.txt,image/*,.hwp,.hwpx"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                pick(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {hwpWarn.length ? (
          <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
            {hwpWarn.join(", ")} — 한글(HWP) 파일은 밑줄·괄호 같은 문제 표시를 제대로 읽을 수 없어요. 한글에서 「파일 → PDF로 저장」 한 뒤 PDF로 올려
            주세요.
          </p>
        ) : null}
        {files.length || saved.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {saved.map((u) => (
              <span key={`s-${u.name}`} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] text-slate-700">
                {u.name}
                <span className="text-slate-400">· 담아 둠</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setSaved((xs) => xs.filter((x) => x.name !== u.name))}
                  className="ml-0.5 text-slate-400 hover:text-red-500"
                  aria-label={`${u.name} 빼기`}
                >
                  ✕
                </button>
              </span>
            ))}
            {files.map((f) => (
              <span key={`f-${f.name}`} className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11.5px] text-brand-800">
                {f.name}
                <span className="text-brand-500">· 새로 올림</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setFiles((xs) => xs.filter((x) => x.name !== f.name))}
                  className="ml-0.5 text-brand-400 hover:text-red-500"
                  aria-label={`${f.name} 빼기`}
                >
                  ✕
                </button>
              </span>
            ))}
            {files.length || (summary && saved.length === 0) ? (
              <span className="self-center text-[11px] text-slate-500">「{summary ? "다시 만들기" : "적중 자료집 만들기"}」를 누르면 반영됩니다.</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {busy ? (
        <p className="mt-2 text-xs text-slate-500">
          {step ?? "문항마다 같은 지문의 우리 자료를 찾아 대조하고 있어요."} 30초 안팎 걸립니다.
        </p>
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
