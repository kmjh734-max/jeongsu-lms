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

  const chunks: string[][] = [];
  for (let i = 0; i < studentIds.length; i += CHUNK) {
    chunks.push(studentIds.slice(i, i + CHUNK));
  }
  // 묶음끼리는 학생이 겹치지 않으니 동시에 읽어도 결과가 같다
  const parts = await Promise.all(
    chunks.map(async (ids) => {
      const { data, error } = await admin
        .from("shared_reports")
        .select("student_id, created_at")
        .in("student_id", ids)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      return error || !data ? [] : data;
    })
  );
  for (const data of parts) {
    for (const row of data) {
      const id = row.student_id as string;
      if (!result[id]) result[id] = row.created_at as string;
    }
  }

  return result;
}
