/**
 * 자료함의 "만든 파일"(수업용 자료 · 지문 분석서 · 워크북) 공용 타입과 이름 규칙.
 * 테이블: lesson_material_documents (supabase/migrations/128).
 */

export type LessonMaterialDocumentKind = "lesson_pack" | "analysis_report" | "workbook";

export type LessonMaterialDocumentRow = {
  id: string;
  kind: LessonMaterialDocumentKind;
  name: string;
  project_ids: string[];
  created_at: string;
  updated_at: string;
};

export const DOCUMENT_NAME_PREFIX: Record<LessonMaterialDocumentKind, string> = {
  lesson_pack: "수업용자료",
  analysis_report: "지문분석서",
  workbook: "워크북",
};

/** 한국 시간 기준 MMDD. 서버(UTC)에서 불러도 날짜가 하루 밀리지 않는다. */
export function koreanMonthDay(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${month}${day}`;
}

/** 수업용자료_0911, 지문분석서_0911, 워크북_0911 */
export function defaultDocumentName(kind: LessonMaterialDocumentKind, now = new Date()): string {
  return `${DOCUMENT_NAME_PREFIX[kind]}_${koreanMonthDay(now)}`;
}

/** 같은 이름이 있으면 _0911-2, _0911-3 ... 을 붙인다. */
export function uniqueDocumentName(base: string, taken: Iterable<string>): string {
  const names = new Set(taken);
  if (!names.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!names.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export function documentPagePath(
  role: "admin" | "teacher",
  kind: LessonMaterialDocumentKind
): string {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  if (kind === "lesson_pack") return `${base}/lesson-pack`;
  if (kind === "analysis_report") return `${base}/analysis-report`;
  return `${base}/workbook`;
}
