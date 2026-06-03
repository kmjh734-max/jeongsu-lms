import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import {
  ANSWER_VALIDATION_SYSTEM_PROMPT,
  buildAnswerValidationUserPrompt,
} from "@/lib/listening/prompts/answerValidationPrompt";
import { buildContinuationValidationUserPrompt } from "@/lib/listening/prompts/continuationValidationPrompt";
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
  response_context_score?: number;
  previous_turn?: string;
  best_response?: string;
  second_possible_answer?: string | null;
  has_context_mismatch?: boolean;
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
    response_context_score: clampScore(o.response_context_score),
    previous_turn: String(o.previous_turn ?? "").trim(),
    best_response: String(o.best_response ?? "").trim(),
    second_possible_answer:
      o.second_possible_answer == null || o.second_possible_answer === ""
        ? null
        : String(o.second_possible_answer),
    has_context_mismatch: Boolean(o.has_context_mismatch),
  };
}

export async function validateAnswerWithAi(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeLabel?: string
): Promise<AnswerValidationResult> {
  try {
    const raw = await listeningChatJson<unknown>(apiKey, {
      temperature: 0.2,
      system: ANSWER_VALIDATION_SYSTEM_PROMPT,
      user:
        q.order_index === 19 || q.order_index === 20
          ? buildContinuationValidationUserPrompt(q)
          : buildAnswerValidationUserPrompt(q, typeLabel),
    });
    return parseValidationJson(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : "정답 검수 실패";
    return {
      ...EMPTY,
      problems: [message.slice(0, 200)],
    };
  }
}
