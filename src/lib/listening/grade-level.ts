/** 듣기 세트·출제 대상 학년 */
export type ListeningGradeLevel = "middle1" | "middle2";

export const LISTENING_GRADE_OPTIONS: Array<{
  value: ListeningGradeLevel;
  label: string;
  description: string;
}> = [
  {
    value: "middle1",
    label: "중학교 1학년",
    description: "전국 중1 영어듣기능력평가 20유형",
  },
  {
    value: "middle2",
    label: "중학교 2학년",
    description: "전국 중2 영어듣기능력평가 20유형 (기출보다 약간 어려운 문장)",
  },
];

export function parseListeningGradeLevel(raw: unknown): ListeningGradeLevel {
  return raw === "middle2" ? "middle2" : "middle1";
}

export function gradeLevelLabel(grade: ListeningGradeLevel): string {
  return grade === "middle2" ? "중학교 2학년" : "중학교 1학년";
}

export function gradeLevelShort(grade: ListeningGradeLevel): string {
  return grade === "middle2" ? "중2" : "중1";
}
