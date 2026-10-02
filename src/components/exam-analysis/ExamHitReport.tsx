"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { readUploadedMaterial } from "@/lib/exam-analysis/read-upload-client";
import type { HitReport } from "@/lib/exam-analysis/hit-report";
import { hitReportActionCompressed } from "@/app/actions/hit-report-action";

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
  files = [],
}: {
  analysisId: string;
  report: HitReport | null;
  savedAt: string | null;
  files?: File[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<HitReport | null>(saved);
  const [at, setAt] = useState<string | null>(savedAt);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);

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
      const uploads: Array<{ name: string; text: string }> = [];
      const notes: string[] = [];
      for (const [i, f] of files.entries()) {
        setStep(`올리신 자료를 읽는 중 (${i + 1}/${files.length}) — ${f.name}`);
        try {
          const read = await readUploadedMaterial(f, analysisId, (done, total) =>
            setStep(`올리신 자료를 읽는 중 (${i + 1}/${files.length}) — ${f.name} · 스캔본 ${done}/${total}쪽`)
          );
          if (read.note) notes.push(read.note);
          if (read.text.trim().length > 40) uploads.push({ name: read.name, text: read.text });
          else notes.push(`${f.name}에서 글을 읽지 못했어요.`);
        } catch (e) {
          notes.push(e instanceof Error ? e.message : `${f.name}을 읽지 못했습니다.`);
        }
      }
      if (notes.length > 0) setMessage(notes.join(" "));
      setStep("업로드 데이터 압축 중…");
      const fd = new FormData();
      fd.append("id", analysisId);
      
      if (uploads.length > 0) {
        const jsonString = JSON.stringify(uploads);
        const stream = new Blob([jsonString]).stream().pipeThrough(new CompressionStream("gzip"));
        const response = new Response(stream);
        const blob = await response.blob();
        fd.append("uploads", blob, "uploads.gz");
      }

      setStep("대조하는 중…");
      const json = await hitReportActionCompressed(fd);
      
      setReport(json.report ?? null);
      setAt(json.at ?? null);
      setOpen(true);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "대조하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setBusy(false);
      setStep(null);
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
        {step ? <p className="mt-2 text-xs text-slate-500">{step}</p> : null}
        {message ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}
      </div>
    );
  }

  if (report.total === 0) return null;

  const pct = Math.round((report.hit / Math.max(1, report.total)) * 100);
  const shown = report.items.filter((it) => it.rows.length > 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-slate-900">내가 만든 자료와 대조</span>
          <p className="mt-0.5 text-xs text-slate-500">
            <b>시험지를 올리기 전에 만든</b> 문항만 셉니다. 유형이 같아도 빈칸·밑줄 자리가
            다르면 학생에게는 다른 문제라, <b>묻는 자리까지 같은 것</b>을 따로 셉니다.
            문장삽입·순서배열·무관한문장은 같은 지문에 그 유형을 내 두었으면 적중으로 봅니다.
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


      {step ? <p className="mt-2 text-xs text-slate-500">{step}</p> : null}
      {message ? <p className="mt-2 text-xs text-red-600">{message}</p> : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["묻는 자리까지 같음", report.spotHit ?? 0, "border-emerald-300 bg-emerald-50 text-emerald-900"],
          ["유형까지 같음", report.hit, "border-emerald-200 bg-emerald-50/60 text-emerald-800"],
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
                        it.spotHit
                          ? "bg-emerald-600 text-white"
                          : it.hit
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {it.spotHit ? "묻는 자리까지 적중" : it.hit ? "유형까지 같음" : "지문만 같음"}
                    </span>
                  </div>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {it.rows.map((r, i) => (
                      <li
                        key={`${it.itemId}-${i}`}
                        className={`flex flex-col gap-0.5 text-[12.5px] ${
                          r.sameType ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={
                              r.sameSpot === true
                                ? "text-emerald-700"
                                : r.sameType
                                  ? "text-emerald-500"
                                  : "text-slate-300"
                            }
                          >
                            {r.sameSpot === true ? "★" : r.sameType ? "●" : "○"}
                          </span>
                          {r.sameType && r.sameSpot === false ? (
                            <span className="text-[11px] text-amber-600">묻는 자리 다름</span>
                          ) : null}
                          <span className="font-medium">{r.from}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">{r.typeName}</span>
                          <span className="truncate">{r.label}</span>
                          {r.madeAt ? (
                            <span className={`text-[11px] ${r.before ? "text-slate-400" : "text-amber-600"}`}>
                              {r.before ? "" : "시험 뒤 · "}
                              {r.madeAt.slice(0, 10)}
                            </span>
                          ) : null}
                        </div>
                        {r.preview ? (
                          <div className="pl-[22px] text-[11.5px] text-slate-500 line-clamp-1 italic">
                            &quot;{r.preview}&quot;
                          </div>
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

    </div>
  );
}
