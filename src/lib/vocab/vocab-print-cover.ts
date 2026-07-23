import type { VocabPrintMode } from "@/lib/vocab/paginate-vocab-print";
import { VOCAB_PRINT_MODE_LABELS } from "@/lib/vocab/paginate-vocab-print";
import type { VocabPrintSection } from "@/lib/vocab/vocab-print-types";

export type VocabCoverTheme = "classic" | "fresh" | "minimal";

export type VocabPrintCoverSettings = {
  enabled: boolean;
  theme: VocabCoverTheme;
  title: string;
  subtitle: string;
  seriesLabel: string;
  academyName: string;
  metaLine: string;
  showNameFields: boolean;
};

export const VOCAB_COVER_THEME_LABELS: Record<VocabCoverTheme, string> = {
  classic: "클래식",
  fresh: "프레시",
  minimal: "미니멀",
};

const COVER_URL_KEYS = [
  "cover",
  "cover_theme",
  "cover_title",
  "cover_sub",
  "cover_series",
  "cover_academy",
  "cover_meta",
  "cover_name",
] as const;

function inferSeriesLabel(sections: VocabPrintSection[]): string {
  if (sections.length === 0) return "";
  const days: number[] = [];
  for (const s of sections) {
    const m = s.title.match(/Day\s*(\d+)/i);
    if (m) days.push(Number(m[1]));
  }
  if (days.length === 0) {
    if (sections.length === 1) return sections[0]!.title.slice(0, 48);
    return `${sections.length}세트`;
  }
  const min = Math.min(...days);
  const max = Math.max(...days);
  const band = sections[0]!.title.includes("고교")
    ? "고교기본"
    : sections[0]!.title.includes("중등")
      ? "중등"
      : "단어학습";
  return min === max ? `${band} · Day ${min}` : `${band} · Day ${min}–${max}`;
}

function defaultSubtitle(mode: VocabPrintMode): string {
  if (mode === "exam") return "시험지";
  if (mode === "full") return "예문 · 동의어 · 반의어";
  return "빈도별 필수 어휘";
}

function defaultCoverTitle(
  documentTitle: string | undefined,
  sections: VocabPrintSection[]
): string {
  if (documentTitle?.trim()) {
    // "85개 단어세트" 같은 집계 제목이면 첫 세트 계열명 우선
    if (/개\s*단어세트/.test(documentTitle) && sections[0]) {
      const base = sections[0].title
        .replace(/\s*Day\s*\d+.*$/i, "")
        .replace(/\s*[★☆]+.*$/, "")
        .trim();
      if (base) return base;
    }
    return documentTitle.trim();
  }
  if (sections.length === 1) return sections[0]!.title;
  if (sections[0]) {
    const base = sections[0].title
      .replace(/\s*Day\s*\d+.*$/i, "")
      .replace(/\s*[★☆]+.*$/, "")
      .trim();
    if (base) return base;
  }
  return "단어장";
}

export function buildDefaultVocabPrintCover(input: {
  sections: VocabPrintSection[];
  mode: VocabPrintMode;
  academyName: string;
  documentTitle?: string;
  totalItems: number;
  searchParams?: URLSearchParams | { get(name: string): string | null };
}): VocabPrintCoverSettings {
  const { sections, mode, academyName, documentTitle, totalItems } = input;
  const multi = sections.length > 1;
  return {
    enabled: multi,
    theme: "classic",
    title: defaultCoverTitle(documentTitle, sections),
    subtitle: defaultSubtitle(mode),
    seriesLabel: inferSeriesLabel(sections),
    academyName: academyName.trim() || "학원",
    metaLine: `${sections.length}세트 · ${totalItems}단어 · ${VOCAB_PRINT_MODE_LABELS[mode]}`,
    showNameFields: true,
  };
}

export function parseVocabCoverTheme(
  raw: string | null | undefined
): VocabCoverTheme {
  if (raw === "fresh" || raw === "minimal") return raw;
  return "classic";
}

/** URL에 있는 표지 설정만 덮어씀. 없으면 defaults 유지. */
export function mergeVocabPrintCoverFromSearchParams(
  defaults: VocabPrintCoverSettings,
  searchParams: URLSearchParams | { get(name: string): string | null }
): VocabPrintCoverSettings {
  const hasCoverKey = searchParams.get("cover") != null;
  const enabled = hasCoverKey
    ? searchParams.get("cover") === "1" || searchParams.get("cover") === "true"
    : defaults.enabled;

  const themeRaw = searchParams.get("cover_theme");
  const title = searchParams.get("cover_title");
  const subtitle = searchParams.get("cover_sub");
  const series = searchParams.get("cover_series");
  const academy = searchParams.get("cover_academy");
  const meta = searchParams.get("cover_meta");
  const nameFlag = searchParams.get("cover_name");

  return {
    enabled,
    theme: themeRaw != null ? parseVocabCoverTheme(themeRaw) : defaults.theme,
    title: title != null ? title : defaults.title,
    subtitle: subtitle != null ? subtitle : defaults.subtitle,
    seriesLabel: series != null ? series : defaults.seriesLabel,
    academyName: academy != null ? academy : defaults.academyName,
    metaLine: meta != null ? meta : defaults.metaLine,
    showNameFields:
      nameFlag != null ? nameFlag === "1" || nameFlag === "true" : defaults.showNameFields,
  };
}

/** 짧은 필드·토글만 URL에 기록 (긴 문구도 넣되 과도하면 생략하지 않음 — 교재 제목 수준) */
export function applyVocabPrintCoverToSearchParams(
  params: URLSearchParams,
  cover: VocabPrintCoverSettings,
  defaults: VocabPrintCoverSettings
): void {
  for (const key of COVER_URL_KEYS) params.delete(key);

  if (cover.enabled) params.set("cover", "1");
  else params.set("cover", "0");

  if (cover.theme !== "classic") params.set("cover_theme", cover.theme);
  if (cover.title !== defaults.title) params.set("cover_title", cover.title);
  if (cover.subtitle !== defaults.subtitle) params.set("cover_sub", cover.subtitle);
  if (cover.seriesLabel !== defaults.seriesLabel) {
    params.set("cover_series", cover.seriesLabel);
  }
  if (cover.academyName !== defaults.academyName) {
    params.set("cover_academy", cover.academyName);
  }
  if (cover.metaLine !== defaults.metaLine) params.set("cover_meta", cover.metaLine);
  if (!cover.showNameFields) params.set("cover_name", "0");
}
