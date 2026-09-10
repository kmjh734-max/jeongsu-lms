import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import {
  ANALYZER_SYSTEM_PROMPT,
  buildAnalyzerUserPayload,
} from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import { isKnownPointCode } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  AnalysisHintV2,
  DetectedGrammarPoint,
  ExactSentence,
  GrammarCandidate,
  GrammarPriority,
  GrammarTransformCode,
  LocalMandatoryHint,
  OmissionReason,
  Questionability,
  RiskLevel,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

const PRIORITIES = new Set(["MANDATORY", "CORE", "BASIC"]);
const TRANSFORMS = new Set([
  "FORM_SWAP",
  "NUMBER_SWAP",
  "TENSE_SWAP",
  "VOICE_SWAP",
  "WORD_ORDER",
  "CLAUSE_MARKER",
  "NONFINITE_SWAP",
  "CASE_SWAP",
  "PARALLEL_FORM",
  "CONDITIONAL_FORM",
  "RELATIVE_CHOICE",
  "ADJ_ADV",
]);
const OMISSION_ENUM = [
  "",
  "NO_UNIQUE_DISTRACTOR",
  "OVERLAPPING_HIGHER_PRIORITY_POINT",
  "OVERLAP_WITH_HIGHER_PRIORITY",
  "SOURCE_FORM_NOT_EDITABLE",
  "DUPLICATE_SUBTYPE",
  "NOT_PEDAGOGICALLY_USEFUL",
] as const;

const OMISSIONS = new Set<string>(OMISSION_ENUM.filter(Boolean));
const TRANSFORM_ENUM = [...TRANSFORMS];

/** @deprecated 지문 전체를 한 호출로 보내던 시절의 상한. GENERATOR_CHUNK_OUTPUT_TOKEN_CAP를 쓴다. */
export const GENERATOR_OUTPUT_TOKEN_CAP = 12_000;

const ANALYZER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sentences"],
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sentenceId", "detectedPoints", "candidates"],
        properties: {
          sentenceId: { type: "string" },
          detectedPoints: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "pointCode",
                "sourceSpan",
                "occurrenceIndex",
                "priority",
                "omissionReason",
              ],
              properties: {
                pointCode: { type: "string" },
                sourceSpan: { type: "string" },
                occurrenceIndex: { type: "integer" },
                priority: { type: "string", enum: ["MANDATORY", "CORE", "BASIC"] },
                omissionReason: {
                  type: "string",
                  enum: OMISSION_ENUM,
                },
              },
            },
          },
          candidates: {
            type: "array",
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "pointCode",
                "sourceSpan",
                "occurrenceIndex",
                "correctAnswer",
                "distractor",
                "priority",
                "difficulty",
                "riskLevel",
                "transformCode",
              ],
              properties: {
                pointCode: { type: "string" },
                sourceSpan: { type: "string" },
                occurrenceIndex: { type: "integer" },
                correctAnswer: { type: "string" },
                distractor: { type: "string" },
                transformCode: { type: "string", enum: TRANSFORM_ENUM },
                priority: { type: "string", enum: ["MANDATORY", "CORE", "BASIC"] },
                difficulty: { type: "string", enum: ["BASIC", "CORE", "ADVANCED"] },
                riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
              },
            },
          },
        },
      },
    },
  },
} ;

export type AnalyzerResult = {
  detected: DetectedGrammarPoint[];
  candidates: GrammarCandidate[];
  responseModel: string;
  promptChars: number;
  rawJson: string;
  parsed: unknown;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  fallback: boolean;
};

/**
 * 한 번의 분석 호출에 넣는 문장 수. 지문 전체를 한 호출에 넣으면 모델이 앞쪽
 * 몇 개만 실제로 분석하고 나머지는 만들기 쉬운 축(수일치·시제)으로 때운다.
 * 관측: 11문장 1호출에서 후보 16개 중 2개만 생존(폐기율 87%).
 */
export const ANALYZER_SENTENCES_PER_CALL = 3;

/** 호출당 후보 상한. 작게 유지해야 모델이 목표 개수를 채우려 억지 후보를 만들지 않는다. */
export const ANALYZER_CANDIDATES_PER_CALL = 4;

