import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import { cancelApprovedOrder } from "@/lib/payments/credit-orders";

export const runtime = "nodejs";

/** POST { order_uuid, cancel_reason? } — super_admin only */
export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: { order_uuid?: string; cancel_reason?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const orderUuid = body.order_uuid?.trim();
    if (!orderUuid) {
      return NextResponse.json(
        { ok: false, message: "order_uuid가 필요합니다." },
        { status: 400 }
      );
    }

    const order = await cancelApprovedOrder(client.admin, {
      orderUuid,
      actorId: auth.user.id,
      cancelReason: body.cancel_reason?.trim() || "관리자 결제 취소",
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        orderId: order.order_id,
        status: order.status,
        canceledAt: order.canceled_at,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "결제 취소 실패",
      },
      { status: 400 }
    );
  }
}
