"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { highlightWordInSentence } from "@/lib/vocab/highlight-word-in-sentence";
import {
  itemsPerVocabPrintPage,
  paginateVocabItems,
  parseVocabPrintMode,
  VOCAB_PRINT_MODE_LABELS,
  type VocabPrintMode,
} from "@/lib/vocab/paginate-vocab-print";
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

interface VocabSetPrintViewProps {
  sections: VocabPrintSection[];
  backHref: string;
  documentTitle?: string;
}

function formatNo(globalIndex: number) {
  return String(globalIndex + 1).padStart(4, "0");
}

export function VocabSetPrintView({
  sections,
  backHref,
  documentTitle,
}: VocabSetPrintViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = parseVocabPrintMode(searchParams.get("mode") ?? undefined);
  const size = parseVocabPrintSize(searchParams.get("size") ?? undefined);

  const pageDims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const perPage = itemsPerVocabPrintPage(mode, size);

  const totalItems = useMemo(
    () => sections.reduce((n, s) => n + s.items.length, 0),
    [sections]
  );

  const flatPages = useMemo(() => {
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
      const pages = paginateVocabItems(section.items, perPage);
      pages.forEach((pageItems, pageIndex) => {
        globalPageNum += 1;
        rows.push({
          section,
          pageItems,
          pageIndex,
          sectionPageTotal: pages.length,
          globalPageNum,
          sectionStartIndex: pageIndex * perPage,
        });
      });
    }
    return rows;
  }, [sections, perPage]);

  const pageCount = flatPages.length;

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
        ? "@page { size: B5 portrait; margin: 0; }"
        : "@page { size: A4 portrait; margin: 0; }";
    return () => {
      el?.remove();
    };
  }, [size]);

  const setQuery = useCallback(
    (key: "mode" | "size", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
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
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          style={{ maxWidth: pageDims.width }}
        >
          <div>
            <p className="text-xs font-medium text-slate-500">단어장 인쇄</p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">
              {totalItems}단어 · {pageCount}페이지 · {VOCAB_PRINT_SIZE_LABELS[size]}
              {sections.length > 1 ? ` · ${sections.length}개 세트` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">용지</span>
            {(["a4", "b5"] as VocabPrintSize[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setQuery("size", key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  size === key
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {VOCAB_PRINT_SIZE_LABELS[key]}
              </button>
            ))}
            <span className="mx-1 text-slate-300">|</span>
            {(Object.keys(VOCAB_PRINT_MODE_LABELS) as VocabPrintMode[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQuery("mode", key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>
        <p
          className="mx-auto border-t border-slate-100 px-4 py-2 text-xs text-slate-500"
          style={{ maxWidth: pageDims.width }}
        >
          용지 크기({VOCAB_PRINT_SIZE_LABELS[size]})를 선택한 뒤 인쇄하세요. PDF 저장 시에도
          같은 용지 설정이 적용됩니다.
        </p>
      </div>

      <div
        className="mx-auto space-y-6 py-8 print:space-y-0 print:py-0"
        style={{ maxWidth: pageDims.width }}
      >
        <div id="vocab-print-root" data-size={size}>
          {flatPages.map(
            (
              {
                section,
                pageItems,
                pageIndex,
                sectionPageTotal,
                globalPageNum,
                sectionStartIndex,
              },
              flatIndex
            ) => (
              <article
                key={`${section.setId}-${pageIndex}`}
                className={`vocab-print-page vocab-print-page--${size} ${flatIndex < flatPages.length - 1 ? "vocab-print-page-break" : ""}`}
                data-size={size}
                style={
                  {
                    ["--vocab-rows-per-page" as string]: perPage,
                    ["--vocab-page-width" as string]: pageDims.width,
                    ["--vocab-page-height" as string]: pageDims.height,
                    ["--vocab-body-height" as string]: pageDims.bodyHeight,
                  } as React.CSSProperties
                }
              >
                <header className="vocab-print-header">
                  <div className="vocab-print-header-top">
                    <div className="vocab-print-header-logo-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LOGO_SRC}
                        alt={ACADEMY_NAME}
                        className="vocab-print-logo-hero"
                      />
                    </div>
                    <div className="vocab-print-brand-block">
                      <p className="vocab-print-academy">{ACADEMY_NAME}</p>
                      <h2 className="vocab-print-title">{section.title}</h2>
                    </div>
                    <div className="vocab-print-meta-fields">
                      <div className="vocab-print-meta-item">
                        <span>이름</span>
                        <span className="vocab-print-field-line" />
                      </div>
                      <div className="vocab-print-meta-item">
                        <span>날짜</span>
                        <span className="vocab-print-field-line vocab-print-field-short" />
                      </div>
                    </div>
                  </div>
                  <div className="vocab-print-header-foot">
                    <span className="vocab-print-header-mode">
                      {VOCAB_PRINT_MODE_LABELS[mode]}
                    </span>
                    <span className="vocab-print-header-page">
                      {pageIndex + 1} / {sectionPageTotal}
                      {sections.length > 1 ? ` · 전체 p.${globalPageNum}` : ""}
                    </span>
                  </div>
                </header>

                <div className="vocab-print-list">
                  {pageItems.map((item, rowIndex) => {
                    const globalIndex = sectionStartIndex + rowIndex;
                    if (!item) {
                      return (
                        <div
                          key={`empty-${rowIndex}`}
                          className={`vocab-print-entry empty ${rowIndex % 2 === 1 ? "alt" : ""}`}
                        />
                      );
                    }
                    return (
                      <PrintEntry
                        key={item.id}
                        item={item}
                        rowIndex={rowIndex}
                        globalIndex={globalIndex}
                        mode={mode}
                      />
                    );
                  })}
                </div>

                <footer className="vocab-print-footer">
                  <span>{ACADEMY_NAME}</span>
                  <span>
                    {section.title} · p.{globalPageNum} · {VOCAB_PRINT_SIZE_LABELS[size]}
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

function PrintEntry({
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
  const exampleSentence = item.example_sentence?.trim() ?? "";
  const exampleMeaning = item.example_meaning?.trim() ?? "";
  const synonyms = item.synonyms?.trim() ?? "";
  const antonyms = item.antonyms?.trim() ?? "";
  const showFull = mode === "full";

  return (
    <div className={`vocab-print-entry ${rowIndex % 2 === 1 ? "alt" : ""}`}>
      <div className="vocab-print-entry-index">
        <span className="vocab-print-no">{formatNo(globalIndex)}</span>
        <div className="vocab-print-checks" aria-hidden>
          <span className="vocab-print-checkbox" />
          <span className="vocab-print-checkbox" />
        </div>
      </div>

      <div className="vocab-print-entry-word">
        <p className="vocab-print-word-text">{item.word}</p>
      </div>

      <div className="vocab-print-entry-body">
        {mode === "test" ? (
          <div className="vocab-print-test-blank" />
        ) : (
          <>
            <p className="vocab-print-meaning">{item.meaning}</p>

            {showFull && exampleSentence ? (
              <p className="vocab-print-example">
                {highlightWordInSentence(exampleSentence, item.word)}
              </p>
            ) : null}

            {showFull && exampleMeaning ? (
              <p className="vocab-print-example-ko">{exampleMeaning}</p>
            ) : null}

            {showFull && (synonyms || antonyms) ? (
              <div className="vocab-print-related-row">
                {synonyms ? (
                  <p className="vocab-print-related">
                    <span className="vocab-print-related-tag">동의</span>
                    {synonyms}
                  </p>
                ) : null}
                {antonyms ? (
                  <p className="vocab-print-related vocab-print-related--ant">
                    <span className="vocab-print-related-tag">반의</span>
                    {antonyms}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
