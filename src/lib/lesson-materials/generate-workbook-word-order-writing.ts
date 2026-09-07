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
  validateWordOrderChunks,
  type WordOrderChunk,
  type WordOrderChunkSource,
} from "@/lib/lesson-materials/word-order-chunking";
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

function resolveChunks(input: {
  passageId: string;
  sentenceId: string;
  english: string;
  sourceHash: string;
  packJson?: unknown;
  cache?: StoredWordOrderChunkCache | null;
  aiChunks?: WordOrderChunk[] | null;
}): { chunks: WordOrderChunk[]; source: WordOrderChunkSource; reason?: string } {
  const stored = extractStoredChunksFromPack(
    input.packJson,
    input.sentenceId,
    input.english
  );
  if (stored) {
    const v = validateWordOrderChunks(input.english, stored);
    if (v.ok) return { chunks: stored, source: "stored" };
  }

  const cached = getCachedSentenceChunks(
    input.cache,
    input.passageId,
    input.sentenceId,
    input.sourceHash
  );
  if (cached) {
    const v = validateWordOrderChunks(input.english, cached);
    if (v.ok) return { chunks: cached, source: "cache" };
  }

  if (input.aiChunks) {
    const v = validateWordOrderChunks(input.english, input.aiChunks);
    if (v.ok) return { chunks: input.aiChunks, source: "openai" };
  }

  const fallback = buildFallbackWordOrderChunks(
    input.sentenceId,
    input.english
  );
  const v = validateWordOrderChunks(input.english, fallback);
  const reason = v.ok
    ? "no-stored-cache-or-valid-ai"
    : `fallback-invalid:${v.ok === false ? v.reason : ""}`;
  console.warn("[WordOrderChunks] fallback used", {
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    reason,
  });
  if (!v.ok) {
    // Last resort: pair tokens (still not all singles when n>=2)
    const paired = buildFallbackWordOrderChunks(input.sentenceId, input.english);
    return { chunks: paired, source: "fallback", reason };
  }
  return { chunks: fallback, source: "fallback", reason };
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
  const check = validateWordOrderChunks(input.english, input.chunks);
  if (!check.ok) return null;

  const seed = buildWordOrderSeed({
    workbookId: input.workbookId,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    sourceHash: input.sourceHash,
  });
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
  };
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

  for (const s of bilingualSections) {
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
        ? validateWordOrderChunks(it.english, stored).ok
        : false;
      const cachedOk = cached
        ? validateWordOrderChunks(it.english, cached).ok
        : false;
      if (!storedOk && !cachedOk) {
        needAi.push({ sentenceId: it.sentenceId, english: it.english });
      }
    }

    let aiById = new Map<string, WordOrderChunk[]>();
    if (needAi.length > 0 && process.env.OPENAI_API_KEY?.trim()) {
      const ai = await callWordOrderChunkOpenAI({ sentences: needAi });
      aiById = ai.byId;
      openAiRequestCount += ai.openAiRequestCount;
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
      if (!q) continue;
      items.push(q);
      if (resolved.source === "openai" || resolved.source === "fallback") {
        cache = upsertSentenceChunks(
          cache,
          s.projectId,
          it.sentenceId,
          it.sourceHash,
          resolved.chunks
        );
      }
    }

    if (cache && items.length) {
      cachesToSave.push({ projectId: s.projectId, cache });
    }

    if (items.length === 0) continue;
    sections.push({
      projectId: s.projectId,
      title: s.title,
      source: s.source,
      algorithmVersion: WORD_ORDER_WRITING_ALGORITHM_VERSION,
      items,
    });
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
      const chunks = buildFallbackWordOrderChunks(it.sentenceId, it.english);
      const q = createWordOrderQuestion({
        workbookId,
        passageId: s.projectId,
        sentenceId: it.sentenceId,
        orderIndex: it.orderIndex,
        english: it.english,
        korean: it.korean,
        sourceHash: it.sourceHash,
        chunks,
        chunkSource: "fallback",
      });
      if (q) items.push(q);
    }
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
