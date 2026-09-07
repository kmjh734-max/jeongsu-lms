import { createHash } from "node:crypto";
import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import { findTargetInSentence } from "@/lib/lesson-materials/grammar-blueprint-sentences";
import {
  guessIncorrectFromContrast,
  inferContrastType,
} from "@/lib/lesson-materials/grammar-blueprint-contrast";
import { emptyBlueprintSentence } from "@/lib/lesson-materials/grammar-blueprint-from-analysis";
import type {
  GrammarBlueprintPoint,
  GrammarBlueprintSentence,
  GrammarContrastType,
  GrammarPointExclusionReason,
  PassageSentenceSpan,
} from "@/lib/lesson-materials/grammar-blueprint-types";

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

const CONTRAST_ENUM = [
  "RELATIVE_PRONOUN",
  "NOUN_CLAUSE_CONNECTOR",
  "SUBJECT_VERB_AGREEMENT",
  "ACTIVE_PASSIVE",
  "TENSE_ASPECT",
  "FINITE_NONFINITE",
  "INFINITIVE_GERUND",
  "PARTICIPLE_VOICE",
  "PREPOSITION_GERUND",
  "HOW_TO_INFINITIVE",
  "PARALLEL_FORM",
  "ALLOW_OBJECT_TO_INF",
  "HELP_OBJECT_BARE_INF",
  "BE_MADE_TO_INF",
  "BE_MEANT_TO_INF",
  "CONJUNCTION_PREPOSITION",
  "DUMMY_IT",
  "COMPARISON",
  "INVERSION",
  "SUBJUNCTIVE",
  "OTHER",
] as const;

const SYSTEM = `너는 고등학교 영어 문법 분석가다.
역할: 선택지를 만들지 말고, 각 문장의 문법 포인트를 빠짐없이 수집한다.
규칙:
1. 입력된 모든 sentenceId에 대해 정확히 하나의 sentenceAnalysis를 반환한다.
2. 단순한 문장도 누락하지 않는다. 출제 가치가 없으면 grammarPoints를 빈 배열로 두고 noTestablePointReason을 채운다.
3. targetText는 해당 문장 originalText의 정확한 부분 문자열이어야 한다.
4. 문제 개수를 맞추려고 낮은 가치의 is/are 문제를 만들지 않는다.
5. 어휘·숙어·철자만의 포인트는 LEXICAL_ONLY 또는 SPELLING_ONLY로 제외한다.
6. convertibleToChoice=true는 명확한 2지선다가 가능할 때만.
JSON Schema만 출력한다.`;

type AiSentence = {
  sentenceId: string;
  structureSummary?: string;
  sentencePattern?: string;
  noTestablePointReason?: string;
  grammarPoints?: Array<Record<string, unknown>>;
};

