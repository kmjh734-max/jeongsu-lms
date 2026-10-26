import type { PrintExamQuestion } from "@/lib/vocab/generate-print-test-questions";
import {
  EXAM_ROW_GAP_PX,
  type ExamColumnCount,
  type ExamLineSpacing,
} from "@/lib/vocab/vocab-print-exam-config";

export interface ExamPrintPageSlice {
  basic: PrintExamQuestion[];
  examples: PrintExamQuestion[];
}

const BASIC_EXAMPLE_GAP_PX = 8;

function isExampleQuestion(q: PrintExamQuestion): boolean {
  return q.kind.startsWith("example_");
}

function paginateExamFlow(
  basic: PrintExamQuestion[],
  examples: PrintExamQuestion[],
  basicHeights: number[],
  exampleHeights: number[],
  maxH: number,
  cols: ExamColumnCount,
  rowGapPx: number
): ExamPrintPageSlice[] {
  const pages: ExamPrintPageSlice[] = [];
  let page: ExamPrintPageSlice = { basic: [], examples: [] };
  let usedH = 0;

  const hasContent = () => page.basic.length > 0 || page.examples.length > 0;

  const flush = () => {
    if (!hasContent()) return;
    pages.push(page);
    page = { basic: [], examples: [] };
    usedH = 0;
  };

  const leadingGapForExample = () => {
    if (!hasContent()) return 0;
    if (page.basic.length > 0 && page.examples.length === 0) {
      return BASIC_EXAMPLE_GAP_PX;
    }
    return rowGapPx;
  };

  const place = (leadingGap: number, contentH: number, add: () => void) => {
    if (hasContent() && usedH + leadingGap + contentH > maxH) flush();
    const gap = hasContent() ? leadingGap : 0;
    add();
    usedH += gap + contentH;
  };

  /*
   * 번호는 쪽마다 세로로 흐른다(왼쪽 단 위→아래, 다음 단) — 정답지와 같은 순서(선생님 2026-10-26).
   * 그래서 한 줄에 놓이는 문항이 쪽에 든 문항 수에 따라 바뀐다. 문항을 하나씩 더해 보며 쪽 높이를 다시 잰다.
   */
  const columnFlowHeight = (hs: number[]) => {
    const rows = Math.ceil(hs.length / cols);
    let h = 0;
    for (let r = 0; r < rows; r++) {
      let rowH = 0;
      for (let c = 0; c < cols; c++) rowH = Math.max(rowH, hs[c * rows + r] ?? 0);
      h += rowH;
    }
    return h + Math.max(0, rows - 1) * rowGapPx;
  };
  let pageBasicHeights: number[] = [];
  for (let i = 0; i < basic.length; i++) {
    const next = [...pageBasicHeights, basicHeights[i] ?? 0];
    if (page.basic.length > 0 && columnFlowHeight(next) > maxH) {
      flush();
      pageBasicHeights = [];
    }
    pageBasicHeights.push(basicHeights[i] ?? 0);
    page.basic.push(basic[i]!);
    usedH = columnFlowHeight(pageBasicHeights);
  }

  for (let i = 0; i < examples.length; i++) {
    const q = examples[i]!;
    const contentH = exampleHeights[i] ?? 0;
    place(leadingGapForExample(), contentH, () => {
      page.examples.push(q);
    });
  }

  flush();
  return pages;
}

export function paginateExamPrintFromHeights(
  basic: PrintExamQuestion[],
  examples: PrintExamQuestion[],
  basicHeights: number[],
  exampleHeights: number[],
  maxBodyHeightPx: number,
  columns: ExamColumnCount,
  rowGapPx: number
): ExamPrintPageSlice[] {
  const pages = paginateExamFlow(
    basic,
    examples,
    basicHeights,
    exampleHeights,
    maxBodyHeightPx,
    columns,
    rowGapPx
  );

  if (pages.length === 0) {
    pages.push({ basic: [], examples: [] });
  }

  return pages;
}

/** 추정치 기반 (측정 전 즉시 미리보기) */
export function paginateExamPrintPages(
  questions: PrintExamQuestion[],
  _size: "a4" | "b5",
  columns: ExamColumnCount,
  lineSpacing: ExamLineSpacing = "normal"
): ExamPrintPageSlice[] {
  const rowGapPx = EXAM_ROW_GAP_PX[lineSpacing];
  const fallbackBasic = 72;
  const fallbackExample = 96;
  const basic = questions.filter((q) => !isExampleQuestion(q));
  const examples = questions.filter(isExampleQuestion);

  return paginateExamPrintFromHeights(
    basic,
    examples,
    basic.map(() => fallbackBasic),
    examples.map(() => fallbackExample),
    99999,
    columns,
    rowGapPx
  );
}
