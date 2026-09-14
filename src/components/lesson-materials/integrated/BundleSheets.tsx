"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CoverPreset, IntegratedCover } from "@/lib/lesson-materials/integrated";

/**
 * 최종통합자료의 앞표지·뒤표지·목차·간지 쪽. 모두 A4 한 쪽이고, 인쇄에서 배경색까지 그대로
 * 찍히게 한다. 표지 모양은 프리셋(색·장식)으로 바뀐다.
 */

const SHEET_STYLE: CSSProperties = {
  width: "210mm",
  height: "297mm",
  boxSizing: "border-box",
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

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
 * 제목 글자 크기(pt). 가장 긴 줄이 widthMm 안에 들어가게 줄인다(한글은 1em, 영문·숫자는
 * 0.58em으로 셈). 그래도 긴 줄은 낱말 단위로 줄바꿈된다.
 */
function titleSizePt(titleLines: string[], widthMm: number, maxPt: number): number {
  const units = Math.max(
    1,
    ...titleLines.map((l) =>
      Array.from(l).reduce((n, ch) => n + (/[ㄱ-힝]/.test(ch) ? 1 : ch === " " ? 0.3 : 0.58), 0)
    )
  );
  const fit = widthMm / (units * 0.3528);
  return Math.max(26, Math.min(maxPt, Math.floor(fit)));
}

const TITLE_STYLE: CSSProperties = {
  wordBreak: "keep-all",
  textWrap: "balance",
  letterSpacing: "-0.02em",
};

function TitleLines({ lines: titleLines }: { lines: string[] }) {
  return (
    <>
      {titleLines.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </>
  );
}

/** 클래식 네이비: 남색 바탕, 금색 이중 테두리, 가운데 정렬. */
function ClassicCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  const titleLines = lines(cover.title || "제목");
  const size = titleSizePt(titleLines, 150, 46);
  const ornament = (
    <div className="flex items-center justify-center gap-[3mm]">
      <span className="h-[0.3mm] w-[18mm]" style={{ background: preset.rule }} />
      <span className="h-[2.2mm] w-[2.2mm] rotate-45" style={{ border: `0.35mm solid ${preset.rule}` }} />
      <span className="h-[0.3mm] w-[18mm]" style={{ background: preset.rule }} />
    </div>
  );
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }}>
      <div className="absolute" style={{ inset: "11mm", border: `0.35mm solid ${preset.rule}`, opacity: 0.7 }} />
      <div className="absolute" style={{ inset: "13mm", border: `0.15mm solid ${preset.rule}`, opacity: 0.45 }} />
      <div className="absolute inset-x-[24mm] top-[32mm] flex flex-col items-center gap-[5mm] text-center">
        {cover.label ? (
          <p className="text-[11pt] font-bold uppercase tracking-[0.32em]" style={{ color: preset.rule }}>
            {cover.label}
          </p>
        ) : null}
        {ornament}
      </div>
      <div className="absolute inset-x-[26mm] top-[96mm] flex flex-col items-center text-center">
        <h1 className="font-extrabold leading-[1.22]" style={{ ...TITLE_STYLE, fontSize: `${size}pt`, color: preset.ink }}>
          <TitleLines lines={titleLines} />
        </h1>
        <div className="mt-[9mm] h-[0.5mm] w-[26mm]" style={{ background: preset.rule }} />
        <div className="mt-[7mm] space-y-[1.5mm]">
          {lines(cover.progress).map((l, i) => (
            <p key={i} className="text-[12pt] font-medium" style={{ color: preset.muted }}>
              {l}
            </p>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-[24mm] bottom-[28mm] flex flex-col items-center gap-[5mm] text-center">
        {ornament}
        <p className="text-[13pt] font-bold tracking-[0.2em]" style={{ color: preset.ink }}>
          {cover.academy}
        </p>
      </div>
    </Sheet>
  );
}

/** 미니멀 화이트: 흰 바탕, 굵은 왼쪽 정렬 제목, 파란 강조선, 옅은 세로 글자. */
function MinimalCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  const titleLines = lines(cover.title || "제목");
  const size = titleSizePt(titleLines, 148, 54);
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }}>
      <p
        className="absolute select-none font-black leading-none"
        style={{
          right: "12mm",
          top: "46mm",
          writingMode: "vertical-rl",
          fontSize: "92pt",
          letterSpacing: "0.04em",
          color: "#eef2f7",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
        aria-hidden
      >
        ENGLISH
      </p>
      <div className="absolute inset-x-[18mm] top-[18mm]">
        <div className="h-[0.8mm]" style={{ background: preset.rule }} />
        <div className="mt-[3mm]">
          <p className="text-[10.5pt] font-bold uppercase tracking-[0.14em]" style={{ color: preset.ink }}>
            {cover.label}
          </p>
        </div>
      </div>
      <div className="absolute left-[18mm] top-[92mm]" style={{ width: "150mm" }}>
        <h1 className="font-black leading-[1.1]" style={{ ...TITLE_STYLE, fontSize: `${size}pt`, color: preset.ink }}>
          <TitleLines lines={titleLines} />
        </h1>
        <div className="mt-[10mm] h-[2.4mm] w-[16mm]" style={{ background: preset.accent }} />
      </div>
      <div className="absolute inset-x-[18mm] bottom-[18mm]">
        <div className="space-y-[1.2mm]">
          {lines(cover.progress).map((l, i) => (
            <p key={i} className="text-[12pt] font-semibold" style={{ color: "#334155" }}>
              {l}
            </p>
          ))}
        </div>
        <div className="mt-[6mm] h-[0.3mm]" style={{ background: preset.rule }} />
        <p className="mt-[2.5mm] text-[12pt] font-black" style={{ color: preset.ink }}>
          {cover.academy}
        </p>
      </div>
    </Sheet>
  );
}

