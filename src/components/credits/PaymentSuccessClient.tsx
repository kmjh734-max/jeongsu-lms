"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";

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
      setError("결제 정보가 올바르지 않아요.");
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
          setError(data.message ?? "결제 승인에 실패했어요.");
          return;
        }
        setDone({
          totalCredit: Number(data.order?.totalCredit ?? 0),
          paymentAmount: Number(data.order?.paymentAmount ?? amount),
          receiptUrl: data.order?.receiptUrl ?? null,
          alreadyApproved: Boolean(data.alreadyApproved),
        });
      } catch {
        if (!cancelled) setError("연결이 잠시 끊겼어요. 크레딧 화면에서 충전 내역을 확인해 주세요.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sp]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card sm:mt-6">
      {error ? (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
            <Icon name="alert" size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">결제를 마치지 못했어요</h1>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        </>
      ) : !done ? (
        <>
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" aria-hidden />
          <div>
            <h1 className="text-lg font-bold text-slate-900">결제를 확인하고 있어요</h1>
            <p className="mt-1 text-sm text-slate-500">크레딧을 넣는 중이에요. 창을 닫지 말아 주세요.</p>
          </div>
        </>
      ) : (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
            <Icon name="check" size={24} strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {done.alreadyApproved ? "이미 처리된 결제예요" : "충전했어요"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {done.alreadyApproved
                ? "크레딧은 한 번만 들어가요."
                : "지금 바로 쓸 수 있어요."}
            </p>
          </div>
          <dl className="w-full rounded-lg bg-slate-50 px-4 py-3 text-[13px]">
            <div className="flex justify-between py-1">
              <dt className="text-slate-500">결제 금액</dt>
              <dd className="font-semibold tabular-nums text-slate-900">
                {done.paymentAmount.toLocaleString("ko-KR")}원
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-slate-500">받은 크레딧</dt>
              <dd className="font-semibold tabular-nums text-green-700">
                +{done.totalCredit.toLocaleString("ko-KR")}
              </dd>
            </div>
          </dl>
        </>
      )}
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <ButtonLink href="/admin/credits">크레딧으로</ButtonLink>
        {done?.receiptUrl ? (
          <a
            href={done.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            영수증 보기
          </a>
        ) : null}
        {error ? (
          <ButtonLink href="/admin/credits/charge" variant="secondary">
            다시 충전하기
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
