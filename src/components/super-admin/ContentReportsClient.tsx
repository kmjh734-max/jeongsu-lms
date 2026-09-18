"use client";

import { useCallback, useEffect, useState } from "react";

type Report = {
  id: string;
  kind: "listening" | "vocab";
  reason: string;
  message: string | null;
  target_label: string | null;
  set_id: string | null;
  set_title: string | null;
  academy_name: string | null;
  reporter_name: string | null;
  reporter_role: string | null;
  status: "open" | "resolved";
  created_at: string;
};

const ROLE: Record<string, string> = { student: "학생", teacher: "선생님", admin: "원장님", super_admin: "운영자" };

/** 슈퍼관리자: 학생·선생님이 보낸 "이상해요" 신고를 모아 보고 처리한다 */
export function ContentReportsClient() {
  const [status, setStatus] = useState<"open" | "resolved">("open");
  const [rows, setRows] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetch(`/api/super-admin/content-reports?status=${status}`).then((r) => r.json());
      if (!data.ok) throw new Error(data.message ?? "불러오지 못했어요.");
      setRows(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(id: string, next: "open" | "resolved") {
    await fetch("/api/super-admin/content-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setRows((list) => list.filter((r) => r.id !== id));
  }

  // 같은 문항에 신고가 여러 번이면 위로
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = `${r.set_id}|${r.target_label}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {(["open", "resolved"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              status === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {s === "open" ? "처리할 신고" : "처리한 신고"}
          </button>
        ))}
        <span className="text-sm text-slate-500">{loading ? "불러오는 중…" : `${rows.length}건`}</span>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((r) => {
          const same = counts.get(`${r.set_id}|${r.target_label}`) ?? 1;
          return (
            <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        r.kind === "listening" ? "bg-violet-100 text-violet-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {r.kind === "listening" ? "듣기" : "단어"}
                    </span>
                    <b className="text-slate-900">{r.set_title ?? "(세트 정보 없음)"}</b>
                    <span className="text-slate-700">{r.target_label}</span>
                    {same > 1 ? <span className="rounded bg-rose-50 px-1.5 text-xs font-bold text-rose-700">같은 신고 {same}건</span> : null}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-700">{r.reason}</p>
                  {r.message ? <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{r.message}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">
                    {r.academy_name ?? "—"} · {r.reporter_name ?? "—"}({ROLE[r.reporter_role ?? ""] ?? r.reporter_role}) ·{" "}
                    {new Date(r.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggle(r.id, status === "open" ? "resolved" : "open")}
                  className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {status === "open" ? "처리 완료" : "다시 열기"}
                </button>
              </div>
            </li>
          );
        })}
        {!loading && rows.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
            {status === "open" ? "처리할 신고가 없어요." : "처리한 신고가 없어요."}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
