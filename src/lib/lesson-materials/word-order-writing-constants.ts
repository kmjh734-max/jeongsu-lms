/** Semantic chunk + shuffle rules for word-order English writing. */
export const WORD_ORDER_CHUNK_ALGORITHM_VERSION =
  "word-order-semantic-chunks-v4-final";

/** Kept for seed / display versioning alongside chunk algo. */
export const WORD_ORDER_WRITING_ALGORITHM_VERSION =
  WORD_ORDER_CHUNK_ALGORITHM_VERSION;

export const WORD_ORDER_MAX_SHUFFLE_ATTEMPTS = 50;
/** Reject if this fraction of chunks stay in the original index. */
export const WORD_ORDER_MAX_SAME_POSITION_RATIO = 0.3;
/** Reject if this fraction of forward-adjacent chunk pairs are preserved. */
export const WORD_ORDER_MAX_ADJACENT_PAIR_RATIO = 0.4;

/**
 * 한 덩어리 목표 낱말 수. 이보다 긴 덩어리가 있는 문장은 청크를 다시 받는다. 선생님 지적(2026-10-07):
 * "구 별로 조금 더 쪼개져야… 너무 덩어리가 크다." 규칙으로 잘라 보니 고유명사·숙어(World War II,
 * on their own)까지 끊어 모델에 맡긴다.
 */
export const WORD_ORDER_TARGET_CHUNK_WORDS = 4;

/** Soft guidance only — never force-split to hit this. */
export const WORD_ORDER_MAX_CHUNK_WORDS = 8;
export const WORD_ORDER_MAX_CHUNK_WORDS_FIXED = 10;
export const WORD_ORDER_MAX_SINGLE_WORD_RATIO = 0.45;
