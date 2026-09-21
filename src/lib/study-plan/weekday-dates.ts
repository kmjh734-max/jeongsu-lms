/** 수업 요일 이름 (0=월 … 6=일) */
export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/** 요일 번호 묶음을 "월수금"처럼 읽는다 */
export function weekdayLabel(weekdays: number[] | null | undefined): string {
  if (!weekdays?.length) return "";
  return [...weekdays]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_LABELS[d])
    .join("");
}

/** 자바스크립트의 요일(0=일)을 우리 번호(0=월)로 바꾼다 */
function toMonFirst(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/**
 * 그 달의 날짜마다 몇 주차인지 정해 둔다.
 *
 * 주는 월요일에 시작한다. 1일이 일요일이면 그 주에는 그 달 날짜가 일요일 하나뿐인데,
 * 수업하는 학원이 없으니 그 주는 세지 않는다(2026년 11월, 2027년 8월이 그렇다).
 * 그래서 주차는 평일이 처음 들어오는 주부터 1주로 센다.
 */
function monthWeekMap(year: number, month: number): { weekOf: Map<number, number>; weeks: number[] } {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstMonday = new Date(first);
  firstMonday.setUTCDate(first.getUTCDate() - toMonFirst(first.getUTCDay()));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  /** 월요일 기준 몇 번째 주인지 → 그 주에 평일이 있는지 */
  const raw = new Map<number, boolean>();
  const rawOf = new Map<number, number>();
  for (let day = 1; day <= lastDay; day += 1) {
    const d = new Date(Date.UTC(year, month - 1, day));
    const idx = Math.floor(Math.round((d.getTime() - firstMonday.getTime()) / 86400000) / 7);
    rawOf.set(day, idx);
    // 월~토가 하루라도 있으면 쓰는 주
    if (toMonFirst(d.getUTCDay()) <= 5) raw.set(idx, true);
    else if (!raw.has(idx)) raw.set(idx, false);
  }

  const used = [...raw].filter(([, ok]) => ok).map(([idx]) => idx).sort((a, b) => a - b);
  const number = new Map(used.map((idx, i) => [idx, i + 1]));
  const weekOf = new Map<number, number>();
  for (const [day, idx] of rawOf) {
    // 안 쓰는 주(일요일 하나뿐인 주)의 날짜는 가장 가까운 쓰는 주에 붙인다
    weekOf.set(day, number.get(idx) ?? (idx < (used[0] ?? 0) ? 1 : used.length));
  }
  return { weekOf, weeks: used.map((_, i) => i + 1) };
}

/**
 * 그 달이 걸치는 주차 — 2026년 9월이면 1~5주, 2027년 2월이면 1~4주.
 */
export function weeksInMonth(year: number, month: number): number[] {
  return monthWeekMap(year, month).weeks;
}

/**
 * 그 달에서 이 요일들에 해당하는 날짜를 주차별로 모은다.
 *
 * 달력 그대로 넣으므로 9월처럼 5주에 걸치면 5주까지 나온다.
 * 모양은 { "1": ["2026-09-02", …], … }.
 */
export function monthSessionDates(
  year: number,
  month: number,
  weekdays: number[] | null | undefined,
): Record<string, string[]> {
  const { weekOf, weeks } = monthWeekMap(year, month);
  const out: Record<string, string[]> = {};
  for (const w of weeks) out[String(w)] = [];
  if (!weekdays?.length) return out;

  const want = new Set(weekdays.filter((d) => d >= 0 && d <= 6));
  if (want.size === 0) return out;

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= lastDay; day += 1) {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (!want.has(toMonFirst(d.getUTCDay()))) continue;
    const week = weekOf.get(day) ?? 1;
    out[String(week)]!.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  return out;
}

/** 한 주에 몇 번 수업하는지 — 요일 수가 곧 회차 수다 */
export function sessionsPerWeekFrom(weekdays: number[] | null | undefined, fallback = 3): number {
  const n = new Set((weekdays ?? []).filter((d) => d >= 0 && d <= 6)).size;
  return n > 0 ? n : fallback;
}