export async function callGrammarBlueprintOpenAI(input: {
  passages: Array<{
    passageId: string;
    sourceText: string;
    sentences: PassageSentenceSpan[];
  }>;
}): Promise<{
  byPassageId: Map<string, GrammarBlueprintSentence[]>;
  openAiRequestCount: number;
  modelUsed: string | null;
}> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const configured = process.env.OPENAI_MODEL_WORKBOOK?.trim();
  const modelCandidates = configured
    ? [configured]
    : ["gpt-4o-mini", "gpt-4o"];

  const userContent = JSON.stringify(
    {
      task: "BUILD_COMPLETE_GRAMMAR_BLUEPRINT",
      passages: input.passages.map((p) => ({
        passageId: p.passageId,
        sourceText: p.sourceText,
        sentences: p.sentences.map((s) => ({
          sentenceId: s.sentenceId,
          sentenceIndex: s.sentenceIndex,
          originalText: s.originalText,
          startCharIndex: s.startCharIndex,
          endCharIndex: s.endCharIndex,
        })),
      })),
    },
    null,
    2
  );

  const POINT_PROPS = {
    type: "object",
    additionalProperties: false,
    required: [
      "targetText",
      "grammarCategoryName",
      "bookTerm",
      "structure",
      "explanationKo",
      "importance",
      "testWorthiness",
      "convertibleToChoice",
      "conversionReason",
      "exclusionReason",
      "contrastType",
    ],
    properties: {
      targetText: { type: "string" },
      grammarCategoryName: { type: "string" },
      bookTerm: { type: "string" },
      structure: { type: "string" },
      explanationKo: { type: "string" },
      importance: { type: "string", enum: ["high", "medium", "low"] },
      testWorthiness: { type: "number" },
      convertibleToChoice: { type: "boolean" },
      conversionReason: { type: "string" },
      exclusionReason: {
        type: "string",
        enum: [
          "NONE",
          "NO_EXACT_SOURCE_SPAN",
          "BOTH_OPTIONS_POSSIBLE",
          "LEXICAL_ONLY",
          "SPELLING_ONLY",
          "PUNCTUATION_ONLY",
          "CANNOT_CREATE_MINIMAL_PAIR",
          "OVERLAPPING_WITH_HIGHER_PRIORITY",
          "DUPLICATE_GRAMMAR_POINT",
          "TOO_TRIVIAL",
        ],
      },
      contrastType: { type: "string", enum: [...CONTRAST_ENUM] },
    },
  } as const;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    let bodyText = "";
    let ok = false;
    let modelUsed: string | null = null;

    for (const model of modelCandidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let useJsonSchema = true;
      let includeJsonMode = true;

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userContent },
          ],
          max_tokens: 12_000,
        };
        if (includeTemperature && !isGpt5FamilyModel(model)) {
          body.temperature = 0.2;
        }
        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "grammar_blueprint_v1",
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
                      required: ["passageId", "sentenceAnalyses"],
                      properties: {
                        passageId: { type: "string" },
                        sentenceAnalyses: {
                          type: "array",
                          items: {
                            type: "object",
                            additionalProperties: false,
                            required: [
                              "sentenceId",
                              "structureSummary",
                              "sentencePattern",
                              "noTestablePointReason",
                              "grammarPoints",
                            ],
                            properties: {
                              sentenceId: { type: "string" },
                              structureSummary: { type: "string" },
                              sentencePattern: { type: "string" },
                              noTestablePointReason: {
                                type: "string",
                                enum: [
                                  "NONE",
                                  "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT",
                                  "ONLY_LEXICAL_FEATURE",
                                  "ONLY_AMBIGUOUS_CONTRAST",
                                  "DUPLICATE_OF_STRONGER_POINT",
                                ],
                              },
                              grammarPoints: {
                                type: "array",
                                items: POINT_PROPS,
                              },
                            },
                          },
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
          break;
        }
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
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `GrammarBlueprint 생성 실패: ${bodyText.slice(0, 400) || "unknown"}`
      );
    }

    const json = parseJsonSafe<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(bodyText);
    const content = json?.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonSafe<{
      passages?: Array<{
        passageId?: string;
        sentenceAnalyses?: AiSentence[];
      }>;
    }>(content);

    const byPassageId = new Map<string, GrammarBlueprintSentence[]>();

    for (const p of input.passages) {
      const aiPassage = parsed?.passages?.find(
        (x) => String(x.passageId) === p.passageId
      );
      const aiById = new Map(
        (aiPassage?.sentenceAnalyses ?? []).map(
          (s) => [String(s.sentenceId), s] as const
        )
      );

      const inputIds = p.sentences.map((s) => s.sentenceId).sort();
      const returnedIds = [...aiById.keys()].sort();
      const missing = inputIds.filter((id) => !aiById.has(id));
      if (missing.length > 0) {
        throw new Error(
          `Blueprint 문장 누락: passage=${p.passageId} missing=${missing.join(",")}`
        );
      }
      // equality check required by spec
      if (returnedIds.join("|") !== inputIds.join("|") && missing.length === 0) {
        // allow extras? reject extras by filtering to input only
      }

      const sentences: GrammarBlueprintSentence[] = p.sentences.map((span) => {
        const ai = aiById.get(span.sentenceId);
        if (!ai) return emptyBlueprintSentence(span);
        const points: GrammarBlueprintPoint[] = [];
        (ai.grammarPoints ?? []).forEach((raw, index) => {
          const targetText = String(raw.targetText ?? "").trim();
          if (!targetText) return;
          const located = findTargetInSentence(span.originalText, targetText);
          const contrastType = (CONTRAST_ENUM.includes(
            String(raw.contrastType) as GrammarContrastType
          )
            ? String(raw.contrastType)
            : inferContrastType(
                String(raw.grammarCategoryName ?? ""),
                String(raw.bookTerm ?? ""),
                targetText
              )) as GrammarContrastType;

          let exclusionReason = String(
            raw.exclusionReason ?? "NONE"
          ) as GrammarPointExclusionReason;
          let convertible = Boolean(raw.convertibleToChoice);
          if (!located) {
            exclusionReason = "NO_EXACT_SOURCE_SPAN";
            convertible = false;
          } else {
            const incorrect = guessIncorrectFromContrast(
              located.text,
              contrastType
            );
            if (!incorrect) {
              exclusionReason = "CANNOT_CREATE_MINIMAL_PAIR";
              convertible = false;
            }
          }

          const importance = (["high", "medium", "low"].includes(
            String(raw.importance)
          )
            ? String(raw.importance)
            : "medium") as "high" | "medium" | "low";
          const testWorthiness = Math.min(
            5,
            Math.max(1, Number(raw.testWorthiness) || 3)
          );

          points.push({
            grammarPointId: createHash("sha1")
              .update(`${span.sentenceId}|${targetText}|${index}`)
              .digest("hex")
              .slice(0, 16),
            sourceAnalysisPointId: null,
            targetText: located?.text ?? targetText,
            targetStartCharIndex: located?.start ?? -1,
            targetEndCharIndex: located?.end ?? -1,
            grammarCategoryId: createHash("sha1")
              .update(String(raw.grammarCategoryName ?? targetText))
              .digest("hex")
              .slice(0, 12),
            grammarCategoryName: String(raw.grammarCategoryName ?? "어법"),
            bookTerm: String(raw.bookTerm ?? raw.grammarCategoryName ?? "어법"),
            structure: String(raw.structure ?? ""),
            explanationKo: String(raw.explanationKo ?? ""),
            importance,
            testWorthiness,
            convertibleToChoice: convertible && exclusionReason === "NONE",
            conversionReason: String(raw.conversionReason ?? ""),
            exclusionReason: convertible ? "NONE" : exclusionReason,
            contrastType,
            analysisOrigin: "internal_ai",
          });
        });

        const testable = points.filter((x) => x.convertibleToChoice);
        const reasonRaw = String(ai.noTestablePointReason ?? "NONE");
        return {
          sentenceId: span.sentenceId,
          sentenceIndex: span.sentenceIndex,
          originalText: span.originalText,
          startCharIndex: span.startCharIndex,
          endCharIndex: span.endCharIndex,
          structureSummary: String(ai.structureSummary ?? ""),
          sentencePattern: String(ai.sentencePattern ?? ""),
          hasGrammarPoints: points.length > 0,
          hasTestableGrammarPoint: testable.length > 0,
          noTestablePointReason: (
            [
              "NONE",
              "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT",
              "ONLY_LEXICAL_FEATURE",
              "ONLY_AMBIGUOUS_CONTRAST",
              "DUPLICATE_OF_STRONGER_POINT",
            ].includes(reasonRaw)
              ? reasonRaw
              : testable.length
                ? "NONE"
                : "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT"
          ) as GrammarBlueprintSentence["noTestablePointReason"],
          grammarPoints: points,
        };
      });

      byPassageId.set(p.passageId, sentences);
    }

    return { byPassageId, openAiRequestCount: 1, modelUsed };
  } finally {
    clearTimeout(timer);
  }
}
