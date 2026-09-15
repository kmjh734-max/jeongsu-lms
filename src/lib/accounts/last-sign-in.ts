import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 계정별 마지막 로그인 시각 (auth.users). 강사·관리자처럼 수가 적은 명단에만 쓴다.
 * 조회에 실패하면 빈 값.
 */
export async function loadLastSignIns(
  userIds: string[]
): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  if (userIds.length === 0 || userIds.length > 200) return out;
  try {
    const admin = createAdminClient();
    const results = await Promise.all(
      userIds.map((id) =>
        admin.auth.admin
          .getUserById(id)
          .then(({ data }) => [id, data.user?.last_sign_in_at ?? null] as const)
          .catch(() => [id, null] as const)
      )
    );
    for (const [id, at] of results) out[id] = at;
  } catch {
    // 서비스 키가 없거나 조회 실패 — 표시만 생략
  }
  return out;
}
