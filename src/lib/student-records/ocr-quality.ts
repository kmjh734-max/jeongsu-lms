const PLACEHOLDER_PATTERNS = [
  /^\[PDF:.*\] 스캔 PDF/m,
  /\[OCR 실패\]/,
  /\[이 구간 판독 실패\]/,
];

export function stripOcrPlaceholders(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^\[PDF:.*\] 스캔 PDF/.test(line.trim()))
    .join("\n")
    .replace(/=== PDF OCR:.*?===\s*\[OCR 실패\]\s*/g, "")
    .trim();
}

export function hasSubstantiveStudentRecordText(text: string): boolean {
  let cleaned = stripOcrPlaceholders(text);
  for (const pattern of PLACEHOLDER_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  const compact = cleaned.replace(/\s+/g, "");
  return compact.length >= 400;
}
