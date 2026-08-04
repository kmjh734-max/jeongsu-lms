/** 3단계 영문 빈칸 정답 정규화·비교 (AI 의미 판단 없음) */

export type EnglishBlankCompareOptions = {
  caseSensitive?: boolean;
  ignoreExtraSpaces?: boolean;
  ignorePunctuation?: boolean;
};

/** 스마트 따옴표·아포스트로피 → ASCII */
export function normalizeEnglishQuotes(raw: string): string {
  return (raw ?? "")
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"');
}

export function normalizeEnglishBlankAnswer(
  raw: string,
  opts?: EnglishBlankCompareOptions
): string {
  let s = normalizeEnglishQuotes(raw ?? "")
    .normalize("NFC")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (opts?.ignorePunctuation) {
    s = s
      .replace(/[.,!?;:"'…·\-—–]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (opts?.ignoreExtraSpaces) {
    // already collapsed; if true and comparing, also allow full strip option via flag
    // keep single spaces unless comparing with flexible - ignoreExtraSpaces means collapse only (default)
  }
  if (!opts?.caseSensitive) {
    s = s.toLowerCase();
  }
  return s;
}

/** ignoreExtraSpaces: 비교 시 공백 완전 제거 버전 */
export function normalizeEnglishBlankAnswerForCompare(
  raw: string,
  opts?: EnglishBlankCompareOptions
): string {
  let s = normalizeEnglishBlankAnswer(raw, opts);
  if (opts?.ignoreExtraSpaces) {
    s = s.replace(/\s+/g, " ").trim();
  }
  return s;
}

export function isEnglishBlankPunctuationOnly(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return /^[\s.,!?;:'"“”‘’…·\-—–()[\]{}]+$/.test(t);
}

export function compareEnglishBlankAnswer(
  studentInput: string,
  answerText: string,
  acceptedAnswers: string[] = [],
  opts?: EnglishBlankCompareOptions
): boolean {
  const student = normalizeEnglishBlankAnswerForCompare(studentInput, opts);
  if (!student) return false;
  const accepts = [answerText, ...acceptedAnswers]
    .map((a) => normalizeEnglishBlankAnswerForCompare(a, opts))
    .filter(Boolean);
  return accepts.includes(student);
}

/** 단어 중간 절단 여부 경고용 */
export function isPartialWordCut(
  englishText: string,
  start: number,
  end: number
): boolean {
  if (start < 0 || end > englishText.length || start >= end) return false;
  const wordChar = /[A-Za-z0-9]/;
  const before = start > 0 ? englishText[start - 1]! : "";
  const after = end < englishText.length ? englishText[end]! : "";
  const first = englishText[start]!;
  const last = englishText[end - 1]!;
  const cutLeft = wordChar.test(before) && wordChar.test(first);
  const cutRight = wordChar.test(after) && wordChar.test(last);
  return cutLeft || cutRight;
}
