import type { PrintExamQuestion } from "@/lib/vocab/generate-print-test-questions";
import {
  examRowsPerColumn,
  type ExamColumnCount,
} from "@/lib/vocab/vocab-print-exam-config";

export interface ExamPrintPageSlice {
  basic: PrintExamQuestion[];
  examples: PrintExamQuestion[];
}

function isExampleQuestion(q: PrintExamQuestion): boolean {
  return q.kind.startsWith("example_");
}

export function paginateExamPrintPages(
  questions: PrintExamQuestion[],
  size: "a4" | "b5",
  columns: ExamColumnCount
): ExamPrintPageSlice[] {
  const basic = questions.filter((q) => !isExampleQuestion(q));
  const examples = questions.filter(isExampleQuestion);

  const basicPerPage = examRowsPerColumn(size) * columns;
  const examplePerPage = examRowsPerColumn(size);

  const pages: ExamPrintPageSlice[] = [];
  let bi = 0;
  let ei = 0;

  while (bi < basic.length) {
    const chunk = basic.slice(bi, bi + basicPerPage);
    bi += chunk.length;

    const page: ExamPrintPageSlice = { basic: chunk, examples: [] };

    if (bi >= basic.length && chunk.length < basicPerPage && ei < examples.length) {
      const exChunk = examples.slice(ei, ei + examplePerPage);
      ei += exChunk.length;
      page.examples = exChunk;
    }

    pages.push(page);
  }

  while (ei < examples.length) {
    pages.push({
      basic: [],
      examples: examples.slice(ei, ei + examplePerPage),
    });
    ei += examplePerPage;
  }

  if (pages.length === 0) {
    pages.push({ basic: [], examples: [] });
  }

  return pages;
}
