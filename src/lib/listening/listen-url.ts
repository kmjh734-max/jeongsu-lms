import { SITE_URL } from "@/lib/branding";

function listeningSiteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "");
}

export function buildStudentListeningSetUrl(setId: string): string {
  return `${listeningSiteBase()}/student/listening/${setId}`;
}

/** 시험지 QR — 전체·문항별 듣기 허브 */
export function buildStudentListeningHubUrl(setId: string): string {
  return `${listeningSiteBase()}/listen/${setId}`;
}

/** 문항별 직접 재생 (허브에서 사용) */
export function buildStudentListeningAudioUrl(
  setId: string,
  orderIndex: number
): string {
  return `${listeningSiteBase()}/listen/${setId}/${orderIndex}`;
}
