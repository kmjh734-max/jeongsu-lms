export type ExamQuestionKind =
  | "word_mc"
  | "word_sa"
  | "meaning_mc"
  | "meaning_sa"
  | "example_mc"
  | "example_sa"
  | "syn_mc"
  | "syn_sa"
  | "ant_mc"
  | "ant_sa";

export type ExamColumnCount = 1 | 2 | 3 | 4;
export type ExamLineSpacing = "compact" | "normal" | "wide";

export interface ExamPrintConfig {
  word_mc: number;
  word_sa: number;
  meaning_mc: number;
  meaning_sa: number;
  example_mc: number;
  example_sa: number;
  /** 동의어·반의어: 단어를 주고 동의어(반의어)를 고르거나 쓴다 */
  syn_mc: number;
  syn_sa: number;
  ant_mc: number;
  ant_sa: number;
}

export interface ExamPrintLayout {
  columns: ExamColumnCount;
  lineSpacing: ExamLineSpacing;
  shuffle: boolean;
}

export interface ExamPrintSettings {
  counts: ExamPrintConfig;
  layout: ExamPrintLayout;
  /** 변경 시 문항 순서 재생성 */
  shuffleSeed: number;
  /** 출제 범위(단어 번호, 1부터). 0이면 처음·끝 — 단어장 전체 */
  rangeFrom: number;
  rangeTo: number;
}

export const DEFAULT_EXAM_PRINT_CONFIG: ExamPrintConfig = {
  word_mc: 0,
  word_sa: 0,
  meaning_mc: 0,
  meaning_sa: 0,
  example_mc: 0,
  example_sa: 0,
  syn_mc: 0,
  syn_sa: 0,
  ant_mc: 0,
  ant_sa: 0,
};

export const DEFAULT_EXAM_LAYOUT: ExamPrintLayout = {
  columns: 2,
  lineSpacing: "normal",
  shuffle: true,
};

export const DEFAULT_EXAM_SETTINGS: ExamPrintSettings = {
  counts: DEFAULT_EXAM_PRINT_CONFIG,
  layout: DEFAULT_EXAM_LAYOUT,
  shuffleSeed: 0,
  rangeFrom: 0,
  rangeTo: 0,
};

/** 출제 범위를 단어 수 안으로 맞춘 [처음, 끝] 번호(1부터, 끝 포함) */
export function resolveExamRange(
  settings: Pick<ExamPrintSettings, "rangeFrom" | "rangeTo">,
  total: number
): { from: number; to: number } {
  if (total <= 0) return { from: 1, to: 0 };
  const from = Math.min(Math.max(settings.rangeFrom || 1, 1), total);
  const to = Math.min(Math.max(settings.rangeTo || total, from), total);
  return { from, to };
}

export const EXAM_COLUMN_LABELS: Record<ExamColumnCount, string> = {
  1: "1단",
  2: "2단",
  3: "3단",
  4: "4단",
};

export const EXAM_LINE_SPACING_LABELS: Record<ExamLineSpacing, string> = {
  compact: "좁게",
  normal: "보통",
  wide: "넓게",
};

/** 문항 사이 간격 (px) */
export const EXAM_ROW_GAP_PX: Record<ExamLineSpacing, number> = {
  compact: 0,
  normal: 4,
  wide: 10,
};

export function examConfigTotal(config: ExamPrintConfig): number {
  return (
    config.word_mc +
    config.word_sa +
    config.meaning_mc +
    config.meaning_sa +
    config.example_mc +
    config.example_sa +
    config.syn_mc +
    config.syn_sa +
    config.ant_mc +
    config.ant_sa
  );
}

const EXAM_CONFIG_KEYS: (keyof ExamPrintConfig)[] = [
  "word_mc",
  "word_sa",
  "meaning_mc",
  "meaning_sa",
  "example_mc",
  "example_sa",
  "syn_mc",
  "syn_sa",
  "ant_mc",
  "ant_sa",
];

