import { ACADEMY_NAME } from "@/lib/branding";

export function buildStudentRecordKakaoMessage(params: {
  studentName: string;
}): string {
  const date = new Date().toLocaleDateString("ko-KR");
  return `[${ACADEMY_NAME}] ${params.studentName} 학생 학교생활기록부 분석 보고서

${date} 기준 입학사정관 관점 학생부 종합 분석 보고서입니다.

첨부 PDF 또는 화면 캡처를 확인해 주세요.
자세한 상담이 필요하시면 학원으로 연락 부탁드립니다.`;
}
