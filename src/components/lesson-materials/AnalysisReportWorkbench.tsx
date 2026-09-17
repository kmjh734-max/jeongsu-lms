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
import {
  closeTabOrGo,
  useCreateDocumentFromUrl,
} from "@/components/lesson-materials/open-new-document";
import { useScaledHeight } from "@/components/lesson-materials/use-scaled-height";
import { AnalysisMarkupSentence } from "@/components/lesson-materials/AnalysisMarkupSentence";
import { readAnalysisMarkup } from "@/lib/lesson-materials/analysis-markup";

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
/** 인쇄에서 쪽 아래 여백(globals.css의 .analysis-report-a4-sheet). 담을 높이는 이 값으로 잰다. */
const PRINT_FOOTER_MM = 15;
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

  // 문법 설명: 새로 만든 분석서는 explanation, 옛 분석서는 짧은 판단 근거가 있으면 그것.
  const explanation = (point.explanation || point.decisionRule || "").trim();

  return (
    <li className="text-[13px] leading-relaxed text-slate-800">
      <span className="mr-1 font-bold text-rose-600">{mark}</span>
      <span className="font-bold text-slate-900">{title}</span>
      {point.example ? (
        <span className="text-violet-700"> ({point.example})</span>
      ) : null}
      {explanation ? (
        <p className="mt-0.5 pl-5 text-[12.5px] leading-relaxed text-slate-600">
          {explanation}
        </p>
      ) : null}
    </li>
  );
}

/** 한 쪽에 담긴 조각들을 문장별로 묶는다(테두리 + 그 쪽에 들어간 설명 범위). */
function groupUnits(units: AnalysisUnit[]): Array<{
  s: number;
  showHead: boolean;
  pointsFrom: number;
  pointsTo: number;
}> {
  const out: Array<{ s: number; showHead: boolean; pointsFrom: number; pointsTo: number }> = [];
  for (const u of units) {
    const last = out[out.length - 1];
    if (!last || last.s !== u.s) {
      out.push({
        s: u.s,
        showHead: u.kind !== "point",
        pointsFrom: u.kind === "point" ? (u.p ?? 0) : 0,
        pointsTo: u.kind === "point" ? (u.p ?? 0) + 1 : u.kind === "whole" ? Number.MAX_SAFE_INTEGER : 0,
      });
      continue;
    }
    if (u.kind === "point") last.pointsTo = (u.p ?? 0) + 1;
  }
  return out;
}

/** 쪽에 담는 조각. 표시 분석이 있는 문장은 테두리(head)와 설명 항목(point)으로 쪼갠다. */
type AnalysisUnit = {
  s: number;
  kind: "whole" | "head" | "point";
  /** kind가 point일 때 설명 번호(0부터) */
  p?: number;
  /** 잰 높이(px) */
  h: number;
};

export type TranslationMode = "full" | "chunk";
const TRANSLATION_MODE_KEY = "analysis-report-translation-mode";

/*
 * 분석지 모양. 선생님이 시안 세 개(A 교재 세리프 · B 깔끔한 산세리프 · C 클래식 인쇄)를 모두
 * 마음에 들어 해서 고를 수 있게 했다. 기본은 지금까지 쓰던 모양(빨간 둥근 테두리)이다.
 * 글꼴과 색만 바꾸고 표시(성분·괄호·이름표·번호 설명) 구성은 같다 — globals.css의 .ar-style-*.
 */
export type AnalysisDesignStyle = "base" | "a" | "b" | "c";
const DESIGN_STYLE_KEY = "analysis-report-design-style";
const DESIGN_STYLES: Array<{ id: AnalysisDesignStyle; label: string; hint: string }> = [
  { id: "base", label: "기본", hint: "빨간 테두리" },
  { id: "a", label: "A", hint: "교재 세리프" },
  { id: "b", label: "B", hint: "깔끔한 산세리프" },
  { id: "c", label: "C", hint: "클래식 인쇄" },
];
/** A·B·C가 쓰는 글꼴. 기본 모양에서는 불러오지 않는다. */
const DESIGN_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,500&family=Literata:opsz,wght@7..72,500;7..72,600&family=Gowun+Batang:wght@400;700&display=swap";

function designClass(style: AnalysisDesignStyle): string {
  return style === "base" ? "" : `ar-style ar-style-${style}`;
}

