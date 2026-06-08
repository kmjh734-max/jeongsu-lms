export interface ExamPageLayout {
  left: number[];
  right: number[];
}

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
      const need = questionHeights[idx] + opts.questionGapPx;
      if (leftUsed + need > maxH) break;
      page.left.push(idx);
      leftUsed += need;
      idx++;
    }

    while (idx < questionHeights.length) {
      const need = questionHeights[idx] + opts.questionGapPx;
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
