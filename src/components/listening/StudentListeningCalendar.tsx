"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { DAY_LABELS } from "@/lib/listening/schedule/days-of-week";

export interface ListeningCalendarDay {
  taskDate: string;
  day: number;
  weekday: number;
  isStudyDay: boolean;
  taskId: string | null;
  status: "completed" | "in_progress" | "pending" | "scheduled" | "none";
  locked: boolean;
  totalCount: number;
  completedCount: number;
  assignmentTitle: string | null;
  setTitle: string | null;
}

export interface ListeningCalendarData {
  year: number;
  month: number;
  todayIso: string;
  days: ListeningCalendarDay[];
}

interface StudentListeningCalendarProps {
  initialCalendar: ListeningCalendarData;
  onMonthChange?: (year: number, month: number) => Promise<ListeningCalendarData | null>;
}

function cellClass(day: ListeningCalendarDay, todayIso: string): string {
  if (!day.isStudyDay) return "bg-slate-50 text-slate-300";
  if (day.taskDate === todayIso) {
    if (day.status === "completed") return "bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400";
    return "bg-indigo-100 text-indigo-900 ring-2 ring-indigo-400";
  }
  if (day.locked) return "bg-slate-100 text-slate-400";
  if (day.status === "completed") return "bg-emerald-50 text-emerald-800";
  if (day.status === "in_progress") return "bg-amber-50 text-amber-900";
  return "bg-rose-50 text-rose-800";
}

function statusLabel(day: ListeningCalendarDay, todayIso: string): string {
  if (!day.isStudyDay) return "";
  if (day.locked) {
    return day.taskDate > todayIso ? "예정" : "잠금";
  }
  if (day.status === "completed") return "완료";
  if (day.taskDate === todayIso) return "오늘";
  if (day.status === "in_progress") return "진행";
  return "미완료";
}

export function StudentListeningCalendar({
  initialCalendar,
  onMonthChange,
}: StudentListeningCalendarProps) {
  const [calendar, setCalendar] = useState(initialCalendar);
  const [loading, setLoading] = useState(false);

  const changeMonth = useCallback(
    async (delta: number) => {
      if (!onMonthChange) return;
      let year = calendar.year;
      let month = calendar.month + delta;
      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }
      setLoading(true);
      try {
        const next = await onMonthChange(year, month);
        if (next) setCalendar(next);
      } finally {
        setLoading(false);
      }
    },
    [calendar.year, calendar.month, onMonthChange]
  );

  const studyDays = calendar.days.filter((d) => d.isStudyDay);
  if (studyDays.length === 0) return null;

  const firstWeekday = parseDateOnly(calendar.days[0]!.taskDate).getDay();
  const padding = Array.from({ length: firstWeekday }, (_, i) => i);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">학습 달력</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
            onClick={() => void changeMonth(-1)}
            disabled={loading || !onMonthChange}
            aria-label="이전 달"
          >
            ‹
          </button>
          <span className="min-w-[5.5rem] text-center text-sm font-medium text-slate-700">
            {calendar.year}년 {calendar.month}월
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
            onClick={() => void changeMonth(1)}
            disabled={loading || !onMonthChange}
            aria-label="다음 달"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {[0, 1, 2, 3, 4, 5, 6].map((w) => (
          <div key={w} className="py-1">
            {DAY_LABELS[w]}
          </div>
        ))}
      </div>

      <div className={`mt-1 grid grid-cols-7 gap-1 ${loading ? "opacity-60" : ""}`}>
        {padding.map((p) => (
          <div key={`pad-${p}`} className="aspect-square" />
        ))}
        {calendar.days.map((day) => {
          const label = statusLabel(day, calendar.todayIso);
          const clickable =
            day.isStudyDay &&
            !day.locked &&
            day.taskId &&
            day.status !== "completed";
          const reviewable =
            day.isStudyDay && !day.locked && day.taskId && day.status === "completed";

          const inner = (
            <div
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[11px] leading-tight ${cellClass(day, calendar.todayIso)}`}
              title={
                day.isStudyDay
                  ? `${day.taskDate} ${label}${day.totalCount ? ` · ${day.completedCount}/${day.totalCount}` : ""}`
                  : undefined
              }
            >
              <span className="font-semibold">{day.day}</span>
              {day.isStudyDay && label && (
                <span className="mt-0.5 text-[9px] font-medium">{label}</span>
              )}
            </div>
          );

          if (clickable) {
            return (
              <Link
                key={day.taskDate}
                href={`/student/listening/daily/${day.taskId}`}
                className="block transition hover:opacity-90"
              >
                {inner}
              </Link>
            );
          }

          if (reviewable) {
            return (
              <Link
                key={day.taskDate}
                href={`/student/listening/daily/${day.taskId}`}
                className="block transition hover:opacity-90"
              >
                {inner}
              </Link>
            );
          }

          return <div key={day.taskDate}>{inner}</div>;
        })}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-rose-50 ring-1 ring-rose-200" />
          미완료(풀기 가능)
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-50 ring-1 ring-emerald-200" />
          완료
        </li>
        <li className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded bg-slate-100 ring-1 ring-slate-200" />
          예정(잠김)
        </li>
      </ul>
    </section>
  );
}

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}
