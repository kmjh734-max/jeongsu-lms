import { createAdminClient } from "@/lib/supabase/admin";
import { CreditWallDialog } from "./CreditWallDialog";

/**
 * 크레딧이 떨어져 막히는 순간의 안내를 화면에 달아 둔다.
 * 원장님은 충전 화면으로, 선생님은 원장님 연락처로 이어 준다.
 */
export async function CreditWall({
  academyId,
  canCharge,
}: {
  academyId: string | null | undefined;
  canCharge: boolean;
}) {
  let adminName: string | null = null;
  let adminPhone: string | null = null;

  if (!canCharge && academyId) {
    const { data } = await createAdminClient()
      .from("profiles")
      .select("name, phone")
      .eq("academy_id", academyId)
      .eq("role", "admin")
      .eq("is_active", true)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    adminName = (data?.name as string | null) ?? null;
    adminPhone = (data?.phone as string | null) ?? null;
  }

  return (
    <CreditWallDialog
      canCharge={canCharge}
      chargeHref="/admin/credits/charge"
      adminName={adminName}
      adminPhone={adminPhone}
    />
  );
}
