"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { CoverPreset, IntegratedCover } from "@/lib/lesson-materials/integrated";
import "./bundle-cover-styles.css";

/**
 * 최종통합자료의 앞표지·뒤표지·목차·간지 쪽. 모두 A4 한 쪽이고, 인쇄에서 배경색까지 그대로
 * 찍히게 한다. 앞표지는 승인된 여덟 가지 시안(bundle-cover-styles.css)을 프리셋으로 고른다.
 */

const SHEET_STYLE: CSSProperties = {
  width: "210mm",
  height: "297mm",
  boxSizing: "border-box",
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

/** 표지 시안이 쓰는 글꼴(다른 인쇄물과 같은 묶음). */
const COVER_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&display=swap";

function Sheet({
  children,
  style,
  last,
}: {
  children: ReactNode;
  style?: CSSProperties;
  last?: boolean;
}) {
  return (
    <article
      className={`final-bundle-sheet relative overflow-hidden bg-white shadow-xl print:shadow-none ${
        last ? "final-bundle-sheet--last" : ""
      }`}
      style={{ ...SHEET_STYLE, ...style }}
    >
      {children}
    </article>
  );
}

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * 제목 글자 크기(px). 시안 크기에서 0.5px씩 내려가며, 그 크기로 찍었을 때 제목 덩어리가
 * 제목 칸 높이 안에 들어가는 첫 크기를 쓴다. 글자 폭은 한글 1em, 공백 0.3em, 그 밖은
 * 0.58em으로 세고 자간을 더한다. 한 줄이 칸보다 넓으면 넘어가는 줄 수까지 미리 세므로,
 * 긴 제목이 아래 장식이나 다음 줄과 겹치지 않는다. 더 줄일 수 없는 크기가 하한이다.
 */
const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

function lineUnits(line: string, tracking: number): number {
  return Array.from(line).reduce(
    (n, ch) => n + (HANGUL.test(ch) ? 1 : ch === " " ? 0.3 : 0.58) + tracking,
    0
  );
}

type TitleBox = {
  /** 제목 칸 너비(px) */
  widthPx: number;
  /** 시안의 제목 크기(px) */
  maxPx: number;
  /** 더는 줄이지 않는 크기(px) */
  minPx: number;
  /** 시안의 자간(em) */
  tracking: number;
  /** 제목 칸 높이(px) */
  heightPx: number;
  /** 시안의 줄 간격 */
  lineHeight: number;
};

function fitPx(titleLines: string[], box: TitleBox): number {
  const units = titleLines.map((l) => Math.max(0.6, lineUnits(l, box.tracking)));
  // 낱말 단위로 끊기느라 줄 끝이 조금 비는 몫을 미리 뺀다.
  const usable = box.widthPx * 0.98;
  for (let size = box.maxPx; size > box.minPx; size -= 0.5) {
    const rows = units.reduce((n, u) => n + Math.max(1, Math.ceil((u * size) / usable)), 0);
    if (rows * box.lineHeight * size <= box.heightPx) return size;
  }
  return box.minPx;
}

function TitleLines({ lines: titleLines }: { lines: string[] }) {
  return (
    <>
      {titleLines.map((l, i) => (
        <span key={i}>{l}</span>
      ))}
    </>
  );
}

/** 표지가 쓰는 조각들. 표지마다 자리만 다르고 내용은 같다. */
type CoverBits = {
  titleLines: string[];
  /** 학원명 */
  academy: string;
  /** 시험범위 라벨 */
  label: string;
  /** 제목 아래 작은 한 줄(진도 첫 줄) */
  en: string;
  /** 꼬릿말 오른쪽 한 마디(진도 둘째 줄부터) */
  note: string;
  /** 제목에서 찾은 과 번호("02" 같은 두 자리) — 없으면 빈 값 */
  lessonNo: string;
  /** 워터마크에 쓸 이니셜 */
  initial: string;
};

function lessonNumber(text: string): string {
  const ko = text.match(/(\d{1,2})\s*과/);
  const en = text.match(/(?:lesson|unit|chapter)\s*0?(\d{1,2})/i);
  const n = ko?.[1] ?? en?.[1];
  return n ? n.padStart(2, "0") : "";
}

function coverBits(cover: IntegratedCover): CoverBits {
  const progress = lines(cover.progress ?? "");
  const titleLines = lines(cover.title ?? "");
  const title = titleLines.join(" ");
  const label = (cover.label ?? "").trim();
  return {
    titleLines: titleLines.length ? titleLines : ["제목"],
    academy: (cover.academy ?? "").trim(),
    label,
    en: progress[0] ?? "",
    note: progress.slice(1).join(" · "),
    lessonNo: lessonNumber(title) || lessonNumber(label),
    initial: (title.match(/[A-Za-z]/)?.[0] ?? "E").toUpperCase(),
  };
}

/**
 * 머릿말 로고 자리. 학원 로고가 있으면 그 이미지를, 없거나 불러오지 못하면 시안의 마크를
 * 쓴다. 이미지가 깨져도 자리는 비지 않는다.
 */
function CoverLogo({
  logoSrc,
  height,
  fallback,
}: {
  logoSrc?: string | null;
  height: number;
  fallback: ReactNode;
}) {
  const url = (logoSrc ?? "").trim();
  const [broken, setBroken] = useState("");
  if (!url || broken === url) return <>{fallback}</>;
  return (
    // 외부(스토리지) 주소가 대부분이고 인쇄용이라 next/image를 쓰지 않는다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="bc-logo"
      style={{ height: `${height}px` }}
      onError={() => setBroken(url)}
    />
  );
}

type CoverProps = { cover: IntegratedCover; logoSrc?: string | null };

/* ──────────────── 1. 색면 폭발 ──────────────── */
function BoldFieldCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 686,
    maxPx: 96,
    minPx: 34,
    tracking: -0.055,
    heightPx: 212,
    lineHeight: 1.04,
  });
  return (
    <div className="bc bc-k1">
      <div className="bc-top">
        <div className="bc-lock">
          <CoverLogo
            logoSrc={logoSrc}
            height={38}
            fallback={
              <svg className="bc-mk" width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="4" y="4" width="40" height="40" fill="#fff" />
                <path d="M15 33.5 24.5 14 34 33.5H15Z" fill="#D8381B" />
              </svg>
            }
          />
          {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
        </div>
      </div>
      {b.label ? <p className="bc-chip bc-pill">{b.label}</p> : null}
      <h1 style={{ fontSize: `${size}px` }}>
        <TitleLines lines={b.titleLines} />
      </h1>
      {b.lessonNo ? <p className="bc-stroke">LESSON {b.lessonNo}</p> : null}
      {b.en ? <p className="bc-en">{b.en}</p> : null}
      <div className="bc-foot">
        <p className="bc-a">{b.academy}</p>
        {b.note ? <p className="bc-b">{b.note}</p> : null}
      </div>
    </div>
  );
}

