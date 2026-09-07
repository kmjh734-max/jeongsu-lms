import {
  WORD_ORDER_MAX_ADJACENT_PAIR_RATIO,
  WORD_ORDER_MAX_SAME_POSITION_RATIO,
  WORD_ORDER_MAX_SHUFFLE_ATTEMPTS,
  WORD_ORDER_WRITING_ALGORITHM_VERSION,
} from "@/lib/lesson-materials/word-order-writing-constants";
import type { WordOrderChunk } from "@/lib/lesson-materials/word-order-chunking";
import {
  adjacentPairKeepRatio,
  createSeededRng,
  fisherYatesShuffle,
  hashSeedToUint32,
  isExactReverse,
  samePositionRatio,
} from "@/lib/lesson-materials/sentence-order-shuffle";

function hexHash(input: string, parts = 3): string {
  let out = "";
  for (let i = 0; i < parts; i++) {
    out += hashSeedToUint32(`${input}#${i}`)
      .toString(16)
      .padStart(8, "0");
  }
  return out;
}

export function buildWordOrderSeed(input: {
  workbookId: string;
  passageId: string;
  sentenceId: string;
  sourceHash: string;
}): string {
  const raw = [
    input.workbookId,
    input.passageId,
    input.sentenceId,
    input.sourceHash,
    WORD_ORDER_WRITING_ALGORITHM_VERSION,
  ].join("|");
  return hexHash(raw, 3);
}

function isAcceptableChunkShuffle(
  originalIds: string[],
  shuffledIds: string[]
): boolean {
  if (originalIds.length !== shuffledIds.length) return false;
  if (originalIds.length <= 1) return true;
  if (originalIds.join("|") === shuffledIds.join("|")) return false;
  if (isExactReverse(originalIds, shuffledIds)) return false;
  if (
    samePositionRatio(originalIds, shuffledIds) >=
    WORD_ORDER_MAX_SAME_POSITION_RATIO
  ) {
    return false;
  }
  if (
    adjacentPairKeepRatio(originalIds, shuffledIds) >=
    WORD_ORDER_MAX_ADJACENT_PAIR_RATIO
  ) {
    return false;
  }
  return true;
}

type AttemptScore = {
  ids: string[];
  samePos: number;
  adjacent: number;
};

/** Deterministic Fisher–Yates over semantic chunks. */
export function shuffleWordOrderChunks(
  chunks: WordOrderChunk[],
  seed: string
): WordOrderChunk[] {
  if (chunks.length <= 1) return [...chunks];

  const byId = new Map(chunks.map((c) => [c.chunkId, c] as const));
  const originalIds = chunks.map((c) => c.chunkId);
  const rng = createSeededRng(seed);
  let best: AttemptScore | null = null;

  for (let attempt = 0; attempt < WORD_ORDER_MAX_SHUFFLE_ATTEMPTS; attempt++) {
    const attemptSeed = `${seed}#${attempt}`;
    const attemptRng = createSeededRng(attemptSeed);
    void rng();
    const shuffledIds = fisherYatesShuffle(originalIds, attemptRng);
    const samePos = samePositionRatio(originalIds, shuffledIds);
    const adjacent = adjacentPairKeepRatio(originalIds, shuffledIds);
    const identity = originalIds.join("|") === shuffledIds.join("|");
    const reverse = isExactReverse(originalIds, shuffledIds);
    if (isAcceptableChunkShuffle(originalIds, shuffledIds)) {
      return shuffledIds.map((id) => byId.get(id)!);
    }
    if (
      !identity &&
      !reverse &&
      (best == null || samePos + adjacent < best.samePos + best.adjacent)
    ) {
      best = { ids: shuffledIds, samePos, adjacent };
    }
  }

  if (best) return best.ids.map((id) => byId.get(id)!);
  const rotatedIds = [...originalIds.slice(1), originalIds[0]!];
  return rotatedIds.map((id) => byId.get(id)!);
}

/** @deprecated token shuffle kept for older tests — prefer shuffleWordOrderChunks */
export function shuffleWordOrderTokens<T extends { tokenId: string }>(
  tokens: T[],
  seed: string
): T[] {
  if (tokens.length <= 1) return [...tokens];
  const asChunks: WordOrderChunk[] = tokens.map((t, i) => ({
    chunkId: t.tokenId,
    text: t.tokenId,
    originalIndex: i,
    startTokenIndex: i,
    endTokenIndex: i,
  }));
  const shuffled = shuffleWordOrderChunks(asChunks, seed);
  const byId = new Map(tokens.map((t) => [t.tokenId, t] as const));
  return shuffled.map((c) => byId.get(c.chunkId)!);
}
