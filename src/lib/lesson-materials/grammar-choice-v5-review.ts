import {
  isGpt5FamilyModel,
  isUnsupportedParameterError,
} from "@/lib/student-records/model";
import {
  GrammarChoiceModelError,
  resolveGrammarReviewerModel,
  resolveGrammarReviewerReasoningEffort,
} from "@/lib/lesson-materials/grammar-choice-model";
import {
  GRAMMAR_CHOICE_REVIEWER_SYSTEM_PROMPT,
  buildGrammarChoiceReviewerUserPrompt,
} from "@/lib/lesson-materials/grammar-choice-v5-prompts";
import type {
  GrammarCandidateReview,
  GrammarReviewRejectionReason,
  ValidatedGrammarCandidate,
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

const REJECTION_REASONS: GrammarReviewRejectionReason[] = [
  "CORRECT_NOT_ORIGINAL",
  "CORRECT_UNGRAMMATICAL",
  "BOTH_OPTIONS_POSSIBLE",
  "WRONG_ONLY_SEMANTICALLY_AWKWARD",
  "LEXICAL_OR_COLLOCATION",
  "TOO_TRIVIAL",
  "IMPLAUSIBLE_DISTRACTOR",
  "RANGE_TOO_LARGE",
  "DUPLICATED_CONTEXT",
  "NOT_HIGH_SCHOOL_GRAMMAR",
  "OTHER",
];

function clamp15(n: unknown, fallback: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(5, Math.max(1, Math.round(v)));
}

export function resolveGrammarReviewerModelCandidates(): string[] {
  return [resolveGrammarReviewerModel()];
}

export function isReviewAcceptedByCode(
  r: GrammarCandidateReview
): boolean {
  return (
    r.correctMatchesOriginal &&
    r.correctSentenceIsGrammatical &&
    r.incorrectSentenceIsUngrammatical &&
    r.onlyOneAnswerPossible &&
    r.testsGrammarNotVocabulary &&
    r.distractorIsPlausible &&
    r.selectionRangeIsMinimal &&
    r.suitableForHighSchoolExam &&
    r.ambiguityRisk === "low" &&
    r.qualityScore >= 4 &&
    r.accepted
  );
}

export async function callGrammarChoiceReviewer(input: {
  candidates: ValidatedGrammarCandidate[];
}): Promise<{
  reviews: GrammarCandidateReview[];
  modelUsed: string;
  responseModel: string;
  reasoningEffort: string;
  openAiRequestCount: number;
}> {
  if (input.candidates.length === 0) {
  return { reviews: [], modelUsed: "—", responseModel: "—", reasoningEffort: "none", openAiRequestCount: 0 };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const requestedModel = resolveGrammarReviewerModel();
  const requestedReasoningEffort = resolveGrammarReviewerReasoningEffort();
  const userContent = buildGrammarChoiceReviewerUserPrompt({
    reviews: input.candidates.map((c) => ({
      candidateId: c.candidateId,
      originalSentence: c.sentenceText,
      correctText: c.correctText,
      incorrectText: c.incorrectText,
      sentenceWithCorrect: c.sentenceWithCorrect,
      sentenceWithIncorrect: c.sentenceWithIncorrect,
      grammarCategory: c.grammarCategory,
      bookTerm: c.bookTerm,
      explanationKo: c.explanationKo,
      incorrectReasonKo: c.incorrectReasonKo,
    })),
  });

  const REVIEW_ITEM = {
    type: "object",
    additionalProperties: false,
    required: [
      "candidateId",
      "correctMatchesOriginal",
      "correctSentenceIsGrammatical",
      "incorrectSentenceIsUngrammatical",
      "onlyOneAnswerPossible",
      "testsGrammarNotVocabulary",
      "distractorIsPlausible",
      "selectionRangeIsMinimal",
      "suitableForHighSchoolExam",
      "ambiguityRisk",
      "qualityScore",
      "difficultyScore",
      "accepted",
      "rejectionReasons",
      "finalBookTerm",
      "finalExplanationKo",
      "finalIncorrectReasonKo",
    ],
    properties: {
      candidateId: { type: "string" },
      correctMatchesOriginal: { type: "boolean" },
      correctSentenceIsGrammatical: { type: "boolean" },
      incorrectSentenceIsUngrammatical: { type: "boolean" },
      onlyOneAnswerPossible: { type: "boolean" },
      testsGrammarNotVocabulary: { type: "boolean" },
      distractorIsPlausible: { type: "boolean" },
      selectionRangeIsMinimal: { type: "boolean" },
      suitableForHighSchoolExam: { type: "boolean" },
      ambiguityRisk: { type: "string", enum: ["low", "medium", "high"] },
      qualityScore: { type: "number" },
      difficultyScore: { type: "number" },
      accepted: { type: "boolean" },
      rejectionReasons: {
        type: "array",
        items: { type: "string", enum: REJECTION_REASONS },
      },
      finalBookTerm: { type: "string" },
      finalExplanationKo: { type: "string" },
      finalIncorrectReasonKo: { type: "string" },
    },
  } as const;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    let bodyText = "";
    let ok = false;
    let modelUsed = requestedModel;
    let responseModel = requestedModel;
    let reasoningEffort = requestedReasoningEffort;
    let reasoningField: "effort" | "object" = "effort";
    let useJsonSchema = true;
    let includeJsonMode = true;

    for (let attempt = 0; attempt < 4; attempt++) {
      const body: Record<string, unknown> = {
        model: requestedModel,
        messages: [
          { role: "system", content: GRAMMAR_CHOICE_REVIEWER_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      };
      if (isGpt5FamilyModel(requestedModel)) {
        body.max_completion_tokens = 16_000;
      } else {
        body.max_tokens = 10_000;
      }
      if (reasoningField === "object") {
        body.reasoning = { effort: requestedReasoningEffort };
      } else {
        body.reasoning_effort = requestedReasoningEffort;
      }
      reasoningEffort = requestedReasoningEffort;
      if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "grammar_choice_reviewer_v1",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["reviews"],
                properties: {
                  reviews: { type: "array", items: REVIEW_ITEM },
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
          modelUsed = requestedModel;
          const envelope = parseJsonSafe<{ model?: string }>(bodyText);
          responseModel = String(envelope?.model ?? requestedModel);
          break;
        }
        let errMsg = bodyText;
        try {
          errMsg = JSON.stringify(JSON.parse(bodyText));
        } catch {
          /* */
        }
        if (
          reasoningField === "effort" &&
          isUnsupportedParameterError(errMsg, "reasoning_effort")
        ) {
          reasoningField = "object";
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
        throw new GrammarChoiceModelError({
          stage: "REVIEWER",
          requestedModel,
          requestedReasoningEffort,
          errorCode: `HTTP_${res.status}`,
          errorMessage: errMsg.slice(0, 500) || "unknown",
        });
      }

    if (!ok) {
      throw new GrammarChoiceModelError({
        stage: "REVIEWER",
        requestedModel,
        requestedReasoningEffort,
        errorCode: "REVIEWER_FAILED",
        errorMessage: bodyText.slice(0, 500) || "unknown",
      });
    }

    const json = parseJsonSafe<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(bodyText);
    const content = json?.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonSafe<{
      reviews?: Array<Record<string, unknown>>;
    }>(content);

    const reviews: GrammarCandidateReview[] = [];
    for (const raw of parsed?.reviews ?? []) {
      const ambiguityRisk = String(raw.ambiguityRisk ?? "high");
      if (
        ambiguityRisk !== "low" &&
        ambiguityRisk !== "medium" &&
        ambiguityRisk !== "high"
      ) {
        continue;
      }
      const rejectionReasons = (Array.isArray(raw.rejectionReasons)
        ? raw.rejectionReasons
        : []
      )
        .map((x) => String(x))
        .filter((x): x is GrammarReviewRejectionReason =>
          REJECTION_REASONS.includes(x as GrammarReviewRejectionReason)
        );

      reviews.push({
        candidateId: String(raw.candidateId ?? ""),
        correctMatchesOriginal: Boolean(raw.correctMatchesOriginal),
        correctSentenceIsGrammatical: Boolean(raw.correctSentenceIsGrammatical),
        incorrectSentenceIsUngrammatical: Boolean(
          raw.incorrectSentenceIsUngrammatical
        ),
        onlyOneAnswerPossible: Boolean(raw.onlyOneAnswerPossible),
        testsGrammarNotVocabulary: Boolean(raw.testsGrammarNotVocabulary),
        distractorIsPlausible: Boolean(raw.distractorIsPlausible),
        selectionRangeIsMinimal: Boolean(raw.selectionRangeIsMinimal),
        suitableForHighSchoolExam: Boolean(raw.suitableForHighSchoolExam),
        ambiguityRisk,
        qualityScore: clamp15(raw.qualityScore, 1),
        difficultyScore: clamp15(raw.difficultyScore, 3),
        accepted: Boolean(raw.accepted),
        rejectionReasons,
        finalBookTerm: String(raw.finalBookTerm ?? "").trim(),
        finalExplanationKo: String(raw.finalExplanationKo ?? "").trim(),
        finalIncorrectReasonKo: String(raw.finalIncorrectReasonKo ?? "").trim(),
      });
    }

    return { reviews, modelUsed, responseModel, reasoningEffort, openAiRequestCount: 1 };
  } finally {
    clearTimeout(timer);
  }
}
