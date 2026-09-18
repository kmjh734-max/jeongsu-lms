/** 3486 → "58분", 125 → "2분 5초" */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m >= 60) return `${Math.floor(m / 60)}시간 ${m % 60}분`;
  if (m >= 10 || s === 0) return `${m}분`;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}
