"use client";

import { useCallback, useEffect, useState } from "react";

interface ScheduleAssignmentItem {
  id: string;
  title: string;
  targetLabel: string;
  setCount: number;
  startDate: string;
  endDate: string | null;
  daysLabel: string;
  questionsPerDay: number;
  isActive: boolean;
}

interface ListeningScheduleListClientProps {
  basePath: "/admin/listening" | "/teacher/listening";
}

export function ListeningScheduleListClient({
  basePath,
}: ListeningScheduleListClientProps) {
  const [items, setItems] = useState<ScheduleAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/listening/schedule-assignments");
    const data = (await res.json()) as {
      ok?: boolean;
      assignments?: ScheduleAssignmentItem[];
      message?: string;
    };
    setLoading(false);
    if (!data.ok) {
      setError(data.message ?? "목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.assignments ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function deactivate(id: string, title: string) {
    if (!window.confirm(`「${title}」 스케줄 과제를 비활성화할까요?`)) return;
    setBusyId(id);
    const res = await fetch(`/api/listening/schedule-assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusyId(null);
    if (!data.ok) {
      setError(data.message ?? "비활성화 실패");
      return;
    }
    void load();
  }

  if (loading) {
    return <p className="text-sm text-slate-600">불러오는 중…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm">
        <a href={basePath} className="text-indigo-600 hover:underline">
          ← 듣기 세트 목록
        </a>
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">등록된 스케줄 과제가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((a) => (
            <li key={a.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {a.title}
                    {!a.isActive && (
                      <span className="ml-2 text-xs text-slate-500">(비활성)</span>
                    )}
                  </p>
                  <p className="mt-1 text-slate-600">
                    {a.targetLabel} · 세트 {a.setCount}개 · {a.daysLabel} · 하루{" "}
                    {a.questionsPerDay}문항
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.startDate}
                    {a.endDate ? ` ~ ${a.endDate}` : ""}
                  </p>
                </div>
                {a.isActive && (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => void deactivate(a.id, a.title)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    비활성화
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