function SentenceBlock({
  sentence,
  index,
  accent,
  showHead,
  pointsFrom,
  pointsTo,
  translationMode,
}: {
  sentence: AnalysisSentence;
  index: number;
  accent: string;
  showHead?: boolean;
  pointsFrom?: number;
  pointsTo?: number;
  translationMode?: TranslationMode;
}) {
  const plainEn = sentence.enChunks.map((c) => c.text).join(" ").trim();
  // 새 분석서는 문장 표시 분석(성분·괄호·이름표·번호 설명·해석)을 그대로 찍는다.
  // 저장본을 다시 읽을 때도 같은 검사를 지나고, 원문이 바뀌었으면 표시를 버리고 옛 모양으로 돌아간다.
  const markup = readAnalysisMarkup(sentence.markup, plainEn);
  if (markup) {
    // 예전 분석서의 추가 설명(부연설명)도 그대로 싣는다 — 선생님 요청
    const extra =
      (sentence.contextNote ?? "").trim() || (sentence.easyUnderstanding ?? "").trim();
    return (
      <AnalysisMarkupSentence
        markup={markup}
        index={index}
        showHead={showHead}
        pointsFrom={pointsFrom}
        pointsTo={pointsTo}
        extraNote={extra || undefined}
        translationMode={translationMode}
      />
    );
  }

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
          <p className="text-[13px] leading-relaxed text-slate-700">
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
          <p className="text-[13px] leading-relaxed text-slate-800">
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
  titleEn,
  topicEn,
  topicKo,
  pageNo,
  accent,
}: {
  headerLabel: string;
  source?: string | null;
  title: string;
  /** 영어 제목·주제문(선생님 요청: 제목·주제가 영어로도 있으면 좋겠다) */
  titleEn?: string | null;
  topicEn?: string | null;
  topicKo?: string | null;
  pageNo: string;
  accent: string;
}) {
  return (
    <header className="ar-head mb-4" data-analysis-block="header">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {source?.trim() ? (
            <p className="ar-head-source text-[11px] font-medium leading-snug text-slate-400">
              {source.trim()}
            </p>
          ) : null}
          <p
            className={`ar-head-label text-sm font-semibold ${source?.trim() ? "mt-1" : ""}`}
            style={{ color: accent }}
          >
            {headerLabel}
          </p>
          <h1 className="ar-head-title mt-1 text-[22px] font-black leading-snug text-slate-900">
            {title}
          </h1>
          {titleEn?.trim() ? (
            <p className="ar-head-title-en mt-0.5 text-[14px] font-bold leading-snug text-slate-600">{titleEn.trim()}</p>
          ) : null}
        </div>
        <div
          className="ar-head-no shrink-0 text-4xl font-black tabular-nums"
          style={{ color: accent }}
        >
          {pageNo}
        </div>
      </div>
      <div className="ar-head-rule mt-3 h-1 w-full" style={{ backgroundColor: accent }} />
      {topicEn?.trim() ? (
        <div className="ar-topic">
          <span className="ar-topic-key">Topic</span>
          <span className="ar-topic-en">{topicEn.trim()}</span>
          {topicKo?.trim() ? <span className="ar-topic-ko">{topicKo.trim()}</span> : null}
        </div>
      ) : null}
    </header>
  );
}

