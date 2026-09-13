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

/** 프리셋 장식(배경 위 도형). */
function Motif({ preset }: { preset: CoverPreset }) {
  switch (preset.motif) {
    case "orb":
      return (
        <div
          className="absolute rounded-full opacity-90"
          style={{ width: "150mm", height: "150mm", right: "-35mm", top: "40mm", background: preset.orb }}
        />
      );
    case "typo":
      return (
        <div
          className="absolute rounded-full"
          style={{
            width: "120mm",
            height: "120mm",
            right: "-30mm",
            bottom: "-40mm",
            border: "1.2mm solid rgba(127,242,212,0.25)",
            background:
              "linear-gradient(rgba(127,242,212,0.25),rgba(127,242,212,0.25)) center/1.2mm 100% no-repeat, linear-gradient(rgba(127,242,212,0.25),rgba(127,242,212,0.25)) center/100% 1.2mm no-repeat",
          }}
        />
      );
    case "waves":
      return (
        <svg className="absolute bottom-0 left-0" width="210mm" height="120mm" viewBox="0 0 210 120" preserveAspectRatio="none">
          <path d="M0 60 C40 30 80 90 120 60 S190 30 210 55 L210 120 L0 120 Z" fill="#f9a8d4" opacity="0.75" />
          <path d="M0 85 C50 60 90 110 140 85 S195 65 210 80 L210 120 L0 120 Z" fill="#ec4899" opacity="0.55" />
        </svg>
      );
    case "metal":
      return (
        <div
          className="absolute rounded-full"
          style={{
            width: "140mm",
            height: "140mm",
            left: "35mm",
            top: "70mm",
            background:
              "conic-gradient(from 30deg,#52525b,#e4e4e7,#71717a,#f4f4f5,#3f3f46,#d4d4d8,#52525b)",
            filter: "blur(0.4mm)",
            opacity: 0.85,
          }}
        />
      );
    case "modern":
      return (
        <>
          <div className="absolute" style={{ width: "70mm", height: "70mm", right: "-10mm", top: "-10mm", borderRadius: "14mm", background: preset.accent }} />
          <div className="absolute" style={{ width: "90mm", height: "90mm", left: "-45mm", bottom: "-45mm", borderRadius: "50%", background: "#14b8a6" }} />
        </>
      );
    case "classic":
      return <div className="absolute" style={{ inset: "12mm", border: "0.4mm solid #9ca3af" }} />;
    case "arch":
      return (
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-white"
          style={{ width: "120mm", height: "180mm", top: "55mm", borderRadius: "60mm 60mm 0 0", border: `1.5mm solid ${preset.accent}` }}
        />
      );
  }
}

/** 앞표지 */
export function FrontCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  const titleLines = lines(cover.title || "제목");
  const typo = preset.motif === "typo";
  const arch = preset.motif === "arch";
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }}>
      <Motif preset={preset} />
      <div className="absolute left-[16mm] right-[16mm] top-[16mm] flex items-baseline justify-between">
        <span className="text-[15pt] font-black" style={{ color: typo ? preset.ink : preset.muted }}>
          {cover.label}
        </span>
        <span className="text-[10pt]" style={{ color: preset.muted }}>
          {cover.academy}
        </span>
      </div>
      <div className="absolute left-[16mm] right-[16mm] top-[28mm] h-[0.3mm]" style={{ background: preset.muted, opacity: 0.5 }} />

      <div
        className="absolute inset-x-[16mm] flex flex-col items-center text-center"
        style={{ top: arch ? "105mm" : "95mm" }}
      >
        <h1
          className="font-black leading-[1.05] tracking-tight"
          style={{
            fontSize: titleLines.some((l) => l.length > 8) ? "40pt" : "56pt",
            color: arch ? preset.ink : preset.ink,
            transform: typo ? "rotate(-5deg)" : undefined,
            textShadow: typo
              ? "1.5px 1.5px 0 #0a2a2d, 3px 3px 0 #0a2a2d, 4.5px 4.5px 0 #0a2a2d, 6px 6px 0 #0a2a2d"
              : undefined,
            fontFamily: preset.motif === "classic" ? "Georgia, 'Times New Roman', serif" : undefined,
          }}
        >
          {titleLines.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </h1>
      </div>

      <div className="absolute bottom-[34mm] left-[16mm] right-[16mm] h-[0.3mm]" style={{ background: preset.muted, opacity: 0.5 }} />
      <div className="absolute bottom-[14mm] left-[16mm] right-[16mm] text-center">
        <p className="text-[14pt] font-black" style={{ color: arch ? "#f5efe3" : preset.ink }}>
          {cover.academy}
        </p>
        {lines(cover.progress).map((l, i) => (
          <p key={i} className="mt-0.5 text-[9.5pt]" style={{ color: preset.muted }}>
            {l}
          </p>
        ))}
      </div>
    </Sheet>
  );
}

/** 뒤표지: 같은 배경에 학원명과 진도만 조용히 싣는다. */
export function BackCover({ preset, cover }: { preset: CoverPreset; cover: IntegratedCover }) {
  return (
    <Sheet style={{ background: preset.background, color: preset.ink }} last>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[22pt] font-black" style={{ color: preset.motif === "arch" ? "#f5efe3" : preset.ink }}>
          {cover.academy || cover.label}
        </p>
        <div className="my-[6mm] h-[0.4mm] w-[40mm]" style={{ background: preset.muted }} />
        {lines(cover.progress).map((l, i) => (
          <p key={i} className="text-[10pt]" style={{ color: preset.muted }}>
            {l}
          </p>
        ))}
        {cover.label ? (
          <p className="mt-[3mm] text-[10pt]" style={{ color: preset.muted }}>
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
      <div className="absolute inset-y-0 left-0 w-[14mm]" style={{ background: preset.background }} />
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
