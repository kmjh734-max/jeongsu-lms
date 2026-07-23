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

function CoverArt({ theme }: { theme: VocabCoverTheme }) {
  if (theme === "poster") {
    return (
      <svg
        className="vocab-cover-art"
        viewBox="0 0 320 220"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="vc-poster-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="55%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <circle cx="250" cy="40" r="56" fill="url(#vc-poster-g)" opacity="0.35" />
        <circle cx="40" cy="180" r="40" fill="#2dd4bf" opacity="0.2" />
        <path
          d="M20 160 C80 80, 160 200, 300 70"
          fill="none"
          stroke="url(#vc-poster-g)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M40 40h40v14H40zm0 28h64v10H40zm0 24h48v10H40z"
          fill="#2dd4bf"
          opacity="0.45"
        />
      </svg>
    );
  }

  if (theme === "master") {
    return (
      <svg
        className="vocab-cover-art"
        viewBox="0 0 360 240"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="vc-master-g" x1="0" y1="0.2" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="45%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        {[0, 14, 28, 42, 56, 70].map((dx) => (
          <path
            key={dx}
            d={`M${48 + dx} 40 L${120 + dx} 200 L${160 + dx} 200 L${88 + dx} 40 Z`}
            fill="none"
            stroke="url(#vc-master-g)"
            strokeWidth="7"
            strokeLinejoin="round"
            opacity={0.85 - dx * 0.008}
          />
        ))}
        {[0, 14, 28, 42, 56, 70].map((dx) => (
          <path
            key={`r-${dx}`}
            d={`M${200 + dx} 40 L${128 + dx} 200 L${168 + dx} 200 L${240 + dx} 40 Z`}
            fill="none"
            stroke="url(#vc-master-g)"
            strokeWidth="7"
            strokeLinejoin="round"
            opacity={0.85 - dx * 0.008}
          />
        ))}
      </svg>
    );
  }

  // pop — dotted abstract mark
  return (
    <svg
      className="vocab-cover-art"
      viewBox="0 0 280 280"
      aria-hidden
      focusable="false"
    >
      {Array.from({ length: 14 }, (_, row) =>
        Array.from({ length: 14 }, (_, col) => {
          const cx = 28 + col * 17;
          const cy = 28 + row * 17;
          const dx = col - 6.5;
          const dy = row - 6.5;
          const inRing = Math.abs(Math.hypot(dx, dy) - 4.2) < 1.35;
          const inCheck =
            (col >= 4 && col <= 6 && row >= 7 && row <= 10) ||
            (col >= 7 && col <= 11 && row >= 4 && row <= 6 && col + row >= 13);
          if (!inRing && !inCheck) return null;
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r={inCheck ? 3.4 : 2.6}
              fill="#fff"
              opacity={inCheck ? 0.95 : 0.55}
            />
          );
        })
      )}
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
  const theme: VocabCoverTheme = cover.theme;
  const mark = (cover.heroMark || "V").slice(0, 4);

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
        <div className="vocab-cover-art-wrap" aria-hidden>
          <CoverArt theme={theme} />
        </div>

        <header className="vocab-cover-top">
          <div className="vocab-cover-brand">
            <div className="vocab-cover-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="" className="vocab-cover-logo-img" />
            </div>
            <p className="vocab-cover-academy">{cover.academyName}</p>
          </div>
          {cover.slogan.trim() ? (
            <p className="vocab-cover-slogan">{cover.slogan}</p>
          ) : null}
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

        <div className="vocab-cover-mark-row">
          <div className="vocab-cover-mark" aria-hidden>
            <span className="vocab-cover-mark-num">{mark}</span>
          </div>
          {cover.badge.trim() ? (
            <div className="vocab-cover-badge">
              <span>{cover.badge}</span>
            </div>
          ) : null}
        </div>

        {cover.metaLine.trim() ? (
          <ul className="vocab-cover-bullets">
            {cover.metaLine
              .split(/[·|]/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 3)
              .map((line) => (
                <li key={line}>★ {line}</li>
              ))}
          </ul>
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
