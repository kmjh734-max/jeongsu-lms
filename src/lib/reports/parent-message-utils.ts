import type { StudentReport } from "@/lib/reports/types";
import { buildParentReportMessage } from "@/lib/reports/build-parent-message";

const SECTION1_HEADER = "1. 학습 리포트";
const SECTION2_HEADER = "2. 영상 학습 현황";

function defaultLearningReportText(report: StudentReport): string {
  return `${report.summary.videoLine} ${report.summary.vocabLine} ${report.summary.reviewLine}`;
}

/** 학부모 문구에서 1번 학습 리포트 본문만 추출 */
export function extractLearningReportSection(message: string): string {
  const lines = message.split("\n");
  const startIdx = lines.findIndex((l) => l.trim() === SECTION1_HEADER);
  const endIdx = lines.findIndex((l) => l.trim() === SECTION2_HEADER);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return "";
  }
  return lines
    .slice(startIdx + 1, endIdx)
    .filter((l) => l.trim() !== "")
    .join("\n");
}

/** 1번 학습 리포트 섹션만 교체 (수동 편집된 나머지 문구는 유지) */
export function replaceLearningReportSection(
  message: string,
  learningReportText: string,
  report: StudentReport
): string {
  const lines = message.split("\n");
  const startIdx = lines.findIndex((l) => l.trim() === SECTION1_HEADER);
  const endIdx = lines.findIndex((l) => l.trim() === SECTION2_HEADER);

  const body =
    learningReportText.trim() || defaultLearningReportText(report);

  if (startIdx === -1 || endIdx === -1) {
    return buildParentReportMessage({ report, learningReportText: body });
  }

  return [
    ...lines.slice(0, startIdx + 1),
    body,
    ...lines.slice(endIdx),
  ].join("\n");
}
