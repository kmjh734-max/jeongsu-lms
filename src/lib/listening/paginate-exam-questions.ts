export interface ExamPageLayout {
  left: number[];
  right: number[];
}

/** 20문항 표준 시험: 2페이지 · 좌열 5 + 우열 5 */
export function paginateStandardTwentyExam(): ExamPageLayout[] {
  return [
    { left: [0, 1, 2, 3, 4], right: [5, 6, 7, 8, 9] },
    { left: [10, 11, 12, 13, 14], right: [15, 16, 17, 18, 19] },
  ];
}

export function isStandardTwentyQuestionExam(count: number): boolean {
  return count === 20;
}

/** A4 2단: 좌열 → 우열 순으로 채우고, 넘치면 다음 페이지 (문항 높이만큼만 간격) */
export function paginateExamQuestions(
  questionHeights: number[],
  opts: {
    firstColumnMaxPx: number;
    nextColumnMaxPx: number;
    questionGapPx: number;
  }
): ExamPageLayout[] {
  if (questionHeights.length === 0) return [];

  const pages: ExamPageLayout[] = [];
  let idx = 0;
  let pageIndex = 0;

  while (idx < questionHeights.length) {
    const maxH =
      pageIndex === 0 ? opts.firstColumnMaxPx : opts.nextColumnMaxPx;
    const page: ExamPageLayout = { left: [], right: [] };
    let leftUsed = 0;
    let rightUsed = 0;

    while (idx < questionHeights.length) {
      const gap = page.left.length > 0 ? opts.questionGapPx : 0;
      const need = questionHeights[idx]! + gap;
      if (page.left.length > 0 && leftUsed + need > maxH) break;
      if (page.left.length === 0 && need > maxH) {
        page.left.push(idx);
        leftUsed += need;
        idx++;
        break;
      }
      if (leftUsed + need > maxH) break;
      page.left.push(idx);
      leftUsed += need;
      idx++;
    }

    while (idx < questionHeights.length) {
      const gap = page.right.length > 0 ? opts.questionGapPx : 0;
      const need = questionHeights[idx]! + gap;
      if (page.right.length > 0 && rightUsed + need > maxH) break;
      if (page.right.length === 0 && need > maxH) {
        page.right.push(idx);
        rightUsed += need;
        idx++;
        break;
      }
      if (rightUsed + need > maxH) break;
      page.right.push(idx);
      rightUsed += need;
      idx++;
    }

    if (page.left.length === 0 && page.right.length === 0) {
      page.left.push(idx);
      idx++;
    }

    pages.push(page);
    pageIndex++;
  }

  return pages;
}
