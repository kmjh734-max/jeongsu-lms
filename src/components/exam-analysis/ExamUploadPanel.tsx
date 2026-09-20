"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pdfFileToJpegFiles } from "@/lib/student-records/client-pdf-render";

type Step = "idle" | "preparing" | "reading" | "analyzing" | "failed";

const fileToDataUrl = (f: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  return img;
}

/** 큰 사진은 긴 변 2400px 이하 JPEG로 줄인다 */
async function toJpeg(dataUrl: string, maxEdge = 2400): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  if (scale === 1 && dataUrl.startsWith("data:image/jpeg") && dataUrl.length < 2_500_000) return dataUrl;
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

/** 쪽을 왼쪽·오른쪽 단으로 (가운데를 조금 겹치게) */
async function splitHalves(dataUrl: string): Promise<[string, string]> {
  const img = await loadImage(dataUrl);
  const cut = (x0: number, x1: number) => {
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * (x1 - x0));
    c.height = img.height;
    c.getContext("2d")!.drawImage(img, img.width * x0, 0, c.width, img.height, 0, 0, c.width, img.height);
    return c.toDataURL("image/jpeg", 0.85);
  };
  return [cut(0, 0.53), cut(0.47, 1)];
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; id?: string; complete?: boolean };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `요청 실패 (${res.status})`);
  return data;
}

/** 시험지 올리기: 쪽 그림으로 바꿔 한 쪽씩 읽히고, 다 읽으면 분석한다 */
export function ExamUploadPanel({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [meta, setMeta] = useState({ schoolName: "", grade: "", examLabel: "" });
  const [matchMaterials, setMatchMaterials] = useState(true);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const busy = step !== "idle" && step !== "failed";

  async function start() {
    if (files.length === 0) return;
    setMessage(null);
    setStep("preparing");
    try {
      // 1) 쪽 그림 만들기 (원본은 서버에 남기지 않는다)
      const pages: string[] = [];
      for (const f of files) {
        if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) {
          const jpgs = await pdfFileToJpegFiles(f, {
            maxPages: 20,
            onProgress: (cur, total) => setProgress({ done: cur, total }),
          });
          for (const j of jpgs) pages.push(await fileToDataUrl(j));
        } else if (f.type.startsWith("image/")) {
          pages.push(await toJpeg(await fileToDataUrl(f)));
        }
      }
      if (pages.length === 0) throw new Error("PDF나 사진 파일을 올려 주세요.");
      if (pages.length > 20) throw new Error("시험지는 20쪽까지 올릴 수 있어요.");

      const { id } = await postJson("/api/exam-analysis", { pageCount: pages.length, ...meta, matchMaterials });
      setStep("reading");
      setProgress({ done: 0, total: pages.length });

      /*
       * 2) 쪽을 한꺼번에 읽는다. 세 쪽씩 읽던 것을 여섯 쪽으로 늘렸다(실측 2026-09-20:
       *    7쪽 시험지 23초 → 11초). 한 쪽 읽는 데 8~10초라 동시에 읽을수록 그대로 줄어든다.
       */
      let next = 0;
      let done = 0;
      const worker = async () => {
        while (next < pages.length) {
          const i = next++;
          const r = await postJson(`/api/exam-analysis/${id}/pages`, { pageNo: i + 1, image: pages[i] });
          if (!r.complete) {
            await postJson(`/api/exam-analysis/${id}/pages`, { pageNo: i + 1, halves: await splitHalves(pages[i]!) });
          }
          done++;
          setProgress({ done, total: pages.length });
        }
      };
      await Promise.all(Array.from({ length: Math.min(6, pages.length) }, () => worker()));

      // 3) 문항표·보고서
      setStep("analyzing");
      await postJson(`/api/exam-analysis/${id}/analyze`, {});
      router.push(`${basePath}/${id}`);
      router.refresh();
    } catch (e) {
      setStep("failed");
      setMessage(e instanceof Error ? e.message : "분석하지 못했어요.");
    }
  }

  const input = "ui-input h-9 w-full text-sm";
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">시험지 올리기</h2>
      <p className="mt-1 text-sm text-slate-500">
        학교 시험지 PDF나 사진을 올리면 문항마다 유형·난이도·배점을 정리해 보고서로 만들어요. 학생이 푼 시험지도 괜찮아요.
      </p>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center hover:border-brand-400">
        <input
          id="exam-files"
          type="file"
          accept="application/pdf,image/*"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length ? (
          <span className="text-sm font-semibold text-slate-800">
            {files.map((f) => f.name).join(", ")}
          </span>
        ) : (
          <>
            <span className="text-sm font-semibold text-slate-800">PDF 또는 사진 고르기</span>
            <span className="text-xs text-slate-500">여러 장이면 쪽 순서대로 한꺼번에 고르세요 · 한글(HWP)은 PDF로 저장해서 올려 주세요</span>
          </>
        )}
      </label>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input id="exam-school" className={input} placeholder="학교 (비우면 시험지에서 읽어요)" value={meta.schoolName} disabled={busy}
          onChange={(e) => setMeta({ ...meta, schoolName: e.target.value })} />
        <input id="exam-grade" className={input} placeholder="학년 (예: 1)" value={meta.grade} disabled={busy}
          onChange={(e) => setMeta({ ...meta, grade: e.target.value })} />
        <input id="exam-label" className={input} placeholder="시험 (예: 2026 1학기 중간)" value={meta.examLabel} disabled={busy}
          onChange={(e) => setMeta({ ...meta, examLabel: e.target.value })} />
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
        <input
          id="exam-match"
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-brand-600"
          checked={matchMaterials}
          disabled={busy}
          onChange={(e) => setMatchMaterials(e.target.checked)}
        />
        <span>
          우리 학원 수업자료와 대조하기
          <span className="block text-xs text-slate-500">시험 지문이 수업자료에 넣어 둔 지문과 같으면 &lsquo;수업자료 적중&rsquo; 문항으로 보여 줘요.</span>
        </span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={busy || files.length === 0}
          className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "분석 중…" : "분석하기 · 1,500크레딧"}
        </button>
        {step === "preparing" ? (
          <span className="text-sm text-slate-600">
            쪽을 준비하는 중{progress.total ? ` ${progress.done}/${progress.total}쪽` : "…"}
          </span>
        ) : null}
        {step === "reading" ? (
          <span className="text-sm text-slate-600">
            시험지 읽는 중 {progress.done}/{progress.total}쪽
          </span>
        ) : null}
        {step === "analyzing" ? (
          <span className="text-sm text-slate-600">문항표 만드는 중 · 보통 1분 남짓 걸려요</span>
        ) : null}
        {message ? <span className="text-sm text-red-600">{message}</span> : null}
      </div>
      {step === "reading" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
        </div>
      ) : null}
    </section>
  );
}
