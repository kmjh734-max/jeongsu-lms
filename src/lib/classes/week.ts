import { getTodayIsoKorea } from "@/lib/date/korea-today";

/** 반·수강 화면에서 쓰는 날짜 도우미 (한국 시간 기준, 서버·브라우저 모두 사용) */

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** from → to 날짜 차이 (일) */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** 이번 주 월요일 (YYYY-MM-DD) */
export function weekMondayIso(todayIso: string): string {
  const dow = new Date(`${todayIso.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return addDaysIso(todayIso, -((dow + 6) % 7));
}

/** 이번 주 월~금 날짜 */
export function weekdayDatesIso(todayIso: string): string[] {
  const monday = weekMondayIso(todayIso);
  return [0, 1, 2, 3, 4].map((i) => addDaysIso(monday, i));
}

/** 이번 주 월요일 0시(한국)의 시각 */
export function weekStartInstant(todayIso: string): string {
  return new Date(`${weekMondayIso(todayIso)}T00:00:00+09:00`).toISOString();
}

/** 날짜(YYYY-MM-DD) 또는 시각을 한국 날짜로 */
export function toKoreaDateIso(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return getTodayIsoKorea(d);
}

/** "오늘" · "어제" · "3일 전" — 며칠 지났는지도 같이 준다 */
export function relativeStudyDay(
  value: string | null,
  todayIso: string
): { label: string; daysAgo: number | null } {
  if (!value) return { label: "—", daysAgo: null };
  const day = toKoreaDateIso(value);
  const diff = Math.max(0, daysBetweenIso(day, todayIso));
  if (diff === 0) return { label: "오늘", daysAgo: 0 };
  if (diff === 1) return { label: "어제", daysAgo: 1 };
  if (diff < 60) return { label: `${diff}일 전`, daysAgo: diff };
  const [y, m, d] = day.split("-");
  return { label: `${y}.${m}.${d}`, daysAgo: diff };
}

/** 두 시각 중 늦은 쪽 */
export function laterOf(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(b.length === 10 ? `${b}T12:00:00+09:00` : b) >
    Date.parse(a.length === 10 ? `${a}T12:00:00+09:00` : a)
    ? b
    : a;
}
