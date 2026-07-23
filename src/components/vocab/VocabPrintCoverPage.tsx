"use client";

import type { CSSProperties } from "react";
import type {
  VocabCoverTheme,
  VocabPrintCoverSettings,
} from "@/lib/vocab/vocab-print-cover";
import type { VocabPrintSize } from "@/lib/vocab/vocab-print-size";
import { VOCAB_PRINT_PAGE_DIMENSIONS } from "@/lib/vocab/vocab-print-size";

type VocabPrintCoverPageProps = {
  cover: VocabPrintCoverSettings;
  size: VocabPrintSize;
  logoSrc: string;
  pageBreakAfter?: boolean;
};

/** Quiet geometric backdrop — no 3D numbers / gold seals */
function CoverBackdrop({ theme }: { theme: VocabCoverTheme }) {
  if (theme === "poster") {
    return (
      <svg className="vocab-cover-bg" viewBox="0 0 400 560" aria-hidden focusable="false">
        <defs>
          <linearGradient id="vc-bg-p" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <rect width="400" height="560" fill="url(#vc-bg-p)" />
        <circle cx="340" cy="120" r="110" fill="#14b8a6" opacity="0.08" />
        <circle cx="60" cy="480" r="90" fill="#818cf8" opacity="0.1" />
        <path
          d="M0 420 C120 360 200 500 400 380"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="1.5"
          opacity="0.35"
        />
      </svg>
    );
  }

  if (theme === "master") {
    return (
      <svg className="vocab-cover-bg" viewBox="0 0 400 560" aria-hidden focusable="false">
        <defs>
          <linearGradient id="vc-bg-m" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <rect width="400" height="560" fill="url(#vc-bg-m)" />
        <rect x="280" y="0" width="8" height="560" fill="#c2410c" opacity="0.12" />
        <rect x="296" y="0" width="3" height="560" fill="#15803d" opacity="0.18" />
        <path
          d="M40 80 H360 M40 92 H280"
          stroke="#3f2a1d"
          strokeWidth="1"
          opacity="0.12"
        />
      </svg>
    );
  }

  return (
    <svg className="vocab-cover-bg" viewBox="0 0 400 560" aria-hidden focusable="false">
      <circle cx="320" cy="160" r="140" fill="#fff" opacity="0.08" />
      <circle cx="40" cy="420" r="100" fill="#000" opacity="0.1" />
      <rect x="0" y="500" width="400" height="60" fill="#000" opacity="0.12" />
    </svg>
  );
}

export function VocabPrintCoverPage({
  cover,
  size,
  logoSrc,
  pageBreakAfter = true,
}: VocabPrintCoverPageProps) {
  const dims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const theme = cover.theme;
  const metaParts = cover.metaLine
    .split(/[·|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

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
      <div className="vocab-cover-stage">
        <CoverBackdrop theme={theme} />

        <div className="vocab-cover-bar" aria-hidden />

        <header className="vocab-cover-top">
          <div className="vocab-cover-brand">
            <div className="vocab-cover-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="" className="vocab-cover-logo-img" />
            </div>
            <div>
              <p className="vocab-cover-academy">{cover.academyName}</p>
              {cover.slogan.trim() ? (
                <p className="vocab-cover-slogan">{cover.slogan}</p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="vocab-cover-hero">
          <div className="vocab-cover-chips">
            {cover.seriesLabel.trim() ? (
              <span className="vocab-cover-chip">{cover.seriesLabel}</span>
            ) : null}
            {cover.badge.trim() ? (
              <span className="vocab-cover-chip vocab-cover-chip--soft">
                {cover.badge}
              </span>
            ) : null}
          </div>
          <h1 className="vocab-cover-title">{cover.title || "단어장"}</h1>
          {cover.subtitle.trim() ? (
            <p className="vocab-cover-subtitle">{cover.subtitle}</p>
          ) : null}
          {cover.heroMark.trim() ? (
            <p className="vocab-cover-mark-soft">{cover.heroMark}</p>
          ) : null}
        </div>

        {metaParts.length > 0 ? (
          <p className="vocab-cover-meta-line">{metaParts.join("  ·  ")}</p>
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
    </article>
  );
}
