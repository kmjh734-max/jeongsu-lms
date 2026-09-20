/** TTS 조각(발화 한 줄) 파일을 저장소에 남길지 — 받아쓰기 줄별 재생에 쓴다 */
export function shouldSaveTtsSegments(): boolean {
  return process.env.SAVE_TTS_SEGMENTS === "true";
}
