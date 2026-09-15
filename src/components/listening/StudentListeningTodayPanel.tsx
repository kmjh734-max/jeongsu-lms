"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ButtonLink } from "@/components/ui/Button";
import { DAY_LABELS } from "@/lib/listening/schedule/days-of-week";
import { isFirstUseOfServerData } from "@/lib/ui/server-data-first-use";
import {
  StudentListeningCalendar,
  type ListeningCalendarData,
} from "@/components/listening/StudentListeningCalendar";

interface DailyTaskView {
  id: string;
  assignmentId?: string;
  assignmentTitle: string;
  taskDate: string;
  setTitle: string;
  questionRangeLabel?: string;
  status: string;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

interface PausedAssignmentView {
  assignmentId: string;
  assignmentTitle: string;
  since: string;
  until: string | null;
}

export interface TodaySummary {
  todayIso: string;
  isStudyDayToday: boolean;
  todayTask: DailyTaskView | null;
  missedTasks: DailyTaskView[];
  nextStudyDate: string | null;
  /** 선생님이 지금 멈춰 둔 과제 */
  paused?: PausedAssignmentView[];
  calendar?: ListeningCalendarData;
}

interface StudentListeningTodayPanelProps {
  initialSummary?: TodaySummary | null;
  /** 과제 생성 후 갱신 */
  refreshAfterEnsureMs?: number;
}

/** "9월 15일" */
function formatMonthDay(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

/** "9월 17일 (수)" */
function formatStudyDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const w = DAY_LABELS[d.getDay()] ?? "";
  return `${formatMonthDay(iso)} (${w})`;
}

function daysBefore(taskDate: string, todayIso: string): number {
  const today = new Date(todayIso + "T12:00:00");
  const task = new Date(taskDate + "T12:00:00");
  return Math.round((today.getTime() - task.getTime()) / 86400000);
}

function joinMeta(parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(" · ");
}

interface MonthStats {
  completedDays: number;
  streak: number;
  assignedDays: number;
}

/** 이번 달 달력 데이터로 완료한 날·연속 학습·배정일 수를 센다 */
function computeMonthStats(calendar: ListeningCalendarData): MonthStats {
  const days = calendar.days;
  const completedDays = days.filter((d) => d.status === "completed").length;
  const assignedDays = days.filter((d) => d.isStudyDay).length;

  let streak = 0;
  const pastStudyDays = days
    .filter((d) => d.isStudyDay && d.taskDate <= calendar.todayIso)
    .sort((a, b) => (a.taskDate < b.taskDate ? 1 : -1));
  for (const d of pastStudyDays) {
    const isToday = d.taskDate === calendar.todayIso;
    if (!d.taskId) continue; // 과제가 없는 날은 건너뜀
    if (d.status === "completed") {
      streak += 1;
      continue;
    }
    if (isToday) continue; // 오늘은 아직 진행 중이면 끊지 않음
    break;
  }

  return { completedDays, streak, assignedDays };
}

/* ───────────────────────── 오늘 카드 ───────────────────────── */

function TodayCardShell({
  todayIso,
  children,
}: {
  todayIso: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-side p-5 text-white shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-side-muted">
          오늘의 듣기학습 · {formatMonthDay(todayIso)}
        </span>
        <Icon name="headphones" size={20} className="text-side-muted" />
      </div>
      {children}
    </section>
  );
}

function TodayCard({ summary }: { summary: TodaySummary }) {
  const today = summary.todayTask;
  const todayIso = summary.todayIso;
  const missedCount = summary.missedTasks?.length ?? 0;

  if (today) {
    const done = today.status === "completed";
    const title = today.setTitle || today.assignmentTitle;
    const percent =
      today.totalCount > 0
        ? Math.min(100, Math.round((today.completedCount / today.totalCount) * 100))
        : done
          ? 100
          : 0;
    const meta = joinMeta([
      today.questionRangeLabel,
      `${today.totalCount}문항`,
      today.setTitle && today.assignmentTitle !== today.setTitle
        ? today.assignmentTitle
        : null,
    ]);

    return (
      <TodayCardShell todayIso={todayIso}>
        <div className="flex flex-col gap-1">
          {done && (
            <span className="mb-1 inline-flex w-fit items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
              <Icon name="check" size={13} strokeWidth={2.6} />
              오늘 듣기학습 완료
            </span>
          )}
          <p className="text-xl font-bold leading-snug sm:text-[22px]">{title}</p>
          <p className="text-sm text-side-text">{meta}</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-[13px] text-side-text">
            <span className="tabular-nums">
              완료 {today.completedCount} / {today.totalCount}
              {today.remainingCount > 0 ? ` · 남은 ${today.remainingCount}문항` : ""}
            </span>
            <span className="font-bold tabular-nums text-white">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#223a58]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                done ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <Link
          href={`/student/listening/daily/${today.id}`}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-white text-[15px] font-bold text-side transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {done ? (
            <>
              <Icon name="rotate" size={16} strokeWidth={2.2} />
              복습하기
            </>
          ) : (
            <>
              <Icon name="play" size={14} strokeWidth={1} filled />
              {today.completedCount > 0 ? "이어 풀기" : "오늘 학습 시작"}
            </>
          )}
        </Link>
      </TodayCardShell>
    );
  }

  // 오늘 과제가 없음 — 선생님이 멈춘 학습이면 그렇게 알려 준다
  const paused = summary.paused ?? [];
  const pausedOnly = !summary.isStudyDayToday && paused.length > 0;
  // 다음 학습일은 멈춘 날을 건너뛰어 계산돼 있다
  const resumeDate = pausedOnly ? summary.nextStudyDate : null;
  const message = summary.isStudyDayToday
    ? missedCount > 0
      ? "오늘 학습 전에 못 끝낸 학습을 마저 풀어 주세요."
      : "오늘 학습을 준비하지 못했어요. 페이지를 새로고침해 주세요."
    : pausedOnly
      ? "선생님이 잠시 멈춘 학습이에요."
      : "오늘은 듣기학습 배정일이 아닙니다.";

  return (
    <TodayCardShell todayIso={todayIso}>
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-bold leading-snug">{message}</p>
        {pausedOnly ? (
          <p className="flex items-center gap-1.5 text-sm text-side-text">
            <Icon name="pause" size={15} />
            {resumeDate
              ? `${formatStudyDate(resumeDate)}부터 이어서 풀어요`
              : "다시 시작하면 멈춘 곳부터 이어서 풀어요"}
          </p>
        ) : summary.nextStudyDate && (
          <p className="flex items-center gap-1.5 text-sm text-side-text">
            <Icon name="calendar" size={15} />
            다음 학습일 {formatStudyDate(summary.nextStudyDate)}
          </p>
        )}
      </div>
    </TodayCardShell>
  );
}

function MissedTaskCard({
  task,
  todayIso,
}: {
  task: DailyTaskView;
  todayIso: string;
}) {
  const diff = daysBefore(task.taskDate, todayIso);
  const title =
    diff === 1
      ? "어제 못 끝낸 학습이 있어요"
      : `${formatMonthDay(task.taskDate)} 못 끝낸 학습`;
  const meta = joinMeta([
    formatMonthDay(task.taskDate),
    task.setTitle || task.assignmentTitle,
    task.questionRangeLabel,
    `남은 ${task.remainingCount}문항`,
  ]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-white px-4 py-4 shadow-card sm:px-[18px]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
        <Icon name="calendar" size={18} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="text-xs leading-snug text-slate-500">{meta}</span>
      </div>
      <ButtonLink
        href={`/student/listening/daily/${task.id}`}
        variant="secondary"
        size="sm"
        className="shrink-0 px-3.5 text-[13px]"
      >
        마저 풀기
      </ButtonLink>
    </div>
  );
}

function MonthStatsCard({ stats }: { stats: MonthStats }) {
  const tiles = [
    { label: "완료한 날", value: stats.completedDays },
    { label: "연속 학습", value: stats.streak },
    { label: "이번 달 배정", value: stats.assignedDays },
  ];
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-5 py-[18px] shadow-card">
      <h2 className="text-[15px] font-bold text-slate-900">이번 달</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 rounded-md bg-slate-50 p-3">
            <span className="text-xs text-slate-500">{t.label}</span>
            <span>
              <span className="text-[22px] font-bold leading-none tabular-nums text-slate-900">
                {t.value}
              </span>
              <span className="ml-0.5 text-xs text-slate-500">일</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelSkeleton() {
  return (
    <div
      className="grid items-start gap-5 xl:grid-cols-[420px_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="오늘의 듣기학습을 불러오는 중"
    >
      <div className="flex flex-col gap-4">
        <div className="flex animate-pulse flex-col gap-4 rounded-lg bg-side p-6">
          <div className="h-3.5 w-40 rounded bg-white/10" />
          <div className="h-6 w-56 rounded bg-white/15" />
          <div className="h-3.5 w-44 rounded bg-white/10" />
          <div className="h-2 w-full rounded-full bg-white/10" />
          <div className="h-11 w-full rounded-md bg-white/15" />
        </div>
        <div className="h-[104px] animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
      <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
    </div>
  );
}

/* ───────────────────────── 패널 ───────────────────────── */

export function StudentListeningTodayPanel({
  initialSummary = null,
  refreshAfterEnsureMs = 0,
}: StudentListeningTodayPanelProps) {
  const [summary, setSummary] = useState<TodaySummary | null>(initialSummary);
  const [loading, setLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false, year?: number, month?: number) => {
    if (!silent) setError(null);
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    // 월 이동은 달력만 — ensure 재실행 생략
    if (year && month) params.set("mode", "calendar");
    const qs = params.toString();
    const res = await fetch(
      `/api/listening/schedule-assignments/today${qs ? `?${qs}` : ""}`
    );
    const data = (await res.json()) as TodaySummary & {
      ok?: boolean;
      message?: string;
      calendar?: ListeningCalendarData;
    };
    if (!data.ok) {
      if (!silent) {
        setError(data.message ?? "오늘 과제를 불러오지 못했습니다.");
      }
      return null;
    }
    // 월 이동 결과는 달력에만 쓰고, "이번 달" 통계는 오늘이 속한 달 기준으로 유지
    if (year && month) return data;
    setSummary(data);
    return data;
  }, []);

  const loadCalendarMonth = useCallback(
    async (year: number, month: number) => {
      const data = await load(true, year, month);
      return data?.calendar ?? null;
    },
    [load]
  );

  useEffect(() => {
    if (initialSummary) {
      setSummary(initialSummary);
      setLoading(false);
      // 뒤로 가기 등으로 같은 서버 데이터가 다시 붙으면 조용히 새로 받는다
      if (!isFirstUseOfServerData(initialSummary)) void load(true);
      return;
    }

    setLoading(true);
    void load().finally(() => setLoading(false));

    if (refreshAfterEnsureMs <= 0) return;
    const timer = window.setTimeout(() => {
      void load(true);
    }, refreshAfterEnsureMs);
    return () => window.clearTimeout(timer);
  }, [initialSummary, load, refreshAfterEnsureMs]);

  const calendar = summary?.calendar;
  const hasCalendar = Boolean(calendar?.days.some((d) => d.isStudyDay));
  const stats = useMemo(
    () => (calendar && hasCalendar ? computeMonthStats(calendar) : null),
    [calendar, hasCalendar]
  );

  if (loading && !summary) {
    return <PanelSkeleton />;
  }

  if (error && !summary) {
    return null;
  }

  if (!summary) return null;

  const missed = summary.missedTasks ?? [];

  return (
    <div
      className={`grid items-start gap-5 ${
        hasCalendar ? "xl:grid-cols-[420px_minmax(0,1fr)]" : "max-w-xl"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <TodayCard summary={summary} />
        {missed.map((task) => (
          <MissedTaskCard key={task.id} task={task} todayIso={summary.todayIso} />
        ))}
        {stats && <MonthStatsCard stats={stats} />}
      </div>
      {calendar && hasCalendar && (
        <StudentListeningCalendar
          initialCalendar={calendar}
          onMonthChange={loadCalendarMonth}
        />
      )}
    </div>
  );
}
