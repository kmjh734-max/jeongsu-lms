/** Lesson-materials workbook types (ready + placeholder cards). */
import { defaultDocumentName } from "@/lib/lesson-materials/documents";

export type WorkbookTypeId =
  | "grammar_choice"
  | "vocab_choice"
  | "grammar_fix"
  | "vocab_fix"
  | "blank_fill"
  | "tf"
  | "sentence_order"
  /** @deprecated removed from catalog; kept for old session payloads */
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

/**
 * 워크북 유형 순서. 만들기 화면의 목록, 실제 워크북, 인쇄, 정답이 모두 이 순서를 따른다.
 * 2026-09-11 선생님 지정: 한줄해석, T/F, 빈칸 채우기, 어법 선택, 어법 수정, 어휘 선택,
 * 어휘 수정, 문장 순서 배열, 어순배열 영작, 통문장 영작.
 */
export const WORKBOOK_TYPE_CATALOG: WorkbookTypeMeta[] = [
  {
    id: "one_line_ko",
    title: "한줄해석",
    subtitle: "영어 문장을 한국어로 해석하기",
    ready: true,
    displayOrder: 1,
    printOrder: 1,
  },
  {
    id: "tf",
    title: "T/F 문제",
    subtitle: "지문 이해도를 확인하는 True/False 문항",
    ready: true,
    displayOrder: 2,
    printOrder: 2,
  },
  {
    id: "blank_fill",
    title: "빈칸 채우기",
    subtitle: "핵심 어휘에 생성된 빈칸을 채우며 지문 정리하기",
    ready: true,
    displayOrder: 3,
    printOrder: 3,
  },
  {
    id: "grammar_choice",
    title: "어법 선택",
    subtitle: "[A/B] 중 어법상 알맞은 것을 고르기",
    ready: true,
    displayOrder: 4,
    printOrder: 4,
  },
  {
    id: "grammar_fix",
    title: "어법 수정",
    subtitle: "어법상 어색한 부분을 고치는 서술형",
    ready: false,
    displayOrder: 5,
    printOrder: 5,
  },
  {
    id: "vocab_choice",
    title: "어휘 선택",
    subtitle: "[A/B] 중 문맥에 알맞은 어휘 고르기",
    ready: false,
    displayOrder: 6,
    printOrder: 6,
  },
  {
    id: "vocab_fix",
    title: "어휘 수정",
    subtitle: "문맥상 어색한 어휘를 고치는 서술형",
    ready: false,
    displayOrder: 7,
    printOrder: 7,
  },
  {
    id: "sentence_order",
    title: "문장 순서 배열",
    subtitle: "글의 흐름에 맞게 문장 순서 배열하기",
    ready: true,
    displayOrder: 8,
    printOrder: 8,
  },
  {
    id: "word_order_writing",
    title: "어순배열 영작",
    subtitle: "제시된 단어를 배열하여 문장 만들기",
    ready: true,
    displayOrder: 9,
    printOrder: 9,
  },
  {
    id: "full_en_writing",
    title: "통문장 영작",
    subtitle: "한글 해석을 보고 영어 통문장 쓰기",
    ready: true,
    displayOrder: 10,
    printOrder: 10,
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
  if (id === "vocab_example") return "어휘 테스트 (예문)";
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

/** Sentence-order workbook question (deterministic shuffle stored once). */
export type WorkbookSentenceOrderItem = {
  displayNumber: number;
  sentenceId: string;
  english: string;
  englishDisplay: string;
  originalOrderIndex: number;
};

export type WorkbookSentenceOrderQuestion = {
  questionId: string;
  passageId: string;
  title: string;
  source: string | null;
  setIndex: number;
  passageOrdinal: number;
  seed: string;
  pinFirstSentence: boolean;
  givenSentence: {
    sentenceId: string;
    english: string;
    englishDisplay: string;
    originalOrderIndex: number;
  } | null;
  originalSentenceIds: string[];
  originalEnglish: string[];
  shuffledSentenceIds: string[];
  shuffledItems: WorkbookSentenceOrderItem[];
  answerOrderNumbers: number[];
  restoredPassagePreview: string;
};

export type WorkbookSentenceOrderSkip = {
  projectId: string;
  title: string;
  reason: string;
};

export type WorkbookLineTranslationItem = {
  sentenceId: string;
  orderIndex: number;
  english: string;
  englishDisplay: string;
  korean: string;
  sourceHash: string;
  answerLineCount: number;
};

export type WorkbookLineTranslationSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: WorkbookLineTranslationItem[];
  algorithmVersion: string;
};

export type WorkbookLineTranslationSkip = {
  projectId: string;
  title: string;
  reason: string;
};

export type WorkbookFullEnWritingItem = {
  sentenceId: string;
  orderIndex: number;
  english: string;
  englishDisplay: string;
  korean: string;
  sourceHash: string;
  answerLineCount: number;
};

export type WorkbookFullEnWritingSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: WorkbookFullEnWritingItem[];
  algorithmVersion: string;
};

