import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  WORKBOOK_GRAMMAR_CHOICE_SYSTEM_PROMPT,
  buildWorkbookGrammarChoiceUserPrompt,
  buildAnalysisPromptSentences,
} from "@/lib/lesson-materials/workbook-grammar-choice-prompt";
import {
  getCachedGrammarChoiceCandidates,
  hashEnglishLines,
  upsertGrammarChoiceCache,
  type StoredGrammarChoiceCache,
  type StoredGrammarChoiceCacheRow,
} from "@/lib/lesson-materials/grammar-choice-cache";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "@/lib/lesson-materials/grammar-choice-constants";
import { validateAndFilterCandidates } from "@/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "@/lib/lesson-materials/grammar-choice-select";
import {
  buildGrammarChoiceItems,
  buildPassageSegmentsFromSource,
} from "@/lib/lesson-materials/grammar-choice-display";
import { repairCandidateAgainstPassage } from "@/lib/lesson-materials/grammar-choice-repair";
import { minimizeAndRelocateCandidate } from "@/lib/lesson-materials/grammar-choice-minimize";
import { buildHeuristicGrammarCandidates } from "@/lib/lesson-materials/grammar-choice-fallback";
import {
  computeGrammarAnalysisHash,
  extractRequiredAnalysisPoints,
  locateAnalysisTargetSpan,
  type AnalysisExclusionReason,
  type ExtractedAnalysisPoint,
} from "@/lib/lesson-materials/grammar-choice-analysis-extract";
import { convertAnalysisPointLocally } from "@/lib/lesson-materials/grammar-choice-analysis-convert";
import {
  countEnglishWords,
  formatWorkbookPassage,
  getGrammarChoiceTargetRange,
  joinWorkbookPassageLines,
  type GrammarChoiceCandidate,
  type WorkbookGenerationTiming,
  type WorkbookGrammarChoiceDiagnostics,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
} from "@/lib/lesson-materials/workbook-types";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function clampScore(n: unknown, fallback: number): 1 | 2 | 3 | 4 | 5 {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback as 1 | 2 | 3 | 4 | 5;
  return Math.min(5, Math.max(1, Math.round(v))) as 1 | 2 | 3 | 4 | 5;
}

const EXCLUSION_REASONS = new Set<AnalysisExclusionReason>([
  "NONE",
  "NO_EXACT_SOURCE_SPAN",
  "BOTH_OPTIONS_POSSIBLE",
  "LEXICAL_ONLY",
  "CANNOT_CREATE_MINIMAL_PAIR",
  "DUPLICATE_GRAMMAR_POINT",
  "PUNCTUATION_ONLY",
  "NOT_TEST_WORTHY",
]);

type AiAnalysisResultRow = {
  analysisPointId: string;
  convertible: boolean;
  exclusionReason: AnalysisExclusionReason;
  candidate: Record<string, unknown> | null;
};

type AiPassageResult = {
  passageId: string;
  analysisResults: AiAnalysisResultRow[];
  supplementalCandidates: Array<Record<string, unknown>>;
};

function candidateFromAiRaw(
  raw: Record<string, unknown>,
  passageId: string,
  sourceType: GrammarChoiceCandidate["sourceType"],
  analysisPointId: string | null,
  pointMeta?: ExtractedAnalysisPoint
): GrammarChoiceCandidate | null {
  const sentenceId = String(raw.sentenceId ?? "").trim();
  const originalText = String(
    raw.originalText ?? raw.correctText ?? ""
  ).trim();
  const incorrectText = String(raw.incorrectText ?? "").trim();
  if (!sentenceId || !originalText || !incorrectText) return null;
  const ambiguityRisk = String(raw.ambiguityRisk ?? "high");
  if (
    ambiguityRisk !== "low" &&
    ambiguityRisk !== "medium" &&
    ambiguityRisk !== "high"
  ) {
    return null;
  }
  return {
    choiceId: String(
      raw.choiceId ??
        `${sourceType}-${analysisPointId ?? sentenceId}-${originalText}`
    ).slice(0, 80),
    passageId,
    sentenceId,
    startTokenIndex: Number(raw.startTokenIndex ?? -1),
    endTokenIndex: Number(raw.endTokenIndex ?? -1),
    originalText,
    correctText: originalText,
    incorrectText,
    grammarCategoryId: String(
      raw.grammarCategoryId ?? pointMeta?.categoryId ?? ""
    ).trim(),
    grammarCategoryName: String(
      raw.grammarCategoryName ?? pointMeta?.categoryName ?? pointMeta?.title ?? ""
    ).trim(),
    bookTerm: String(raw.bookTerm ?? pointMeta?.bookTerm ?? "").trim(),
    explanationKo: String(
      raw.explanationKo ?? pointMeta?.explanationKo ?? ""
    ).trim(),
    incorrectReasonKo: String(raw.incorrectReasonKo ?? "").trim(),
    difficulty: clampScore(raw.difficulty, 3),
    learningValue: clampScore(
      raw.learningValue,
      sourceType === "analysis_required" ? 5 : 3
    ),
    ambiguityRisk,
    sourceType,
    analysisPointId,
  };
}

