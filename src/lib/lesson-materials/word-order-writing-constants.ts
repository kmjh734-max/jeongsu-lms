/** Display / shuffle rules for word-order English writing. */
export const WORD_ORDER_WRITING_ALGORITHM_VERSION = "word-order-writing-v1";

export const WORD_ORDER_MAX_SHUFFLE_ATTEMPTS = 50;
/** Reject if this fraction of tokens stay in the original index. */
export const WORD_ORDER_MAX_SAME_POSITION_RATIO = 0.25;
/** Reject if this fraction of forward-adjacent pairs are preserved. */
export const WORD_ORDER_MAX_ADJACENT_PAIR_RATIO = 0.35;
