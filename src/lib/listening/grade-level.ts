/** 듣기 세트·출제 대상 학년 */
export type ListeningGradeLevel =
  | "middle1"
  | "middle2"
  | "middle3"
  | "high1"
  | "high2";

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
  {
    value: "high1",
    label: "고등학교 1학년",
    description: "고1 전국연합(수능형) 듣기 17유형",
  },
  {
    value: "high2",
    label: "고등학교 2학년",
    description: "고2 전국연합(수능형) 듣기 17유형",
  },
];

const GRADE_LABELS: Record<ListeningGradeLevel, string> = {
  middle1: "중학교 1학년",
  middle2: "중학교 2학년",
  middle3: "중학교 3학년",
  high1: "고등학교 1학년",
  high2: "고등학교 2학년",
};

const GRADE_SHORT: Record<ListeningGradeLevel, string> = {
  middle1: "중1",
  middle2: "중2",
  middle3: "중3",
  high1: "고1",
  high2: "고2",
};

export function parseListeningGradeLevel(raw: unknown): ListeningGradeLevel {
  if (raw === "middle2") return "middle2";
  if (raw === "middle3") return "middle3";
  if (raw === "high1") return "high1";
  if (raw === "high2") return "high2";
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

/** 고1·고2 수능형 듣기 (중등 20유형과 별개) */
export function isHighSchoolListeningGrade(
  grade: ListeningGradeLevel | undefined
): boolean {
  return grade === "high1" || grade === "high2";
}

/** 고등 전체 세트 문항 수 */
export function defaultQuestionCountForGrade(
  grade: ListeningGradeLevel
): number {
  return isHighSchoolListeningGrade(grade) ? 17 : 20;
}

export function questionCountOptionsForGrade(
  grade: ListeningGradeLevel
): number[] {
  return isHighSchoolListeningGrade(grade)
    ? [5, 10, 15, 17]
    : [5, 10, 15, 20];
}
