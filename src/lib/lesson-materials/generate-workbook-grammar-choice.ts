import { callGrammarChoiceGenerator } from "@/lib/lesson-materials/grammar-choice-v5-generate";
import { callGrammarChoiceReviewer } from "@/lib/lesson-materials/grammar-choice-v5-review";
import { validateGeneratedGrammarCandidates } from "@/lib/lesson-materials/grammar-choice-v5-validate";
import {
  acceptCodeValidatedCandidates,
  pairReviewsWithCandidates,
  selectFinalReviewedCandidates,
  toGrammarChoiceCandidate,
} from "@/lib/lesson-materials/grammar-choice-v5-select";
import {
  buildAnalysisHints,
  formatSentencesForGrammarChoice,
  getGrammarChoiceFinalTargetRange,
  hashAnalysisHints,
} from "@/lib/lesson-materials/grammar-choice-v5-hints";
import type { SentenceGrammarSurvey } from "@/lib/lesson-materials/grammar-choice-v5-types";
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
  resolveGrammarGeneratorReasoningEffort,
  resolveGrammarReviewerModel,
  resolveGrammarReviewerReasoningEffort,
} from "@/lib/lesson-materials/grammar-choice-model";

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
  /**
   * true면 저장된 어법 선택 캐시를 읽지 않고,
   * 새로 생성·검수한 문항만 final 캐시에 덮어쓴다.
   */
  forceRegenerate?: boolean;
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

  const generatorModelPreferred = resolveGrammarGeneratorModel();
  const reviewerModelPreferred = resolveGrammarReviewerModel();
  const generatorReasoningPreferred = resolveGrammarGeneratorReasoningEffort();
  const reviewerReasoningPreferred = resolveGrammarReviewerReasoningEffort();

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

  const forceRegenerate = input.forceRegenerate === true;

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
    const cacheRow = forceRegenerate
      ? null
      : getCachedGrammarChoiceV5(p.grammarChoiceV5Cache, {
          passageId: p.projectId,
          sourceHash,
          analysisHintHash: hintHash,
          generatorModel: generatorModelPreferred,
          reviewerModel: reviewerModelPreferred,
          generatorReasoningEffort: generatorReasoningPreferred,
          reviewerReasoningEffort: reviewerReasoningPreferred,
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
  let generatorResponseModel = "—";
  let reviewerResponseModel = "—";
  let generatorReasoningEffort: string = generatorReasoningPreferred;
  let reviewerReasoningEffort: string = reviewerReasoningPreferred;
  let generateCalls = 0;
  let reviewCalls = 0;
  const apiCalls: Array<{
    stage: "GENERATOR_INITIAL" | "GENERATOR_TOP_UP" | "REVIEWER";
    requestedModel: string;
    actualResponseModel: string;
    reasoningEffort: string;
  }> = [];
  const generateCallsByPassage = new Map<string, number>();
  const surveysByPassage = new Map<string, SentenceGrammarSurvey[]>();

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
        const desired = Math.min(24, Math.max(6, ctx.sentenceRows.length * 2));
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
      generatorResponseModel = row.gen.responseModel;
      generatorReasoningEffort = row.gen.reasoningEffort;
      apiCalls.push({
        stage: "GENERATOR_INITIAL",
        requestedModel: row.gen.modelUsed,
        actualResponseModel: row.gen.responseModel,
        reasoningEffort: row.gen.reasoningEffort,
      });
      generateCallsByPassage.set(
        row.ctx.p.projectId,
        row.gen.openAiRequestCount
      );
      generatedByPassage.set(row.ctx.p.projectId, row.cands);
      const prevSurveys = surveysByPassage.get(row.ctx.p.projectId) ?? [];
      const nextSurveys =
        row.gen.surveysByPassageId.get(row.ctx.p.projectId) ?? [];
      surveysByPassage.set(row.ctx.p.projectId, [...prevSurveys, ...nextSurveys]);
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
  const reviewsById = new Map<
    string,
    Awaited<ReturnType<typeof callGrammarChoiceReviewer>>["reviews"][number]
  >();

  const reviewChunkSize = 10;
  const reviewChunks: Array<typeof allValidated> = [];
  for (let i = 0; i < allValidated.length; i += reviewChunkSize) {
    reviewChunks.push(allValidated.slice(i, i + reviewChunkSize));
  }
  if (reviewChunks.length > 0) {
    const reviewed = await Promise.all(
      reviewChunks.map((chunk) => callGrammarChoiceReviewer({ candidates: chunk }))
    );
    for (const rev of reviewed) {
      reviewCalls += rev.openAiRequestCount;
      reviewerModelUsed = rev.modelUsed;
      reviewerResponseModel = rev.responseModel;
      reviewerReasoningEffort = rev.reasoningEffort;
      apiCalls.push({
        stage: "REVIEWER",
        requestedModel: rev.modelUsed,
        actualResponseModel: rev.responseModel,
        reasoningEffort: rev.reasoningEffort,
      });
      for (const r of rev.reviews) reviewsById.set(r.candidateId, r);
    }
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
        generatorResponseModel:
          ctx.cacheRow.diagnostics?.generatorActualResponseModel ??
          ctx.cacheRow.diagnostics?.generatorResponseModel ??
          ctx.cacheRow.generatorModel,
        reviewerResponseModel:
          ctx.cacheRow.diagnostics?.reviewerActualResponseModel ??
          ctx.cacheRow.diagnostics?.reviewerResponseModel ??
          ctx.cacheRow.reviewerModel,
        generatorActualResponseModel:
          ctx.cacheRow.diagnostics?.generatorActualResponseModel ??
          ctx.cacheRow.diagnostics?.generatorResponseModel ??
          ctx.cacheRow.generatorModel,
        reviewerActualResponseModel:
          ctx.cacheRow.diagnostics?.reviewerActualResponseModel ??
          ctx.cacheRow.diagnostics?.reviewerResponseModel ??
          ctx.cacheRow.reviewerModel,
        generatorReasoningEffort:
          ctx.cacheRow.generatorReasoningEffort ??
          ctx.cacheRow.diagnostics?.generatorReasoningEffort ??
          generatorReasoningPreferred,
        reviewerReasoningEffort:
          ctx.cacheRow.reviewerReasoningEffort ??
          ctx.cacheRow.diagnostics?.reviewerReasoningEffort ??
          reviewerReasoningPreferred,
        reasoningEffort:
          ctx.cacheRow.diagnostics?.reviewerReasoningEffort ??
          ctx.cacheRow.reviewerReasoningEffort ??
          reviewerReasoningPreferred,
        openAICallCount: 0,
        localFallbackUsed: false,
        generatorVersion: ctx.cacheRow.generatorVersion,
        reviewerVersion: ctx.cacheRow.reviewerVersion,
        apiCalls: [],
        forceRegenerate: false,
        oldQuestionReuseCount: 0,
        generatorActualModel:
          ctx.cacheRow.diagnostics?.generatorActualModel ??
          ctx.cacheRow.diagnostics?.generatorActualResponseModel ??
          ctx.cacheRow.generatorModel,
        reviewerActualModel:
          ctx.cacheRow.diagnostics?.reviewerActualModel ??
          ctx.cacheRow.diagnostics?.reviewerResponseModel ??
          ctx.cacheRow.reviewerModel,
        newQuestionCount: 0,
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

      let { accepted, rejectedReviews } = pairReviewsWithCandidates(
        pend.validated,
        reviews
      );
      if (accepted.length === 0 && pend.validated.length > 0) {
        const covered = reviews.filter((r) =>
          pend.validated.some((v) => v.candidateId === r.candidateId)
        );
        const reviewFailed =
          covered.length < Math.ceil(pend.validated.length * 0.5);
        const fallback = acceptCodeValidatedCandidates(
          pend.validated,
          reviewFailed ? [] : reviews
        );
        accepted = fallback;
        rejectedReviews = reviewFailed ? [] : rejectedReviews;
      }
      const sentenceWordCounts = new Map(
        ctx.sentenceRows.map((s) => [s.id, countEnglishWords(s.english)] as const)
      );
      const selected = selectFinalReviewedCandidates(
        accepted,
        Math.max(accepted.length, 1),
        sentenceWordCounts
      );
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

      const surveys = surveysByPassage.get(ctx.p.projectId) ?? [];
      const surveyPointCount = surveys.reduce(
        (n, s) => n + s.grammarPoints.length,
        0
      );
      const generatedPoints = new Map<string, Set<string>>();
      for (const c of generatedByPassage.get(ctx.p.projectId) ?? []) {
        const key = c.sentenceId;
        const set = generatedPoints.get(key) ?? new Set<string>();
        set.add(c.correctText.trim().toLowerCase());
        generatedPoints.set(key, set);
      }
      const discoveredGrammarPointCount =
        surveyPointCount ||
        [...generatedPoints.values()].reduce((n, set) => n + set.size, 0);
      const difficultyMix = { BASIC: 0, CORE: 0, ADVANCED: 0 };
      for (const row of selected) {
        const level =
          row.validated.difficultyLevel ??
          (row.difficultyScore <= 2
            ? "BASIC"
            : row.difficultyScore >= 4
              ? "ADVANCED"
              : "CORE");
        difficultyMix[level] += 1;
      }
      const rejectReasonCounts: Record<string, number> = {};
      for (const r of rejectedReviews) {
        const reasons = r.rejectionReasons.length ? r.rejectionReasons : ["OTHER"];
        for (const reason of reasons) {
          rejectReasonCounts[reason] = (rejectReasonCounts[reason] ?? 0) + 1;
        }
      }
      for (const r of pend.codeRejected) {
        rejectReasonCounts[r.reason] = (rejectReasonCounts[r.reason] ?? 0) + 1;
      }
      const underTargetReason: string | null = null;

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
        generatorResponseModel,
        reviewerResponseModel,
        generatorActualResponseModel: generatorResponseModel,
        reviewerActualResponseModel: reviewerResponseModel,
        generatorReasoningEffort,
        reviewerReasoningEffort,
        reasoningEffort: reviewerReasoningEffort,
        openAICallCount: generateCalls + reviewCalls,
        localFallbackUsed: false,
        generatorVersion: GRAMMAR_CHOICE_GENERATOR_VERSION,
        reviewerVersion: GRAMMAR_CHOICE_REVIEWER_VERSION,
        apiCalls,
        forceRegenerate,
        oldQuestionReuseCount: 0,
        generatorActualModel: generatorResponseModel,
        reviewerActualModel: reviewerResponseModel,
        newQuestionCount: finalCandidates.length,
        desiredQuestionCount: discoveredGrammarPointCount,
        discoveredGrammarPointCount,
        initialCandidateCount: pend.generatedCount,
        initialApprovedCount: accepted.length,
        topUpRoundCount: 0,
        topUpCandidateCount: 0,
        topUpApprovedCount: 0,
        finalQuestionCount: finalCandidates.length,
        renderedQuestionCount: finalCandidates.length,
        countMismatch: false,
        difficultyMix,
        sentencePointCounts: [...generatedPoints.entries()].map(
          ([sentenceId, set]) => ({ sentenceId, count: set.size })
        ),
        rejectReasonCounts,
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
          cache: upsertGrammarChoiceV5Cache(
            forceRegenerate ? null : ctx.p.grammarChoiceV5Cache,
            {
            passageId: ctx.p.projectId,
            sourceHash: ctx.sourceHash,
            analysisHintHash: ctx.hintHash,
            generatorModel: generatorModelUsed,
            reviewerModel: reviewerModelUsed,
            generatorReasoningEffort,
            reviewerReasoningEffort,
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
        reason: "문항을 만들지 못했습니다. 다시 시도해 주세요.",
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
    if (diagnostics) {
      diagnostics.passageRestored = passageRestored;
      diagnostics.renderedQuestionCount = items.length;
      diagnostics.finalQuestionCount = finalCandidates.length;
      diagnostics.newQuestionCount = items.length;
      diagnostics.finalCount = items.length;
      diagnostics.countMismatch = items.length !== finalCandidates.length;
    }

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
