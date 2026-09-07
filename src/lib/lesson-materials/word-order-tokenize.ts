import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

export type WordOrderToken = {
  tokenId: string;
  surface: string;
  originalIndex: number;
};

/** Normalize whitespace the same way as workbook passages (keep contractions / hyphens). */
export function normalizeWhitespace(english: string): string {
  return formatWorkbookPassage(english);
}

/**
 * Split English on whitespace only — apostrophes, hyphens, and attached
 * punctuation stay on their token (don't / person's / long-term / results.).
 */
export function tokenizeForWordOrder(english: string): WordOrderToken[] {
  return normalizeWhitespace(english)
    .split(" ")
    .filter(Boolean)
    .map((surface, originalIndex) => ({
      tokenId: `${originalIndex}-${surface}`,
      surface,
      originalIndex,
    }));
}

export function restoreEnglishFromTokens(tokens: WordOrderToken[]): string {
  return [...tokens]
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((t) => t.surface)
    .join(" ");
}

export function isRestorableToOriginal(
  originalEnglish: string,
  tokens: WordOrderToken[]
): boolean {
  return (
    normalizeWhitespace(restoreEnglishFromTokens(tokens)) ===
    normalizeWhitespace(originalEnglish)
  );
}

export function validateWordOrderTokens(
  originalEnglish: string,
  originalTokens: WordOrderToken[],
  shuffledTokens: WordOrderToken[]
): { ok: true } | { ok: false; reason: string } {
  if (originalTokens.length === 0) {
    return { ok: false, reason: "빈 토큰" };
  }
  if (originalTokens.length !== shuffledTokens.length) {
    return { ok: false, reason: "원문·셔플 토큰 수 불일치" };
  }
  const ids = originalTokens.map((t) => t.tokenId);
  if (new Set(ids).size !== ids.length) {
    return { ok: false, reason: "중복 tokenId" };
  }
  const shuffledIds = shuffledTokens.map((t) => t.tokenId);
  if (new Set(shuffledIds).size !== shuffledIds.length) {
    return { ok: false, reason: "셔플 중복 tokenId" };
  }
  const origSet = new Set(ids);
  for (const id of shuffledIds) {
    if (!origSet.has(id)) {
      return { ok: false, reason: `누락/추가 토큰: ${id}` };
    }
  }
  if (!isRestorableToOriginal(originalEnglish, originalTokens)) {
    return { ok: false, reason: "원문 복원 실패" };
  }
  if (!isRestorableToOriginal(originalEnglish, shuffledTokens)) {
    return { ok: false, reason: "셔플 토큰으로 원문 복원 실패" };
  }
  return { ok: true };
}
