import { createAdminClient } from "@/lib/supabase/admin";

const CHUNK = 150;
/** 이 기간보다 오래된 발송은 "안 보냄"으로 본다 */
const LOOKBACK_DAYS = 180;

/**
 * 학생별 마지막 학부모 리포트 링크 생성 시각 (학습 리포트 목록의 "보냄" 표시용).
 * studentIds는 이미 권한 확인을 거친 목록이어야 한다.
 */
export async function loadLastReportShares(
  studentIds: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (studentIds.length === 0) return result;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return result;
  }

  const since = new Date(
    Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  for (let i = 0; i < studentIds.length; i += CHUNK) {
    const ids = studentIds.slice(i, i + CHUNK);
    const { data, error } = await admin
      .from("shared_reports")
      .select("student_id, created_at")
      .in("student_id", ids)
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (error || !data) continue;
    for (const row of data) {
      const id = row.student_id as string;
      if (!result[id]) result[id] = row.created_at as string;
    }
  }

  return result;
}
