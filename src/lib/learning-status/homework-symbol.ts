import type { HomeworkDaySymbol } from "@/lib/learning-status/types";

export function homeworkSymbolChar(symbol: HomeworkDaySymbol): string {
  switch (symbol) {
    case "complete":
      return "○";
    case "partial":
      return "△";
    case "missing":
      return "X";
    case "scheduled":
    case "none":
    default:
      return "";
  }
}

export function homeworkSymbolTitle(
  symbol: HomeworkDaySymbol,
  completedCount: number,
  totalCount: number,
  examBestScore?: number | null,
  examAttemptCount?: number
): string {
  const examPart =
    examBestScore != null
      ? ` · OMR ${examBestScore}점${examAttemptCount && examAttemptCount > 1 ? ` (${examAttemptCount}회)` : ""}`
      : "";

  switch (symbol) {
    case "complete":
      return `완료 (${completedCount}/${totalCount})${examPart}`;
    case "partial":
      return `일부 완료 (${completedCount}/${totalCount})${examPart}`;
    case "missing":
      return examPart ? `미완료${examPart}` : "미완료";
    case "scheduled":
      return "예정";
    case "none":
      return examBestScore != null ? `OMR 시험 ${examBestScore}점` : "과제 없음";
    default:
      return examPart || "과제 없음";
  }
}
