import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const runtime = "nodejs";

/** Own academy payment orders (admin) */
export async function GET(request: Request) {
  try {
    const auth = await requireAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    if (auth.profile.role !== "admin" || !auth.profile.academy_id) {
      return NextResponse.json(
        { ok: false, message: "학원 관리자만 이용할 수 있습니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 30), 1),
      100
    );

    const { data, error } = await auth.supabase
      .from("credit_payment_orders")
      .select(
        "id, order_id, payment_amount, paid_credit, bonus_credit, total_credit, status, payment_method, receipt_url, requested_at, approved_at, canceled_at, created_at"
      )
      .eq("academy_id", auth.profile.academy_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            error.message.includes("credit_payment_orders")
              ? "결제 주문 테이블이 없습니다. 마이그레이션 095를 적용해 주세요."
              : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, orders: data ?? [] });
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
