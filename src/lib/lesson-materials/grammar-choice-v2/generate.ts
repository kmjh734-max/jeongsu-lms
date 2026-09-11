import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { createLimiter } from "@/lib/lesson-materials/grammar-choice-v2/limiter";
import { analyzeAndGeneratePassage } from "@/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { auditRiskyCandidates } from "@/lib/lesson-materials/grammar-choice-v2/ambiguity-auditor";
import {
  expandUniquenessItems,
  verifyChoiceUniqueness,
  type UniquenessVerdict,
} from "@/lib/lesson-materials/grammar-choice-v2/uniqueness-audit";
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

/**
 * 분석 단계에서 동시에 열어 두는 OpenAI 호출 수 (지문 전체 합).
 *
 * 예전 값 4는 "동시에 처리하는 지문 수"였고, 지문 안의 묶음 동시성(3)과
 * 곱해져 실제 상한이 지문 구성에 따라 달라졌다. 이제는 문장 하나가 곧 한
 * 호출이므로 여기 한 곳에서만 상한을 잡는다.
 *
 * 16 -> 32 -> 48로 올리며 실측했다. 16은 세 웨이브(74.1초), 32는 두 웨이브(51.2초)로
 * 매번 peak가 상한에 붙었다 = 게이트가 병목이라는 뜻이다. 4지문이 38호출이므로
 * 48이면 한 웨이브에 들어간다. 순간 호출이 늘어 429가 날 수 있으므로
 * openai-call의 재시도가 전제다.
 */
export const ANALYZER_CALL_CONCURRENCY = 48;

/**
 * 판정 단계에서 동시에 열어 두는 OpenAI 호출 수 (지문 전체 합).
 *
 * AUDIT_CONCURRENCY(6)와 UNIQUENESS_CONCURRENCY(10)는 호출 1회당 상한이라,
 * 지문별로 판정을 부르면 지문 수만큼 곱해진다. 여기서 전체를 한 번에 잡는다.
 *
 * 유일성 묶음을 8개에서 3개로 줄이면서 판정 호출 수가 두 배 남짓 늘었다.
 * 상한이 24면 두 웨이브가 되어 묶음을 쪼갠 이득이 그대로 사라지므로
 * 분석 게이트와 같은 48로 맞춘다.
 */
export const REVIEWER_CALL_CONCURRENCY = 48;

/** @deprecated 지문 단위로 세던 시절의 상한. ANALYZER_CALL_CONCURRENCY를 쓴다. */
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

/**
 * 분석 단계 추론 강도.
 *
 * 이 단계가 하는 일은 정리된 온톨로지를 지문 문장에 대조해 해당하는 항목을
 * 고르고 최소 대립쌍을 만드는 것이라, 긴 추론이 필요한 종류의 작업이 아니다.
 * high는 시간과 비용만 늘렸다(관측: 3문장 한 호출이 medium 79초 / low 45초인데
 * high는 180초 상한을 넘겨 지문이 통째로 버려졌다).
 *
 * 지연은 출력 토큰 수에 정비례하므로(실측 회귀: 17.1ms/토큰,
 * 약 58 tok/s) 추론 강도를 낮추는 것이 속도에 가장 직접적으로 듣는다.
 * 추론을 줄이면서 잃는 정확도는 모델 추론이 아니라 로컬 층이 메운다:
 *  - 문장별 likelyCodes(결정적 검출기 14종)가 코드 탐색을 대신한다.
 *  - 블라인드 유일성 게이트가 "네모 안 둘 다 맞는" 문항을 걷어낸다.
 *  - local-validators / choice-repair가 형태 오류를 잡는다.
 * 판정 단계(검수·유일성)는 medium을 유지하므로, 싸게 만든 것을 무르게
 * 통과시키는 방향으로는 기울지 않는다.
 *
 * 기본값을 low에서 none으로 내렸다. low에서도 출력의 60~75%가 추론 토큰이었고
 * 가장 느린 호출이 곧 추론이 가장 긴 호출이었다(39.5초 = 1,355토큰 중 997).
 * 같은 4지문 38문장 실측에서 분석 단계 종료가 43초 -> 14.4초였고 문항 수는
 * 70 -> 65로 비슷했다. 새로 생긴 실패는 없는 낱말 오답(oftenly, likelyly,
 * wills, predictabler)이었고, 판정을 medium으로 두어도 걸러지지 않아서
 * distractor-guard가 형태로 막는다. 판정 단계는 low로 내리면 둘 다 맞는
 * 문항(are meant / mean)이 새어 나와 medium을 유지한다.
 */
