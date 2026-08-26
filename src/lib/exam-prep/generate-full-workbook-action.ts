"use server";

import { generateFullExamPrepWorkbook } from "@/lib/exam-prep/generate-full-workbook-core";

/**
 * 지문 편집 화면 등 클라이언트 → Server Action 경로.
 * API(`/api/exam-prep/generate-workbook`)는 core를 직접 호출한다.
 */
export async function generateFullExamPrepWorkbookAction(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
}) {
  return generateFullExamPrepWorkbook(input);
}
