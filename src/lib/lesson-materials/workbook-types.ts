/** Lesson-materials workbook types (T/F + blank fill; other cards are placeholders). */

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
  displayOrder: number;
  printOrder: number;
};

export const WORKBOOK_TYPE_CATALOG: WorkbookTypeMeta[] = [
  {
    id: "grammar_choice",
    title: "어법 선택",
    subtitle: "[A/B] 중 어법상 알맞은 것을 고르기",
    ready: false,
    displayOrder: 1,
    printOrder: 1,
  },
  {
    id: "vocab_choice",
    title: "어휘 선택",
    subtitle: "[A/B] 중 문맥에 알맞은 어휘 고르기",
    ready: false,
    displayOrder: 2,
    printOrder: 2,
  },
  {
    id: "grammar_fix",
    title: "어법 수정",
    subtitle: "어법상 어색한 부분을 고치는 서술형",
    ready: false,
    displayOrder: 3,
    printOrder: 4,
  },
  {
    id: "vocab_fix",
    title: "어휘 수정",
    subtitle: "문맥상 어색한 어휘를 고치는 서술형",
    ready: false,
    displayOrder: 4,
    printOrder: 5,
  },
  {
    id: "blank_fill",
    title: "빈칸 채우기",
    subtitle: "핵심 어휘에 생성된 빈칸을 채우며 지문 정리하기",
    ready: true,
    displayOrder: 5,
    printOrder: 3,
  },
  {
    id: "tf",
    title: "T/F 문제",
    subtitle: "지문 이해도를 확인하는 True/False 문항",
    ready: true,
    displayOrder: 6,
    printOrder: 6,
  },
  {
    id: "sentence_order",
    title: "문장 순서 배열",
    subtitle: "글의 흐름에 맞게 문장 순서 배열하기",
    ready: false,
    displayOrder: 7,
    printOrder: 7,
  },
  {
    id: "vocab_example",
    title: "어휘 테스트 (예문)",
    subtitle: "예문의 빈칸에 알맞은 단어 고르기",
    ready: false,
    displayOrder: 8,
    printOrder: 8,
  },
  {
    id: "one_line_ko",
    title: "한줄해석",
    subtitle: "영어 문장을 한국어로 해석하기",
    ready: false,
    displayOrder: 9,
    printOrder: 9,
  },
  {
    id: "full_en_writing",
    title: "통문장 영작",
    subtitle: "한글 해석을 보고 영어 통문장 쓰기",
    ready: false,
    displayOrder: 10,
    printOrder: 10,
  },
  {
    id: "word_order_writing",
    title: "어순배열 영작",
    subtitle: "제시된 단어를 배열하여 문장 만들기",
    ready: false,
    displayOrder: 11,
    printOrder: 11,
  },
];

export const READY_WORKBOOK_TYPE_IDS: WorkbookTypeId[] = WORKBOOK_TYPE_CATALOG.filter(
  (t) => t.ready
).map((t) => t.id);

export function getWorkbookTypeMeta(id: WorkbookTypeId): WorkbookTypeMeta | undefined {
  return WORKBOOK_TYPE_CATALOG.find((t) => t.id === id);
}

/** Selected types sorted by printOrder (not click order). */
export function sortWorkbookTypesByPrintOrder(
  ids: WorkbookTypeId[]
): WorkbookTypeId[] {
  return [...new Set(ids)].sort((a, b) => {
    const pa = getWorkbookTypeMeta(a)?.printOrder ?? 999;
    const pb = getWorkbookTypeMeta(b)?.printOrder ?? 999;
    return pa - pb;
  });
}

export function workbookTypeDisplayTitle(id: WorkbookTypeId): string {
  return getWorkbookTypeMeta(id)?.title ?? id;
}

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

export type BlankHintType = "first_letter" | "none";
export type BlankTranslationLayout = "chunk" | "sentence_pair";

export type WorkbookBlankFillOptions = {
  hintType: BlankHintType;
  showTranslation: boolean;
  translationLayout: BlankTranslationLayout;
};

export const DEFAULT_WORKBOOK_BLANK_OPTIONS: WorkbookBlankFillOptions = {
  hintType: "first_letter",
  showTranslation: true,
  translationLayout: "chunk",
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

export type BlankPartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb";

export type GeneratedBlankCandidate = {
  id: string;
  sentenceId: string;
  answerText: string;
  occurrenceIndex: number;
  lemma: string;
  partOfSpeech: BlankPartOfSpeech;
  meaningKo: string;
  selectionReasonKo: string;
  priority: number;
};

export type BlankRenderToken =
  | { type: "text"; text: string }
  | {
      type: "blank";
      blankId: string;
      number: number;
      answerText: string;
      firstLetter?: string;
    };

export type WorkbookBlankAnswer = {
  number: number;
  answerText: string;
  lemma: string;
  meaningKo: string;
};

export type WorkbookBlankSentence = {
  id: string;
  english: string;
  korean: string;
  tokens: BlankRenderToken[];
};

export type WorkbookBlankSection = {
  projectId: string;
  title: string;
  source: string | null;
  sourcePassage: string;
  sentences: WorkbookBlankSentence[];
  /** Chunk layout: all sentence tokens flattened with spaces between sentences */
  passageTokens: BlankRenderToken[];
  answers: WorkbookBlankAnswer[];
  fullKorean: string;
  translationWarning?: string;
};

export type WorkbookData = {
  metadata: WorkbookMetadata;
  selectedTypes: WorkbookTypeId[];
  tfOptions: WorkbookTfOptions;
  blankOptions: WorkbookBlankFillOptions;
  /** T/F sections (empty when T/F not selected) */
  sections: WorkbookPassageSection[];
  /** Blank-fill sections (empty when blank_fill not selected) */
  blankSections: WorkbookBlankSection[];
};

export function defaultWorkbookTitle(d = new Date()): string {
  return `워크북_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function clampTfCount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 4;
  return Math.min(8, Math.max(1, Math.floor(v)));
}

export function countEnglishWords(text: string): number {
  const m = formatWorkbookPassage(text).match(/[A-Za-z]+(?:'[A-Za-z]+)?/g);
  return m?.length ?? 0;
}

export function recommendedBlankCount(englishWordCount: number): number {
  return Math.min(12, Math.max(6, Math.round(englishWordCount / 14)));
}

export function parseBlankHintType(raw: string | null | undefined): BlankHintType {
  return raw === "none" ? "none" : "first_letter";
}

export function parseBlankTranslationLayout(
  raw: string | null | undefined
): BlankTranslationLayout {
  return raw === "sentence_pair" ? "sentence_pair" : "chunk";
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
  return cleaned.replace(/(\w)-\s+(\w)/g, "$1$2");
}

/** Join sentence/line rows into a single continuous passage. */
export function joinWorkbookPassageLines(lines: string[]): string {
  const parts = lines.map((l) => formatWorkbookPassage(l)).filter(Boolean);
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