export function resolveV2AnalyzerEffort(): "none" | "low" | "medium" | "high" {
  const raw = process.env.OPENAI_GRAMMAR_V2_ANALYZER_REASONING_EFFORT?.trim().toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high") return raw;
  return "none";
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

  /**
   * 지문 하나를 분석부터 판정까지 끝까지 밀고 간다.
   *
   * 예전에는 "전 지문 분석 -> 배리어 -> 전 지문 판정" 두 단계였다. 그래서 먼저
   * 끝난 지문이 마지막 지문의 분석을 기다리는 동안 놀았다. 판정 묶음은 이미
   * chunkByGroup이 지문 경계로 잘라 왔으므로(호출 하나가 두 지문을 섞은 적이
   * 없다) 지문별로 나눠 불러도 호출당 항목 구성은 그대로다.
   *
   * 덤으로 전역 풀에서 candidateId로 판정을 되찾던 경로가 사라진다. 그 id는
   * choice-repair가 만드는 local-*의 경우 지문 접두사가 없어서, 두 지문이 같은
   * id를 만들면 판정이 엉뚱한 지문에 붙을 수 있었다.
   */
  const analyzerGate = createLimiter(ANALYZER_CALL_CONCURRENCY);
  const reviewerGate = createLimiter(REVIEWER_CALL_CONCURRENCY);

  const processed = await runWithConcurrency(
    pending,
    pending.length || 1,
    async (row) => {
      const localMandatory = scanLocalMandatory(row.sentences);
      const cachedAnalysis = input.forceRegenerate
        ? null
        : getCachedGrammarChoiceV2Analysis(row.cache, row.projectId, row.cacheKey);

      if (cachedAnalysis) {
        return {
          ok: true as const,
          row,
          analyzedRow: {
            detected: cachedAnalysis.detected,
            candidates: cachedAnalysis.candidates,
            responseModel: cachedAnalysis.responseModel,
            promptChars: 0,
            rawJson: "",
            parsed: null,
            latencyMs: 0,
            inputTokens: null,
            outputTokens: null,
            fallback: false,
            callCount: 0,
          },
          audits: cachedAnalysis.audits,
          // 판정 도입 전 캐시에는 판정이 없다. []로 넘기면 판정 실패로 보고 전부 떨어뜨린다.
          uniqueness: cachedAnalysis.uniqueness,
          auditResponseModel: auditorModel,
          analyzeCalls: 0,
          reviewCalls: 0,
          analyzeMs: 0,
          reviewMs: 0,
        };
      }

      let analyzedRow;
      const analyzeStarted = Date.now();
      try {
        analyzedRow = await analyzeAndGeneratePassage({
          apiKey,
          model: analyzerModel,
          reasoningEffort: analyzerEffort,
          passageId: row.projectId,
          sentences: row.sentences,
          analysisHints: row.hints,
          localMandatoryHints: localMandatory,
          limiter: analyzerGate,
        });
      } catch (error) {
        return {
          ok: false as const,
          row,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      const analyzeMs = Date.now() - analyzeStarted;

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
        });
      }

      const { resolved } = resolveAndFilter({
        sentences: row.sentences,
        candidates: analyzedRow.candidates,
      });
      const expanded = expandAuditItems(resolved);
      /**
       * 유일성 판정은 needsAuditor 라우팅을 타지 않는다.
       * 검수로 안 보내는 후보가 "네모 안 둘 다 맞는" 문제의 주된 출처이므로
       * 해소된 후보 전부를 블라인드 판정에 넣는다.
       */
      const uniquenessPool = expandUniquenessItems(resolved);
      const reviewPlan = planReviewerSubmission(expanded, row.sentences);

      const reviewStarted = Date.now();
      // 두 판정은 서로 독립이므로 함께 띄운다.
      const [audit, uniqueness] = await Promise.all([
        reviewPlan.send.length === 0
          ? Promise.resolve({
              results: [],
              responseModel: auditorModel,
              calls: 0,
              latencyMs: 0,
              inputTokens: null,
              outputTokens: null,
              rawJson: [] as string[],
              parsed: [] as unknown[],
              fallback: false,
            })
          : auditRiskyCandidates({
              apiKey,
              model: auditorModel,
              reasoningEffort: auditorEffort,
              sentences: row.sentences,
              items: reviewPlan.send,
              limiter: reviewerGate,
            }),
        verifyChoiceUniqueness({
          apiKey,
          model: auditorModel,
          reasoningEffort: auditorEffort,
          sentences: row.sentences,
          items: uniquenessPool,
          limiter: reviewerGate,
        }),
      ]);
      const reviewMs = Date.now() - reviewStarted;

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

      return {
        ok: true as const,
        row,
        analyzedRow,
        audits: [...reviewPlan.localPass, ...audit.results],
        uniqueness: uniqueness.verdicts,
        auditResponseModel: audit.responseModel,
        analyzeCalls: analyzedRow.callCount,
        reviewCalls: audit.calls + uniqueness.calls,
        analyzeMs,
        reviewMs,
      };
    }
  );


  for (const item of processed) {
    if (item.ok) {
      generateCalls += item.analyzeCalls;
      reviewCalls += item.reviewCalls;
      openAi += item.analyzeCalls + item.reviewCalls;
      if (item.analyzedRow.promptChars) promptChars.push(item.analyzedRow.promptChars);
      continue;
    }
    skipped.push({
      projectId: item.row.projectId,
      title: item.row.title,
      reason: item.error,
    });
  }

  const analyzed = processed.filter((item) => item.ok);
  /**
   * 지문별 단계가 서로 겹치므로 합을 내면 실제 경과보다 커진다.
   * 임계 경로를 보려면 최댓값이 맞다.
   */
  const analyzeMs = Math.max(0, ...analyzed.map((item) => item.analyzeMs));
  const reviewMs = Math.max(0, ...analyzed.map((item) => item.reviewMs));

  for (const { row, analyzedRow, audits, uniqueness: passageUniqueness, auditResponseModel } of analyzed) {
    const finalized = finalizeV2Passage({
      projectId: row.projectId,
      title: row.title,
      source: row.source,
      originalPassage: row.passage,
      sentences: row.sentences,
      detected: analyzedRow.detected,
      candidates: analyzedRow.candidates,
      audits,
      uniqueness: passageUniqueness,
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
        reviewerResponseModel: auditResponseModel,
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
      audits,
      uniqueness: passageUniqueness,
    });
    if (capture) {
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
      blankSelectionMs: reviewMs,
      pdfRenderMs: 0,
      totalMs: Date.now() - t0,
      openAiRequestCount: openAi,
    },
    ontology: ontologyCounts(),
    promptChars,
    reports,
  };
}