/** 한 지문 안에서 동시에 띄우는 분석 호출 수. */
export const ANALYZER_CHUNK_CONCURRENCY = 3;

/**
 * 문장 묶음 호출의 출력 상한.
 *
 * GPT-5 계열에서 max_completion_tokens는 reasoning 토큰까지 함께 센다.
 * effort=high는 reasoning이 크게 늘어 5,000에서는 응답이 통째로 잘렸다
 * (관측: 4개 지문 전부 TOKEN_LIMIT). 상한은 천장일 뿐 실제 지출이 아니므로
 * 잘림을 막을 만큼 넉넉히 둔다. 품질은 문장 분할과 candidateCap이 잡는다.
 */
export const GENERATOR_CHUNK_OUTPUT_TOKEN_CAP = 16_000;

type AnalyzerSentenceRow = {
  sentenceId?: string;
  detectedPoints?: Array<Record<string, unknown>>;
  candidates?: Array<Record<string, unknown>>;
};

function chunkSentences(
  sentences: ExactSentence[],
  size: number
): ExactSentence[][] {
  const chunks: ExactSentence[][] = [];
  for (let i = 0; i < sentences.length; i += size) {
    chunks.push(sentences.slice(i, i + size));
  }
  return chunks;
}

export async function analyzeAndGeneratePassage(input: {
  apiKey: string;
  model: string;
  reasoningEffort: string;
  passageId: string;
  sentences: ExactSentence[];
  analysisHints?: AnalysisHintV2[];
  localMandatoryHints?: LocalMandatoryHint[];
  sentencesPerCall?: number;
}): Promise<AnalyzerResult> {
  const perCall = Math.max(1, input.sentencesPerCall ?? ANALYZER_SENTENCES_PER_CALL);
  const chunks = chunkSentences(input.sentences, perCall);
  const started = Date.now();

  const calls = await runWithConcurrency(
    chunks,
    Math.min(ANALYZER_CHUNK_CONCURRENCY, chunks.length || 1),
    async (chunk) => {
      const chunkIds = new Set(chunk.map((s) => s.sentenceId));
      const chunkText = chunk.map((s) => s.text).join(" ");
      const payload = buildAnalyzerUserPayload({
        passageId: input.passageId,
        sentences: chunk,
        // 이 묶음의 문장에 실제로 등장하는 힌트만 남긴다.
        analysisHints: (input.analysisHints ?? []).filter((h) =>
          h.targetText ? chunkText.includes(h.targetText) : false
        ),
        localMandatoryHints: (input.localMandatoryHints ?? []).filter((h) =>
          chunkIds.has(h.sentenceId)
        ),
        candidateCap: ANALYZER_CANDIDATES_PER_CALL,
      });
      const promptChars =
        ANALYZER_SYSTEM_PROMPT.length + JSON.stringify(payload).length;
      const called = await callGrammarChoiceV2Json({
        stage: "GENERATOR",
        apiKey: input.apiKey,
        model: input.model,
        reasoningEffort: input.reasoningEffort,
        system: ANALYZER_SYSTEM_PROMPT,
        user: JSON.stringify(payload),
        schemaName: "grammar_choice_v2_analyze",
        schema: ANALYZER_SCHEMA as unknown as Record<string, unknown>,
        maxCompletionTokens: GENERATOR_CHUNK_OUTPUT_TOKEN_CAP,
      });
      return { called, promptChars };
    }
  );

  /**
   * 묶음 응답을 원래 문장 순서대로 하나의 분석 JSON으로 합친다.
   * rawJson은 replay가 다시 파싱하는 입력이므로, 합친 뒤 한 번만 파싱해야
   * candidateId 번호가 재생 시에도 동일하게 나온다.
   */
  const mergedSentences: AnalyzerSentenceRow[] = [];
  for (const { called } of calls) {
    const chunkParsed = parseModelJson<{ sentences?: AnalyzerSentenceRow[] }>(
      called.content
    );
    mergedSentences.push(...(chunkParsed.sentences ?? []));
  }
  const mergedRawJson = JSON.stringify({ sentences: mergedSentences });
  const parsed = parseAnalyzerRawJson(mergedRawJson, input.passageId);

  const sum = (pick: (row: (typeof calls)[number]) => number | null) =>
    calls.reduce((acc, row) => acc + (pick(row) ?? 0), 0);

  return {
    ...parsed,
    responseModel: calls[0]?.called.responseModel ?? input.model,
    promptChars: sum((row) => row.promptChars),
    rawJson: mergedRawJson,
    // 묶음 호출은 병렬이므로 합이 아니라 실제 경과 시간을 보고한다.
    latencyMs: Date.now() - started,
    inputTokens: calls.length ? sum((row) => row.called.inputTokens) : null,
    outputTokens: calls.length ? sum((row) => row.called.outputTokens) : null,
    fallback: calls.some((row) => row.called.fallback),
  };
}

