/** 듣기 세트·출제 대상 학년 */
export type ListeningGradeLevel = "middle1" | "middle2" | "middle3";

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
    description: "전국 중2 영어듣기능력평가 20유형",
  },
  {
    value: "middle3",
    label: "중학교 3학년",
    description: "전국 중3 영어듣기능력평가 20유형",
  },
];

const GRADE_LABELS: Record<ListeningGradeLevel, string> = {
  middle1: "중학교 1학년",
  middle2: "중학교 2학년",
  middle3: "중학교 3학년",
};

const GRADE_SHORT: Record<ListeningGradeLevel, string> = {
  middle1: "중1",
  middle2: "중2",
  middle3: "중3",
};

export function parseListeningGradeLevel(raw: unknown): ListeningGradeLevel {
  if (raw === "middle2") return "middle2";
  if (raw === "middle3") return "middle3";
  return "middle1";
}

export function gradeLevelLabel(grade: ListeningGradeLevel): string {
  return GRADE_LABELS[grade];
}

export function gradeLevelShort(grade: ListeningGradeLevel): string {
  return GRADE_SHORT[grade];
}

/** 중1이 아닌 학년 — 난이도·대본 길이 검증 적용 */
export function usesStrictScriptRules(grade: ListeningGradeLevel): boolean {
  return grade !== "middle1";
}
