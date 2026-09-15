"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  ListeningNudgeDialog,
  ListeningNudgeQueueDialog,
} from "@/components/learning-status/ListeningMissedNudgeButton";
import { ListeningOmrStatusSection } from "@/components/learning-status/ListeningOmrStatusSection";
import {
  HomeworkStatusLegend,
  MonthlyHomeworkGrid,
} from "@/components/learning-status/MonthlyHomeworkGrid";
import {
  ListeningModuleHeader,
  type ListeningBasePath,
} from "@/components/listening/ListeningModuleHeader";
import { Button } from "@/components/ui/Button";
import { formatKoreaMonth, getKoreaYearMonth } from "@/lib/date/korea-today";
import type { ListeningStatusRow, ListeningStatusTable } from "@/lib/learning-status/types";
import { parseDateOnly, toDateOnlyString } from "@/lib/listening/schedule/days-of-week";
import type { ReportClassOption } from "@/lib/reports/types";

const NAME_SEARCH_DEBOUNCE_MS = 400;

interface ListeningStatusPanelProps {
  basePath: ListeningBasePath;
  setCount: number;
  assignCount: number;
  initialClasses?: ReportClassOption[];
  /** 학부모 안내 문구에 넣을 접속한 학원 이름 */
  academyName?: string;
}

function StatCard({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-[18px] py-4 shadow-card">
      <p className="text-[13px] text-slate-500">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold tabular-nums text-slate-900">{value}</span>
        {unit ? <span className="text-[13px] text-slate-500">{unit}</span> : null}
      </p>
      {note ? <p className="mt-0.5 text-xs text-slate-400">{note}</p> : null}
    </div>
  );
}

function pct(done: number, total: number): string {
  return total > 0 ? String(Math.round((done / total) * 100)) : "—";
}

/** 오늘이 든 주의 월요일 */
function mondayOf(iso: string): string {
  const d = parseDateOnly(iso);
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return toDateOnlyString(d);
}

