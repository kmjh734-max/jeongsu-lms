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
  // "기록이 없습니다" 같은 말은 학부모에게 알려 줄 것이 없다 — 있는 것만 적는다
  const blank = /(없습니다|없음)\s*[.]?\s*$/;
  return [
    report.summary.videoLine,
    report.summary.vocabLine,
    report.summary.reviewLine,
    report.summary.listeningScheduleLine,
  ]
    .map((t) => String(t ?? "").trim())
    .filter((t) => t && !blank.test(t))
    .join(" ");
}