const CANDIDATE_PROPS = {
  type: "object",
  additionalProperties: false,
  required: [
    "sentenceId",
    "originalText",
    "incorrectText",
    "grammarCategoryId",
    "grammarCategoryName",
    "bookTerm",
    "explanationKo",
    "incorrectReasonKo",
    "learningValue",
    "ambiguityRisk",
    "startTokenIndex",
    "endTokenIndex",
    "choiceId",
    "difficulty",
  ],
  properties: {
    sentenceId: { type: "string" },
    originalText: { type: "string" },
    incorrectText: { type: "string" },
    grammarCategoryId: { type: "string" },
    grammarCategoryName: { type: "string" },
    bookTerm: { type: "string" },
    explanationKo: { type: "string" },
    incorrectReasonKo: { type: "string" },
    learningValue: { type: "number" },
    ambiguityRisk: { type: "string", enum: ["low", "medium", "high"] },
    startTokenIndex: { type: "integer" },
    endTokenIndex: { type: "integer" },
    choiceId: { type: "string" },
    difficulty: { type: "integer" },
  },
} as const;

async function callGrammarChoiceOpenAIAnalysisFirst(input: {
  passages: Array<{
    passageId: string;
    title?: string;
    source?: string | null;
    sourceText: string;
    softTargetMin: number;
    softTargetMax: number;
    sentences: ReturnType<typeof buildAnalysisPromptSentences>;
    requiredGrammarPointIds: string[];
    supplementalNeeded: number;
  }>;
}): Promise<{ results: AiPassageResult[]; openAiRequestCount: number }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const userContent = buildWorkbookGrammarChoiceUserPrompt(input);
  const configured = process.env.OPENAI_MODEL_WORKBOOK?.trim();
  const modelCandidates = configured
    ? [configured]
    : ["gpt-4o-mini", "gpt-4o"];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    let bodyText = "";
    let ok = false;

    for (const model of modelCandidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let includeJsonMode = true;
      let useJsonSchema = true;

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: WORKBOOK_GRAMMAR_CHOICE_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          max_tokens: 10_000,
        };
        if (includeTemperature && !isGpt5FamilyModel(model)) {
          body.temperature = 0.2;
        }
        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "grammar_choice_analysis_first",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["passages"],
                properties: {
                  passages: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "passageId",
                        "analysisResults",
                        "supplementalCandidates",
                      ],
                      properties: {
                        passageId: { type: "string" },
                        analysisResults: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            required: [
                              "analysisPointId",
                              "convertible",
                              "exclusionReason",
                              "candidate",
                            ],
                            properties: {
                              analysisPointId: { type: "string" },
                              convertible: { type: "boolean" },
                              exclusionReason: {
                                type: "string",
                                enum: [...EXCLUSION_REASONS],
                              },
                              candidate: CANDIDATE_PROPS,
                            },
                          },
                        },
                        supplementalCandidates: {
                          type: "array",
                          items: CANDIDATE_PROPS,
                        },
                      },
                    },
                  },
                },
              },
            },
          };
        } else if (includeJsonMode) {
          body.response_format = { type: "json_object" };
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        bodyText = await res.text();
        ok = res.ok;
        if (ok) break;

        let errMsg = bodyText;
        try {
          errMsg = JSON.stringify(JSON.parse(bodyText));
        } catch {
          /* keep */
        }
        if (isModelUnavailableError(res.status, errMsg)) break;
        if (isUnsupportedTemperatureError(errMsg) && includeTemperature) {
          includeTemperature = false;
          continue;
        }
        if (isUnsupportedParameterError(errMsg, "response_format")) {
          if (useJsonSchema) {
            useJsonSchema = false;
            continue;
          }
          if (includeJsonMode) {
            includeJsonMode = false;
            continue;
          }
        }
        if (isUnsupportedParameterError(errMsg, "temperature")) {
          includeTemperature = false;
          continue;
        }
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `어법 선택 생성 실패: ${bodyText.slice(0, 400) || "unknown"}`
      );
    }

    const json = parseJsonSafe<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(bodyText);
    const content = json?.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonSafe<{
      passages?: Array<{
        passageId?: string;
        analysisResults?: Array<Record<string, unknown>>;
        supplementalCandidates?: Array<Record<string, unknown>>;
      }>;
    }>(content);

    const results: AiPassageResult[] = [];
    for (const p of parsed?.passages ?? []) {
      const passageId = String(p.passageId ?? "").trim();
      if (!passageId) continue;
      const analysisResults: AiAnalysisResultRow[] = [];
      for (const row of p.analysisResults ?? []) {
        const analysisPointId = String(row.analysisPointId ?? "").trim();
        if (!analysisPointId) continue;
        const convertible = Boolean(row.convertible);
        let exclusionReason = String(
          row.exclusionReason ?? "NOT_TEST_WORTHY"
        ) as AnalysisExclusionReason;
        if (!EXCLUSION_REASONS.has(exclusionReason)) {
          exclusionReason = "NOT_TEST_WORTHY";
        }
        const candRaw =
          row.candidate && typeof row.candidate === "object"
            ? (row.candidate as Record<string, unknown>)
            : null;
        analysisResults.push({
          analysisPointId,
          convertible,
          exclusionReason: convertible ? "NONE" : exclusionReason,
          candidate: convertible ? candRaw : null,
        });
      }
      results.push({
        passageId,
        analysisResults,
        supplementalCandidates: (p.supplementalCandidates ?? []).filter(
          (x) => x && typeof x === "object"
        ) as Array<Record<string, unknown>>,
      });
    }
    return { results, openAiRequestCount: 1 };
  } finally {
    clearTimeout(timer);
  }
}

