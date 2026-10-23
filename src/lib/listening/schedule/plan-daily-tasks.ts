/**
 * 학생 한 명의 일일 과제 계획 (DB 없이 계산만).
 * ensureDailyTasksForStudentRange 가 읽어 온 행을 넘기면
 * 지울 과제 id 와 새로 만들 과제를 돌려준다.
 */
import {
  isStudyDay,
  listStudyDatesInclusive,
  parseDateOnly,
} from "@/lib/listening/schedule/days-of-week";
import {
  getStudyDayIndexSkippingPauses,
  isDatePaused,
  type PauseDateRange,
} from "@/lib/listening/schedule/pauses";
import {
  buildPackedDailySlices,
  remainingQueueAfterConsumed,
} from "@/lib/listening/schedule/question-queue";
import type {
  QuestionQueueItem,
  ScheduleAssignmentRow,
} from "@/lib/listening/schedule/types";

export type PlanAssignmentRule = Pick<
  ScheduleAssignmentRow,
  "start_date" | "end_date" | "days_of_week" | "questions_per_day"
>;

export type PlanExistingTaskRow = {
  id: string;
  task_date: string;
  status: string;
  completed_count: number | null;
  question_ids: string[] | null;
  set_id: string;
};

export type PlannedDailyTask = {
  task_date: string;
  set_id: string;
  question_ids: string[];
};

/** 이미 시작한 오늘 과제에서 안 푼 문항을 덜어 낸 결과 */
export type PlannedDailyTaskUpdate = {
  id: string;
  /** 남길 문항 (원래 순서) */
  question_ids: string[];
  /** 다음 날로 넘기는 문항 */
  removed_ids: string[];
};

export function isTaskDateInAssignment(
  taskDateIso: string,
  assignment: PlanAssignmentRule
): boolean {
  const taskDate = parseDateOnly(taskDateIso);
  const start = parseDateOnly(assignment.start_date);
  const end = assignment.end_date ? parseDateOnly(assignment.end_date) : null;
  if (taskDate < start) return false;
  if (end && taskDate > end) return false;
  return isStudyDay(taskDate, assignment.days_of_week);
}

/** 오늘·이후 과제 중 학생이 손을 댄 것 (끝낸 문항이 있거나 풀기 시작함) */
export function isTaskStarted(
  row: Pick<PlanExistingTaskRow, "id" | "status" | "completed_count">,
  startedTaskIds?: ReadonlySet<string>
): boolean {
  return (
    row.status === "completed" ||
    row.status === "in_progress" ||
    (row.completed_count ?? 0) > 0 ||
    Boolean(startedTaskIds?.has(row.id))
  );
}

function sameIdList(a: string[] | null | undefined, b: string[]): boolean {
  const left = a ?? [];
  if (left.length !== b.length) return false;
  return left.every((id, i) => id === b[i]);
}

/**
 * - 오늘 이전 과제는 그대로 둔다(그 문항은 이미 나간 것으로 본다).
 * - 오늘·이후 과제는 끝냈거나, 시작했고 순서가 맞으면 그대로 둔다.
 *   단, 하루 문항 수를 줄였는데 시작한 과제가 그보다 많으면 아직 손 안 댄 문항만 덜어 내
 *   다음 날부터 다시 나눈다(updates). 선생님 지적(2026-10-23): 3문항으로 배정했다가 2문항으로
 *   고쳤는데 그날 과제가 3문항으로 남았다 — 학생이 이미 풀기 시작한 뒤라 통째로 지켰기 때문.
 * - 나머지 날은 「이미 나간·끝낸 마지막 문항 다음」부터 새 규칙으로 채운다.
 *   (아무것도 나간 게 없으면 시작일 기준 순번으로 자른다)
 * - 일시정지한 날은 과제를 만들지 않고, 순번에서도 뺀다(다시 시작하면 멈춘 곳부터 이어짐).
 *   아직 안 건드린 과제가 멈춘 날에 남아 있으면 지운다.
 */
