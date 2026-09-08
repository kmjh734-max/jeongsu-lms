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
const OMISSIONS = new Set([
  "NO_UNIQUE_DISTRACTOR",
  "OVERLAPPING_HIGHER_PRIORITY_POINT",
  "OVERLAP_WITH_HIGHER_PRIORITY",
  "SOURCE_FORM_NOT_EDITABLE",
  "DUPLICATE_SUBTYPE",
  "NOT_PEDAGOGICALLY_USEFUL",
]);

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
                "questionability",
                "evidence",
                "omissionReason",
              ],
              properties: {
                pointCode: { type: "string" },
                sourceSpan: { type: "string" },
                occurrenceIndex: { type: "integer" },
                priority: { type: "string" },
                questionability: { type: "string" },
                evidence: { type: "string" },
                omissionReason: { type: "string" },
              },
            },
          },
          candidates: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "pointCode",
                "sourceSpan",
                "occurrenceIndex",
                "correctAnswer",
                "distractors",
                "transformCode",
                "priority",
                "difficulty",
                "evidence",
                "ruleSummaryKo",
                "riskLevel",
              ],
              properties: {
                pointCode: { type: "string" },
                sourceSpan: { type: "string" },
                occurrenceIndex: { type: "integer" },
                correctAnswer: { type: "string" },
                distractors: {
                  type: "array",
                  items: { type: "string" },
                },
                transformCode: { type: "string" },
                priority: { type: "string" },
                difficulty: { type: "string" },
                evidence: { type: "string" },
                ruleSummaryKo: { type: "string" },
                riskLevel: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export type AnalyzerResult = {
  detected: DetectedGrammarPoint[];
  candidates: GrammarCandidate[];
  responseModel: string;
  promptChars: number;
};

export async function analyzeAndGeneratePassage(input: {
  apiKey: string;
  model: string;
  reasoningEffort: string;
  passageId: string;
  sentences: ExactSentence[];
  analysisHints?: AnalysisHintV2[];
  localMandatoryHints?: LocalMandatoryHint[];
}): Promise<AnalyzerResult> {
  const payload = buildAnalyzerUserPayload({
    passageId: input.passageId,
    sentences: input.sentences,
    analysisHints: input.analysisHints,
    localMandatoryHints: input.localMandatoryHints,
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
  });
  const parsed = parseModelJson<{
    sentences?: Array<{
      sentenceId?: string;
      detectedPoints?: Array<Record<string, unknown>>;
      candidates?: Array<Record<string, unknown>>;
    }>;
  }>(called.content);

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
        : [];
      if (!distractors.length) continue;
      n += 1;
      candidates.push({
        candidateId: `${input.passageId}-${sentenceId}-${n}`,
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
  return {
    detected,
    candidates,
    responseModel: called.responseModel,
    promptChars,
  };
}
