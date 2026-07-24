/**
 * 영어 지문을 문장 단위로 분리.
 * 약어·소수점·따옴표로 잘못 끊기지 않도록 보호 처리 후 분리한다.
 */
const ABBREVIATIONS = [
  "Mr",
  "Mrs",
  "Ms",
  "Dr",
  "Prof",
  "Sr",
  "Jr",
  "St",
  "vs",
  "etc",
  "e.g",
  "i.e",
  "U.S",
  "U.K",
  "a.m",
  "p.m",
];

function protectAbbreviations(text: string): string {
  let out = text;
  for (const a of ABBREVIATIONS) {
    const re = new RegExp(`\\b${a.replace(/\./g, "\\.")}\\.`, "gi");
    out = out.replace(re, (m) => m.replace(/\./g, "∯"));
  }
  // 소수점: 숫자.숫자
  out = out.replace(/(\d)\.(\d)/g, "$1∯$2");
  // 말줄임표
  out = out.replace(/\.{3,}/g, (m) => m.replace(/\./g, "∯"));
  return out;
}

function restoreProtected(text: string): string {
  return text.replace(/∯/g, ".");
}

export function splitPassageIntoSentences(originalText: string): string[] {
  const raw = originalText.replace(/\r\n/g, "\n").trim();
  if (!raw) return [];

  const protectedText = protectAbbreviations(raw);
  // 마침표·물음표·느낌표 뒤 공백/개행 기준 분리 (따옴표 안 종료도 허용)
  const parts = protectedText.split(/(?<=[.!?])(?:["')\]]*)(?:\s+|$)/);

  const sentences: string[] = [];
  for (const part of parts) {
    const s = restoreProtected(part).replace(/\s+/g, " ").trim();
    if (!s) continue;
    // 글자가 거의 없는 조각 스킵
    if ((s.match(/[A-Za-z가-힣]/g) ?? []).length < 2) continue;
    sentences.push(s);
  }

  // 분리 실패 시 원문 한 덩어리
  if (sentences.length === 0 && raw) {
    return [raw.replace(/\s+/g, " ").trim()];
  }
  return sentences;
}

export function mergeSentenceTexts(
  englishParts: string[],
  separator = " "
): string {
  return englishParts.map((s) => s.trim()).filter(Boolean).join(separator);
}
