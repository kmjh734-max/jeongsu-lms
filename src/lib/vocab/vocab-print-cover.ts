import type { VocabPrintMode } from "@/lib/vocab/paginate-vocab-print";
import { VOCAB_PRINT_MODE_LABELS } from "@/lib/vocab/paginate-vocab-print";
import type { VocabPrintSection } from "@/lib/vocab/vocab-print-types";

/** poster=시나공형 다크 / master=워드마스터형 크림 / pop=컬러블록 */
export type VocabCoverTheme = "poster" | "master" | "pop";

export type VocabCoverFont = "sans" | "serif" | "rounded";
export type VocabCoverTitleSize = "md" | "lg" | "xl";

export type VocabPrintCoverSettings = {
  enabled: boolean;
  theme: VocabCoverTheme;
  title: string;
  subtitle: string;
  seriesLabel: string;
  academyName: string;
  metaLine: string;
  slogan: string;
  /** 표지 하단 꼬릿말 */
  footerText: string;
  badge: string;
  /** 선택용 작은 라벨 (비우면 미표시) */
  heroMark: string;
  fontFamily: VocabCoverFont;
  titleSize: VocabCoverTitleSize;
  showNameFields: boolean;
};

export const VOCAB_COVER_THEME_LABELS: Record<VocabCoverTheme, string> = {
  poster: "포스터",
  master: "마스터",
  pop: "컬러팝",
};

export const VOCAB_COVER_FONT_LABELS: Record<VocabCoverFont, string> = {
  sans: "고딕",
  serif: "명조",
  rounded: "라운드",
};

export const VOCAB_COVER_TITLE_SIZE_LABELS: Record<VocabCoverTitleSize, string> =
  {
    md: "보통",
    lg: "크게",
    xl: "더크게",
  };

const COVER_URL_KEYS = [
  "cover",
  "cover_theme",
  "cover_title",
  "cover_sub",
  "cover_series",
  "cover_academy",
  "cover_meta",
  "cover_slogan",
  "cover_footer",
  "cover_badge",
  "cover_mark",
  "cover_font",
  "cover_tsize",
  "cover_name",
] as const;

function inferDayRange(sections: VocabPrintSection[]): {
  min: number;
  max: number;
} | null {
  const days: number[] = [];
  for (const s of sections) {
    const m = s.title.match(/Day\s*(\d+)/i);
    if (m) days.push(Number(m[1]));
  }
  if (days.length === 0) return null;
  return { min: Math.min(...days), max: Math.max(...days) };
}

function inferSeriesLabel(sections: VocabPrintSection[]): string {
  if (sections.length === 0) return "";
  const range = inferDayRange(sections);
  if (!range) {
    if (sections.length === 1) return sections[0]!.title.slice(0, 48);
    return `${sections.length}세트`;
  }
  const band = sections[0]!.title.includes("고교")
    ? "고교기본"
    : sections[0]!.title.includes("중등")
      ? "중등"
      : "단어학습";
  return range.min === range.max
    ? `${band} · Day ${range.min}`
    : `${band} · Day ${range.min}–${range.max}`;
}

function defaultSubtitle(mode: VocabPrintMode): string {
  if (mode === "exam") return "시험지";
  if (mode === "full") return "예문 · 동의어 · 반의어";
  return "빈도별 필수 어휘";
}

function defaultSlogan(mode: VocabPrintMode): string {
  if (mode === "exam") return "시험에 나오는 것만 공부한다!";
  return "반드시 알아야 할 빈출 · 핵심 어휘";
}

function defaultCoverTitle(
  documentTitle: string | undefined,
  sections: VocabPrintSection[]
): string {
  if (documentTitle?.trim()) {
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
}): VocabPrintCoverSettings {
  const { sections, mode, academyName, documentTitle, totalItems } = input;
  const multi = sections.length > 1;
  const academy = academyName.trim() || "학원";
  return {
    enabled: multi,
    theme: "poster",
    title: defaultCoverTitle(documentTitle, sections),
    subtitle: defaultSubtitle(mode),
    seriesLabel: inferSeriesLabel(sections),
    academyName: academy,
    metaLine: `${sections.length}세트 · ${totalItems}단어 · ${VOCAB_PRINT_MODE_LABELS[mode]}`,
    slogan: defaultSlogan(mode),
    footerText: `${academy} · Vocabulary Workbook`,
    badge: "",
    heroMark: "",
    fontFamily: "sans",
    titleSize: "lg",
    showNameFields: true,
  };
}

