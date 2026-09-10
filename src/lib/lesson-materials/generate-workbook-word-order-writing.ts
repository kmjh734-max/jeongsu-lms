import {
  generateWorkbookLineTranslation,
  type LineTranslationSkip,
  type WorkbookLineTranslationSection,
} from "@/lib/lesson-materials/generate-workbook-line-translation";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";
import { WORD_ORDER_WRITING_ALGORITHM_VERSION } from "@/lib/lesson-materials/word-order-writing-constants";
import {
  buildFallbackWordOrderChunks,
  extractStoredChunksFromPack,
  looksLikeFixedWidthSplit,
  validateWordOrderChunksDetailed,
  type WordOrderChunk,
  type WordOrderChunkSource,
} from "@/lib/lesson-materials/word-order-chunking";
import { refineSemanticChunks } from "@/lib/lesson-materials/word-order-chunk-refine";
import {
  getCachedSentenceChunks,
  upsertSentenceChunks,
  type StoredWordOrderChunkCache,
} from "@/lib/lesson-materials/word-order-chunk-cache";
import { callWordOrderChunkOpenAI } from "@/lib/lesson-materials/word-order-chunk-openai";
import {
  buildWordOrderSeed,
  shuffleWordOrderChunks,
} from "@/lib/lesson-materials/word-order-shuffle";
import { countEnglishWords } from "@/lib/lesson-materials/workbook-types";
import { normalizeWhitespace } from "@/lib/lesson-materials/word-order-tokenize";

import { runWithConcurrency } from "@/lib/run-with-concurrency";

/** 어순배열에서 동시에 처리하는 지문 수. 빈칸과 같은 이유로 상한만 둔다. */
const WORD_ORDER_PASSAGE_CONCURRENCY = 8;

export type WordOrderWritingItem = {
  questionId: string;
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  korean: string;
  originalEnglish: string;
  originalChunks: WordOrderChunk[];
  shuffledChunks: WordOrderChunk[];
  seed: string;
  sourceHash: string;
  answerLineCount: number;
  chunkSource: WordOrderChunkSource;
  chunkValidationPassed: boolean;
};

export type WorkbookWordOrderWritingSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: WordOrderWritingItem[];
  algorithmVersion: string;
};

/** Fewer answer lines than full-sentence writing — chunks are already shown. */
export function getWordOrderWritingLineCount(english: string): number {
  const wordCount = countEnglishWords(english);
  if (wordCount <= 20) return 2;
  if (wordCount <= 40) return 3;
  return 4;
}

function finalizeChunks(
  english: string,
  chunks: WordOrderChunk[]
): WordOrderChunk[] | null {
  // Refine in original order, then validate — never shuffle first.
  const refined = refineSemanticChunks(chunks, english);
  const v = validateWordOrderChunksDetailed(english, refined);
  if (!v.ok) {
    // Fall back to pre-refine if refine broke validation
    const v0 = validateWordOrderChunksDetailed(english, chunks);
    return v0.ok ? chunks : null;
  }
  return refined;
}

