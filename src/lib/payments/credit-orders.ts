import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cancelTossPayment,
  confirmTossPayment,
  isTossCanceledStatus,
  isTossPaidStatus,
  retrieveTossPayment,
  retrieveTossPaymentByOrderId,
  type TossPayment,
} from "@/lib/payments/toss/client";

export type CreditPackage = {
  id: string;
  name: string;
  payment_amount: number;
  credit_amount: number;
  bonus_credit: number;
  is_active: boolean;
  display_order: number;
};

export type CreditPaymentOrder = {
  id: string;
  academy_id: string;
  package_id: string;
  order_id: string;
  payment_amount: number;
  paid_credit: number;
  bonus_credit: number;
  total_credit: number;
  status: string;
  payment_key: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  requested_by: string;
  requested_at: string;
  approved_at: string | null;
  canceled_at: string | null;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
  updated_at: string;
};

export function generatePaymentOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(12).toString("hex");
  return `ord_${ts}_${rand}`;
}

export async function loadActivePackage(
  admin: SupabaseClient,
  packageId: string
): Promise<CreditPackage | null> {
  const { data } = await admin
    .from("credit_packages")
    .select(
      "id, name, payment_amount, credit_amount, bonus_credit, is_active, display_order"
    )
    .eq("id", packageId)
    .maybeSingle();
  if (!data || !data.is_active) return null;
  return data as CreditPackage;
}

export async function createReadyOrder(
  admin: SupabaseClient,
  params: {
    academyId: string;
    packageId: string;
    requestedBy: string;
  }
): Promise<CreditPaymentOrder> {
  const pkg = await loadActivePackage(admin, params.packageId);
  if (!pkg) {
    throw new Error("유효하지 않거나 비활성인 충전 상품입니다.");
  }

  const orderId = generatePaymentOrderId();
  const paid = Number(pkg.credit_amount);
  const bonus = Number(pkg.bonus_credit);
  const total = paid + bonus;

  const { data, error } = await admin
    .from("credit_payment_orders")
    .insert({
      academy_id: params.academyId,
      package_id: pkg.id,
      order_id: orderId,
      payment_amount: Number(pkg.payment_amount),
      paid_credit: paid,
      bonus_credit: bonus,
      total_credit: total,
      status: "ready",
      requested_by: params.requestedBy,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "주문 생성에 실패했습니다.");
  }
  return data as CreditPaymentOrder;
}

