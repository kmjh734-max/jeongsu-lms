/** Lesson-materials workbook types (T/F first; other cards are placeholders). */

export type WorkbookTypeId =
  | "grammar_choice"
  | "vocab_choice"
  | "grammar_fix"
  | "vocab_fix"
  | "blank_fill"
  | "tf"
  | "sentence_order"
  | "vocab_example"
  | "one_line_ko"
  | "full_en_writing"
  | "word_order_writing";

export type WorkbookTypeMeta = {
  id: WorkbookTypeId;
  title: string;
  subtitle: string;
  ready: boolean;
};

export const WORKBOOK_TYPE_CATALOG: WorkbookTypeMeta[] = [
  {
    id: "grammar_choice",
    title: "어법 선택",
    subtitle: "[A/B] 중 어법상 알맞은 것을 고르기",
    ready: false,
  },
  {
    id: "vocab_choice",
    title: "어휘 선택",
    subtitle: "[A/B] 중 문맥에 알맞은 어휘 고르기",
    ready: false,
  },
  {
    id: "grammar_fix",
    title: "어법 수정",
    subtitle: "어법상 어색한 부분을 고치는 서술형",
    ready: false,
  },
  {
    id: "vocab_fix",
    title: "어휘 수정",
    subtitle: "문맥상 어색한 어휘를 고치는 서술형",
    ready: false,
  },
  {
    id: "blank_fill",
    title: "빈칸 채우기",
    subtitle: "핵심 어휘로 지문을 요약하며 빈칸 채우기",
    ready: false,
  },
  {
    id: "tf",
    title: "T/F 문제",
    subtitle: "지문 이해도를 확인하는 True/False 문항",
    ready: true,
  },
  {
    id: "sentence_order",
    title: "문장 순서 배열",
    subtitle: "글의 흐름에 맞게 문장 순서 배열하기",
    ready: false,
  },
  {
    id: "vocab_example",
    title: "어휘 테스트 (예문)",
    subtitle: "예문의 빈칸에 알맞은 단어 고르기",
    ready: false,
  },
  {
    id: "one_line_ko",
    title: "한줄해석",
    subtitle: "영어 문장을 한국어로 해석하기",
    ready: false,
  },
  {
    id: "full_en_writing",
    title: "통문장 영작",
    subtitle: "한글 해석을 보고 영어 통문장 쓰기",
    ready: false,
  },
  {
    id: "word_order_writing",
    title: "어순배열 영작",
    subtitle: "제시된 단어를 배열하여 문장 만들기",
    ready: false,
  },
];

export type WorkbookTfLanguage = "en" | "ko";
export type WorkbookTfDifficulty = "normal" | "hard";

export type WorkbookTfOptions = {
  count: number;
  language: WorkbookTfLanguage;
  difficulty: WorkbookTfDifficulty;
};

export const DEFAULT_WORKBOOK_TF_OPTIONS: WorkbookTfOptions = {
  count: 4,
  language: "en",
  difficulty: "normal",
};

export type WorkbookMetadata = {
  title: string;
  createdAt: string;
};

export type WorkbookTfItem = {
  index: number;
  statement: string;
  answer: "T" | "F";
  explanation: string;
  /** Required when answer is F — corrected true version */
  correctedStatement?: string;
};

export type WorkbookPassageSection = {
  projectId: string;
  title: string;
  source: string | null;
  passage: string;
  items: WorkbookTfItem[];
};

export type WorkbookData = {
  metadata: WorkbookMetadata;
  selectedTypes: WorkbookTypeId[];
  tfOptions: WorkbookTfOptions;
  sections: WorkbookPassageSection[];
};

export function defaultWorkbookTitle(d = new Date()): string {
  return `워크북_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function clampTfCount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 4;
  return Math.min(8, Math.max(1, Math.floor(v)));
}

/**
 * Collapse OCR/import hard wraps (and blank lines) into one flowing paragraph.
 */
export function formatWorkbookPassage(text: string): string {
  const cleaned = String(text ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?p[^>]*>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[\u00ad\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[\r\n\u0085\u2028\u2029]+/g, " ")
    .replace(/[\t\f\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
  // De-hyphenate line-wrap artifacts: "attrac- tion" → "attraction"
  return cleaned.replace(/(\w)-\s+(\w)/g, "$1$2");
}

/** Join sentence/line rows into a single continuous passage. */
export function joinWorkbookPassageLines(lines: string[]): string {
  const parts = lines
    .map((l) => formatWorkbookPassage(l))
    .filter(Boolean);
  if (parts.length === 0) return "";
  let out = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    const next = parts[i]!;
    if (out.endsWith("-") && /^[a-z]/.test(next)) {
      out = `${out.slice(0, -1)}${next}`;
    } else {
      out = `${out} ${next}`;
    }
  }
  return formatWorkbookPassage(out);
}
