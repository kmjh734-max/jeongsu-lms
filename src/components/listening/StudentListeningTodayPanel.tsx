"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DAY_LABELS } from "@/lib/listening/schedule/days-of-week";

interface DailyTaskView {
  id: string;
  assignmentTitle: string;
  taskDate: string;
  setTitle: string;
  status: string;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
}

interface TodaySummary {
  todayIso: string;
  isStudyDayToday: boolean;
  todayTask: DailyTaskView | null;
  missedTasks: DailyTaskView[];
  nextStudyDate: string | null;
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

export function StudentListeningTodayPanel() {
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/listening/schedule-assignments/today");
    const data = (await res.json()) as TodaySummary & {
      ok?: boolean;
      message?: string;
    };
    setLoading(false);
    if (!data.ok) {
      setError(data.message ?? "오늘 과제를 불러오지 못했습니다.");
      return;
    }
    setSummary(data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm text-slate-600">
        오늘의 듣기학습을 불러오는 중…
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!summary) return null;

  const missed = summary.missedTasks ?? [];
  const today = summary.todayTask;
  const todayIso = summary.todayIso;
  const showTodayInProgress =
    today != null && today.status !== "completed";
  const hasSchedule =
    missed.length > 0 || today != null || !summary.isStudyDayToday;

  if (!hasSchedule && !summary.nextStudyDate) {
    return null;
  }

  return (
    <section className="mb-6 space-y-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
      <h2 className="text-base font-semibold text-slate-900">오늘의 듣기학습</h2>

      {missed.length > 0 && showTodayInProgress && (
        <p className="text-xs text-amber-800">
          미완료 학습을 먼저 마친 뒤 오늘 학습을 진행해 주세요.
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
          <Link
            href={`/student/listening/daily/${today.id}`}
            className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            {today.completedCount > 0 ? "이어 풀기" : "오늘 학습 시작"}
          </Link>
        </div>
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