export type WorkbookWordOrderChunk = {
  chunkId: string;
  text: string;
  originalIndex: number;
  startTokenIndex: number;
  endTokenIndex: number;
};

export type WorkbookWordOrderWritingItem = {
  questionId: string;
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  korean: string;
  originalEnglish: string;
  originalChunks: WorkbookWordOrderChunk[];
  shuffledChunks: WorkbookWordOrderChunk[];
  seed: string;
  sourceHash: string;
  answerLineCount: number;
  chunkSource?:
    | "stored-syntax"
    | "cached-ai"
    | "new-ai"
    | "deterministic-fallback"
    | "legacy-word-groups"
    | "stored"
    | "cache"
    | "openai"
    | "fallback";
  chunkValidationPassed?: boolean;
};

export type WorkbookWordOrderWritingSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: WorkbookWordOrderWritingItem[];
  algorithmVersion: string;
};

export type GrammarChoiceAmbiguityRisk = "low" | "medium" | "high";

export type GrammarChoiceSourceType =
  | "analysis_required"
  | "ai_supplement"
  | "heuristic_supplement";

export type GrammarChoiceCandidate = {
  choiceId: string;
  passageId: string;
  sentenceId: string;
  startTokenIndex: number;
  endTokenIndex: number;
  originalText: string;
  correctText: string;
  incorrectText: string;
  grammarCategoryId: string;
  grammarCategoryName: string;
  bookTerm: string;
  /** 문항이 묻는 것과 코드가 어긋나 정답지에 라벨을 싣지 않는다. */
  labelHidden?: boolean;
  explanationKo: string;
  incorrectReasonKo: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  learningValue: 1 | 2 | 3 | 4 | 5;
  ambiguityRisk: GrammarChoiceAmbiguityRisk;
  sourceType?: GrammarChoiceSourceType;
  analysisPointId?: string | null;
  structureSummary?: string;
};

export type GrammarChoiceRenderSegment =
  | { type: "text"; text: string }
  | {
      type: "choice";
      number: number;
      leftText: string;
      rightText: string;
    };

export type WorkbookGrammarChoiceItem = {
  number: number;
  choiceId: string;
  sentenceId: string;
  startTokenIndex: number;
  endTokenIndex: number;
  /** Inclusive start / exclusive end in sourcePassage */
  startCharIndex: number;
  endCharIndex: number;
  originalText: string;
  correctText: string;
  incorrectText: string;
  leftText: string;
  rightText: string;
  correctSide: "left" | "right";
  grammarCategoryId: string;
  grammarCategoryName: string;
  bookTerm: string;
  /** 문항이 묻는 것과 코드가 어긋나 정답지에 라벨을 싣지 않는다. */
  labelHidden?: boolean;
  explanationKo: string;
  incorrectReasonKo: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  learningValue: 1 | 2 | 3 | 4 | 5;
  sourceType?: GrammarChoiceSourceType;
  analysisPointId?: string | null;
  structureSummary?: string;
  analysisOriginLabel?: string;
  /** Teacher/replay provenance. Not rendered on the student surface. */
  internalProvenance?: {
    code: string;
    subtype: string;
    priority: string;
    assessmentAxis: string;
    occurrenceId: string;
    sourceSpan: string;
    candidateId: string;
    exclusionReason: string | null;
  };
};