export function planStudentDailyTasks(input: {
  assignment: PlanAssignmentRule;
  queue: QuestionQueueItem[];
  existingRows: PlanExistingTaskRow[];
  /** 이 학생이 끝낸(completed) 문항 id — 큐에 있는 것만 */
  completedQuestionIds: Iterable<string>;
  /** 오늘·이후 과제 중 진행 기록(객관식·받아쓰기)이 있는 과제 id */
  startedTaskIds?: ReadonlySet<string>;
  /** 오늘·이후 과제에서 학생이 손댄(객관식·받아쓰기 기록이 있는) 문항 id — 덜어 낼 때 지킨다 */
  touchedQuestionIds?: ReadonlySet<string>;
  todayIso: string;
  /** 유효 시작일로 이미 잘린 시작 */
  fromIso: string;
  toIso: string;
  /** 이 학생에게 걸린 일시정지 기간 (과제 전체 + 이 학생) */
  pausedRanges?: readonly PauseDateRange[];
}): { idsToDelete: string[]; inserts: PlannedDailyTask[]; updates: PlannedDailyTaskUpdate[] } {
  const {
    assignment,
    queue,
    existingRows,
    startedTaskIds,
    touchedQuestionIds,
    todayIso,
    fromIso,
    toIso,
    pausedRanges,
  } = input;
  const isPaused = (iso: string) => isDatePaused(pausedRanges, iso);

  const idsToDelete: string[] = [];
  const inserts: PlannedDailyTask[] = [];
  const updates: PlannedDailyTaskUpdate[] = [];
  if (fromIso > toIso || queue.length === 0) return { idsToDelete, inserts, updates };

  const consumed = new Set<string>();
  for (const row of existingRows) {
    if (row.task_date >= todayIso) continue;
    for (const id of row.question_ids ?? []) consumed.add(id);
  }
  for (const id of input.completedQuestionIds) consumed.add(id);

  const leftoverIds = new Set(
    remainingQueueAfterConsumed(queue, consumed).map((q) => q.questionId)
  );

  const locked: PlanExistingTaskRow[] = [];
  const unlockedInRange: PlanExistingTaskRow[] = [];
  for (const row of existingRows) {
    if (row.task_date < todayIso) {
      locked.push(row);
      continue;
    }

    const remainingIds = (row.question_ids ?? []).filter(
      (id) => !consumed.has(id)
    );
    const sequential =
      remainingIds.length > 0 &&
      remainingIds.every((id) => leftoverIds.has(id));
    const keep =
      row.status === "completed" ||
      (isTaskStarted(row, startedTaskIds) && sequential);

    if (keep) {
      let ids = row.question_ids ?? [];
      const perDay = assignment.questions_per_day;
      if (row.status !== "completed" && perDay > 0 && ids.length > perDay) {
        // 끝냈거나 손댄 마지막 문항까지는 지키고, 그 뒤 꼬리에서만 새 하루 문항 수까지 남긴다.
        // (큐는 「나간 마지막 문항 다음」부터 이어지므로 중간 문항을 빼면 사라진다 — 꼬리만 덜어 낸다)
        const lastMust = ids.reduce(
          (acc, id, i) => (consumed.has(id) || touchedQuestionIds?.has(id) ? i : acc),
          -1
        );
        const head = ids.slice(0, lastMust + 1);
        const tailKeep = Math.max(0, perDay - head.length);
        const kept = [...head, ...ids.slice(lastMust + 1, lastMust + 1 + tailKeep)];
        if (kept.length < ids.length) {
          updates.push({
            id: row.id,
            question_ids: kept,
            removed_ids: ids.filter((id) => !kept.includes(id)),
          });
          ids = kept;
        }
      }
      locked.push({ ...row, question_ids: ids });
      for (const id of ids) consumed.add(id);
      continue;
    }

    if (row.task_date >= fromIso && row.task_date <= toIso) {
      // 멈춘 날에 남은 안 건드린 과제는 지운다 (아래 학습일 목록에서도 빠진다)
      if (isPaused(row.task_date)) idsToDelete.push(row.id);
      else unlockedInRange.push(row);
    }
  }

  const lockedByDate = new Map(locked.map((row) => [row.task_date, row]));
  const unlockedByDate = new Map(
    unlockedInRange.map((row) => [row.task_date, row])
  );
  const existingByDate = new Map(
    existingRows.map((row) => [row.task_date, row])
  );

  const studyDates = listStudyDatesInclusive(
    fromIso,
    toIso,
    assignment.days_of_week
  ).filter((iso) => isTaskDateInAssignment(iso, assignment) && !isPaused(iso));

  const futureDates = studyDates.filter(
    (iso) => iso >= todayIso && !lockedByDate.has(iso)
  );

  const reconcile = (
    iso: string,
    expected: { setId: string; questionIds: string[] } | null
  ) => {
    const existing = unlockedByDate.get(iso);
    if (!expected || expected.questionIds.length === 0) {
      if (existing) idsToDelete.push(existing.id);
      return;
    }
    if (
      existing &&
      existing.set_id === expected.setId &&
      sameIdList(existing.question_ids, expected.questionIds)
    ) {
      return;
    }
    if (existing) idsToDelete.push(existing.id);
    inserts.push({
      task_date: iso,
      set_id: expected.setId,
      question_ids: expected.questionIds,
    });
  };

  if (consumed.size === 0) {
    // 아직 나간 문항이 없으면 시작일부터의 학습일 순번으로 자른다 (멈춘 날은 세지 않는다)
    const packed = buildPackedDailySlices(queue, assignment.questions_per_day);
    const sliceForDate = (iso: string) => {
      const index = getStudyDayIndexSkippingPauses(
        assignment.start_date,
        iso,
        assignment.days_of_week,
        pausedRanges
      );
      return index < 0 ? null : (packed[index] ?? null);
    };

    for (const iso of studyDates) {
      if (iso >= todayIso) continue;
      if (existingByDate.has(iso)) continue;
      const slice = sliceForDate(iso);
      if (slice && slice.questionIds.length > 0) {
        inserts.push({
          task_date: iso,
          set_id: slice.setId,
          question_ids: slice.questionIds,
        });
      }
    }
    for (const iso of futureDates) reconcile(iso, sliceForDate(iso));
  } else {
    const slices = buildPackedDailySlices(
      remainingQueueAfterConsumed(queue, consumed),
      assignment.questions_per_day
    );
    futureDates.forEach((iso, i) => reconcile(iso, slices[i] ?? null));
  }

  return { idsToDelete, inserts, updates };
}