/* ──────────────── 2. 원형 기하 ──────────────── */
function CircleCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 468,
    maxPx: 54,
    minPx: 24,
    tracking: -0.04,
    heightPx: 300,
    lineHeight: 1.24,
  });
  return (
    <div className="bc bc-k2">
      <div className="bc-arc2" />
      <div className="bc-ring" />
      <div className="bc-disc" />
      <div className="bc-arc" />
      <div className="bc-top">
        <div className="bc-lock">
          <CoverLogo
            logoSrc={logoSrc}
            height={38}
            fallback={
              <svg className="bc-mk" width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden>
                <circle cx="24" cy="24" r="19" stroke="#F5B72C" strokeWidth="2.6" />
                <circle cx="24" cy="24" r="10" stroke="#fff" strokeWidth="2.6" />
                <circle cx="24" cy="24" r="3.4" fill="#F5B72C" />
              </svg>
            }
          />
          {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
        </div>
      </div>
      <div className="bc-core">
        {b.label ? <p className="bc-kick">{b.label}</p> : null}
        <div className="bc-bar" />
        <h1 style={{ fontSize: `${size}px` }}>
          <TitleLines lines={b.titleLines} />
        </h1>
        {b.en ? <p className="bc-en">{b.en}</p> : null}
      </div>
      <div className="bc-foot">
        <p>{b.academy}</p>
        {b.note ? <p className="bc-rt">{b.note}</p> : null}
      </div>
    </div>
  );
}

