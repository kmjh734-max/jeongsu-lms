"use client";

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

const TYPE_LABEL: Record<string, string> = {
  grant: "지급",
  debit: "차감",
  adjust: "조정",
  refund: "환불",
};

export function CreditsDashboard({ title }: { title?: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
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
    } catch {
      setError("불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

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
          충전이 필요하면 학원 담당자에게 문의해 주세요.
        </p>
      </div>

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
                    {p.credit_cost}
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
                      t.type === "debit" ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {t.type === "debit" ? "−" : "+"}
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
