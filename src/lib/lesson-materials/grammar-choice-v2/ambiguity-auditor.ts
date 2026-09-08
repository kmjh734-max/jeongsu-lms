import { callGrammarChoiceV2Json, parseModelJson } from "@/lib/lesson-materials/grammar-choice-v2/openai-call";
import { AUDITOR_SYSTEM_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import type {
  AuditResult,
  ExactSentence,
  GrammarPointCode,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

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
          "plausibleLearnerError",
          "singleGrammarAxis",
          "rejectionCode",
          "correctedRuleCode",
        ],
        properties: {
          candidateId: { type: "string" },
          decision: { type: "string" },
          uniqueInContext: { type: "boolean" },
          plausibleLearnerError: { type: "boolean" },
          singleGrammarAxis: { type: "boolean" },
          rejectionCode: { type: "string" },
          correctedRuleCode: { type: "string" },
        },
      },
    },
  },
} as const;

export async function auditRiskyCandidates(input: {
  apiKey: string;
  model: string;
  reasoningEffort: string;
  sentences: ExactSentence[];
  items: ResolvedCandidate[];
}): Promise<{ results: AuditResult[]; responseModel: string; calls: number }> {
  if (input.items.length === 0) {
    return { results: [], responseModel: input.model, calls: 0 };
  }
  const bySentence = new Map(input.sentences.map((s) => [s.sentenceId, s.text]));
  const chunks: ResolvedCandidate[][] = [];
  for (let i = 0; i < input.items.length; i += 40) {
    chunks.push(input.items.slice(i, i + 40));
  }
  const results: AuditResult[] = [];
  let responseModel = input.model;
  for (const chunk of chunks) {
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
          ruleSummaryKo: item.ruleSummaryKo,
        })),
      }),
      schemaName: "grammar_choice_v2_audit",
      schema: AUDIT_SCHEMA as unknown as Record<string, unknown>,
    });
    responseModel = called.responseModel;
    const parsed = parseModelJson<{ results?: Array<Record<string, unknown>> }>(
      called.content
    );
    for (const row of parsed.results ?? []) {
      results.push({
        candidateId: String(row.candidateId ?? ""),
        decision: row.decision === "PASS" ? "PASS" : "REJECT",
        uniqueInContext: row.uniqueInContext === true,
        plausibleLearnerError: row.plausibleLearnerError === true,
        singleGrammarAxis: row.singleGrammarAxis === true,
        rejectionCode: String(row.rejectionCode ?? "") || undefined,
        correctedRuleCode: String(row.correctedRuleCode ?? "")
          ? (String(row.correctedRuleCode) as GrammarPointCode)
          : undefined,
      });
    }
  }
  return { results, responseModel, calls: chunks.length };
}
