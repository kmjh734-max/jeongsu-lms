import type { SupabaseClient } from "@supabase/supabase-js";
import type { SchedulePauseRange } from "@/lib/listening/schedule/pauses";

export const PAUSE_TABLE = "listening_schedule_pauses";
const PAUSE_COLUMNS =
  "id, assignment_id, student_id, start_date, end_date, paused_by, paused_at";
const ID_CHUNK = 100;

/** 일시정지 표가 아직 없음 (135 마이그레이션 전) */
export function isMissingPauseTable(
  error: { code?: string | null; message?: string | null } | null | undefined
): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /listening_schedule_pauses/.test(error.message ?? "")
  );
}

export function mapPauseRow(row: Record<string, unknown>): SchedulePauseRange {
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    studentId: (row.student_id as string | null) ?? null,
    startDate: String(row.start_date).slice(0, 10),
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : null,
    pausedBy: (row.paused_by as string | null) ?? null,
    pausedAt: (row.paused_at as string | null) ?? null,
  };
}

/**
 * 과제 id → 일시정지 기간 (과제 전체 + 학생별 모두).
 * 표가 없거나 읽지 못하면 빈 값 — 멈춤이 없는 것처럼 예전대로 돈다.
 */
export async function loadSchedulePauses(
  admin: SupabaseClient,
  assignmentIds: string[]
): Promise<Map<string, SchedulePauseRange[]>> {
  const out = new Map<string, SchedulePauseRange[]>();
  const unique = [...new Set(assignmentIds.filter(Boolean))];
  if (unique.length === 0) return out;

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += ID_CHUNK) {
    chunks.push(unique.slice(i, i + ID_CHUNK));
  }
  const parts = await Promise.all(
    chunks.map(async (ids) => {
      const { data, error } = await admin
        .from(PAUSE_TABLE)
        .select(PAUSE_COLUMNS)
        .in("assignment_id", ids);
      if (error) return [];
      return (data ?? []) as Record<string, unknown>[];
    })
  );

  for (const rows of parts) {
    for (const row of rows) {
      const range = mapPauseRow(row);
      const list = out.get(range.assignmentId) ?? [];
      list.push(range);
      out.set(range.assignmentId, list);
    }
  }
  return out;
}
