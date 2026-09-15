/**
 * 대본(segments·script_text)이 바뀌면 예전 받아쓰기 빈칸은 새 음원과 맞지 않는다.
 * 대본을 바꾸는 모든 경로에서 이 값을 같이 저장해 두면, 다음 준비 때 새 대본으로 다시 만든다.
 */
export const DICTATION_RESET_FIELDS = {
  dictation_blank_items: null,
  dictation_blank_variants: [] as unknown[],
  dictation_prepared_at: null,
} as const;
