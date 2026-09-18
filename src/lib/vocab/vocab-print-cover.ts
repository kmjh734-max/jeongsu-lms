import type { VocabPrintMode } from "@/lib/vocab/paginate-vocab-print";
import { VOCAB_PRINT_MODE_LABELS } from "@/lib/vocab/paginate-vocab-print";
import type { VocabPrintSection } from "@/lib/vocab/vocab-print-types";

/** block=타이포 블록 / neon=다크 네온 / hybrid=블록+네온 / poster·master·pop=이전 포스터형 */
export type VocabCoverTheme = "hybrid" | "block" | "neon" | "poster" | "master" | "pop";

/** 표지 색: auto면 단어장 레벨(초등→수능)에 맞춰 고른다 */
export type VocabCoverColor = "auto" | VocabCoverLevelKey;

export type VocabCoverLevelKey =
  | "elem"
  | "midBasic"
  | "midCore"
  | "midAdv"
  | "highBasic"
  | "highCore"
  | "suneung";

export type VocabCoverLevel = {
  key: VocabCoverLevelKey;
  name: string;
  /** 진한 색(블록 바탕) */
  deep: string;
  /** 밝은 색(어두운 바탕 위 네온) */
  bright: string;
  /** 띠·배지에 쓰는 포인트 색 */
  point: string;
};

export const VOCAB_COVER_LEVELS: VocabCoverLevel[] = [
  { key: "elem", name: "초등", deep: "#db2777", bright: "#f472b6", point: "#fde047" },
  { key: "midBasic", name: "중학기본", deep: "#d97706", bright: "#fbbf24", point: "#fef3c7" },
  { key: "midCore", name: "중학필수", deep: "#0f766e", bright: "#2dd4bf", point: "#fbbf24" },
  { key: "midAdv", name: "중학고난도", deep: "#2563eb", bright: "#60a5fa", point: "#fbbf24" },
  { key: "highBasic", name: "고교기본", deep: "#7c3aed", bright: "#a78bfa", point: "#fde047" },
  { key: "highCore", name: "고교필수", deep: "#ea580c", bright: "#fb923c", point: "#fef3c7" },
  { key: "suneung", name: "수능", deep: "#dc2626", bright: "#f87171", point: "#fde047" },
];

/** 제목·시리즈 글자에서 레벨을 찾는다. 못 찾으면 중학필수 색 */
export function resolveVocabCoverLevel(
  color: VocabCoverColor,
  ...texts: string[]
): { level: VocabCoverLevel; index: number } {
  if (color !== "auto") {
    const index = VOCAB_COVER_LEVELS.findIndex((l) => l.key === color);
    if (index >= 0) return { level: VOCAB_COVER_LEVELS[index]!, index };
  }
  const compact = texts.join(" ").replace(/\s+/g, "");
  const aliases: [VocabCoverLevelKey, RegExp][] = [
    ["elem", /초등|초급/],
    ["midAdv", /중학고난도|중등고난도|중3/],
    ["midBasic", /중학기본|중등기본|중1/],
    ["midCore", /중학필수|중등필수|중2|중학|중등/],
    ["highCore", /고교필수|고등필수/],
    ["highBasic", /고교기본|고등기본|고교|고등|고1/],
    ["suneung", /수능|고3/],
  ];
  const hit = aliases.find(([, re]) => re.test(compact));
  const key = hit ? hit[0] : "midCore";
  const index = VOCAB_COVER_LEVELS.findIndex((l) => l.key === key);
  return { level: VOCAB_COVER_LEVELS[index]!, index: hit ? index : -1 };
}

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
  color: VocabCoverColor;
};

export const VOCAB_COVER_THEME_LABELS: Record<VocabCoverTheme, string> = {
  hybrid: "블록+네온",
  block: "타이포 블록",
  neon: "다크 네온",
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
  "cover_color",
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
  const compactTitle = sections[0]!.title.replace(/\s+/g, "");
  const band =
    ["초등", "중학기본", "중학필수", "중학고난도", "고교기본", "고교필수", "수능필수", "수능"].find(
      (name) => compactTitle.includes(name)
    ) ??
    (compactTitle.includes("고교")
      ? "고교"
      : compactTitle.includes("중등") || compactTitle.includes("중학")
        ? "중학"
        : "단어학습");
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

/** 표지용 짧은 제목: 브랜드 머리말·Day 번호·별점을 뺀다 (Day는 시리즈 줄에 따로 나온다) */
function coverBaseTitle(title: string): string {
  return title
    .replace(/^\s*EngCore\s*/i, "")
    .replace(/\s*Day\s*\d+.*$/i, "")
    .replace(/\s*[★☆]+.*$/, "")
    .trim();
}

function defaultCoverTitle(
  documentTitle: string | undefined,
  sections: VocabPrintSection[]
): string {
  const doc = documentTitle?.trim();
  if (doc && !/개\s*단어세트/.test(doc) && !/Day\s*\d+/i.test(doc)) {
    return coverBaseTitle(doc) || doc;
  }
  const first = sections[0]?.title ?? doc ?? "";
  return coverBaseTitle(first) || first || "단어장";
}

export function buildDefaultVocabPrintCover(input: {
  sections: VocabPrintSection[];
  mode: VocabPrintMode;
  academyName: string;
  documentTitle?: string;
  totalItems: number;
}): VocabPrintCoverSettings {
  const { sections, mode, academyName, documentTitle, totalItems } = input;
  const academy = academyName.trim() || "학원";
  return {
    enabled: false,
    theme: "hybrid",
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
    color: "auto",
  };
}

export function parseVocabCoverTheme(
  raw: string | null | undefined
): VocabCoverTheme {
  if (
    raw === "hybrid" ||
    raw === "block" ||
    raw === "neon" ||
    raw === "poster" ||
    raw === "master" ||
    raw === "pop"
  ) {
    return raw;
  }
  if (raw === "fresh") return "master";
  if (raw === "minimal") return "pop";
  if (raw === "classic") return "poster";
  return "hybrid";
}

export function parseVocabCoverColor(
  raw: string | null | undefined
): VocabCoverColor {
  return VOCAB_COVER_LEVELS.some((l) => l.key === raw)
    ? (raw as VocabCoverLevelKey)
    : "auto";
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
  const color = searchParams.get("cover_color");

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
    color: color != null ? parseVocabCoverColor(color) : defaults.color,
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

  if (cover.theme !== defaults.theme) params.set("cover_theme", cover.theme);
  if (cover.color !== defaults.color) params.set("cover_color", cover.color);
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