export function parseVocabCoverTheme(
  raw: string | null | undefined
): VocabCoverTheme {
  if (raw === "master" || raw === "pop") return raw;
  if (raw === "fresh") return "master";
  if (raw === "minimal") return "pop";
  if (raw === "classic") return "poster";
  return "poster";
}

export function parseVocabCoverFont(
  raw: string | null | undefined
): VocabCoverFont {
  if (raw === "serif" || raw === "rounded") return raw;
  return "sans";
}

export function parseVocabCoverTitleSize(
  raw: string | null | undefined
): VocabCoverTitleSize {
  if (raw === "md" || raw === "xl") return raw;
  return "lg";
}

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
  const slogan = searchParams.get("cover_slogan");
  const footer = searchParams.get("cover_footer");
  const badge = searchParams.get("cover_badge");
  const mark = searchParams.get("cover_mark");
  const font = searchParams.get("cover_font");
  const tsize = searchParams.get("cover_tsize");
  const nameFlag = searchParams.get("cover_name");

  return {
    enabled,
    theme: themeRaw != null ? parseVocabCoverTheme(themeRaw) : defaults.theme,
    title: title != null ? title : defaults.title,
    subtitle: subtitle != null ? subtitle : defaults.subtitle,
    seriesLabel: series != null ? series : defaults.seriesLabel,
    academyName: academy != null ? academy : defaults.academyName,
    metaLine: meta != null ? meta : defaults.metaLine,
    slogan: slogan != null ? slogan : defaults.slogan,
    footerText: footer != null ? footer : defaults.footerText,
    badge: badge != null ? badge : defaults.badge,
    heroMark: mark != null ? mark : defaults.heroMark,
    fontFamily: font != null ? parseVocabCoverFont(font) : defaults.fontFamily,
    titleSize:
      tsize != null ? parseVocabCoverTitleSize(tsize) : defaults.titleSize,
    showNameFields:
      nameFlag != null
        ? nameFlag === "1" || nameFlag === "true"
        : defaults.showNameFields,
  };
}

export function applyVocabPrintCoverToSearchParams(
  params: URLSearchParams,
  cover: VocabPrintCoverSettings,
  defaults: VocabPrintCoverSettings
): void {
  for (const key of COVER_URL_KEYS) params.delete(key);

  if (cover.enabled) params.set("cover", "1");
  else params.set("cover", "0");

  if (cover.theme !== "poster") params.set("cover_theme", cover.theme);
  if (cover.title !== defaults.title) params.set("cover_title", cover.title);
  if (cover.subtitle !== defaults.subtitle) params.set("cover_sub", cover.subtitle);
  if (cover.seriesLabel !== defaults.seriesLabel) {
    params.set("cover_series", cover.seriesLabel);
  }
  if (cover.academyName !== defaults.academyName) {
    params.set("cover_academy", cover.academyName);
  }
  if (cover.metaLine !== defaults.metaLine) params.set("cover_meta", cover.metaLine);
  if (cover.slogan !== defaults.slogan) params.set("cover_slogan", cover.slogan);
  if (cover.footerText !== defaults.footerText) {
    params.set("cover_footer", cover.footerText);
  }
  if (cover.badge !== defaults.badge) params.set("cover_badge", cover.badge);
  if (cover.heroMark !== defaults.heroMark) params.set("cover_mark", cover.heroMark);
  if (cover.fontFamily !== defaults.fontFamily) {
    params.set("cover_font", cover.fontFamily);
  }
  if (cover.titleSize !== defaults.titleSize) {
    params.set("cover_tsize", cover.titleSize);
  }
  if (!cover.showNameFields) params.set("cover_name", "0");
}
