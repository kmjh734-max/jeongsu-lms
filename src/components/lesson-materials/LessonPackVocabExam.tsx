"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseSaveButton } from "@/components/lesson-materials/CloseSaveButton";
import { usePdfPrefetch, usePdfSave } from "@/components/pdf/usePdfSave";
import { collectPrintPages } from "@/lib/pdf/download-sheets-pdf";
import {
  DEFAULT_VOCAB_EXAM,
  buildVocabExam,
  isTestBookProjectReady,
  normalizeVocabExam,
  type TestBookProjectInput,
  type VocabExamOptions,
} from "@/lib/lesson-materials/test-book";
import {
  TEST_BOOK_CSS,
  TEST_BOOK_FONTS_HREF,
  TestBookBrand,
  VocabExamAnswerSheets,
  VocabExamSheets,
  partStyle,
} from "@/components/lesson-materials/test-book/TestBookSheets";
import { VocabExamControls } from "@/components/lesson-materials/test-book/TestBookControls";
import { vocabExamCaps } from "@/components/lesson-materials/test-book/useVocabExamCaps";
import { MaterialDesignPicker } from "@/components/lesson-materials/MaterialDesignPicker";
import { useMaterialDesign } from "@/lib/lesson-materials/material-design";

/**
 * 수업용 자료 파일에서 단어 시험지만 뽑아 찍는다(선생님 2026-10-27: 이름 바꾸기 옆 「단어 시험지」, 워크북처럼
 * 영→한·한→영·동의어·반의어·파생어를 유형마다 문항 수를 정해서). 수업용 자료가 만든 단어 정리를 그대로 쓰므로
 * 값을 받지 않는다. 재료가 없는 지문은 빠진다(수업용 자료를 열면 만든다).
 * 쪽 틀은 수업용 자료와 같은 #lesson-pack-print-root — 전역 인쇄 규칙이 이 이름만 남긴다.
 */
