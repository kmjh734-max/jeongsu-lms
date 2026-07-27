import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewAnswerRow } from "@/components/exam-prep/WritingReviewPanel";

/** 배정 학생의 needs_review 서술형 답안 */
export async function loadNeedsReviewAnswers(
  supabase: SupabaseClient,
  assignmentStudentId: string
): Promise<ReviewAnswerRow[]> {
  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("id")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("status", "submitted");

  const attemptIds = (attempts ?? []).map((a) => a.id as string);
  if (attemptIds.length === 0) return [];

  const { data: answers } = await supabase
    .from("exam_answers")
    .select(
      "id, student_answer, ai_feedback, grading_status, score, exam_workbook_questions(question_text, question_type, correct_answer, points)"
    )
    .in("attempt_id", attemptIds)
    .eq("grading_status", "needs_review")
    .order("updated_at", { ascending: false });

  return (answers ?? []).map((a) => {
    const qRaw = a.exam_workbook_questions as
      | {
          question_text: string | null;
          question_type: string;
          correct_answer: unknown;
          points: number;
        }
      | {
          question_text: string | null;
          question_type: string;
          correct_answer: unknown;
          points: number;
        }[]
      | null;
    const q = Array.isArray(qRaw) ? qRaw[0] ?? null : qRaw;
    return {
      id: a.id as string,
      student_answer: a.student_answer,
      ai_feedback: a.ai_feedback as string | null,
      grading_status: a.grading_status as string,
      score: a.score != null ? Number(a.score) : null,
      question_text: q?.question_text ?? null,
      question_type: q?.question_type ?? "writing",
      model_answer: q?.correct_answer ?? null,
      points: Number(q?.points) || 1,
    };
  });
}