function finalizeCandidate(
  c: GrammarChoiceCandidate,
  sentenceRows: Array<{ id: string; english: string }>
): GrammarChoiceCandidate | null {
  const repaired = repairCandidateAgainstPassage(c, sentenceRows);
  if (!repaired) return null;
  const eng = sentenceRows.find((s) => s.id === repaired.sentenceId)?.english;
  if (!eng) return null;
  const minimized = minimizeAndRelocateCandidate(repaired, eng);
  if (!minimized) return null;
  return {
    ...minimized,
    sourceType: c.sourceType,
    analysisPointId: c.analysisPointId ?? null,
    grammarCategoryName: c.grammarCategoryName || minimized.grammarCategoryName,
    bookTerm: c.bookTerm || minimized.bookTerm,
    explanationKo: c.explanationKo || minimized.explanationKo,
    incorrectReasonKo: c.incorrectReasonKo || minimized.incorrectReasonKo,
    learningValue: c.learningValue,
    difficulty: c.difficulty,
  };
}

function mergeUnique(
  base: GrammarChoiceCandidate[],
  extra: GrammarChoiceCandidate[]
): GrammarChoiceCandidate[] {
  const out = [...base];
  const occupied = base.map((c) => ({
    sentenceId: c.sentenceId,
    start: c.startTokenIndex,
    end: c.endTokenIndex,
  }));
  for (const c of extra) {
    const overlaps = occupied.some(
      (o) =>
        o.sentenceId === c.sentenceId &&
        !(c.endTokenIndex < o.start || c.startTokenIndex > o.end)
    );
    if (overlaps) continue;
    if (
      out.some(
        (m) =>
          m.sentenceId === c.sentenceId &&
          m.startTokenIndex === c.startTokenIndex &&
          m.endTokenIndex === c.endTokenIndex
      )
    ) {
      continue;
    }
    out.push(c);
    occupied.push({
      sentenceId: c.sentenceId,
      start: c.startTokenIndex,
      end: c.endTokenIndex,
    });
  }
  return out;
}

