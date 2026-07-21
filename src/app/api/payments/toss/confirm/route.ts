import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import { confirmAndCreditOrder } from "@/lib/payments/credit-orders";

export const runtime = "nodejs";

/** POST { paymentKey, orderId, amount } — server re-validates everything */
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

    let body: { paymentKey?: string; orderId?: string; amount?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const paymentKey = body.paymentKey?.trim();
    const orderId = body.orderId?.trim();
    const amount = Number(body.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "paymentKey, orderId, amount가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await confirmAndCreditOrder(client.admin, {
      orderId,
      paymentKey,
      amountFromClient: amount,
      academyId: auth.profile.academy_id,
    });

    return NextResponse.json({
      ok: true,
      alreadyApproved: result.alreadyApproved,
      order: {
        orderId: result.order.order_id,
        status: result.order.status,
        paymentAmount: Number(result.order.payment_amount),
        totalCredit: Number(result.order.total_credit),
        paidCredit: Number(result.order.paid_credit),
        bonusCredit: Number(result.order.bonus_credit),
        receiptUrl: result.order.receipt_url,
        approvedAt: result.order.approved_at,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "결제 승인 실패";
    console.error("[toss/confirm]", message);
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
