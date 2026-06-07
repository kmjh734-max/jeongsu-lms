import { STUDENT_RECORD_MAX_REPORT_INPUT_CHARS } from "@/lib/student-records/limits";

/** 보고서 생성 API 입력 토큰 절감 — 앞·뒤 구간만 유지 */
export function trimStudentRecordExtractForReport(text: string): string {
  const trimmed = text.trim();
  const max = STUDENT_RECORD_MAX_REPORT_INPUT_CHARS;
  if (trimmed.length <= max) return trimmed;

  const headLen = Math.floor(max * 0.82);
  const tailLen = max - headLen - 100;
  const omitted = trimmed.length - headLen - tailLen;

  return [
    trimmed.slice(0, headLen),
    `\n...[OCR 원문 중 ${omitted.toLocaleString("ko-KR")}자 생략 — 핵심 앞·뒤 구간만 분석]...\n`,
    trimmed.slice(-tailLen),
  ].join("");
}
