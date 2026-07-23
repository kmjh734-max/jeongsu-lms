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

/** Same poster geometry; only palette changes per theme */
const THEME_PALETTE: Record<
  VocabCoverTheme,
  {
    bg0: string;
    bg1: string;
    bg2: string;
    slash0: string;
    slash1: string;
    glowA: string;
    glowB: string;
  }
> = {
  poster: {
    bg0: "#06201c",
    bg1: "#0b1220",
    bg2: "#111827",
    slash0: "#2dd4bf",
    slash1: "#22d3ee",
    glowA: "#2dd4bf",
    glowB: "#6366f1",
  },
  master: {
    bg0: "#2a1208",
    bg1: "#1a0f0a",
    bg2: "#1c1410",
    slash0: "#f97316",
    slash1: "#fbbf24",
    glowA: "#fb923c",
    glowB: "#a16207",
  },
  pop: {
    bg0: "#1e1b4b",
    bg1: "#0f172a",
    bg2: "#172554",
    slash0: "#a78bfa",
    slash1: "#f472b6",
    glowA: "#c084fc",
    glowB: "#38bdf8",
  },
};

function CoverBackdrop({ theme }: { theme: VocabCoverTheme }) {
  const p = THEME_PALETTE[theme];
  const uid = `vc-${theme}`;

  return (
    <svg
      className="vocab-cover-bg"
      viewBox="0 0 400 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={p.bg0} />
          <stop offset="55%" stopColor={p.bg1} />
          <stop offset="100%" stopColor={p.bg2} />
        </linearGradient>
        <linearGradient id={`${uid}-slash`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.slash0} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.slash1} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill={`url(#${uid}-bg)`} />
      <circle cx="355" cy="70" r="150" fill={p.glowA} opacity="0.14" />
      <circle cx="-20" cy="500" r="160" fill={p.glowB} opacity="0.16" />
      <polygon
        points="400,0 400,210 210,0"
        fill={`url(#${uid}-slash)`}
        opacity="0.9"
      />
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
