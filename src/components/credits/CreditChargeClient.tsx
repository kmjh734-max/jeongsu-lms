"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { CardIcon } from "@/components/credits/CreditsDashboard";

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
        setError("충전 상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const list = (data.packages ?? []) as Pkg[];
      setPackages(list);
      if (list[0]) setSelectedId(list[0].id);
    } catch {
      setError("충전 상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
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
        setInfo("결제를 준비하지 못했어요. 잠시 후 다시 시도해 주세요.");
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
        console.error("toss widget:", e);
        setError("결제 창을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
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
        setError(orderData.message ?? "주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (!orderData.configured || !orderData.clientKey) {
        setError("결제를 준비하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const widgets = widgetsRef.current;
      if (!widgets) {
        setError("결제 창이 아직 준비되지 않았어요. 잠시 후 다시 눌러 주세요.");
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
      setError(e instanceof Error ? e.message : "결제를 시작하지 못했어요.");
    } finally {
      setPaying(false);
    }
  }

  const isTestMode = Boolean(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim().startsWith("test_")
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/admin/credits"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-800"
        >
          <Icon name="left" size={16} />
          크레딧
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">
            크레딧 충전
          </h1>
          {isTestMode ? (
            <span className="inline-flex h-[22px] items-center rounded bg-slate-100 px-2 text-xs font-semibold text-slate-600">
              시험 결제
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          상품을 고르고 카드로 결제해요. 큰 상품일수록 보너스 크레딧이 더 붙어요.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {info && <Alert variant="info">{info}</Alert>}

      <section aria-label="충전 상품" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[118px] animate-pulse rounded-lg bg-white shadow-card" />
            ))
          : null}
        {!loading && packages.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-card sm:col-span-2 xl:col-span-4">
            지금은 충전할 수 있는 상품이 없어요.
          </p>
        ) : null}
        {packages.map((p) => {
          const active = p.id === selectedId;
          const bonus = Number(p.bonus_credit);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              aria-pressed={active}
              className={`relative flex flex-col gap-1 rounded-lg border bg-white px-[18px] py-4 text-left shadow-card transition ${
                active
                  ? "border-brand-600 ring-1 ring-brand-600"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {active ? <Icon name="check" size={12} strokeWidth={3} /> : null}
                </span>
              </span>
              <span className="text-[22px] font-bold tabular-nums tracking-tight text-slate-900">
                {formatWon(Number(p.payment_amount))}
              </span>
              <span className="text-[13px] tabular-nums text-slate-600">
                {Number(p.credit_amount).toLocaleString("ko-KR")} 크레딧
                {bonus > 0 ? (
                  <span className="font-semibold text-green-700">
                    {" "}+ 보너스 {bonus.toLocaleString("ko-KR")}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-[18px] shadow-card sm:px-[22px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-bold text-slate-900">결제</h2>
          {selected ? (
            <span className="text-[13px] tabular-nums text-slate-500">
              {selected.name} · {Number(selected.total_credit).toLocaleString("ko-KR")} 크레딧 받기
            </span>
          ) : null}
        </div>
        <div id="toss-payment-methods" className="mt-3 min-h-[120px]" />
        <div id="toss-agreement" className="mt-3" />
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => void startPayment()}
            disabled={!selected || paying || !widgetsReady}
            className="h-11 w-full text-[15px] sm:w-auto sm:min-w-[220px]"
          >
            <CardIcon />
            {paying
              ? "결제 창 여는 중…"
              : selected
                ? `${formatWon(Number(selected.payment_amount))} 결제하기`
                : "상품을 골라 주세요"}
          </Button>
        </div>
      </section>
    </div>
  );
}
