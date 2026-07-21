"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";

type Txn = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  feature_key: string | null;
  note: string | null;
  created_at: string;
};

type Pricing = {
  feature_key: string;
  label: string;
  credit_cost: number;
  billing_type: string;
  is_active: boolean;
};

type PaymentOrder = {
  id: string;
  order_id: string;
  payment_amount: number;
  total_credit: number;
  bonus_credit: number;
  status: string;
  receipt_url: string | null;
  approved_at: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  grant: "지급",
  debit: "차감",
  adjust: "조정",
  refund: "환불",
  charge: "충전",
};

export function CreditsDashboard({
  title,
  canCharge = false,
}: {
  title?: string;
  /** 학원 admin만 true — teacher는 조회만 */
  canCharge?: boolean;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "불러오기 실패");
        return;
      }
      setBalance(data.wallet?.balance ?? 0);
      setTxns(data.transactions ?? []);
      setPricing(data.pricing ?? []);
      if (canCharge) {
        const payRes = await fetch("/api/credits/payments");
        const payData = await payRes.json();
        if (payData.ok) setPayments(payData.orders ?? []);
      }
    } catch {
      setError("불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [canCharge]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {title ? (
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      ) : null}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-slate-500">현재 잔액</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-brand-900">
          {loading ? "…" : `${(balance ?? 0).toLocaleString("ko-KR")} 크레딧`}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          AI 기능은 사용 시마다, 단어·듣기학습은 학생별 매월 1회 차감됩니다.
          {canCharge
            ? " 아래에서 카드로 충전할 수 있습니다."
            : " 충전이 필요하면 학원 관리자에게 문의해 주세요."}
        </p>
        {canCharge ? (
          <Link
            href="/admin/credits/charge"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            크레딧 충전
          </Link>
        ) : null}
      </div>

      {canCharge ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">충전·결제 내역</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="ui-table w-full text-sm">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>주문번호</th>
                  <th>결제</th>
                  <th>지급</th>
                  <th>상태</th>
                  <th>영수증</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap text-xs text-slate-600">
                      {new Date(o.approved_at || o.created_at).toLocaleString(
                        "ko-KR"
                      )}
                    </td>
                    <td className="max-w-[140px] truncate font-mono text-xs">
                      {o.order_id}
                    </td>
                    <td className="tabular-nums">
                      {Number(o.payment_amount).toLocaleString("ko-KR")}원
                    </td>
                    <td className="tabular-nums">
                      {Number(o.total_credit).toLocaleString("ko-KR")}
                      {Number(o.bonus_credit) > 0
                        ? ` (보너스 ${Number(o.bonus_credit).toLocaleString("ko-KR")})`
                        : ""}
                    </td>
                    <td className="text-xs">{o.status}</td>
                    <td>
                      {o.receipt_url ? (
                        <a
                          href={o.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-700 underline"
                        >
                          보기
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      결제 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">기능별 단가</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="ui-table w-full text-sm">
            <thead>
              <tr>
                <th>기능</th>
                <th>과금</th>
                <th>크레딧</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.feature_key}>
                  <td>{p.label}</td>
                  <td className="text-xs text-slate-500">
                    {p.billing_type === "monthly_seat"
                      ? "학생·월"
                      : "사용 시"}
                  </td>
                  <td className="tabular-nums font-medium">
                    {p.credit_cost.toLocaleString("ko-KR")} 크레딧
                    {p.feature_key === "qg_generate_job" ? "/문항" : ""}
                  </td>
                </tr>
              ))}
              {!loading && pricing.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    단가 정보가 없습니다. (마이그레이션 087 확인)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">거래 내역</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="ui-table w-full text-sm">
            <thead>
              <tr>
                <th>일시</th>
                <th>유형</th>
                <th>금액</th>
                <th>잔액</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td className="whitespace-nowrap text-xs text-slate-600">
                    {new Date(t.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td>{TYPE_LABEL[t.type] ?? t.type}</td>
                  <td
                    className={`tabular-nums font-medium ${
                      t.type === "debit" || t.type === "refund"
                        ? "text-red-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {t.type === "debit" || t.type === "refund" ? "−" : "+"}
                    {t.amount.toLocaleString("ko-KR")}
                  </td>
                  <td className="tabular-nums">
                    {t.balance_after.toLocaleString("ko-KR")}
                  </td>
                  <td className="max-w-[240px] truncate text-xs text-slate-600">
                    {t.note || t.feature_key || "—"}
                  </td>
                </tr>
              ))}
              {!loading && txns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    거래 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