export async function generateWorkbookGrammarChoice(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string }>;
    analysisReport?: AnalysisReportData | null;
    grammarChoiceCache?: StoredGrammarChoiceCache | null;
  }>;
}): Promise<{
  sections: WorkbookGrammarChoiceSection[];
  skipped: WorkbookGrammarChoiceSkip[];
  cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceCache;
  }>;
  timing: WorkbookGenerationTiming;
}> {
  const t0 = Date.now();
  const sections: WorkbookGrammarChoiceSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  const cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceCache;
  }> = [];
  let openAiRequestCount = 0;

  type PassageCtx = {
    p: (typeof input.passages)[number];
    sentenceRows: Array<{ id: string; english: string }>;
    sourcePassage: string;
    sourceHash: string;
    points: ExtractedAnalysisPoint[];
    analysisHash: string;
    range: { min: number; max: number };
    cacheHit: boolean;
    cached: GrammarChoiceCandidate[] | null;
    localCandidates: GrammarChoiceCandidate[];
    unresolvedPointIds: string[];
  };

  const contexts: PassageCtx[] = input.passages.map((p) => {
    const sentenceRows = p.sentences.map((s) => ({
      id: s.id,
      english: formatWorkbookPassage(s.english),
    }));
    const sourcePassage = joinWorkbookPassageLines(
      sentenceRows.map((s) => s.english)
    );
    const sourceHash = hashEnglishLines(sentenceRows.map((s) => s.english));
    const points = extractRequiredAnalysisPoints({
      report: p.analysisReport,
      sentences: sentenceRows,
    });
    const analysisHash = computeGrammarAnalysisHash(points);
    const cached = getCachedGrammarChoiceCandidates(
      p.grammarChoiceCache,
      p.projectId,
      sourceHash,
      analysisHash
    );

    const sentenceMap = new Map(sentenceRows.map((s) => [s.id, s.english]));
    const localRaw: GrammarChoiceCandidate[] = [];
    for (const pt of points) {
      const local = convertAnalysisPointLocally({
        passageId: p.projectId,
        point: pt,
      });
      if (!local) continue;
      const finalized = finalizeCandidate(local, sentenceRows);
      if (finalized) localRaw.push(finalized);
    }
    const { accepted: localAccepted } = validateAndFilterCandidates(
      localRaw,
      sentenceMap
    );
    const localIds = new Set(
      localAccepted
        .map((c) => c.analysisPointId)
        .filter((x): x is string => !!x)
    );
    const unresolvedPointIds = points
      .map((pt) => pt.analysisPointId)
      .filter((id) => !localIds.has(id));

    return {
      p,
      sentenceRows,
      sourcePassage: formatWorkbookPassage(sourcePassage),
      sourceHash,
      points,
      analysisHash,
      range: getGrammarChoiceTargetRange(countEnglishWords(sourcePassage)),
      cacheHit: !!cached,
      cached,
      localCandidates: localAccepted,
      unresolvedPointIds,
    };
  });

  const needAi = contexts.filter((c) => {
    if (c.cached) return false;
    const needSupp = c.localCandidates.length < c.range.min;
    return c.unresolvedPointIds.length > 0 || needSupp;
  });
  const aiByPassage = new Map<string, AiPassageResult>();

  if (needAi.length > 0) {
    const promptPassages = needAi.map((ctx) => {
      const unresolvedPoints = ctx.points.filter((pt) =>
        ctx.unresolvedPointIds.includes(pt.analysisPointId)
      );
      const supplementalNeeded = Math.max(
        0,
        ctx.range.min - ctx.localCandidates.length
      );
      return {
        passageId: ctx.p.projectId,
        title: ctx.p.title,
        source: ctx.p.source,
        sourceText: ctx.sourcePassage,
        softTargetMin: ctx.range.min,
        softTargetMax: ctx.range.max,
        sentences: buildAnalysisPromptSentences(
          ctx.sentenceRows,
          unresolvedPoints.length > 0 ? unresolvedPoints : ctx.points
        ),
        requiredGrammarPointIds: unresolvedPoints.map((x) => x.analysisPointId),
        supplementalNeeded,
      };
    });

    // Skip OpenAI when nothing unresolved and no supplement needed
    const anyWork = promptPassages.some(
      (p) =>
        p.requiredGrammarPointIds.length > 0 || p.supplementalNeeded > 0
    );
    if (anyWork) {
      try {
        const ai = await callGrammarChoiceOpenAIAnalysisFirst({
          passages: promptPassages,
        });
        openAiRequestCount += ai.openAiRequestCount;
        for (const r of ai.results) aiByPassage.set(r.passageId, r);
      } catch (err) {
        console.warn(
          "[workbook-grammar-choice] OpenAI failed; analysis-local + heuristics",
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  for (const ctx of contexts) {
    const sentenceMap = new Map(
      ctx.sentenceRows.map((s) => [s.id, s.english] as const)
    );
    const pointById = new Map(
      ctx.points.map((pt) => [pt.analysisPointId, pt] as const)
    );
    const exclusions: WorkbookGrammarChoiceDiagnostics["exclusions"] = [];
    let originalMismatchCount = 0;
    let bothPossibleCount = 0;
    let lexicalExcludedCount = 0;

    let accepted: GrammarChoiceCandidate[] = [];
    let convertibleCount = 0;

    if (ctx.cached) {
      accepted = ctx.cached;
      convertibleCount = accepted.filter(
        (c) => c.sourceType === "analysis_required"
      ).length;
    } else {
      const ai = aiByPassage.get(ctx.p.projectId);
      const analysisCandidates: GrammarChoiceCandidate[] = [
        ...ctx.localCandidates,
      ];
      const coveredIds = new Set(
        analysisCandidates
          .map((c) => c.analysisPointId)
          .filter((x): x is string => !!x)
      );

      // AI fills only unresolved analysis points
      for (const row of ai?.analysisResults ?? []) {
        if (coveredIds.has(row.analysisPointId)) continue;
        const meta = pointById.get(row.analysisPointId);
        if (!row.convertible || !row.candidate) {
          exclusions.push({
            analysisPointId: row.analysisPointId,
            reason: row.exclusionReason,
            title: meta?.title,
          });
          if (row.exclusionReason === "BOTH_OPTIONS_POSSIBLE") {
            bothPossibleCount += 1;
          }
          if (row.exclusionReason === "LEXICAL_ONLY") {
            lexicalExcludedCount += 1;
          }
          continue;
        }
        const raw = candidateFromAiRaw(
          row.candidate,
          ctx.p.projectId,
          "analysis_required",
          row.analysisPointId,
          meta
        );
        if (!raw) {
          exclusions.push({
            analysisPointId: row.analysisPointId,
            reason: "CANNOT_CREATE_MINIMAL_PAIR",
            title: meta?.title,
          });
          continue;
        }
        if (meta) {
          raw.bookTerm = meta.bookTerm || raw.bookTerm;
          raw.grammarCategoryName =
            meta.categoryName || meta.title || raw.grammarCategoryName;
          raw.explanationKo = meta.explanationKo || raw.explanationKo;
          raw.learningValue = clampScore(
            Math.max(raw.learningValue, 5),
            5
          );
        }
        const finalized = finalizeCandidate(raw, ctx.sentenceRows);
        if (!finalized) {
          originalMismatchCount += 1;
          exclusions.push({
            analysisPointId: row.analysisPointId,
            reason: "NO_EXACT_SOURCE_SPAN",
            title: meta?.title,
          });
          continue;
        }
        analysisCandidates.push(finalized);
        coveredIds.add(row.analysisPointId);
      }

      // Unresolved points with no AI convertible result → record exclusion
      for (const pt of ctx.points) {
        if (coveredIds.has(pt.analysisPointId)) continue;
        if (exclusions.some((e) => e.analysisPointId === pt.analysisPointId)) {
          continue;
        }
        if (!locateAnalysisTargetSpan(pt)) {
          exclusions.push({
            analysisPointId: pt.analysisPointId,
            reason: "NO_EXACT_SOURCE_SPAN",
            title: pt.title,
          });
        } else {
          exclusions.push({
            analysisPointId: pt.analysisPointId,
            reason: "CANNOT_CREATE_MINIMAL_PAIR",
            title: pt.title,
          });
        }
      }

      const { accepted: analysisAccepted, rejected: analysisRejected } =
        validateAndFilterCandidates(analysisCandidates, sentenceMap);
      for (const r of analysisRejected) {
        if (r.reason === "ambiguous_pair") bothPossibleCount += 1;
        if (r.reason === "vocab_collocation") lexicalExcludedCount += 1;
        if (
          r.reason === "original_mismatch" ||
          r.reason === "restore_failed" ||
          r.reason === "correct_not_original"
        ) {
          originalMismatchCount += 1;
        }
        if (r.candidate.analysisPointId) {
          exclusions.push({
            analysisPointId: r.candidate.analysisPointId,
            reason:
              r.reason === "ambiguous_pair"
                ? "BOTH_OPTIONS_POSSIBLE"
                : r.reason === "vocab_collocation"
                  ? "LEXICAL_ONLY"
                  : "CANNOT_CREATE_MINIMAL_PAIR",
            title: pointById.get(r.candidate.analysisPointId)?.title,
          });
        }
      }

      accepted = analysisAccepted.map((c) => ({
        ...c,
        sourceType: "analysis_required" as const,
      }));
      convertibleCount = accepted.length;

      // Supplements only if below target
      if (accepted.length < ctx.range.min) {
        const suppRaw: GrammarChoiceCandidate[] = [];
        for (const raw of ai?.supplementalCandidates ?? []) {
          const c = candidateFromAiRaw(
            raw,
            ctx.p.projectId,
            "ai_supplement",
            null
          );
          if (!c) continue;
          const finalized = finalizeCandidate(c, ctx.sentenceRows);
          if (finalized) suppRaw.push(finalized);
        }
        if (accepted.length + suppRaw.length < ctx.range.min) {
          const heur = buildHeuristicGrammarCandidates({
            passageId: ctx.p.projectId,
            sentences: ctx.sentenceRows,
          }).map((c) => ({
            ...c,
            sourceType: "heuristic_supplement" as const,
            analysisPointId: null,
            learningValue: clampScore(Math.min(c.learningValue, 3), 3),
          }));
          suppRaw.push(...heur);
        }
        const { accepted: suppOk, rejected: suppRejected } =
          validateAndFilterCandidates(suppRaw, sentenceMap);
        for (const r of suppRejected) {
          if (r.reason === "ambiguous_pair") bothPossibleCount += 1;
          if (r.reason === "vocab_collocation") lexicalExcludedCount += 1;
        }
        const suppTagged = suppOk.map((c) => ({
          ...c,
          sourceType: (c.sourceType ?? "ai_supplement") as NonNullable<
            GrammarChoiceCandidate["sourceType"]
          >,
        }));
        accepted = mergeUnique(accepted, suppTagged);
      }
    }

    const selected = selectFinalGrammarChoices(accepted, ctx.range.max);
    // Ensure every validated analysis_required stays even if over softMax
    const analysisSelected = accepted.filter(
      (c) => c.sourceType === "analysis_required"
    );
    const mergedSelected = mergeUnique(analysisSelected, selected);

    // Passage order sort
    const orderIndex = new Map(ctx.sentenceRows.map((s, i) => [s.id, i]));
    mergedSelected.sort((a, b) => {
      const oa = orderIndex.get(a.sentenceId) ?? 0;
      const ob = orderIndex.get(b.sentenceId) ?? 0;
      if (oa !== ob) return oa - ob;
      return a.startTokenIndex - b.startTokenIndex;
    });

    if (mergedSelected.length === 0) {
      skipped.push({
        projectId: ctx.p.projectId,
        title: ctx.p.title,
        reason: "검증을 통과한 어법 선택 후보가 없습니다.",
      });
      continue;
    }

    if (!ctx.cacheHit && accepted.length > 0) {
      const row: StoredGrammarChoiceCacheRow = {
        passageId: ctx.p.projectId,
        sourceHash: ctx.sourceHash,
        grammarAnalysisVersion: ctx.analysisHash,
        grammarChoicePromptVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
        candidates: accepted,
        createdAt: new Date().toISOString(),
      };
      cachesToSave.push({
        projectId: ctx.p.projectId,
        cache: upsertGrammarChoiceCache(ctx.p.grammarChoiceCache, row),
      });
    }

    const seedKey = `${ctx.p.projectId}|${ctx.sourceHash}|${GRAMMAR_CHOICE_PROMPT_VERSION}`;
    const items = buildGrammarChoiceItems(
      mergedSelected,
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
    // preserve source meta on items
    for (let i = 0; i < items.length; i++) {
      const src = mergedSelected[i]!;
      items[i] = {
        ...items[i]!,
        sourceType: src.sourceType,
        analysisPointId: src.analysisPointId ?? null,
        bookTerm: src.bookTerm || items[i]!.bookTerm,
        grammarCategoryName:
          src.grammarCategoryName || items[i]!.grammarCategoryName,
        explanationKo: src.explanationKo || items[i]!.explanationKo,
        incorrectReasonKo:
          src.incorrectReasonKo || items[i]!.incorrectReasonKo,
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

    // Restore check
    let rebuilt = "";
    for (const seg of segments) {
      if (seg.type === "text") rebuilt += seg.text;
      else {
        const it = items.find((x) => x.number === seg.number)!;
        rebuilt += it.correctText;
      }
    }
    const passageRestored = rebuilt === ctx.sourcePassage;

    const includedIds = new Set(
      items
        .map((i) => i.analysisPointId)
        .filter((x): x is string => !!x)
    );
    const corePoints = ctx.points.filter((p) => p.importance === "core");
    const excludedCoreIds = new Set(
      exclusions
        .filter((e) =>
          corePoints.some((p) => p.analysisPointId === e.analysisPointId)
        )
        .map((e) => e.analysisPointId)
    );
    // Convertible core = included in final OR not (yet) excluded for a hard reason
    // Reflection rate: among core points that produced a validated analysis item
    // OR were soft-excluded, 100% of those that remained convertible must be included.
    const coreIncluded = corePoints.filter((p) =>
      includedIds.has(p.analysisPointId)
    ).length;
    const convertibleCoreIds = corePoints.filter(
      (p) =>
        includedIds.has(p.analysisPointId) ||
        !excludedCoreIds.has(p.analysisPointId)
    );
    const missingConvertible = convertibleCoreIds.filter(
      (p) => !includedIds.has(p.analysisPointId)
    ).length;
    const coreReflectionRate =
      coreIncluded + missingConvertible === 0
        ? 1
        : coreIncluded / (coreIncluded + missingConvertible);

    const diagnostics: WorkbookGrammarChoiceDiagnostics = {
      analysisPointCount: ctx.points.length,
      corePointCount: corePoints.length,
      convertibleCount: convertibleCount,
      analysisBasedCount: items.filter((i) => i.sourceType === "analysis_required")
        .length,
      aiSupplementCount: items.filter((i) => i.sourceType !== "analysis_required")
        .length,
      coreReflectionRate,
      exclusions,
      originalMismatchCount,
      bothPossibleCount,
      lexicalExcludedCount,
      finalCount: items.length,
      passageRestored,
      cacheHit: ctx.cacheHit,
      openAiRequestCount: ctx.cacheHit ? 0 : openAiRequestCount > 0 ? 1 : 0,
    };

    console.info("[workbook-grammar-choice]", {
      title: ctx.p.title,
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
      diagnostics,
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
      openAiRequestCount,
    },
  };
}
