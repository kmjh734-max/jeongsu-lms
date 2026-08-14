import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DailyTaskSlice,
  QuestionQueueItem,
} from "@/lib/listening/schedule/types";

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

/**
 * 하루 분량을 세트(회차) 경계에서 자른다.
 * `index * N` 방식은 17문항 세트가 3문항/일이면 6일차에 다음 회 1번을 끌어와
 * 다음 회가 2번부터 시작하고, 빠진 1번이 나중에 다시 섞여 나온다.
 */
export function buildPackedDailySlices(
  queue: QuestionQueueItem[],
  questionsPerDay: number
): DailyTaskSlice[] {
  const perDay = Math.max(1, Math.floor(questionsPerDay) || 1);
  const slices: DailyTaskSlice[] = [];
  let i = 0;
  while (i < queue.length) {
    const setId = queue[i]!.setId;
    const questionIds: string[] = [];
    while (
      questionIds.length < perDay &&
      i < queue.length &&
      queue[i]!.setId === setId
    ) {
      questionIds.push(queue[i]!.questionId);
      i += 1;
    }
    if (questionIds.length > 0) {
      slices.push({ setId, questionIds });
    }
  }
  return slices;
}

export function sliceQuestionsForStudyDay(
  queue: QuestionQueueItem[],
  studyDayIndex: number,
  questionsPerDay: number
): DailyTaskSlice | null {
  if (studyDayIndex < 0 || queue.length === 0) return null;
  const slices = buildPackedDailySlices(queue, questionsPerDay);
  return slices[studyDayIndex] ?? null;
}

/** 이미 배정된 문항보다 앞번호가 빠져 있으면 해당 회차 맨 뒤로 보냄 */
export function leftoverQueueAfterConsumed(
  queue: QuestionQueueItem[],
  consumed: Set<string>
): QuestionQueueItem[] {
  const slices = splitLeftoverBySet(queue, consumed);
  const out: QuestionQueueItem[] = [];
  for (const part of slices) {
    out.push(...part.rest, ...part.makeup);
  }
  return out;
}

/**
 * 빠진 앞번호를 같은 날 마지막 문항과 묶지 않는다.
 * 예: 11–13, 14–16, 17, 그다음 보충 1번.
 */
export function buildLeftoverDailySlices(
  queue: QuestionQueueItem[],
  consumed: Set<string>,
  questionsPerDay: number
): DailyTaskSlice[] {
  const slices: DailyTaskSlice[] = [];
  for (const part of splitLeftoverBySet(queue, consumed)) {
    slices.push(...buildPackedDailySlices(part.rest, questionsPerDay));
    slices.push(...buildPackedDailySlices(part.makeup, questionsPerDay));
  }
  return slices;
}

function splitLeftoverBySet(
  queue: QuestionQueueItem[],
  consumed: Set<string>
): Array<{ rest: QuestionQueueItem[]; makeup: QuestionQueueItem[] }> {
  const leftover = queue.filter((q) => !consumed.has(q.questionId));
  const bySet = new Map<string, QuestionQueueItem[]>();
  const setOrder: string[] = [];
  for (const q of leftover) {
    if (!bySet.has(q.setId)) {
      setOrder.push(q.setId);
      bySet.set(q.setId, []);
    }
    bySet.get(q.setId)!.push(q);
  }

  const maxConsumedOrder = new Map<string, number>();
  for (const q of queue) {
    if (!consumed.has(q.questionId)) continue;
    const prev = maxConsumedOrder.get(q.setId) ?? Number.NEGATIVE_INFINITY;
    if (q.orderIndex > prev) maxConsumedOrder.set(q.setId, q.orderIndex);
  }

  return setOrder.map((setId) => {
    const items = (bySet.get(setId) ?? [])
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const maxDone = maxConsumedOrder.get(setId);
    if (maxDone == null) {
      return { rest: items, makeup: [] };
    }
    return {
      rest: items.filter((q) => q.orderIndex > maxDone),
      makeup: items.filter((q) => q.orderIndex <= maxDone),
    };
  });
}
