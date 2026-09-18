/**
 * 음성으로 읽으면 이상하게 나오는 추임새(Hmm·Um·Uh·Er·Mm)를 고친다.
 *
 * 음성 엔진은 "Hmm,"을 길게 끄는 이상한 소리로 읽었다(선생님이 중1 1회 1번에서 짚음, 2026-09-18).
 * 문장 첫머리의 추임새는 자연스러운 "Well,"로 바꾸고, 문장 중간의 추임새는 뺀다.
 * 대본과 녹음 원본에 똑같이 적용해 인쇄된 대본과 음성이 어긋나지 않게 한다.
 */
const FILLER = "(?:h+m+|u+m+|u+h+|e+r+m*|m+m+)";
// 문장 첫머리: 글 처음·줄 처음(화자 표시 M: W: 뒤 포함)·문장 끝 다음
const AT_START = new RegExp(`(^|\\n|[.!?]["']?\\s+)((?:(?:M|W|ANN)\\s*:\\s*)?)${FILLER}[,.!…]*\\s+`, "gim");
const IN_MIDDLE = new RegExp(`,\\s*${FILLER}[,.!…]*(?=\\s)`, "gi");

export function replaceSpokenFillers(text: string): string {
  if (!text) return text;
  return text
    .replace(AT_START, (_m, lead: string, speaker: string) => `${lead}${speaker}Well, `)
    .replace(IN_MIDDLE, ",")
    .replace(/Well, well,/gi, "Well,")
    .replace(/ {2,}/g, " ");
}

export function hasSpokenFiller(text: string): boolean {
  return new RegExp(`\\b${FILLER}\\b`, "i").test(text ?? "");
}
