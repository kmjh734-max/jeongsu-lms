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

  for (let bi = 0; bi < basic.length; bi += basicPerPage) {
    pages.push({
      basic: basic.slice(bi, bi + basicPerPage),
      examples: [],
    });
  }

  for (let ei = 0; ei < examples.length; ei += examplePerPage) {
    pages.push({
      basic: [],
      examples: examples.slice(ei, ei + examplePerPage),
    });
  }

  if (pages.length === 0) {
    pages.push({ basic: [], examples: [] });
  }

  return pages;
}