export function AnalysisReportWorkbench({
  role,
  projects: initialProjects,
  logoSrc = LOGO_SRC,
  regenerate = false,
  embedded = false,
}: {
  role: "admin" | "teacher";
  projects: AnalysisReportProjectInput[];
  logoSrc?: string;
  /** 제작 버튼으로 열었다: 이미 분석서가 있는 지문도 새로 만든다. */
  regenerate?: boolean;
  /** 최종통합자료 안에 쪽만 끼워 넣는다(모든 지문의 쪽을 보이고, 만들지 않는다). */
  embedded?: boolean;
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  useCreateDocumentFromUrl(
    role,
    "analysis_report",
    initialProjects.map((p) => p.id)
  );
  /** 새로 만들기는 첫 생성 한 번에만 적용한다(이후 다시 시도는 빠진 지문만). */
  const regenerateOnce = useRef(regenerate);
  const [projects, setProjects] = useState(initialProjects);
  const [active, setActive] = useState(0);
  /*
   * 해석 방식. 선생님 요청: 전체 해석과 직독직해 중 고를 수 있게. 고른 값은 이 브라우저에 기억한다.
   * 직독직해 조각이 없는 예전 분석서는 전체 해석으로 나간다.
   */
  const [translationMode, setTranslationMode] = useState<TranslationMode>("full");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TRANSLATION_MODE_KEY);
      if (saved === "chunk" || saved === "full") setTranslationMode(saved);
    } catch {
      /* 저장소를 못 쓰면 기본값 */
    }
  }, []);
  const chooseTranslationMode = (mode: TranslationMode) => {
    setTranslationMode(mode);
    try {
      window.localStorage.setItem(TRANSLATION_MODE_KEY, mode);
    } catch {
      /* 무시 */
    }
  };
  const [designStyle, setDesignStyle] = useState<AnalysisDesignStyle>("base");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DESIGN_STYLE_KEY);
      if (saved === "base" || saved === "a" || saved === "b" || saved === "c") setDesignStyle(saved);
    } catch {
      /* 저장소를 못 쓰면 기본값 */
    }
  }, []);
  const chooseDesignStyle = (style: AnalysisDesignStyle) => {
    setDesignStyle(style);
    try {
      window.localStorage.setItem(DESIGN_STYLE_KEY, style);
    } catch {
      /* 무시 */
    }
  };
  /*
   * 모양을 바꾸면 글꼴이 늦게 들어와 글자 폭이 달라진다. 쪽 나눔은 잰 높이로 하므로
   * 글꼴이 다 들어온 뒤 한 번 더 잰다(안 그러면 쪽이 넘쳐 한 줄이 새어 나간다).
   */
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (designStyle === "base" || typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setFontsTick((t) => t + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, [designStyle]);
  const [headerLabel, setHeaderLabel] = useState(
    () => initialProjects[0]?.headerLabel || "26년도 1학기 중간고사 대비"
  );
  const [accent] = useState("#DC2626");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prepLoading, setPrepLoading] = useState(
    () => !embedded && (regenerate || initialProjects.some((p) => !p.report?.sentences?.length))
  );
  const [zoom, setZoom] = useState(85);
  const scaled = useScaledHeight<HTMLDivElement>(zoom / 100);
  const [pageChunksById, setPageChunksById] = useState<Record<string, AnalysisUnit[][]>>({});
  const measureRef = useRef<HTMLDivElement>(null);
  /** 아직 만드는 중인 지문. 보고 있는 지문이 먼저 끝나면 나머지를 기다리지 않고 화면을 연다. */
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [prepTotal, setPrepTotal] = useState(0);
  const activeIdRef = useRef<string | undefined>(initialProjects[0]?.id);
  activeIdRef.current = projects[active]?.id;

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
    // 최종통합자료에 끼워 넣을 때는 저장된 분석서만 보여 준다.
    if (embedded) return;
    let cancelled = false;
    const regenerateAll = regenerateOnce.current;
    const pending = projects
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => regenerateAll || !p.report?.sentences?.length);
    if (pending.length === 0) {
      setPrepLoading(false);
      return;
    }

    setPrepLoading(true);
    setGenerating(true);
    setPrepTotal(pending.length);
    setPendingIds(new Set(pending.map(({ p }) => p.id)));
    (async () => {
      // 지문끼리는 독립이라 함께 만든다. 서버 액션은 브라우저에서 한 번에 하나씩만
      // 돌기 때문에 API 라우트로 보낸다(post-json.ts).
      const failures = await runWithConcurrency(
        pending,
        ANALYSIS_REPORT_CONCURRENCY,
        async ({ p, i }) => {
          if (cancelled) return null;
          const done = () => {
            if (cancelled) return;
            setPendingIds((prev) => {
              const next = new Set(prev);
              next.delete(p.id);
              return next;
            });
            // 보고 있는 지문이 끝나면 로딩 화면을 내린다. 나머지는 뒤에서 이어서 채운다.
            if (p.id === activeIdRef.current) setPrepLoading(false);
          };
          const res = await postJson<
            Awaited<ReturnType<typeof generateAndSaveAnalysisReportAction>>
          >("/api/lesson-materials/analysis-report", {
            role,
            projectId: p.id,
            headerLabel,
            // 원문이 그대로인 분석서는 다시 만들지 않는다(비용 절감). 지문별 "다시 만들기"는 강제로 만든다.
            onlyIfChanged: true,
          });
          if (!res.ok) {
            done();
            return `${String(i + 1).padStart(2, "0")}: ${res.message}`;
          }
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
          done();
          return null;
        }
      );
      const failed = failures.filter((row): row is string => row !== null);
      if (!cancelled && failed.length > 0) {
        setError(`분석서 ${failed.length}개를 만들지 못했습니다. ${failed.join(" / ")}`);
      }
      // 실패해도 로딩 화면을 내린다. 오류 문구는 본 화면에만 있어서, 로딩을
      // 유지하면 스피너만 도는 채로 무엇이 잘못됐는지 보이지 않는다.
      if (!cancelled) {
        setPrepLoading(false);
        setPendingIds(new Set());
        regenerateOnce.current = false;
      }
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
    /*
     * 담을 수 있는 높이. 인쇄에서는 아래 여백이 15mm다. 재는 값과 실제로 찍히는
     * 높이가 조금 달라서(쪽이 넘치면 한 줄이 새어 나가 거의 빈 쪽이 생긴다)
     * 6mm를 여유로 뺀다.
     */
    /*
     * 담을 수 있는 높이. 재는 높이와 실제로 찍히는 높이가 7mm 남짓 달라서
     * (이어 붙는 설명 묶음이 여백을 한 번 더 쓴다) 그만큼 여유를 두고 잰다.
     * 여유를 줄이면 쪽이 넘쳐 한 줄이 새고 거의 빈 쪽이 생긴다 — 실제로 확인했다.
     */
    const bodyMm = 297 - A4_PAD_MM - PRINT_FOOTER_MM - 7;
    const pageBodyPx = bodyMm * pxPerMm;
    // 쪽에 찍을 때 묶음 사이 여백(space-y-1). 넉넉히 잡으면 묶음 하나가 통째로 밀린다.
    const gapPx = 4;

    const next: Record<string, AnalysisUnit[][]> = {};
    for (const p of projects) {
      const count = p.report?.sentences?.length ?? 0;
      const box = root.querySelector(
        `[data-measure-project="${p.id}"]`
      ) as HTMLElement | null;
      if (!box || count === 0) {
        next[p.id] = [
          Array.from({ length: count }, (_, i) => ({ s: i, kind: "whole" as const, h: 0 })),
        ];
        continue;
      }

      const headerEl = box.querySelector(
        '[data-analysis-block="header"]'
      ) as HTMLElement | null;
      const headerH = headerEl?.offsetHeight ?? 0;

      /*
       * 문장 묶음을 통째로 붙여 두면 쪽 아래가 크게 비었다(설명이 긴 문장 하나가
       * 통째로 다음 쪽으로 넘어가서). 그래서 테두리 문장+해석을 한 조각으로,
       * 번호 설명을 항목마다 한 조각으로 쪼개 담는다. 실물 분석지도 설명은
       * 다음 쪽으로 이어진다. 옛 형식(표시 분석이 없는 분석서)은 예전처럼
       * 문장 하나가 한 조각이다.
       */
      const units: AnalysisUnit[] = [];
      for (let i = 0; i < count; i++) {
        const blockEl = box.querySelector(
          `[data-analysis-block="s-${i}"]`
        ) as HTMLElement | null;
        const blockH = blockEl?.offsetHeight ?? 120;
        const head = box.querySelector(
          `[data-analysis-part="s-${i}-head"]`
        ) as HTMLElement | null;
        if (!head) {
          units.push({ s: i, kind: "whole", h: blockH });
          continue;
        }
        const points: AnalysisUnit[] = [];
        for (let j = 0; ; j++) {
          const pt = box.querySelector(
            `[data-analysis-part="s-${i}-p-${j}"]`
          ) as HTMLElement | null;
          if (!pt) break;
          points.push({ s: i, kind: "point", p: j, h: pt.offsetHeight });
        }
        // 조각 높이를 더해도 묶음 높이에 모자란다(묶음 여백, 설명 목록 위 여백).
        // 그 차이를 첫 조각에 얹어야 쪽이 넘치지 않는다. 넘치면 인쇄에서 한 줄이
        // 다음 쪽으로 새어 나가 거의 빈 쪽이 생겼다.
        const partsSum = head.offsetHeight + points.reduce((a, u) => a + u.h, 0);
        const extra = Math.max(0, blockH - partsSum);
        units.push({ s: i, kind: "head", h: head.offsetHeight + extra });
        units.push(...points);
      }

      /*
       * 설명이 다음 쪽으로 이어지면 그 쪽에도 묶음 여백과 설명 목록 위 여백이
       * 한 번 더 붙는다. 이 몫을 빼먹어서 쪽이 2mm쯤 넘쳤고, 인쇄에서 한 줄이
       * 다음 쪽으로 새어 거의 빈 쪽이 생겼다.
       */
      const sampleBlock = box.querySelector(".ar-block") as HTMLElement | null;
      const samplePoints = box.querySelector(".ar-points") as HTMLElement | null;
      const contOverhead =
        sampleBlock && samplePoints
          ? parseFloat(getComputedStyle(sampleBlock).paddingBottom || "0") +
            parseFloat(getComputedStyle(samplePoints).marginTop || "0")
          : 24;

      const pages: AnalysisUnit[][] = [];
      let current: AnalysisUnit[] = [];
      let used = 0;

      for (const u of units) {
        // 문장이 바뀔 때만 문장 사이 간격이 붙는다
        const prev = current[current.length - 1];
        const gap = current.length === 0 ? 0 : prev && prev.s === u.s ? 0 : gapPx;
        const headerPad = pages.length === 0 && current.length === 0 ? headerH + gapPx : 0;
        if (current.length > 0 && used + gap + u.h > pageBodyPx) {
          pages.push(current);
          current = [];
          // 이어지는 설명으로 쪽을 시작하면 묶음 여백이 한 번 더 붙는다
          used = u.kind === "point" ? contOverhead + u.h : u.h;
          current.push(u);
          continue;
        }
        used += headerPad + gap + u.h;
        current.push(u);
      }
      if (current.length) pages.push(current);
      next[p.id] = pages.length ? pages : [[]];
    }
    setPageChunksById(next);
  }, [projects, headerLabel, active, translationMode, designStyle, fontsTick]);

  /** 지문 하나의 쪽 배치. 배치 effect가 돌기 전 렌더에서는 없는 문장 번호를 뺀다. */
  function pagesFor(projectId: string, count: number): AnalysisUnit[][] {
    const live = (pageChunksById[projectId] ?? [])
      .map((c) => c.filter((u) => u.s < count))
      .filter((c) => c.length > 0);
    return live.length > 0
      ? live
      : [Array.from({ length: count }, (_, i) => ({ s: i, kind: "whole" as const, h: 0 }))];
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

  async function handleSave(): Promise<boolean> {
    if (!project?.report) return false;
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
        return false;
      }
      setProjects((prev) =>
        prev.map((row, idx) =>
          idx === active ? { ...row, report: next, headerLabel } : row
        )
      );
      return true;
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return false;
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
          <p className="mt-1 text-xs text-slate-500">
            {prepTotal > 1
              ? `지문 ${prepTotal}개 중 ${prepTotal - pendingIds.size}개 완료 · 첫 지문이 끝나면 바로 보여 드립니다`
              : "문장 단위로 정리 중"}
          </p>
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
      screen: embedded || pi === active,
      printable: pSentences.length > 0,
    }));
  });
  const lastPrintable = sheets.map((s) => s.printable).lastIndexOf(true);

  /** 인쇄할 쪽들. 최종통합자료에 끼워 넣을 때(embedded)도 같은 모양을 쓴다. */
  const sheetPages = (
    <>
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
                      titleEn={sheet.project.titleEn || sheet.project.report?.titleEn}
                      topicEn={sheet.project.report?.topicEn}
                      topicKo={sheet.project.report?.topicKo}
                      pageNo={String(sheet.projectIndex + 1).padStart(2, "0")}
                      accent={accent}
                    />
                  ) : null}
                  <div className="space-y-1">
                    {groupUnits(sheet.chunk).map((g) => (
                      <SentenceBlock
                        key={`${sheet.sentences[g.s]?.itemId || g.s}-${g.pointsFrom}`}
                        sentence={sheet.sentences[g.s]!}
                        index={g.s}
                        accent={accent}
                        showHead={g.showHead}
                        pointsFrom={g.pointsFrom}
                        pointsTo={g.pointsTo}
                        translationMode={translationMode}
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

              {logoSrc && !embedded ? (
                <div className="lesson-pack-print-logo-fixed hidden print:flex">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc}
                    alt=""
                    className="h-7 w-auto max-w-[32mm] object-contain opacity-90"
                  />
                </div>
              ) : null}
    </>
  );
  const measureTree = (
    <>
          {/* Off-screen measure sheet. 높이 0인 틀 안에 둬서 스크롤 길이에 잡히지 않게 한다. */}
          <div className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden print:hidden" aria-hidden>
          <div
            ref={measureRef}
            className={`font-print -z-10 w-[210mm] opacity-0 ${designClass(designStyle)}`}
            style={{ padding: A4_PAD }}
          >
            {projects.map((p, pi) => (
              <div key={`m-${p.id}`} data-measure-project={p.id}>
                <ReportHeader
                  headerLabel={headerLabelFor(pi)}
                  source={p.source}
                  title={p.title}
                  titleEn={p.titleEn || p.report?.titleEn}
                  topicEn={p.report?.topicEn}
                  topicKo={p.report?.topicKo}
                  pageNo={String(pi + 1).padStart(2, "0")}
                  accent={accent}
                />
                {(p.report?.sentences ?? NO_SENTENCES).map((s, i) => (
                  <SentenceBlock
                    key={`m-${s.itemId || i}`}
                    sentence={s}
                    index={i}
                    accent={accent}
                    translationMode={translationMode}
                  />
                ))}
              </div>
            ))}
          </div>
          </div>
    </>
  );

  if (embedded) {
    return (
      <div className="relative">
        {designStyle !== "base" ? <link rel="stylesheet" href={DESIGN_FONTS_HREF} /> : null}
        <div id="analysis-report-print-root" className={`flex flex-col gap-6 print:gap-0 ${designClass(designStyle)}`}>
          {sheetPages}
        </div>
        {measureTree}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <button
            type="button"
            onClick={() => closeTabOrGo(base)}
            className="text-left text-xs font-semibold text-violet-700"
          >
            ← 자료함
          </button>
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
                  } ${pendingIds.has(p.id) ? "animate-pulse opacity-60" : ""}`}
                  title={pendingIds.has(p.id) ? "만드는 중" : undefined}
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

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500">해석 방식</span>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              {(["full", "chunk"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseTranslationMode(mode)}
                  className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                    translationMode === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {mode === "full" ? "전체 해석" : "직독직해"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500">분석지 모양</span>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
              {DESIGN_STYLES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.hint}
                  onClick={() => chooseDesignStyle(d.id)}
                  className={`rounded-md px-1 py-1.5 text-xs font-bold transition ${
                    designStyle === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {DESIGN_STYLES.find((d) => d.id === designStyle)?.hint}
            </p>
          </div>
          {designStyle !== "base" ? <link rel="stylesheet" href={DESIGN_FONTS_HREF} /> : null}

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
            onClick={() => void handleSave().then((ok) => ok && closeTabOrGo(base))}
          >
            {saving ? "저장 중…" : "저장 후 닫기"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={generating}
            onClick={() => window.print()}
          >
            {generating && pendingIds.size > 0
              ? `나머지 지문 만드는 중 (${prepTotal - pendingIds.size}/${prepTotal})`
              : "인쇄 / PDF"}
          </Button>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
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

        <div className="flex flex-col items-center gap-4 p-6 print:block print:p-0">
          {project && pendingIds.has(project.id) ? (
            <p className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm print:hidden">
              이 지문의 분석서를 만들고 있습니다… 끝나면 자동으로 채워집니다.
            </p>
          ) : null}
          <div style={scaled.frameStyle} className="print:!h-auto print:!overflow-visible">
          <div
            ref={scaled.ref}
            id="analysis-report-print-root"
            className={`flex origin-top flex-col gap-6 print:gap-0 print:!transform-none ${designClass(designStyle)}`}
            style={previewStyle}
          >
            {sheetPages}
          </div>
          </div>
        </div>

        {measureTree}
      </main>
    </div>
  );
}