/** 소프트 그라데이션: 연보라·하늘 번짐, 흰 반투명 카드. */
function GradientCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  const titleLines = lines(cover.title || "제목");
  const size = titleSizePt(titleLines, 168, 50);
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }}>
      <div
        className="absolute rounded-full"
        style={{ width: "165mm", height: "165mm", right: "-55mm", top: "-45mm", background: "radial-gradient(circle, rgba(167,139,250,0.55) 0%, rgba(167,139,250,0) 68%)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: "150mm", height: "150mm", left: "-55mm", top: "120mm", background: "radial-gradient(circle, rgba(103,232,249,0.5) 0%, rgba(103,232,249,0) 68%)" }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: "110mm", height: "110mm", right: "-20mm", bottom: "30mm", background: "radial-gradient(circle, rgba(244,114,182,0.28) 0%, rgba(244,114,182,0) 68%)" }}
      />
      {cover.label ? (
        <p
          className="absolute left-[20mm] top-[22mm] rounded-full px-[4.5mm] py-[1.6mm] text-[10pt] font-bold"
          style={{ background: "rgba(255,255,255,0.8)", border: "0.3mm solid rgba(124,58,237,0.25)", color: preset.accent }}
        >
          {cover.label}
        </p>
      ) : null}
      <div className="absolute inset-x-[20mm] top-[90mm]">
        <h1 className="font-black leading-[1.14]" style={{ ...TITLE_STYLE, fontSize: `${size}pt`, color: preset.ink }}>
          <TitleLines lines={titleLines} />
        </h1>
        <div className="mt-[9mm] h-[1.8mm] w-[14mm] rounded-full" style={{ background: preset.rule }} />
      </div>
      <div
        className="absolute inset-x-[20mm] bottom-[20mm] flex items-end justify-between gap-[8mm] rounded-[5mm] px-[8mm] py-[7mm]"
        style={{ background: "rgba(255,255,255,0.8)", border: "0.3mm solid rgba(30,27,75,0.08)" }}
      >
        <div className="min-w-0 space-y-[1.2mm]">
          {lines(cover.progress).map((l, i) => (
            <p key={i} className="text-[11.5pt] font-semibold" style={{ color: preset.muted }}>
              {l}
            </p>
          ))}
        </div>
        <p className="shrink-0 text-[13pt] font-black" style={{ color: preset.ink }}>
          {cover.academy}
        </p>
      </div>
    </Sheet>
  );
}

/** 컬러 블록: 위 청록 블록에 흰 제목, 호박색 띠, 아래 크림 바탕에 진도. */
function BlockCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  const titleLines = lines(cover.title || "제목");
  const size = titleSizePt(titleLines, 168, 54);
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }}>
      <div className="absolute inset-x-0 top-0" style={{ height: "178mm", background: preset.accent }}>
        <div
          className="absolute rounded-full"
          style={{ width: "120mm", height: "120mm", right: "-38mm", top: "-42mm", border: "0.5mm solid rgba(255,255,255,0.14)" }}
        />
        <div
          className="absolute rounded-full"
          style={{ width: "84mm", height: "84mm", right: "-20mm", top: "-24mm", border: "0.5mm solid rgba(255,255,255,0.1)" }}
        />
        {cover.label ? (
          <p className="absolute left-[20mm] top-[22mm] text-[10.5pt] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.72)" }}>
            {cover.label}
          </p>
        ) : null}
        <h1
          className="absolute inset-x-[20mm] bottom-[18mm] font-black leading-[1.1]"
          style={{ ...TITLE_STYLE, fontSize: `${size}pt`, color: preset.ink }}
        >
          <TitleLines lines={titleLines} />
        </h1>
      </div>
      <div className="absolute inset-x-0" style={{ top: "178mm", height: "3.2mm", background: preset.rule }} />
      <div className="absolute inset-x-[20mm] top-[198mm] space-y-[1.6mm]">
        {lines(cover.progress).map((l, i) => (
          <p key={i} className="text-[12.5pt] font-semibold" style={{ color: preset.muted }}>
            {l}
          </p>
        ))}
      </div>
      <div className="absolute inset-x-[20mm] bottom-[20mm]">
        <div className="h-[0.3mm]" style={{ background: "#d6d3c9" }} />
        <p className="mt-[3mm] text-[13pt] font-black" style={{ color: preset.accent }}>
          {cover.academy}
        </p>
      </div>
    </Sheet>
  );
}

/** 앞표지 */
export function FrontCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  switch (preset.layout) {
    case "minimal":
      return <MinimalCover preset={preset} cover={cover} />;
    case "gradient":
      return <GradientCover preset={preset} cover={cover} />;
    case "block":
      return <BlockCover preset={preset} cover={cover} />;
    default:
      return <ClassicCover preset={preset} cover={cover} />;
  }
}

/** 뒤표지: 앞표지와 같은 색으로, 학원명과 진도만 가운데에 조용히 싣는다. */
export function BackCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  return (
    <Sheet style={{ background: preset.backBackground, color: preset.backInk }} last>
      {preset.layout === "classic" ? (
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
}: {
  preset: CoverPreset;
  cover: IntegratedCover;
  widthPx?: number;
}) {
  // A4 폭 210mm ≈ 793.7px(96dpi)를 썸네일 폭에 맞춰 줄인다.
  const scale = widthPx / 793.7;
  return (
    <div
      className="pointer-events-none relative overflow-hidden"
      style={{ width: widthPx, height: widthPx * (297 / 210) }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "210mm" }}>
        <FrontCover preset={preset} cover={{ ...cover, title: cover.title || "Title" }} />
      </div>
    </div>
  );
}
