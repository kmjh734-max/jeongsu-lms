/** Bump when shuffle / split / pin / numbering rules change. */
export const SENTENCE_ORDER_ALGORITHM_VERSION = "sentence-order-v2-numeric";

export const SENTENCE_ORDER_MAX_SHUFFLE_ATTEMPTS = 30;
export const SENTENCE_ORDER_MAX_SAME_POSITION_RATIO = 0.3;
export const SENTENCE_ORDER_MAX_ADJACENT_PAIR_RATIO = 0.4;

export const SENTENCE_ORDER_SKIP_TOO_FEW =
  "이 지문은 문장 수가 부족하여 문장 순서 배열 문제를 만들 수 없습니다.";

export const SENTENCE_ORDER_SKIP_RESTORE =
  "이 지문은 원문 복원 검증에 실패하여 문장 순서 배열 문제를 만들 수 없습니다.";
