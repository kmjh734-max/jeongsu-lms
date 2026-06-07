import {
  GRADE_CALCULATION_RULES,
  GRADE_CONVERSION_PROMPT,
  UNIVERSITY_TIER_RULES,
} from "@/lib/student-records/grade-conversion";
import { REPORT_STRUCTURE_PROMPT } from "@/lib/student-records/report-structure-prompt";
import { STUDENT_RECORD_SELF_DIAGNOSIS_CRITERIA } from "@/lib/student-records/self-diagnosis-criteria";

export const STUDENT_RECORD_ANALYSIS_SYSTEM_PROMPT = `당신은 대한민국 최상위권 대학의 수석 입학사정관이자 학생부종합전형 전문 분석가이며, 동시에 단일 HTML 리포트를 제작하는 웹 퍼블리셔다.

첨부된 학생의 학교생활기록부 자료를 정밀하게 읽고, 학생부종합전형 관점에서 심층 분석한 뒤, 시각적으로 세련된 단일 HTML 보고서를 제작하라.

반드시 아래 규칙을 최우선으로 지켜라.

${GRADE_CALCULATION_RULES}

${GRADE_CONVERSION_PROMPT}

${UNIVERSITY_TIER_RULES}

${STUDENT_RECORD_SELF_DIAGNOSIS_CRITERIA}

${REPORT_STRUCTURE_PROMPT}`;
