import { WORD_ORDER_CHUNK_ALGORITHM_VERSION } from "@/lib/lesson-materials/word-order-writing-constants";
import type { WordOrderChunk } from "@/lib/lesson-materials/word-order-chunking";

export type StoredWordOrderChunkSentence = {
  sentenceId: string;
  sourceHash: string;
  algorithmVersion: string;
  chunks: Array<{
    text: string;
    startTokenIndex: number;
    endTokenIndex: number;
  }>;
};

export type StoredWordOrderChunkCache = {
  passageId: string;
  algorithmVersion: string;
  sentences: StoredWordOrderChunkSentence[];
  createdAt: string;
};

export function getCachedSentenceChunks(
  cache: StoredWordOrderChunkCache | null | undefined,
  passageId: string,
  sentenceId: string,
  sourceHash: string
): WordOrderChunk[] | null {
  if (!cache) return null;
  if (cache.passageId !== passageId) return null;
  if (cache.algorithmVersion !== WORD_ORDER_CHUNK_ALGORITHM_VERSION) {
    return null;
  }
  const row = cache.sentences.find((s) => s.sentenceId === sentenceId);
  if (!row) return null;
  if (row.sourceHash !== sourceHash) return null;
  if (row.algorithmVersion !== WORD_ORDER_CHUNK_ALGORITHM_VERSION) return null;
  if (!Array.isArray(row.chunks) || row.chunks.length < 2) return null;
  return row.chunks.map((c, i) => ({
    chunkId: `${sentenceId}-c${i + 1}`,
    text: c.text,
    originalIndex: i,
    startTokenIndex: c.startTokenIndex,
    endTokenIndex: c.endTokenIndex,
  }));
}

export function upsertSentenceChunks(
  cache: StoredWordOrderChunkCache | null | undefined,
  passageId: string,
  sentenceId: string,
  sourceHash: string,
  chunks: WordOrderChunk[]
): StoredWordOrderChunkCache {
  const base: StoredWordOrderChunkCache = cache &&
    cache.passageId === passageId &&
    cache.algorithmVersion === WORD_ORDER_CHUNK_ALGORITHM_VERSION
    ? {
        ...cache,
        sentences: [...cache.sentences],
      }
    : {
        passageId,
        algorithmVersion: WORD_ORDER_CHUNK_ALGORITHM_VERSION,
        sentences: [],
        createdAt: new Date().toISOString(),
      };

  const nextRow: StoredWordOrderChunkSentence = {
    sentenceId,
    sourceHash,
    algorithmVersion: WORD_ORDER_CHUNK_ALGORITHM_VERSION,
    chunks: chunks.map((c) => ({
      text: c.text,
      startTokenIndex: c.startTokenIndex,
      endTokenIndex: c.endTokenIndex,
    })),
  };
  const idx = base.sentences.findIndex((s) => s.sentenceId === sentenceId);
  if (idx >= 0) base.sentences[idx] = nextRow;
  else base.sentences.push(nextRow);
  base.createdAt = new Date().toISOString();
  return base;
}
