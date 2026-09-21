import type { StudentReport } from "@/lib/reports/types";

/**
 * 리포트가 무엇을 담는지 한 곳에서 정한다.
 *
 * 인쇄용 A4와 학부모 휴대폰 화면은 모양이 다르지만 담는 내용은 같아야 한다.
 * 전에는 두 화면이 각자 필드를 골라 그려서, 한쪽에 무엇을 더하면 다른 쪽이 어긋났다
 * (단어장 4단계 점수가 A4에만 있었고, 복습 단어가 A4는 10개·휴대폰은 15개였다).
 * 그래서 개수와 줄 내용은 여기서만 정하고 양쪽이 가져다 쓴다.
 */

/** 복습 필요 단어를 몇 개까지 보여 줄지 */
export const REVIEW_WORD_LIMIT = 15;

/** 단어장 한 줄에 함께 보여 줄 4단계 점수 — 없으면 빈 문자열 */
export function vocabScoreLine(set: StudentReport["vocabSets"][number]): string {
  const parts: string[] = [];
  if (set.stage4AttemptCount > 0) parts.push(`4단계 ${set.stage4LastScore}점`);
  if (set.stage4BestScore > 0) parts.push(`최고 ${set.stage4BestScore}점`);
  return parts.join(" · ");
}

/** 복습 필요 단어에서 보여 줄 만큼과 남은 수 */
export function reviewWordSlice(report: StudentReport): {
  rows: StudentReport["reviewWords"];
  extra: number;
} {
  const rows = report.reviewWords.slice(0, REVIEW_WORD_LIMIT);
  return { rows, extra: report.reviewWords.length - rows.length };
}
