import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import { ANSWER_CLARITY_PASS_THRESHOLD } from "@/lib/listening/prompts/answerValidationPrompt";
import { QUALITY_PASS_THRESHOLD } from "@/lib/listening/prompts/qualityCheckPrompt";
import {
  checkListeningQuestionQuality,
  type QualityIssue,
} from "@/lib/listening/quality-check";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import {
  validateAnswerWithAi,
  type AnswerValidationResult,
} from "@/lib/listening/validate-answer";

export interface QuestionValidationPayload {
  quality_score: number;
  answer_clarity_score: number;
  is_answer_clear: boolean;
  has_multiple_possible_answers: boolean;
  has_answer_clue: boolean;
  needs_review: boolean;
  problems: string[];
  suggestions: string[];
  quality_issues: QualityIssue[];
  answer_validation: AnswerValidationResult;
}

function mergeProblems(
  ruleIssues: QualityIssue[],
  answerValidation: AnswerValidationResult
): string[] {
  const fromRules = ruleIssues.map((i) => i.message);
  return [...fromRules, ...answerValidation.problems];
}

export function deriveNeedsReview(
  qualityScore: number,
  answerValidation: AnswerValidationResult,
  ruleIssueCount: number,
  hasAnswerClueInQuestion: boolean
): boolean {
  if (qualityScore < QUALITY_PASS_THRESHOLD) return true;
  if (answerValidation.answer_clarity_score < ANSWER_CLARITY_PASS_THRESHOLD) return true;
  if (!answerValidation.is_answer_clear) return true;
  if (answerValidation.has_multiple_possible_answers) return true;
  if (!answerValidation.correct_answer_verified) return true;
  if (!hasAnswerClueInQuestion && !answerValidation.answer_clue.trim()) return true;
  if (ruleIssueCount > 0) return true;
  return false;
}

export async function runQuestionValidation(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  options?: { skipAi?: boolean }
): Promise<QuestionValidationPayload> {
  const rule = checkListeningQuestionQuality(q, typeHint);
  const answer_validation = options?.skipAi
    ? ({
        is_answer_clear: !!q.answer_clue?.trim(),
        correct_answer_verified: true,
        has_multiple_possible_answers: false,
        ambiguous_choices: [],
        answer_clue: q.answer_clue ?? "",
        problems: [],
        suggestions: [],
        answer_clarity_score: q.answer_clue?.trim() ? 85 : 40,
      } satisfies AnswerValidationResult)
    : await validateAnswerWithAi(
        apiKey,
        q,
        typeHint?.question_type ?? q.question_type
      );

  const has_answer_clue = Boolean(
    q.answer_clue?.trim() || answer_validation.answer_clue.trim()
  );

  const needs_review = deriveNeedsReview(
    rule.quality_score,
    answer_validation,
    rule.issues.length,
    has_answer_clue
  );

  const problems = mergeProblems(rule.issues, answer_validation);
  const suggestions = [...answer_validation.suggestions];

  return {
    quality_score: rule.quality_score,
    answer_clarity_score: answer_validation.answer_clarity_score,
    is_answer_clear: answer_validation.is_answer_clear,
    has_multiple_possible_answers: answer_validation.has_multiple_possible_answers,
    has_answer_clue,
    needs_review,
    problems,
    suggestions,
    quality_issues: rule.issues,
    answer_validation,
  };
}

export type ValidatedListeningQuestion = GeneratedListeningQuestion &
  QuestionValidationPayload;

export async function attachValidationToQuestion(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate
): Promise<ValidatedListeningQuestion> {
  const v = await runQuestionValidation(apiKey, q, typeHint);
  const answer_clue =
    q.answer_clue?.trim() || v.answer_validation.answer_clue.trim() || q.answer_clue;

  return {
    ...q,
    answer_clue,
    needs_review: v.needs_review,
    quality_issues: v.quality_issues,
    quality_score: v.quality_score,
    answer_clarity_score: v.answer_clarity_score,
    is_answer_clear: v.is_answer_clear,
    has_multiple_possible_answers: v.has_multiple_possible_answers,
    has_answer_clue: v.has_answer_clue,
    problems: v.problems,
    suggestions: v.suggestions,
    answer_validation: v.answer_validation,
  };
}

export async function attachValidationToQuestions(
  apiKey: string,
  questions: GeneratedListeningQuestion[],
  types?: ExamTypeTemplate[]
): Promise<ValidatedListeningQuestion[]> {
  const out: ValidatedListeningQuestion[] = [];
  for (let i = 0; i < questions.length; i++) {
    out.push(
      await attachValidationToQuestion(apiKey, questions[i]!, types?.[i])
    );
  }
  return out;
}
