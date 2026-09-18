import { createAdminClient } from "@/lib/supabase/admin";

export type PublicPackage = {
  id: string;
  name: string;
  paymentAmount: number;
  credit: number;
  bonus: number;
};

export type PublicFeaturePrice = {
  key: string;
  label: string;
  credit: number;
  billing: string;
};

/**
 * 공개 요금 안내 — 충전 상품과 기능별 크레딧. 충전 화면·차감에 쓰는 표와 같은 값을 읽는다
 * (홈페이지와 실제 결제 금액이 어긋나면 안 된다).
 */
export async function loadPublicPricing(): Promise<{
  packages: PublicPackage[];
  features: PublicFeaturePrice[];
}> {
  const admin = createAdminClient();
  const [{ data: pk }, { data: fp }] = await Promise.all([
    admin
      .from("credit_packages")
      .select("id, name, payment_amount, credit_amount, bonus_credit, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    admin
      .from("feature_pricing")
      .select("feature_key, label, credit_cost, billing_type")
      .eq("is_active", true)
      .order("credit_cost", { ascending: false }),
  ]);
  return {
    packages: (pk ?? []).map((p) => ({
      id: String(p.id),
      name: String(p.name),
      paymentAmount: Number(p.payment_amount),
      credit: Number(p.credit_amount),
      bonus: Number(p.bonus_credit ?? 0),
    })),
    features: (fp ?? []).map((f) => ({
      key: String(f.feature_key),
      label: String(f.label),
      credit: Number(f.credit_cost),
      billing: String(f.billing_type),
    })),
  };
}
