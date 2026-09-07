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
} from "@/lib/lesson-materials/workbook-grammar-choice-prompt";
import {
  computeGrammarAnalysisVersion,
  getCachedGrammarChoiceCandidates,
  hashEnglishLines,
  upsertGrammarChoiceCache,
  type StoredGrammarChoiceCache,
  type StoredGrammarChoiceCacheRow,
} from "@/lib/lesson-materials/grammar-choice-cache";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "@/lib/lesson-materials/grammar-choice-constants";
import {
  validateAndFilterCandidates,
} from "@/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "@/lib/lesson-materials/grammar-choice-select";
import {
  buildGrammarChoiceItems,
  buildPassageSegments,
} from "@/lib/lesson-materials/grammar-choice-display";
import { repairCandidateAgainstPassage } from "@/lib/lesson-materials/grammar-choice-repair";
import { buildHeuristicGrammarCandidates } from "@/lib/lesson-materials/grammar-choice-fallback";
import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import {
  countEnglishWords,
  formatWorkbookPassage,
  getGrammarChoiceTargetRange,
  joinWorkbookPassageLines,
  type GrammarChoiceCandidate,
  type WorkbookGenerationTiming,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
} from "@/lib/lesson-materials/workbook-types";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { formatCheonilmunClassification } from "@/lib/lesson-materials/cheonilmun-basic-taxonomy";

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

function normalizeCandidate(
  raw: Record<string, unknown>,
  passageId: string
): GrammarChoiceCandidate | null {
  const choiceId = String(raw.choiceId ?? "").trim();
  const sentenceId = String(raw.sentenceId ?? "").trim();
  const originalText = String(raw.originalText ?? "").trim();
  const correctText = String(raw.correctText ?? "").trim();
  const incorrectText = String(raw.incorrectText ?? "").trim();
  if (!choiceId || !sentenceId || !originalText || !correctText || !incorrectText) {
    return null;
  }
  const ambiguityRisk = String(raw.ambiguityRisk ?? "high");
  if (
    ambiguityRisk !== "low" &&
    ambiguityRisk !== "medium" &&
    ambiguityRisk !== "high"
  ) {
    return null;
  }
  return {
    choiceId,
    passageId,
    sentenceId,
    startTokenIndex: Number(raw.startTokenIndex),
    endTokenIndex: Number(raw.endTokenIndex),
    originalText,
    correctText,
    incorrectText,
    grammarCategoryId: String(raw.grammarCategoryId ?? "").trim(),
    grammarCategoryName: String(raw.grammarCategoryName ?? "").trim(),
    bookTerm: String(raw.bookTerm ?? "").trim(),
    explanationKo: String(raw.explanationKo ?? "").trim(),
    incorrectReasonKo: String(raw.incorrectReasonKo ?? "").trim(),
    difficulty: clampScore(raw.difficulty, 3),
    learningValue: clampScore(raw.learningValue, 3),
    ambiguityRisk,
  };
}

const CANDIDATE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "choiceId",
    "sentenceId",
    "startTokenIndex",
    "endTokenIndex",
    "originalText",
    "correctText",
    "incorrectText",
    "grammarCategoryId",
    "grammarCategoryName",
    "bookTerm",
    "explanationKo",
    "incorrectReasonKo",
    "difficulty",
    "learningValue",
    "ambiguityRisk",
  ],
  properties: {
    choiceId: { type: "string" },
    sentenceId: { type: "string" },
    startTokenIndex: { type: "integer" },
    endTokenIndex: { type: "integer" },
    originalText: { type: "string" },
    correctText: { type: "string" },
    incorrectText: { type: "string" },
    grammarCategoryId: { type: "string" },
    grammarCategoryName: { type: "string" },
    bookTerm: { type: "string" },
    explanationKo: { type: "string" },
    incorrectReasonKo: { type: "string" },
    difficulty: { type: "integer" },
    learningValue: { type: "integer" },
    ambiguityRisk: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
  },
} as const;

