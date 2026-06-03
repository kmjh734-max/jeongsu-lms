/** Dictation 채점용 텍스트 정규화 */
export function normalizeDictationText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[.,!?;:]+$/g, "")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