export async function getOrderByOrderId(
  admin: SupabaseClient,
  orderId: string
): Promise<CreditPaymentOrder | null> {
  const { data } = await admin
    .from("credit_payment_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  return (data as CreditPaymentOrder) || null;
}

async function markOrder(
  admin: SupabaseClient,
  id: string,
  patch: Record<string, unknown>
) {
  await admin
    .from("credit_payment_orders")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function approveOrderInDb(
  admin: SupabaseClient,
  params: {
    orderUuid: string;
    paymentKey: string;
    paymentMethod?: string | null;
    receiptUrl?: string | null;
  }
): Promise<CreditPaymentOrder> {
  const { data, error } = await admin.rpc("approve_credit_payment_order", {
    p_order_uuid: params.orderUuid,
    p_payment_key: params.paymentKey,
    p_payment_method: params.paymentMethod ?? null,
    p_receipt_url: params.receiptUrl ?? null,
  });
  if (error) throw new Error(error.message);
  return data as CreditPaymentOrder;
}

function paymentMethodLabel(p: TossPayment): string | null {
  if (p.method) return String(p.method);
  if (p.card?.company) return String(p.card.company);
  return null;
}

/**
 * Confirm with Toss then credit once. Safe to retry.
 */
export async function confirmAndCreditOrder(
  admin: SupabaseClient,
  params: {
    orderId: string;
    paymentKey: string;
    amountFromClient: number;
    academyId: string;
  }
): Promise<{ order: CreditPaymentOrder; alreadyApproved: boolean }> {
  const order = await getOrderByOrderId(admin, params.orderId);
  if (!order) throw new Error("주문을 찾을 수 없습니다.");
  if (order.academy_id !== params.academyId) {
    throw new Error("다른 학원의 주문입니다.");
  }

  if (order.status === "approved") {
    return { order, alreadyApproved: true };
  }
  if (order.status === "canceled" || order.status === "cancel_pending") {
    throw new Error("취소된(또는 취소 중인) 주문입니다.");
  }
  if (order.status === "failed") {
    throw new Error("실패한 주문입니다. 새 주문을 만들어 주세요.");
  }

  if (Number(order.payment_amount) !== Number(params.amountFromClient)) {
    await markOrder(admin, order.id, {
      status: "failed",
      failure_code: "AMOUNT_mismatch",
      failure_message: "결제 금액이 주문과 일치하지 않습니다.",
    });
    throw new Error("결제 금액이 주문과 일치하지 않습니다.");
  }

  await markOrder(admin, order.id, { status: "processing" });

  let tossPayment: TossPayment;
  try {
    tossPayment = await confirmTossPayment({
      paymentKey: params.paymentKey,
      orderId: order.order_id,
      amount: Number(order.payment_amount),
    });
  } catch (e) {
    // Already confirmed on Toss → retrieve and recover
    const msg = e instanceof Error ? e.message : "";
    const code = (e as { code?: string })?.code || "";
    if (
      /ALREADY_PROCESSED|already/i.test(code) ||
      /이미 처리/i.test(msg)
    ) {
      tossPayment = await retrieveTossPayment(params.paymentKey);
    } else {
      await markOrder(admin, order.id, {
        status: "failed",
        failure_code: code || "confirm_failed",
        failure_message: msg.slice(0, 500),
      });
      throw e;
    }
  }

  if (tossPayment.orderId !== order.order_id) {
    throw new Error("토스 응답 orderId가 일치하지 않습니다.");
  }
  if (Number(tossPayment.totalAmount) !== Number(order.payment_amount)) {
    throw new Error("토스 승인 금액이 주문과 일치하지 않습니다.");
  }
  if (tossPayment.status !== "DONE" && !isTossPaidStatus(tossPayment.status)) {
    throw new Error(`결제 상태가 승인 완료가 아닙니다: ${tossPayment.status}`);
  }

  const approved = await approveOrderInDb(admin, {
    orderUuid: order.id,
    paymentKey: tossPayment.paymentKey,
    paymentMethod: paymentMethodLabel(tossPayment),
    receiptUrl: tossPayment.receipt?.url ?? null,
  });

  return { order: approved, alreadyApproved: false };
}

/**
 * Webhook / recovery: never trust payload alone — re-fetch from Toss.
 */
export async function syncPaymentFromToss(
  admin: SupabaseClient,
  params: { orderId?: string; paymentKey?: string }
): Promise<CreditPaymentOrder | null> {
  let toss: TossPayment | null = null;
  if (params.paymentKey) {
    toss = await retrieveTossPayment(params.paymentKey);
  } else if (params.orderId) {
    toss = await retrieveTossPaymentByOrderId(params.orderId);
  }
  if (!toss) return null;

  const order = await getOrderByOrderId(admin, toss.orderId);
  if (!order) return null;

  if (isTossCanceledStatus(toss.status)) {
    if (order.status === "canceled") return order;
    if (order.status === "approved" || order.status === "cancel_pending") {
      const { data, error } = await admin.rpc("refund_credit_payment_order", {
        p_order_uuid: order.id,
        p_actor_id: order.requested_by,
        p_force: false,
      });
      if (error) {
        // Mark cancel_pending for manual follow-up
        await markOrder(admin, order.id, {
          status: "cancel_pending",
          failure_code: "refund_db_failed",
          failure_message: error.message.slice(0, 500),
        });
        throw new Error(error.message);
      }
      return data as CreditPaymentOrder;
    }
    await markOrder(admin, order.id, {
      status: "canceled",
      canceled_at: new Date().toISOString(),
    });
    return (await getOrderByOrderId(admin, order.order_id))!;
  }

  if (isTossPaidStatus(toss.status) || toss.status === "DONE") {
    if (Number(toss.totalAmount) !== Number(order.payment_amount)) {
      return order;
    }
    if (order.status === "approved") return order;
    if (order.status === "ready" || order.status === "processing") {
      return approveOrderInDb(admin, {
        orderUuid: order.id,
        paymentKey: toss.paymentKey,
        paymentMethod: paymentMethodLabel(toss),
        receiptUrl: toss.receipt?.url ?? null,
      });
    }
  }

  return order;
}

export async function cancelApprovedOrder(
  admin: SupabaseClient,
  params: {
    orderUuid: string;
    actorId: string;
    cancelReason: string;
  }
): Promise<CreditPaymentOrder> {
  const { data: order, error } = await admin
    .from("credit_payment_orders")
    .select("*")
    .eq("id", params.orderUuid)
    .maybeSingle();

  if (error || !order) throw new Error("주문을 찾을 수 없습니다.");
  const o = order as CreditPaymentOrder;

  if (o.status === "canceled") return o;
  if (o.status !== "approved" && o.status !== "cancel_pending") {
    throw new Error("승인 완료된 결제만 취소할 수 있습니다.");
  }
  if (!o.payment_key) throw new Error("paymentKey가 없습니다.");

  // Pre-check usage before calling Toss
  const { count: debitCount } = await admin
    .from("credit_transactions")
    .select("id", { count: "exact", head: true })
    .eq("academy_id", o.academy_id)
    .eq("type", "debit")
    .gte("created_at", o.approved_at ?? o.created_at);

  if ((debitCount ?? 0) > 0) {
    throw new Error(
      "해당 충전 이후 크레딧이 사용되어 자동 취소할 수 없습니다. 수동 확인이 필요합니다."
    );
  }

  const { data: wallet } = await admin
    .from("academy_wallets")
    .select("balance")
    .eq("academy_id", o.academy_id)
    .maybeSingle();
  if ((wallet?.balance ?? 0) < Number(o.total_credit)) {
    throw new Error(
      "잔액이 충전분보다 적어 자동 취소할 수 없습니다. 수동 확인이 필요합니다."
    );
  }

  await markOrder(admin, o.id, { status: "cancel_pending" });

  try {
    await cancelTossPayment({
      paymentKey: o.payment_key,
      cancelReason: params.cancelReason,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "토스 취소 실패";
    const code = (e as { code?: string })?.code || "";
    if (!/ALREADY_CANCELED|이미 취소/i.test(`${code} ${msg}`)) {
      await markOrder(admin, o.id, {
        failure_code: code || "cancel_failed",
        failure_message: msg.slice(0, 500),
      });
      throw e;
    }
  }

  const { data, error: rpcErr } = await admin.rpc("refund_credit_payment_order", {
    p_order_uuid: o.id,
    p_actor_id: params.actorId,
    p_force: false,
  });
  if (rpcErr) {
    await markOrder(admin, o.id, {
      status: "cancel_pending",
      failure_code: "refund_db_failed",
      failure_message: rpcErr.message.slice(0, 500),
    });
    throw new Error(rpcErr.message);
  }
  return data as CreditPaymentOrder;
}
