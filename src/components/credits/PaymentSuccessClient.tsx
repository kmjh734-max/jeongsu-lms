"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";

export function PaymentSuccessClient() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    totalCredit: number;
    paymentAmount: number;
    receiptUrl: string | null;
    alreadyApproved: boolean;
  } | null>(null);

  useEffect(() => {
    const paymentKey = sp.get("paymentKey")?.trim();
    const orderId = sp.get("orderId")?.trim();
    const amount = Number(sp.get("amount"));

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      setError("결제 정보가 올바르지 않습니다.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/toss/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) {
          setError(data.message ?? "결제 승인에 실패했습니다.");
          return;
        }
        setDone({
          totalCredit: Number(data.order?.totalCredit ?? 0),
          paymentAmount: Number(data.order?.paymentAmount ?? amount),
          receiptUrl: data.order?.receiptUrl ?? null,
          alreadyApproved: Boolean(data.alreadyApproved),
        });
      } catch {
        if (!cancelled) setError("결제 승인 요청에 실패했습니다.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sp]);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">결제 결과</h1>
      {error && <Alert variant="error">{error}</Alert>}
      {!error && !done && (
        <p className="text-sm text-slate-600">결제 승인 및 크레딧 적립 중…</p>
      )}
      {done && (
        <Alert variant="success">
          {done.alreadyApproved
            ? "이미 처리된 결제입니다. 크레딧은 중복 지급되지 않았습니다."
            : "결제가 완료되었고 크레딧이 적립되었습니다."}
          <br />
          {done.paymentAmount.toLocaleString("ko-KR")}원 →{" "}
          {done.totalCredit.toLocaleString("ko-KR")} 크레딧
        </Alert>
      )}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/admin/credits"
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          크레딧으로 이동
        </Link>
        {done?.receiptUrl ? (
          <a
            href={done.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            영수증 보기
          </a>
        ) : null}
      </div>
    </div>
  );
}
