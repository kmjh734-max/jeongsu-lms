import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import { AUDITOR_SYSTEM_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import type {
  AuditResult,
  ExactSentence,
  GrammarPointCode,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

export const REVIEWER_OUTPUT_TOKEN_CAP = 4_000;

const AUDIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "candidateId",
          "decision",
          "uniqueInContext",
          "reasonCode",
          "correctedCode",
        ],
        properties: {
          candidateId: { type: "string" },
          decision: { type: "string", enum: ["PASS", "REJECT"] },
          uniqueInContext: { type: "boolean" },
          reasonCode: { type: "string" },
          correctedCode: { type: "string" },
        },
      },
    },
  },
} as const;

export function parseAuditorRawJson(content: string): {
  parsed: unknown;
  results: AuditResult[];
} {
  const parsed = parseModelJson<{ results?: Array<Record<string, unknown>> }>(content);
  const results: AuditResult[] = [];
  for (const row of parsed.results ?? []) {
    const decision = row.decision === "PASS" ? "PASS" : "REJECT";
    const plausible =
      row.plausibleLearnerError === undefined ? decision === "PASS" : row.plausibleLearnerError === true;
    const singleAxis =
      row.singleGrammarAxis === undefined ? decision === "PASS" : row.singleGrammarAxis === true;
    const corrected = String(row.correctedCode ?? row.correctedRuleCode ?? "");
    results.push({
      candidateId: String(row.candidateId ?? ""),
      decision,
      uniqueInContext: row.uniqueInContext === true,
      plausibleLearnerError: plausible,
      singleGrammarAxis: singleAxis,
      rejectionCode: String(row.reasonCode ?? row.rejectionCode ?? "") || undefined,
      correctedRuleCode: corrected ? (corrected as GrammarPointCode) : undefined,
    });
  }
  return { parsed, results };
}

export async function auditRiskyCandidates(input: {
  apiKey: string;
  model: string;
  reasoningEffort: string;
  sentences: ExactSentence[];
  items: ResolvedCandidate[];
}): Promise<{
  results: AuditResult[];
  responseModel: string;
  calls: number;
  rawJson: string[];
  parsed: unknown[];
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  fallback: boolean;
}> {
  if (input.items.length === 0) {
    return {
      results: [],
      responseModel: input.model,
      calls: 0,
      rawJson: [],
      parsed: [],
      latencyMs: 0,
      inputTokens: null,
      outputTokens: null,
      fallback: false,
    };
  }
  const bySentence = new Map(input.sentences.map((s) => [s.sentenceId, s.text]));
  const chunks: ResolvedCandidate[][] = [];
  for (let i = 0; i < input.items.length; i += 40) {
    chunks.push(input.items.slice(i, i + 40));
  }
  const results: AuditResult[] = [];
  const rawJson: string[] = [];
  const parsedRows: unknown[] = [];
  let responseModel = input.model;
  let latencyMs = 0;
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;
  let fallback = false;
  const captureSingleCall = process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT?.trim() === "1";
  const reviewChunks = captureSingleCall ? [input.items] : chunks;
  for (const chunk of reviewChunks) {
    const called = await callGrammarChoiceV2Json({
      stage: "REVIEWER",
      apiKey: input.apiKey,
      model: input.model,
      reasoningEffort: input.reasoningEffort,
      system: AUDITOR_SYSTEM_PROMPT,
      user: JSON.stringify({
        items: chunk.map((item) => ({
          candidateId: item.candidateId,
          sentence: bySentence.get(item.sentenceId) ?? "",
          sourceSpan: item.sourceSpan,
          correctAnswer: item.correctAnswer,
          distractor: item.distractors[0] ?? "",
          pointCode: item.pointCode,
        })),
      }),
      schemaName: "grammar_choice_v2_audit",
      schema: AUDIT_SCHEMA as unknown as Record<string, unknown>,
      maxCompletionTokens: REVIEWER_OUTPUT_TOKEN_CAP,
    });
    responseModel = called.responseModel;
    latencyMs += called.latencyMs;
    inputTokens = (inputTokens ?? 0) + (called.inputTokens ?? 0);
    outputTokens = (outputTokens ?? 0) + (called.outputTokens ?? 0);
    fallback = fallback || called.fallback;
    rawJson.push(called.rawJson);
    const parsed = parseAuditorRawJson(called.content);
    parsedRows.push(parsed.parsed);
    results.push(...parsed.results);
  }
  return {
    results,
    responseModel,
    calls: reviewChunks.length,
    rawJson,
    parsed: parsedRows,
    latencyMs,
    inputTokens,
    outputTokens,
    fallback,
  };
}