function resolveChunks(input: {
  passageId: string;
  sentenceId: string;
  english: string;
  sourceHash: string;
  packJson?: unknown;
  cache?: StoredWordOrderChunkCache | null;
  aiChunks?: WordOrderChunk[] | null;
}): {
  chunks: WordOrderChunk[] | null;
  source: WordOrderChunkSource;
  reason?: string;
} {
  const stored = extractStoredChunksFromPack(
    input.packJson,
    input.sentenceId,
    input.english
  );
  if (stored) {
    const finalized = finalizeChunks(input.english, stored);
    if (finalized) return { chunks: finalized, source: "stored-syntax" };
  }

  const cached = getCachedSentenceChunks(
    input.cache,
    input.passageId,
    input.sentenceId,
    input.sourceHash
  );
  if (cached) {
    const v = validateWordOrderChunksDetailed(input.english, cached);
    if (v.ok) {
      if (looksLikeFixedWidthSplit(cached)) {
        console.warn("[WordOrderChunks] rejecting fixed-width cache", {
          passageId: input.passageId,
          sentenceId: input.sentenceId,
        });
      } else {
        // v4 cache already refined; still run refine (idempotent merges)
        const finalized = finalizeChunks(input.english, cached);
        if (finalized) return { chunks: finalized, source: "cached-ai" };
      }
    }
  }

  if (input.aiChunks) {
    const finalized = finalizeChunks(input.english, input.aiChunks);
    if (finalized) return { chunks: finalized, source: "new-ai" };
  }

  const fallback = buildFallbackWordOrderChunks(
    input.sentenceId,
    input.english
  );
  if (!fallback) {
    console.warn("[WordOrderChunks] no valid chunks", {
      passageId: input.passageId,
      sentenceId: input.sentenceId,
      reason: "fallback-failed-or-invalid",
    });
    return {
      chunks: null,
      source: "deterministic-fallback",
      reason: "fallback-failed",
    };
  }
  const finalized = finalizeChunks(input.english, fallback);
  if (!finalized) {
    console.warn("[WordOrderChunks] fallback rejected after refine", {
      passageId: input.passageId,
      sentenceId: input.sentenceId,
    });
    return {
      chunks: null,
      source: "deterministic-fallback",
      reason: "fallback-invalid-after-refine",
    };
  }
  console.warn("[WordOrderChunks] fallback used", {
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    reason: "no-stored-cache-or-valid-ai",
  });
  return {
    chunks: finalized,
    source: "deterministic-fallback",
    reason: "no-stored-cache-or-valid-ai",
  };
}

export function createWordOrderQuestion(input: {
  workbookId: string;
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  english: string;
  korean: string;
  sourceHash: string;
  chunks: WordOrderChunk[];
  chunkSource: WordOrderChunkSource;
}): WordOrderWritingItem | null {
  // Chunks must already be refined in original order before this call.
  const check = validateWordOrderChunksDetailed(input.english, input.chunks);
  if (!check.ok) return null;

  const seed = buildWordOrderSeed({
    workbookId: input.workbookId,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    sourceHash: input.sourceHash,
  });
  // Shuffle only after refine + validate.
  const shuffledChunks = shuffleWordOrderChunks(input.chunks, seed);

  return {
    questionId: `wo|${input.passageId}|${input.sentenceId}|${seed.slice(0, 12)}`,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    orderIndex: input.orderIndex,
    korean: input.korean,
    originalEnglish: normalizeWhitespace(input.english),
    originalChunks: input.chunks,
    shuffledChunks,
    seed,
    sourceHash: input.sourceHash,
    answerLineCount: getWordOrderWritingLineCount(input.english),
    chunkSource: input.chunkSource,
    chunkValidationPassed: true,
  };
}

function logChunkDiagnostics(items: WordOrderWritingItem[]) {
  if (process.env.NODE_ENV === "production") return;
  console.table(
    items.map((question) => ({
      sentenceId: question.sentenceId,
      source: question.chunkSource,
      chunkCount: question.originalChunks.length,
      chunks: question.originalChunks.map((chunk) => chunk.text).join(" / "),
      validationPassed: question.chunkValidationPassed,
    }))
  );
}

/**
 * Build word-order writing sections with semantic chunks.
 * OpenAI is used at most once per passage for missing sentences.
 */
