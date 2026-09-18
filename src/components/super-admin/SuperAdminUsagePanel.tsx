"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type UsageRow = {
  id: string;
  academyId: string;
  academyName: string;
  memberType: "academy" | "personal";
  type: "grant" | "debit" | "adjust" | "refund" | "charge";
  amount: number;
  balanceAfter: number;
  feature: string | null;
  note: string | null;
  actorName: string | null;
  createdAt: string;
};

const TYPE_LABEL: Record<string, { text: string; cls: string; sign: string }> = {
  debit: { text: "사용", cls: "bg-rose-50 text-rose-700", sign: "−" },
  grant: { text: "지급", cls: "bg-emerald-50 text-emerald-700", sign: "+" },
  charge: { text: "충전", cls: "bg-sky-50 text-sky-700", sign: "+" },
  refund: { text: "환불", cls: "bg-amber-50 text-amber-700", sign: "+" },
  adjust: { text: "조정", cls: "bg-slate-100 text-slate-700", sign: "±" },
};

/** 모든 학원·개인회원의 크레딧 사용 내역 — 어디가 무엇에 썼는지 */
export function SuperAdminUsagePanel({ kind }: { kind: "all" | "academy" | "personal" }) {
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [onlyUse, setOnlyUse] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/credits/usage?limit=300");
      const data = (await res.json()) as { ok?: boolean; usage?: UsageRow[]; message?: string };
      if (!data.ok) throw new Error(data.message ?? "불러오지 못했어요.");
      setRows(data.usage ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (kind === "all" || r.memberType === kind) &&
        (!onlyUse || r.type === "debit") &&
        (!q || r.academyName.toLowerCase().includes(q) || (r.feature ?? "").toLowerCase().includes(q))
    );
  }, [rows, kind, onlyUse, query]);

  const usedTotal = shown.filter((r) => r.type === "debit").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          크레딧 사용 내역
          <span className="ml-2 text-xs font-normal text-slate-500">
            {shown.length}건 · 사용 합계 {usedTotal.toLocaleString("ko-KR")}크레딧
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="ui-input h-8 w-44 text-xs"
            placeholder="학원·기능 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="학원·기능 검색"
          />
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input type="checkbox" checked={onlyUse} onChange={(e) => setOnlyUse(e.target.checked)} />
            사용만 보기
          </label>
          <button type="button" onClick={() => void load()} className="text-xs font-medium text-brand-800 hover:underline">
            새로고침
          </button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-3 max-h-[480px] overflow-auto">
        <table className="ui-table w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th>일시</th>
              <th>학원·개인</th>
              <th>구분</th>
              <th>기능·내용</th>
              <th>쓴 사람</th>
              <th className="text-right">크레딧</th>
              <th className="text-right">남은 잔액</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const t = TYPE_LABEL[r.type] ?? TYPE_LABEL.adjust!;
              return (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-xs tabular-nums text-slate-500">
                    {new Date(r.createdAt).toLocaleString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="whitespace-nowrap font-medium">
                    {r.academyName}
                    {r.memberType === "personal" ? (
                      <span className="ml-1.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-800">개인</span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.cls}`}>{t.text}</span>
                  </td>
                  <td className="max-w-[280px] truncate text-slate-700" title={r.note ?? undefined}>
                    {r.feature ?? r.note ?? "—"}
                    {r.feature && r.note ? <span className="ml-1 text-xs text-slate-400">{r.note}</span> : null}
                  </td>
                  <td className="whitespace-nowrap text-xs text-slate-600">{r.actorName ?? "—"}</td>
                  <td className={`whitespace-nowrap text-right font-semibold tabular-nums ${r.type === "debit" ? "text-rose-700" : "text-emerald-700"}`}>
                    {t.sign}
                    {r.amount.toLocaleString("ko-KR")}
                  </td>
                  <td className="text-right tabular-nums text-slate-500">{r.balanceAfter.toLocaleString("ko-KR")}</td>
                </tr>
              );
            })}
            {!loading && shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  내역이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
