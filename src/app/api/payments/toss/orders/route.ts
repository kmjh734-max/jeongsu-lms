import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import { createReadyOrder } from "@/lib/payments/credit-orders";
import { getTossClientKey, getTossEnvMode } from "@/lib/payments/toss/env";

export const runtime = "nodejs";

/** POST { package_id } → create ready order for current admin academy */
export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    if (auth.profile.role !== "admin" || !auth.profile.academy_id) {
      return NextResponse.json(
        { ok: false, message: "학원 관리자만 결제할 수 있습니다." },
        { status: 403 }
      );
    }

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: { package_id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const packageId = body.package_id?.trim();
    if (!packageId) {
      return NextResponse.json(
        { ok: false, message: "package_id가 필요합니다." },
        { status: 400 }
      );
    }

    const order = await createReadyOrder(client.admin, {
      academyId: auth.profile.academy_id,
      packageId,
      requestedBy: auth.user.id,
    });

    const clientKey = getTossClientKey();

    return NextResponse.json({
      ok: true,
      orderId: order.order_id,
      amount: Number(order.payment_amount),
      orderName: `EngCore 크레딧 ${Number(order.total_credit).toLocaleString("ko-KR")}`,
      totalCredit: Number(order.total_credit),
      paidCredit: Number(order.paid_credit),
      bonusCredit: Number(order.bonus_credit),
      clientKey,
      tossEnv: getTossEnvMode(),
      configured: Boolean(clientKey),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "주문 생성 실패",
      },
      { status: 400 }
    );
  }
}
