import { NextResponse } from "next/server";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import { syncPaymentFromToss } from "@/lib/payments/credit-orders";

export const runtime = "nodejs";

/**
 * Toss webhook — never grant credits from payload alone.
 * Re-fetch payment from Toss API, then approve/refund idempotently.
 */
export async function POST(request: Request) {
  try {
    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: {
      eventType?: string;
      data?: {
        paymentKey?: string;
        orderId?: string;
        status?: string;
      };
      paymentKey?: string;
      orderId?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const paymentKey =
      body.data?.paymentKey?.trim() || body.paymentKey?.trim() || undefined;
    const orderId =
      body.data?.orderId?.trim() || body.orderId?.trim() || undefined;

    if (!paymentKey && !orderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    try {
      const order = await syncPaymentFromToss(client.admin, {
        paymentKey,
        orderId,
      });
      return NextResponse.json({
        ok: true,
        orderId: order?.order_id ?? null,
        status: order?.status ?? null,
      });
    } catch (e) {
      console.error(
        "[toss/webhook] sync failed",
        e instanceof Error ? e.message : e
      );
      // 2xx so Toss does not hammer forever on business errors; ops can replay
      return NextResponse.json({
        ok: false,
        message: e instanceof Error ? e.message : "sync failed",
      });
    }
  } catch (e) {
    console.error("[toss/webhook]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
