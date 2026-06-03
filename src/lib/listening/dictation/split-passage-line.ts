const BLANK_PATTERN = /_{3,}/g;

/** "I am ________ about ________" → 텍스트 조각 (빈칸 n개면 조각 n+1) */
export function splitPassageLineByBlanks(text: string): string[] {
  const parts = text.split(BLANK_PATTERN);
  return parts.length > 0 ? parts : [text];
}
