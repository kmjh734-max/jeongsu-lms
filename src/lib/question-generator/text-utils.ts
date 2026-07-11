/** 메타 태그·군더더기 발문 제거 */
export function cleanQuestionText(text: string): string {
  return (text || "")
    .replace(/\[[^\]]*변형[^\]]*\]/g, "")
    .replace(/\[[0-9]{6}H[0-9][^\]]*\]/g, "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (/^\[[^\]]+\]$/.test(l)) return false;
      if (/다음 글을 읽고\s*물음에\s*답하시오\.?/.test(l)) return false;
      return true;
    })
    .join("\n")
    .trim();
}

/** 지문 비교용 정규화 */
export function normalizePassage(text: string): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

/** 제시어 배열 questionText의 <조건>/<보기>/<해석> 블록 파싱 */
export function parseWordOrderBlocks(text: string): {
  conditions: string;
  words: string;
  translation: string;
} | null {
  const cleaned = cleanQuestionText(text).trim();
  if (
    !/<조건>/.test(cleaned) ||
    !/<보기>/.test(cleaned) ||
    !/<해석>/.test(cleaned)
  ) {
    return null;
  }
  const conditions =
    cleaned.match(/<조건>\s*([\s\S]*?)(?=<보기>|$)/)?.[1]?.trim() ?? "";
  const words =
    cleaned.match(/<보기>\s*([\s\S]*?)(?=<해석>|$)/)?.[1]?.trim() ?? "";
  const translation =
    cleaned.match(/<해석>\s*([\s\S]*?)$/)?.[1]?.trim() ?? "";
  if (!conditions && !words && !translation) return null;
  return { conditions, words, translation };
}

/**
 * 복사·붙여넣기 시 생긴 어색한 줄바꿈을 풀어 A4 폭에 맞게 자연스럽게 흐르게 함.
 * 빈 줄(문단)만 유지하고, 한 줄 개행은 공백으로 합침.
 */
export function reflowPassageForPrint(text: string): string[] {
  const raw = (text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return [];
  return raw
    .split(/\n\s*\n+/)
    .map((para) =>
      para
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}