export async function callGrammarChoiceOpenAI(input: {
  passages: Array<{
    passageId: string;
    title?: string;
    source?: string | null;
    softTargetMin: number;
    softTargetMax: number;
    sentences: Array<{
      sentenceId: string;
      order: number;
      english: string;
      tokenCount: number;
      tokens: string[];
    }>;
    existingGrammarPoints?: Array<{
      sentenceId: string;
      title: string;
      detail?: string;
      example?: string;
      bookTerm?: string;
      unitLabel?: string;
    }>;
  }>;
}): Promise<{
  byPassageId: Map<string, GrammarChoiceCandidate[]>;
  openAiRequestCount: number;
}> {
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
          max_tokens: 8_192,
        };
        if (includeTemperature && !isGpt5FamilyModel(model)) {
          body.temperature = 0.2;
        }
        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "grammar_choice_candidates",
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
                      required: ["passageId", "candidates"],
                      properties: {
                        passageId: { type: "string" },
                        candidates: {
                          type: "array",
                          items: CANDIDATE_SCHEMA,
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
        candidates?: Array<Record<string, unknown>>;
      }>;
    }>(content);

    const byPassageId = new Map<string, GrammarChoiceCandidate[]>();
    for (const p of parsed?.passages ?? []) {
      const passageId = String(p.passageId ?? "").trim();
      if (!passageId) continue;
      const list: GrammarChoiceCandidate[] = [];
      for (const raw of p.candidates ?? []) {
        const c = normalizeCandidate(raw, passageId);
        if (c) list.push(c);
      }
      byPassageId.set(passageId, list);
    }
    return { byPassageId, openAiRequestCount: 1 };
  } finally {
    clearTimeout(timer);
  }
}

