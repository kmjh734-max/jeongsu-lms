"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonPackWorkbench, type LessonPackProjectInput } from "@/components/lesson-materials/LessonPackWorkbench";
import {
  AnalysisReportWorkbench,
  type AnalysisReportProjectInput,
} from "@/components/lesson-materials/AnalysisReportWorkbench";
import { WorkbookWorkbench } from "@/components/lesson-materials/WorkbookWorkbench";
import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";
import { closeTabOrGo } from "@/components/lesson-materials/open-new-document";
import { saveIntegratedDocument } from "@/lib/lesson-materials/document-actions";
import {
  COVER_PRESETS,
  INTEGRATED_SECTION_META,
  coverPreset,
  type IntegratedPayload,
  type IntegratedSectionKind,
} from "@/lib/lesson-materials/integrated";
import {
  BackCover,
  ContentsPage,
  CoverThumb,
  DividerPage,
  FrontCover,
  type ContentsEntry,
} from "@/components/lesson-materials/integrated/BundleSheets";

export type FinalBundleMaterials = {
  lessonPacks: Array<{ docId: string; name: string; projects: LessonPackProjectInput[] }>;
  analyses: Array<{ docId: string; name: string; projects: AnalysisReportProjectInput[] }>;
  workbooks: Array<{ docId: string; name: string }>;
  questions: Array<{ jobId: string; title: string }>;
};

/** 쪽으로 세는 요소(각 자료의 A4 쪽). */
const PAGE_SELECTOR = ".lesson-pack-a4-sheet, .qg-print-page";

const PRINT_CSS = `
/* 미리보기 배율은 화면에서만 건다. 인쇄 계산에 섞이면 쪽이 더 생긴다. */
@media screen {
  #final-bundle-print-root { zoom: var(--bundle-zoom, 1); }
}
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  #final-bundle-print-root, #final-bundle-print-root * { visibility: visible; }
  #final-bundle-print-root {
    position: absolute !important; left: 0 !important; top: 0 !important;
    width: 210mm !important; zoom: 1 !important; gap: 0 !important;
  }
  /* 자료마다 자기 인쇄 틀을 맨 위 왼쪽에 고정하는데, 여기서는 차례로 흐르게 한다. */
  #final-bundle-print-root #lesson-pack-print-root,
  #final-bundle-print-root #analysis-report-print-root,
  #final-bundle-print-root #workbook-print-root,
  #final-bundle-print-root #qg-print-root {
    position: static !important; width: 210mm !important; transform: none !important;
    zoom: 1 !important; gap: 0 !important; padding: 0 !important; margin: 0 !important;
    /* 전역 CSS가 붙인 이름 붙은 쪽(app-print-a4)이 바뀌는 곳마다 빈 쪽이 끼어 끈다. */
    page: auto !important;
  }
  #final-bundle-print-root .final-bundle-sheet {
    height: 296.5mm !important; box-shadow: none !important;
    break-after: page; page-break-after: always;
  }
  #final-bundle-print-root .final-bundle-sheet--last { break-after: auto; page-break-after: auto; }
  /* 자료의 마지막 쪽 뒤에서도 쪽을 넘겨 다음 간지가 같은 쪽에 붙지 않게 한다. */
  #final-bundle-print-root .lesson-pack-a4-sheet--last,
  #final-bundle-print-root .qg-print-page-last {
    break-after: page !important; page-break-after: always !important;
  }
  #final-bundle-print-root .bundle-screen-only { display: none !important; }
  /* 겹친 flex 상자는 인쇄에서 쪽 나눔이 어긋나 빈 쪽이 생긴다. 인쇄에서는 블록으로 흐르게 한다. */
  #final-bundle-print-root,
  #final-bundle-print-root .bundle-section,
  #final-bundle-print-root [data-bundle-section],
  #final-bundle-print-root #lesson-pack-print-root,
  #final-bundle-print-root #analysis-report-print-root,
  #final-bundle-print-root #workbook-print-root { display: block !important; }
}
`;

type SectionPlan = {
  key: string;
  kind: IntegratedSectionKind | "answers";
  en: string;
  title: string;
  sub: string;
};

