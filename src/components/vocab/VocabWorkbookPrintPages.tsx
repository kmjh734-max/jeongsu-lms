"use client";

import { flushSync } from "react-dom";
import {
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { VocabPrintMode } from "@/lib/vocab/paginate-vocab-print";
import { splitPrintTitle, VocabPrintDHeader } from "@/components/vocab/VocabPrintDHeader";
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
  // 실제 쪽 높이(B5 257mm, A4 297mm) + 쪽 사이 간격(gap-8)
  const mm = size === "b5" ? 257 : 297;
  return Math.round((mm * 96) / 25.4) + 32;
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
  const titleParts = splitPrintTitle(section.title);

  return (
    <article
      className={`vocab-print-page vocab-print-page--${size} ${layoutClass} ${flatIndex < totalPages - 1 ? "vocab-print-page-break" : ""}`}
      data-size={size}
      style={pageStyle}
    >
      <VocabPrintDHeader
        badge={mode === "full" ? "IN CONTEXT" : "WORD LIST"}
        title={titleParts.main}
        tag={
          mode === "full"
            ? "예문 · 동의어 · 반의어"
            : [`${section.items.length}단어`, titleParts.tag].filter(Boolean).join(" · ")
        }
      />
      {pageIndex === 0 ? (
        <p className="vd-note">
          {mode === "full"
            ? "예문 속 단어에 밑줄을 그으며 소리 내어 읽어요. 다 읽으면 ☐에 표시해요."
            : "소리 내어 3번 읽고 ☐에 표시해요. 외운 뒤에는 점선을 접어 뜻을 가리고 스스로 확인해요."}
        </p>
      ) : null}

      {mode === "full" ? null : (
        <div className="vd-table-head">
          <span>No.</span>
          <span>단어</span>
          <span>읽기 체크</span>
          <span />
          <span>뜻</span>
        </div>
      )}

      <div className={`vocab-print-list${mode === "full" ? " vd-list--full" : " vd-list"}`}>
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

      <footer className="vocab-print-footer vd-foot">
        <span className="vd-foot-left">
          {mode === "full" ? academyName : "✂ 점선을 따라 접으세요"}
        </span>
        <span>
          {academyName} · {pageIndex + 1} / {sectionPageTotal}
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
  // Ctrl+P 등 브라우저 인쇄: 인쇄 직전에 모든 쪽을 그려 둔다(가상 목록이면 빈 쪽이 나옴)
  const [browserPrinting, setBrowserPrinting] = useState(false);
  useEffect(() => {
    const onBeforePrint = () => {
      flushSync(() => setBrowserPrinting(true));
    };
    const onAfterPrint = () => setBrowserPrinting(false);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("print")
        : null;
    const onMedia = (e: MediaQueryListEvent) => {
      if (e.matches) flushSync(() => setBrowserPrinting(true));
    };
    mql?.addEventListener?.("change", onMedia);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      mql?.removeEventListener?.("change", onMedia);
    };
  }, []);
  const renderAll = printing || browserPrinting;
  const [viewportH, setViewportH] = useState(900);
  // Fixed stride only — measuring live page height caused update loops
  // when different pages (or content-visibility) reported different heights.
  const stride = estimatePageStridePx(size);

  useEffect(() => {
    const el = scrollParentRef.current;
    if (!el || renderAll) return;

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
  }, [scrollParentRef, renderAll, pages.length]);

  const useVirtual = !renderAll && pages.length > 16;

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