export async function generateWorkbookWordOrderWriting(input: {
  workbookId: string;
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string; korean?: string | null }>;
    sentenceTranslations: StoredSentenceTranslation[];
    packJson?: unknown;
    wordOrderChunkCache?: StoredWordOrderChunkCache | null;
  }>;
  excludeProjectIds?: string[];
  prebuiltLineSections?: WorkbookLineTranslationSection[];
  prebuiltSkipped?: LineTranslationSkip[];
  prebuiltBlocking?: LineTranslationSkip[];
}): Promise<{
  sections: WorkbookWordOrderWritingSection[];
  skipped: LineTranslationSkip[];
  blocking: LineTranslationSkip[];
  openAiRequestCount: number;
  cachesToSave: Array<{
    projectId: string;
    cache: StoredWordOrderChunkCache;
  }>;
}> {
  let bilingualSections = input.prebuiltLineSections;
  let skipped = input.prebuiltSkipped ?? [];
  let blocking = input.prebuiltBlocking ?? [];

  if (!bilingualSections) {
    const bilingual = generateWorkbookLineTranslation({
      passages: input.passages,
      excludeProjectIds: input.excludeProjectIds,
    });
    bilingualSections = bilingual.sections;
    skipped = bilingual.skipped;
    blocking = bilingual.blocking;
  }

  if (blocking.length > 0) {
    return {
      sections: [],
      skipped,
      blocking,
      openAiRequestCount: 0,
      cachesToSave: [],
    };
  }

  const packByProject = new Map(
    input.passages.map((p) => [p.projectId, p] as const)
  );
  let openAiRequestCount = 0;
  const cachesToSave: Array<{
    projectId: string;
    cache: StoredWordOrderChunkCache;
  }> = [];
  const sections: WorkbookWordOrderWritingSection[] = [];
  const failedSentences: string[] = [];

  /**
   * 지문 하나씩 순서대로 기다리고 있었다. 지문끼리 독립이고 호출도 지문당
   * 하나라 실행 시간이 지문 수에 그대로 비례했다(실측 4지문 58.1초).
   * 누적값은 지문별로 모아 입력 순서대로 합친다.
   */
  const perSection = async (s: (typeof bilingualSections)[number]) => {
    let localOpenAi = 0;
    const localFailed: string[] = [];
    let localCache: { projectId: string; cache: StoredWordOrderChunkCache } | null = null;
    let localSection: WorkbookWordOrderWritingSection | null = null;
    const passage = packByProject.get(s.projectId);
    let cache = passage?.wordOrderChunkCache ?? null;
    const needAi: Array<{ sentenceId: string; english: string }> = [];

    for (const it of s.items) {
      const stored = extractStoredChunksFromPack(
        passage?.packJson,
        it.sentenceId,
        it.english
      );
      const cached = getCachedSentenceChunks(
        cache,
        s.projectId,
        it.sentenceId,
        it.sourceHash
      );
      const storedOk = stored
        ? validateWordOrderChunksDetailed(it.english, stored).ok
        : false;
      const cachedOk = cached
        ? validateWordOrderChunksDetailed(it.english, cached).ok &&
          !looksLikeFixedWidthSplit(cached)
        : false;
      if (!storedOk && !cachedOk) {
        needAi.push({ sentenceId: it.sentenceId, english: it.english });
      }
    }

    let aiById = new Map<string, WordOrderChunk[]>();
    if (needAi.length > 0 && process.env.OPENAI_API_KEY?.trim()) {
      const ai = await callWordOrderChunkOpenAI({ sentences: needAi });
      aiById = ai.byId;
      localOpenAi += ai.openAiRequestCount;
    }

    const items: WordOrderWritingItem[] = [];
    for (const it of s.items) {
      const resolved = resolveChunks({
        passageId: s.projectId,
        sentenceId: it.sentenceId,
        english: it.english,
        sourceHash: it.sourceHash,
        packJson: passage?.packJson,
        cache,
        aiChunks: aiById.get(it.sentenceId) ?? null,
      });
      if (!resolved.chunks) {
        localFailed.push(it.sentenceId);
        console.error(
          "[WordOrderChunks] 이 문장은 의미 단위 배열 데이터를 생성하지 못했습니다.",
          { passageId: s.projectId, sentenceId: it.sentenceId }
        );
        continue;
      }
      const q = createWordOrderQuestion({
        workbookId: input.workbookId,
        passageId: s.projectId,
        sentenceId: it.sentenceId,
        orderIndex: it.orderIndex,
        english: it.english,
        korean: it.korean,
        sourceHash: it.sourceHash,
        chunks: resolved.chunks,
        chunkSource: resolved.source,
      });
      if (!q) {
        localFailed.push(it.sentenceId);
        continue;
      }
      items.push(q);
      if (
        resolved.source === "new-ai" ||
        resolved.source === "deterministic-fallback"
      ) {
        cache = upsertSentenceChunks(
          cache,
          s.projectId,
          it.sentenceId,
          it.sourceHash,
          resolved.chunks
        );
      }
    }

    logChunkDiagnostics(items);

    if (cache && items.length) {
      localCache = ({ projectId: s.projectId, cache });
    }

    // 이 지문에서 문항이 하나도 안 나오면 섹션을 만들지 않는다.
    if (items.length === 0) {
      return { localOpenAi, localFailed, localCache, localSection };
    }
    localSection = ({
      projectId: s.projectId,
      title: s.title,
      source: s.source,
      algorithmVersion: WORD_ORDER_WRITING_ALGORITHM_VERSION,
      items,
    });
    return { localOpenAi, localFailed, localCache, localSection };
  };

  const perSectionResults = await runWithConcurrency(
    bilingualSections,
    WORD_ORDER_PASSAGE_CONCURRENCY,
    perSection
  );
  for (const row of perSectionResults) {
    openAiRequestCount += row.localOpenAi;
    failedSentences.push(...row.localFailed);
    if (row.localCache) cachesToSave.push(row.localCache);
    if (row.localSection) sections.push(row.localSection);
  }

  if (failedSentences.length && sections.length === 0) {
    console.error(
      "[WordOrderChunks] all sentences failed semantic chunking",
      failedSentences
    );
  }

  return {
    sections,
    skipped,
    blocking,
    openAiRequestCount,
    cachesToSave,
  };
}