/* ──────────────── 3. 겹친 면 ──────────────── */
function LayersCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 542,
    maxPx: 52,
    minPx: 24,
    tracking: -0.045,
    heightPx: 420,
    lineHeight: 1.22,
  });
  return (
    <div className="bc bc-k3">
      <div className="bc-p1">
        {b.note ? <p className="bc-tag">{b.note}</p> : null}
        {b.label ? <p className="bc-kick">{b.label}</p> : null}
      </div>
      <div className="bc-p2">{b.lessonNo ? <p className="bc-num">{b.lessonNo}</p> : null}</div>
      <div className="bc-top">
        <div className="bc-lock">
          <CoverLogo
            logoSrc={logoSrc}
            height={36}
            fallback={
              <svg className="bc-mk" width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="6" y="6" width="26" height="26" fill="#16386F" />
                <rect x="16" y="16" width="26" height="26" fill="#F0693A" />
                <rect x="16" y="16" width="16" height="16" fill="#8d4a2e" />
              </svg>
            }
          />
          {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
        </div>
      </div>
      <div className="bc-card">
        {b.label ? <p className="bc-chip">{b.label}</p> : null}
        <h1 style={{ fontSize: `${size}px` }}>
          <TitleLines lines={b.titleLines} />
        </h1>
        {b.en ? <p className="bc-en">{b.en}</p> : null}
      </div>
      <p className="bc-base">{[b.academy, b.note].filter(Boolean).join(" · ")}</p>
    </div>
  );
}

/* ──────────────── 4. 아치 창 ──────────────── */
function ArchCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 512,
    maxPx: 64,
    minPx: 26,
    tracking: -0.055,
    heightPx: 330,
    lineHeight: 1.2,
  });
  return (
    <div className="bc bc-k4">
      <div className="bc-halo" />
      <div className="bc-arch" />
      {b.note ? <p className="bc-yr">{b.note}</p> : null}
      <div className="bc-in">
        {b.label ? <p className="bc-chip">{b.label}</p> : null}
        <h1 style={{ fontSize: `${size}px` }}>
          <TitleLines lines={b.titleLines} />
        </h1>
        <div className="bc-bar" />
        {b.en ? <p className="bc-en">{b.en}</p> : null}
      </div>
      <div className="bc-lock">
        <CoverLogo
          logoSrc={logoSrc}
          height={36}
          fallback={
            <svg className="bc-mk" width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
              <path d="M8 43V23a16 16 0 0 1 32 0v20H8Z" fill="#F7ECD9" />
              <path d="M18 43V24a6 6 0 0 1 12 0v19H18Z" fill="#63124C" />
            </svg>
          }
        />
        {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
      </div>
    </div>
  );
}

