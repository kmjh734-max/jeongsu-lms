import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

/** 수준 라벨 → level_order (DB 맵과 동기화; 조회 실패 시 폴백) */
const FALLBACK_LEVEL_ORDER: Record<string, number> = {
  Kinder: 0,
  "초등학교 1학년": 1,
  "초등학교 1-2학년": 1.5,
  "초등학교 1~2학년": 1.5,
  "초3~초4": 3.5,
  "초3-초4": 3.5,
  "초등학교 3학년": 3,
  "초등학교 3-4학년": 3.5,
  "초등학교 3~4학년": 3.5,
  "초등학교 5학년": 5,
  "초등학교 5-6학년": 5.5,
  "초등학교 5~6학년": 5.5,
  "초등학교 6학년": 6,
  "중학교 1학년": 8,
  "중학교 2학년": 9,
  "중학교 3학년": 10,
  "고등학교 1학년": 11,
  "고등학교 2학년": 12,
  "고등학교 3학년": 13,
};

export function resolveLevelOrder(label: string | null | undefined): number | null {
  if (!label) return null;
  const normalized = label.replace(/~/g, "-").replace(/\s+/g, " ").trim();
  if (normalized in FALLBACK_LEVEL_ORDER) return FALLBACK_LEVEL_ORDER[normalized];
  for (const [k, v] of Object.entries(FALLBACK_LEVEL_ORDER)) {
    if (normalized.includes(k) || k.includes(normalized)) return v;
  }
  return null;
}

export function estimatedRequiredCount(
  total: number | null,
  percentage: number | null
): number | null {
  if (total == null || percentage == null) return null;
  return Math.round((total * percentage) / 100);
}

export type SaveNeltDraftInput = {
  academyId: string;
  createdBy: string;
  draft: NeltExtractedDraft;
  studentNameOverride?: string | null;
  sourceUrl: string;
};
