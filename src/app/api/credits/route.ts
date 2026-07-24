import { NextResponse } from "next/server";
import { requireStaffCreditsApi } from "@/lib/auth/require-staff-credits-api";

export const runtime = "nodejs";

/** 자기 학원 잔액 + 최근 거래 + 단가표 */
export async function GET(request: Request) {
  try {
    const auth = await requireStaffCreditsApi();
    if ("error" in auth && auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 50), 1),
      100
    );

    const academyId = auth.profile.academy_id!;
    const balanceOnly = searchParams.get("balanceOnly") === "1";

    if (balanceOnly) {
      const { data: wallet } = await auth.supabase
        .from("academy_wallets")
        .select("academy_id, balance, updated_at")
        .eq("academy_id", academyId)
        .maybeSingle();
      return NextResponse.json({
        ok: true,
        wallet: wallet ?? {
          academy_id: academyId,
          balance: 0,
          updated_at: null,
        },
      });
    }

    const [{ data: wallet }, { data: txns }, { data: pricing }] =
      await Promise.all([
        auth.supabase
          .from("academy_wallets")
          .select("academy_id, balance, updated_at")
          .eq("academy_id", academyId)
          .maybeSingle(),
        auth.supabase
          .from("credit_transactions")
          .select(
            "id, type, amount, balance_after, feature_key, note, metadata, created_at, actor_id"
          )
          .eq("academy_id", academyId)
          .order("created_at", { ascending: false })
          .limit(limit),
        auth.supabase
          .from("feature_pricing")
          .select(
            "feature_key, label, credit_cost, billing_type, is_active, updated_at"
          )
          .eq("is_active", true)
          .order("feature_key"),
      ]);

    return NextResponse.json({
      ok: true,
      wallet: wallet ?? {
        academy_id: academyId,
        balance: 0,
        updated_at: null,
      },
      transactions: txns ?? [],
      pricing: pricing ?? [],
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "조회 실패",
      },
      { status: 500 }
    );
  }
}
