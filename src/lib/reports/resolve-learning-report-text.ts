import { extractLearningReportSection } from "@/lib/reports/parent-message-utils";
import type { StudentReport } from "@/lib/reports/types";

/** 화면·인쇄에 쓸 AI 학습 리포트 본문 */
export function resolveLearningReportText(
  report: StudentReport,
  parentMessage: string,
  aiReportText?: string
): string {
  const fromAi = aiReportText?.trim();
  if (fromAi) return fromAi;
  const fromParent = extractLearningReportSection(parentMessage).trim();
  if (fromParent) return fromParent;
  return `${report.summary.videoLine} ${report.summary.vocabLine} ${report.summary.reviewLine} ${report.summary.listeningScheduleLine}`;
}
