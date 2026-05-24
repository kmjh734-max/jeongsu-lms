import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import type { StudentReport } from "@/lib/reports/types";

export function buildParentReportMessage(
  report: StudentReport,
  teacherComment: string
): string {
  const studentName = report.student.name;
  const classText =
    report.student.classNames.length > 0
      ? report.student.classNames.join(", ")
      : "—";
  const loginText = report.student.loginId ?? "—";
  const generated = formatLastStudiedDate(report.generatedAt);

  const lines: string[] = [
    `[${studentName} 학생 학습 리포트]`,
    "",
    "안녕하세요. 정수학원입니다.",
    `${report.rangeLabel} 기준 ${studentName} 학생의 온라인 학습 현황을 안내드립니다.`,
    "",
    "1. 영상 학습",
  ];

  if (report.courses.length === 0) {
    lines.push("- 배정된 강좌가 없습니다.");
  } else {
    for (const course of report.courses) {
      lines.push(
        `- ${course.courseTitle}: ${course.totalLessons}강 중 ${course.completedLessons}강 완료, 진도율 ${course.progressPercent}%`
      );
      lines.push(
        `  · 최근 학습일: ${formatLastStudiedDate(course.lastStudiedAt)}`
      );
    }
  }

  lines.push("", "2. 단어학습");

  if (report.vocabSets.length === 0) {
    lines.push("- 배정된 단어장이 없습니다.");
  } else {
    for (const set of report.vocabSets) {
      if (set.stage4Passed) {
        lines.push(
          `- ${set.setTitle}: 4단계 종합테스트 ${set.stage4BestScore}점 합격`
        );
      } else if (set.stage4AttemptCount > 0) {
        lines.push(
          `- ${set.setTitle}: 4단계 ${set.stage4LastScore}점 (최고 ${set.stage4BestScore}점), ${set.statusLabel}`
        );
      } else {
        lines.push(`- ${set.setTitle}: ${set.statusLabel}`);
      }
      lines.push(
        `  · 최근 학습일: ${formatLastStudiedDate(set.lastStudiedAt)}`
      );
    }
  }

  lines.push("", "3. 복습 필요 단어");

  if (report.reviewWords.length === 0) {
    lines.push("- 없음");
  } else {
    for (const word of report.reviewWords.slice(0, 20)) {
      lines.push(`- ${word.word} / ${word.meaning}`);
    }
    if (report.reviewWords.length > 20) {
      lines.push(`- 외 ${report.reviewWords.length - 20}개`);
    }
  }

  lines.push("", "4. 강사 코멘트");
  lines.push(teacherComment.trim() || "(코멘트 없음)");
  lines.push("");
  lines.push("앞으로도 꾸준히 학습할 수 있도록 지도하겠습니다.");
  lines.push("감사합니다.");
  lines.push("");
  lines.push(`— 리포트 생성일: ${generated}`);
  lines.push(`— 소속 반: ${classText} · 아이디: ${loginText}`);

  return lines.join("\n");
}
