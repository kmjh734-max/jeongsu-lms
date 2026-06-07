import {
  homeworkSymbolChar,
  homeworkSymbolTitle,
} from "@/lib/learning-status/homework-symbol";
import type { HomeworkDayCell } from "@/lib/learning-status/types";

interface MonthlyHomeworkGridProps {
  days: HomeworkDayCell[];
  daysInMonth: number;
}

function weekdayHeaderClass(weekday: number): string {
  if (weekday === 0) return "text-red-600";
  if (weekday === 6) return "text-blue-600";
  return "text-slate-700";
}

export function MonthlyHomeworkGrid({
  days,
  daysInMonth,
}: MonthlyHomeworkGridProps) {
  const dayMap = new Map(days.map((d) => [d.day, d]));

  return (
    <div className="inline-block min-w-max">
      <div className="flex border-b border-slate-200 bg-slate-50 text-center text-[10px] font-semibold">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const cell = dayMap.get(day);
          const weekday = cell?.weekday ?? 0;
          return (
            <div
              key={day}
              className={`w-7 shrink-0 border-r border-slate-100 px-0.5 py-1 last:border-r-0 ${weekdayHeaderClass(weekday)} ${
                cell?.isToday ? "bg-amber-100" : ""
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex text-center text-xs">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const cell = dayMap.get(day);
          const symbol = cell?.symbol ?? "none";
          const char = homeworkSymbolChar(symbol);
          return (
            <div
              key={day}
              title={
                cell
                  ? homeworkSymbolTitle(
                      symbol,
                      cell.completedCount,
                      cell.totalCount
                    )
                  : undefined
              }
              className={`w-7 shrink-0 border-r border-slate-100 py-1.5 last:border-r-0 ${
                cell?.isToday ? "bg-amber-50 font-bold" : ""
              } ${symbol === "missing" ? "text-red-600" : "text-slate-800"}`}
            >
              {char || "\u00A0"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomeworkStatusLegend() {
  return (
    <p className="text-xs text-slate-600">
      <span className="font-medium text-slate-800">○</span> 완료{" "}
      <span className="font-medium text-slate-800">△</span> 일부 완료{" "}
      <span className="font-medium text-red-600">X</span> 미완료{" "}
      <span className="text-slate-500">(빈칸: 과제 없음 · 토=파랑 · 일=빨강)</span>
    </p>
  );
}
