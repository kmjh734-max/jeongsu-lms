import type {
  LessonMaterialBackground,
  LessonMaterialFontFamily,
  LessonMaterialFontSize,
  LineInterpretationDisplaySettings,
} from "@/lib/lesson-materials/types";

export const FONT_FAMILY_LABELS: Record<LessonMaterialFontFamily, string> = {
  noto: "Noto Sans / 고딕",
  malgun: "맑은 고딕",
  nanum: "나눔고딕",
  times: "Times New Roman",
  georgia: "Georgia",
};

export const FONT_SIZE_LABELS: Record<LessonMaterialFontSize, string> = {
  sm: "작게",
  md: "보통",
  lg: "크게",
  xl: "아주 크게",
};

export const BACKGROUND_LABELS: Record<LessonMaterialBackground, string> = {
  white: "흰색",
  cream: "크림",
  sky: "하늘색",
  mint: "민트",
  gray: "연회색",
};

export const BACKGROUND_COLORS: Record<LessonMaterialBackground, string> = {
  white: "#ffffff",
  cream: "#fffbf0",
  sky: "#f0f9ff",
  mint: "#f0fdf4",
  gray: "#f8fafc",
};

export const FONT_FAMILY_STACK: Record<LessonMaterialFontFamily, string> = {
  noto: '"Noto Sans KR", "Noto Sans", sans-serif',
  malgun: '"Malgun Gothic", "맑은 고딕", sans-serif',
  nanum: '"Nanum Gothic", "나눔고딕", sans-serif',
  times: '"Times New Roman", Times, serif',
  georgia: 'Georgia, "Times New Roman", serif',
};

export const ENGLISH_FONT_SIZE_PX: Record<LessonMaterialFontSize, number> = {
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
};

export const KOREAN_FONT_SIZE_PX: Record<LessonMaterialFontSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
};

export function defaultDisplaySettings(): LineInterpretationDisplaySettings {
  return {
    fontFamily: "malgun",
    englishFontSize: "md",
    koreanFontSize: "md",
    background: "white",
    showKorean: true,
    showLineNumbers: true,
    headerTitle: "",
    headerSubtitle: "",
  };
}

export function parseFontFamily(raw: unknown): LessonMaterialFontFamily {
  if (
    raw === "noto" ||
    raw === "malgun" ||
    raw === "nanum" ||
    raw === "times" ||
    raw === "georgia"
  ) {
    return raw;
  }
  return "malgun";
}

export function parseFontSize(raw: unknown): LessonMaterialFontSize {
  if (raw === "sm" || raw === "md" || raw === "lg" || raw === "xl") return raw;
  return "md";
}

export function parseBackground(raw: unknown): LessonMaterialBackground {
  if (
    raw === "white" ||
    raw === "cream" ||
    raw === "sky" ||
    raw === "mint" ||
    raw === "gray"
  ) {
    return raw;
  }
  return "white";
}