/* ──────────────── 5. 굵은 테두리 프레임 ──────────────── */
function FrameCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 634,
    maxPx: 76,
    minPx: 28,
    tracking: -0.055,
    heightPx: 212,
    lineHeight: 1.2,
  });
  return (
    <div className="bc bc-k5">
      <div className="bc-field" />
      {b.note ? (
        <div className="bc-strip">
          <span>{b.note}</span>
        </div>
      ) : null}
      {b.label ? <p className="bc-chip bc-pill">{b.label}</p> : null}
      {b.en ? <p className="bc-en">{b.en}</p> : null}
      <h1 style={{ fontSize: `${size}px` }}>
        <TitleLines lines={b.titleLines} />
      </h1>
      <div className="bc-bar" />
      <div className="bc-lock">
        <CoverLogo
          logoSrc={logoSrc}
          height={34}
          fallback={
            <svg className="bc-mk" width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden>
              <rect x="4" y="4" width="40" height="40" fill="#14161B" />
              <rect x="13" y="13" width="22" height="22" fill="#F3C324" />
            </svg>
          }
        />
        {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
      </div>
    </div>
  );
}

/* ──────────────── 6. 대형 이니셜 워터마크 ──────────────── */
function InitialCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 642,
    maxPx: 94,
    minPx: 30,
    tracking: -0.058,
    heightPx: 240,
    lineHeight: 1.14,
  });
  return (
    <div className="bc bc-k6">
      <p className="bc-wm" aria-hidden>
        {b.initial}
      </p>
      <div className="bc-hair" />
      {b.label ? <p className="bc-chip bc-pill">{b.label}</p> : null}
      {b.en ? <p className="bc-en">{b.en}</p> : null}
      <h1 style={{ fontSize: `${size}px` }}>
        <TitleLines lines={b.titleLines} />
      </h1>
      <div className="bc-bar" />
      <div className="bc-lock">
        <CoverLogo
          logoSrc={logoSrc}
          height={36}
          fallback={
            <svg className="bc-mk" width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden>
              <rect x="5" y="5" width="38" height="38" fill="#fff" />
              <path d="M15 14h19v5.4H20.6v5.1h12v5.4h-12V34H34v5.4H15V14Z" fill="#0B6B45" />
            </svg>
          }
        />
        {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
      </div>
      {b.note ? <p className="bc-date">{b.note}</p> : null}
    </div>
  );
}

/* ──────────────── 7. 곡선 물결 분할 ──────────────── */
function WaveCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 678,
    maxPx: 86,
    minPx: 30,
    tracking: -0.058,
    heightPx: 380,
    lineHeight: 1.16,
  });
  return (
    <div className="bc bc-k7">
      <svg
        className="bc-wave"
        viewBox="0 0 794 520"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path d="M0 0H794V300C690 330 620 436 470 452C300 470 180 360 0 404Z" fill="#0A6274" />
        <path
          d="M0 432C180 388 300 498 470 480C620 464 690 358 794 328"
          stroke="#E8A33C"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      <div className="bc-top">
        {b.label ? <p className="bc-chip">{b.label}</p> : <span />}
        <div className="bc-lock">
          <CoverLogo
            logoSrc={logoSrc}
            height={36}
            fallback={
              <svg className="bc-mk" width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="5" y="5" width="38" height="38" fill="#fff" />
                <path
                  d="M10 20c3.2-5.4 6-5.4 9.2 0s6 5.4 9.2 0 6-5.4 9.2 0"
                  stroke="#0A6274"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
                <path
                  d="M10 30c3.2-5.4 6-5.4 9.2 0s6 5.4 9.2 0 6-5.4 9.2 0"
                  stroke="#E8A33C"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
        </div>
      </div>
      <div className="bc-body">
        <div className="bc-bar" />
        <h1 style={{ fontSize: `${size}px` }}>
          <TitleLines lines={b.titleLines} />
        </h1>
        {b.en ? <p className="bc-en">{b.en}</p> : null}
      </div>
      <div className="bc-foot">
        <p>{b.academy}</p>
        {b.note ? <p className="bc-rt">{b.note}</p> : null}
      </div>
    </div>
  );
}

