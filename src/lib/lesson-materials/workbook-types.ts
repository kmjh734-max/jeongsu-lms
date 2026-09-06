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
export type BlankDensity = "standard" | "high";

export type WorkbookBlankFillOptions = {
  hintType: BlankHintType;
  showTranslation: boolean;
  translationLayout: BlankTranslationLayout;
  density: BlankDensity;
};

export const DEFAULT_WORKBOOK_BLANK_OPTIONS: WorkbookBlankFillOptions = {
  hintType: "first_letter",
  showTranslation: true,
  translationLayout: "chunk",
  density: "high",
};

export type BlankGenerationMetadata = {
  englishWordCount: number;
  density: BlankDensity;
  targetBlankCount: number;
  actualBlankCount: number;
  shortfallReason: string | null;
};

export type WorkbookTranslation = {
  sentenceId: string;
  english: string;
  korean: string;
  source: "teacher" | "stored" | "refined" | "generated";
  validated: boolean;
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
  generation?: BlankGenerationMetadata;
  translations?: WorkbookTranslation[];
};

export type WorkbookGenerationTiming = {
  dataLoadMs: number;
  translationLookupMs: number;
  blankSelectionMs: number;
  pdfRenderMs: number;
  totalMs: number;
  openAiRequestCount: number;
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
  timing?: WorkbookGenerationTiming;
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
  // Hyphenated compounds count as one; drop pure numbers / punctuation-only.
  const m = formatWorkbookPassage(text).match(
    /[A-Za-z]+(?:-[A-Za-z]+)*(?:'[A-Za-z]+)?/g
  );
  return m?.length ?? 0;
}

/** @deprecated use computeBlankTargetCount — kept as standard-density alias */
export function recommendedBlankCount(englishWordCount: number): number {
  return computeBlankTargetCount({
    englishWordCount,
    density: "standard",
    hintType: "first_letter",
    showTranslation: true,
  });
}

export function computeBlankTargetCount(input: {
  englishWordCount: number;
  density: BlankDensity;
  hintType: BlankHintType;
  showTranslation: boolean;
}): number {
  const n = Math.max(0, input.englishWordCount);
  // Mid of target range by passage length (v4). hint/translation only nudge slightly.
  let low: number;
  let high: number;
  if (input.density === "standard") {
    if (n < 100) {
      low = 10;
      high = 13;
    } else if (n < 150) {
      low = 14;
      high = 17;
    } else if (n < 200) {
      low = 17;
      high = 20;
    } else {
      low = 20;
      high = 24;
    }
  } else {
    // high = 많이 / 난이도 UP
    if (n < 100) {
      low = 14;
      high = 18;
    } else if (n < 150) {
      low = 18;
      high = 22;
    } else if (n < 200) {
      low = 22;
      high = 26;
    } else {
      low = 26;
      high = 32;
    }
  }
  let target = Math.round((low + high) / 2);
  // Slightly fewer when no hint / no translation (harder task)
  if (input.hintType === "none") target = Math.max(low, target - 1);
  if (!input.showTranslation) target = Math.max(low, target - 1);
  return Math.min(high, Math.max(low, target));
}

export function getBlankTargetRange(input: {
  englishWordCount: number;
  density: BlankDensity;
}): { low: number; high: number } {
  const n = Math.max(0, input.englishWordCount);
  if (input.density === "standard") {
    if (n < 100) return { low: 10, high: 13 };
    if (n < 150) return { low: 14, high: 17 };
    if (n < 200) return { low: 17, high: 20 };
    return { low: 20, high: 24 };
  }
  if (n < 100) return { low: 14, high: 18 };
  if (n < 150) return { low: 18, high: 22 };
  if (n < 200) return { low: 22, high: 26 };
  return { low: 26, high: 32 };
}

export function getMaxBlanksForSentence(
  sentenceWordCount: number,
  density: BlankDensity
): number {
  if (density === "standard") {
    if (sentenceWordCount <= 12) return 1;
    if (sentenceWordCount <= 24) return 2;
    return 3;
  }
  // high / 난이도 UP — allow 2 blanks on short claim sentences
  if (sentenceWordCount <= 8) return 1;
  if (sentenceWordCount <= 16) return 2;
  if (sentenceWordCount <= 28) return 3;
  return 4;
}

export function parseBlankHintType(raw: string | null | undefined): BlankHintType {
  return raw === "none" ? "none" : "first_letter";
}

export function parseBlankTranslationLayout(
  raw: string | null | undefined
): BlankTranslationLayout {
  return raw === "sentence_pair" ? "sentence_pair" : "chunk";
}

export function parseBlankDensity(raw: string | null | undefined): BlankDensity {
  return raw === "standard" ? "standard" : "high";
}

export function estimateBlankCountPreview(options: WorkbookBlankFillOptions): {
  low: number;
  high: number;
} {
  const a = getBlankTargetRange({
    englishWordCount: 120,
    density: options.density,
  });
  const b = getBlankTargetRange({
    englishWordCount: 180,
    density: options.density,
  });
  return { low: a.low, high: b.high };
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
