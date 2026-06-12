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
const BASIC_EXAMPLE_GAP_PX = 8;

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

function paginateExamFlow(
  basic: PrintExamQuestion[],
  examples: PrintExamQuestion[],
  size: "a4" | "b5",
  cols: ExamColumnCount,
  spacing: ExamLineSpacing
): ExamPrintPageSlice[] {
  const maxH = examContentHeightPx(size);
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

  const addRow = (rowH: number, add: () => void) => {
    if (hasContent() && usedH + rowH > maxH) flush();
    add();
    usedH += rowH;
  };

  for (let i = 0; i < basic.length; i += cols) {
    const row = basic.slice(i, i + cols);
    const rowH = Math.max(
      ...row.map((q) => estimateQuestionHeightPx(q, size, cols, spacing, false))
    );
    addRow(rowH, () => {
      page.basic.push(...row);
    });
  }

  for (let i = 0; i < examples.length; i++) {
    const q = examples[i];
    let rowH = estimateQuestionHeightPx(q, size, cols, spacing, true);
    if (page.basic.length > 0 && page.examples.length === 0) {
      rowH += BASIC_EXAMPLE_GAP_PX;
    }
    addRow(rowH, () => {
      page.examples.push(q);
    });
  }

  flush();
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

  const pages = paginateExamFlow(basic, examples, size, columns, lineSpacing);

  if (pages.length === 0) {
    pages.push({ basic: [], examples: [] });
  }

  return pages;
}
