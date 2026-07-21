"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

type Pkg = {
  id: string;
  name: string;
  payment_amount: number;
  credit_amount: number;
  bonus_credit: number;
  total_credit: number;
};

function formatWon(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function CreditChargeClient() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);
  // Toss widgets instance (SDK typings are large; keep local ref loosely typed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetsRef = useRef<any>(null);
  const customerKeyRef = useRef(`engcore_${crypto.randomUUID().replace(/-/g, "")}`);

  const selected = useMemo(
    () => packages.find((p) => p.id === selectedId) ?? null,
    [packages, selectedId]
  );

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/credits/packages");
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "상품 목록을 불러오지 못했습니다.");
        return;
      }
      const list = (data.packages ?? []) as Pkg[];
      setPackages(list);
      if (list[0]) setSelectedId(list[0].id);
    } catch {
      setError("상품 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    let cancelled = false;
    async function setupWidget() {
      setWidgetsReady(false);
      widgetsRef.current = null;
      if (!selected) return;

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
      if (!clientKey) {
        setInfo(
          "토스페이먼츠 테스트 키가 아직 설정되지 않았습니다. NEXT_PUBLIC_TOSS_CLIENT_KEY / TOSS_SECRET_KEY를 넣은 뒤 결제를 진행할 수 있습니다."
        );
        return;
      }
      setInfo(null);

      try {
        const toss = await loadTossPayments(clientKey);
        const widgets = toss.widgets({
          customerKey: customerKeyRef.current || ANONYMOUS,
        });
        await widgets.setAmount({
          currency: "KRW",
          value: Number(selected.payment_amount),
        });
        if (cancelled) return;
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#toss-payment-methods",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#toss-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        if (cancelled) return;
        widgetsRef.current = widgets;
        setWidgetsReady(true);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "결제 위젯을 불러오지 못했습니다. 클라이언트 키를 확인해 주세요."
        );
      }
    }
    void setupWidget();
    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.payment_amount]);

  async function startPayment() {
    if (!selected) return;
    setPaying(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/toss/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: selected.id }),
      });
      const orderData = await orderRes.json();
      if (!orderData.ok) {
        setError(orderData.message ?? "주문 생성 실패");
        return;
      }
      if (!orderData.configured || !orderData.clientKey) {
        setError(
          "토스 클라이언트 키가 없습니다. 환경변수 NEXT_PUBLIC_TOSS_CLIENT_KEY를 설정해 주세요."
        );
        return;
      }

      const widgets = widgetsRef.current;
      if (!widgets) {
        setError("결제 위젯이 준비되지 않았습니다.");
        return;
      }

      await widgets.setAmount({
        currency: "KRW",
        value: Number(orderData.amount),
      });

      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId: orderData.orderId,
        orderName: orderData.orderName,
        successUrl: `${origin}/admin/credits/payment/success`,
        failUrl: `${origin}/admin/credits/payment/fail`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "결제 요청 실패");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/credits"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← 크레딧으로
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {info && <Alert variant="info">{info}</Alert>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">충전 상품</h2>
        <p className="mt-1 text-xs text-slate-500">
          고액 상품일수록 보너스 크레딧이 더 많이 지급됩니다.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {loading && (
            <p className="text-sm text-slate-500 sm:col-span-2">불러오는 중…</p>
          )}
          {!loading && packages.length === 0 && (
            <p className="text-sm text-slate-500 sm:col-span-2">
              판매 중인 상품이 없습니다. (마이그레이션 095 확인)
            </p>
          )}
          {packages.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  <span className="text-sm font-bold tabular-nums text-brand-900">
                    {formatWon(Number(p.payment_amount))}
                  </span>
                </div>
                <p className="mt-2 text-sm tabular-nums text-slate-700">
                  {Number(p.credit_amount).toLocaleString("ko-KR")} 크레딧
                  {Number(p.bonus_credit) > 0 ? (
                    <span className="ml-1 font-medium text-emerald-700">
                      + 보너스 {Number(p.bonus_credit).toLocaleString("ko-KR")}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  합계{" "}
                  {(
                    Number(p.credit_amount) + Number(p.bonus_credit)
                  ).toLocaleString("ko-KR")}{" "}
                  크레딧 지급
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">카드 결제</h2>
        <div id="toss-payment-methods" className="mt-3 min-h-[120px]" />
        <div id="toss-agreement" className="mt-3" />
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => void startPayment()}
            disabled={!selected || paying || !widgetsReady}
          >
            {paying
              ? "결제 창 여는 중…"
              : selected
                ? `${formatWon(Number(selected.payment_amount))} 결제하기`
                : "상품을 선택하세요"}
          </Button>
        </div>
      </div>
    </div>
  );
}
