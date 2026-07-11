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

/** 요약문 서술형 questionText: <조건> / (선택)<보기> / <요약문> */
export function parseSummaryWritingBlocks(text: string): {
  conditions: string;
  words: string | null;
  summary: string;
  blankLabels: string[];
} | null {
  const cleaned = cleanQuestionText(text).trim();
  if (!/<조건>/.test(cleaned) || !/<요약문>/.test(cleaned)) {
    return null;
  }
  const hasBogi = /<보기>/.test(cleaned);
  const conditions =
    cleaned
      .match(
        hasBogi
          ? /<조건>\s*([\s\S]*?)(?=<보기>|$)/
          : /<조건>\s*([\s\S]*?)(?=<요약문>|$)/
      )?.[1]
      ?.trim() ?? "";
  const words = hasBogi
    ? cleaned.match(/<보기>\s*([\s\S]*?)(?=<요약문>|$)/)?.[1]?.trim() ?? ""
    : null;
  const summary =
    cleaned.match(/<요약문>\s*([\s\S]*?)$/)?.[1]?.trim() ?? "";
  if (!summary) return null;
  const blankLabels = Array.from(
    new Set(summary.match(/[ⓐⓑⓒⓓⓔ]/g) ?? [])
  ).sort();
  return { conditions, words, summary, blankLabels };
}

/** 본문에 연속 N단어로 존재하는지 (대소문자·구두점 무시) */
export function passageHasConsecutiveWords(
  passage: string,
  phrase: string,
  expectedWordCount?: number
): boolean {
  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s']/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  const p = norm(passage);
  const ph = norm(phrase);
  if (!p || !ph) return false;
  const words = ph.split(" ").filter(Boolean);
  if (expectedWordCount != null && words.length !== expectedWordCount) {
    return false;
  }
  return ` ${p} `.includes(` ${ph} `);
}

/** 지칭 서술형 답란 마커 */
export function parseReferenceAnswerBlock(text: string): {
  labels: string[];
} | null {
  const cleaned = cleanQuestionText(text).trim();
  if (!/<지칭답란>/.test(cleaned)) return null;
  const body =
    cleaned.match(/<지칭답란>\s*([\s\S]*?)$/)?.[1]?.trim() ?? "";
  const labels = (body.match(/[ⓐⓑⓒⓓⓔ]/g) ?? []).filter(Boolean);
  return { labels: labels.length ? labels : ["ⓐ"] };
}

/** 어법 오류 수정 서술형: <조건> + <답안행> */
export function parseGrammarCorrectionBlocks(text: string): {
  conditions: string;
  rowCount: number;
} | null {
  const cleaned = cleanQuestionText(text).trim();
  if (!/<조건>/.test(cleaned) || !/<답안행>/.test(cleaned)) return null;
  if (/<보기>|<해석>|<요약문>/.test(cleaned)) return null;
  const conditions =
    cleaned.match(/<조건>\s*([\s\S]*?)(?=<답안행>|$)/)?.[1]?.trim() ?? "";
  const rowRaw =
    cleaned.match(/<답안행>\s*(\d+)/)?.[1] ??
    cleaned.match(/<답안행>\s*([\s\S]*?)$/)?.[1]?.trim() ??
    "";
  const rowCount = Math.max(1, Math.min(5, parseInt(String(rowRaw), 10) || 2));
  return { conditions, rowCount };
}

/** 단어 수 (영어 공백 기준) */
export function countEnglishWords(text: string): number {
  return (text || "")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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
