import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";

/** 수준 라벨 → level_order (DB 맵과 동기화; 조회 실패 시 폴백) */
const FALLBACK_LEVEL_ORDER: Record<string, number> = {
  Kinder: 0,
  "초등학교 1학년": 1,
  "초등학교 1-2학년": 1.5,
  "초등학교 1~2학년": 1.5,
  "초등학교 2학년": 2,
  "초등학교 2-3학년": 2.5,
  "초등학교 2~3학년": 2.5,
  "초3~초4": 3.5,
  "초3-초4": 3.5,
  "초등학교 3학년": 3,
  "초등학교 3-4학년": 3.5,
  "초등학교 3~4학년": 3.5,
  "초등학교 4학년": 4,
  "초등학교 4-5학년": 4.5,
  "초등학교 4~5학년": 4.5,
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
  // 괄호 밴드(상/중/하 등) 제거 후 매칭
  const normalized = label
    .replace(/\([^)]*\)/g, " ")
    .replace(/~/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized in FALLBACK_LEVEL_ORDER) return FALLBACK_LEVEL_ORDER[normalized];
  // 정확 학년(초등학교 N학년)을 먼저 직접 파싱 → 부분일치 오판 방지
  const gradeMatch = normalized.match(
    /^(초등학교|중학교|고등학교)\s*(\d)\s*학년$/
  );
  if (gradeMatch) {
    const base =
      gradeMatch[1] === "초등학교" ? 0 : gradeMatch[1] === "중학교" ? 7 : 10;
    return base + Number(gradeMatch[2]);
  }
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
