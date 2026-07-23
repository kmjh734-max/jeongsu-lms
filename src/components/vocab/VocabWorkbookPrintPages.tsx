"use client";

import {
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { tableHeadLabel, type VocabPrintMode } from "@/lib/vocab/paginate-vocab-print";
import type {
  VocabPrintRow,
  VocabPrintSection,
} from "@/lib/vocab/vocab-print-types";
import type { VocabPrintSize } from "@/lib/vocab/vocab-print-size";

export type WorkbookPrintPage = {
  section: VocabPrintSection;
  pageItems: (VocabPrintRow | null)[];
  pageIndex: number;
  sectionPageTotal: number;
  globalPageNum: number;
  sectionStartIndex: number;
};

function estimatePageStridePx(size: VocabPrintSize) {
  const mm = size === "b5" ? 250 : 297;
  return Math.round((mm * 96) / 25.4) + 32;
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

const WorkbookPage = memo(function WorkbookPage({
  page,
  flatIndex,
  totalPages,
  mode,
  size,
  layoutClass,
  pageStyle,
  academyName,
  logoSrc,
  multiSection,
  renderEntry,
}: {
  page: WorkbookPrintPage;
  flatIndex: number;
  totalPages: number;
  mode: VocabPrintMode;
  size: VocabPrintSize;
  layoutClass: string;
  pageStyle: CSSProperties;
  academyName: string;
  logoSrc: string;
  multiSection: boolean;
  renderEntry: (
    item: VocabPrintRow,
    globalIndex: number,
    mode: VocabPrintMode
  ) => ReactNode;
}) {
  const {
    section,
    pageItems,
    pageIndex,
    sectionPageTotal,
    globalPageNum,
    sectionStartIndex,
  } = page;

  return (
    <article
      className={`vocab-print-page vocab-print-page--${size} ${layoutClass} ${flatIndex < totalPages - 1 ? "vocab-print-page-break" : ""}`}
      data-size={size}
      style={pageStyle}
    >
      <PrintPageHeader
        sectionTitle={section.title}
        academyName={academyName}
        logoSrc={logoSrc}
      />

      <div className="vocab-print-table-head">
        <div>NO.</div>
        <div>WORD</div>
        <div>{tableHeadLabel(mode)}</div>
      </div>

      <div className="vocab-print-list">
        {pageItems.map((item, rowIndex) => {
          const globalIndex = sectionStartIndex + rowIndex;
          if (!item) {
            return (
              <div key={`empty-${rowIndex}`} className="vocab-print-row empty" />
            );
          }
          return renderEntry(item, globalIndex, mode);
        })}
      </div>

      <footer className="vocab-print-footer">
        <span>{academyName}</span>
        <span>
          {pageIndex + 1} / {sectionPageTotal}
          {multiSection ? ` · p.${globalPageNum}` : ""}
        </span>
      </footer>
    </article>
  );
});

type VocabWorkbookPrintPagesProps = {
  pages: WorkbookPrintPage[];
  mode: VocabPrintMode;
  size: VocabPrintSize;
  layoutClass: string;
  pageStyle: CSSProperties;
  academyName: string;
  logoSrc: string;
  multiSection: boolean;
  printing: boolean;
  scrollParentRef: RefObject<HTMLElement | null>;
  renderEntry: (
    item: VocabPrintRow,
    globalIndex: number,
    mode: VocabPrintMode
  ) => ReactNode;
};

export function VocabWorkbookPrintPages({
  pages,
  mode,
  size,
  layoutClass,
  pageStyle,
  academyName,
  logoSrc,
  multiSection,
  printing,
  scrollParentRef,
  renderEntry,
}: VocabWorkbookPrintPagesProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(900);
  // Fixed stride only — measuring live page height caused update loops
  // when different pages (or content-visibility) reported different heights.
  const stride = estimatePageStridePx(size);

  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el || printing) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrollTop(el.scrollTop);
      });
    };
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (typeof h === "number" && h > 0) {
        setViewportH((prev) => (Math.abs(prev - h) > 1 ? h : prev));
      }
    });
    ro.observe(el);
    setViewportH(el.clientHeight);
    setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollParentRef, printing, pages.length]);

  const useVirtual = !printing && pages.length > 16;

  const { start, end } = useMemo(() => {
    if (!useVirtual) return { start: 0, end: pages.length };
    const overscan = 2;
    const startIdx = Math.max(0, Math.floor(scrollTop / stride) - overscan);
    const endIdx = Math.min(
      pages.length,
      Math.ceil((scrollTop + viewportH) / stride) + overscan
    );
    return { start: startIdx, end: Math.max(startIdx + 1, endIdx) };
  }, [useVirtual, scrollTop, viewportH, stride, pages.length]);

  const slice = pages.slice(start, end);

  if (!useVirtual) {
    return (
      <div className="flex w-full flex-col items-center gap-8 print:gap-0">
        {pages.map((page, flatIndex) => (
          <WorkbookPage
            key={`${page.section.setId}-${page.pageIndex}`}
            page={page}
            flatIndex={flatIndex}
            totalPages={pages.length}
            mode={mode}
            size={size}
            layoutClass={layoutClass}
            pageStyle={pageStyle}
            academyName={academyName}
            logoSrc={logoSrc}
            multiSection={multiSection}
            renderEntry={renderEntry}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: pages.length * stride }}>
      {slice.map((page, i) => {
        const flatIndex = start + i;
        return (
          <div
            key={`${page.section.setId}-${page.pageIndex}`}
            className="absolute left-1/2 flex w-full max-w-[920px] -translate-x-1/2 justify-center"
            style={{ top: flatIndex * stride, height: stride }}
          >
            <WorkbookPage
              page={page}
              flatIndex={flatIndex}
              totalPages={pages.length}
              mode={mode}
              size={size}
              layoutClass={layoutClass}
              pageStyle={pageStyle}
              academyName={academyName}
              logoSrc={logoSrc}
              multiSection={multiSection}
              renderEntry={renderEntry}
            />
          </div>
        );
      })}
    </div>
  );
}
