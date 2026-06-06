/** 학생 화면 기준 오늘 날짜 (Asia/Seoul, YYYY-MM-DD) */
export function getTodayIsoKorea(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
