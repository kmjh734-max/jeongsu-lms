"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const NAME_SEARCH_DEBOUNCE_MS = 400;

interface ListeningStatusPanelProps {
  initialClasses?: ReportClassOption[];
}

export function ListeningStatusPanel({
  initialClasses = [],
}: ListeningStatusPanelProps) {
  const { year, month } = getKoreaYearMonth();
  const [classes] = useState<ReportClassOption[]>(initialClasses);
  const [classId, setClassId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [monthValue, setMonthValue] = useState(formatKoreaMonth(year, month));
  const [table, setTable] = useState<ListeningStatusTable | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedNameQuery(nameInput.trim());
    }, NAME_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [nameInput]);

  const loadStatus = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (monthValue) params.set("month", monthValue);
      if (classId) params.set("classId", classId);
      if (appliedNameQuery) params.set("name", appliedNameQuery);

      const res = await fetch(`/api/listening/status?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      if (requestId !== requestIdRef.current) return;

      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "현황을 불러오지 못했습니다.");
      }

      setTable(data.table as ListeningStatusTable);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      if (requestId === requestIdRef.current) {
        setRefreshing(false);
      }
    }
  }, [appliedNameQuery, classId, monthValue]);

  useEffect(() => {
    void loadStatus();
    return () => abortRef.current?.abort();
  }, [loadStatus]);

  const headerDays = table?.rows[0]?.days ?? [];
  const initialLoading = refreshing && table === null;
  const namePending =
    nameInput.trim() !== appliedNameQuery || (refreshing && !!appliedNameQuery);

  return (
    <section className="space-y-4 rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">듣기학습 현황표</h2>
        <p className="mt-1 text-sm text-slate-600">
          학생별 월간 듣기학습·OMR 시험 결과를 한눈에 확인합니다. 달력 숫자는
          OMR 점수, 오른쪽 열은 최근 시험 점수입니다.
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
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAppliedNameQuery(nameInput.trim());
              }
            }}
            placeholder="이름"
            className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void loadStatus()}
          disabled={refreshing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {refreshing ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      {namePending && !initialLoading && (
        <p className="text-xs text-slate-500">검색어를 반영하는 중…</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {initialLoading && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-32 animate-pulse rounded bg-slate-200" />
        </div>
      )}

      {!initialLoading && table && table.rows.length === 0 && (
        <p className="text-sm text-slate-500">표시할 학생이 없습니다.</p>
      )}

      {table && table.rows.length > 0 && (
        <div className="relative">
          {refreshing && (
            <div
              className="absolute inset-0 z-30 flex items-start justify-center rounded-lg bg-white/60 pt-8"
              aria-hidden
            >
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow ring-1 ring-indigo-100">
                업데이트 중…
              </span>
            </div>
          )}
          <div
            className={`overflow-x-auto rounded-lg border border-slate-200 transition-opacity ${
              refreshing ? "opacity-70" : "opacity-100"
            }`}
          >
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
                    className="min-w-[7rem] border-b border-l border-slate-200 px-2 py-2 text-center"
                  >
                    OMR 시험
                  </th>
                  <th
                    rowSpan={2}
                    className="min-w-[4.5rem] border-b border-slate-200 px-2 py-2 text-center"
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
                    <td className="border-l border-slate-100 px-2 py-2 text-center text-xs leading-snug">
                      {row.examSummary.attemptCount > 0 ? (
                        <>
                          <span className="font-bold text-indigo-700 tabular-nums">
                            {row.examSummary.latestScore}점
                          </span>
                          <span className="mt-0.5 block text-slate-600">
                            {row.examSummary.latestCorrectCount}/
                            {row.examSummary.latestTotalCount} 정답
                          </span>
                          {row.examSummary.latestSetTitle && (
                            <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                              {row.examSummary.latestSetTitle}
                            </span>
                          )}
                          {row.examSummary.latestDate && (
                            <span className="block text-[10px] text-slate-400">
                              {row.examSummary.latestDate}
                            </span>
                          )}
                          {row.examSummary.bestScore != null &&
                            row.examSummary.bestScore !==
                              row.examSummary.latestScore && (
                              <span className="mt-0.5 block text-[10px] text-indigo-600">
                                최고 {row.examSummary.bestScore}점
                              </span>
                            )}
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
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
        </div>
      )}
    </section>
  );
}
