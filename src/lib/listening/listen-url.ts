import { SITE_URL } from "@/lib/branding";

function listeningSiteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "");
}

export function buildStudentListeningSetUrl(setId: string): string {
  return `${listeningSiteBase()}/student/listening/${setId}`;
}

/** 문항 번호별 음성만 재생하는 QR용 URL */
export function buildStudentListeningAudioUrl(
  setId: string,
  orderIndex: number
): string {
  return `${listeningSiteBase()}/listen/${setId}/${orderIndex}`;
}