/** Sync helper for tests / offline fallback-only mapping. */
export function mapLineTranslationToWordOrderWriting(
  sections: WorkbookLineTranslationSection[],
  workbookId: string
): WorkbookWordOrderWritingSection[] {
  const out: WorkbookWordOrderWritingSection[] = [];
  for (const s of sections) {
    const items: WordOrderWritingItem[] = [];
    for (const it of s.items) {
      const raw = buildFallbackWordOrderChunks(it.sentenceId, it.english);
      if (!raw) continue;
      const chunks = finalizeChunks(it.english, raw);
      if (!chunks) continue;
      const q = createWordOrderQuestion({
        workbookId,
        passageId: s.projectId,
        sentenceId: it.sentenceId,
        orderIndex: it.orderIndex,
        english: it.english,
        korean: it.korean,
        sourceHash: it.sourceHash,
        chunks,
        chunkSource: "deterministic-fallback",
      });
      if (q) items.push(q);
    }
    logChunkDiagnostics(items);
    if (!items.length) continue;
    out.push({
      projectId: s.projectId,
      title: s.title,
      source: s.source,
      algorithmVersion: WORD_ORDER_WRITING_ALGORITHM_VERSION,
      items,
    });
  }
  return out;
}

/** Problem sheet must not show original English in normal order. */
export function problemSheetLeaksOriginalEnglish(
  section: WorkbookWordOrderWritingSection
): boolean {
  for (const it of section.items) {
    const en = it.originalEnglish.trim();
    if (en.length < 8) continue;
    if (it.korean.includes(en)) return true;
    const bank = it.shuffledChunks.map((c) => c.text).join(" ");
    if (bank === en) return true;
    const bankSlash = it.shuffledChunks.map((c) => c.text).join(" / ");
    if (bankSlash.includes(en)) return true;
  }
  return false;
}
