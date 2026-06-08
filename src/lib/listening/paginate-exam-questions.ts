export interface ExamPageLayout {
  items: number[];
}

/** A4 1단: 위에서 아래로 채우고 넘치면 다음 페이지 */
export function paginateExamQuestions(
  questionHeights: number[],
  opts: {
    firstPageMaxPx: number;
    nextPageMaxPx: number;
    questionGapPx: number;
  }
): ExamPageLayout[] {
  if (questionHeights.length === 0) return [];

  const pages: ExamPageLayout[] = [];
  let idx = 0;
  let pageIndex = 0;

  while (idx < questionHeights.length) {
    const maxH =
      pageIndex === 0 ? opts.firstPageMaxPx : opts.nextPageMaxPx;
    const items: number[] = [];
    let used = 0;

    while (idx < questionHeights.length) {
      const need = questionHeights[idx] + opts.questionGapPx;
      if (items.length > 0 && used + need > maxH) break;
      items.push(idx);
      used += need;
      idx++;
      if (used > maxH && items.length === 1) break;
    }

    pages.push({ items });
    pageIndex++;
  }

  return pages;
}