const OPTIONS_KEY = "lesson-pack-vocab-exam";
const PDF_SELECTOR = ":is(.tb-sheet:not(.tb-measure .tb-sheet))";
const PRINT_CSS = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #lesson-pack-print-root { page: app-print-a4; gap: 0 !important; margin: 0 !important; padding: 0 !important; transform: none !important; }
  #lesson-pack-print-root .tb-sheet { box-shadow: none !important; }
  .lb-zoom { zoom: 1 !important; }
}
`;

export function LessonPackVocabExam({
  role,
  docName,
  projects,
  logoSrc = null,
  academyName = "",
}: {
  role: "admin" | "teacher";
  docName: string;
  projects: TestBookProjectInput[];
  logoSrc?: string | null;
  academyName?: string;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [md, chooseMd] = useMaterialDesign();
  const ready = useMemo(() => projects.filter(isTestBookProjectReady), [projects]);
  const missing = projects.length - ready.length;
  const caps = useMemo(() => vocabExamCaps(projects), [projects]);

  // 유형별 문항 수 · 정답지 — 이 브라우저에 기억한다
  const [counts, setCounts] = useState<VocabExamOptions>(DEFAULT_VOCAB_EXAM);
  const [answers, setAnswers] = useState(true);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(OPTIONS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { vocabExam?: unknown; answers?: unknown };
      setCounts(normalizeVocabExam(saved.vocabExam));
      if (typeof saved.answers === "boolean") setAnswers(saved.answers);
    } catch {
      /* 저장소를 못 쓰면 기본 */
    }
  }, []);
  const remember = (next: { vocabExam: VocabExamOptions; answers: boolean }) => {
    try {
      window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(next));
    } catch {
      /* 무시 */
    }
  };
  const chooseCounts = (v: VocabExamOptions) => {
    setCounts(v);
    remember({ vocabExam: v, answers });
  };
  const chooseAnswers = (on: boolean) => {
    setAnswers(on);
    remember({ vocabExam: counts, answers: on });
  };

  // 「새로 섞기」 — 같은 단어에서 다른 문항·보기 차례로
  const [round, setRound] = useState(0);
  const exam = useMemo(
    () =>
      buildVocabExam(
        ready.map((p) => ({ passage: projects.indexOf(p) + 1, vocab: p.material.vocab })),
        { ...counts, seed: `lesson-pack|vocab|${round}` }
      ),
    [ready, projects, counts, round]
  );
  /** 유형마다 고른 수보다 단어가 모자라 덜 나온 것 */
  const short = exam.sections.filter((s) => s.items.length < (counts.counts[s.kind] ?? 0));
  const wanted = Object.values(counts.counts).reduce((n, c) => n + c, 0);

  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setFontsTick((t) => t + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);
  const mk = `lp-vocab-exam|${fontsTick}`;
  const brand = useMemo(() => ({ logoSrc: logoSrc || null, academy: academyName }), [logoSrc, academyName]);

  const pdf = usePdfSave();
  usePdfPrefetch("lesson-pack-print-root", PDF_SELECTOR);
  const [zoom, setZoom] = useState(70);

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-1 border-b border-slate-100 px-4 py-3">
          <CloseSaveButton base={base} label="← 닫기" className="-ml-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100" />
          <p className="text-xs font-bold text-violet-700">단어 시험지</p>
          <p className="truncate text-sm font-bold text-slate-900" title={docName}>
            {docName}
          </p>
          <p className="text-[11px] text-slate-400">지문 {projects.length}개의 단어를 합쳐 냅니다</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
          <VocabExamControls value={counts} onChange={chooseCounts} caps={caps} />
          {short.length ? (
            <p className="text-[11px] leading-snug text-amber-700">
              단어가 모자라 덜 나온 유형: {short.map((s) => `${s.title} ${s.items.length}문항`).join(" · ")}
            </p>
          ) : null}
          {wanted > 0 && exam.total === 0 && ready.length ? (
            <p className="text-[11px] text-amber-700">고른 유형으로 낼 수 있는 단어가 없습니다.</p>
          ) : null}

          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            ↻ 새로 섞기
          </button>

          <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-xs font-bold text-slate-500">정답지 넣기</span>
            <input type="checkbox" checked={answers} onChange={(e) => chooseAnswers(e.target.checked)} className="h-4 w-4 accent-violet-500" />
          </label>

          <MaterialDesignPicker value={md} onChange={chooseMd} />

          {missing > 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              단어 정리가 없는 지문 {missing}개는 빠집니다. 수업용 자료를 열어 먼저 만들어 주세요.
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <button
            type="button"
            disabled={!exam.total}
            onClick={() => window.print()}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            인쇄
          </button>
          <button
            type="button"
            disabled={!!pdf.busy || !exam.total}
            onClick={() =>
              void pdf.save(
                `${docName} 단어 시험지`,
                collectPrintPages(document.getElementById("lesson-pack-print-root"), PDF_SELECTOR),
                [docName]
              )
            }
            className="w-full rounded-xl border border-violet-300 bg-white py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-50 disabled:opacity-50"
          >
            ⤓ PDF로 저장
          </button>
          {pdf.status ? (
            <p className={`text-[11px] font-semibold ${pdf.busy ? "text-violet-700" : "text-rose-600"}`}>{pdf.status}</p>
          ) : null}
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.max(30, z - 10))}>
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.min(130, z + 10))}>
            +
          </button>
        </div>
        <div className="flex justify-center p-6 print:p-0">
          <div className="lb-zoom" style={{ zoom: zoom / 100 }}>
            {!exam.total ? (
              <div className="flex h-[60mm] w-[210mm] items-center justify-center rounded bg-white/70 text-sm text-slate-500 shadow print:hidden">
                {ready.length ? "왼쪽에서 유형별 문항 수를 골라 주세요." : "단어 정리가 있는 지문이 없습니다. 수업용 자료를 먼저 열어 만들어 주세요."}
              </div>
            ) : null}
            <TestBookBrand.Provider value={brand}>
              <link rel="stylesheet" href={TEST_BOOK_FONTS_HREF} />
              <style>{TEST_BOOK_CSS}</style>
              <style>{PRINT_CSS}</style>
              <div
                id="lesson-pack-print-root"
                className={`tb-theme-${md} flex flex-col items-center gap-6 print:gap-0 [&_.tb-sheet]:shadow-xl print:[&_.tb-sheet]:shadow-none`}
                style={partStyle({ id: "lesson", no: "", en: "VOCABULARY TEST", ko: "단어 시험", color: "#1d2a8f" })}
              >
                <VocabExamSheets exam={exam} measureKey={mk} />
                {answers ? <VocabExamAnswerSheets exam={exam} measureKey={mk} /> : null}
              </div>
            </TestBookBrand.Provider>
          </div>
        </div>
      </main>
    </div>
  );
}
