import {
  ANSWER_VALIDATION_SYSTEM_PROMPT,
  buildAnswerValidationUserPrompt,
} from "@/lib/listening/prompts/answerValidationPrompt";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export interface AnswerValidationResult {
  is_answer_clear: boolean;
  correct_answer_verified: boolean;
  has_multiple_possible_answers: boolean;
  ambiguous_choices: string[];
  answer_clue: string;
  problems: string[];
  suggestions: string[];
  answer_clarity_score: number;
}

const EMPTY: AnswerValidationResult = {
  is_answer_clear: false,
  correct_answer_verified: false,
  has_multiple_possible_answers: true,
  ambiguous_choices: [],
  answer_clue: "",
  problems: ["정답 검수를 실행하지 못했습니다."],
  suggestions: [],
  answer_clarity_score: 0,
};

function clampScore(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function parseValidationJson(raw: unknown): AnswerValidationResult {
  if (!raw || typeof raw !== "object") return EMPTY;
  const o = raw as Record<string, unknown>;
  return {
    is_answer_clear: Boolean(o.is_answer_clear),
    correct_answer_verified: Boolean(o.correct_answer_verified),
    has_multiple_possible_answers: Boolean(o.has_multiple_possible_answers),
    ambiguous_choices: Array.isArray(o.ambiguous_choices)
      ? o.ambiguous_choices.map((x) => String(x))
      : [],
    answer_clue: String(o.answer_clue ?? "").trim(),
    problems: Array.isArray(o.problems) ? o.problems.map((x) => String(x)) : [],
    suggestions: Array.isArray(o.suggestions)
      ? o.suggestions.map((x) => String(x))
      : [],
    answer_clarity_score: clampScore(o.answer_clarity_score),
  };
}

export async function validateAnswerWithAi(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeLabel?: string
): Promise<AnswerValidationResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ANSWER_VALIDATION_SYSTEM_PROMPT },
        { role: "user", content: buildAnswerValidationUserPrompt(q, typeLabel) },
      ],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    return {
      ...EMPTY,
      problems: [
        `정답 검수 API 실패 (HTTP ${response.status}): ${bodyText.slice(0, 120)}`,
      ],
    };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return EMPTY;

  try {
    return parseValidationJson(JSON.parse(content));
  } catch {
    return { ...EMPTY, problems: ["정답 검수 JSON 파싱 실패"] };
  }
}
