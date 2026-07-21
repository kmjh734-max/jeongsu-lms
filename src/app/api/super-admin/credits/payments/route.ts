import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 50), 1),
      200
    );
    const status = searchParams.get("status")?.trim();

    let q = client.admin
      .from("credit_payment_orders")
      .select(
        "id, academy_id, package_id, order_id, payment_amount, paid_credit, bonus_credit, total_credit, status, payment_key, payment_method, receipt_url, requested_by, requested_at, approved_at, canceled_at, failure_code, failure_message, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status);

    const { data: orders, error } = await q;
    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const academyIds = [
      ...new Set((orders ?? []).map((o) => o.academy_id as string)),
    ];
    const { data: academies } = academyIds.length
      ? await client.admin
          .from("academies")
          .select("id, name, slug")
          .in("id", academyIds)
      : { data: [] as { id: string; name: string; slug: string }[] };

    const nameMap = new Map(
      (academies ?? []).map((a) => [a.id as string, a])
    );

    return NextResponse.json({
      ok: true,
      orders: (orders ?? []).map((o) => ({
        ...o,
        academy_name: nameMap.get(o.academy_id as string)?.name ?? null,
        academy_slug: nameMap.get(o.academy_id as string)?.slug ?? null,
      })),
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
