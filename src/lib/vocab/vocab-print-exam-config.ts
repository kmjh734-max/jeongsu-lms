export type ExamQuestionKind =
  | "word_mc"
  | "word_sa"
  | "meaning_mc"
  | "meaning_sa"
  | "example_mc"
  | "example_sa";

export interface ExamPrintConfig {
  word_mc: number;
  word_sa: number;
  meaning_mc: number;
  meaning_sa: number;
  example_mc: number;
  example_sa: number;
}

export const DEFAULT_EXAM_PRINT_CONFIG: ExamPrintConfig = {
  word_mc: 0,
  word_sa: 0,
  meaning_mc: 0,
  meaning_sa: 0,
  example_mc: 0,
  example_sa: 0,
};

export const EXAM_CONFIG_ROWS: {
  key: keyof ExamPrintConfig;
  label: string;
  row: "word" | "meaning" | "example";
  format: "mc" | "sa";
}[] = [
  { key: "word_mc", label: "단어제시", row: "word", format: "mc" },
  { key: "word_sa", label: "단어제시", row: "word", format: "sa" },
  { key: "meaning_mc", label: "의미제시", row: "meaning", format: "mc" },
  { key: "meaning_sa", label: "의미제시", row: "meaning", format: "sa" },
  { key: "example_mc", label: "예문제시", row: "example", format: "mc" },
  { key: "example_sa", label: "예문제시", row: "example", format: "sa" },
];

export function examConfigTotal(config: ExamPrintConfig): number {
  return (
    config.word_mc +
    config.word_sa +
    config.meaning_mc +
    config.meaning_sa +
    config.example_mc +
    config.example_sa
  );
}

export function parseExamPrintConfig(
  searchParams: URLSearchParams
): ExamPrintConfig {
  const read = (key: keyof ExamPrintConfig) => {
    const raw = searchParams.get(key);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 0;
  };
  return {
    word_mc: read("word_mc"),
    word_sa: read("word_sa"),
    meaning_mc: read("meaning_mc"),
    meaning_sa: read("meaning_sa"),
    example_mc: read("example_mc"),
    example_sa: read("example_sa"),
  };
}

export function examConfigToSearchParams(
  config: ExamPrintConfig
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(config) as (keyof ExamPrintConfig)[]) {
    if (config[key] > 0) out[key] = String(config[key]);
  }
  return out;
}

export function examQuestionsPerPage(size: "a4" | "b5"): number {
  return size === "b5" ? 5 : 6;
}
