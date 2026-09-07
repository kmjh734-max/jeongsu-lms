import { FULL_SENTENCE_WRITING_ALGORITHM_VERSION } from "@/lib/lesson-materials/full-en-writing-constants";
import {
  generateWorkbookLineTranslation,
  type LineTranslationSkip,
  type WorkbookLineTranslationSection,
} from "@/lib/lesson-materials/generate-workbook-line-translation";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";
import { countEnglishWords } from "@/lib/lesson-materials/workbook-types";

export type FullEnWritingItem = {
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
  items: FullEnWritingItem[];
  algorithmVersion: string;
};

/** More lines than one-line KO — student writes full English by hand. */
export function getFullSentenceWritingLineCount(english: string): number {
  const wordCount = countEnglishWords(english);
  if (wordCount <= 12) return 2;
  if (wordCount <= 25) return 3;
  if (wordCount <= 40) return 4;
  return 5;
}

/** Map shared bilingual sections → full-EN writing (different answer-line density). */
export function mapLineTranslationToFullEnWriting(
  sections: WorkbookLineTranslationSection[]
): WorkbookFullEnWritingSection[] {
  return sections.map((s) => ({
    projectId: s.projectId,
    title: s.title,
    source: s.source,
    algorithmVersion: FULL_SENTENCE_WRITING_ALGORITHM_VERSION,
    items: s.items.map((it) => ({
      sentenceId: it.sentenceId,
      orderIndex: it.orderIndex,
      english: it.english,
      englishDisplay: it.englishDisplay,
      korean: it.korean,
      sourceHash: it.sourceHash,
      answerLineCount: getFullSentenceWritingLineCount(it.english),
    })),
  }));
}

/**
 * Build full-sentence writing workbook data by reusing one-line-KO
 * bilingual matching (no OpenAI).
 */
export function generateWorkbookFullEnWriting(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string; korean?: string | null }>;
    sentenceTranslations: StoredSentenceTranslation[];
  }>;
  excludeProjectIds?: string[];
  /** When provided, skip re-running bilingual generation */
  prebuiltLineSections?: WorkbookLineTranslationSection[];
  prebuiltSkipped?: LineTranslationSkip[];
  prebuiltBlocking?: LineTranslationSkip[];
}): {
  sections: WorkbookFullEnWritingSection[];
  skipped: LineTranslationSkip[];
  blocking: LineTranslationSkip[];
  openAiRequestCount: 0;
} {
  if (input.prebuiltLineSections || input.prebuiltBlocking) {
    return {
      sections: mapLineTranslationToFullEnWriting(
        input.prebuiltLineSections ?? []
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
    sections: mapLineTranslationToFullEnWriting(bilingual.sections),
    skipped: bilingual.skipped,
    blocking: bilingual.blocking,
    openAiRequestCount: 0,
  };
}

/** Problem-sheet text must not contain full English answers. */
export function problemSheetLeaksEnglishAnswer(
  section: WorkbookFullEnWritingSection
): boolean {
  const blob = section.items.map((it) => it.korean).join("\n");
  for (const it of section.items) {
    const en = it.englishDisplay.trim();
    if (en.length < 12) continue;
    if (blob.includes(en)) return true;
  }
  return false;
}
