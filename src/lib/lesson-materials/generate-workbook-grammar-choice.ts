import { callGrammarChoiceGenerator } from "@/lib/lesson-materials/grammar-choice-v5-generate";
import { callGrammarChoiceReviewer } from "@/lib/lesson-materials/grammar-choice-v5-review";
import { validateGeneratedGrammarCandidates } from "@/lib/lesson-materials/grammar-choice-v5-validate";
import {
  pairReviewsWithCandidates,
  selectFinalReviewedCandidates,
  toGrammarChoiceCandidate,
} from "@/lib/lesson-materials/grammar-choice-v5-select";
import {
  buildAnalysisHints,
  desiredCandidateCount,
  formatSentencesForGrammarChoice,
  getGrammarChoiceFinalTargetRange,
  hashAnalysisHints,
} from "@/lib/lesson-materials/grammar-choice-v5-hints";
import {
  getCachedGrammarChoiceV5,
  hashEnglishLines,
  upsertGrammarChoiceV5Cache,
  type StoredGrammarChoiceV5Cache,
} from "@/lib/lesson-materials/grammar-choice-v5-cache";
import {
  GRAMMAR_CHOICE_GENERATOR_VERSION,
  GRAMMAR_CHOICE_PROMPT_VERSION,
  GRAMMAR_CHOICE_REVIEWER_VERSION,
} from "@/lib/lesson-materials/grammar-choice-constants";
import {
  buildGrammarChoiceItems,
  buildPassageSegmentsFromSource,
} from "@/lib/lesson-materials/grammar-choice-display";
import {
  countEnglishWords,
  joinWorkbookPassageLines,
  type GrammarChoiceCandidate,
  type WorkbookGenerationTiming,
  type WorkbookGrammarChoiceDiagnostics,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
} from "@/lib/lesson-materials/workbook-types";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import {
  resolveGrammarGeneratorModel,
} from "@/lib/lesson-materials/grammar-choice-v5-generate";
import { resolveGrammarReviewerModel } from "@/lib/lesson-materials/grammar-choice-v5-review";

