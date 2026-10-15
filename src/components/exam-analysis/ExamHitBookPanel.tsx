"use client";

import { useEffect, useState } from "react";
import type { HitBookSummary } from "@/lib/exam-analysis/hit-book";
import { readUploadedMaterial } from "@/lib/exam-analysis/read-upload-client";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { hwpToText } from "@/lib/exam-analysis/hwp-text";

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
  /*
   * 진행 막대(선생님 지시 2026-10-15 「위에 바 같은 걸로 진행과정을, 글자는 위로 올려 바와 함께」).
   * 단계: 자료 읽기(0~25%) → 문항마다 찾아 판정(25~95%, 문항 수로 어림한 시간에 맞춰 차오름) → 저장(95~100%).
   */
  const [phase, setPhase] = useState<"read" | "judge" | "save" | "done" | null>(null);
  const [readDone, setReadDone] = useState(0);
  const [readTotal, setReadTotal] = useState(0);
  const [phaseAt, setPhaseAt] = useState(0);
  const [now, setNow] = useState(0);
  // 선생님 개인 자료 — 새로 고른 파일, 예전에 올려 담아 둔 것, HWP 경고
  const [files, setFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState<SavedUpload[]>([]);
  const [hwpWarn, setHwpWarn] = useState<string[]>([]);
  // 문항 재검토 중인 문항
  const [rechecking, setRechecking] = useState<string | null>(null);

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
    if (!busy && !rechecking) return;
    setSeconds(0);
    const t = setInterval(() => {
      setSeconds((s) => s + 1);
      setNow(Date.now());
    }, 500);
    return () => clearInterval(t);
  }, [busy, rechecking]);

  const go = (p: typeof phase) => {
    setPhase(p);
    setPhaseAt(Date.now());
    setNow(Date.now());
  };
  // 판정에 걸릴 어림 시간 — 문항 열 개씩 같이 판정하고 하나에 20~30초
  const expectSec = rechecking ? 15 : Math.max(25, Math.ceil(Math.max(1, excerpts.length) / 10) * 28);
  const elapsed = Math.max(0, (now - phaseAt) / 1000);
  const pct =
    phase === "read"
      ? 3 + (readTotal ? (readDone / readTotal) * 22 : 22)
      : phase === "judge"
        ? (rechecking ? 5 : 25) + (rechecking ? 90 : 70) * (1 - Math.exp(-elapsed / (expectSec * 0.6)))
        : phase === "save"
          ? 97
          : phase === "done"
            ? 100
            : 0;

  /*
   * 파일 고르기 — 한글(HWP·HWPX)도 이 브라우저에서 바로 글자를 뽑아 읽는다(선생님 지시 2026-10-15 「hwp도 가능하게」).
   * 그림을 품은 한글 파일은 4~18MB라 서버로 보내면 받을 수 없어 브라우저에서 읽는다 — 크기 제한이 없다.
   */
  function pick(list: FileList | null) {
    const all = Array.from(list ?? []);
    setHwpWarn([]);
    setFiles((prev) => [...prev.filter((p) => !all.some((f) => f.name === p.name)), ...all]);
  }

  async function readHwp(f: File): Promise<{ name: string; text: string }> {
    try {
      return { name: f.name, text: await hwpToText(await f.arrayBuffer(), f.name) };
    } catch (e) {
      const why = e instanceof Error ? e.message : "읽지 못했어요.";
      setHwpWarn((xs) => [...xs, f.name]);
      throw new Error(`${f.name}: ${why} 한글에서 「파일 → PDF로 저장」 한 뒤 PDF로 올려 주세요.`);
    }
  }

  async function make() {
    if (
      !(await askCreditConfirm({
        title: summary ? "적중 자료집 다시 만들기" : "적중 자료집 만들기",
        description:
          "시험지 문항마다 시험 전에 만든 변형문제 · 동형모의고사 · 워크북 · 1장 자료 · 올린 자료에서 같은 자리를 찾아 하나하나 판정하고, 원문 근거와 맞출 수 있었던 까닭을 정리합니다.",
        subject: "이 시험지 한 회",
        items: [{ feature: "exam_hit_book", quantity: 1 }],
      }))
    )
      return;
    setBusy(true);
    setMessage(null);
    setReadDone(0);
    setReadTotal(files.length);
    go(files.length ? "read" : "judge");
    try {
      const uploads: Array<{ name: string; text: string }> = [];
      const notes: string[] = [];
      for (const [i, f] of files.entries()) {
        setStep(`올린 자료 읽는 중 (${i + 1}/${files.length}) — ${f.name}`);
        try {
          const read = /\.(hwp|hwpx)$/i.test(f.name)
            ? await readHwp(f)
            : await readUploadedMaterial(
                f,
                analysisId,
                (m) => setStep(`올린 자료 읽는 중 (${i + 1}/${files.length}) — ${m}`),
                excerpts
              );
          if ("note" in read && typeof read.note === "string" && read.note) notes.push(read.note);
          if (read.text.trim().length > 40) uploads.push({ name: read.name, text: read.text });
          else notes.push(`${f.name}에서 글을 읽지 못했어요.`);
        } catch (e) {
          notes.push(e instanceof Error ? e.message : `${f.name}을 읽지 못했어요.`);
        }
        setReadDone(i + 1);
      }
      setStep(null);
      go("judge");
      const json = JSON.stringify({ uploads, keep: saved.map((u) => u.name) });
      const gz = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      const r = await fetch(`/api/exam-analysis/${analysisId}/hit-book`, {
        method: "POST",
        headers: { "content-type": "application/octet-stream", "x-hitbook-gzip": "1" },
        body: gz,
      });
      const j = (await r.json()) as { ok: boolean; summary?: HitBookSummary; uploads?: SavedUpload[]; message?: string };
      if (!j.ok || !j.summary) throw new Error(j.message ?? "적중 자료집을 만들지 못했어요.");
      go("done");
      setSummary(j.summary);
      setSaved(j.uploads ?? []);
      setFiles([]);
      if (notes.length) setMessage(notes.join(" "));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "적중 자료집을 만들지 못했어요.");
    } finally {
      setBusy(false);
      setStep(null);
      setTimeout(() => setPhase(null), 1200);
    }
  }

  /** 한 문항만 다시 찾고 다시 판정 */
  async function recheck(itemId: string, no: string) {
    if (busy || rechecking) return;
    if (
      !(await askCreditConfirm({
        title: `${no}번 재검토`,
        description: "이 문항만 다시 찾고 다시 판정해 자료집에 바꿔 넣습니다. 그사이 새로 만든 자료도 찾습니다.",
        subject: `${no}번 한 문항`,
        items: [{ feature: "exam_hit_book_recheck", quantity: 1 }],
      }))
    )
      return;
    setRechecking(itemId);
    setMessage(null);
    go("judge");
    try {
      const r = await fetch(`/api/exam-analysis/${analysisId}/hit-book/item`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const j = (await r.json()) as { ok: boolean; summary?: HitBookSummary; message?: string };
      if (!j.ok || !j.summary) throw new Error(j.message ?? "재검토하지 못했어요.");
      go("done");
      setSummary(j.summary);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "재검토하지 못했어요.");
    } finally {
      setRechecking(null);
      setTimeout(() => setPhase(null), 1200);
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
            {busy ? "만드는 중…" : summary ? "다시 만들기" : "적중 자료집 만들기"}
          </button>
        </div>
      </div>

      {phase ? (
        <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/60 p-3" role="status" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-semibold text-brand-800">
              {rechecking
                ? `${summary?.items.find((x) => x.id === rechecking)?.no ?? ""}번 다시 찾고 판정하는 중`
                : phase === "read"
                  ? `1/3 올린 자료 읽는 중 (${Math.min(readDone + 1, readTotal)}/${readTotal})`
                  : phase === "judge"
                    ? `${files.length || readTotal ? "2/3" : "1/2"} 문항마다 같은 지문의 우리 자료를 찾아 하나하나 판정하는 중`
                    : phase === "save"
                      ? "저장하는 중"
                      : "다 됐어요"}
            </span>
            <span className="shrink-0 tabular-nums text-brand-700">
              {phase === "done" ? "100%" : `${Math.round(pct)}% · ${seconds}초`}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white ring-1 ring-brand-100">
            <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            {phase === "read"
              ? step ?? "한글·PDF에서 글자를 뽑고 있어요. 스캔·그림 PDF는 쪽마다 읽어 오래 걸릴 수 있어요."
              : phase === "judge"
                ? rechecking
                  ? "이 문항만 다시 찾고 판정해 자료집에 바꿔 넣습니다. 15초 안팎 걸립니다."
                  : `변형문제 · 동형모의고사 · 워크북 · 1장 자료 · 올린 자료를 시험 문항과 하나씩 맞대어 보고 있어요. ${expectSec}초 안팎 걸립니다.`
                : phase === "done"
                  ? "아래 결과를 확인하고 「보기 · 인쇄」를 눌러 주세요."
                  : ""}
          </p>
        </div>
      ) : null}

      {/* 선생님 개인 자료 */}
      <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600">
            <b className="text-slate-800">직접 만든 자료도 함께 대조</b> — 시험 전에 학생들에게 준 한글(HWP)·PDF 파일을 올리면 같은 자리를 찾아 넣습니다.
            한글 파일과 글자가 든 PDF는 바로 읽고, 스캔·그림 PDF는 쪽마다 읽어 몇 분 걸립니다.
            EngCore에서 만든 자료는 올리지 않아도 이미 대조합니다.
          </div>
          <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-brand-200 bg-white px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50">
            자료 추가 (HWP·PDF)
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
            {hwpWarn.join(", ")} — 배포용·암호가 걸린 한글 문서라 글자를 읽지 못했어요. 한글에서 「파일 → PDF로 저장」 한 뒤 PDF로 올려 주세요.
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
              <button
                type="button"
                key={x.id ?? x.no}
                disabled={busy || !!rechecking || !x.id}
                onClick={() => x.id && void recheck(x.id, x.no)}
                title={`${x.typeName} · ${
                  x.verdict === "same" ? "동일 유형 · 동일 포인트" : x.verdict === "similar" ? "유사 유형" : "다루지 않음"
                }${x.verdict !== "none" ? ` · 자료 ${x.count}개` : ""} — 눌러서 이 문항만 재검토`}
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold tabular-nums hover:ring-2 hover:ring-brand-300 disabled:cursor-default ${
                  rechecking === x.id ? "animate-pulse ring-2 ring-brand-400 " : ""
                }${
                  x.verdict === "same"
                    ? "bg-red-600 text-white"
                    : x.verdict === "similar"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {x.no}
              </button>
            ))}
            <span className="ml-1 text-[11px] text-slate-500">
              빨강 ① · 파랑 ② · 회색 다루지 않음 · 번호를 누르면 그 문항만 재검토
            </span>
          </div>
        </>
      ) : loaded && !busy ? (
        <p className="mt-3 text-xs text-slate-500">아직 만들지 않았어요. 「적중 자료집 만들기」를 눌러 주세요.</p>
      ) : null}
    </div>
  );
}
