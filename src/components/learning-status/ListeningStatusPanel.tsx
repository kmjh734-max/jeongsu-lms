"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HomeworkStatusLegend,
  MonthlyHomeworkDayHeaders,
  MonthlyHomeworkSymbols,
} from "@/components/learning-status/MonthlyHomeworkGrid";
import {
  formatKoreaMonth,
  getKoreaYearMonth,
} from "@/lib/date/korea-today";
import type { ListeningStatusTable } from "@/lib/learning-status/types";
import type { ReportClassOption } from "@/lib/reports/types";

interface ListeningStatusPanelProps {
  initialClasses?: ReportClassOption[];
}

export function ListeningStatusPanel({
  initialClasses = [],
}: ListeningStatusPanelProps) {
  const { year, month } = getKoreaYearMonth();
  const [classes, setClasses] = useState<ReportClassOption[]>(initialClasses);
  const [classId, setClassId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [monthValue, setMonthValue] = useState(formatKoreaMonth(year, month));
  const [table, setTable] = useState<ListeningStatusTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (monthValue) params.set("month", monthValue);
      if (classId) params.set("classId", classId);
      if (nameQuery.trim()) params.set("name", nameQuery.trim());

      const res = await fetch(`/api/listening/status?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "현황을 불러오지 못했습니다.");
      }
      setClasses(data.classes ?? []);
      setTable(data.table as ListeningStatusTable);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setTable(null);
    } finally {
      setLoading(false);
    }
  }, [classId, monthValue, nameQuery]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const headerDays = table?.rows[0]?.days ?? [];

  return (
    <section className="space-y-4 rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">듣기학습 현황표</h2>
        <p className="mt-1 text-sm text-slate-600">
          학생별 월간 듣기학습 완료 여부를 한눈에 확인합니다. 오늘 날짜는
          주황색으로 표시됩니다.
        </p>
      </div>

      <HomeworkStatusLegend />

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-slate-700">
          월
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          반
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="mt-1 block min-w-[140px] rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">전체</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          학생 검색
          <input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="이름"
            className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void loadStatus()}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && table && table.rows.length === 0 && (
        <p className="text-sm text-slate-500">표시할 학생이 없습니다.</p>
      )}

      {table && table.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 min-w-[2.5rem] border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center"
                >
                  No
                </th>
                <th
                  rowSpan={2}
                  className="sticky left-[2.5rem] z-20 min-w-[4.5rem] border-b border-r border-slate-200 bg-slate-50 px-2 py-2"
                >
                  반
                </th>
                <th
                  rowSpan={2}
                  className="sticky left-[7rem] z-20 min-w-[5.5rem] border-b border-r border-slate-200 bg-slate-50 px-2 py-2"
                >
                  학생
                </th>
                <th
                  colSpan={table.daysInMonth}
                  className="border-b border-slate-200 px-2 py-1 text-center"
                >
                  숙제현황
                </th>
                <th
                  rowSpan={2}
                  className="min-w-[4.5rem] border-b border-l border-slate-200 px-2 py-2 text-center"
                >
                  완료/전체
                </th>
                <th
                  rowSpan={2}
                  className="min-w-[3.5rem] border-b border-slate-200 px-2 py-2 text-center"
                >
                  수행률
                </th>
              </tr>
              <tr className="bg-slate-50">
                <MonthlyHomeworkDayHeaders
                  days={headerDays}
                  daysInMonth={table.daysInMonth}
                />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={row.studentId} className="border-t border-slate-100">
                  <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-2 py-2 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="sticky left-[2.5rem] z-10 border-r border-slate-100 bg-white px-2 py-2 whitespace-nowrap">
                    {row.classLabel}
                  </td>
                  <td className="sticky left-[7rem] z-10 border-r border-slate-200 bg-white px-2 py-2 font-medium whitespace-nowrap text-slate-900">
                    {row.studentName}
                  </td>
                  <MonthlyHomeworkSymbols
                    days={row.days}
                    daysInMonth={table.daysInMonth}
                  />
                  <td className="border-l border-slate-100 px-2 py-2 text-center whitespace-nowrap">
                    {row.completedCount}/{row.totalCount}
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    {row.executionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
