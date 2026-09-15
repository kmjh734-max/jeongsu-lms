/** "9월 15일 화요일" (한국 시간) */
export function koreaDateLabel(date = new Date()): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}
