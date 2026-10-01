"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import type { HitReport } from "@/lib/exam-analysis/hit-report";

/**
 * 학교 시험지와 내가 만들어 둔 것을 대조한 적중표.
 *
 * 선생님 지시(2026-10-01): 「출처가 비슷하다」가 아니라 <b>이 문제를 내가 이미 냈다</b>를
 * 보여 주어야 한다. 그래서 지문이 같은 내 문항을 실제로 늘어놓고, 유형까지 같은 것만
 * 적중으로 센다(지문만 같은 것은 「이 유형도 내야 한다」는 뜻으로 따로 모은다).
 */
export function ExamHitReport({
  analysisId,
  report: saved,
  savedAt,
}: {
  analysisId: string;
  report: HitReport | null;
  savedAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<HitReport | null>(saved);
  const [at, setAt] = useState<string | null>(savedAt);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    if (!(await askCreditConfirm({
      title: "시험지 적중 대조",
      description: "이 시험지의 지문을 선생님이 만들어 두신 자료와 맞춰 봅니다. 지문과 유형이 모두 같고, 시험지를 올리기 전에 만든 문항만 적중으로 셉니다.",
      subject: "이 시험지 한 회",
      items: [{ feature: "exam_hit_report", quantity: 1 }],
    }))) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/exam-analysis/${analysisId}/hit-report`, { method: "POST" });
      const json = (await res.json()) as { ok: boolean; message?: string; report?: HitReport; at?: string };
      if (!json.ok) {
        setMessage(json.message ?? "대조하지 못했습니다.");
        return;
      }
      setReport(json.report ?? null);
      setAt(json.at ?? null);
      setOpen(true);
      router.refresh();
    } catch {
      setMessage("대조하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!report) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-slate-900">내가 만든 자료와 대조</span>
            <p className="mt-0.5 text-xs text-slate-500">
              이 시험지의 지문을 변형문제·수업자료와 맞춰 봅니다. 무엇을 맞췄고 무엇을 더 만들어야 하는지 보입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void run()}
            disabled={busy}
            className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "대조하는 중…" : "대조하기"}
          </button>
        </div>
        {message ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}
      </div>
    );
  }

  if (report.total === 0) return null;

  const pct = Math.round((report.hit / Math.max(1, report.total)) * 100);
  const shown = report.items.filter((it) => it.rows.length > 0);
  /*
   * 못 맞춘 문항 가운데 지문 출처를 아는 것 — 다음에 그 지문으로 만들면 된다.
   * 고등 시험지는 지문이 거의 모의고사·교과서에서 나온다(2026-10-01 실측).
   */
  const toMake = report.items.filter((it) => !it.hit && !it.passageOnly && it.source);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-slate-900">내가 만든 자료와 대조</span>
          <p className="mt-0.5 text-xs text-slate-500">
            지문과 유형이 모두 같고, <b>시험지를 올리기 전에 만든</b> 문항만 적중으로 셉니다.
            지문만 같은 것은 그 유형을 더 내시면 됩니다.
            {at ? ` · ${at.slice(0, 10)} 대조` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-brand-700">
            적중 {report.hit}/{report.total}문항 · {pct}%
          </span>
          <button
            type="button"
            onClick={() => void run()}
            disabled={busy}
            className="h-7 rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 print:hidden"
          >
            {busy ? "대조하는 중…" : "다시 대조"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["지문도 유형도 같음", report.hit, "border-emerald-200 bg-emerald-50 text-emerald-800"],
          ["지문만 같음", report.passageOnly, "border-amber-200 bg-amber-50 text-amber-800"],
          ["못 맞춤", report.missed, "border-slate-200 bg-slate-50 text-slate-600"],
        ].map(([label, n, cls]) => (
          <div key={String(label)} className={`rounded-lg border px-3 py-2 ${cls}`}>
            <div className="text-[11px] font-medium opacity-80">{label}</div>
            <div className="text-lg font-bold tabular-nums">{n as number}문항</div>
          </div>
        ))}
      </div>

      {shown.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-xs font-semibold text-brand-700 underline print:hidden"
          >
            {open ? "접기" : `문항별로 보기 (${shown.length}문항)`}
          </button>
          {open ? (
            <ul className="mt-3 flex flex-col gap-2">
              {shown.map((it) => (
                <li key={it.itemId} className="rounded-lg border border-slate-200 p-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-slate-900">{it.itemNo}번</span>
                    <span className="text-slate-600">{it.typeName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        it.hit ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {it.hit ? "적중" : "지문만 같음"}
                    </span>
                  </div>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {it.rows.map((r, i) => (
                      <li
                        key={`${it.itemId}-${i}`}
                        className={`flex flex-wrap items-center gap-1.5 text-[12.5px] ${
                          r.sameType ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        <span className={r.sameType ? "text-emerald-600" : "text-slate-300"}>
                          {r.sameType ? "●" : "○"}
                        </span>
                        <span className="font-medium">{r.from}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{r.typeName}</span>
                        <span className="truncate">{r.label}</span>
                        {r.madeAt ? (
                          <span className={`text-[11px] ${r.before ? "text-slate-400" : "text-amber-600"}`}>
                            {r.before ? "" : "시험 뒤 · "}
                            {r.madeAt.slice(0, 10)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          이 시험지의 지문과 같은 자료를 아직 만들지 않으셨습니다.
        </p>
      )}

      {report.afterOnly > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          시험지를 올린 <b>뒤에</b> 만든 자료로 같은 유형을 맞춘 것이 {report.afterOnly}문항 있습니다.
          지난 시험을 올리고 이번 시험용 자료와 대보면 이렇게 나옵니다 — 적중으로는 세지 않았습니다.
        </p>
      ) : null}

      {toMake.length > 0 ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold text-slate-700">
            이 지문으로 만들어 두면 다음에 맞습니다 ({toMake.length}문항)
          </div>
          <ul className="mt-1.5 flex flex-col gap-1 text-[12.5px] text-slate-600">
            {toMake.slice(0, 12).map((it) => (
              <li key={it.itemId} className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-800">{it.itemNo}번</span>
                <span>{it.typeName}</span>
                <span className="text-slate-400">·</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-700">{it.source}</span>
              </li>
            ))}
          </ul>
          {toMake.length > 12 ? (
            <p className="mt-1 text-[11px] text-slate-400">그 밖 {toMake.length - 12}문항</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
