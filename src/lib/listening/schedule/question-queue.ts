import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionQueueItem } from "@/lib/listening/schedule/types";

export async function buildQuestionQueueForAssignment(
  admin: SupabaseClient,
  assignmentId: string
): Promise<QuestionQueueItem[]> {
  const { data: setRows } = await admin
    .from("listening_schedule_assignment_sets")
    .select("set_id, order_index")
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: true });

  const queue: QuestionQueueItem[] = [];

  for (const row of setRows ?? []) {
    const setId = row.set_id as string;
    const { data: questions } = await admin
      .from("listening_questions")
      .select("id, order_index")
      .eq("set_id", setId)
      .order("order_index", { ascending: true });

    for (const q of questions ?? []) {
      queue.push({
        setId,
        questionId: q.id as string,
        orderIndex: q.order_index as number,
      });
    }
  }

  return queue;
}

export function sliceQuestionsForStudyDay(
  queue: QuestionQueueItem[],
  studyDayIndex: number,
  questionsPerDay: number
): { setId: string; questionIds: string[] } | null {
  if (studyDayIndex < 0 || queue.length === 0) return null;
  const start = studyDayIndex * questionsPerDay;
  if (start >= queue.length) return null;

  const slice = queue.slice(start, start + questionsPerDay);
  if (slice.length === 0) return null;

  const questionIds = slice.map((s) => s.questionId);
  const setId = slice[0]!.setId;
  return { setId, questionIds };
}
