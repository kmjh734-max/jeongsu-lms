import {
  assessAnalysisCompleteness,
} from "@/lib/lesson-materials/grammar-blueprint-completeness";
import { callGrammarBlueprintOpenAI } from "@/lib/lesson-materials/grammar-blueprint-ai";
import {
  blueprintSentencesFromFormalReport,
  emptyBlueprintSentence,
  hashBlueprintPoints,
} from "@/lib/lesson-materials/grammar-blueprint-from-analysis";
import { mergeBlueprintSentences } from "@/lib/lesson-materials/grammar-blueprint-merge";
import {
  buildPassageSentenceSpans,
  hashSourcePassage,
} from "@/lib/lesson-materials/grammar-blueprint-sentences";
import {
  getCachedGrammarBlueprint,
  upsertGrammarBlueprintCache,
  type StoredGrammarBlueprintCache,
} from "@/lib/lesson-materials/grammar-blueprint-cache";
import { GRAMMAR_BLUEPRINT_VERSION } from "@/lib/lesson-materials/grammar-choice-constants";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type {
  GrammarBlueprint,
  GrammarBlueprintSentence,
  PassageSentenceSpan,
} from "@/lib/lesson-materials/grammar-blueprint-types";

export async function ensureGrammarBlueprint(input: {
  passageId: string;
  sentences: Array<{ id: string; english: string }>;
  analysisReport?: AnalysisReportData | null;
  blueprintCache?: StoredGrammarBlueprintCache | null;
}): Promise<{
  blueprint: GrammarBlueprint;
  spans: PassageSentenceSpan[];
  sourcePassage: string;
  cacheHit: boolean;
  openAiRequestCount: number;
  modelUsed: string | null;
  cacheToSave: StoredGrammarBlueprintCache | null;
}> {
  const { sourcePassage, spans } = buildPassageSentenceSpans(input.sentences);
  const sourceHash = hashSourcePassage(sourcePassage);

  const cached = getCachedGrammarBlueprint(
    input.blueprintCache,
    input.passageId,
    sourceHash
  );
  if (cached) {
    return {
      blueprint: cached,
      spans,
      sourcePassage,
      cacheHit: true,
      openAiRequestCount: 0,
      modelUsed: cached.modelUsed,
      cacheToSave: null,
    };
  }

  const { completeness, coveredSentenceIds, missingSentenceIds } =
    assessAnalysisCompleteness({
      spans,
      report: input.analysisReport,
    });

  let sentences: GrammarBlueprintSentence[] = spans.map((s) =>
    emptyBlueprintSentence(s)
  );
  let analysisSource: GrammarBlueprint["analysisSource"] =
    "LIGHTWEIGHT_AI_ANALYSIS";
  let openAiRequestCount = 0;
  let modelUsed: string | null = null;

  if (completeness === "COMPLETE" && input.analysisReport) {
    sentences = blueprintSentencesFromFormalReport({
      spans,
      report: input.analysisReport,
      coveredSentenceIds,
    });
    analysisSource = "FULL_ANALYSIS";
  } else if (completeness === "PARTIAL" && input.analysisReport) {
    const formal = blueprintSentencesFromFormalReport({
      spans,
      report: input.analysisReport,
      coveredSentenceIds,
    });
    // AI only for missing sentences
    const missingSpans = spans.filter((s) =>
      missingSentenceIds.includes(s.sentenceId)
    );
    if (missingSpans.length > 0) {
      try {
        const ai = await callGrammarBlueprintOpenAI({
          passages: [
            {
              passageId: input.passageId,
              sourceText: sourcePassage,
              sentences: missingSpans,
            },
          ],
        });
        openAiRequestCount += ai.openAiRequestCount;
        modelUsed = ai.modelUsed;
        const aiSentences =
          ai.byPassageId.get(input.passageId) ??
          missingSpans.map((s) => emptyBlueprintSentence(s));
        // Pad AI results into full formal-length by merging
        const aiFull = formal.map((fs) => {
          const hit = aiSentences.find((a) => a.sentenceId === fs.sentenceId);
          return hit && fs.grammarPoints.length === 0 ? hit : fs;
        });
        sentences = mergeBlueprintSentences(formal, aiFull);
      } catch (err) {
        console.warn(
          "[grammar-blueprint] partial AI failed",
          err instanceof Error ? err.message : err
        );
        sentences = formal;
      }
    } else {
      sentences = formal;
    }
    analysisSource = "PARTIAL_ANALYSIS_WITH_AI_SUPPLEMENT";
  } else {
    // NONE — full lightweight AI analysis
    try {
      const ai = await callGrammarBlueprintOpenAI({
        passages: [
          {
            passageId: input.passageId,
            sourceText: sourcePassage,
            sentences: spans,
          },
        ],
      });
      openAiRequestCount += ai.openAiRequestCount;
      modelUsed = ai.modelUsed;
      sentences =
        ai.byPassageId.get(input.passageId) ??
        spans.map((s) => emptyBlueprintSentence(s));
      // Verify all sentences present
      if (sentences.length !== spans.length) {
        throw new Error("Blueprint 문장 수 불일치");
      }
      analysisSource = "LIGHTWEIGHT_AI_ANALYSIS";
    } catch (err) {
      console.warn(
        "[grammar-blueprint] full AI failed; empty scaffold",
        err instanceof Error ? err.message : err
      );
      sentences = spans.map((s) => emptyBlueprintSentence(s));
      analysisSource = "LIGHTWEIGHT_AI_ANALYSIS";
    }
  }

  const analyzedSentenceCount = sentences.filter(
    (s) =>
      s.grammarPoints.length > 0 ||
      s.noTestablePointReason !== "NONE" ||
      s.structureSummary.length > 0 ||
      completeness === "COMPLETE"
  ).length;

  // For COMPLETE formal path, count all as analyzed
  const finalAnalyzed =
    completeness === "COMPLETE" ? sentences.length : analyzedSentenceCount;

  const blueprint: GrammarBlueprint = {
    passageId: input.passageId,
    sourceHash,
    analysisSource,
    completeness,
    sentenceCount: sentences.length,
    analyzedSentenceCount: finalAnalyzed,
    sentences,
    fullAnalysisHash: hashBlueprintPoints(sentences),
    grammarBlueprintVersion: GRAMMAR_BLUEPRINT_VERSION,
    modelUsed,
    createdAt: new Date().toISOString(),
  };

  // Only cache when every sentence is accounted for
  const cacheToSave =
    blueprint.analyzedSentenceCount === blueprint.sentenceCount
      ? upsertGrammarBlueprintCache(input.blueprintCache, blueprint)
      : null;

  return {
    blueprint,
    spans,
    sourcePassage,
    cacheHit: false,
    openAiRequestCount,
    modelUsed,
    cacheToSave,
  };
}