function extractGrammarPointsFromReport(
  report: AnalysisReportData | null | undefined
): Array<{
  sentenceId: string;
  title: string;
  detail?: string;
  example?: string;
  bookTerm?: string;
  unitLabel?: string;
}> {
  if (!report?.sentences?.length) return [];
  const out: Array<{
    sentenceId: string;
    title: string;
    detail?: string;
    example?: string;
    bookTerm?: string;
    unitLabel?: string;
  }> = [];
  for (const s of report.sentences) {
    for (const g of s.grammarPoints ?? []) {
      const bookTerm =
        g.bookTerms?.[0] ||
        g.primaryClassification?.unitTitle ||
        g.title;
      out.push({
        sentenceId: s.itemId,
        title: g.title,
        detail: g.detail,
        example: g.example,
        bookTerm,
        unitLabel: g.primaryClassification
          ? formatCheonilmunClassification(g.primaryClassification)
          : g.classificationLabel,
      });
    }
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
  debug?: {
    acceptedCounts: Record<string, number>;
    selectedCounts: Record<string, number>;
    rejected: Array<{ passageId: string; reason: string; choiceId: string }>;
  };
}> {
  const t0 = Date.now();
  const sections: WorkbookGrammarChoiceSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  const cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceCache;
  }> = [];
  let openAiRequestCount = 0;
  const needAi: typeof input.passages = [];
  const cachedResults = new Map<string, GrammarChoiceCandidate[]>();
  const analysisVersions = new Map<string, string>();
  const sourceHashes = new Map<string, string>();
  const rejectedAll: Array<{
    passageId: string;
    reason: string;
    choiceId: string;
  }> = [];
  const acceptedCounts: Record<string, number> = {};
  const selectedCounts: Record<string, number> = {};

  for (const p of input.passages) {
    const lines = p.sentences.map((s) => s.english);
    const sourceHash = hashEnglishLines(lines);
    sourceHashes.set(p.projectId, sourceHash);
    const points = extractGrammarPointsFromReport(p.analysisReport);
    const analysisVersion = computeGrammarAnalysisVersion(points);
    analysisVersions.set(p.projectId, analysisVersion);
    const cached = getCachedGrammarChoiceCandidates(
      p.grammarChoiceCache,
      p.projectId,
      sourceHash,
      analysisVersion
    );
    if (cached) {
      cachedResults.set(p.projectId, cached);
    } else {
      needAi.push(p);
    }
  }

    let aiByPassage = new Map<string, GrammarChoiceCandidate[]>();
    if (needAi.length > 0) {
      const promptPassages = needAi.map((p) => {
        const english = joinWorkbookPassageLines(
          p.sentences.map((s) => s.english)
        );
        const wc = countEnglishWords(english);
        const range = getGrammarChoiceTargetRange(wc);
        const points = extractGrammarPointsFromReport(p.analysisReport);
        return {
          passageId: p.projectId,
          title: p.title,
          source: p.source,
          softTargetMin: range.min,
          softTargetMax: range.max,
          sentences: p.sentences.map((s, i) => {
            const tokens = tokenizeForWordOrder(s.english).map((t) => t.surface);
            return {
              sentenceId: s.id,
              order: i + 1,
              english: formatWorkbookPassage(s.english),
              tokenCount: tokens.length,
              tokens,
            };
          }),
          existingGrammarPoints: points,
        };
      });
      try {
        const ai = await callGrammarChoiceOpenAI({ passages: promptPassages });
        openAiRequestCount += ai.openAiRequestCount;
        aiByPassage = ai.byPassageId;
      } catch (err) {
        console.warn(
          "[workbook-grammar-choice] OpenAI failed; using heuristics",
          err instanceof Error ? err.message : err
        );
      }
    }

  for (const p of input.passages) {
    const sentenceRows = p.sentences.map((s) => ({
      id: s.id,
      english: formatWorkbookPassage(s.english),
    }));
    const sentenceMap = new Map(
      sentenceRows.map((s) => [s.id, s.english] as const)
    );
    const sourceHash = sourceHashes.get(p.projectId)!;
    const analysisVersion = analysisVersions.get(p.projectId)!;
    const raw =
      cachedResults.get(p.projectId) ??
      aiByPassage.get(p.projectId) ??
      [];

    const repaired: GrammarChoiceCandidate[] = [];
    for (const c of raw) {
      const fixed = repairCandidateAgainstPassage(c, sentenceRows);
      if (fixed) repaired.push(fixed);
      else {
        rejectedAll.push({
          passageId: p.projectId,
          reason: "repair_failed",
          choiceId: c.choiceId,
        });
      }
    }

    const firstPass = validateAndFilterCandidates(repaired, sentenceMap);
    let accepted = firstPass.accepted;
    for (const r of firstPass.rejected) {
      rejectedAll.push({
        passageId: p.projectId,
        reason: r.reason,
        choiceId: r.candidate.choiceId,
      });
    }

    // Deterministic heuristics fill gaps when AI/cache yields too few
    const english = joinWorkbookPassageLines(
      p.sentences.map((s) => s.english)
    );
    const range = getGrammarChoiceTargetRange(countEnglishWords(english));
    if (accepted.length < range.min) {
      const heuristics = buildHeuristicGrammarCandidates({
        passageId: p.projectId,
        sentences: sentenceRows,
      });
      const merged = [...accepted];
      const occupied = accepted.map((c) => ({
        sentenceId: c.sentenceId,
        start: c.startTokenIndex,
        end: c.endTokenIndex,
      }));
      const { accepted: more, rejected: moreRejected } =
        validateAndFilterCandidates(heuristics, sentenceMap);
      for (const r of moreRejected) {
        rejectedAll.push({
          passageId: p.projectId,
          reason: `heur:${r.reason}`,
          choiceId: r.candidate.choiceId,
        });
      }
      for (const c of more) {
        const overlaps = occupied.some(
          (o) =>
            o.sentenceId === c.sentenceId &&
            !(c.endTokenIndex < o.start || c.startTokenIndex > o.end)
        );
        if (overlaps) continue;
        if (merged.some((m) => m.choiceId === c.choiceId)) continue;
        merged.push(c);
        occupied.push({
          sentenceId: c.sentenceId,
          start: c.startTokenIndex,
          end: c.endTokenIndex,
        });
      }
      accepted = merged;
    }

    acceptedCounts[p.projectId] = accepted.length;

    console.info("[workbook-grammar-choice]", {
      passageId: p.projectId,
      title: p.title,
      raw: raw.length,
      repaired: repaired.length,
      accepted: accepted.length,
      rejectedSample: rejectedAll
        .filter((r) => r.passageId === p.projectId)
        .slice(0, 8),
    });

    // Cache validated candidates (not only final selection) so re-runs are stable
    if (!cachedResults.has(p.projectId) && accepted.length > 0) {
      const row: StoredGrammarChoiceCacheRow = {
        passageId: p.projectId,
        sourceHash,
        grammarAnalysisVersion: analysisVersion,
        grammarChoicePromptVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
        candidates: accepted,
        createdAt: new Date().toISOString(),
      };
      const next = upsertGrammarChoiceCache(p.grammarChoiceCache, row);
      cachesToSave.push({ projectId: p.projectId, cache: next });
    }

    const selected = selectFinalGrammarChoices(accepted, range.max);
    selectedCounts[p.projectId] = selected.length;

    if (selected.length === 0) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: "검증을 통과한 어법 선택 후보가 없습니다.",
      });
      continue;
    }

    // Sort by sentence order in passage
    const orderIndex = new Map(p.sentences.map((s, i) => [s.id, i]));
    selected.sort((a, b) => {
      const oa = orderIndex.get(a.sentenceId) ?? 0;
      const ob = orderIndex.get(b.sentenceId) ?? 0;
      if (oa !== ob) return oa - ob;
      return a.startTokenIndex - b.startTokenIndex;
    });

    const seedKey = `${p.projectId}|${sourceHash}|${GRAMMAR_CHOICE_PROMPT_VERSION}`;
    const items = buildGrammarChoiceItems(selected, seedKey);
    const segments = buildPassageSegments(sentenceRows, items);

    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source,
      sourcePassage: formatWorkbookPassage(english),
      segments,
      items,
      algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
    });
  }

  const totalMs = Date.now() - t0;
  return {
    sections,
    skipped,
    cachesToSave,
    timing: {
      dataLoadMs: 0,
      translationLookupMs: 0,
      blankSelectionMs: totalMs,
      pdfRenderMs: 0,
      totalMs,
      openAiRequestCount,
    },
    debug: {
      acceptedCounts,
      selectedCounts,
      rejected: rejectedAll,
    },
  };
}
