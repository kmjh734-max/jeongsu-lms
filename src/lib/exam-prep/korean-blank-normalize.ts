/** 2단계 우리말 빈칸 정답 정규화·비교 (AI 의미 판단 없음) */

export type KoreanBlankCompareOptions = {
  /** 문장 부호 무시 (기본 false — 빈칸별 설정) */
  ignorePunctuation?: boolean;
  /** 띄어쓰기 유연 비교 (공백 제거 후 비교) */
  flexibleSpacing?: boolean;
};

/** 비교 전 공통 정규화 */
export function normalizeKoreanBlankAnswer(
  raw: string,
  opts?: KoreanBlankCompareOptions
): string {
  let s = (raw ?? "")
    .normalize("NFC")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (opts?.ignorePunctuation) {
    s = s.replace(/[.,!?;:'"“”‘’…·\-—–]/g, "").replace(/\s+/g, " ").trim();
  }
  if (opts?.flexibleSpacing) {
    s = s.replace(/\s+/g, "");
  }
  return s;
}

export function isBlankPunctuationOnly(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return /^[\s.,!?;:'"“”‘’…·\-—–()[\]{}]+$/.test(t);
}

export function compareKoreanBlankAnswer(
  studentInput: string,
  answerText: string,
  acceptedAnswers: string[] = [],
  opts?: KoreanBlankCompareOptions
): boolean {
  const student = normalizeKoreanBlankAnswer(studentInput, opts);
  if (!student) return false;
  const accepts = [answerText, ...acceptedAnswers]
    .map((a) => normalizeKoreanBlankAnswer(a, opts))
    .filter(Boolean);
  return accepts.includes(student);
}

export type InputSizeHint = "sm" | "md" | "lg";

/** 정답 글자 수를 직접 노출하지 않는 대략적 입력창 크기 */
export function blankInputSizeHint(answerLength: number): InputSizeHint {
  if (answerLength <= 2) return "sm";
  if (answerLength <= 5) return "md";
  return "lg";
}

export const BLANK_INPUT_CH: Record<InputSizeHint, number> = {
  sm: 4,
  md: 7,
  lg: 11,
};
