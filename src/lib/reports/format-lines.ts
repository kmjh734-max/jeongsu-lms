import type { ReviewWordRow, VocabReportSection } from "@/lib/reports/types";

/** 학부모 문구용 단어장 한 줄 설명 */
export function formatVocabSetParentLine(set: VocabReportSection): string {
  const title = set.setTitle;

  if (set.stage4Passed) {
    return `- ${title}은(는) 4단계 종합테스트에서 ${set.stage4BestScore}점으로 합격했습니다.`;
  }
  if (set.stage4AttemptCount > 0) {
    return `- ${title}은(는) 종합테스트에서 ${set.stage4LastScore}점을 기록하여 재도전이 필요합니다.`;
  }
  if (set.stage3Completed) {
    return `- ${title}은(는) 3단계까지 완료했으며 4단계 종합테스트를 준비 중입니다.`;
  }
  if (set.stage2Completed) {
    return `- ${title}은(는) 현재 3단계 예문 빈칸 학습을 진행 중입니다.`;
  }
  if (set.stage1Completed) {
    return `- ${title}은(는) 현재 2단계 스펠링 학습을 진행 중입니다.`;
  }
  if (!set.stage1Completed && set.itemCount > 0) {
    return `- ${title}은(는) 1단계 뜻 익히기부터 진행 중입니다.`;
  }
  return `- ${title}: ${set.statusLabel}`;
}

/** 학부모 문구용 복습 단어 한 줄 */
export function formatReviewWordParentLine(word: ReviewWordRow): string {
  const stageText = word.stages
    .map((s) => {
      if (s.includes("1단계")) return "1단계";
      if (s.includes("2단계")) return "2단계 스펠링";
      if (s.includes("3단계")) return "3단계 예문 빈칸";
      if (s.includes("4단계")) return "4단계 종합테스트";
      return s;
    })
  const unique = [...new Set(stageText)];
  const reason =
    unique.length === 1
      ? `${unique[0]}에서 오답`
      : `${unique.join(", ")}에서 오답`;
  return `- ${word.word} / ${word.meaning}: ${reason}`;
}
