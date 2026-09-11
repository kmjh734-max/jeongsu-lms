"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  generateAndSaveAnalysisReportAction,
  saveAnalysisReportAction,
} from "@/lib/lesson-materials/analysis-report-actions";
import type {
  AnalysisGrammarPoint,
  AnalysisReportData,
  AnalysisSentence,
} from "@/lib/lesson-materials/generate-analysis-report";
import { LOGO_SRC } from "@/lib/branding";
import { postJson } from "@/lib/lesson-materials/post-json";
import { runWithConcurrency } from "@/lib/run-with-concurrency";

/** 분석서를 동시에 만드는 지문 수. 지문 하나가 모델 호출 하나라 8개도 부담이 작다. */
const ANALYSIS_REPORT_CONCURRENCY = 8;

export type AnalysisReportProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  headerLabel: string;
  report: AnalysisReportData | null;
};

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD_MM = 12;
const A4_PAD = `${A4_PAD_MM}mm`;
const A4_FOOTER_MM = 16;
/**
 * 분석서가 아직 없을 때 쓰는 빈 배열. 렌더마다 새 []를 만들어 effect 의존성에
 * 넣으면 쪽 배치 effect가 매번 state를 바꿔 무한 렌더가 되고(React #185),
 * 화면이 "Application error"로 죽었다. 쪽 배치는 이제 projects에 걸려 있지만,
 * 빈 배열은 계속 이 상수 하나를 쓴다.
 */
const NO_SENTENCES: AnalysisReportData["sentences"] = [];

function joinChunks(texts: string[], sep = " / ") {
  return texts.map((t) => t.trim()).filter(Boolean).join(sep);
}

function GrammarPointItem({
  point,
  index,
}: {
  point: AnalysisGrammarPoint;
  index: number;
}) {
  const mark = ["①", "②", "③", "④", "⑤"][index] ?? `${index + 1}.`;
  const title = (point.title || point.category || "").replace(
    /^(최우선|핵심|중요\s*구문)\s*[·•\-–—:]\s*/u,
    ""
  );

  return (
    <li className="text-[12.5px] leading-relaxed text-slate-800">
      <span className="mr-1 font-bold text-rose-600">{mark}</span>
      <span className="font-bold text-slate-900">{title}</span>
      {point.example ? (
        <span className="text-violet-700"> ({point.example})</span>
      ) : null}
    </li>
  );
}