export function ListeningStatusPanel({
  basePath,
  setCount,
  assignCount,
  initialClasses = [],
  academyName,
}: ListeningStatusPanelProps) {
  const { year, month } = getKoreaYearMonth();
  const [classId, setClassId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [monthValue, setMonthValue] = useState(formatKoreaMonth(year, month));
  const [table, setTable] = useState<ListeningStatusTable | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [nudgeStudentId, setNudgeStudentId] = useState<string | null>(null);

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
        throw new Error(data.message ?? "현황을 불러오지 못했어요.");
      }

      setTable(data.table as ListeningStatusTable);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "현황을 불러오지 못했어요.");
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

  const initialLoading = refreshing && table === null;
  const rows = useMemo(() => table?.rows ?? [], [table]);

  const summary = useMemo(() => {
    if (!table) return null;
    const monthPrefix = `${table.year}-${String(table.month).padStart(2, "0")}`;
    const isCurrentMonth = table.todayIso.startsWith(monthPrefix);
    const todayIso = table.todayIso;

    const withToday = rows
      .map((r) => ({ row: r, cell: r.days.find((d) => d.taskDate === todayIso) }))
      .filter((x) => x.cell?.isStudyDay);
    const doneToday = withToday.filter((x) => x.cell!.symbol === "complete").length;
    const missedToday: ListeningStatusRow[] = withToday
      .filter((x) => x.cell!.symbol === "missing" || x.cell!.symbol === "partial")
      .map((x) => x.row);

    let weekDone = 0;
    let weekTotal = 0;
    const weekStart = mondayOf(todayIso);
    let monthDone = 0;
    let monthTotal = 0;
    let correct = 0;
    let answered = 0;
    for (const r of rows) {
      monthDone += r.completedCount;
      monthTotal += r.totalCount;
      correct += r.correctCount;
      answered += r.answeredCount;
      for (const d of r.days) {
        if (!d.isStudyDay || d.taskDate < weekStart || d.taskDate > todayIso) continue;
        weekTotal += 1;
        if (d.symbol === "complete") weekDone += 1;
      }
    }

    const missedMonth = rows.filter((r) => r.missedDates.length > 0);

    return {
      isCurrentMonth,
      doneToday,
      todayTotal: withToday.length,
      missed: isCurrentMonth ? missedToday : missedMonth,
      weekRate: pct(weekDone, weekTotal),
      monthRate: pct(monthDone, monthTotal),
      accuracy: pct(correct, answered),
    };
  }, [table, rows]);

  const nudgeRow = nudgeStudentId ? rows.find((r) => r.studentId === nudgeStudentId) : null;
  const selectedClass = initialClasses.find((c) => c.id === classId);

  return (
    <div>
      <ListeningModuleHeader basePath={basePath} setCount={setCount} assignCount={assignCount} />

      <div className="space-y-4">
        {/* 거르기 + 범례 */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              aria-label="반"
              className="ui-select h-9 w-auto min-w-[160px] py-1.5"
            >
              <option value="">
                {`전체 반${!classId && table && !appliedNameQuery ? ` · ${rows.length}명` : ""}`}
              </option>
              {initialClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.name}${c.id === classId && table && !appliedNameQuery ? ` · ${rows.length}명` : ""}`}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
              aria-label="월"
              className="ui-input h-9 w-auto py-1.5"
            />
            <label className="relative block w-full sm:w-[180px]">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setAppliedNameQuery(nameInput.trim());
                }}
                placeholder="학생 이름"
                aria-label="학생 이름"
                className="ui-input h-9 py-1.5 pl-9"
              />
            </label>
          </div>
          <HomeworkStatusLegend />
        </div>

        {error ? (
          <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        {/* 요약 */}
        {initialLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[108px] animate-pulse rounded-lg border border-slate-200 bg-white" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
            {summary.isCurrentMonth ? (
              <StatCard
                label="오늘 끝낸 학생"
                value={String(summary.doneToday)}
                unit={`/ ${summary.todayTotal}명`}
                note={summary.todayTotal === 0 ? "오늘은 나간 과제가 없어요" : undefined}
              />
            ) : (
              <StatCard label="학생" value={String(rows.length)} unit="명" />
            )}
            {summary.isCurrentMonth ? (
              <StatCard label="이번 주 수행률" value={summary.weekRate} unit={summary.weekRate === "—" ? undefined : "%"} />
            ) : (
              <StatCard label="이 달 수행률" value={summary.monthRate} unit={summary.monthRate === "—" ? undefined : "%"} />
            )}
            <StatCard
              label={summary.isCurrentMonth ? "이번 달 정답률" : "이 달 정답률"}
              value={summary.accuracy}
              unit={summary.accuracy === "—" ? undefined : "%"}
              note={summary.accuracy === "—" ? "채점된 문항이 아직 없어요" : undefined}
            />
            <div
              className={`rounded-lg border bg-white px-[18px] py-4 shadow-card ${
                summary.missed.length > 0 ? "border-amber-200" : "border-slate-200"
              }`}
            >
              <p className="text-[13px] text-slate-500">
                {summary.isCurrentMonth ? "오늘 아직 안 한 학생" : "안 한 날이 있는 학생"} ·{" "}
                {summary.missed.length}명
              </p>
              {summary.missed.length > 0 ? (
                <>
                  <div className="mb-2.5 mt-2 flex max-h-[56px] flex-wrap gap-1.5 overflow-hidden">
                    {summary.missed.map((r) => (
                      <button
                        key={r.studentId}
                        type="button"
                        onClick={() => setNudgeStudentId(r.studentId)}
                        className="inline-flex h-6 items-center rounded bg-amber-50 px-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        {r.studentName}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => setQueueOpen(true)}>
                    <Icon name="send" size={15} />
                    학부모께 알림 보내기
                  </Button>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  {summary.isCurrentMonth ? "모두 끝냈거나 오늘 과제가 없어요." : "모두 다 했어요."}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* 월 표 */}
        <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          {refreshing && table ? (
            <div className="absolute inset-0 z-30 flex items-start justify-center bg-white/60 pt-8" aria-hidden>
              <span className="rounded bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-card ring-1 ring-brand-100">
                불러오는 중…
              </span>
            </div>
          ) : null}
          {initialLoading ? (
            <div className="space-y-3 p-6">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-32 animate-pulse rounded bg-slate-100" />
            </div>
          ) : table && rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              {appliedNameQuery ? "찾는 학생이 없어요." : "보일 학생이 없어요."}
            </p>
          ) : table ? (
            <MonthlyHomeworkGrid
              todayIso={table.todayIso}
              onNameClick={(id) => setNudgeStudentId(id)}
              rows={rows.map((r) => ({
                id: r.studentId,
                name: r.studentName,
                sub: selectedClass ? undefined : r.classLabel,
                days: r.days,
                rate: r.totalCount > 0 ? r.executionRate : null,
              }))}
            />
          ) : null}
        </section>
        {table && rows.length > 0 ? (
          <p className="px-1 text-xs text-slate-400">
            학생 이름을 누르면 학부모께 알림을 보낼 수 있어요.
          </p>
        ) : null}

        <ListeningOmrStatusSection
          omrByStudent={table?.omrByStudent ?? []}
          loading={refreshing && !table}
        />
      </div>

      {queueOpen && table && summary ? (
        <ListeningNudgeQueueDialog
          rows={summary.missed}
          year={table.year}
          month={table.month}
          academyName={academyName}
          onClose={() => setQueueOpen(false)}
        />
      ) : null}
      {nudgeRow && table ? (
        <ListeningNudgeDialog
          row={nudgeRow}
          year={table.year}
          month={table.month}
          academyName={academyName}
          onClose={() => setNudgeStudentId(null)}
        />
      ) : null}
    </div>
  );
}
