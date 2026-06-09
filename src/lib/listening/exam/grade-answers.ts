export interface ListeningExamQuestionKey {
  id: string;
  order_index: number;
  correct_answer: number;
}

export interface GradedListeningExamAnswer {
  questionId: string;
  orderIndex: number;
  studentAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface GradedListeningExamResult {
  correctCount: number;
  totalCount: number;
  score: number;
  answers: GradedListeningExamAnswer[];
}

export function gradeListeningExamAnswers(
  questions: ListeningExamQuestionKey[],
  answers: Record<string, number | undefined>
): GradedListeningExamResult {
  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
  let correctCount = 0;

  const graded = sorted.map((q) => {
    const raw = answers[q.id];
    const studentAnswer =
      typeof raw === "number" && raw >= 1 && raw <= 5 ? raw : null;
    const isCorrect =
      studentAnswer != null && studentAnswer === q.correct_answer;
    if (isCorrect) correctCount += 1;
    return {
      questionId: q.id,
      orderIndex: q.order_index,
      studentAnswer,
      correctAnswer: q.correct_answer,
      isCorrect,
    };
  });

  const totalCount = sorted.length;
  const score =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return { correctCount, totalCount, score, answers: graded };
}
