import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  GRAMMAR_CHOICE_GENERATOR_SYSTEM_PROMPT,
  buildGrammarChoiceGeneratorUserPrompt,
} from "@/lib/lesson-materials/grammar-choice-v5-prompts";
import type {
  AnalysisHint,
  GeneratedGrammarCandidate,
  GrammarChoiceCategory,
} from "@/lib/lesson-materials/grammar-choice-v5-types";

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

const CATEGORIES: GrammarChoiceCategory[] = [
  "relative",
  "noun_clause",
  "agreement",
  "voice",
  "tense_aspect",
  "finite_nonfinite",
  "infinitive_gerund",
  "participle",
  "parallelism",
  "complement",
  "conjunction_preposition",
  "special_construction",
  "other",
];

function clamp15(n: unknown, fallback: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(5, Math.max(1, Math.round(v)));
}

export function resolveGrammarGeneratorModel(): string[] {
  const configured =
    process.env.OPENAI_GRAMMAR_GENERATOR_MODEL?.trim() ||
    process.env.OPENAI_MODEL_WORKBOOK?.trim();
  if (configured) return [configured];
  return ["gpt-4o"];
}

export async function callGrammarChoiceGenerator(input: {
  passages: Array<{
    passageId: string;
    title: string;
    sourceText: string;
    sentences: Array<{
      sentenceId: string;
      sentenceIndex: number;
      originalText: string;
    }>;
    analysisHints: AnalysisHint[];
    desiredCandidateCount: number;
  }>;
}): Promise<{
  byPassageId: Map<string, GeneratedGrammarCandidate[]>;
  modelUsed: string;
  responseModel: string;
  reasoningEffort: string;
  openAiRequestCount: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const modelCandidates = resolveGrammarGeneratorModel();
  const userContent = buildGrammarChoiceGeneratorUserPrompt(input);

  const CANDIDATE_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
      "candidateId",
      "passageId",
      "sentenceId",
      "correctText",
      "incorrectText",
      "occurrenceIndex",
      "grammarCategory",
      "bookTerm",
      "grammarStructure",
      "explanationKo",
      "incorrectReasonKo",
      "sourceHintUsed",
      "sourceHintName",
      "learningValue",
      "estimatedDifficulty",
      "confidence",
    ],
    properties: {
      candidateId: { type: "string" },
      passageId: { type: "string" },
      sentenceId: { type: "string" },
      correctText: { type: "string" },
      incorrectText: { type: "string" },
      occurrenceIndex: { type: "integer" },
      grammarCategory: { type: "string", enum: CATEGORIES },
      bookTerm: { type: "string" },
      grammarStructure: { type: "string" },
      explanationKo: { type: "string" },
      incorrectReasonKo: { type: "string" },
      sourceHintUsed: { type: "boolean" },
      sourceHintName: { type: "string" },
      learningValue: { type: "number" },
      estimatedDifficulty: { type: "number" },
      confidence: { type: "number" },
    },
  } as const;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    let bodyText = "";
    let ok = false;
    let modelUsed = modelCandidates[0]!;
    let responseModel = modelCandidates[0]!;
    let reasoningEffort = "none";

    for (const model of modelCandidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let useJsonSchema = true;
      let includeJsonMode = true;
      let includeReasoningEffort = isGpt5FamilyModel(model);

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: GRAMMAR_CHOICE_GENERATOR_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        };
        if (isGpt5FamilyModel(model)) {
          body.max_completion_tokens = 16_000;
          if (includeReasoningEffort) {
            body.reasoning_effort = "medium";
            reasoningEffort = "medium";
          } else {
            reasoningEffort = "none";
          }
        } else {
          body.max_tokens = 16_000;
          reasoningEffort = "none";
        }
        if (includeTemperature && !isGpt5FamilyModel(model)) {
          body.temperature = 0.45;
        }
        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "grammar_choice_generator_v5",
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
        if (ok) {
          modelUsed = model;
          const envelope = parseJsonSafe<{ model?: string }>(bodyText);
          responseModel = String(envelope?.model ?? model);
          break;
        }
        let errMsg = bodyText;
        try {
          errMsg = JSON.stringify(JSON.parse(bodyText));
        } catch {
          /* */
        }
        if (isModelUnavailableError(res.status, errMsg)) break;
        if (isUnsupportedTemperatureError(errMsg) && includeTemperature) {
          includeTemperature = false;
          continue;
        }
        if (
          includeReasoningEffort &&
          isUnsupportedParameterError(errMsg, "reasoning_effort")
        ) {
          includeReasoningEffort = false;
          reasoningEffort = "none";
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
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `어법 후보 생성 실패: ${bodyText.slice(0, 400) || "unknown"}`
      );
    }

    const json = parseJsonSafe<{
      choices?: Array<{
        finish_reason?: string;
        message?: { content?: string };
      }>;
    }>(bodyText);
    const choice0 = json?.choices?.[0];
    if (choice0?.finish_reason === "length") {
      throw new Error(
        "어법 후보 생성이 토큰 한도로 잘렸습니다. 다시 시도해 주세요."
      );
    }
    const content = choice0?.message?.content ?? "";
    const parsed = parseJsonSafe<{
      passages?: Array<{
        passageId?: string;
        candidates?: Array<Record<string, unknown>>;
      }>;
    }>(content);

    const byPassageId = new Map<string, GeneratedGrammarCandidate[]>();
    for (const p of parsed?.passages ?? []) {
      const passageId = String(p.passageId ?? "").trim();
      if (!passageId) continue;
      const list: GeneratedGrammarCandidate[] = [];
      for (const raw of p.candidates ?? []) {
        const grammarCategory = String(
          raw.grammarCategory ?? "other"
        ) as GrammarChoiceCategory;
        if (!CATEGORIES.includes(grammarCategory)) continue;
        const correctText = String(raw.correctText ?? "").trim();
        const incorrectText = String(raw.incorrectText ?? "").trim();
        const sentenceId = String(raw.sentenceId ?? "").trim();
        if (!correctText || !incorrectText || !sentenceId) continue;
        list.push({
          candidateId: String(raw.candidateId ?? `${passageId}-${list.length}`),
          passageId: String(raw.passageId ?? passageId),
          sentenceId,
          correctText,
          incorrectText,
          occurrenceIndex: Math.max(0, Number(raw.occurrenceIndex) || 0),
          grammarCategory,
          bookTerm: String(raw.bookTerm ?? "").trim() || "어법",
          grammarStructure: String(raw.grammarStructure ?? "").trim(),
          explanationKo: String(raw.explanationKo ?? "").trim(),
          incorrectReasonKo: String(raw.incorrectReasonKo ?? "").trim(),
          sourceHintUsed: Boolean(raw.sourceHintUsed),
          sourceHintName:
            raw.sourceHintName == null || raw.sourceHintName === ""
              ? null
              : String(raw.sourceHintName),
          learningValue: clamp15(raw.learningValue, 4),
          estimatedDifficulty: clamp15(raw.estimatedDifficulty, 3),
          confidence: clamp15(raw.confidence, 3),
        });
      }
      byPassageId.set(passageId, list);
    }

    return {
      byPassageId,
      modelUsed,
      responseModel,
      reasoningEffort,
      openAiRequestCount: 1,
    };
  } finally {
    clearTimeout(timer);
  }
}
