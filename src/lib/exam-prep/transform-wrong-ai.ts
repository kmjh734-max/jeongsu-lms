import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import { sanitizeQuestionDataForStudent } from "@/lib/exam-prep/strip-answers";
import {
  transformWrongQuestionForPractice,
  type WrongPracticeQuestion,
} from "@/lib/exam-prep/transform-wrong-question";
import type { ExamWorkbookQuestion } from "@/lib/exam-prep/types";

/**
 * 오답 문항을 AI로 다른 유형 연습 문제로 변환.
 * 실패 시 규칙 기반 변환으로 폴백.
 */
export async function transformWrongQuestionWithAi(
  q: ExamWorkbookQuestion
): Promise<WrongPracticeQuestion> {
  const fallback = transformWrongQuestionForPractice(q, "transform");
  if (!process.env.OPENAI_API_KEY?.trim()) return fallback;

  try {
    const raw = await questionGeneratorChatJson({
      system: `당신은 내신 오답 재출제 전문가다.
원 문항을 다른 유형으로 바꿔 연습 문제를 만든다. 원문 의미를 바꾸지 않는다.
가능 유형: english_blank, grammar_vocab_choice, error_correction, translation_practice, verb_form
JSON만: {"practiceType":"...","questionText":"...","questionData":{...},"correctAnswer":{...},"acceptableAnswers":...}
스키마는 기존 내신대비 문항과 동일. grammar는 options 4개.`,
      user: JSON.stringify({
        originalType: q.question_type,
        questionText: q.question_text,
        questionData: q.question_data,
        correctAnswer: q.correct_answer,
        preferredNextType: fallback.practice_type,
      }),
      temperature: 0.4,
      maxTokens: 2000,
    });

    if (!raw || typeof raw !== "object") return fallback;
    const r = raw as Record<string, unknown>;
    const practiceType =
      typeof r.practiceType === "string" && r.practiceType
        ? r.practiceType
        : fallback.practice_type;
    const questionData =
      r.questionData && typeof r.questionData === "object"
        ? (r.questionData as Record<string, unknown>)
        : null;
    if (!questionData) return fallback;

    const correctAnswer = r.correctAnswer ?? fallback._correct_answer;
    // blanks 정답이 questionData에 있으면 분리
    const publicData = { ...questionData };
    if (Array.isArray(publicData.blanks)) {
      publicData.blanks = (publicData.blanks as unknown[]).map((b) => {
        if (!b || typeof b !== "object") return b;
        const { answer: _a, acceptableAnswers: _acc, ...rest } = b as Record<
          string,
          unknown
        >;
        return rest;
      });
    }

    return {
      id: q.id,
      academy_id: q.academy_id,
      workbook_id: q.workbook_id,
      step_id: q.step_id,
      sentence_id: q.sentence_id,
      question_type: practiceType,
      question_order: q.question_order,
      question_text:
        typeof r.questionText === "string" && r.questionText.trim()
          ? r.questionText.trim()
          : fallback.question_text,
      question_data: sanitizeQuestionDataForStudent(practiceType, publicData),
      explanation: null,
      difficulty: q.difficulty,
      points: q.points,
      is_active: q.is_active,
      ai_generated: true,
      created_at: q.created_at,
      updated_at: q.updated_at,
      practice_type: practiceType,
      _correct_answer: correctAnswer,
      _acceptable_answers: r.acceptableAnswers ?? null,
    };
  } catch {
    return fallback;
  }
}
