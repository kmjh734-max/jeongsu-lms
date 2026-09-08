import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { analyzeAndGeneratePassage } from "@/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { auditRiskyCandidates } from "@/lib/lesson-materials/grammar-choice-v2/ambiguity-auditor";
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

export const ANALYZER_CONCURRENCY = 3;

export function resolveGrammarChoiceEngineVersion(): "v1" | "v2" {
  return process.env.GRAMMAR_CHOICE_ENGINE_VERSION?.trim().toLowerCase() === "v2"
    ? "v2"
    : "v1";
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

  for (const p of input.passages) {
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

  if (!apiKey && pending.length > 0) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const needAnalyze = pending.filter((row) => {
    if (input.forceRegenerate) return true;
    return !getCachedGrammarChoiceV2Analysis(row.cache, row.projectId, row.cacheKey);
  });
  const fresh = await runWithConcurrency(needAnalyze, ANALYZER_CONCURRENCY, async (row) => {
    const localMandatory = scanLocalMandatory(row.sentences);
    const analyzedRow = await analyzeAndGeneratePassage({
      apiKey,
      model: analyzerModel,
      reasoningEffort: analyzerEffort,
      passageId: row.projectId,
      sentences: row.sentences,
      analysisHints: row.hints,
      localMandatoryHints: localMandatory,
    });
    return {
      row,
      analyzedRow,
      localMandatory,
      fromCache: false as const,
      cachedAudits: [] as import("@/lib/lesson-materials/grammar-choice-v2/types").AuditResult[],
    };
  });
  generateCalls += fresh.length;
  openAi += fresh.length;
  for (const row of fresh) promptChars.push(row.analyzedRow.promptChars);

  const analyzed = pending.map((row) => {
    const made = fresh.find((item) => item.row.projectId === row.projectId);
    if (made) return made;
    const hit = getCachedGrammarChoiceV2Analysis(row.cache, row.projectId, row.cacheKey)!;
    return {
      row,
      analyzedRow: {
        detected: hit.detected,
        candidates: hit.candidates,
        responseModel: hit.responseModel,
        promptChars: 0,
      },
      localMandatory: scanLocalMandatory(row.sentences),
      fromCache: true as const,
      cachedAudits: hit.audits,
    };
  });

  const auditPool = analyzed.flatMap(({ row, analyzedRow, fromCache, cachedAudits }) => {
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
  const sentenceLookup = analyzed.flatMap(({ row }) => row.sentences);
  const audit =
    auditPool.length === 0
      ? { results: [], responseModel: auditorModel, calls: 0 }
      : await auditRiskyCandidates({
          apiKey,
          model: auditorModel,
          reasoningEffort: auditorEffort,
          sentences: sentenceLookup,
          items: auditPool,
        });
  reviewCalls += audit.calls;
  openAi += audit.calls;

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
        ...(auditByPassage.get(row.projectId) ?? []),
      ],
    });
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
      openAiRequestCount: openAi,
    },
    ontology: ontologyCounts(),
    promptChars,
    reports,
  };
}
