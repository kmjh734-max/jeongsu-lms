"use client";

import type { CSSProperties } from "react";
import type { VocabCoverTheme, VocabPrintCoverSettings } from "@/lib/vocab/vocab-print-cover";
import type { VocabPrintSize } from "@/lib/vocab/vocab-print-size";
import { VOCAB_PRINT_PAGE_DIMENSIONS } from "@/lib/vocab/vocab-print-size";

type VocabPrintCoverPageProps = {
  cover: VocabPrintCoverSettings;
  size: VocabPrintSize;
  logoSrc: string;
  pageBreakAfter?: boolean;
};

export function VocabPrintCoverPage({
  cover,
  size,
  logoSrc,
  pageBreakAfter = true,
}: VocabPrintCoverPageProps) {
  const dims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const theme: VocabCoverTheme = cover.theme;

  return (
    <article
      className={`vocab-print-page vocab-print-page--${size} vocab-print-cover vocab-print-cover--${theme} ${pageBreakAfter ? "vocab-print-page-break" : ""}`}
      data-size={size}
      style={
        {
          ["--vocab-page-width" as string]: dims.width,
          ["--vocab-page-height" as string]: dims.height,
        } as CSSProperties
      }
    >
      <div className="vocab-cover-accent" aria-hidden />
      <div className="vocab-cover-inner">
        <header className="vocab-cover-brand">
          <div className="vocab-cover-logo-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="vocab-cover-logo-img" />
          </div>
          <p className="vocab-cover-academy">{cover.academyName}</p>
        </header>

        <div className="vocab-cover-hero">
          {cover.seriesLabel.trim() ? (
            <p className="vocab-cover-series">{cover.seriesLabel}</p>
          ) : null}
          <h1 className="vocab-cover-title">{cover.title || "단어장"}</h1>
          {cover.subtitle.trim() ? (
            <p className="vocab-cover-subtitle">{cover.subtitle}</p>
          ) : null}
        </div>

        <div className="vocab-cover-rule" aria-hidden>
          <span />
        </div>

        {cover.metaLine.trim() ? (
          <p className="vocab-cover-meta">{cover.metaLine}</p>
        ) : null}

        <div className="vocab-cover-spacer" />

        {cover.showNameFields ? (
          <div className="vocab-cover-fields">
            <div className="vocab-cover-field">
              <span>이름</span>
              <i />
            </div>
            <div className="vocab-cover-field">
              <span>반</span>
              <i />
            </div>
          </div>
        ) : null}

        <footer className="vocab-cover-footer">
          <span>{cover.academyName}</span>
          <span>Vocabulary Workbook</span>
        </footer>
      </div>
      <div className="vocab-cover-accent vocab-cover-accent--bottom" aria-hidden />
    </article>
  );
}