export type WorkbookGrammarChoiceDiagnostics = {
  sentenceCount: number;
  analysisHintCount: number;
  generatedCandidateCount: number;
  codeValidatedCount: number;
  originalMismatchCount: number;
  rangeErrorCount: number;
  overlapDuplicateCount: number;
  reviewSubmittedCount: number;
  reviewAcceptedCount: number;
  bothPossibleRejectCount: number;
  lexicalRejectCount: number;
  trivialRejectCount: number;
  finalCount: number;
  grammarCategoryCount: number;
  averageQualityScore: number;
  passageRestored: boolean;
  cacheHit: boolean;
  generatorModel: string;
  reviewerModel: string;
  /** OpenAI 응답 JSON의 model 필드 (요청명과 다를 수 있음) */
  generatorResponseModel: string;
  reviewerResponseModel: string;
  generatorActualResponseModel: string;
  reviewerActualResponseModel: string;
  generatorReasoningEffort: string;
  reviewerReasoningEffort: string;
  reasoningEffort: string;
  openAICallCount: number;
  localFallbackUsed: false;
  generatorVersion: string;
  /** Engine actually used for this section. Teacher diagnostics only. */
  engineVersion?: "v1" | "v2";
  /** Set when GRAMMAR_CHOICE_ENGINE_VERSION is neither v1 nor v2. */
  engineSelectionNote?: string;
  reviewerVersion: string;
  apiCalls: Array<{
    stage: "GENERATOR_INITIAL" | "GENERATOR_TOP_UP" | "REVIEWER";
    requestedModel: string;
    actualResponseModel: string;
    reasoningEffort: string;
  }>;
  forceRegenerate: boolean;
  oldQuestionReuseCount: number;
  generatorActualModel: string;
  reviewerActualModel: string;
  newQuestionCount: number;
  desiredQuestionCount?: number;
  discoveredGrammarPointCount?: number;
  initialCandidateCount?: number;
  initialApprovedCount?: number;
  topUpRoundCount?: number;
  topUpCandidateCount?: number;
  topUpApprovedCount?: number;
  finalQuestionCount?: number;
  renderedQuestionCount?: number;
  countMismatch?: boolean;
  difficultyMix?: { BASIC: number; CORE: number; ADVANCED: number };
  sentencePointCounts?: Array<{ sentenceId: string; count: number }>;
  rejectReasonCounts?: Record<string, number>;
  /** Same distractor pair with the same code/subtype appearing more than once. */
  repeatedCodeSubtypePairs?: string[];
  generateApiCalls: number;
  reviewApiCalls: number;
  underTargetReason: string | null;
  mandatoryDetected?: number;
  mandatoryEligible?: number;
  mandatoryRendered?: number;
  mandatoryExcludedWithValidReason?: number;
  sectionStatus?: "COMPLETE" | "PARTIAL" | "REJECTED";
  analysisOnlyCount?: number;
  eligibleQuestionCount?: number;
  excludedOccurrenceCount?: number;
  missingEligibleCount?: number;
  mandatoryCoverage?: "N/A" | number;
  /** MANDATORY grammar occurrences. Not student items. */
  detectedMandatoryOccurrences?: number;
  analysisOnlyMandatoryOccurrences?: number;
  eligibleMandatoryOccurrences?: number;
  validExcludedMandatoryOccurrences?: number;
  renderedMandatoryOccurrences?: number;
  missingEligibleMandatoryOccurrences?: number;
  /** Student-question candidates, not mixed with mandatory detections. */
  totalEligibleQuestions?: number;
  /** Student items actually inserted. */
  totalRenderedQuestions?: number;
  /** All-priority occurrence exclusions. */
  totalExcludedOccurrences?: number;
  countUnits?: Record<string, string>;
  /** Teacher-only. Set only when GRAMMAR_CHOICE_ENGINE_COMPARE=1. */
  staffCompareNote?: string;
  reviewRejectSamples: Array<{ candidateId: string; reasons: string[] }>;
  codeRejectSamples: Array<{
    candidateId: string;
    reason: string;
    pair: string;
  }>;
};

