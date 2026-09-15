/**
 * 듣기 스케줄 일시정지 기간 계산 (DB 없이 계산만).
 *
 * 한 기간은 [startDate, endDate) — startDate 부터 멈추고 endDate 부터 다시 나간다.
 * endDate 가 없으면 재개할 때까지 멈춰 있다.
 * 과제 전체 기간(studentId = null)과 학생 한 명 기간(studentId = 학생)이 함께 걸릴 수 있다.
 */
import {
  isStudyDay,
  listStudyDatesInclusive,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";

export interface SchedulePauseRange {
  id: string;
  assignmentId: string;
  /** null = 과제 전체 */
  studentId: string | null;
  /** 멈춘 첫날 */
  startDate: string;
  /** 다시 나가는 날 (이날부터 다시 나감). null = 재개할 때까지 */
  endDate: string | null;
  pausedBy: string | null;
  pausedAt: string | null;
}

/** 날짜 계산에 필요한 부분만 */
export type PauseDateRange = Pick<SchedulePauseRange, "startDate" | "endDate">;

/** 지금 멈춰 있는 상태 (화면 표시용) */
export interface SchedulePauseState {
  since: string;
  /** 다시 나가는 날. null = 재개할 때까지 */
  until: string | null;
  pausedBy: string | null;
  pausedAt: string | null;
}

/** 지금 멈춘 상태 + 멈춘 사람 이름 (배정 탭 표시용) */
export type SchedulePauseView = SchedulePauseState & {
  pausedByName: string | null;
  /** 예전 「잠시 쉬기」(is_active = false)로 멈춘 과제 */
  legacy?: boolean;
};

/** 반 배정 펼침 목록의 학생 한 명 */
export interface SchedulePauseMember {
  studentId: string;
  name: string;
  /** 이 학생만 멈춘 상태 (반 전체 멈춤은 따로) */
  pause: SchedulePauseView | null;
}

/** 이 학생에게 걸리는 기간만 (과제 전체 + 이 학생) */
export function pausesForStudent<T extends Pick<SchedulePauseRange, "studentId">>(
  ranges: readonly T[] | undefined,
  studentId: string
): T[] {
  if (!ranges?.length) return [];
  return ranges.filter((r) => r.studentId === null || r.studentId === studentId);
}

export function isDatePaused(
  ranges: readonly PauseDateRange[] | undefined,
  iso: string
): boolean {
  if (!ranges?.length) return false;
  return ranges.some(
    (r) => r.startDate <= iso && (r.endDate === null || iso < r.endDate)
  );
}

/**
 * iso 날짜에 걸린 멈춤 (여럿이 겹치면 가장 먼저 멈춘 날 · 가장 늦게 다시 나가는 날로 합친다).
 * 멈춰 있지 않으면 null.
 */
export function pauseStateOn(
  ranges: readonly SchedulePauseRange[] | undefined,
  iso: string
): SchedulePauseState | null {
  if (!ranges?.length) return null;
  const covering = ranges.filter(
    (r) => r.startDate <= iso && (r.endDate === null || iso < r.endDate)
  );
  if (covering.length === 0) return null;
  const first = covering.reduce((a, b) => (a.startDate <= b.startDate ? a : b));
  const until = covering.some((r) => r.endDate === null)
    ? null
    : covering.reduce((max, r) => (r.endDate! > max ? r.endDate! : max), iso);
  return {
    since: first.startDate,
    until,
    pausedBy: first.pausedBy,
    pausedAt: first.pausedAt,
  };
}

const MAX_WALK_DAYS = 3700;

/**
 * 끝나는 날이 정해진 과제는 쉰 학습일만큼 끝나는 날을 뒤로 민다
 * (멈춘 곳부터 이어서 나가니 남은 문항이 잘리지 않게).
 * - 끝나는 날이 없으면 그대로 null.
 * - 끝나지 않은 멈춤이 남은 날을 모두 덮으면 null (끝나는 날을 아직 모름).
 */
export function shiftEndDateForPauses(
  assignment: { start_date: string; end_date: string | null; days_of_week: number[] },
  ranges: readonly PauseDateRange[] | undefined
): string | null {
  const end = assignment.end_date;
  if (!end || !ranges?.length) return end;

  const capacity = listStudyDatesInclusive(
    assignment.start_date,
    end,
    assignment.days_of_week
  ).length;
  if (capacity === 0) return end;

  const openFrom = ranges
    .filter((r) => r.endDate === null)
    .reduce<string | null>(
      (min, r) => (min === null || r.startDate < min ? r.startDate : min),
      null
    );

  let counted = 0;
  const cursor = parseDateOnly(assignment.start_date);
  for (let i = 0; i < MAX_WALK_DAYS; i++) {
    const iso = toDateOnlyString(cursor);
    if (openFrom !== null && iso >= openFrom) return null;
    if (isStudyDay(cursor, assignment.days_of_week) && !isDatePaused(ranges, iso)) {
      counted += 1;
      if (counted >= capacity) return iso > end ? iso : end;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return end;
}

/** 쉰 날만큼 끝나는 날을 민 과제 (다른 값은 그대로) */
export function applyPausesToAssignment<
  T extends { start_date: string; end_date: string | null; days_of_week: number[] },
>(assignment: T, ranges: readonly PauseDateRange[] | undefined): T {
  if (!ranges?.length || !assignment.end_date) return assignment;
  const shifted = shiftEndDateForPauses(assignment, ranges);
  return shifted === assignment.end_date ? assignment : { ...assignment, end_date: shifted };
}

/**
 * 시작일부터 target 까지 「멈추지 않은」 학습일 가운데 target 의 순번 (0부터).
 * 학습일이 아니거나 멈춘 날이면 -1.
 */
export function getStudyDayIndexSkippingPauses(
  startDateIso: string,
  targetDateIso: string,
  daysOfWeek: number[],
  ranges: readonly PauseDateRange[] | undefined
): number {
  if (targetDateIso < startDateIso) return -1;
  if (isDatePaused(ranges, targetDateIso)) return -1;
  const dates = listStudyDatesInclusive(startDateIso, targetDateIso, daysOfWeek);
  if (dates[dates.length - 1] !== targetDateIso) return -1;
  let index = -1;
  for (const iso of dates) {
    if (!isDatePaused(ranges, iso)) index += 1;
  }
  return index;
}

/**
 * afterIso 다음의 첫 학습일 중 멈추지 않은 날. 끝나는 날을 넘거나 찾지 못하면 null.
 */
export function nextUnpausedStudyDateAfter(
  afterIso: string,
  daysOfWeek: number[],
  endDateIso: string | null,
  ranges: readonly PauseDateRange[] | undefined,
  maxDays = 120
): string | null {
  const cursor = parseDateOnly(afterIso);
  for (let i = 0; i < maxDays; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const iso = toDateOnlyString(cursor);
    if (endDateIso && iso > endDateIso) return null;
    if (!isStudyDay(cursor, daysOfWeek)) continue;
    if (isDatePaused(ranges, iso)) {
      // 끝나지 않은 멈춤이면 더 볼 필요가 없다
      if (ranges?.some((r) => r.endDate === null && r.startDate <= iso)) return null;
      continue;
    }
    return iso;
  }
  return null;
}