/* ──────────────── 8. 카드 스택 ──────────────── */
function StackCover({ cover, logoSrc }: CoverProps) {
  const b = coverBits(cover);
  const size = fitPx(b.titleLines, {
    widthPx: 534,
    maxPx: 64,
    minPx: 24,
    tracking: -0.055,
    heightPx: 186,
    lineHeight: 1.19,
  });
  return (
    <div className="bc bc-k8">
      <div className="bc-grain" />
      <div className="bc-top">
        <div className="bc-lock">
          <CoverLogo
            logoSrc={logoSrc}
            height={36}
            fallback={
              <svg className="bc-mk" width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="14" y="14" width="28" height="28" rx="3" fill="#E8593B" />
                <rect x="10" y="10" width="28" height="28" rx="3" fill="#F5BF3E" />
                <rect x="6" y="6" width="28" height="28" rx="3" fill="#fff" />
                <path d="M12 16h16M12 22h16M12 28h10" stroke="#2B3690" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            }
          />
          {b.academy ? <p className="bc-nm">{b.academy}</p> : null}
        </div>
      </div>
      <div className="bc-cd bc-cd3" />
      <div className="bc-cd bc-cd2" />
      <div className="bc-cd bc-cd1">
        <div className="bc-row">
          <span className="bc-t">INTEGRATED PACK</span>
          <span className="bc-n">{b.lessonNo ? `LESSON ${b.lessonNo}` : b.note}</span>
        </div>
        {b.label ? <p className="bc-chip">{b.label}</p> : null}
        <h1 style={{ fontSize: `${size}px` }}>
          <TitleLines lines={b.titleLines} />
        </h1>
        {b.en ? <p className="bc-en">{b.en}</p> : null}
      </div>
      <div className="bc-foot">
        <p>{b.academy}</p>
        {b.note ? <p className="bc-rt">{b.note}</p> : null}
      </div>
    </div>
  );
}

/** 앞표지 */
export function FrontCover({
  preset,
  cover,
  logoSrc,
}: {
  preset: CoverPreset;
  cover: IntegratedCover;
  logoSrc?: string | null;
}) {
  const props: CoverProps = { cover, logoSrc };
  let art: ReactNode;
  switch (preset.layout) {
    case "circle":
      art = <CircleCover {...props} />;
      break;
    case "layers":
      art = <LayersCover {...props} />;
      break;
    case "arch":
      art = <ArchCover {...props} />;
      break;
    case "frame":
      art = <FrameCover {...props} />;
      break;
    case "initial":
      art = <InitialCover {...props} />;
      break;
    case "wave":
      art = <WaveCover {...props} />;
      break;
    case "stack":
      art = <StackCover {...props} />;
      break;
    default:
      art = <BoldFieldCover {...props} />;
  }
  return (
    <Sheet style={{ background: preset.background }}>
      <link rel="stylesheet" href={COVER_FONTS_HREF} />
      {art}
    </Sheet>
  );
}