export async function generateWorkbookGrammarChoice(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string }>;
    analysisReport?: AnalysisReportData | null;
    /** v5 final-item cache (not blueprint / not legacy choice cache) */
    grammarChoiceV5Cache?: StoredGrammarChoiceV5Cache | null;
  }>;
}): Promise<{
  sections: WorkbookGrammarChoiceSection[];
  skipped: WorkbookGrammarChoiceSkip[];
  cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceV5Cache;
  }>;
  timing: WorkbookGenerationTiming;
}> {
  const t0 = Date.now();
  const sections: WorkbookGrammarChoiceSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  const cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceV5Cache;
  }> = [];

  const generatorModelPreferred = resolveGrammarGeneratorModel()[0]!;
  const reviewerModelPreferred = resolveGrammarReviewerModel()[0]!;

  type Ctx = {
    p: (typeof input.passages)[number];
    sentenceRows: Array<{ id: string; english: string }>;
    sourcePassage: string;
    sourceHash: string;
    hints: ReturnType<typeof buildAnalysisHints>;
    hintHash: string;
    range: { min: number; max: number };
    cacheRow: ReturnType<typeof getCachedGrammarChoiceV5>;
  };

  const contexts: Ctx[] = input.passages.map((p) => {
    const sentenceRows = formatSentencesForGrammarChoice(p.sentences);
    const sourcePassage = joinWorkbookPassageLines(
      sentenceRows.map((s) => s.english)
    );
    const sourceHash = hashEnglishLines(sentenceRows.map((s) => s.english));
    const hints = buildAnalysisHints(p.analysisReport, sentenceRows);
    const hintHash = hashAnalysisHints(hints);
    const range = getGrammarChoiceFinalTargetRange(
      countEnglishWords(sourcePassage)
    );
    const cacheRow = getCachedGrammarChoiceV5(p.grammarChoiceV5Cache, {
      passageId: p.projectId,
      sourceHash,
      analysisHintHash: hintHash,
      generatorModel: generatorModelPreferred,
      reviewerModel: reviewerModelPreferred,
    });
    return {
      p,
      sentenceRows,
      sourcePassage,
      sourceHash,
      hints,
      hintHash,
      range,
      cacheRow,
    };
  });

  const needAi = contexts.filter((c) => !c.cacheRow);
  let generatorModelUsed = generatorModelPreferred;
  let reviewerModelUsed = reviewerModelPreferred;
  let generateCalls = 0;
  let reviewCalls = 0;
  const generateCallsByPassage = new Map<string, number>();

  const generatedByPassage = new Map<
    string,
    Awaited<ReturnType<typeof callGrammarChoiceGenerator>>["byPassageId"] extends Map<
      string,
      infer V
    >
      ? V
      : never
  >();

  if (needAi.length > 0) {
    // Parallel per-passage generate (wall-clock ≈ slowest passage, not sum).
    // One shared review batch follows. Retry only under-filled passages.
    const firstPass = await Promise.all(
      needAi.map(async (ctx) => {
        const desired = desiredCandidateCount(ctx.range.max);
        const passagePayload = {
          passageId: ctx.p.projectId,
          title: ctx.p.title,
          sourceText: ctx.sourcePassage,
          sentences: ctx.sentenceRows.map((s, i) => ({
            sentenceId: s.id,
            sentenceIndex: i,
            originalText: s.english,
          })),
          analysisHints: ctx.hints,
          desiredCandidateCount: desired,
        };
        const gen = await callGrammarChoiceGenerator({
          passages: [passagePayload],
        });
        return {
          ctx,
          desired,
          passagePayload,
          gen,
          cands: gen.byPassageId.get(ctx.p.projectId) ?? [],
        };
      })
    );

    for (const row of firstPass) {
      generateCalls += row.gen.openAiRequestCount;
      generatorModelUsed = row.gen.modelUsed;
      generateCallsByPassage.set(
        row.ctx.p.projectId,
        row.gen.openAiRequestCount
      );
      generatedByPassage.set(row.ctx.p.projectId, row.cands);
    }

    const needRetry = firstPass.filter(
      (row) => row.cands.length < Math.ceil(row.desired * 0.75)
    );
    if (needRetry.length > 0) {
      const retries = await Promise.all(
        needRetry.map(async (row) => {
          const gen = await callGrammarChoiceGenerator({
            passages: [row.passagePayload],
          });
          return { row, gen };
        })
      );
      for (const { row, gen } of retries) {
        generateCalls += gen.openAiRequestCount;
        generatorModelUsed = gen.modelUsed;
        generateCallsByPassage.set(
          row.ctx.p.projectId,
          (generateCallsByPassage.get(row.ctx.p.projectId) ?? 0) +
            gen.openAiRequestCount
        );
        const retry = gen.byPassageId.get(row.ctx.p.projectId) ?? [];
        const byId = new Map<string, (typeof row.cands)[number]>();
        for (const c of [...row.cands, ...retry]) {
          byId.set(c.candidateId, c);
        }
        generatedByPassage.set(row.ctx.p.projectId, [...byId.values()]);
      }
    }
  }

  // Validate all needAi passages, then one review batch
  type PendingReview = {
    ctx: Ctx;
    validated: ReturnType<typeof validateGeneratedGrammarCandidates>["accepted"];
    codeRejected: ReturnType<typeof validateGeneratedGrammarCandidates>["rejected"];
    codeStats: ReturnType<typeof validateGeneratedGrammarCandidates>["stats"];
    generatedCount: number;
  };
  const pending: PendingReview[] = [];

  for (const ctx of needAi) {
    const generated = generatedByPassage.get(ctx.p.projectId) ?? [];
    const sentenceMap = new Map(
      ctx.sentenceRows.map((s) => [s.id, s.english] as const)
    );
    const { accepted, rejected, stats } = validateGeneratedGrammarCandidates(
      generated,
      sentenceMap
    );
    pending.push({
      ctx,
      validated: accepted,
      codeRejected: rejected,
      codeStats: stats,
      generatedCount: generated.length,
    });
  }

  const allValidated = pending.flatMap((p) => p.validated);
  let reviewsById = new Map<
    string,
    Awaited<ReturnType<typeof callGrammarChoiceReviewer>>["reviews"][number]
  >();

  if (allValidated.length > 0) {
    const rev = await callGrammarChoiceReviewer({ candidates: allValidated });
    reviewCalls += rev.openAiRequestCount;
    reviewerModelUsed = rev.modelUsed;
    reviewsById = new Map(rev.reviews.map((r) => [r.candidateId, r]));
  }

  for (const ctx of contexts) {
    let finalCandidates: GrammarChoiceCandidate[] = [];
    let diagnostics: WorkbookGrammarChoiceDiagnostics | null = null;
    let cacheHit = false;

    if (ctx.cacheRow) {
      finalCandidates = ctx.cacheRow.candidates;
      cacheHit = true;
      diagnostics = {
        sentenceCount: ctx.sentenceRows.length,
        analysisHintCount: ctx.hints.length,
        generatedCandidateCount: ctx.cacheRow.diagnostics?.generatedCandidateCount ?? finalCandidates.length,
        codeValidatedCount: ctx.cacheRow.diagnostics?.codeValidatedCount ?? finalCandidates.length,
        originalMismatchCount: 0,
        rangeErrorCount: 0,
        overlapDuplicateCount: 0,
        reviewSubmittedCount: finalCandidates.length,
        reviewAcceptedCount: finalCandidates.length,
        bothPossibleRejectCount: 0,
        lexicalRejectCount: 0,
        trivialRejectCount: 0,
        finalCount: finalCandidates.length,
        grammarCategoryCount: new Set(
          finalCandidates.map((c) => c.grammarCategoryId)
        ).size,
        averageQualityScore:
          ctx.cacheRow.diagnostics?.averageQualityScore ?? 0,
        passageRestored: true,
        cacheHit: true,
        generatorModel: ctx.cacheRow.generatorModel,
        reviewerModel: ctx.cacheRow.reviewerModel,
        generateApiCalls: 0,
        reviewApiCalls: 0,
        underTargetReason: null,
        reviewRejectSamples: [],
        codeRejectSamples: [],
      };
    } else {
      const pend = pending.find((x) => x.ctx.p.projectId === ctx.p.projectId)!;
      const reviews = pend.validated
        .map((v) => reviewsById.get(v.candidateId))
        .filter(Boolean) as NonNullable<
        ReturnType<typeof reviewsById.get>
      >[];

      const { accepted, rejectedReviews } = pairReviewsWithCandidates(
        pend.validated,
        reviews
      );
      const selected = selectFinalReviewedCandidates(accepted, ctx.range.max);
      finalCandidates = selected.map(toGrammarChoiceCandidate);

      const bothPossible = rejectedReviews.filter((r) =>
        r.rejectionReasons.includes("BOTH_OPTIONS_POSSIBLE")
      ).length;
      const lexical = rejectedReviews.filter((r) =>
        r.rejectionReasons.includes("LEXICAL_OR_COLLOCATION")
      ).length;
      const trivial = rejectedReviews.filter(
        (r) =>
          r.rejectionReasons.includes("TOO_TRIVIAL") ||
          r.rejectionReasons.includes("IMPLAUSIBLE_DISTRACTOR")
      ).length;

      const avgQuality =
        selected.length === 0
          ? 0
          : selected.reduce((s, x) => s + x.qualityScore, 0) / selected.length;

      let underTargetReason: string | null = null;
      if (finalCandidates.length < ctx.range.min) {
        underTargetReason = `검수 통과 문항 ${finalCandidates.length}개로 목표 하한 ${ctx.range.min}개에 미달(저급 문항으로 채우지 않음)`;
      }

      diagnostics = {
        sentenceCount: ctx.sentenceRows.length,
        analysisHintCount: ctx.hints.length,
        generatedCandidateCount: pend.generatedCount,
        codeValidatedCount: pend.validated.length,
        originalMismatchCount: pend.codeStats.originalMismatch,
        rangeErrorCount: pend.codeStats.rangeError,
        overlapDuplicateCount: pend.codeStats.overlapOrDuplicate,
        reviewSubmittedCount: pend.validated.length,
        reviewAcceptedCount: accepted.length,
        bothPossibleRejectCount: bothPossible,
        lexicalRejectCount: lexical,
        trivialRejectCount: trivial + pend.codeStats.lowQuality,
        finalCount: finalCandidates.length,
        grammarCategoryCount: new Set(
          finalCandidates.map((c) => c.grammarCategoryId)
        ).size,
        averageQualityScore: Math.round(avgQuality * 10) / 10,
        passageRestored: false, // set after restore check
        cacheHit: false,
        generatorModel: generatorModelUsed,
        reviewerModel: reviewerModelUsed,
        generateApiCalls: generateCallsByPassage.get(ctx.p.projectId) ?? 0,
        reviewApiCalls: reviewCalls > 0 ? 1 : 0,
        underTargetReason,
        reviewRejectSamples: rejectedReviews.slice(0, 8).map((r) => ({
          candidateId: r.candidateId,
          reasons: r.rejectionReasons,
        })),
        codeRejectSamples: pend.codeRejected.slice(0, 8).map((r) => ({
          candidateId: r.candidate.candidateId,
          reason: r.reason,
          pair: `${r.candidate.correctText} / ${r.candidate.incorrectText}`,
        })),
      };

      if (finalCandidates.length > 0) {
        cachesToSave.push({
          projectId: ctx.p.projectId,
          cache: upsertGrammarChoiceV5Cache(ctx.p.grammarChoiceV5Cache, {
            passageId: ctx.p.projectId,
            sourceHash: ctx.sourceHash,
            analysisHintHash: ctx.hintHash,
            generatorModel: generatorModelUsed,
            reviewerModel: reviewerModelUsed,
            generatorVersion: GRAMMAR_CHOICE_GENERATOR_VERSION,
            reviewerVersion: GRAMMAR_CHOICE_REVIEWER_VERSION,
            candidates: finalCandidates,
            diagnostics,
            createdAt: new Date().toISOString(),
          }),
        });
      }
    }

    if (finalCandidates.length === 0) {
      skipped.push({
        projectId: ctx.p.projectId,
        title: ctx.p.title,
        reason:
          diagnostics?.underTargetReason ||
          "검수를 통과한 어법 선택 문항이 없습니다. 잠시 후 다시 시도해 주세요.",
      });
      continue;
    }

    const orderIndex = new Map(ctx.sentenceRows.map((s, i) => [s.id, i]));
    finalCandidates.sort((a, b) => {
      const oa = orderIndex.get(a.sentenceId) ?? 0;
      const ob = orderIndex.get(b.sentenceId) ?? 0;
      if (oa !== ob) return oa - ob;
      return a.startTokenIndex - b.startTokenIndex;
    });

    const seedKey = `${ctx.p.projectId}|${ctx.sourceHash}|${GRAMMAR_CHOICE_PROMPT_VERSION}|${ctx.hintHash}`;
    const items = buildGrammarChoiceItems(
      finalCandidates,
      seedKey,
      ctx.sourcePassage,
      ctx.sentenceRows.map((s) => s.id)
    );
    if (!items) {
      skipped.push({
        projectId: ctx.p.projectId,
        title: ctx.p.title,
        reason: "원문 문자 위치 검증에 실패했습니다.",
      });
      continue;
    }

    for (let i = 0; i < items.length; i++) {
      const src = finalCandidates[i]!;
      items[i] = {
        ...items[i]!,
        bookTerm: src.bookTerm,
        grammarCategoryName: src.grammarCategoryName,
        explanationKo: src.explanationKo,
        incorrectReasonKo: src.incorrectReasonKo,
        structureSummary: src.structureSummary || "",
        analysisOriginLabel: undefined,
      };
    }

    const segments = buildPassageSegmentsFromSource(ctx.sourcePassage, items);
    if (!segments) {
      skipped.push({
        projectId: ctx.p.projectId,
        title: ctx.p.title,
        reason: "원문 슬라이스 렌더링 검증에 실패했습니다.",
      });
      continue;
    }

    let rebuilt = "";
    for (const seg of segments) {
      if (seg.type === "text") rebuilt += seg.text;
      else rebuilt += items.find((x) => x.number === seg.number)!.correctText;
    }
    const passageRestored = rebuilt === ctx.sourcePassage;
    if (diagnostics) diagnostics.passageRestored = passageRestored;

    console.info("[workbook-grammar-choice-v5]", {
      title: ctx.p.title,
      cacheHit,
      diagnostics,
    });

    sections.push({
      projectId: ctx.p.projectId,
      title: ctx.p.title,
      source: ctx.p.source,
      sourcePassage: ctx.sourcePassage,
      segments,
      items,
      algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
      diagnostics: diagnostics!,
    });
  }

  return {
    sections,
    skipped,
    cachesToSave,
    timing: {
      dataLoadMs: 0,
      translationLookupMs: 0,
      blankSelectionMs: Date.now() - t0,
      pdfRenderMs: 0,
      totalMs: Date.now() - t0,
      openAiRequestCount: generateCalls + reviewCalls,
    },
  };
}
