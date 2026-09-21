import { WEEKS } from "./index";

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
 * 그 달에서 이 요일들에 해당하는 날짜를 주차별로 모은다.
 *
 * 주차는 그 달 1일이 속한 주부터 센다(월요일 시작). 표는 4주까지만 쓰므로
 * 5주째 날짜는 4주에 이어 붙인다. 돌려주는 모양은 { "1": ["2026-09-02", …], … }.
 */
export function monthSessionDates(
  year: number,
  month: number,
  weekdays: number[] | null | undefined,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const w of WEEKS) out[String(w)] = [];
  if (!weekdays?.length) return out;

  const want = new Set(weekdays.filter((d) => d >= 0 && d <= 6));
  if (want.size === 0) return out;

  const first = new Date(Date.UTC(year, month - 1, 1));
  // 그 달 1일이 속한 주의 월요일
  const firstMonday = new Date(first);
  firstMonday.setUTCDate(first.getUTCDate() - toMonFirst(first.getUTCDay()));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  for (let day = 1; day <= lastDay; day += 1) {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (!want.has(toMonFirst(d.getUTCDay()))) continue;
    const diffDays = Math.round((d.getTime() - firstMonday.getTime()) / 86400000);
    const week = Math.min(WEEKS.length, Math.floor(diffDays / 7) + 1);
    out[String(week)]!.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return out;
}

/** 한 주에 몇 번 수업하는지 — 요일 수가 곧 회차 수다 */
export function sessionsPerWeekFrom(weekdays: number[] | null | undefined, fallback = 3): number {
  const n = new Set((weekdays ?? []).filter((d) => d >= 0 && d <= 6)).size;
  return n > 0 ? n : fallback;
}
