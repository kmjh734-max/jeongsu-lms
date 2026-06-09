import {
  homeworkSymbolChar,
  homeworkSymbolTitle,
} from "@/lib/learning-status/homework-symbol";
import type { HomeworkDayCell } from "@/lib/learning-status/types";

const DAY_CELL = "w-8 min-w-[2rem]";

function weekdayHeaderClass(weekday: number): string {
  if (weekday === 0) return "text-red-600";
  if (weekday === 6) return "text-blue-600";
  return "text-slate-700";
}

function symbolClass(symbol: string): string {
  if (symbol === "missing") return "font-bold text-red-600";
  if (symbol === "complete") return "font-bold text-emerald-700";
  if (symbol === "partial") return "font-bold text-amber-700";
  return "text-slate-400";
}

/** 테이블 헤더용 — 날짜 1~31 (한 번만 표시) */
export function MonthlyHomeworkDayHeaders({
  days,
  daysInMonth,
}: {
  days: HomeworkDayCell[];
  daysInMonth: number;
}) {
  const dayMap = new Map(days.map((d) => [d.day, d]));

  return (
    <>
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const cell = dayMap.get(day);
        const weekday = cell?.weekday ?? new Date(2024, 0, day).getDay();
        return (
          <th
            key={day}
            className={`${DAY_CELL} border-l border-slate-200 px-0 py-1.5 text-center text-[11px] font-semibold ${weekdayHeaderClass(weekday)} ${
              cell?.isToday ? "bg-amber-100" : "bg-slate-50"
            }`}
          >
            {day}
          </th>
        );
      })}
    </>
  );
}

interface MonthlyHomeworkGridProps {
  days: HomeworkDayCell[];
  daysInMonth: number;
}

/** 학생 행용 — 기호만 (○ △ X) */
export function MonthlyHomeworkSymbols({
  days,
  daysInMonth,
}: MonthlyHomeworkGridProps) {
  const dayMap = new Map(days.map((d) => [d.day, d]));

  return (
    <>
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const cell = dayMap.get(day);
        const symbol = cell?.symbol ?? "none";
        const char = homeworkSymbolChar(symbol);
        return (
          <td
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
            className={`${DAY_CELL} border-l border-slate-100 px-0 py-2 text-center text-base leading-none ${symbolClass(symbol)} ${
              cell?.isToday ? "bg-amber-50" : ""
            }`}
          >
            {char || ""}
          </td>
        );
      })}
    </>
  );
}

/** 단독 미리보기용 (레거시) */
export function MonthlyHomeworkGrid({
  days,
  daysInMonth,
}: MonthlyHomeworkGridProps) {
  return (
    <table className="border-collapse text-sm">
      <thead>
        <tr>
          <MonthlyHomeworkDayHeaders days={days} daysInMonth={daysInMonth} />
        </tr>
      </thead>
      <tbody>
        <tr>
          <MonthlyHomeworkSymbols days={days} daysInMonth={daysInMonth} />
        </tr>
      </tbody>
    </table>
  );
}

export function HomeworkStatusLegend() {
  return (
    <p className="text-xs text-slate-600">
      <span className="text-base font-bold text-emerald-700">○</span> 완료{" "}
      <span className="text-base font-bold text-amber-700">△</span> 일부 완료{" "}
      <span className="text-base font-bold text-red-600">X</span> 미완료{" "}
      <span className="text-slate-500">(빈칸: 과제 없음 · 토=파랑 · 일=빨강)</span>
    </p>
  );
}
