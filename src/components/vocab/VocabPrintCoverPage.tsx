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
        <polygon points="400,0 400,210 210,0" fill="url(#vc-p-slash)" opacity="0.9" />
        <rect x="0" y="470" width="400" height="90" fill="#2dd4bf" opacity="0.12" />
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
        <rect width="400" height="560" fill="#f3ebe2" />
        <rect x="0" y="0" width="400" height="92" fill="#1c1917" />
        <rect x="0" y="92" width="400" height="10" fill="#ea580c" />
        <rect x="0" y="480" width="400" height="80" fill="#166534" opacity="0.12" />
        <rect x="318" y="120" width="18" height="320" fill="#ea580c" opacity="0.85" />
        <rect x="344" y="120" width="6" height="320" fill="#166534" opacity="0.7" />
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
      <defs>
        <linearGradient id="vc-pop-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#vc-pop-bg)" />
      <circle cx="340" cy="130" r="170" fill="#fde047" opacity="0.22" />
      <circle cx="40" cy="460" r="130" fill="#000" opacity="0.18" />
      <rect x="0" y="0" width="22" height="560" fill="#fde047" />
      <rect x="0" y="500" width="400" height="60" fill="#0f172a" opacity="0.35" />
    </svg>
  );
}

function splitMeta(metaLine: string): string[] {
  return metaLine
    .split(/[·|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function splitStat(part: string): { value: string; label: string } {
  const m = part.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (m && m[1] && m[2]) {
    return { value: m[1], label: m[2].trim() || part };
  }
  return { value: part.slice(0, 6), label: "" };
}

export function VocabPrintCoverPage({
  cover,
  size,
  logoSrc,
  pageBreakAfter = true,
}: VocabPrintCoverPageProps) {
  const dims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const theme = cover.theme;
  const metaParts = splitMeta(cover.metaLine);
  const stats = metaParts.map(splitStat);

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

        <header className="vocab-cover-top">
          <div className="vocab-cover-brand">
            <div className="vocab-cover-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="" className="vocab-cover-logo-img" />
            </div>
            <div className="vocab-cover-brand-text">
              <p className="vocab-cover-academy">{cover.academyName}</p>
              <p className="vocab-cover-kicker">Vocabulary Workbook</p>
            </div>
          </div>
          {cover.heroMark.trim() ? (
            <span className="vocab-cover-mark-soft">{cover.heroMark}</span>
          ) : null}
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
        </div>

        {stats.length > 0 ? (
          <div className="vocab-cover-stats" aria-label={cover.metaLine}>
            {stats.map((s, i) => (
              <div key={`${s.value}-${i}`} className="vocab-cover-stat">
                <strong>{s.value}</strong>
                {s.label ? <span>{s.label}</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="vocab-cover-band">
          <span className="vocab-cover-band-text">
            {cover.slogan.trim() || "Vocabulary Workbook"}
          </span>
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
          <span>{cover.academyName}</span>
          <span>Vocabulary Workbook</span>
        </footer>
      </div>
    </article>
  );
}
