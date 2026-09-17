import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { ANSWER_CLARITY_PASS_THRESHOLD } from "@/lib/listening/prompts/answerValidationPrompt";
import { RESPONSE_CONTEXT_PASS_THRESHOLD } from "@/lib/listening/prompts/continuationValidationPrompt";
import { QUALITY_PASS_THRESHOLD } from "@/lib/listening/prompts/qualityCheckPrompt";
import {
  checkListeningQuestionQuality,
  type QualityIssue,
} from "@/lib/listening/quality-check";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import {
  blindSolveNeedsReview,
  blindSolveProblem,
  blindSolveQuestion,
  emotionAmbiguityCheck,
  type BlindSolveResult,
} from "@/lib/listening/blind-solve";
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
  /** 정답을 가리고 풀게 한 결과. 검수를 돌리지 않았으면 undefined. */
  blind_solve?: BlindSolveResult;
}

function mergeProblems(
  ruleIssues: QualityIssue[],
  answerValidation: AnswerValidationResult
): string[] {
  const ruleMessages = new Set(
    ruleIssues.map((i) => i.message.trim()).filter(Boolean)
  );
  return answerValidation.problems.filter((p) => {
    const t = p.trim();
    return t && !ruleMessages.has(t);
  });
}

export function deriveNeedsReview(
  qualityScore: number,
  answerValidation: AnswerValidationResult,
  ruleIssueCount: number,
  hasAnswerClueInQuestion: boolean,
  orderIndex?: number,
  blindSolve?: BlindSolveResult
): boolean {
  // 정답을 가리고 풀었을 때 다른 답이 나오면 사람이 봐야 한다
  if (blindSolve && blindSolveNeedsReview(blindSolve)) return true;
  if (qualityScore < QUALITY_PASS_THRESHOLD) return true;
  if (answerValidation.answer_clarity_score < ANSWER_CLARITY_PASS_THRESHOLD) return true;
  if (!answerValidation.is_answer_clear) return true;
  if (answerValidation.has_multiple_possible_answers) return true;
  if (!answerValidation.correct_answer_verified) return true;
  if (!hasAnswerClueInQuestion && !answerValidation.answer_clue.trim()) return true;
  if (ruleIssueCount > 0) return true;
  if (orderIndex === 19 || orderIndex === 20) {
    const ctx = answerValidation.response_context_score ?? 100;
    if (ctx < RESPONSE_CONTEXT_PASS_THRESHOLD) return true;
    if (answerValidation.has_context_mismatch) return true;
    if (answerValidation.second_possible_answer) return true;
  }
  return false;
}

export async function runQuestionValidation(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  options?: { skipAi?: boolean; gradeLevel?: ListeningGradeLevel }
): Promise<QuestionValidationPayload> {
  const rule = checkListeningQuestionQuality(
    q,
    typeHint,
    options?.gradeLevel ?? "middle1"
  );
  /*
   * 정답을 가리고 직접 풀게 하는 검사. 정답을 보여 주고 묻는 검수는 보여 준 답에 끌려가
   * "맞다"고 하기 쉬워서, 2026-09-17 점검 때 120문항 중 세 개의 잘못을 놓쳤다.
   * 두 검수를 함께 띄워 기다리는 시간이 늘지 않게 한다.
   */
  const blindTask: Promise<BlindSolveResult | undefined> = options?.skipAi
    ? Promise.resolve(undefined)
    : blindSolveQuestion(apiKey, q);
  /** 심정 문항은 "답이 될 수 있는 감정을 다 고르라"고 한 번 더 묻는다 */
  const emotionTask = options?.skipAi
    ? Promise.resolve({ defensible: [] as number[], skipped: true })
    : emotionAmbiguityCheck(apiKey, q);

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

  const blind_solve = await blindTask;
  const emotion = await emotionTask;
  const emotionAmbiguous =
    !emotion.skipped &&
    emotion.defensible.length > 1 &&
    emotion.defensible.includes(q.correct_answer);

  const needs_review = deriveNeedsReview(
    rule.quality_score,
    answer_validation,
    rule.issues.length,
    has_answer_clue,
    q.order_index,
    blind_solve
  ) || emotionAmbiguous;

  const problems = mergeProblems(rule.issues, answer_validation);
  const blindProblem = blind_solve
    ? blindSolveProblem(blind_solve, q.correct_answer)
    : null;
  if (blindProblem) problems.unshift(blindProblem);
  if (emotionAmbiguous) {
    const others = emotion.defensible.filter((n) => n !== q.correct_answer);
    problems.unshift(
      `심정이 하나로 정해지지 않습니다. ${others.join("·")}번도 근거가 있습니다.`
    );
  }
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
    blind_solve,
  };
}

export type ValidatedListeningQuestion = GeneratedListeningQuestion &
  QuestionValidationPayload;

export async function attachValidationToQuestion(
  apiKey: string,
  q: GeneratedListeningQuestion,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<ValidatedListeningQuestion> {
  const v = await runQuestionValidation(apiKey, q, typeHint, { gradeLevel });
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
  types?: ExamTypeTemplate[],
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<ValidatedListeningQuestion[]> {
  const out: ValidatedListeningQuestion[] = [];
  for (let i = 0; i < questions.length; i++) {
    out.push(
      await attachValidationToQuestion(
        apiKey,
        questions[i]!,
        types?.[i],
        gradeLevel
      )
    );
  }
  return out;
}
