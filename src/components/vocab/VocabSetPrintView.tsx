"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VocabPrintCoverPage } from "@/components/vocab/VocabPrintCoverPage";
import { VocabPrintExamConfig } from "@/components/vocab/VocabPrintExamConfig";
import { VocabWorkbookPrintPages } from "@/components/vocab/VocabWorkbookPrintPages";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { generatePrintExamQuestions } from "@/lib/vocab/generate-print-test-questions";
import { highlightWordInSentence } from "@/lib/vocab/highlight-word-in-sentence";
import {
  itemsPerVocabPrintPage,
  paginateVocabItems,
  parseVocabPrintMode,
  VOCAB_PRINT_MODE_LABELS,
  type VocabPrintMode,
} from "@/lib/vocab/paginate-vocab-print";
import { useVocabExamPagination } from "@/lib/vocab/use-vocab-exam-pagination";
import {
  EXAM_ROW_GAP_PX,
  examConfigTotal,
  examSettingsToSearchParams,
  parseExamPrintSettings,
  type ExamPrintSettings,
} from "@/lib/vocab/vocab-print-exam-config";
import {
  applyVocabPrintCoverToSearchParams,
  buildDefaultVocabPrintCover,
  mergeVocabPrintCoverFromSearchParams,
  VOCAB_COVER_THEME_LABELS,
  type VocabCoverTheme,
  type VocabPrintCoverSettings,
} from "@/lib/vocab/vocab-print-cover";
import {
  parseVocabPrintFontScale,
  parseVocabPrintLineSpacing,
  VOCAB_PRINT_FONT_LABELS,
  VOCAB_PRINT_SPACING_LABELS,
  type VocabPrintFontScale,
  type VocabPrintLineSpacing,
} from "@/lib/vocab/vocab-print-layout";
import {
  parseVocabPrintSize,
  VOCAB_PRINT_PAGE_DIMENSIONS,
  VOCAB_PRINT_SIZE_LABELS,
  type VocabPrintSize,
} from "@/lib/vocab/vocab-print-size";
import type {
  VocabPrintRow,
  VocabPrintSection,
} from "@/lib/vocab/vocab-print-types";
import type { PrintExamQuestion } from "@/lib/vocab/generate-print-test-questions";

interface VocabSetPrintViewProps {
  sections: VocabPrintSection[];
  backHref: string;
  documentTitle?: string;
  academyName?: string;
  logoSrc?: string;
}

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤", "⑥"];

function formatNo(globalIndex: number) {
  return String(globalIndex + 1).padStart(4, "0");
}

function PrintPageHeader({
  sectionTitle,
  academyName,
  logoSrc,
}: {
  sectionTitle: string;
  academyName: string;
  logoSrc: string;
}) {
  return (
    <>
      <div className="vocab-print-top-line" />
      <header className="vocab-print-header">
        <div className="vocab-print-header-left">
          <div className="vocab-print-logo-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt={academyName} className="vocab-print-logo-img" />
          </div>
          <div className="vocab-print-book-meta">
            <p className="vocab-print-series">{academyName}</p>
            <h2 className="vocab-print-book-title">{sectionTitle}</h2>
          </div>
        </div>
        <div className="vocab-print-header-right">
          <div className="vocab-print-meta-line">
            <span>이름</span>
            <i />
          </div>
          <div className="vocab-print-meta-line">
            <span>날짜</span>
            <i />
          </div>
        </div>
      </header>
    </>
  );
}

