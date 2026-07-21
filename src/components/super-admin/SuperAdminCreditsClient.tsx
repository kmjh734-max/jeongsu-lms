"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  CREDIT_PACKS,
  CREDIT_WON_PER_UNIT,
  creditsToWon,
  formatWon,
} from "@/lib/credits/pricing-guide";

type AcademyRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  balance: number;
};

type Pricing = {
  feature_key: string;
  label: string;
  credit_cost: number;
  billing_type: string;
  is_active: boolean;
};

type Txn = {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  feature_key: string | null;
  note: string | null;
  created_at: string;
};

export function SuperAdminCreditsClient() {
  const [academies, setAcademies] = useState<AcademyRow[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<"grant" | "debit">("grant");
  const [txns, setTxns] = useState<Txn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/super-admin/credits");
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "불러오기 실패");
        return;
      }
      setAcademies(data.academies ?? []);
      setPricing(data.pricing ?? []);
      if (!selectedId && data.academies?.[0]?.id) {
        setSelectedId(data.academies[0].id as string);
      }
    } catch {
      setError("불러오기 실패");
    }
  }, [selectedId]);

  const loadTxns = useCallback(async (academyId: string) => {
    if (!academyId) {
      setTxns([]);
      return;
    }
    try {
      const res = await fetch(`/api/super-admin/credits/${academyId}`);
      const data = await res.json();
      if (data.ok) setTxns(data.transactions ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedId) void loadTxns(selectedId);
  }, [selectedId, loadTxns]);

  async function submitAdjust() {
    if (!selectedId) return;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("양수 금액을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: direction === "grant" ? "grant" : "adjust",
          direction,
          academy_id: selectedId,
          amount: Math.floor(n),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "처리 실패");
        return;
      }
      setMessage(
        direction === "grant"
          ? `${Math.floor(n)} 크레딧을 지급했습니다.`
          : `${Math.floor(n)} 크레딧을 차감했습니다.`
      );
      setNote("");
      await load();
      await loadTxns(selectedId);
    } catch {
      setError("요청 실패");
    } finally {
      setBusy(false);
    }
  }

  async function savePrice(featureKey: string, creditCost: number) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/credits/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature_key: featureKey,
          credit_cost: creditCost,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "단가 저장 실패");
        return;
      }
      setMessage("단가를 저장했습니다.");
      await load();
    } catch {
      setError("단가 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">학원별 잔액</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="ui-table w-full text-sm">
            <thead>
              <tr>
                <th>학원</th>
                <th>slug</th>
                <th>상태</th>
                <th>잔액</th>
              </tr>
            </thead>
            <tbody>
              {academies.map((a) => (
                <tr
                  key={a.id}
                  className={
                    selectedId === a.id ? "bg-brand-50/60 cursor-pointer" : "cursor-pointer"
                  }
                  onClick={() => setSelectedId(a.id)}
                >
                  <td className="font-medium">{a.name}</td>
                  <td className="font-mono text-xs text-slate-500">{a.slug}</td>
                  <td className="text-xs">{a.status}</td>
                  <td className="tabular-nums font-semibold">
                    {a.balance.toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">수동 지급 / 차감</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs text-slate-600">
            학원
            <select
              className="ui-input mt-1"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {academies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            유형
            <select
              className="ui-input mt-1"
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as "grant" | "debit")
              }
            >
              <option value="grant">지급 (+)</option>
              <option value="debit">차감 (−)</option>
            </select>
          </label>
          <label className="block text-xs text-slate-600">
            금액
            <input
              className="ui-input mt-1"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block text-xs text-slate-600">
            메모
            <input
              className="ui-input mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 온보딩 보너스"
            />
          </label>
        </div>
        <Button
          type="button"
          className="mt-3"
          disabled={busy || !selectedId}
          onClick={() => void submitAdjust()}
        >
          {busy ? "처리 중…" : direction === "grant" ? "크레딧 지급" : "크레딧 차감"}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">판매·마진 기준</h2>
        <p className="mt-2 text-sm text-slate-700">
          기준 단가{" "}
          <span className="font-semibold tabular-nums">
            1 크레딧 = {CREDIT_WON_PER_UNIT.toLocaleString("ko-KR")}원
          </span>
          {" "}
          (무거운 AI 기준 총이익률 약 65~75% 목표)
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="ui-table w-full text-sm">
            <thead>
              <tr>
                <th>패키지</th>
                <th>크레딧</th>
                <th>학원 결제</th>
                <th>할인</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_PACKS.map((pack) => (
                <tr key={pack.label}>
                  <td className="font-medium">{pack.label}</td>
                  <td className="tabular-nums">
                    {pack.credits.toLocaleString("ko-KR")}
                  </td>
                  <td className="tabular-nums font-semibold">
                    {formatWon(pack.priceWon)}
                  </td>
                  <td className="text-xs text-slate-500">
                    {pack.discountPct > 0 ? `${pack.discountPct}%` : "정가"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          지급 시 위 패키지 크레딧을 넣고, 메모에 결제액을 남겨 두면 추적이 쉽습니다.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">기능 단가</h2>
        <p className="mt-1 text-xs text-slate-500">
          저장 후 학원·교사 화면에 바로 반영됩니다. 괄호는 기준 단가 환산 매출입니다.
        </p>
        <div className="mt-3 space-y-2">
          {pricing.map((p) => (
            <div
              key={p.feature_key}
              className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2"
            >
              <div className="min-w-[200px] flex-1">
                <p className="text-sm font-medium text-slate-800">{p.label}</p>
                <p className="text-[11px] text-slate-400">
                  {p.feature_key} ·{" "}
                  {p.billing_type === "monthly_seat" ? "학생·월" : "사용 시"}
                  {" · "}
                  약 {formatWon(creditsToWon(p.credit_cost))}
                </p>
              </div>
              <input
                key={`${p.feature_key}-${p.credit_cost}`}
                className="ui-input w-24"
                type="number"
                min={0}
                defaultValue={p.credit_cost}
                id={`price-${p.feature_key}`}
              />
              <span className="text-xs text-slate-500">크레딧</span>
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  const el = document.getElementById(
                    `price-${p.feature_key}`
                  ) as HTMLInputElement | null;
                  const n = Number(el?.value ?? p.credit_cost);
                  if (!Number.isFinite(n) || n < 0) return;
                  void savePrice(p.feature_key, Math.floor(n));
                }}
              >
                저장
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">선택 학원 거래 내역</h2>
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
                  <td className="whitespace-nowrap text-xs">
                    {new Date(t.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td>{t.type}</td>
                  <td className="tabular-nums">{t.amount}</td>
                  <td className="tabular-nums">{t.balance_after}</td>
                  <td className="text-xs text-slate-600">
                    {t.note || t.feature_key || "—"}
                  </td>
                </tr>
              ))}
              {txns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    내역 없음
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
