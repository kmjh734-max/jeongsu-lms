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

/** Geometry only — no text boxes / seals */
function CoverBackdrop({ theme }: { theme: VocabCoverTheme }) {
  if (theme === "poster") {
    return (
      <svg
        className="vocab-cover-bg"
        viewBox="0 0 400 560"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="vc-p-bg" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#06201c" />
            <stop offset="55%" stopColor="#0b1220" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="vc-p-slash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="400" height="560" fill="url(#vc-p-bg)" />
        <circle cx="355" cy="70" r="150" fill="#2dd4bf" opacity="0.14" />
        <circle cx="-20" cy="500" r="160" fill="#6366f1" opacity="0.16" />
        <polygon
          points="400,0 400,210 210,0"
          fill="url(#vc-p-slash)"
          opacity="0.9"
        />
      </svg>
    );
  }

  if (theme === "master") {
    return (
      <svg
        className="vocab-cover-bg"
        viewBox="0 0 400 560"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        <rect width="400" height="560" fill="#f7f2ea" />
        <rect x="0" y="0" width="400" height="8" fill="#ea580c" />
        <rect x="0" y="552" width="400" height="8" fill="#166534" />
        <line
          x1="36"
          y1="120"
          x2="36"
          y2="440"
          stroke="#ea580c"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg
      className="vocab-cover-bg"
      viewBox="0 0 400 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <rect width="400" height="560" fill="#ffffff" />
      <rect x="0" y="0" width="400" height="168" fill="#1d4ed8" />
      <rect x="0" y="168" width="400" height="10" fill="#f59e0b" />
      <circle cx="360" cy="70" r="90" fill="#fff" opacity="0.12" />
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
  const seriesBits = [cover.seriesLabel, cover.badge, cover.heroMark]
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article
      className={`vocab-print-page vocab-print-page--${size} vocab-print-cover vocab-print-cover--${theme} vocab-print-cover-font--${cover.fontFamily} vocab-print-cover-size--${cover.titleSize} ${pageBreakAfter ? "vocab-print-page-break" : ""}`}
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

        <header className="vocab-cover-top">
          <div className="vocab-cover-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="vocab-cover-logo-img" />
            <p className="vocab-cover-academy">{cover.academyName}</p>
          </div>
        </header>

        <div className="vocab-cover-hero">
          {seriesBits.length > 0 ? (
            <p className="vocab-cover-series">{seriesBits.join("  ·  ")}</p>
          ) : null}
          <h1 className="vocab-cover-title">{cover.title || "단어장"}</h1>
          {cover.subtitle.trim() ? (
            <p className="vocab-cover-subtitle">{cover.subtitle}</p>
          ) : null}
          {cover.metaLine.trim() ? (
            <p className="vocab-cover-meta-line">{cover.metaLine}</p>
          ) : null}
          {cover.slogan.trim() ? (
            <p className="vocab-cover-slogan">{cover.slogan}</p>
          ) : null}
        </div>

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
          <span className="vocab-cover-footer-left">{cover.academyName}</span>
          {cover.footerText.trim() ? (
            <span className="vocab-cover-footer-right">{cover.footerText}</span>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
