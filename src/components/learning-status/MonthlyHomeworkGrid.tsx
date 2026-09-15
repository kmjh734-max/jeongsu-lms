import { Icon } from "@/components/layout/NavIcon";
import { homeworkSymbolTitle } from "@/lib/learning-status/homework-symbol";
import type { HomeworkDayCell, HomeworkDaySymbol } from "@/lib/learning-status/types";

/** 한 칸 표시: 완료 초록 체크 · 일부 주황 테 · 안 함 빨간 X · 예정 회색 */
export function HomeworkStatusDot({ symbol }: { symbol: HomeworkDaySymbol }) {
  if (symbol === "complete") {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-700 text-white">
        <Icon name="check" size={11} strokeWidth={3} />
      </span>
    );
  }
  if (symbol === "partial") {
    return (
      <span className="block h-[18px] w-[18px] rounded-full border-[1.5px] border-amber-700 bg-amber-50" />
    );
  }
  if (symbol === "missing") {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="x" size={10} strokeWidth={3} />
      </span>
    );
  }
  if (symbol === "scheduled") {
    return <span className="block h-[18px] w-[18px] rounded-full bg-slate-100" />;
  }
  if (symbol === "paused") {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon name="pause" size={10} strokeWidth={2.6} />
      </span>
    );
  }
  return <span className="block h-[18px] w-[18px]" />;
}

export function HomeworkStatusLegend({ withPaused = false }: { withPaused?: boolean }) {
  const items: Array<[string, string]> = [
    ["bg-green-700", "완료"],
    ["bg-amber-700", "일부"],
    ["bg-rose-700", "안 함"],
    ["bg-slate-300", "예정"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
        </span>
      ))}
      {withPaused ? (
        <span className="flex items-center gap-1 text-slate-500">
          <Icon name="pause" size={10} strokeWidth={2.6} className="text-slate-400" />
          일시정지
        </span>
      ) : null}
    </div>
  );
}

export interface MonthlyHomeworkGridRow {
  id: string;
  name: string;
  /** 이름 아래 작은 글씨 (예: 반) */
  sub?: string;
  /** 이름 아래 회색 표시 (예: 일시정지 · 9/15부터) */
  pausedLabel?: string;
  days: HomeworkDayCell[];
  /** 수행률 % — 없으면 — */
  rate: number | null;
}

function rateTone(rate: number): string {
  if (rate < 60) return "text-rose-700";
  if (rate < 85) return "text-amber-700";
  return "text-slate-900";
}

/** 학생 × 공부하는 날 표 (학생 이름 칸 고정) */
export function MonthlyHomeworkGrid({
  rows,
  todayIso,
  onNameClick,
}: {
  rows: MonthlyHomeworkGridRow[];
  todayIso: string;
  onNameClick?: (id: string) => void;
}) {
  // 누구에게든 과제가 있는(또는 멈춘) 날만 열로 보인다
  const shown = (cell: HomeworkDayCell | undefined) =>
    Boolean(cell && (cell.isStudyDay || cell.symbol === "paused"));
  const studyDays = new Map<number, HomeworkDayCell>();
  for (const row of rows) {
    for (const cell of row.days) {
      if (shown(cell) && !studyDays.has(cell.day)) studyDays.set(cell.day, cell);
    }
  }
  const columns = [...studyDays.values()].sort((a, b) => a.day - b.day);

  if (columns.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        이 달에는 배정된 듣기 과제가 없어요.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
            <th className="sticky left-0 z-10 w-[120px] min-w-[120px] bg-slate-50 px-4 py-2.5 text-left font-semibold">
              학생
            </th>
            {columns.map((c) => {
              const today = c.taskDate === todayIso;
              return (
                <th
                  key={c.day}
                  scope="col"
                  className={`min-w-[30px] px-0.5 py-2.5 text-center tabular-nums ${
                    today ? "font-extrabold text-brand-700" : ""
                  } ${c.weekday === 0 ? "text-rose-600" : ""}`}
                  aria-label={today ? `${c.day}일 (오늘)` : `${c.day}일`}
                >
                  {c.day}
                </th>
              );
            })}
            <th className="w-[70px] min-w-[70px] px-4 py-2.5 text-right font-semibold">수행률</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const byDay = new Map(row.days.map((d) => [d.day, d]));
            return (
              <tr key={row.id} className={i > 0 ? "border-t border-slate-100" : ""}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-normal"
                >
                  {onNameClick ? (
                    <button
                      type="button"
                      onClick={() => onNameClick(row.id)}
                      className="block max-w-[104px] truncate text-left text-[13px] font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                    >
                      {row.name}
                    </button>
                  ) : (
                    <span className="block max-w-[104px] truncate text-[13px] font-semibold text-slate-900">
                      {row.name}
                    </span>
                  )}
                  {row.sub ? (
                    <span className="block max-w-[104px] truncate text-[11px] text-slate-400">
                      {row.sub}
                    </span>
                  ) : null}
                  {row.pausedLabel ? (
                    <span className="mt-0.5 flex max-w-[104px] items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Icon name="pause" size={10} strokeWidth={2.6} className="text-slate-400" />
                      <span className="truncate">{row.pausedLabel}</span>
                    </span>
                  ) : null}
                </th>
                {columns.map((c) => {
                  const cell = byDay.get(c.day);
                  const symbol = cell && shown(cell) ? cell.symbol : "none";
                  return (
                    <td
                      key={c.day}
                      className="px-0.5 py-2"
                      title={
                        cell && shown(cell)
                          ? homeworkSymbolTitle(symbol, cell.completedCount, cell.totalCount)
                          : undefined
                      }
                    >
                      <span className="flex justify-center">
                        <HomeworkStatusDot symbol={symbol} />
                      </span>
                    </td>
                  );
                })}
                <td
                  className={`px-4 py-2 text-right text-[13px] font-bold tabular-nums ${
                    row.rate === null ? "text-slate-400" : rateTone(row.rate)
                  }`}
                >
                  {row.rate === null ? "—" : `${row.rate}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
