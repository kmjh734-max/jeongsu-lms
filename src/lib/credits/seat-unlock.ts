import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { getFeatureCost, koreaYearMonth, monthlySeatFeatureKey, type MonthlySeatKind } from "@/lib/credits";
import { createAdminClient } from "@/lib/supabase/admin";

/** 이용료 단가는 거의 바뀌지 않아 5분 동안 기억한다 */
const cachedFeatureCost = unstable_cache(
  (featureKey: string) => getFeatureCost(createAdminClient(), featureKey),
  ["seat-feature-cost"],
  { revalidate: 300 }
);

/**
 * 단어·듣기 학습 자료(시험지·문제지 출력)는 학원이 학생 이용료를 내고 있을 때만 쓴다.
 * 학생을 한 명도 배정하지 않고 자료만 뽑아 쓰는 일을 막는다.
 *
 * 이번 달 또는 지난달에 학생 이용료가 한 번이라도 나갔으면 열어 둔다
 * (달이 바뀐 첫날 학생이 아직 공부하지 않았어도 수업 준비는 할 수 있게).
 * 이용료가 꺼져 있거나 0이면 막지 않는다.
 */
export async function hasActiveStudentSeat(
  admin: SupabaseClient,
  academyId: string | null | undefined,
  kind: MonthlySeatKind
): Promise<boolean> {
  if (!academyId) return false;
  const featureKey = monthlySeatFeatureKey(kind);
  const pricing = await cachedFeatureCost(featureKey);
  if (!pricing || !pricing.active || pricing.cost <= 0) return true;

  const [y, m] = koreaYearMonth().split("-").map(Number);
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  // 지난달 1일 0시(한국 시간)부터
  const since = new Date(`${prev}-01T00:00:00+09:00`).toISOString();

  const { data } = await admin
    .from("credit_transactions")
    .select("id")
    .eq("academy_id", academyId)
    .eq("feature_key", featureKey)
    .eq("type", "debit")
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
