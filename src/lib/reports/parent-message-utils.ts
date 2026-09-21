import type { StudentReport } from "@/lib/reports/types";
import { buildParentReportMessage } from "@/lib/reports/build-parent-message";

const SECTION1_HEADER = "1. 학습 리포트";
const SECTION2_HEADER = "2. 영상 학습 현황";

function defaultLearningReportText(report: StudentReport): string {
  return `${report.summary.videoLine} ${report.summary.vocabLine} ${report.summary.reviewLine} ${report.summary.listeningScheduleLine}`;
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
  report: StudentReport,
  academyName?: string
): string {
  const lines = message.split("\n");
  const startIdx = lines.findIndex((l) => l.trim() === SECTION1_HEADER);
  const endIdx = lines.findIndex((l) => l.trim() === SECTION2_HEADER);

  const body =
    learningReportText.trim() || defaultLearningReportText(report);

  if (startIdx === -1 || endIdx === -1) {
    return buildParentReportMessage({
      report,
      learningReportText: body,
      academyName,
    });
  }

  return [
    ...lines.slice(0, startIdx + 1),
    body,
    ...lines.slice(endIdx),
  ].join("\n");
}

/**
 * 화면에서 미리 본 안내 문구에 리포트 링크를 붙인다.
 *
 * 카카오톡으로 보내는 글과 화면에 보이는 글이 같아야 하므로, 보내기 직전에 이 글을
 * 그대로 본문으로 쓴다. 이미 링크가 들어 있으면 그 자리의 주소만 새 것으로 바꾼다.
 */
export function attachReportLinkToMessage(message: string, shareUrl: string): string {
  const url = shareUrl.trim();
  const base = message.trim();
  if (!url) return base;
  if (base.includes(url)) return base;
  if (/https?:\/\/\S+/i.test(base)) {
    return base.replace(/https?:\/\/\S+/gi, url);
  }
  if (!base) return url;
  return `${base}\n\n아래 링크에서 확인해 주세요.\n${url}`;
}
