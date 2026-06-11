"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { fetchPrintEnrichmentBatched } from "@/lib/vocab/enrich-print-client";
import type { EnrichPrintKind } from "@/lib/vocab/enrich-print-vocabulary";
import {
  itemsPerVocabPrintPage,
  modeNeedsEnrichment,
  paginateVocabItems,
  parseVocabPrintMode,
  VOCAB_PRINT_MODE_LABELS,
  type VocabPrintMode,
} from "@/lib/vocab/paginate-vocab-print";
import type {
  VocabPrintRow,
  VocabPrintSection,
} from "@/lib/vocab/vocab-print-types";

interface VocabSetPrintViewProps {
  sections: VocabPrintSection[];
  backHref: string;
  documentTitle?: string;
}

function formatNo(globalIndex: number) {
  return String(globalIndex + 1).padStart(3, "0");
}

function enrichKindFromMode(mode: VocabPrintMode): EnrichPrintKind | null {
  if (mode === "example-middle") return "example-middle";
  if (mode === "example-high") return "example-high";
  if (mode === "companion") return "companion";
  return null;
}

export function VocabSetPrintView({
  sections,
  backHref,
  documentTitle,
}: VocabSetPrintViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = parseVocabPrintMode(searchParams.get("mode") ?? undefined);

  const [enrichedSections, setEnrichedSections] =
    useState<VocabPrintSection[]>(sections);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  const totalItems = useMemo(
    () => sections.reduce((n, s) => n + s.items.length, 0),
    [sections]
  );

  const perPage = itemsPerVocabPrintPage(mode);

  const flatPages = useMemo(() => {
    const rows: {
      section: VocabPrintSection;
      pageItems: (VocabPrintRow | null)[];
      pageIndex: number;
      sectionPageTotal: number;
      globalPageNum: number;
    }[] = [];
    let globalPageNum = 0;
    for (const section of enrichedSections) {
      const pages = paginateVocabItems(section.items, perPage);
      pages.forEach((pageItems, pageIndex) => {
        globalPageNum += 1;
        rows.push({
          section,
          pageItems,
          pageIndex,
          sectionPageTotal: pages.length,
          globalPageNum,
        });
      });
    }
    return rows;
  }, [enrichedSections, perPage]);

  const pageCount = flatPages.length;

  useEffect(() => {
    if (!modeNeedsEnrichment(mode)) {
      setEnrichedSections(sections);
      setEnrichError(null);
      setEnriching(false);
    }
  }, [mode, sections]);

  useEffect(() => {
    const kind = enrichKindFromMode(mode);
    if (!kind || !modeNeedsEnrichment(mode)) {
      return;
    }

    let cancelled = false;

    async function run() {
      setEnriching(true);
      setEnrichError(null);

      const allItems = sections.flatMap((s) =>
        s.items.map((i) => ({ word: i.word, meaning: i.meaning }))
      );

      const result = await fetchPrintEnrichmentBatched(kind!, allItems);
      if (cancelled) return;

      if (!result.ok) {
        setEnrichError(result.message);
        setEnriching(false);
        return;
      }

      setEnrichedSections(
        sections.map((section) => ({
          ...section,
          items: section.items.map((item) => ({
            ...item,
            enrichment: result.byWord.get(item.word.trim().toLowerCase()),
          })),
        }))
      );
      setEnriching(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [mode, sections]);

  const setMode = useCallback(
    (next: VocabPrintMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", next);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const title =
    documentTitle ??
    (sections.length === 1
      ? sections[0]!.title
      : `${sections.length}개 단어세트`);

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

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-slate-500">단어장 인쇄</p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">
              {totalItems}단어 · {pageCount}페이지
              {sections.length > 1 ? ` · ${sections.length}개 세트` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(VOCAB_PRINT_MODE_LABELS) as VocabPrintMode[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  disabled={enriching}
                  onClick={() => setMode(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    mode === key
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {VOCAB_PRINT_MODE_LABELS[key]}
                </button>
              )
            )}
            <Link
              href={backHref}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              disabled={enriching}
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>
        <p className="mx-auto max-w-[210mm] border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          {enriching
            ? "AI가 예문·동반의어를 생성하는 중입니다…"
            : "인쇄 대화상자에서 「PDF로 저장」을 선택하면 파일로 저장할 수 있습니다."}
        </p>
        {enrichError ? (
          <p className="mx-auto max-w-[210mm] px-4 pb-2 text-sm text-red-600" role="alert">
            {enrichError}
          </p>
        ) : null}
      </div>

      <div className="mx-auto max-w-[210mm] space-y-6 py-8 print:space-y-0 print:py-0">
        <div id="vocab-print-root">
          {flatPages.map(
            (
              { section, pageItems, pageIndex, sectionPageTotal, globalPageNum },
              flatIndex
            ) => (
              <article
                key={`${section.setId}-${pageIndex}`}
                className={`vocab-print-page ${flatIndex < flatPages.length - 1 ? "vocab-print-page-break" : ""}`}
                style={
                  {
                    ["--vocab-rows-per-page" as string]: perPage,
                  } as React.CSSProperties
                }
              >
                <header className="vocab-print-header">
                  <div className="vocab-print-header-top">
                    <div className="vocab-print-brand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={LOGO_SRC} alt="" className="vocab-print-logo" />
                      <div>
                        <p className="vocab-print-academy">{ACADEMY_NAME}</p>
                        <p className="vocab-print-label">VOCABULARY</p>
                      </div>
                    </div>
                    <div className="vocab-print-meta-fields">
                      <span>이름</span>
                      <span className="vocab-print-field-line" />
                      <span>날짜</span>
                      <span className="vocab-print-field-line vocab-print-field-short" />
                    </div>
                  </div>
                  <h2 className="vocab-print-title">{section.title}</h2>
                  {section.description?.trim() ? (
                    <p className="vocab-print-desc">{section.description.trim()}</p>
                  ) : null}
                  <div className="vocab-print-header-foot">
                    <span>{VOCAB_PRINT_MODE_LABELS[mode]}</span>
                    <span>
                      {pageIndex + 1} / {sectionPageTotal}
                      {sections.length > 1 ? ` · 전체 p.${globalPageNum}` : ""}
                    </span>
                  </div>
                </header>

                <div className="vocab-print-table-wrap">
                  <table className="vocab-print-table">
                    <thead>
                      <tr>
                        <th className="col-no">NO</th>
                        <th className="col-check">✓</th>
                        <th className="col-word">WORD</th>
                        {mode === "test" ? (
                          <th className="col-meaning">뜻 쓰기</th>
                        ) : mode === "companion" ? (
                          <th className="col-meaning">뜻 · 동반의어</th>
                        ) : (
                          <th className="col-meaning">MEANING</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((item, rowIndex) => {
                        const globalIndex = pageIndex * perPage + rowIndex;
                        if (!item) {
                          return (
                            <tr
                              key={`empty-${rowIndex}`}
                              className={`vocab-print-slot empty ${rowIndex % 2 === 1 ? "alt" : ""}`}
                            >
                              <td colSpan={4} />
                            </tr>
                          );
                        }
                        return (
                          <PrintRow
                            key={item.id}
                            item={item}
                            rowIndex={rowIndex}
                            globalIndex={globalIndex}
                            mode={mode}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <footer className="vocab-print-footer">
                  <span>{ACADEMY_NAME}</span>
                  <span>
                    {section.title} · p.{globalPageNum}
                  </span>
                </footer>
              </article>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PrintRow({
  item,
  rowIndex,
  globalIndex,
  mode,
}: {
  item: VocabPrintRow;
  rowIndex: number;
  globalIndex: number;
  mode: VocabPrintMode;
}) {
  const enrich = item.enrichment;
  const isExampleMode =
    mode === "example-middle" || mode === "example-high";
  const exampleSentence = isExampleMode
    ? enrich?.example_sentence?.trim() || ""
    : "";
  const exampleMeaning = isExampleMode
    ? enrich?.example_meaning?.trim() || ""
    : "";
  const companions =
    mode === "companion" ? enrich?.companion_words?.trim() ?? "" : "";

  const showExample = isExampleMode && (exampleSentence || exampleMeaning);

  return (
    <tr className={`vocab-print-slot ${rowIndex % 2 === 1 ? "alt" : ""}`}>
      <td className="col-no">{formatNo(globalIndex)}</td>
      <td className="col-check">
        <span className="vocab-print-checkbox" />
      </td>
      <td className="col-word">
        <span className="vocab-print-word">{item.word}</span>
        {showExample && exampleSentence ? (
          <p className="vocab-print-example">{exampleSentence}</p>
        ) : null}
      </td>
      <td className="col-meaning">
        {mode === "test" ? (
          <span className="vocab-print-blank-lines" />
        ) : (
          <>
            <span className="vocab-print-meaning">{item.meaning}</span>
            {mode === "companion" && companions ? (
              <p className="vocab-print-companion">
                <span className="vocab-print-companion-label">동반</span>
                {companions}
              </p>
            ) : null}
            {showExample && exampleMeaning ? (
              <p className="vocab-print-example-meaning">{exampleMeaning}</p>
            ) : null}
          </>
        )}
      </td>
    </tr>
  );
}
