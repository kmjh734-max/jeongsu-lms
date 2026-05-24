/** TTS에 넣을 대사만 남김 (화자 라벨·지시문 제거) */
export function sanitizeSegmentTextForTts(text: string): string {
  let s = text.trim();
  s = s.replace(/^(ANN|M|W)\s*:\s*/i, "");
  s = s.replace(/^[\[(]?(ANN|M|W|남자|여자|내레이터)[\])]?\s*[:：]\s*/i, "");
  return s.trim();
}
