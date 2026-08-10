"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DAY_LABELS } from "@/lib/listening/schedule/days-of-week";
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
  status: string;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

export interface TodaySummary {
  todayIso: string;
  isStudyDayToday: boolean;
  todayTask: DailyTaskView | null;
  missedTasks: DailyTaskView[];
  nextStudyDate: string | null;
  calendar?: ListeningCalendarData;
}

interface StudentListeningTodayPanelProps {
  initialSummary?: TodaySummary | null;
  /** 과제 생성 후 갱신 */
  refreshAfterEnsureMs?: number;
}

function formatStudyDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const w = DAY_LABELS[d.getDay()] ?? "";
  return `${iso} (${w})`;
}

function formatTaskDateLabel(taskDate: string, todayIso: string): string {
  if (taskDate === todayIso) return "오늘";
  const today = new Date(todayIso + "T12:00:00");
  const task = new Date(taskDate + "T12:00:00");
  const diffDays = Math.round(
    (today.getTime() - task.getTime()) / 86400000
  );
  if (diffDays === 1) return "어제";
  if (diffDays > 1) return `${diffDays}일 전`;
  return taskDate;
}

function TodaySummaryView({ summary }: { summary: TodaySummary }) {
  const missed = summary.missedTasks ?? [];
  const today = summary.todayTask;
  const todayIso = summary.todayIso;
  const showTodayInProgress =
    today != null && today.status !== "completed";
  const todayBlockedByPrior =
    today != null &&
    missed.some(
      (m) =>
        !today.assignmentId ||
        !m.assignmentId ||
        m.assignmentId === today.assignmentId
    );
  const hasSchedule =
    missed.length > 0 ||
    today != null ||
    !summary.isStudyDayToday ||
    Boolean(summary.nextStudyDate);

  if (!hasSchedule) {
    return null;
  }

  return (
    <section className="mb-6 space-y-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
      <h2 className="text-base font-semibold text-slate-900">오늘의 듣기학습</h2>

      {missed.length > 0 && showTodayInProgress && (
        <p className="text-xs text-amber-800">
          미완료 학습을 먼저 마친 뒤 오늘 학습을 진행할 수 있습니다.
        </p>
      )}

      {missed.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm"
        >
          <p className="font-medium text-amber-900">
            {formatTaskDateLabel(task.taskDate, todayIso)}({task.taskDate}) 미완료
            학습이 있습니다
          </p>
          <p className="mt-1 text-amber-800">
            {task.assignmentTitle} · 남은 문항 {task.remainingCount}개
          </p>
          <Link
            href={`/student/listening/daily/${task.id}`}
            className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            마저 풀기
          </Link>
        </div>
      ))}

      {today && today.status === "completed" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <p className="font-semibold">오늘 듣기학습 완료</p>
          <p className="mt-1">
            완료 문항: {today.completedCount} / {today.totalCount}
          </p>
          <Link
            href={`/student/listening/daily/${today.id}`}
            className="mt-2 inline-block rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
          >
            복습하기
          </Link>
        </div>
      )}

      {showTodayInProgress && today && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm">
          <p className="font-medium text-slate-900">
            오늘 학습: {today.totalCount}문항 ({today.setTitle})
          </p>
          <p className="mt-1 text-slate-600">
            완료: {today.completedCount} / {today.totalCount}
            {today.remainingCount > 0
              ? ` · 남은 문항 ${today.remainingCount}개`
              : ""}
          </p>
          {todayBlockedByPrior ? (
            <p className="mt-2 text-xs font-medium text-amber-800">
              위 미완료 학습을 끝낸 뒤 시작할 수 있습니다.
            </p>
          ) : (
            <Link
              href={`/student/listening/daily/${today.id}`}
              className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {today.completedCount > 0 ? "이어 풀기" : "오늘 학습 시작"}
            </Link>
          )}
        </div>
      )}

      {!today && !missed.length && summary.isStudyDayToday && (
        <p className="text-sm text-slate-600">
          오늘 듣기학습 과제를 준비하지 못했습니다. 페이지를 새로고침해 주세요.
          {summary.nextStudyDate && (
            <span className="mt-1 block">
              다음 학습일: {formatStudyDate(summary.nextStudyDate)}
            </span>
          )}
        </p>
      )}

      {!today && !missed.length && !summary.isStudyDayToday && (
        <p className="text-sm text-slate-600">
          오늘은 듣기학습 배정일이 아닙니다.
          {summary.nextStudyDate && (
            <span className="mt-1 block">
              다음 학습일: {formatStudyDate(summary.nextStudyDate)}
            </span>
          )}
        </p>
      )}
    </section>
  );
}

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
    if (year && month && data.calendar) {
      setSummary((prev) =>
        prev
          ? { ...prev, calendar: data.calendar }
          : ({
              todayIso: data.todayIso,
              isStudyDayToday: false,
              todayTask: null,
              missedTasks: [],
              nextStudyDate: null,
              calendar: data.calendar,
            } as TodaySummary)
      );
      return data;
    }
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

  if (loading && !summary) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-slate-600">
        오늘의 듣기학습을 불러오는 중…
      </div>
    );
  }

  if (error && !summary) {
    return null;
  }

  if (!summary) return null;

  return (
    <>
      <TodaySummaryView summary={summary} />
      {summary.calendar && (
        <StudentListeningCalendar
          initialCalendar={summary.calendar}
          onMonthChange={loadCalendarMonth}
        />
      )}
    </>
  );
}