export type WorkbookGrammarChoiceSection = {
  projectId: string;
  title: string;
  source: string | null;
  sourcePassage: string;
  segments: GrammarChoiceRenderSegment[];
  items: WorkbookGrammarChoiceItem[];
  algorithmVersion: string;
  diagnostics?: WorkbookGrammarChoiceDiagnostics;
};

export type WorkbookGrammarChoiceSkip = {
  projectId: string;
  title: string;
  reason: string;
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
  /** Grammar-choice sections */
  grammarChoiceSections?: WorkbookGrammarChoiceSection[];
  grammarChoiceSkipped?: WorkbookGrammarChoiceSkip[];
  /** Sentence-order questions (empty when sentence_order not selected) */
  sentenceOrderQuestions?: WorkbookSentenceOrderQuestion[];
  /** Passages skipped for sentence-order (too few sentences / restore fail) */
  sentenceOrderSkipped?: WorkbookSentenceOrderSkip[];
  /** One-line Korean translation sections */
  lineTranslationSections?: WorkbookLineTranslationSection[];
  lineTranslationSkipped?: WorkbookLineTranslationSkip[];
  /** Full-sentence English writing (Korean prompt → English answer) */
  fullEnWritingSections?: WorkbookFullEnWritingSection[];
  fullEnWritingSkipped?: WorkbookLineTranslationSkip[];
  /** Word-order writing (Korean + scrambled tokens → English) */
  wordOrderWritingSections?: WorkbookWordOrderWritingSection[];
  wordOrderWritingSkipped?: WorkbookLineTranslationSkip[];
  timing?: WorkbookGenerationTiming;
};

/** Soft target range for grammar-choice count by passage length. */
export function getGrammarChoiceTargetRange(englishWordCount: number): {
  min: number;
  max: number;
} {
  // Kept for legacy imports; v5 uses getGrammarChoiceFinalTargetRange
  if (englishWordCount < 80) return { min: 4, max: 6 };
  if (englishWordCount < 120) return { min: 6, max: 8 };
  if (englishWordCount < 180) return { min: 8, max: 12 };
  return { min: 10, max: 14 };
}

/** 워크북_0911 (한국 시간). 워크북 파일 이름의 기본값이기도 하다. */
export function defaultWorkbookTitle(d = new Date()): string {
  return defaultDocumentName("workbook", d);
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
  const { low, high } = getBlankTargetRange({
    englishWordCount: input.englishWordCount,
    density: input.density,
  });
  // Prefer upper-mid of range so density expands when good content words exist
  let target = Math.round(low + (high - low) * 0.7);
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
    if (n < 100) return { low: 12, high: 15 };
    if (n < 150) return { low: 17, high: 20 };
    if (n < 200) return { low: 21, high: 25 };
    if (n < 250) return { low: 25, high: 30 };
    const low = Math.max(25, Math.round(n * 0.11));
    const high = Math.max(low + 1, Math.round(n * 0.13));
    return { low, high };
  }
  // high = 많이 / 난이도 UP
  if (n < 100) return { low: 16, high: 20 };
  if (n < 150) return { low: 21, high: 25 };
  if (n < 200) return { low: 26, high: 31 };
  if (n < 250) return { low: 31, high: 37 };
  const low = Math.max(31, Math.round(n * 0.14));
  const high = Math.max(low + 1, Math.round(n * 0.16));
  return { low, high };
}

export function getMaxBlanksForSentence(
  sentenceWordCount: number,
  density: BlankDensity
): number {
  if (density === "standard") {
    if (sentenceWordCount <= 8) return 2;
    if (sentenceWordCount <= 16) return 3;
    if (sentenceWordCount <= 26) return 4;
    return 5;
  }
  if (sentenceWordCount <= 8) return 2;
  if (sentenceWordCount <= 14) return 3;
  if (sentenceWordCount <= 22) return 4;
  if (sentenceWordCount <= 32) return 5;
  return 6;
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
