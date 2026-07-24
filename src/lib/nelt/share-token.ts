import { resolveShareBaseUrl, generateShareToken, shareExpiresAt } from "@/lib/reports/share-token";

export { generateShareToken, shareExpiresAt, resolveShareBaseUrl };

export function buildNeltShareUrl(token: string, baseUrl?: string): string {
  const base = (baseUrl ?? resolveShareBaseUrl()).replace(/\/$/, "");
  return `${base}/nelt/share/${token}`;
}
