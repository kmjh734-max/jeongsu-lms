import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import type { StudentReport } from "@/lib/reports/types";

export interface ReportSummaryMetrics {
  videoProgressPercent: number | null;
  vocabPassedCount: number;
  vocabTotalCount: number;
  reviewWordCount: number;
  lastStudiedLabel: string;
}

export function computeReportMetrics(report: StudentReport): ReportSummaryMetrics {
  const videoProgressPercent =
    report.courses.length === 0
      ? null
      : Math.round(
          report.courses.reduce((sum, c) => sum + c.progressPercent, 0) /
            report.courses.length
        );

  const vocabPassedCount = report.vocabSets.filter((s) => s.stage4Passed).length;
  const reviewWordCount = report.reviewWords.length;

  const dateCandidates: string[] = [];
  for (const c of report.courses) {
    if (c.lastStudiedAt) dateCandidates.push(c.lastStudiedAt);
  }
  for (const s of report.vocabSets) {
    if (s.lastStudiedAt) dateCandidates.push(s.lastStudiedAt);
  }
  dateCandidates.sort((a, b) => b.localeCompare(a));
  const lastStudiedLabel = dateCandidates[0]
    ? formatLastStudiedDate(dateCandidates[0])
    : "—";

  return {
    videoProgressPercent,
    vocabPassedCount,
    vocabTotalCount: report.vocabSets.length,
    reviewWordCount,
    lastStudiedLabel,
  };
}
