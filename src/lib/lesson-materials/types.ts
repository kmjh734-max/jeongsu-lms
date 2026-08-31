export interface LineInterpretationRow {
  no: number;
  english: string;
  korean: string;
}

export interface LineInterpretationResult {
  passageTitle: string;
  subtitle?: string;
  lines: LineInterpretationRow[];
}

export type LessonMaterialFontFamily =
  | "noto"
  | "malgun"
  | "nanum"
  | "times"
  | "georgia";

export type LessonMaterialFontSize = "sm" | "md" | "lg" | "xl";

export type LessonMaterialBackground =
  | "white"
  | "cream"
  | "sky"
  | "mint"
  | "gray";

export interface LineInterpretationDisplaySettings {
  fontFamily: LessonMaterialFontFamily;
  englishFontSize: LessonMaterialFontSize;
  koreanFontSize: LessonMaterialFontSize;
  background: LessonMaterialBackground;
  showKorean: boolean;
  showLineNumbers: boolean;
  /** 사용자 지정 헤더 (비우면 passageTitle 사용) */
  headerTitle: string;
  /** 부제 (예: 영어독해와 작문 미래엔 1과) */
  headerSubtitle: string;
}
