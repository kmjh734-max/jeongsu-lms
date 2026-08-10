import { ACADEMY_NAME } from "@/lib/branding";
import { formatReviewWordParentLine, formatVocabSetParentLine } from "@/lib/reports/format-lines";
import type { StudentReport } from "@/lib/reports/types";

export interface ParentMessageInput {
  report: StudentReport;
  /** 반영 버튼으로 확정된 학습 리포트 본문 (비어 있으면 시스템 요약 placeholder) */
  learningReportText?: string;
  /** 학원명 (학원별 브랜딩) */
  academyName?: string;
}

export function buildParentReportMessage({
  report,
  learningReportText,
  academyName = ACADEMY_NAME,
}: ParentMessageInput): string {
  const studentName = report.student.name;
  const lines: string[] = [
    `[${studentName} 학생 학습 리포트]`,
    "",
    `안녕하세요. ${academyName}입니다.`,
    `${report.rangeLabel} 기준 ${studentName} 학생의 온라인 학습 현황을 안내드립니다.`,
    "",
    "1. 학습 리포트",
  ];

  const reflected = learningReportText?.trim();
  if (reflected) {
    lines.push(reflected);
  } else {
    lines.push(
      `${report.summary.videoLine} ${report.summary.vocabLine} ${report.summary.reviewLine} ${report.summary.listeningScheduleLine} ${report.summary.listeningDictationLine} ${report.summary.listeningExamLine}`
    );
  }

  lines.push("", "2. 영상 학습 현황");

  if (report.courses.length === 0) {
    lines.push("- 현재 온라인 영상 강좌는 배정되어 있지 않습니다.");
  } else {
    for (const course of report.courses) {
      lines.push(
        `- ${course.courseTitle} 강좌는 총 ${course.totalLessons}강 중 ${course.completedLessons}강을 완료하여 진도율은 ${course.progressPercent}%입니다.`
      );
      if (course.completedLessonsList.length > 0) {
        lines.push("  완료한 영상:");
        for (const title of course.completedLessonsList) {
          lines.push(`  · ${title}`);
        }
      }
    }
  }

  lines.push("", "3. 단어학습 현황");

  if (report.vocabSets.length === 0) {
    lines.push("- 배정된 단어장이 없습니다.");
  } else {
    for (const set of report.vocabSets) {
      lines.push(formatVocabSetParentLine(set));
    }
  }

  lines.push("", "4. 복습 필요 단어");

  if (report.reviewWords.length === 0) {
    lines.push("- 현재 특별히 복습이 필요한 단어는 없습니다.");
  } else {
    for (const word of report.reviewWords.slice(0, 30)) {
      lines.push(formatReviewWordParentLine(word));
    }
    if (report.reviewWords.length > 30) {
      lines.push(`- 외 ${report.reviewWords.length - 30}개`);
    }
  }

  lines.push("", "5. 듣기 학습 현황");

  if (
    report.listeningSchedule.length === 0 &&
    report.listeningDictation.length === 0 &&
    report.listeningExam.length === 0
  ) {
    lines.push("- 기간 내 듣기 학습 기록이 없습니다.");
  } else {
    for (const s of report.listeningSchedule) {
      lines.push(`- [스케줄] ${s.title}: ${s.summaryLine}`);
    }
    for (const d of report.listeningDictation) {
      lines.push(`- [Dictation] ${d.setTitle}: ${d.summaryLine}`);
    }
    for (const e of report.listeningExam) {
      lines.push(`- [시험] ${e.setTitle}: ${e.summaryLine}`);
    }
  }

  lines.push("");
  lines.push("앞으로도 꾸준히 학습할 수 있도록 지도하겠습니다.");
  lines.push("감사합니다.");

  return lines.join("\n");
}
