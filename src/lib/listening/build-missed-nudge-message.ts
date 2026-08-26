import { ACADEMY_NAME } from "@/lib/branding";

/** 미학습 독촉용 카카오톡 붙여넣기 문구 */
export function buildListeningMissedNudgeMessage(params: {
  studentName: string;
  monthLabel: string;
  missedDates: string[];
  completedCount: number;
  totalCount: number;
  correctCount?: number;
  answeredCount?: number;
  academyName?: string;
  siteUrl?: string;
}): string {
  const {
    studentName,
    monthLabel,
    missedDates,
    completedCount,
    totalCount,
    correctCount,
    answeredCount,
    academyName = ACADEMY_NAME,
    siteUrl,
  } = params;

  const dateLines =
    missedDates.length === 0
      ? "(미완료 일자 없음)"
      : missedDates
          .slice(0, 12)
          .map((d) => `· ${d}`)
          .join("\n") +
        (missedDates.length > 12
          ? `\n· 외 ${missedDates.length - 12}일`
          : "");

  const accuracyLine =
    answeredCount != null && answeredCount > 0
      ? `\n객관식 정답: ${correctCount ?? 0}/${answeredCount}`
      : "";

  const linkLine = siteUrl
    ? `\n\n학습 바로가기\n${siteUrl.replace(/\/$/, "")}/student/listening`
    : "";

  return `[${academyName}] ${studentName} 학생 듣기학습 안내

안녕하세요. ${monthLabel} 듣기학습 중 아직 마치지 않은 날이 있어 안내드립니다.

수행: ${completedCount}/${totalCount}일 완료${accuracyLine}

미완료 일자
${dateLines}

가정에서도 학습을 독려해 주시면 감사하겠습니다.${linkLine}`;
}
