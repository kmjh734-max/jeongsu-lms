"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  countVocabNudgeTargets,
  VocabNudgeDialog,
  VocabNudgeQueueDialog,
} from "@/components/learning-status/VocabMissedNudge";
import { Button } from "@/components/ui/Button";
import { Pill, StageDots, StageLegend } from "@/components/vocab/VocabUi";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { ReportClassOption } from "@/lib/reports/types";
import type { VocabSimpleRow, VocabSimpleStatus } from "@/lib/vocab/load-status-simple";

const NAME_SEARCH_DEBOUNCE_MS = 400;

interface VocabTodayStatusPanelProps {
  initialClasses?: ReportClassOption[];
  /** 학부모 안내 문구에 넣을 접속한 학원 이름 */
  academyName?: string;
}

function dayWord(dateIso: string) {
  if (dateIso === getTodayIsoKorea()) return "오늘";
  const [, m, d] = dateIso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

/** "2026-10-21" → "10/21 (이틀 전)" */
function lastStudiedLabel(iso: string | null, baseIso: string): string {
  if (!iso) return "기록 없음";
  const [, m, d] = iso.split("-");
  const short = `${Number(m)}/${Number(d)}`;
  const diff = Math.round((Date.parse(`${baseIso}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 86400000);
  if (diff <= 0) return `${short} (오늘)`;
  if (diff === 1) return `${short} (어제)`;
  if (diff === 2) return `${short} (이틀 전)`;
  if (diff < 30) return `${short} (${diff}일 전)`;
  return short;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** 요약 알약 하나 — 숫자 + 이름 (+ 단추) */
function SummaryChip({
  value,
  label,
  tone,
  tail,
}: {
  value: number;
  label: string;
  tone?: "good" | "warn" | "bad";
  tail?: React.ReactNode;
}) {
  const color =
    tone === "good" ? "text-green-700" : tone === "warn" ? "text-amber-700" : tone === "bad" ? "text-rose-700" : "text-slate-900";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 shadow-card">
      <b className={`text-base tabular-nums ${color}`}>{value}</b>
      {label}
      {tail}
    </span>
  );
}

/**
 * 단어학습 현황 — 학생 한 줄 요약.
 *
 * 선생님 지적(2026-10-23): 전에는 「최근 배정한 단어장 8개」를 열로 깔아 Day53~60 같은 책 끝만 보였고,
 * 학생이 실제로 하는 Day는 안 보여 거꾸로였다. 이제 학생마다 지금 하는 단어장·어디까지·최근 한 것·합격 수·
 * 오늘 했는지를 한 줄로 보여 주고, Day별 점은 접어 두었다가 펼치면 지금 하는 Day 앞뒤로 보인다.
 */
export function VocabTodayStatusPanel({ initialClasses = [], academyName }: VocabTodayStatusPanelProps) {
  const [classId, setClassId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [appliedNameQuery, setAppliedNameQuery] = useState("");
  const [dateIso, setDateIso] = useState(getTodayIsoKorea());
  const [status, setStatus] = useState<VocabSimpleStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [nudgeStudentId, setNudgeStudentId] = useState<string | null>(null);
  const [stripOpen, setStripOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedNameQuery(nameInput.trim()), NAME_SEARCH_DEBOUNCE_MS);
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
      const res = await fetch(`/api/vocab/status?${params.toString()}`, { signal: controller.signal });
      const data = await res.json();
      if (requestId !== requestIdRef.current) return;
      if (!res.ok || !data.ok) throw new Error(data.message ?? "현황을 불러오지 못했어요.");
      setStatus(data.simple as VocabSimpleStatus);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "현황을 불러오지 못했어요.");
    } finally {
      if (requestId === requestIdRef.current) setRefreshing(false);
    }
  }, [appliedNameQuery, classId, dateIso]);

  useEffect(() => {
    void loadStatus();
    return () => abortRef.current?.abort();
  }, [loadStatus]);

  const initialLoading = refreshing && status === null;
  const day = dayWord(dateIso);
  const isToday = (status?.dateIso ?? dateIso) === getTodayIsoKorea();
  const gridDay = status ? dayWord(status.dateIso) : day;
  const nudgeTargets = useMemo(() => countVocabNudgeTargets(status?.rows ?? []), [status]);
  const nudgeRow = nudgeStudentId ? (status?.rows.find((r) => r.studentId === nudgeStudentId) ?? null) : null;
  const summary = status?.summary;
  const baseIso = status?.dateIso ?? dateIso;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <select className="ui-select h-9 w-[160px] py-1.5" value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="반">
            <option value="">반 전체</option>
            {initialClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="relative w-[180px]">
            <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
          <div className="h-9 w-2/3 rounded-full bg-slate-200/60" />
          <div className="h-64 rounded-lg bg-slate-200/60" />
        </div>
      ) : status && summary ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SummaryChip
              value={summary.notStudiedToday}
              label={`${day} 안 한 학생`}
              tone="warn"
              tail={
                nudgeTargets > 0 ? (
                  <Button size="sm" className="h-7 text-xs" onClick={() => setQueueOpen(true)}>
                    <Icon name="send" size={13} />
                    학부모께 알림
                  </Button>
                ) : undefined
              }
            />
            <SummaryChip value={summary.studiedToday} label={`${day} 학습한 학생 / ${summary.withAssignments}명`} tone="good" />
            <SummaryChip value={summary.failedNotRetried} label="불합격 후 다시 안 본 학생" tone="bad" />
          </div>

          <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-opacity ${refreshing ? "opacity-60" : ""}`}>
            {status.rows.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-slate-500">
                {classId || appliedNameQuery ? "조건에 맞는 학생이 없어요." : "단어장을 배정받은 학생이 없어요. 배정하면 여기서 진행을 볼 수 있어요."}
              </p>
            ) : (
              <>
                <div className="hidden grid-cols-[150px_minmax(0,1fr)_96px_112px_84px] gap-3 border-b border-slate-200 bg-slate-50 px-[18px] py-2.5 text-xs font-semibold text-slate-500 md:grid">
                  <span>학생</span>
                  <span>지금 하는 단어장 · 어디까지 · 최근</span>
                  <span>합격</span>
                  <span>마지막 학습</span>
                  <span>{day}</span>
                </div>
                <ul>
                  {status.rows.map((row: VocabSimpleRow, i) => (
                    <li
                      key={row.studentId}
                      className={`grid grid-cols-2 items-center gap-x-3 gap-y-1.5 px-[18px] py-3 md:grid-cols-[150px_minmax(0,1fr)_96px_112px_84px] ${i > 0 ? "border-t border-slate-100" : ""}`}
                    >
                      <span className="flex min-w-0 flex-col items-start">
                        <button
                          type="button"
                          onClick={() => setNudgeStudentId(row.studentId)}
                          title="학부모께 알림 보내기"
                          className="max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                        >
                          {row.name}
                        </button>
                        <span className="truncate text-[11px] text-slate-400">{row.classLabel}</span>
                      </span>

                      <span className="order-last col-span-2 flex min-w-0 flex-col gap-0.5 md:order-none md:col-span-1">
                        {!row.hasAssignments ? (
                          <span className="text-sm text-slate-400">배정된 단어장 없음</span>
                        ) : row.current ? (
                          <>
                            <span className="truncate text-sm text-slate-800" title={row.current.title}>
                              {row.current.title}
                            </span>
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                              <StageDots dots={row.current.dots} />
                              <span>
                                {row.current.doneText} → {row.current.nextText}
                              </span>
                              {row.retry && row.retry.setId !== row.current.setId ? (
                                <span className="font-semibold text-rose-700">
                                  · {row.retry.short} 종합테스트 {row.retry.score}점, 다시 안 봄
                                </span>
                              ) : null}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-green-700">배정된 단어장 모두 합격</span>
                        )}
                        {row.recent.length > 0 ? (
                          <span className="truncate text-xs text-slate-500">
                            <span className="text-slate-400">최근</span>{" "}
                            {row.recent.map((r, k) => (
                              <span key={r.setId}>
                                {k > 0 ? " · " : ""}
                                {r.short}{" "}
                                <span className={r.passed ? "text-green-700" : r.failed ? "text-rose-700" : ""}>{r.text}</span>{" "}
                                <span className="text-slate-400">({shortDate(r.dateIso)})</span>
                              </span>
                            ))}
                          </span>
                        ) : null}
                        {row.todayText ? (
                          <span className="truncate text-xs text-green-700">
                            {day} 한 것 · {row.todayText}
                          </span>
                        ) : null}
                      </span>

                      <span className="text-sm tabular-nums text-slate-800">
                        {row.hasAssignments ? (
                          <>
                            {row.passedCount} <span className="text-[11px] text-slate-400">/ {row.totalCount}</span>
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">{row.hasAssignments ? lastStudiedLabel(row.lastStudiedIso, baseIso) : "—"}</span>
                      <span className="justify-self-end md:justify-self-start">
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
              </>
            )}
          </div>

          {status.rows.some((r) => r.strip.length > 0) ? (
            <div className="rounded-lg border border-slate-200 bg-white shadow-card">
              <button
                type="button"
                onClick={() => setStripOpen((v) => !v)}
                aria-expanded={stripOpen}
                className="flex w-full items-center justify-between px-[18px] py-3 text-left text-[13px] font-bold text-slate-800"
              >
                Day별로 보기 <span className="text-xs font-normal text-slate-400">(학생이 지금 하는 Day 앞뒤 8개)</span>
                <span className="text-xs font-semibold text-brand-700">{stripOpen ? "접기" : "펼치기"}</span>
              </button>
              {stripOpen ? (
                <div className="overflow-x-auto border-t border-slate-200">
                  <ul className="min-w-[760px]">
                    {status.rows
                      .filter((r) => r.strip.length > 0)
                      .map((row) => (
                        <li key={row.studentId} className="grid grid-cols-[120px_repeat(8,minmax(76px,1fr))] items-center gap-2 border-b border-slate-100 px-[18px] py-2 last:border-b-0">
                          <span className="truncate text-sm font-semibold text-slate-900">{row.name}</span>
                          {row.strip.map((c) => (
                            <span
                              key={c.setId}
                              className={`flex flex-col gap-0.5 rounded px-1.5 py-1 ${c.current ? "bg-brand-50" : ""}`}
                              title={c.current ? "지금 하는 단어장" : undefined}
                            >
                              <span className={`text-[11px] font-semibold ${c.current ? "text-brand-700" : "text-slate-500"}`}>{c.short}</span>
                              <span className="flex items-center gap-1.5">
                                <StageDots dots={c.dots} />
                                {c.score !== null ? (
                                  <span className={`text-[11px] font-bold tabular-nums ${c.passed ? "text-green-700" : "text-rose-700"}`}>{c.score}</span>
                                ) : (
                                  <span className="whitespace-nowrap text-[11px] text-slate-400">{c.label}</span>
                                )}
                              </span>
                            </span>
                          ))}
                          {Array.from({ length: Math.max(0, 8 - row.strip.length) }).map((_, k) => (
                            <span key={`pad-${k}`} />
                          ))}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {status.rows.length > 0 ? <p className="px-1 text-xs text-slate-400">학생 이름을 누르면 학부모께 알림을 보낼 수 있어요.</p> : null}
        </>
      ) : null}

      {queueOpen && status ? (
        <VocabNudgeQueueDialog status={status} isToday={isToday} dayLabel={gridDay} academyName={academyName} onClose={() => setQueueOpen(false)} />
      ) : null}
      {nudgeRow && status ? (
        <VocabNudgeDialog row={nudgeRow} status={status} isToday={isToday} dayLabel={gridDay} academyName={academyName} onClose={() => setNudgeStudentId(null)} />
      ) : null}
    </div>
  );
}
