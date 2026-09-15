"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Pill, StageCellView, StageLegend } from "@/components/vocab/VocabUi";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { ReportClassOption } from "@/lib/reports/types";
import type { VocabStatusGrid } from "@/lib/vocab/load-status-grid";

const NAME_SEARCH_DEBOUNCE_MS = 400;

interface VocabTodayStatusPanelProps {
  initialClasses?: ReportClassOption[];
  /** 단어장 범위 — 폴더·미분류 */
  scopeOptions?: { value: string; label: string }[];
}

function dayWord(dateIso: string) {
  if (dateIso === getTodayIsoKorea()) return "오늘";
  const [, m, d] = dateIso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: "bad" | "warn";
}) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-[18px] py-4 shadow-card">
      <p className="truncate text-[13px] text-slate-500">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`text-[26px] font-bold tabular-nums ${
            tone === "bad" ? "text-rose-700" : tone === "warn" ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {value}
        </span>
        <span className="text-[13px] text-slate-500">{sub}</span>
      </p>
    </div>
  );
}

export function VocabTodayStatusPanel({
  initialClasses = [],
  scopeOptions = [],
}: VocabTodayStatusPanelProps) {
  const [classId, setClassId] = useState("");
  const [scope, setScope] = useState("recent");
  const [nameInput, setNameInput] = useState("");
  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [dateIso, setDateIso] = useState(getTodayIsoKorea());
  const [grid, setGrid] = useState<VocabStatusGrid | null>(null);
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
      if (dateIso) params.set("date", dateIso);
      if (classId) params.set("classId", classId);
      if (appliedNameQuery) params.set("name", appliedNameQuery);
      params.set("scope", scope);

      const res = await fetch(`/api/vocab/status?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (requestId !== requestIdRef.current) return;
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "현황을 불러오지 못했어요.");
      }
      setGrid(data.grid as VocabStatusGrid);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "현황을 불러오지 못했어요.");
    } finally {
      if (requestId === requestIdRef.current) setRefreshing(false);
    }
  }, [appliedNameQuery, classId, dateIso, scope]);

  useEffect(() => {
    void loadStatus();
    return () => abortRef.current?.abort();
  }, [loadStatus]);

  const initialLoading = refreshing && grid === null;
  const day = dayWord(dateIso);
  const summary = grid?.summary;
  const cols = grid?.sets.length ?? 0;
  const template = `minmax(140px,1fr) repeat(${cols}, 118px) 90px`;
  const minWidth = 140 + cols * 118 + 90 + 36 + cols * 8;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            className="ui-select h-9 w-[160px] py-1.5"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            aria-label="반"
          >
            <option value="">반 전체</option>
            {initialClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="ui-select h-9 w-[220px] py-1.5"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            aria-label="보여 줄 단어장"
          >
            <option value="recent">최근 배정한 단어장 8개</option>
            {scopeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="relative w-[180px]">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="ui-input h-9 pl-9"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setAppliedNameQuery(nameInput.trim());
              }}
              placeholder="학생 이름"
              aria-label="학생 이름"
            />
          </div>
          <label className="flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-600">
            <Icon name="calendar" size={15} className="text-slate-400" />
            <input
              type="date"
              value={dateIso}
              max={getTodayIsoKorea()}
              onChange={(e) => setDateIso(e.target.value || getTodayIsoKorea())}
              className="bg-transparent text-[13px] text-slate-800 outline-none"
              aria-label="날짜"
            />
          </label>
        </div>
        <StageLegend />
      </div>

      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {initialLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[88px] rounded-lg bg-slate-200/60" />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-slate-200/60" />
        </div>
      ) : grid && summary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={`${day} 학습한 학생`}
              value={summary.studiedToday}
              sub={`/ ${summary.withAssignments}명`}
            />
            <StatCard
              label="합격한 단어장 (평균)"
              value={summary.avgPassed ?? "—"}
              sub={`/ ${summary.setCount}개`}
            />
            <StatCard
              label="불합격 후 다시 안 한 학생"
              value={summary.failedNotRetried}
              sub="명"
              tone="bad"
            />
            <StatCard
              label={`${day} 안 한 학생`}
              value={summary.notStudiedToday}
              sub="명"
              tone="warn"
            />
          </div>

          <div
            className={`overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-card transition-opacity ${
              refreshing ? "opacity-60" : ""
            }`}
          >
            {grid.rows.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-slate-500">
                {classId || appliedNameQuery
                  ? "조건에 맞는 학생이 없어요."
                  : "단어장을 배정받은 학생이 없어요. 배정하면 여기서 진행을 볼 수 있어요."}
              </p>
            ) : (
              <div style={{ minWidth }}>
                <div
                  className="grid gap-2 rounded-t-lg border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500"
                  style={{ gridTemplateColumns: template }}
                >
                  <span>학생</span>
                  {grid.sets.map((s) => (
                    <span key={s.id} className="truncate" title={s.title}>
                      {s.shortTitle}
                    </span>
                  ))}
                  <span>{day}</span>
                </div>
                {cols === 0 ? (
                  <p className="border-b border-slate-100 px-[18px] py-3 text-[13px] text-slate-500">
                    이 범위에는 이 학생들에게 배정한 단어장이 없어요. 위에서 다른 폴더를 골라 보세요.
                  </p>
                ) : null}
                <ul>
                  {grid.rows.map((row, i) => (
                    <li
                      key={row.studentId}
                      className={`grid h-12 items-center gap-2 px-[18px] ${
                        i > 0 ? "border-t border-slate-100" : ""
                      }`}
                      style={{ gridTemplateColumns: template }}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {row.name}
                        </span>
                        {!classId ? (
                          <span className="truncate text-[11px] text-slate-400">
                            {row.classLabel}
                          </span>
                        ) : null}
                      </span>
                      {row.cells.map((cell, ci) =>
                        cell ? (
                          <StageCellView key={ci} cell={cell} />
                        ) : (
                          <span key={ci} className="text-xs text-slate-300" title="배정 안 됨">
                            —
                          </span>
                        )
                      )}
                      <span>
                        {!row.hasAssignments ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : row.studiedToday ? (
                          <Pill tone="good">
                            <Icon name="check" size={12} strokeWidth={2.6} />
                            했음
                          </Pill>
                        ) : (
                          <Pill tone="warn">안 함</Pill>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
