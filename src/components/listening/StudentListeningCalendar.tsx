"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
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
  /** 선생님이 멈춘 날 */
  paused?: boolean;
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

type DayTone = "completed" | "missed" | "today" | "scheduled" | "paused" | "none";

function dayTone(day: ListeningCalendarDay, todayIso: string): DayTone {
  if (!day.isStudyDay) return day.paused ? "paused" : "none";
  if (day.status === "completed") return "completed";
  if (day.taskDate === todayIso) return "today";
  if (day.locked) return "scheduled";
  return "missed";
}

function statusLabel(day: ListeningCalendarDay, todayIso: string): string {
  if (!day.isStudyDay) return day.paused ? "쉼" : "";
  if (day.status === "completed") return "완료";
  if (day.taskDate === todayIso) {
    return day.totalCount > 0
      ? `${day.completedCount}/${day.totalCount}`
      : "오늘";
  }
  if (day.locked) return "예정";
  return "미완료";
}

const TAG_CLASS: Record<DayTone, string> = {
  completed: "bg-green-50 text-green-700",
  missed: "bg-amber-50 text-amber-700",
  today: "bg-brand-600 text-white",
  scheduled: "bg-slate-100 text-slate-400",
  paused: "bg-slate-50 text-slate-400",
  none: "",
};

const DOT_CLASS: Record<DayTone, string> = {
  completed: "bg-green-600",
  missed: "bg-amber-600",
  today: "bg-brand-600",
  scheduled: "bg-slate-300",
  paused: "bg-slate-200",
  none: "",
};

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

  const firstDay = calendar.days[0];
  const firstWeekday = firstDay ? parseDateOnly(firstDay.taskDate).getDay() : 0;
  const padding = Array.from({ length: firstWeekday }, (_, i) => i);
  const navDisabled = loading || !onMonthChange;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card sm:px-[22px] sm:py-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
            onClick={() => void changeMonth(-1)}
            disabled={navDisabled}
            aria-label="이전 달"
          >
            <Icon name="left" size={16} />
          </button>
          <h2 className="min-w-[6.5rem] text-center text-base font-bold tabular-nums text-slate-900">
            {calendar.year}년 {calendar.month}월
          </h2>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
            onClick={() => void changeMonth(1)}
            disabled={navDisabled}
            aria-label="다음 달"
          >
            <Icon name="chevron" size={16} />
          </button>
        </div>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-700" />
            완료
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-700" />
            미완료 · 풀 수 있음
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            예정
          </li>
          {calendar.days.some((d) => d.paused) ? (
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              쉼
            </li>
          ) : null}
        </ul>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((w) => (
          <div
            key={w}
            className={`text-center text-xs font-semibold ${
              w === 0 ? "text-red-600" : "text-slate-500"
            }`}
          >
            {DAY_LABELS[w]}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 gap-1 transition-opacity sm:gap-1.5 ${
          loading ? "opacity-60" : ""
        }`}
      >
        {padding.map((p) => (
          <div key={`pad-${p}`} />
        ))}
        {calendar.days.map((day) => {
          const tone = dayTone(day, calendar.todayIso);
          const label = statusLabel(day, calendar.todayIso);
          const isToday = day.taskDate === calendar.todayIso;
          // 과거·오늘의 과제는 풀기(미완료) 또는 복습(완료)으로 들어갈 수 있음
          const linkable = day.isStudyDay && !day.locked && Boolean(day.taskId);

          const numberClass = isToday
            ? "font-bold text-brand-700"
            : day.weekday === 0
              ? "font-medium text-red-600"
              : "font-medium text-slate-700";

          const inner = (
            <div
              className={`flex aspect-square flex-col justify-between rounded-md border bg-white p-1.5 sm:aspect-auto sm:h-16 sm:px-2 sm:py-1.5 ${
                isToday
                  ? "border-brand-600 ring-[3px] ring-brand-50"
                  : "border-slate-100"
              } ${linkable ? "transition group-hover:border-slate-300 group-hover:bg-slate-50" : ""}`}
              title={
                day.isStudyDay
                  ? `${day.taskDate} ${label}${
                      day.totalCount ? ` · ${day.completedCount}/${day.totalCount}` : ""
                    }`
                  : undefined
              }
            >
              <span className={`text-[13px] leading-none tabular-nums ${numberClass}`}>
                {day.day}
              </span>
              {tone !== "none" && label && (
                <>
                  <span
                    className={`hidden self-start whitespace-nowrap rounded px-1.5 py-px text-[11px] font-semibold tabular-nums sm:inline-block ${TAG_CLASS[tone]}`}
                  >
                    {label}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 self-start rounded-full sm:hidden ${DOT_CLASS[tone]}`}
                    aria-label={label}
                  />
                </>
              )}
            </div>
          );

          if (linkable) {
            return (
              <Link
                key={day.taskDate}
                href={`/student/listening/daily/${day.taskId}`}
                className="group block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
              >
                {inner}
              </Link>
            );
          }

          return <div key={day.taskDate}>{inner}</div>;
        })}
      </div>
    </section>
  );
}

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}
