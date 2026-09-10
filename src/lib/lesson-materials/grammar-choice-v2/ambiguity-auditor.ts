import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { chunkByGroup } from "@/lib/lesson-materials/grammar-choice-v2/chunk-by-group";
import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import { AUDITOR_SYSTEM_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import type {
  AuditResult,
  ExactSentence,
  GrammarPointCode,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

/**
 * 검수 출력은 항목 수에 비례한다. 실측(live-2026-09-09/reviewer.json)에서
 * 8항목 호출이 출력 1,557토큰을 썼다 = 항목당 약 195토큰.
 * 예전에는 항목 수와 무관하게 4,000 고정이었고 한 호출에 40항목을 넣었다.
 * 40 x 195 = 7,800토큰이라 지문을 여러 개 돌리면 응답이 반드시 잘렸고,
 * finish_reason=length는 TOKEN_LIMIT 예외로 올라가 검수 전체가 죽었다.
 * 지문 하나만 돌릴 때는 항목이 20개 미만이라 이 한계에 안 걸렸다.
 * 그래서 "여러 지문을 같이 돌리면 결과가 나빠지는" 현상이 생겼다.
 */
export const AUDIT_OUTPUT_TOKENS_PER_ITEM = 320;
export const AUDIT_OUTPUT_TOKEN_FLOOR = 1_200;

/** 한 검수 호출에 넣는 항목 수. 실측이 건강했던 묶음 크기에 맞춘다. */
export const AUDIT_ITEMS_PER_CALL = 8;

/** 검수 묶음 동시 실행 수. 예전에는 직렬이라 지문 수에 비례해 느려졌다. */
export const AUDIT_CONCURRENCY = 6;

export function auditOutputTokenCap(itemCount: number): number {
  return Math.min(
    12_000,
    Math.max(AUDIT_OUTPUT_TOKEN_FLOOR, itemCount * AUDIT_OUTPUT_TOKENS_PER_ITEM)
  );
}

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
  /** 묶음이 지문 경계를 넘지 않게 하는 키. 없으면 전부 한 덩어리로 본다. */
  groupKeyOf?: (item: ResolvedCandidate) => string;
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
  failures: string[];
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
      failures: [],
    };
  }
  const bySentence = new Map(input.sentences.map((s) => [s.sentenceId, s.text]));
  const chunks = chunkByGroup(
    input.items,
    AUDIT_ITEMS_PER_CALL,
    input.groupKeyOf ?? (() => "all")
  );
  const captureSingleCall = process.env.GRAMMAR_CHOICE_V2_CAPTURE_SNAPSHOT?.trim() === "1";
  const reviewChunks = captureSingleCall ? [input.items] : chunks;

  const started = Date.now();
  /**
   * 묶음 하나가 실패해도 나머지 묶음의 판정은 살린다.
   * 판정이 없는 항목은 applyAudits에서 통과가 아니라 탈락으로 처리되므로,
   * 실패를 삼켜도 나쁜 문항이 통과하는 방향으로는 새지 않는다.
   */
  const calls = await runWithConcurrency(
    reviewChunks,
    Math.min(AUDIT_CONCURRENCY, reviewChunks.length),
    async (chunk) => {
      try {
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
          maxCompletionTokens: auditOutputTokenCap(chunk.length),
        });
        return { called, error: null as Error | null };
      } catch (error) {
        return { called: null, error: error as Error };
      }
    }
  );

  const results: AuditResult[] = [];
  const rawJson: string[] = [];
  const parsedRows: unknown[] = [];
  let responseModel = input.model;
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;
  let fallback = false;
  const failures: string[] = [];

  for (const row of calls) {
    if (!row.called) {
      failures.push(row.error?.message ?? "unknown");
      continue;
    }
    const called = row.called;
    responseModel = called.responseModel;
    inputTokens = (inputTokens ?? 0) + (called.inputTokens ?? 0);
    outputTokens = (outputTokens ?? 0) + (called.outputTokens ?? 0);
    fallback = fallback || called.fallback;
    rawJson.push(called.rawJson);
    try {
      const parsed = parseAuditorRawJson(called.content);
      parsedRows.push(parsed.parsed);
      results.push(...parsed.results);
    } catch (error) {
      failures.push((error as Error).message);
    }
  }

  return {
    results,
    responseModel,
    calls: reviewChunks.length,
    rawJson,
    parsed: parsedRows,
    // 묶음 호출은 병렬이므로 합이 아니라 실제 경과 시간을 보고한다.
    latencyMs: Date.now() - started,
    inputTokens,
    outputTokens,
    fallback,
    failures,
  };
}
