import type { ReportRange } from "@/lib/reports/types";

export const DEFAULT_REPORT_RANGE: ReportRange = "30d";

export function parseReportRange(value: string | null | undefined): ReportRange {
  if (value === "all" || value === "7d" || value === "30d" || value === "month") {
    return value;
  }
  return DEFAULT_REPORT_RANGE;
}

export function getReportRangeLabel(range: ReportRange): string {
  switch (range) {
    case "all":
      return "전체";
    case "7d":
      return "최근 7일";
    case "30d":
      return "최근 30일";
    case "month":
      return "이번 달";
  }
}

export interface ReportRangeBounds {
  start: Date | null;
  end: Date;
}

export function getReportRangeBounds(
  range: ReportRange,
  now: Date = new Date()
): ReportRangeBounds {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === "all") {
    return { start: null, end };
  }

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "7d") {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  if (range === "30d") {
    start.setDate(start.getDate() - 29);
    return { start, end };
  }

  start.setDate(1);
  return { start, end };
}

export function isIsoInReportRange(
  iso: string | null | undefined,
  bounds: ReportRangeBounds
): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  if (bounds.start && date < bounds.start) return false;
  if (date > bounds.end) return false;
  return true;
}

export function maxIsoInRange(
  dates: (string | null | undefined)[],
  bounds: ReportRangeBounds
): string | null {
  let latest: Date | null = null;
  for (const iso of dates) {
    if (!iso || !isIsoInReportRange(iso, bounds)) continue;
    const date = new Date(iso);
    if (!latest || date > latest) latest = date;
  }
  return latest ? latest.toISOString() : null;
}