/** 요청 문항 합이 단어 수를 넘지 않도록 앞에서부터 배분 */
export function clampExamConfigToPool(
  config: ExamPrintConfig,
  maxTotal: number
): ExamPrintConfig {
  const max = Math.max(0, maxTotal);
  if (examConfigTotal(config) <= max) return config;

  let remaining = max;
  const next: ExamPrintConfig = {
    word_mc: 0,
    word_sa: 0,
    meaning_mc: 0,
    meaning_sa: 0,
    example_mc: 0,
    example_sa: 0,
    syn_mc: 0,
    syn_sa: 0,
    ant_mc: 0,
    ant_sa: 0,
  };
  for (const key of EXAM_CONFIG_KEYS) {
    const take = Math.min(config[key], remaining);
    next[key] = take;
    remaining -= take;
  }
  return next;
}

function readCount(
  searchParams: URLSearchParams,
  key: keyof ExamPrintConfig
): number {
  const raw = searchParams.get(key);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  // 상한은 단어 수로 다시 줄인다(240개 단어장을 한 유형으로 다 낼 수 있게)
  return Number.isFinite(n) && n > 0 ? Math.min(n, 5000) : 0;
}

function readRangeNo(searchParams: URLSearchParams, key: string): number {
  const n = Number.parseInt(searchParams.get(key) ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function parseExamColumnCount(raw: string | null): ExamColumnCount {
  // 기본은 2단(한 장에 20문항이 들어가게). 1단은 주소에 exam_cols=1로 남긴다
  const n = raw ? Number.parseInt(raw, 10) : 2;
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return 2;
}

export function parseExamLineSpacing(raw: string | null): ExamLineSpacing {
  if (raw === "compact" || raw === "wide") return raw;
  return "normal";
}

export function parseExamPrintSettings(
  searchParams: URLSearchParams
): ExamPrintSettings {
  const shuffleParam = searchParams.get("exam_shuffle");
  const shuffle =
    shuffleParam === null ? true : shuffleParam === "1" || shuffleParam === "true";

  const seedRaw = searchParams.get("exam_seed");
  const shuffleSeed = seedRaw ? Number.parseInt(seedRaw, 10) || 0 : 0;

  return {
    counts: {
      word_mc: readCount(searchParams, "word_mc"),
      word_sa: readCount(searchParams, "word_sa"),
      meaning_mc: readCount(searchParams, "meaning_mc"),
      meaning_sa: readCount(searchParams, "meaning_sa"),
      example_mc: readCount(searchParams, "example_mc"),
      example_sa: readCount(searchParams, "example_sa"),
      syn_mc: readCount(searchParams, "syn_mc"),
      syn_sa: readCount(searchParams, "syn_sa"),
      ant_mc: readCount(searchParams, "ant_mc"),
      ant_sa: readCount(searchParams, "ant_sa"),
    },
    layout: {
      columns: parseExamColumnCount(searchParams.get("exam_cols")),
      lineSpacing: parseExamLineSpacing(searchParams.get("exam_spacing")),
      shuffle,
    },
    shuffleSeed,
    rangeFrom: readRangeNo(searchParams, "exam_from"),
    rangeTo: readRangeNo(searchParams, "exam_to"),
  };
}

export function examSettingsToSearchParams(
  settings: ExamPrintSettings
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(settings.counts)) {
    if (v > 0) out[k] = String(v);
  }
  if (settings.layout.columns !== 2) {
    out.exam_cols = String(settings.layout.columns);
  }
  if (settings.layout.lineSpacing !== "normal") {
    out.exam_spacing = settings.layout.lineSpacing;
  }
  if (!settings.layout.shuffle) {
    out.exam_shuffle = "0";
  }
  if (settings.shuffleSeed > 0) {
    out.exam_seed = String(settings.shuffleSeed);
  }
  if (settings.rangeFrom > 0) out.exam_from = String(settings.rangeFrom);
  if (settings.rangeTo > 0) out.exam_to = String(settings.rangeTo);
  return out;
}

/** 단당 기본 행 수 (B5 5행, A4 6행) */
export function examRowsPerColumn(size: "a4" | "b5"): number {
  return size === "b5" ? 5 : 6;
}

export function examQuestionsPerPage(
  size: "a4" | "b5",
  columns: ExamColumnCount
): number {
  return examRowsPerColumn(size) * columns;
}
