import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { analyzeAndGeneratePassage } from "@/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { auditRiskyCandidates } from "@/lib/lesson-materials/grammar-choice-v2/ambiguity-auditor";
import { planReviewerSubmission } from "@/lib/lesson-materials/grammar-choice-v2/review-policy";
import {
  buildV2CacheKey,
  getCachedGrammarChoiceV2,
  getCachedGrammarChoiceV2Analysis,
  upsertGrammarChoiceV2Analysis,
  upsertGrammarChoiceV2Cache,
  type StoredGrammarChoiceV2Cache,
} from "@/lib/lesson-materials/grammar-choice-v2/cache";
import { ontologyCounts } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { scanLocalMandatory } from "@/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import { joinSourceLines, segmentPassage } from "@/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import {
  expandAuditItems,
  finalizeV2Passage,
  hashPassage,
  resolveAndFilter,
} from "@/lib/lesson-materials/grammar-choice-v2/pipeline";
import {
  captureMetadata,
  isSnapshotCaptureEnabled,
  snapshotRunDir,
  studentReplayDigest,
  writeCheckpoint,
} from "@/lib/lesson-materials/grammar-choice-v2/snapshot-store";
import {
  GRAMMAR_CHOICE_V2_AUDITOR,
  GRAMMAR_CHOICE_V2_ENGINE,
  type AnalysisHintV2,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import {
  joinWorkbookPassageLines,
  type WorkbookGenerationTiming,
  type WorkbookGrammarChoiceDiagnostics,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
} from "@/lib/lesson-materials/workbook-types";

export const ANALYZER_CONCURRENCY = 4;

export type GrammarChoiceEngineSelection = {
  version: "v1" | "v2";
  requested: string | null;
  unknownValue: string | null;
};

export function stampGrammarChoiceEngineDiagnostics<
  T extends { diagnostics?: WorkbookGrammarChoiceDiagnostics | null },
>(sections: T[], selection: GrammarChoiceEngineSelection): T[] {
  const engineSelectionNote = selection.unknownValue
    ? `unknown GRAMMAR_CHOICE_ENGINE_VERSION=${selection.unknownValue}; using default v2`
    : undefined;
  return sections.map((section) => {
    if (!section.diagnostics) return section;
    return {
      ...section,
      diagnostics: {
        ...section.diagnostics,
        engineVersion: selection.version,
        ...(engineSelectionNote ? { engineSelectionNote } : {}),
      },
    };
  });
}

export function resolveGrammarChoiceEngineVersion(): GrammarChoiceEngineSelection {
  const raw = process.env.GRAMMAR_CHOICE_ENGINE_VERSION?.trim() ?? "";
  if (!raw) {
    return { version: "v2", requested: null, unknownValue: null };
  }
  const lower = raw.toLowerCase();
  if (lower === "v2") {
    return { version: "v2", requested: "v2", unknownValue: null };
  }
  if (lower === "v1") {
    return { version: "v1", requested: "v1", unknownValue: null };
  }
  return { version: "v2", requested: raw, unknownValue: raw };
}

export function resolveV2AnalyzerModel(): string {
  return process.env.OPENAI_GRAMMAR_V2_ANALYZER_MODEL?.trim() || "gpt-5.6-sol";
}

export function resolveV2AnalyzerEffort(): "low" | "medium" | "high" {
  const raw = process.env.OPENAI_GRAMMAR_V2_ANALYZER_REASONING_EFFORT?.trim().toLowerCase();
  if (raw === "low" || raw === "high") return raw;
  return "medium";
}

export function resolveV2AuditorModel(): string {
  return process.env.OPENAI_GRAMMAR_V2_AUDITOR_MODEL?.trim() || "gpt-5.6-sol";
}

export function resolveV2AuditorEffort(): "medium" | "high" {
  return process.env.OPENAI_GRAMMAR_V2_AUDITOR_REASONING_EFFORT?.trim().toLowerCase() ===
    "high"
    ? "high"
    : "medium";
}

function hintsFromReport(report: AnalysisReportData | null | undefined): AnalysisHintV2[] {
  if (!report?.sentences) return [];
  const out: AnalysisHintV2[] = [];
  for (const sentence of report.sentences) {
    for (const point of sentence.grammarPoints ?? []) {
      const target = String(point.example ?? point.detail ?? "").trim();
      if (!target) continue;
      out.push({
        sentenceId: String(sentence.itemId ?? ""),
        targetText: target,
        label: point.title,
      });
    }
  }
  return out;
}

function emptyDiagnostics(input: {
  sentenceCount: number;
  cacheHit: boolean;
  forceRegenerate: boolean;
  analyzerModel: string;
  auditorModel: string;
  analyzerEffort: string;
  auditorEffort: string;
  openAICallCount: number;
  generateApiCalls: number;
  reviewApiCalls: number;
  generatorResponseModel: string;
  reviewerResponseModel: string;
}): WorkbookGrammarChoiceDiagnostics {
  return {
    sentenceCount: input.sentenceCount,
    analysisHintCount: 0,
    generatedCandidateCount: 0,
    codeValidatedCount: 0,
    originalMismatchCount: 0,
    rangeErrorCount: 0,
    overlapDuplicateCount: 0,
    reviewSubmittedCount: 0,
    reviewAcceptedCount: 0,
    bothPossibleRejectCount: 0,
    lexicalRejectCount: 0,
    trivialRejectCount: 0,
    finalCount: 0,
    grammarCategoryCount: 0,
    averageQualityScore: 0,
    passageRestored: false,
    cacheHit: input.cacheHit,
    generatorModel: input.analyzerModel,
    reviewerModel: input.auditorModel,
    generatorResponseModel: input.generatorResponseModel,
    reviewerResponseModel: input.reviewerResponseModel,
    generatorActualResponseModel: input.generatorResponseModel,
    reviewerActualResponseModel: input.reviewerResponseModel,
    generatorReasoningEffort: input.analyzerEffort,
    reviewerReasoningEffort: input.auditorEffort,
    reasoningEffort: input.analyzerEffort,
    openAICallCount: input.openAICallCount,
    localFallbackUsed: false,
    generatorVersion: GRAMMAR_CHOICE_V2_ENGINE,
    engineVersion: "v2",
    reviewerVersion: GRAMMAR_CHOICE_V2_AUDITOR,
    apiCalls: [],
    forceRegenerate: input.forceRegenerate,
    oldQuestionReuseCount: 0,
    generatorActualModel: input.generatorResponseModel,
    reviewerActualModel: input.reviewerResponseModel,
    newQuestionCount: 0,
    generateApiCalls: input.generateApiCalls,
    reviewApiCalls: input.reviewApiCalls,
    underTargetReason: null,
    reviewRejectSamples: [],
    codeRejectSamples: [],
  };
}

export async function generateWorkbookGrammarChoiceV2(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string }>;
    analysisReport?: AnalysisReportData | null;
    grammarChoiceV2Cache?: StoredGrammarChoiceV2Cache | null;
  }>;
  forceRegenerate?: boolean;
}): Promise<{
  sections: WorkbookGrammarChoiceSection[];
  skipped: WorkbookGrammarChoiceSkip[];
  cachesToSave: Array<{ projectId: string; cache: StoredGrammarChoiceV2Cache }>;
  timing: WorkbookGenerationTiming;
  ontology: ReturnType<typeof ontologyCounts>;
  promptChars: number[];
  reports: Array<{
    projectId: string;
    title: string;
    responseModel: string;
    detected: Array<{ sentenceId: string; pointCode: string; sourceSpan: string }>;
    candidates: Array<{ sentenceId: string; pointCode: string; pair: string }>;
    rejected: Array<{ sentenceId: string; pointCode: string; reason: string; pair: string }>;
    missingMandatory: string[];
    ok: boolean;
  }>;
}> {
  const t0 = Date.now();
  const capture = isSnapshotCaptureEnabled();
  const captureDir = capture ? snapshotRunDir() : "";
  if (capture) {
    writeCheckpoint(captureDir, "run.json", {
      ...captureMetadata({
        generatorModel: resolveV2AnalyzerModel(),
        generatorReasoningEffort: resolveV2AnalyzerEffort(),
        reviewerModel: resolveV2AuditorModel(),
        reviewerReasoningEffort: resolveV2AuditorEffort(),
        forceRegenerate: input.forceRegenerate === true,
        cacheHit: false,
        fallback: false,
      }),
      status: "STARTED",
      passageIds: input.passages.map((p) => p.projectId),
    });
  }
  const analyzerModel = resolveV2AnalyzerModel();
  const analyzerEffort = resolveV2AnalyzerEffort();
  const auditorModel = resolveV2AuditorModel();
  const auditorEffort = resolveV2AuditorEffort();
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const sections: WorkbookGrammarChoiceSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  const cachesToSave: Array<{ projectId: string; cache: StoredGrammarChoiceV2Cache }> = [];
  let openAi = 0;
  let generateCalls = 0;
  let reviewCalls = 0;
  const promptChars: number[] = [];
  const reports: Array<{
    projectId: string;
    title: string;
    responseModel: string;
    detected: Array<{ sentenceId: string; pointCode: string; sourceSpan: string }>;
    candidates: Array<{ sentenceId: string; pointCode: string; pair: string }>;
    rejected: Array<{ sentenceId: string; pointCode: string; reason: string; pair: string }>;
    missingMandatory: string[];
    ok: boolean;
  }> = [];
  const pending: Array<{
    projectId: string;
    title: string;
    source: string | null;
    passage: string;
    sentences: ReturnType<typeof segmentPassage>;
    hints: AnalysisHintV2[];
    cache: StoredGrammarChoiceV2Cache | null;
    cacheKey: ReturnType<typeof buildV2CacheKey>;
  }> = [];

  const seenSource = new Set<string>();
  const splitStarted = Date.now();
  for (const p of input.passages) {
    if (seenSource.has(p.projectId)) {
      skipped.push({ projectId: p.projectId, title: p.title, reason: "동일 sourceId 중복 호출" });
      continue;
    }
    seenSource.add(p.projectId);
    const lines = p.sentences.map((s) => s.english).filter((s) => s.trim());
    const passage = joinSourceLines(lines) || joinWorkbookPassageLines(lines);
    if (!passage.trim()) {
      skipped.push({ projectId: p.projectId, title: p.title, reason: "영어 원문이 없습니다." });
      continue;
    }
    const sentences = segmentPassage(passage, p.sentences);
    const cacheKey = buildV2CacheKey({
      passageHash: hashPassage(passage),
      analyzerModel,
      analyzerReasoningEffort: analyzerEffort,
      auditorModel,
      auditorReasoningEffort: auditorEffort,
    });
    const cached = input.forceRegenerate
      ? null
      : getCachedGrammarChoiceV2(p.grammarChoiceV2Cache, p.projectId, cacheKey);
    if (cached) {
      sections.push({
        ...cached.section,
        diagnostics: {
          ...cached.section.diagnostics!,
          cacheHit: true,
          openAICallCount: 0,
          generateApiCalls: 0,
          reviewApiCalls: 0,
          forceRegenerate: false,
        },
      });
      continue;
    }
    if (capture) {
      writeCheckpoint(captureDir, `passages/${p.projectId}/source.json`, {
        ...captureMetadata({
          sourceId: p.projectId,
          generatorModel: analyzerModel,
          generatorReasoningEffort: analyzerEffort,
          reviewerModel: auditorModel,
          reviewerReasoningEffort: auditorEffort,
          forceRegenerate: input.forceRegenerate === true,
          cacheHit: false,
          fallback: false,
        }),
        title: p.title,
        source: p.source,
        passage,
        sha256: hashPassage(passage),
        sentenceCount: sentences.length,
        sentences: sentences.map((sentence, order) => ({
          sentenceId: sentence.sentenceId,
          order,
          text: sentence.text,
        })),
      });
    }
    pending.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source,
      passage,
      sentences,
      hints: hintsFromReport(p.analysisReport).filter((h) =>
        h.targetText ? passage.includes(h.targetText) : false
      ),
      cache: p.grammarChoiceV2Cache ?? null,
      cacheKey,
    });
  }

  const splitMs = Date.now() - splitStarted;

  if (!apiKey && pending.length > 0) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const needAnalyze = pending.filter((row) => {
    if (input.forceRegenerate) return true;
    return !getCachedGrammarChoiceV2Analysis(row.cache, row.projectId, row.cacheKey);
  });
  const analyzeStarted = Date.now();
  const concurrency = Math.min(ANALYZER_CONCURRENCY, needAnalyze.length || 1);
  const fresh = await runWithConcurrency(needAnalyze, concurrency, async (row) => {
    const routeStarted = Date.now();
    const localMandatory = scanLocalMandatory(row.sentences);
    const routeMs = Date.now() - routeStarted;
    try {
      const analyzedRow = await analyzeAndGeneratePassage({
        apiKey,
        model: analyzerModel,
        reasoningEffort: analyzerEffort,
        passageId: row.projectId,
        sentences: row.sentences,
        analysisHints: row.hints,
        localMandatoryHints: localMandatory,
      });
      if (capture) {
        writeCheckpoint(captureDir, `passages/${row.projectId}/analyzer.json`, {
          ...captureMetadata({
            sourceId: row.projectId,
            generatorModel: analyzerModel,
            generatorReasoningEffort: analyzerEffort,
            reviewerModel: auditorModel,
            reviewerReasoningEffort: auditorEffort,
            forceRegenerate: input.forceRegenerate === true,
            cacheHit: false,
            fallback: analyzedRow.fallback,
          }),
          responseModel: analyzedRow.responseModel,
          latencyMs: analyzedRow.latencyMs,
          inputTokens: analyzedRow.inputTokens,
          outputTokens: analyzedRow.outputTokens,
          rawJson: analyzedRow.rawJson,
          parsed: analyzedRow.parsed,
          detected: analyzedRow.detected,
          candidates: analyzedRow.candidates,
          routeMs,
        });
      }
      return {
        ok: true as const,
        row,
        analyzedRow,
        localMandatory,
        routeMs,
        fromCache: false,
        cachedAudits: [] as import("@/lib/lesson-materials/grammar-choice-v2/types").AuditResult[],
      };
    } catch (error) {
      return {
        ok: false as const,
        row,
        error: error instanceof Error ? error.message : String(error),
        localMandatory,
        routeMs,
      };
    }
  });
  const analyzeMs = Date.now() - analyzeStarted;
  const succeeded = fresh.filter((item) => item.ok);
  generateCalls += succeeded.length;
  openAi += succeeded.length;
  for (const row of succeeded) promptChars.push(row.analyzedRow.promptChars);
  for (const item of fresh) {
    if (item.ok) continue;
    skipped.push({
      projectId: item.row.projectId,
      title: item.row.title,
      reason: item.error,
    });
  }

  const analyzed = pending.flatMap((row) => {
    const made = succeeded.find((item) => item.row.projectId === row.projectId);
    if (made) return [made];
    if (fresh.some((item) => !item.ok && item.row.projectId === row.projectId)) return [];
    const hit = getCachedGrammarChoiceV2Analysis(row.cache, row.projectId, row.cacheKey);
    if (!hit) return [];
    return [{
      ok: true as const,
      row,
      analyzedRow: {
        detected: hit.detected,
        candidates: hit.candidates,
        responseModel: hit.responseModel,
        promptChars: 0,
        rawJson: "",
        parsed: null,
        latencyMs: 0,
        inputTokens: null,
        outputTokens: null,
        fallback: false,
      },
      localMandatory: scanLocalMandatory(row.sentences),
      routeMs: 0,
      fromCache: true,
      cachedAudits: hit.audits,
    }];
  });

  const filterStarted = Date.now();
  const expanded = analyzed.flatMap(({ row, analyzedRow, fromCache, cachedAudits }) => {
    if (fromCache && cachedAudits) return [];
    const filtered = resolveAndFilter({
      sentences: row.sentences,
      candidates: analyzedRow.candidates,
    });
    return expandAuditItems(filtered.resolved).map((item) => ({
      ...item,
      passageId: row.projectId,
    }));
  });
  const reviewPlan = planReviewerSubmission(
    expanded,
    analyzed.flatMap(({ row }) => row.sentences)
  );
  const auditPool = reviewPlan.send.map((item) => {
    const owner = expanded.find((row) => row.candidateId === item.candidateId);
    return { ...item, passageId: owner && "passageId" in owner ? String(owner.passageId) : "" };
  });
  const localPassByPassage = new Map<string, typeof reviewPlan.localPass>();
  for (const item of reviewPlan.localPass) {
    const owner = expanded.find((row) => row.candidateId === item.candidateId);
    const passageId = owner && "passageId" in owner ? String(owner.passageId) : "";
    const list = localPassByPassage.get(passageId) ?? [];
    list.push(item);
    localPassByPassage.set(passageId, list);
  }
  const filterMs = Date.now() - filterStarted;
  const sentenceLookup = analyzed.flatMap(({ row }) => row.sentences);
  const reviewStarted = Date.now();
  const audit =
    auditPool.length === 0
      ? { results: [], responseModel: auditorModel, calls: 0, latencyMs: 0, inputTokens: null, outputTokens: null, rawJson: [] as string[], parsed: [] as unknown[], fallback: false }
      : await auditRiskyCandidates({
          apiKey,
          model: auditorModel,
          reasoningEffort: auditorEffort,
          sentences: sentenceLookup,
          items: auditPool,
        });
  const reviewMs = Date.now() - reviewStarted;
  reviewCalls += audit.calls;
  openAi += audit.calls;
  if (capture) {
    writeCheckpoint(captureDir, "reviewer.json", {
      ...captureMetadata({
        generatorModel: analyzerModel,
        generatorReasoningEffort: analyzerEffort,
        reviewerModel: auditorModel,
        reviewerReasoningEffort: auditorEffort,
        forceRegenerate: input.forceRegenerate === true,
        cacheHit: false,
        fallback: audit.fallback,
      }),
      responseModel: audit.responseModel,
      calls: audit.calls,
      latencyMs: audit.latencyMs,
      inputTokens: audit.inputTokens,
      outputTokens: audit.outputTokens,
      rawJson: audit.rawJson,
      parsed: audit.parsed,
      results: audit.results,
    });
  }

  const auditByPassage = new Map<string, typeof audit.results>();
  for (const result of audit.results) {
    const owner = auditPool.find((item) => item.candidateId === result.candidateId);
    const passageId = owner && "passageId" in owner ? String(owner.passageId) : "";
    const list = auditByPassage.get(passageId) ?? [];
    list.push(result);
    auditByPassage.set(passageId, list);
  }

  for (const { row, analyzedRow, cachedAudits } of analyzed) {
    const finalized = finalizeV2Passage({
      projectId: row.projectId,
      title: row.title,
      source: row.source,
      originalPassage: row.passage,
      sentences: row.sentences,
      detected: analyzedRow.detected,
      candidates: analyzedRow.candidates,
      audits: [
        ...(cachedAudits ?? []),
        ...(localPassByPassage.get(row.projectId) ?? []),
        ...(auditByPassage.get(row.projectId) ?? []),
      ],
      seedKey: `${row.projectId}|${row.cacheKey.passageHash}|v2`,
      diagnosticsBase: emptyDiagnostics({
        sentenceCount: row.sentences.length,
        cacheHit: false,
        forceRegenerate: input.forceRegenerate === true,
        analyzerModel,
        auditorModel,
        analyzerEffort,
        auditorEffort,
        openAICallCount: openAi,
        generateApiCalls: generateCalls,
        reviewApiCalls: reviewCalls,
        generatorResponseModel: analyzedRow.responseModel,
        reviewerResponseModel: audit.responseModel,
      }),
    });
    reports.push({
      projectId: row.projectId,
      title: row.title,
      responseModel: analyzedRow.responseModel,
      detected: analyzedRow.detected.map((d) => ({
        sentenceId: d.sentenceId,
        pointCode: d.pointCode,
        sourceSpan: d.sourceSpan,
      })),
      candidates: analyzedRow.candidates.map((c) => ({
        sentenceId: c.sentenceId,
        pointCode: c.pointCode,
        pair: `${c.correctAnswer} / ${c.distractors[0] ?? ""}`,
      })),
      rejected: finalized.rejected,
      missingMandatory: finalized.missingMandatory,
      ok: finalized.ok,
    });
    const withAnalysis = upsertGrammarChoiceV2Analysis(row.cache, row.projectId, {
      key: row.cacheKey,
      responseModel: analyzedRow.responseModel,
      detected: analyzedRow.detected,
      candidates: analyzedRow.candidates,
      audits: [
        ...(cachedAudits ?? []),
        ...(localPassByPassage.get(row.projectId) ?? []),
        ...(auditByPassage.get(row.projectId) ?? []),
      ],
    });
    if (capture) {
      writeCheckpoint(captureDir, `passages/${row.projectId}/reviewer.json`, {
        ...captureMetadata({
          sourceId: row.projectId,
          generatorModel: analyzerModel,
          generatorReasoningEffort: analyzerEffort,
          reviewerModel: auditorModel,
          reviewerReasoningEffort: auditorEffort,
          forceRegenerate: input.forceRegenerate === true,
          cacheHit: false,
          fallback: audit.fallback,
        }),
        rawJson: audit.rawJson,
        parsed: audit.parsed,
        results: [
          ...(cachedAudits ?? []),
          ...(localPassByPassage.get(row.projectId) ?? []),
          ...(auditByPassage.get(row.projectId) ?? []),
        ],
      });
      writeCheckpoint(captureDir, `passages/${row.projectId}/pipeline.json`, {
        ...captureMetadata({
          sourceId: row.projectId,
          generatorModel: analyzerModel,
          generatorReasoningEffort: analyzerEffort,
          reviewerModel: auditorModel,
          reviewerReasoningEffort: auditorEffort,
          forceRegenerate: input.forceRegenerate === true,
          cacheHit: false,
          fallback: false,
        }),
        ok: finalized.ok,
        reason: finalized.reason ?? null,
        stages: finalized.stages,
        rejected: finalized.rejected,
        missingMandatory: finalized.missingMandatory,
        section: finalized.section ?? null,
        digest: finalized.section
          ? studentReplayDigest(finalized.section, {
              exclusions: finalized.rejected,
              occurrences: finalized.stages.occurrences,
            })
          : null,
      });
    }
    if (!finalized.ok || !finalized.section) {
      skipped.push({
        projectId: row.projectId,
        title: row.title,
        reason: finalized.reason ?? "어법 선택 V2 생성 실패",
      });
      cachesToSave.push({ projectId: row.projectId, cache: withAnalysis });
      continue;
    }
    sections.push(finalized.section);
    const next = upsertGrammarChoiceV2Cache(withAnalysis, row.projectId, {
      key: row.cacheKey,
      section: finalized.section,
      createdAt: new Date().toISOString(),
    });
    cachesToSave.push({ projectId: row.projectId, cache: next });
  }

  if (capture) {
    writeCheckpoint(captureDir, "run.json", {
      ...captureMetadata({
        generatorModel: analyzerModel,
        generatorReasoningEffort: analyzerEffort,
        reviewerModel: auditorModel,
        reviewerReasoningEffort: auditorEffort,
        forceRegenerate: input.forceRegenerate === true,
        cacheHit: false,
        fallback: false,
      }),
      status: "FINISHED",
      passageIds: input.passages.map((p) => p.projectId),
      openAICallCount: openAi,
      generateApiCalls: generateCalls,
      reviewApiCalls: reviewCalls,
      snapshotDir: captureDir,
    });
  }

  return {
    sections,
    skipped,
    cachesToSave,
    timing: {
      dataLoadMs: splitMs,
      translationLookupMs: analyzeMs,
      blankSelectionMs: filterMs + reviewMs,
      pdfRenderMs: 0,
      totalMs: Date.now() - t0,
      openAiRequestCount: openAi,
    },
    ontology: ontologyCounts(),
    promptChars,
    reports,
  };
}