export function VocabSetPrintView({
  sections,
  backHref,
  documentTitle,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: VocabSetPrintViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(() =>
    parseVocabPrintMode(searchParams.get("mode") ?? undefined)
  );
  const [size, setSize] = useState(() =>
    parseVocabPrintSize(searchParams.get("size") ?? undefined)
  );
  const [fontScale, setFontScale] = useState(() =>
    parseVocabPrintFontScale(searchParams.get("font"))
  );
  const [lineSpacing, setLineSpacing] = useState(() =>
    parseVocabPrintLineSpacing(searchParams.get("spacing"))
  );
  const [examSettings, setExamSettings] = useState<ExamPrintSettings>(() =>
    parseExamPrintSettings(searchParams)
  );
  const [printing, setPrinting] = useState(false);
  const [printPreparing, setPrintPreparing] = useState(false);

  const pageDims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const perPage = itemsPerVocabPrintPage(mode, size, fontScale, lineSpacing);
  const deferredPerPage = useDeferredValue(perPage);
  const deferredMode = useDeferredValue(mode);
  const examCols = examSettings.layout.columns;
  const examRowGapPx = EXAM_ROW_GAP_PX[examSettings.layout.lineSpacing];
  const layoutClass = `vocab-print-page--font-${fontScale} vocab-print-page--spacing-${lineSpacing}`;

  const allItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections]
  );

  const totalItems = allItems.length;

  const examGenerated = useMemo(() => {
    if (mode !== "exam") return { questions: [] as PrintExamQuestion[], skipped: 0 };
    return generatePrintExamQuestions(allItems, examSettings.counts, {
      shuffle: examSettings.layout.shuffle,
      shuffleSeed: examSettings.shuffleSeed,
    });
  }, [
    mode,
    allItems,
    examSettings.counts,
    examSettings.layout.shuffle,
    examSettings.shuffleSeed,
  ]);

  const flatPages = useMemo(() => {
    if (deferredMode === "exam") return [];
    const rows: {
      section: VocabPrintSection;
      pageItems: (VocabPrintRow | null)[];
      pageIndex: number;
      sectionPageTotal: number;
      globalPageNum: number;
      sectionStartIndex: number;
    }[] = [];
    let globalPageNum = 0;
    for (const section of sections) {
      const pages = paginateVocabItems(section.items, deferredPerPage);
      pages.forEach((pageItems, pageIndex) => {
        globalPageNum += 1;
        rows.push({
          section,
          pageItems,
          pageIndex,
          sectionPageTotal: pages.length,
          globalPageNum,
          sectionStartIndex: pageIndex * deferredPerPage,
        });
      });
    }
    return rows;
  }, [sections, deferredPerPage, deferredMode]);

  const title =
    documentTitle ??
    (sections.length === 1
      ? sections[0]!.title
      : `${sections.length}개 단어세트`);
  const headerTitle =
    sections.length === 1 ? sections[0]!.title : title;

  const coverDefaults = useMemo(
    () =>
      buildDefaultVocabPrintCover({
        sections,
        mode,
        academyName,
        documentTitle,
        totalItems,
      }),
    [sections, mode, academyName, documentTitle, totalItems]
  );

  const [cover, setCover] = useState<VocabPrintCoverSettings>(() =>
    mergeVocabPrintCoverFromSearchParams(
      buildDefaultVocabPrintCover({
        sections,
        mode: parseVocabPrintMode(searchParams.get("mode") ?? undefined),
        academyName,
        documentTitle,
        totalItems: sections.reduce((n, s) => n + s.items.length, 0),
      }),
      searchParams
    )
  );

  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLElement | null>(null);
  const layoutUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const examUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipUrlEchoRef = useRef(false);
  const layoutRef = useRef({ mode, size, fontScale, lineSpacing });
  layoutRef.current = { mode, size, fontScale, lineSpacing };
  const coverRef = useRef(cover);
  coverRef.current = cover;
  const coverDefaultsRef = useRef(coverDefaults);
  coverDefaultsRef.current = coverDefaults;

  const examPagination = useVocabExamPagination({
    enabled: mode === "exam",
    questions: examGenerated.questions,
    size,
    cols: examCols,
    rowGapPx: examRowGapPx,
    lineSpacing: examSettings.layout.lineSpacing,
    measureRef,
    probeRef,
  });

  const resolvedExamPages = examPagination.pages;
  const examBasicQuestions = examPagination.basic;
  const examExampleQuestions = examPagination.examples;

  const bodyPageCount =
    mode === "exam" ? resolvedExamPages.length : flatPages.length;
  const pageCount = bodyPageCount + (cover.enabled ? 1 : 0);

  useEffect(() => {
    return () => {
      if (layoutUrlTimerRef.current) clearTimeout(layoutUrlTimerRef.current);
      if (examUrlTimerRef.current) clearTimeout(examUrlTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (skipUrlEchoRef.current) {
      skipUrlEchoRef.current = false;
      return;
    }
    const nextMode = parseVocabPrintMode(searchParams.get("mode") ?? undefined);
    setMode(nextMode);
    setSize(parseVocabPrintSize(searchParams.get("size") ?? undefined));
    setFontScale(parseVocabPrintFontScale(searchParams.get("font")));
    setLineSpacing(parseVocabPrintLineSpacing(searchParams.get("spacing")));
    setExamSettings(parseExamPrintSettings(searchParams));
    const defaults = buildDefaultVocabPrintCover({
      sections,
      mode: nextMode,
      academyName,
      documentTitle,
      totalItems,
    });
    setCover(mergeVocabPrintCoverFromSearchParams(defaults, searchParams));
  }, [searchParams, sections, academyName, documentTitle, totalItems]);

  useEffect(() => {
    const id = "vocab-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent =
      size === "b5"
        ? "@page { size: B5 portrait; margin: 8mm; }"
        : "@page { size: A4 portrait; margin: 10mm; }";
    return () => {
      el?.remove();
    };
  }, [size]);

  const syncLayoutToUrl = useCallback(() => {
    const cur = layoutRef.current;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", cur.mode);
    params.set("size", cur.size);
    if (cur.fontScale === "md") params.delete("font");
    else params.set("font", cur.fontScale);
    if (cur.lineSpacing === "normal") params.delete("spacing");
    else params.set("spacing", cur.lineSpacing);
    applyVocabPrintCoverToSearchParams(
      params,
      coverRef.current,
      coverDefaultsRef.current
    );
    skipUrlEchoRef.current = true;
    router.replace(`?${params.toString()}`);
  }, [router, searchParams]);

  const queueLayoutUrlSync = useCallback(() => {
    if (layoutUrlTimerRef.current) clearTimeout(layoutUrlTimerRef.current);
    layoutUrlTimerRef.current = setTimeout(() => {
      syncLayoutToUrl();
    }, 400);
  }, [syncLayoutToUrl]);

  const updateCover = useCallback(
    (patch: Partial<VocabPrintCoverSettings>) => {
      setCover((prev) => {
        const next = { ...prev, ...patch };
        coverRef.current = next;
        return next;
      });
      queueLayoutUrlSync();
    },
    [queueLayoutUrlSync]
  );

  const setQuery = useCallback(
    (key: "mode" | "size" | "font" | "spacing", value: string) => {
      const next = { ...layoutRef.current };
      if (key === "mode") next.mode = parseVocabPrintMode(value);
      else if (key === "size") next.size = parseVocabPrintSize(value);
      else if (key === "font") next.fontScale = parseVocabPrintFontScale(value);
      else next.lineSpacing = parseVocabPrintLineSpacing(value);
      layoutRef.current = next;
      startTransition(() => {
        setMode(next.mode);
        setSize(next.size);
        setFontScale(next.fontScale);
        setLineSpacing(next.lineSpacing);
      });
      queueLayoutUrlSync();
    },
    [queueLayoutUrlSync]
  );

  const syncExamSettingsToUrl = useCallback(
    (next: ExamPrintSettings) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "exam");
      for (const key of [
        "word_mc",
        "word_sa",
        "meaning_mc",
        "meaning_sa",
        "example_mc",
        "example_sa",
        "exam_cols",
        "exam_spacing",
        "exam_shuffle",
        "exam_seed",
      ]) {
        params.delete(key);
      }
      for (const [k, v] of Object.entries(examSettingsToSearchParams(next))) {
        params.set(k, v);
      }
      skipUrlEchoRef.current = true;
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const queueExamSettingsUrlSync = useCallback(
    (next: ExamPrintSettings) => {
      if (examUrlTimerRef.current) clearTimeout(examUrlTimerRef.current);
      examUrlTimerRef.current = setTimeout(() => {
        syncExamSettingsToUrl(next);
      }, 350);
    },
    [syncExamSettingsToUrl]
  );

  const updateExamSettings = useCallback(
    (next: ExamPrintSettings) => {
      setExamSettings(next);
      queueExamSettingsUrlSync(next);
    },
    [queueExamSettingsUrlSync]
  );

  const reshuffleExam = useCallback(() => {
    const next = { ...examSettings, shuffleSeed: Date.now() };
    setExamSettings(next);
    if (examUrlTimerRef.current) clearTimeout(examUrlTimerRef.current);
    syncExamSettingsToUrl(next);
  }, [examSettings, syncExamSettingsToUrl]);

  const handlePrint = useCallback(() => {
    if (mode === "exam") {
      window.print();
      return;
    }
    setPrintPreparing(true);
    setPrinting(true);
  }, [mode]);

  useEffect(() => {
    if (!printing) return;
    let cancelled = false;
    const finish = () => {
      setPrinting(false);
      setPrintPreparing(false);
    };
    const run = () => {
      if (cancelled) return;
      setPrintPreparing(false);
      window.print();
    };
    // Wait for all pages to mount before opening the print dialog
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(run));
    }, flatPages.length > 80 ? 120 : 16);

    window.addEventListener("afterprint", finish);
    // Some browsers skip afterprint
    const fallback = window.setTimeout(finish, 120_000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.clearTimeout(fallback);
      window.removeEventListener("afterprint", finish);
    };
  }, [printing, flatPages.length]);

  const examPageStyle = {
    ["--vocab-exam-cols" as string]: examCols,
    ["--vocab-exam-row-gap" as string]: `${examRowGapPx}px`,
    ["--vocab-page-width" as string]: pageDims.width,
    ["--vocab-page-height" as string]: pageDims.height,
  } as React.CSSProperties;

  const workbookPageStyle = useMemo(
    () =>
      ({
        ["--vocab-rows-per-page" as string]: deferredPerPage,
        ["--vocab-page-width" as string]: pageDims.width,
        ["--vocab-page-height" as string]: pageDims.height,
      }) as React.CSSProperties,
    [deferredPerPage, pageDims.width, pageDims.height]
  );

  const renderWorkbookEntry = useCallback(
    (item: VocabPrintRow, globalIndex: number, entryMode: VocabPrintMode) => (
      <PrintEntry
        key={item.id}
        item={item}
        globalIndex={globalIndex}
        mode={entryMode}
      />
    ),
    []
  );

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-slate-600">인쇄할 단어가 없습니다.</p>
        <Link href={backHref} className="mt-4 inline-block text-brand-600 hover:underline">
          돌아가기
        </Link>
      </div>
    );
  }

  const examTotal = examConfigTotal(examSettings.counts);

  const previewPages =
    mode === "exam" ? (
      resolvedExamPages.map((pageSlice, pageIndex) => (
        <article
          key={`exam-${pageIndex}`}
          className={`vocab-print-page vocab-print-page--${size} vocab-print-page--exam vocab-exam-spacing-${examSettings.layout.lineSpacing} vocab-print-page--font-${fontScale} ${pageIndex < resolvedExamPages.length - 1 ? "vocab-print-page-break" : ""}`}
          data-size={size}
          style={examPageStyle}
        >
          <PrintPageHeader
            sectionTitle={headerTitle}
            academyName={academyName}
            logoSrc={logoSrc}
          />

          <div className="vocab-exam-body">
            {pageSlice.basic.length > 0 ? (
              <div
                className={`vocab-exam-list vocab-exam-list--basic vocab-exam-list--${examCols}col`}
              >
                {pageSlice.basic.map((q) => (
                  <PrintExamEntry key={q.number} question={q} />
                ))}
              </div>
            ) : null}
            {pageSlice.examples.length > 0 ? (
              <div className="vocab-exam-list vocab-exam-list--examples">
                {pageSlice.examples.map((q) => (
                  <PrintExamEntry
                    key={q.number}
                    question={q}
                    variant="example"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <footer className="vocab-print-footer">
            <span>{academyName}</span>
            <span>
              {pageIndex + 1} / {resolvedExamPages.length}
            </span>
          </footer>
        </article>
      ))
    ) : (
      <VocabWorkbookPrintPages
        pages={flatPages}
        mode={deferredMode === "exam" ? "workbook" : deferredMode}
        size={size}
        layoutClass={layoutClass}
        pageStyle={workbookPageStyle}
        academyName={academyName}
        logoSrc={logoSrc}
        multiSection={sections.length > 1}
        printing={printing}
        scrollParentRef={previewScrollRef}
        renderEntry={renderWorkbookEntry}
      />
    );

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      {mode === "exam" && examGenerated.questions.length > 0 ? (
        <>
          <div
            ref={measureRef}
            className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
            aria-hidden
          >
            <article
              className={`vocab-print-page vocab-print-page--${size} vocab-print-page--exam vocab-exam-spacing-${examSettings.layout.lineSpacing} vocab-print-page--font-${fontScale}`}
              style={examPageStyle}
            >
              <div
                className={`vocab-exam-list vocab-exam-list--basic vocab-exam-list--${examCols}col`}
              >
                {examBasicQuestions.map((q) => (
                  <div key={q.number} data-measure-basic={q.number}>
                    <PrintExamEntry question={q} />
                  </div>
                ))}
              </div>
              <div className="vocab-exam-list vocab-exam-list--examples">
                {examExampleQuestions.map((q) => (
                  <div key={q.number} data-measure-example={q.number}>
                    <PrintExamEntry question={q} variant="example" />
                  </div>
                ))}
              </div>
            </article>
          </div>
          <div
            ref={probeRef}
            className="pointer-events-none fixed -left-[200vw] top-0 opacity-0"
            aria-hidden
          >
            <article
              className={`vocab-print-page vocab-print-page--${size} vocab-print-page--exam vocab-print-page--font-${fontScale}`}
              style={examPageStyle}
            >
              <PrintPageHeader
                sectionTitle={headerTitle}
                academyName={academyName}
                logoSrc={logoSrc}
              />
              <div data-exam-body-zone className="min-h-0 flex-1" />
              <footer className="vocab-print-footer">
                <span>{academyName}</span>
                <span>1 / 1</span>
              </footer>
            </article>
          </div>
        </>
      ) : null}
      <div className="flex min-h-screen print:block">
        <aside className="no-print w-[min(100%,320px)] shrink-0 border-r border-slate-200 bg-white">
          <div className="sticky top-0 flex max-h-screen flex-col gap-4 overflow-y-auto p-4">
            <div>
              <p className="text-xs font-medium text-slate-500">단어장 인쇄</p>
              <h1 className="mt-0.5 text-base font-bold leading-snug text-slate-900">
                {title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {totalItems}단어 · {pageCount}페이지
                {cover.enabled ? " (표지 포함)" : ""} ·{" "}
                {VOCAB_PRINT_SIZE_LABELS[size]}
                {mode !== "exam"
                  ? ` · ${VOCAB_PRINT_FONT_LABELS[fontScale]} · ${VOCAB_PRINT_SPACING_LABELS[lineSpacing]}`
                  : ""}
                {mode === "exam" && examGenerated.questions.length > 0
                  ? ` · 문항 ${examGenerated.questions.length}개`
                  : ""}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">용지</p>
              <div className="flex gap-2">
                {(["a4", "b5"] as VocabPrintSize[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuery("size", key)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      size === key
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {VOCAB_PRINT_SIZE_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">글자 크기</p>
              <div className="flex gap-1.5">
                {(["sm", "md", "lg"] as VocabPrintFontScale[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setQuery("font", key)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      fontScale === key
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {VOCAB_PRINT_FONT_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {mode !== "exam" ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">줄간격</p>
                <div className="flex gap-1.5">
                  {(["tight", "normal", "relaxed"] as VocabPrintLineSpacing[]).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setQuery("spacing", key)}
                        className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                          lineSpacing === key
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {VOCAB_PRINT_SPACING_LABELS[key]}
                      </button>
                    )
                  )}
                </div>
                <p className="text-[11px] leading-snug text-slate-500">
                  작게·좁게 할수록 페이지당 단어가 늘어 총 페이지가 줄어듭니다.
                  (현재 페이지당 {perPage}개)
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">인쇄 종류</p>
              <div className="flex flex-col gap-1.5">
                {(Object.keys(VOCAB_PRINT_MODE_LABELS) as VocabPrintMode[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setQuery("mode", key)}
                      className={`rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                        mode === key
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {VOCAB_PRINT_MODE_LABELS[key]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-600">표지</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={cover.enabled}
                    onChange={(e) => updateCover({ enabled: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  포함
                </label>
              </div>

              {cover.enabled ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-slate-500">
                      디자인
                    </p>
                    <div className="flex gap-1.5">
                      {(Object.keys(VOCAB_COVER_THEME_LABELS) as VocabCoverTheme[]).map(
                        (key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateCover({ theme: key })}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                              cover.theme === key
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {VOCAB_COVER_THEME_LABELS[key]}
                          </button>
                        )
                      )}
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-slate-500">
                      포스터=다크교재 · 마스터=크림교재 · 컬러팝=비비드
                    </p>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      슬로건
                    </span>
                    <input
                      type="text"
                      value={cover.slogan}
                      onChange={(e) => updateCover({ slogan: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                      placeholder="시험에 나오는 것만 공부한다!"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      메인 제목
                    </span>
                    <input
                      type="text"
                      value={cover.title}
                      onChange={(e) => updateCover({ title: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      부제
                    </span>
                    <input
                      type="text"
                      value={cover.subtitle}
                      onChange={(e) => updateCover({ subtitle: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[11px] font-medium text-slate-500">
                        큰 마크
                      </span>
                      <input
                        type="text"
                        value={cover.heroMark}
                        onChange={(e) =>
                          updateCover({ heroMark: e.target.value })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                        placeholder="85"
                        maxLength={4}
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[11px] font-medium text-slate-500">
                        배지
                      </span>
                      <input
                        type="text"
                        value={cover.badge}
                        onChange={(e) => updateCover({ badge: e.target.value })}
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                        placeholder="학습용 교재"
                      />
                    </label>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      시리즈 / 단계
                    </span>
                    <input
                      type="text"
                      value={cover.seriesLabel}
                      onChange={(e) =>
                        updateCover({ seriesLabel: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                      placeholder="비우면 숨김"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      학원명
                    </span>
                    <input
                      type="text"
                      value={cover.academyName}
                      onChange={(e) =>
                        updateCover({ academyName: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      부가 문구 (· 로 구분)
                    </span>
                    <input
                      type="text"
                      value={cover.metaLine}
                      onChange={(e) => updateCover({ metaLine: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={cover.showNameFields}
                      onChange={(e) =>
                        updateCover({ showNameFields: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    이름 / 반 기입란
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      coverRef.current = coverDefaults;
                      setCover(coverDefaults);
                      queueLayoutUrlSync();
                    }}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    기본값으로 되돌리기
                  </button>
                </div>
              ) : null}
            </div>

            {mode === "exam" ? (
              <div className="space-y-2">
                <VocabPrintExamConfig
                  settings={examSettings}
                  onChange={updateExamSettings}
                  onReshuffle={reshuffleExam}
                  maxPool={totalItems}
                />
                {examTotal === 0 ? (
                  <p className="text-xs text-amber-700">
                    문항 수를 입력하면 시험지가 생성됩니다.
                  </p>
                ) : null}
                {examTotal > 0 && examGenerated.questions.length === 0 ? (
                  <p className="text-xs text-red-600">
                    문항을 만들 수 없습니다. 객관식은 단어 2개 이상, 예문 문항은
                    예문에 단어가 포함된 항목이 필요합니다.
                  </p>
                ) : null}
                {examGenerated.skipped > 0 ? (
                  <p className="text-xs text-amber-700">
                    {examGenerated.skipped}문항은 보기를 만들 수 없어 제외되었습니다.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handlePrint}
                disabled={
                  printPreparing ||
                  (mode === "exam" && examGenerated.questions.length === 0)
                }
                className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {printPreparing ? "인쇄 준비 중…" : "인쇄 / PDF 저장"}
              </button>
              <Link
                href={backHref}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                돌아가기
              </Link>
            </div>
          </div>
        </aside>

        <main
          ref={(node) => {
            previewScrollRef.current = node;
          }}
          className="min-w-0 flex-1 overflow-auto bg-slate-300/40 print:overflow-visible print:bg-white"
        >
          <div className="no-print border-b border-slate-300/60 bg-slate-200/80 px-5 py-2.5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-slate-700">미리보기</p>
            <p className="text-xs text-slate-500">
              {pageCount}페이지 · 스크롤하여 전체 확인
              {pageCount > 16 && mode !== "exam"
                ? " · 화면에 보이는 페이지만 불러와 빠르게 표시"
                : ""}
            </p>
          </div>

          <div className="flex justify-center p-5 pb-12 print:p-0">
            <div
              id="vocab-print-root"
              data-size={size}
              className="flex w-full max-w-[920px] flex-col items-center gap-8 print:max-w-none print:gap-0"
            >
              {cover.enabled ? (
                <VocabPrintCoverPage
                  cover={cover}
                  size={size}
                  logoSrc={logoSrc}
                  pageBreakAfter={bodyPageCount > 0}
                />
              ) : null}
              {previewPages}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const PrintExamEntry = memo(function PrintExamEntry({
  question,
  variant = "basic",
}: {
  question: PrintExamQuestion;
  variant?: "basic" | "example";
}) {
  return (
    <section
      className={`vocab-exam-row${variant === "example" ? " vocab-exam-row--example" : ""}`}
    >
      <div className="vocab-exam-q-head">
        <span className="vocab-exam-q-no">{question.number}.</span>
        <div className="vocab-exam-q-main">
          <p className="vocab-exam-prompt">{question.prompt}</p>
        </div>
      </div>
      {question.choices ? (
        <ul className="vocab-exam-choices">
          {question.choices.map((choice, i) => (
            <li key={i}>
              <span className="vocab-exam-choice-mark">
                {CHOICE_MARKS[i] ?? `${i + 1}.`}
              </span>
              {choice}
            </li>
          ))}
        </ul>
      ) : (
        <div className="vocab-exam-answer-line" />
      )}
    </section>
  );
});

/** 긴 단어·예문만 해당 칸 폰트를 살짝 줄임 (기본 크기는 유지) */
function printDensityClass(
  kind: "word" | "meaning" | "body",
  text: string
): string {
  const t = text.trim();
  if (!t) return "";
  const lines = t.split(/\r?\n/).filter((l) => l.trim()).length;
  const len = t.length;

  if (kind === "word") {
    if (len >= 14) return "vocab-print-density--xs";
    if (len >= 11) return "vocab-print-density--sm";
    return "";
  }
  if (kind === "meaning") {
    if (len >= 36) return "vocab-print-density--xs";
    if (len >= 22) return "vocab-print-density--sm";
    return "";
  }
  // example / translation
  if (len >= 200 || lines >= 3) return "vocab-print-density--xs";
  if (len >= 110 || lines >= 2) return "vocab-print-density--sm";
  return "";
}

const PrintEntry = memo(function PrintEntry({
  item,
  globalIndex,
  mode,
}: {
  item: VocabPrintRow;
  globalIndex: number;
  mode: VocabPrintMode;
}) {
  const exampleSentence = item.example_sentence?.trim() ?? "";
  const exampleMeaning = item.example_meaning?.trim() ?? "";
  const synonyms = item.synonyms?.trim() ?? "";
  const antonyms = item.antonyms?.trim() ?? "";
  const showFull = mode === "full";
  const pos = item.part_of_speech?.trim();
  const wordDensity = printDensityClass("word", item.word);
  const meaningDensity = printDensityClass("meaning", item.meaning);
  const exampleDensity = printDensityClass("body", exampleSentence);
  const translationDensity = printDensityClass(
    "body",
    exampleMeaning || exampleSentence
  );

  return (
    <section className="vocab-print-row">
      <div className="vocab-print-row-left">
        <div className="vocab-print-num">{formatNo(globalIndex)}</div>
        <div className="vocab-print-checks" aria-hidden>
          <span className="vocab-print-check" />
          <span className="vocab-print-check" />
        </div>
      </div>

      <div className="vocab-print-word-box">
        <h2 className={`vocab-print-word ${wordDensity}`.trim()}>
          {item.word}
        </h2>
      </div>

      <div className="vocab-print-content">
        <div className="vocab-print-meaning-line">
          <span className={`vocab-print-meaning ${meaningDensity}`.trim()}>
            {item.meaning}
          </span>
          {pos ? <span className="vocab-print-pos">{pos}</span> : null}
        </div>

        {showFull && exampleSentence ? (
          <p className={`vocab-print-example ${exampleDensity}`.trim()}>
            {highlightWordInSentence(exampleSentence, item.word)}
          </p>
        ) : null}

        {showFull && exampleMeaning ? (
          <p className={`vocab-print-translation ${translationDensity}`.trim()}>
            {exampleMeaning}
          </p>
        ) : null}

        {showFull && (synonyms || antonyms) ? (
          <div className="vocab-print-meta-tags">
            {synonyms ? (
              <span className="vocab-print-tag syn">
                <span className="label">유의어</span>
                {synonyms}
              </span>
            ) : null}
            {antonyms ? (
              <span className="vocab-print-tag ant">
                <span className="label">반의어</span>
                {antonyms}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
});
