/** JS Date.getDay(): 0=일, 1=월, …, 6=토 */

export const DAY_LABELS: Record<number, string> = {
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
};

export const WEEKDAY_PRESETS = {
  weekdays: [1, 2, 3, 4, 5],
  monWedFri: [1, 3, 5],
  tueThu: [2, 4],
  everyDay: [0, 1, 2, 3, 4, 5, 6],
  weekend: [0, 6],
} as const;

export function formatDaysOfWeek(days: number[]): string {
  const sorted = [...days].sort((a, b) => {
    const aa = a === 0 ? 7 : a;
    const bb = b === 0 ? 7 : b;
    return aa - bb;
  });
  return sorted.map((d) => DAY_LABELS[d] ?? "?").join("·");
}

export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isStudyDay(date: Date, daysOfWeek: number[]): boolean {
  return daysOfWeek.includes(date.getDay());
}

/** start~end(포함) 사이 학습일 개수에서 targetDate의 학습일 순번 (0-based). 학습일 아니면 -1 */
export function getStudyDayIndex(
  startDateIso: string,
  targetDateIso: string,
  daysOfWeek: number[]
): number {
  const start = parseDateOnly(startDateIso);
  const target = parseDateOnly(targetDateIso);
  if (target < start) return -1;

  let index = -1;
  const cursor = new Date(start);
  while (cursor <= target) {
    if (isStudyDay(cursor, daysOfWeek)) {
      index++;
      if (toDateOnlyString(cursor) === targetDateIso) return index;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return -1;
}

export function nextStudyDateAfter(
  afterIso: string,
  daysOfWeek: number[],
  endDateIso: string | null,
  maxDays = 60
): string | null {
  const cursor = parseDateOnly(afterIso);
  cursor.setDate(cursor.getDate() + 1);
  const end = endDateIso ? parseDateOnly(endDateIso) : null;

  for (let i = 0; i < maxDays; i++) {
    if (end && cursor > end) return null;
    if (isStudyDay(cursor, daysOfWeek)) return toDateOnlyString(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

/** start~end(포함) 학습일 ISO 목록 */
export function listStudyDatesInclusive(
  startIso: string,
  endIso: string,
  daysOfWeek: number[]
): string[] {
  const out: string[] = [];
  const cursor = parseDateOnly(startIso);
  const end = parseDateOnly(endIso);
  if (end < cursor) return out;
  while (cursor <= end) {
    if (isStudyDay(cursor, daysOfWeek)) out.push(toDateOnlyString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
