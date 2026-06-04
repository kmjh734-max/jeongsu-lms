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

  if (!setRows?.length) return [];

  const setOrder = new Map<string, number>();
  const setIds: string[] = [];
  for (const row of setRows) {
    const setId = row.set_id as string;
    setIds.push(setId);
    setOrder.set(setId, row.order_index as number);
  }

  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, order_index, set_id")
    .in("set_id", setIds)
    .order("order_index", { ascending: true });

  const bySet = new Map<string, QuestionQueueItem[]>();
  for (const q of questions ?? []) {
    const setId = q.set_id as string;
    const list = bySet.get(setId) ?? [];
    list.push({
      setId,
      questionId: q.id as string,
      orderIndex: q.order_index as number,
    });
    bySet.set(setId, list);
  }

  const queue: QuestionQueueItem[] = [];
  for (const setId of setIds) {
    const items = bySet.get(setId) ?? [];
    items.sort((a, b) => a.orderIndex - b.orderIndex);
    queue.push(...items);
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
