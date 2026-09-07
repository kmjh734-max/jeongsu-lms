import { getFullSentenceWritingLineCount } from "@/lib/lesson-materials/generate-workbook-full-en-writing";
import {
  generateWorkbookLineTranslation,
  type LineTranslationSkip,
  type WorkbookLineTranslationSection,
} from "@/lib/lesson-materials/generate-workbook-line-translation";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";
import { WORD_ORDER_WRITING_ALGORITHM_VERSION } from "@/lib/lesson-materials/word-order-writing-constants";
import {
  tokenizeForWordOrder,
  validateWordOrderTokens,
  type WordOrderToken,
} from "@/lib/lesson-materials/word-order-tokenize";
import {
  buildWordOrderSeed,
  shuffleWordOrderTokens,
} from "@/lib/lesson-materials/word-order-shuffle";

export type WordOrderWritingItem = {
  questionId: string;
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  korean: string;
  originalEnglish: string;
  originalTokens: WordOrderToken[];
  shuffledTokens: WordOrderToken[];
  seed: string;
  sourceHash: string;
  answerLineCount: number;
};

export type WorkbookWordOrderWritingSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: WordOrderWritingItem[];
  algorithmVersion: string;
};

/** Same line-count bands as full-sentence writing. */
export function getWordOrderWritingLineCount(english: string): number {
  return getFullSentenceWritingLineCount(english);
}

export function createWordOrderQuestion(input: {
  workbookId: string;
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  english: string;
  korean: string;
  sourceHash: string;
}): WordOrderWritingItem | null {
  const originalTokens = tokenizeForWordOrder(input.english);
  if (originalTokens.length === 0) return null;

  const seed = buildWordOrderSeed({
    workbookId: input.workbookId,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    sourceHash: input.sourceHash,
  });
  const shuffledTokens = shuffleWordOrderTokens(originalTokens, seed);
  const check = validateWordOrderTokens(
    input.english,
    originalTokens,
    shuffledTokens
  );
  if (!check.ok) return null;

  return {
    questionId: `wo|${input.passageId}|${input.sentenceId}|${seed.slice(0, 12)}`,
    passageId: input.passageId,
    sentenceId: input.sentenceId,
    orderIndex: input.orderIndex,
    korean: input.korean,
    originalEnglish: originalTokens
      .slice()
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((t) => t.surface)
      .join(" "),
    originalTokens,
    shuffledTokens,
    seed,
    sourceHash: input.sourceHash,
    answerLineCount: getWordOrderWritingLineCount(input.english),
  };
}

/** Map shared bilingual sections → word-order writing (deterministic shuffle). */
export function mapLineTranslationToWordOrderWriting(
  sections: WorkbookLineTranslationSection[],
  workbookId: string
): WorkbookWordOrderWritingSection[] {
  const out: WorkbookWordOrderWritingSection[] = [];
  for (const s of sections) {
    const items: WordOrderWritingItem[] = [];
    for (const it of s.items) {
      const q = createWordOrderQuestion({
        workbookId,
        passageId: s.projectId,
        sentenceId: it.sentenceId,
        orderIndex: it.orderIndex,
        english: it.english,
        korean: it.korean,
        sourceHash: it.sourceHash,
      });
      if (q) items.push(q);
    }
    if (items.length === 0) continue;
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

/**
 * Build word-order writing workbook data by reusing one-line-KO
 * bilingual matching (no OpenAI).
 */
export function generateWorkbookWordOrderWriting(input: {
  workbookId: string;
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string; korean?: string | null }>;
    sentenceTranslations: StoredSentenceTranslation[];
  }>;
  excludeProjectIds?: string[];
  prebuiltLineSections?: WorkbookLineTranslationSection[];
  prebuiltSkipped?: LineTranslationSkip[];
  prebuiltBlocking?: LineTranslationSkip[];
}): {
  sections: WorkbookWordOrderWritingSection[];
  skipped: LineTranslationSkip[];
  blocking: LineTranslationSkip[];
  openAiRequestCount: 0;
} {
  if (input.prebuiltLineSections || input.prebuiltBlocking) {
    return {
      sections: mapLineTranslationToWordOrderWriting(
        input.prebuiltLineSections ?? [],
        input.workbookId
      ),
      skipped: input.prebuiltSkipped ?? [],
      blocking: input.prebuiltBlocking ?? [],
      openAiRequestCount: 0,
    };
  }

  const bilingual = generateWorkbookLineTranslation({
    passages: input.passages,
    excludeProjectIds: input.excludeProjectIds,
  });

  return {
    sections: mapLineTranslationToWordOrderWriting(
      bilingual.sections,
      input.workbookId
    ),
    skipped: bilingual.skipped,
    blocking: bilingual.blocking,
    openAiRequestCount: 0,
  };
}

/** Problem sheet must not show original English in normal order. */
export function problemSheetLeaksOriginalEnglish(
  section: WorkbookWordOrderWritingSection
): boolean {
  for (const it of section.items) {
    const en = it.originalEnglish.trim();
    if (en.length < 8) continue;
    // Korean prompt only + shuffled surfaces — never concatenate original order
    if (it.korean.includes(en)) return true;
    const bank = it.shuffledTokens.map((t) => t.surface).join(" ");
    if (bank === en) return true;
    const bankSlash = it.shuffledTokens.map((t) => t.surface).join(" / ");
    if (bankSlash.includes(en)) return true;
  }
  return false;
}