export function FinalBundleClient({
  role,
  docId,
  name,
  initialPayload,
  materials,
  logoSrc,
  academyName,
}: {
  role: "admin" | "teacher";
  docId: string;
  name: string;
  initialPayload: IntegratedPayload;
  materials: FinalBundleMaterials;
  logoSrc: string;
  academyName: string;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const qgBase = role === "admin" ? "/admin/question-generator" : "/teacher/question-generator";
  const [payload, setPayload] = useState<IntegratedPayload>(() => ({
    ...initialPayload,
    cover: {
      ...initialPayload.cover,
      title: initialPayload.cover.title || name,
      academy: initialPayload.cover.academy || academyName,
    },
  }));
  const [zoom, setZoom] = useState(60);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preset = coverPreset(payload.cover.presetId);

  const has: Record<IntegratedSectionKind, boolean> = {
    lesson_pack: materials.lessonPacks.length > 0,
    analysis_report: materials.analyses.length > 0,
    questions: materials.questions.length > 0,
    workbook: materials.workbooks.length > 0,
  };

  // 목차·본문 순서. 고른 자료가 없는 유형은 뺀다. 변형문제 정답은 맨 뒤에 모은다.
  const sections: SectionPlan[] = useMemo(() => {
    const out: SectionPlan[] = payload.order
      .filter((k) => has[k])
      .map((k) => ({ key: k, kind: k, ...INTEGRATED_SECTION_META[k] }));
    if (payload.answerKey && has.questions) {
      out.push({ key: "answers", kind: "answers", en: "ANSWER KEY", title: "정답", sub: "변형문제 정답" });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.order, payload.answerKey, materials]);

  // 인쇄 CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "final-bundle-print-style";
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // 자료마다 쪽 수를 세어 목차 쪽 번호를 채운다(각 자료가 쪽 나눔을 마친 뒤 바뀌므로 계속 본다).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const count = () => {
      const next: Record<string, number> = {};
      root.querySelectorAll<HTMLElement>("[data-bundle-section]").forEach((sec) => {
        const n = Array.from(sec.querySelectorAll<HTMLElement>(PAGE_SELECTOR)).filter(
          (el) => el.offsetParent !== null
        ).length;
        const key = sec.dataset.bundleSection!;
        next[key] = (next[key] ?? 0) + n;
      });
      setPageCounts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    count();
    const observer = new MutationObserver(() => count());
    observer.observe(root, { childList: true, subtree: true });
    const timer = setInterval(count, 1500);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  // 쪽 번호: 앞표지 1, 목차 2, 그다음 간지와 자료 쪽을 차례로 센다.
  const contents: ContentsEntry[] = [];
  let page = 3;
  sections.forEach((s, i) => {
    if (payload.dividers) page += 1;
    const n = pageCounts[s.key] ?? 0;
    contents.push({
      number: String(i + 1).padStart(2, "0"),
      en: s.en,
      sub: s.sub,
      from: n > 0 ? page : null,
      to: n > 0 ? page + n - 1 : null,
    });
    page += n;
  });
  const totalPages = page; // 뒤표지 포함(page는 다음 쪽 번호이므로 뒤표지 번호와 같다)

  /** 설정을 바꾸면 화면에 바로 반영하고, 입력이 잠깐 멈춘 뒤 파일에 저장한다. */
  function update(patch: Partial<IntegratedPayload>) {
    const next = { ...payload, ...patch };
    setPayload(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await saveIntegratedDocument(role, { id: docId, payload: next });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, 800);
  }
  const updateCover = (patch: Partial<IntegratedPayload["cover"]>) =>
    update({ cover: { ...payload.cover, ...patch } });

  function move(kind: IntegratedSectionKind, dir: -1 | 1) {
    const order = [...payload.order];
    const i = order.indexOf(kind);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j]!, order[i]!];
    update({ order });
  }

  const renderSection = (s: SectionPlan) => {
    if (s.kind === "lesson_pack") {
      return materials.lessonPacks.map((m) => (
        <LessonPackWorkbench key={m.docId} role={role} projects={m.projects} logoSrc={logoSrc} embedded />
      ));
    }
    if (s.kind === "analysis_report") {
      return materials.analyses.map((m) => (
        <AnalysisReportWorkbench key={m.docId} role={role} projects={m.projects} logoSrc={logoSrc} embedded />
      ));
    }
    if (s.kind === "workbook") {
      return materials.workbooks.map((m) => <WorkbookWorkbench key={m.docId} role={role} embeddedDocId={m.docId} />);
    }
    const mode = s.kind === "answers" ? "answers" : "exam";
    return materials.questions.map((q) => (
      <QuestionPrintView
        key={`${q.jobId}-${mode}`}
        jobId={q.jobId}
        backHref={base}
        printBaseHref={`${qgBase}/generations/${q.jobId}`}
        mode={mode}
        academyName={academyName}
        logoSrc={logoSrc}
        embedded
      />
    ));
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100";

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:block print:bg-white">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <button type="button" onClick={() => closeTabOrGo(base)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            ‹ 닫기
          </button>
          <p className="flex items-center gap-2 text-base font-black text-slate-900">
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-violet-700">🗂</span>
            통합 자료 프리뷰
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          <section className="space-y-2">
            <p className="text-xs font-bold text-slate-600">표지</p>
            <div className="grid grid-cols-2 gap-2.5">
              {COVER_PRESETS.map((p) => {
                const on = preset.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateCover({ presetId: p.id })}
                    aria-pressed={on}
                    className={`overflow-hidden rounded-lg border-2 bg-white text-left transition ${
                      on ? "border-violet-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CoverThumb preset={p} cover={payload.cover} widthPx={144} />
                    <div className="px-2 py-1.5">
                      <p className="truncate text-[12px] font-bold text-slate-800">{p.name}</p>
                      <p className="truncate text-[10.5px] text-slate-500">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2 rounded-xl bg-slate-50 p-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-500">표지 상단 라벨 / 부제</span>
              <input className={inputClass} value={payload.cover.label} placeholder="예: 호원고 기말고사" onChange={(e) => updateCover({ label: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-500">표지 메인 제목</span>
              <textarea className={inputClass} rows={2} value={payload.cover.title} placeholder="예: 미디어영어 5과" onChange={(e) => updateCover({ title: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-500">진도 표기 (엔터로 줄 구분)</span>
              <textarea className={inputClass} rows={2} value={payload.cover.progress} placeholder="예: 26년 고1 3월 모의고사 31-40" onChange={(e) => updateCover({ progress: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-slate-500">표지 강사 / 학원명</span>
              <input className={inputClass} value={payload.cover.academy} onChange={(e) => updateCover({ academy: e.target.value })} />
            </label>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-bold text-slate-600">구성</p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={payload.dividers} onChange={(e) => update({ dividers: e.target.checked })} />
              자료 사이에 간지 넣기
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={payload.answerKey} onChange={(e) => update({ answerKey: e.target.checked })} />
              변형문제 정답을 맨 뒤에 모으기
            </label>
            <ol className="space-y-1">
              {payload.order.map((k, i) => (
                <li
                  key={k}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-sm ${
                    has[k] ? "border-slate-200 bg-white text-slate-800" : "border-dashed border-slate-200 text-slate-400"
                  }`}
                >
                  <span>
                    <span className="mr-1.5 font-bold text-violet-600">{i + 1}</span>
                    {INTEGRATED_SECTION_META[k].title}
                    {!has[k] ? " (고른 자료 없음)" : ""}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => move(k, -1)} className="rounded px-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      ‹
                    </button>
                    <button type="button" disabled={i === payload.order.length - 1} onClick={() => move(k, 1)} className="rounded px-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      ›
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          {saveState !== "idle" ? (
            <p className={`text-[11px] ${saveState === "error" ? "text-rose-600" : "text-slate-400"}`}>
              {saveState === "saving" ? "저장 중…" : saveState === "saved" ? "설정을 저장했습니다." : "저장하지 못했습니다."}
            </p>
          ) : null}
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700"
          >
            ⤓ PDF 저장 / 인쇄 ({totalPages}쪽)
          </button>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            인쇄 대화상자에서 「PDF로 저장」을 고르세요. 쪽 번호는 자료를 모두 불러온 뒤 맞춰집니다.
          </p>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.max(30, z - 10))}>
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.min(120, z + 10))}>
            +
          </button>
        </div>
        <div className="flex justify-center p-6 print:p-0">
          <div
            ref={rootRef}
            id="final-bundle-print-root"
            className="flex flex-col items-center gap-6 print:gap-0"
            style={{ ["--bundle-zoom" as string]: String(zoom / 100) }}
          >
            <FrontCover preset={preset} cover={payload.cover} />
            <ContentsPage entries={contents} cover={payload.cover} accent={preset.accent} />
            {sections.map((s, i) => (
              <div key={s.key} className="bundle-section flex flex-col items-center gap-6 print:gap-0">
                {payload.dividers ? (
                  <DividerPage
                    number={String(i + 1).padStart(2, "0")}
                    en={s.en}
                    title={s.title}
                    sub={s.sub}
                    preset={preset}
                    cover={payload.cover}
                  />
                ) : null}
                <div data-bundle-section={s.key} className="flex flex-col items-center gap-6 print:gap-0">
                  {renderSection(s)}
                </div>
              </div>
            ))}
            <BackCover preset={preset} cover={payload.cover} />
          </div>
        </div>
      </main>
    </div>
  );
}