export function parseAnalyzerRawJson(content: string, passageId: string): {
  detected: DetectedGrammarPoint[];
  candidates: GrammarCandidate[];
  parsed: unknown;
} {
  const parsed = parseModelJson<{
    sentences?: Array<{
      sentenceId?: string;
      detectedPoints?: Array<Record<string, unknown>>;
      candidates?: Array<Record<string, unknown>>;
    }>;
  }>(content);

  const detected: DetectedGrammarPoint[] = [];
  const candidates: GrammarCandidate[] = [];
  let n = 0;
  for (const row of parsed.sentences ?? []) {
    const sentenceId = String(row.sentenceId ?? "");
    for (const point of row.detectedPoints ?? []) {
      const code = String(point.pointCode ?? "");
      if (!isKnownPointCode(code)) continue;
      const omission = String(point.omissionReason ?? "");
      detected.push({
        sentenceId,
        pointCode: code,
        sourceSpan: String(point.sourceSpan ?? ""),
        occurrenceIndex: Number(point.occurrenceIndex ?? 0) || 0,
        priority: (PRIORITIES.has(String(point.priority))
          ? point.priority
          : "CORE") as GrammarPriority,
        questionability: (["SAFE", "RISKY", "NOT_SUITABLE"].includes(
          String(point.questionability)
        )
          ? point.questionability
          : "RISKY") as Questionability,
        evidence: String(point.evidence ?? "").slice(0, 240),
        omissionReason: OMISSIONS.has(omission)
          ? (omission as OmissionReason)
          : undefined,
      });
    }
    for (const cand of row.candidates ?? []) {
      const code = String(cand.pointCode ?? "");
      if (!isKnownPointCode(code)) continue;
      const distractors = Array.isArray(cand.distractors)
        ? cand.distractors.map((d) => String(d)).filter(Boolean).slice(0, 2)
        : cand.distractor
          ? [String(cand.distractor)]
          : [];
      if (!distractors.length) continue;
      n += 1;
      candidates.push({
        candidateId: `${passageId}-${sentenceId}-${n}`,
        sentenceId,
        pointCode: code,
        sourceSpan: String(cand.sourceSpan ?? ""),
        occurrenceIndex: Number(cand.occurrenceIndex ?? 0) || 0,
        correctAnswer: String(cand.correctAnswer ?? ""),
        distractors,
        transformCode: (TRANSFORMS.has(String(cand.transformCode))
          ? cand.transformCode
          : "FORM_SWAP") as GrammarTransformCode,
        priority: (PRIORITIES.has(String(cand.priority))
          ? cand.priority
          : "CORE") as GrammarPriority,
        difficulty: (["BASIC", "CORE", "ADVANCED"].includes(
          String(cand.difficulty)
        )
          ? cand.difficulty
          : "CORE") as GrammarCandidate["difficulty"],
        evidence: String(cand.evidence ?? "").slice(0, 240),
        ruleSummaryKo: String(cand.ruleSummaryKo ?? "").slice(0, 180),
        riskLevel: (["LOW", "MEDIUM", "HIGH"].includes(String(cand.riskLevel))
          ? cand.riskLevel
          : "MEDIUM") as RiskLevel,
      });
    }
  }
  return { detected, candidates, parsed };
}