function SentenceBlock({
  sentence,
  index,
  accent,
}: {
  sentence: AnalysisSentence;
  index: number;
  accent: string;
}) {
  const enText = joinChunks(sentence.enChunks.map((c) => c.text));
  const koText = joinChunks(sentence.koChunks);
  const contextNote =
    (sentence.contextNote ?? "").trim() ||
    (sentence.easyUnderstanding ?? "").trim();

  return (
    <section
      data-analysis-block={`s-${index}`}
      className="break-inside-avoid border-b border-slate-200 pb-5 pt-4 last:border-b-0"
    >
      <div className="mb-2 flex items-start gap-3">
        <span
          className="shrink-0 text-3xl font-black italic leading-none"
          style={{ color: accent }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[13px] font-semibold leading-relaxed text-slate-800">
            {enText || "\u00a0"}
          </p>
          <p className="text-[12px] leading-relaxed text-slate-700">
            {koText || "\u00a0"}
          </p>
        </div>
      </div>

      {sentence.grammarPoints.length > 0 ? (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2.5 print:bg-sky-50">
          <p className="mb-1.5 text-[13px] font-bold text-sky-800">[문법 분석]</p>
          <ol className="space-y-2">
            {sentence.grammarPoints.map((g, gi) => (
              <GrammarPointItem key={gi} point={g} index={gi} />
            ))}
          </ol>
        </div>
      ) : null}

      {contextNote ? (
        <div
          className="analysis-context-note mt-2 rounded-r-md border-l-4 border-[#1e3a5f] bg-[#e8eef6] px-3.5 py-2.5 print:bg-[#e8eef6]"
          style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <p className="text-[12.5px] leading-relaxed text-slate-800">
            {contextNote}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function A4Sheet({
  children,
  label,
  isLast,
  footerLogoSrc,
  screenHidden,
  printHidden,
}: {
  children: ReactNode;
  label: string;
  isLast?: boolean;
  footerLogoSrc?: string | null;
  /** 화면에서는 숨기고 인쇄에만 넣는다(고르지 않은 지문의 쪽). */
  screenHidden?: boolean;
  /** 인쇄에서 뺀다(분석서가 없는 지문). */
  printHidden?: boolean;
}) {
  const visibility = printHidden
    ? screenHidden
      ? "hidden"
      : "print:hidden"
    : screenHidden
      ? "hidden print:block"
      : "";
  return (
    <article
      className={`analysis-report-a4-sheet lesson-pack-a4-sheet relative box-border overflow-hidden bg-white shadow-xl print:shadow-none ${
        isLast ? "lesson-pack-a4-sheet--last" : ""
      } ${visibility}`}
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        height: A4_HEIGHT,
        padding: A4_PAD,
        paddingBottom: footerLogoSrc ? `${A4_FOOTER_MM}mm` : A4_PAD,
        boxSizing: "border-box",
      }}
    >
      {children}
      {footerLogoSrc ? (
        <div className="pointer-events-none absolute bottom-[6mm] left-[12mm] right-[12mm] flex items-center justify-center border-t border-slate-200 pt-2 print:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={footerLogoSrc}
            alt=""
            className="h-7 w-auto max-w-[32mm] object-contain opacity-90"
          />
        </div>
      ) : null}
      <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400 print:hidden">
        {label}
      </span>
    </article>
  );
}

function ReportHeader({
  headerLabel,
  source,
  title,
  pageNo,
  accent,
}: {
  headerLabel: string;
  source?: string | null;
  title: string;
  pageNo: string;
  accent: string;
}) {
  return (
    <header className="mb-4" data-analysis-block="header">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {source?.trim() ? (
            <p className="text-[11px] font-medium leading-snug text-slate-400">
              {source.trim()}
            </p>
          ) : null}
          <p
            className={`text-sm font-semibold ${source?.trim() ? "mt-1" : ""}`}
            style={{ color: accent }}
          >
            {headerLabel}
          </p>
          <h1 className="mt-1 text-[22px] font-black leading-snug text-slate-900">
            {title}
          </h1>
        </div>
        <div
          className="shrink-0 text-4xl font-black tabular-nums"
          style={{ color: accent }}
        >
          {pageNo}
        </div>
      </div>
      <div className="mt-3 h-1 w-full" style={{ backgroundColor: accent }} />
    </header>
  );
}

export function AnalysisReportWorkbench({
  role,
  projects: initialProjects,
  logoSrc = LOGO_SRC,
}: {
  role: "admin" | "teacher";
  projects: AnalysisReportProjectInput[];
  logoSrc?: string;
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [projects, setProjects] = useState(initialProjects);
  const [active, setActive] = useState(0);
  const [headerLabel, setHeaderLabel] = useState(
    () => initialProjects[0]?.headerLabel || "26년도 1학기 중간고사 대비"
  );
  const [accent] = useState("#DC2626");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prepLoading, setPrepLoading] = useState(() =>
    initialProjects.some((p) => !p.report?.sentences?.length)
  );
  const [zoom, setZoom] = useState(85);
  const [pageChunksById, setPageChunksById] = useState<Record<string, number[][]>>({});
  const measureRef = useRef<HTMLDivElement>(null);

  const project = projects[active];
  const report = project?.report;

  useEffect(() => {
    const id = "analysis-report-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #analysis-report-print-root { transform: none !important; gap: 0 !important; }
}
`;
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pending = projects
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.report?.sentences?.length);
    if (pending.length === 0) {
      setPrepLoading(false);
      return;
    }

    setPrepLoading(true);
    setGenerating(true);
    (async () => {
      // 지문끼리는 독립이라 함께 만든다. 서버 액션은 브라우저에서 한 번에 하나씩만
      // 돌기 때문에 API 라우트로 보낸다(post-json.ts).
      const failures = await runWithConcurrency(
        pending,
        ANALYSIS_REPORT_CONCURRENCY,
        async ({ p, i }) => {
          if (cancelled) return null;
          const res = await postJson<
            Awaited<ReturnType<typeof generateAndSaveAnalysisReportAction>>
          >("/api/lesson-materials/analysis-report", {
            role,
            projectId: p.id,
            headerLabel,
          });
          if (!res.ok) return `${String(i + 1).padStart(2, "0")}: ${res.message}`;
          if (cancelled) return null;
          setProjects((prev) =>
            prev.map((row, idx) =>
              idx === i
                ? {
                    ...row,
                    report: res.report,
                    headerLabel: res.report.headerLabel || row.headerLabel,
                  }
                : row
            )
          );
          return null;
        }
      );
      const failed = failures.filter((row): row is string => row !== null);
      if (!cancelled && failed.length > 0) {
        setError(`분석서 ${failed.length}개를 만들지 못했습니다. ${failed.join(" / ")}`);
      }
      // 실패해도 로딩 화면을 내린다. 오류 문구는 본 화면에만 있어서, 로딩을
      // 유지하면 스피너만 도는 채로 무엇이 잘못됐는지 보이지 않는다.
      if (!cancelled) setPrepLoading(false);
      setGenerating(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.map((p) => p.id).join(",")]);

  // Pack sentences onto A4 pages (header only on first page).
  // 인쇄는 선택한 지문 전부를 내보내므로 모든 지문을 배치한다. 화면에는 고른 지문만 보인다.
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const widthPx = root.offsetWidth || 1;
    const pxPerMm = widthPx / 210;
    const bodyMm = 297 - A4_PAD_MM - A4_FOOTER_MM;
    const pageBodyPx = bodyMm * pxPerMm;
    const gapPx = 8;

    const next: Record<string, number[][]> = {};
    for (const p of projects) {
      const count = p.report?.sentences?.length ?? 0;
      const box = root.querySelector(
        `[data-measure-project="${p.id}"]`
      ) as HTMLElement | null;
      if (!box || count === 0) {
        next[p.id] = [Array.from({ length: count }, (_, i) => i)];
        continue;
      }

      const headerEl = box.querySelector(
        '[data-analysis-block="header"]'
      ) as HTMLElement | null;
      const headerH = headerEl?.offsetHeight ?? 0;

      const heights = Array.from({ length: count }, (_, i) => {
        const el = box.querySelector(
          `[data-analysis-block="s-${i}"]`
        ) as HTMLElement | null;
        return el?.offsetHeight ?? 120;
      });

      const pages: number[][] = [];
      let current: number[] = [];
      let used = 0;

      heights.forEach((h, i) => {
        const topPad = current.length === 0 ? (pages.length === 0 ? headerH + gapPx : 0) : gapPx;
        const need = topPad + h;
        if (current.length > 0 && used + need > pageBodyPx) {
          pages.push(current);
          current = [];
          used = 0;
        }
        const firstPad =
          current.length === 0
            ? pages.length === 0
              ? headerH + gapPx
              : 0
            : gapPx;
        used += firstPad + h;
        current.push(i);
      });
      if (current.length) pages.push(current);
      next[p.id] = pages.length ? pages : [[]];
    }
    setPageChunksById(next);
  }, [projects, headerLabel, active]);

  /** 지문 하나의 쪽 배치. 배치 effect가 돌기 전 렌더에서는 없는 문장 번호를 뺀다. */
  function pagesFor(projectId: string, count: number): number[][] {
    const live = (pageChunksById[projectId] ?? [])
      .map((c) => c.filter((i) => i < count))
      .filter((c) => c.length > 0);
    return live.length > 0 ? live : [Array.from({ length: count }, (_, i) => i)];
  }

  /** 지문별 상단 라벨. 고른 지문은 편집 중인 값을 쓴다. */
  function headerLabelFor(index: number): string {
    return index === active ? headerLabel : projects[index]?.headerLabel || headerLabel;
  }

  async function handleRegen() {
    if (!project) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await generateAndSaveAnalysisReportAction(role, {
        projectId: project.id,
        headerLabel,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProjects((prev) =>
        prev.map((row, idx) =>
          idx === active
            ? {
                ...row,
                report: res.report,
                headerLabel: res.report.headerLabel || headerLabel,
              }
            : row
        )
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!project?.report) return;
    setSaving(true);
    setError(null);
    try {
      const next: AnalysisReportData = {
        ...project.report,
        headerLabel,
      };
      const res = await saveAnalysisReportAction(role, {
        projectId: project.id,
        report: next,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProjects((prev) =>
        prev.map((row, idx) =>
          idx === active ? { ...row, report: next, headerLabel } : row
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const previewStyle = useMemo(
    (): CSSProperties => ({
      transform: `scale(${zoom / 100})`,
      transformOrigin: "top center",
    }),
    [zoom]
  );

  if (!project) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Alert variant="error">선택된 자료가 없습니다.</Alert>
      </div>
    );
  }

  if (prepLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p className="text-sm font-semibold text-slate-800">
            분석서를 만들고 있습니다…
          </p>
          <p className="mt-1 text-xs text-slate-500">문장 단위로 정리 중</p>
        </div>
      </div>
    );
  }

  /**
   * 인쇄할 쪽 전부. 선택한 지문을 순서대로 모두 넣고, 화면에는 고른 지문의 쪽만
   * 보인다(나머지는 print 때만 나타난다). 쪽을 지문별 묶음 없이 한 줄로 두는 이유:
   * 인쇄 CSS가 :last-child 쪽의 쪽 나눔을 끄므로, 묶으면 다음 지문이 앞 지문의 마지막
   * 쪽에 이어 붙는다. 분석서가 없는 지문(생성 실패)은 고른 지문일 때만 화면에 둔다.
   */
  const sheets = projects.flatMap((p, pi) => {
    const pSentences = p.report?.sentences ?? NO_SENTENCES;
    if (pSentences.length === 0 && pi !== active) return [];
    const pPages = pagesFor(p.id, pSentences.length);
    return pPages.map((chunk, pageI) => ({
      key: `${p.id}-${pageI}`,
      project: p,
      projectIndex: pi,
      sentences: pSentences,
      chunk,
      pageI,
      pageCount: pPages.length,
      screen: pi === active,
      printable: pSentences.length > 0,
    }));
  });
  const lastPrintable = sheets.map((s) => s.printable).lastIndexOf(true);

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <Link href={base} className="text-xs font-semibold text-violet-700">
            ← 자료함
          </Link>
          <h1 className="text-base font-bold text-slate-900">분석서</h1>
          {projects.length > 1 ? (
            <div className="flex flex-wrap gap-1">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setHeaderLabel(p.headerLabel);
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    i === active
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          <label className="block space-y-1">
            <span className="text-[11px] font-bold text-slate-500">상단 라벨</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={headerLabel}
              onChange={(e) => setHeaderLabel(e.target.value)}
            />
          </label>

          <p className="text-xs text-slate-500">{project.title}</p>
          {project.source?.trim() ? (
            <p className="text-[11px] text-slate-400">{project.source}</p>
          ) : null}
          {error ? <Alert variant="error">{error}</Alert> : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={generating || saving}
            onClick={() => void handleRegen()}
          >
            {generating ? "생성 중…" : "분석서 다시 만들기"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={generating || saving || !report}
            onClick={() => void handleSave()}
          >
            {saving ? "저장 중…" : "저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => window.print()}
          >
            인쇄 / PDF
          </Button>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:overflow-visible">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom(100)}
          >
            100%
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom((z) => Math.max(40, z - 10))}
          >
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom((z) => Math.min(120, z + 10))}
          >
            +
          </button>
        </div>

        <div className="flex justify-center p-6 print:p-0">
          <div
            id="analysis-report-print-root"
            className="flex origin-top flex-col gap-6 print:gap-0 print:!transform-none"
            style={previewStyle}
          >
            {sheets.map((sheet, si) => (
              <A4Sheet
                key={sheet.key}
                label={`${sheet.pageI + 1} / ${sheet.pageCount}`}
                isLast={si === lastPrintable}
                footerLogoSrc={logoSrc}
                screenHidden={!sheet.screen}
                printHidden={!sheet.printable}
              >
                {sheet.pageI === 0 ? (
                  <ReportHeader
                    headerLabel={headerLabelFor(sheet.projectIndex)}
                    source={sheet.project.source}
                    title={sheet.project.title}
                    pageNo={String(sheet.projectIndex + 1).padStart(2, "0")}
                    accent={accent}
                  />
                ) : null}
                <div className="space-y-1">
                  {sheet.chunk.map((i) => (
                    <SentenceBlock
                      key={sheet.sentences[i]?.itemId || i}
                      sentence={sheet.sentences[i]!}
                      index={i}
                      accent={accent}
                    />
                  ))}
                </div>
                {sheet.pageI === sheet.pageCount - 1 && sheet.project.report?.noPointMessage ? (
                  <p className="mt-5 break-inside-avoid rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-600">
                    {sheet.project.report.noPointMessage}
                  </p>
                ) : null}
              </A4Sheet>
            ))}

            {logoSrc ? (
              <div className="lesson-pack-print-logo-fixed hidden print:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt=""
                  className="h-7 w-auto max-w-[32mm] object-contain opacity-90"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Off-screen measure sheet */}
        <div
          ref={measureRef}
          className="pointer-events-none absolute left-[-9999px] top-0 -z-10 w-[210mm] opacity-0 print:hidden"
          style={{ padding: A4_PAD }}
          aria-hidden
        >
          {projects.map((p, pi) => (
            <div key={`m-${p.id}`} data-measure-project={p.id}>
              <ReportHeader
                headerLabel={headerLabelFor(pi)}
                source={p.source}
                title={p.title}
                pageNo={String(pi + 1).padStart(2, "0")}
                accent={accent}
              />
              {(p.report?.sentences ?? NO_SENTENCES).map((s, i) => (
                <SentenceBlock
                  key={`m-${s.itemId || i}`}
                  sentence={s}
                  index={i}
                  accent={accent}
                />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
