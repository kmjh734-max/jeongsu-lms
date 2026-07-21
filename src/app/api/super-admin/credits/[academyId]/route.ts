import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";

export const runtime = "nodejs";

/** 특정 학원 거래내역 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ academyId: string }> }
) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    const { academyId } = await ctx.params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 50), 1),
      100
    );

    const [{ data: wallet }, { data: txns }] = await Promise.all([
      client.admin
        .from("academy_wallets")
        .select("academy_id, balance, updated_at")
        .eq("academy_id", academyId)
        .maybeSingle(),
      client.admin
        .from("credit_transactions")
        .select(
          "id, type, amount, balance_after, feature_key, note, metadata, created_at, actor_id"
        )
        .eq("academy_id", academyId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    return NextResponse.json({
      ok: true,
      wallet: wallet ?? { academy_id: academyId, balance: 0, updated_at: null },
      transactions: txns ?? [],
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
