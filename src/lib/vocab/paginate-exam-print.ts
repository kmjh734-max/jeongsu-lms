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

const MM_TO_PX = 96 / 25.4;

/** 헤더·푸터·여백 제외 본문 영역 높이 (px) */
function examContentHeightPx(size: "a4" | "b5"): number {
  const pageMm = size === "a4" ? 297 : 250;
  const chromeMm =
    size === "a4"
      ? { padTop: 16, padBottom: 10, header: 24, footer: 9 }
      : { padTop: 14, padBottom: 8, header: 21, footer: 8 };
  const contentMm =
    pageMm - chromeMm.padTop - chromeMm.padBottom - chromeMm.header - chromeMm.footer;
  return contentMm * MM_TO_PX;
}

function examContentWidthPx(size: "a4" | "b5"): number {
  const pageWidthMm = size === "a4" ? 210 : 176;
  const padXmm = size === "a4" ? 32 : 24;
  return (pageWidthMm - padXmm) * MM_TO_PX;
}

function examColWidthPx(size: "a4" | "b5", cols: ExamColumnCount): number {
  const colGapMm = cols >= 2 ? 3.7 : 0;
  const colMm =
    (examContentWidthPx(size) / MM_TO_PX - (cols - 1) * colGapMm) / cols;
  return colMm * MM_TO_PX;
}

function estimateLines(
  text: string,
  widthPx: number,
  fontSizePx: number,
  bold = false
): number {
  const avgChar = fontSizePx * (bold ? 0.58 : 0.52);
  const charsPerLine = Math.max(6, Math.floor(widthPx / avgChar));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function estimateQuestionHeightPx(
  q: PrintExamQuestion,
  size: "a4" | "b5",
  cols: ExamColumnCount,
  spacing: ExamLineSpacing,
  fullWidth = false
): number {
  const isB5 = size === "b5";
  const promptSize = (isB5 ? 12 : 14) + 2;
  const lineH = isB5 ? 17 : 19;
  const widthPx = fullWidth ? examContentWidthPx(size) : examColWidthPx(size, cols);

  const promptLines = estimateLines(q.prompt, widthPx - 24, promptSize, true);
  let h = promptLines * lineH + 10;

  if (q.choices?.length) {
    const choiceCols = fullWidth || cols === 1 ? 2 : 1;
    const choiceRows = Math.ceil(q.choices.length / choiceCols);
    h += 8 + choiceRows * (isB5 ? 16 : 18);
  } else {
    h += 8 + (isB5 ? 24 : 28);
  }

  h += 6;
  return h + EXAM_ROW_GAP_PX[spacing];
}

function isExampleQuestion(q: PrintExamQuestion): boolean {
  return q.kind.startsWith("example_");
}

function paginateByHeight(
  questions: PrintExamQuestion[],
  size: "a4" | "b5",
  cols: ExamColumnCount,
  spacing: ExamLineSpacing,
  fullWidth = false
): PrintExamQuestion[][] {
  if (questions.length === 0) return [];

  const maxH = examContentHeightPx(size);
  const columnCount = fullWidth ? 1 : cols;
  const pages: PrintExamQuestion[][] = [];
  let page: PrintExamQuestion[] = [];
  let usedH = 0;

  for (let i = 0; i < questions.length; i += columnCount) {
    const row = questions.slice(i, i + columnCount);
    const rowH = Math.max(
      ...row.map((q) => estimateQuestionHeightPx(q, size, cols, spacing, fullWidth))
    );

    if (page.length > 0 && usedH + rowH > maxH) {
      pages.push(page);
      page = [];
      usedH = 0;
    }

    page.push(...row);
    usedH += rowH;
  }

  if (page.length > 0) pages.push(page);
  return pages;
}

export function paginateExamPrintPages(
  questions: PrintExamQuestion[],
  size: "a4" | "b5",
  columns: ExamColumnCount,
  lineSpacing: ExamLineSpacing = "normal"
): ExamPrintPageSlice[] {
  const basic = questions.filter((q) => !isExampleQuestion(q));
  const examples = questions.filter(isExampleQuestion);

  const basicPages = paginateByHeight(basic, size, columns, lineSpacing, false);
  const examplePages = paginateByHeight(
    examples,
    size,
    columns,
    lineSpacing,
    true
  );

  const pages: ExamPrintPageSlice[] = basicPages.map((chunk) => ({
    basic: chunk,
    examples: [],
  }));

  for (const chunk of examplePages) {
    pages.push({ basic: [], examples: chunk });
  }

  if (pages.length === 0) {
    pages.push({ basic: [], examples: [] });
  }

  return pages;
}