/** 뒤표지: 앞표지와 같은 색으로, 학원명과 진도만 가운데에 조용히 싣는다. */
export function BackCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  return (
    <Sheet style={{ background: preset.backBackground, color: preset.backInk }} last>
      {preset.layout === "arch" || preset.layout === "frame" ? (
        <div className="absolute" style={{ inset: "11mm", border: `0.35mm solid ${preset.rule}`, opacity: 0.7 }} />
      ) : null}
      <div className="absolute inset-x-[24mm] bottom-[40mm] flex flex-col items-center text-center">
        <p className="text-[18pt] font-black tracking-[0.12em]" style={{ color: preset.backInk }}>
          {cover.academy || cover.label}
        </p>
        <div className="my-[5mm] h-[0.4mm] w-[20mm]" style={{ background: preset.rule }} />
        {lines(cover.progress).map((l, i) => (
          <p key={i} className="text-[10pt]" style={{ color: preset.backMuted }}>
            {l}
          </p>
        ))}
        {cover.label && cover.academy ? (
          <p className="mt-[2mm] text-[10pt]" style={{ color: preset.backMuted }}>
            {cover.label}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}

export type ContentsEntry = {
  number: string;
  en: string;
  sub: string;
  from: number | null;
  to: number | null;
};

/** 목차 */
export function ContentsPage({
  entries,
  cover,
  accent,
}: {
  entries: ContentsEntry[];
  cover: IntegratedCover;
  accent: string;
}) {
  return (
    <Sheet style={{ padding: "22mm 20mm" }}>
      <h2 className="text-[40pt] font-black leading-none tracking-tight text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        CONTENTS
      </h2>
      <div className="mt-[4mm] h-[1.6mm] w-[22mm] bg-slate-900" />
      <ol className="mt-[14mm] space-y-[7mm]">
        {entries.map((e) => (
          <li key={e.number} className="flex items-start gap-[6mm]">
            <span className="w-[14mm] text-[22pt] font-black leading-none" style={{ color: accent, fontFamily: "Georgia, serif" }}>
              {e.number}
            </span>
            <div className="min-w-0 flex-1 border-b border-slate-200 pb-[4mm]">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[14pt] font-bold uppercase tracking-wide text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
                  {e.en}
                </p>
                <p className="shrink-0 text-[10pt] text-slate-500">
                  {e.from != null && e.to != null ? `p. ${e.from} ~ ${e.to}` : ""}
                </p>
              </div>
              <p className="mt-1 text-[10pt] text-slate-500">{e.sub}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="absolute bottom-[16mm] left-[20mm] right-[20mm] border-t border-slate-300 pt-[3mm] text-right">
        <p className="text-[10pt] font-bold text-slate-800" style={{ fontFamily: "Georgia, serif" }}>
          {lines(cover.title).join(" ")}
        </p>
        <p className="text-[9pt] text-slate-500">{cover.label}</p>
      </div>
    </Sheet>
  );
}

/** 간지: 자료 사이에 넣는 제목 쪽. */
export function DividerPage({
  number,
  en,
  title,
  sub,
  preset,
  cover,
}: {
  number: string;
  en: string;
  title: string;
  sub: string;
  preset: CoverPreset;
  cover: IntegratedCover;
}) {
  return (
    <Sheet>
      <div className="absolute inset-y-0 left-0 w-[14mm]" style={{ background: preset.strip }} />
      <div className="absolute left-[30mm] right-[20mm] top-[90mm]">
        <p className="text-[14pt] font-black tracking-[0.3em]" style={{ color: preset.accent }}>
          PART {number}
        </p>
        <h2 className="mt-[4mm] text-[34pt] font-black uppercase leading-tight text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {en}
        </h2>
        <div className="mt-[6mm] h-[1.2mm] w-[30mm]" style={{ background: preset.accent }} />
        <p className="mt-[6mm] text-[20pt] font-black text-slate-800">{title}</p>
        <p className="mt-[2mm] text-[11pt] text-slate-500">{sub}</p>
      </div>
      <div className="absolute bottom-[16mm] left-[30mm] right-[20mm] border-t border-slate-200 pt-[3mm] text-right">
        <p className="text-[10pt] font-bold text-slate-700">{lines(cover.title).join(" ")}</p>
        <p className="text-[9pt] text-slate-500">{cover.label}</p>
      </div>
    </Sheet>
  );
}

/** 프리셋 고르기용 작은 표지 미리보기. */
export function CoverThumb({
  preset,
  cover,
  widthPx = 76,
  logoSrc,
}: {
  preset: CoverPreset;
  cover: IntegratedCover;
  widthPx?: number;
  logoSrc?: string | null;
}) {
  // A4 폭 210mm ≈ 793.7px(96dpi)를 썸네일 폭에 맞춰 줄인다.
  const scale = widthPx / 793.7;
  return (
    <div
      className="pointer-events-none relative overflow-hidden"
      style={{ width: widthPx, height: widthPx * (297 / 210) }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "210mm" }}>
        <FrontCover preset={preset} cover={cover} logoSrc={logoSrc} />
      </div>
    </div>
  );
}
