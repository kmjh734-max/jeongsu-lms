import { SITE_URL } from "@/lib/branding";

export function buildStudentListeningSetUrl(setId: string): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL
  ).replace(/\/$/, "");
  return `${base}/student/listening/${setId}`;
}
