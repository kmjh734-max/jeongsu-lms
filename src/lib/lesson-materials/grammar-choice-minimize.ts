import {
  tokenizeForWordOrder,
  normalizeWhitespace,
} from "@/lib/lesson-materials/word-order-tokenize";
import {
  surfacesEqual,
  normalizeGrammarSurface,
} from "@/lib/lesson-materials/grammar-choice-repair";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";

export const GRAMMAR_CHOICE_MAX_WORDS = 7;
export const GRAMMAR_CHOICE_MAX_CHARS = 60;

function isPunctOnly(token: string): boolean {
  return /^[.,;:!?…'"`“”‘’()\-–—]+$/.test(token);
}

function bareToken(token: string): string {
  return token.replace(/[.,;:!?]+$/g, "").toLowerCase();
}

const AUX_OR_MODAL = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "may",
  "might",
  "must",
  "shall",
  "should",
]);

function looksVerbalRemainder(tokens: string[]): boolean {
  return tokens.some((t) => {
    const b = bareToken(t);
    return (
      b === "being" ||
      b === "been" ||
      /ing$/i.test(b) ||
      /(ed|en)$/i.test(b)
    );
  });
}

function wordCount(text: string): number {
  return tokenizeForWordOrder(text).length;
}

const WH_REL = new Set([
  "which",
  "that",
  "who",
  "whom",
  "whose",
  "what",
  "where",
  "when",
  "why",
  "how",
]);

function looksLikeVerbToken(token: string | undefined): boolean {
  if (!token) return false;
  const b = bareToken(token);
  if (!b || AUX_OR_MODAL.has(b) || WH_REL.has(b)) return false;
  // Agreement / form contrasts after WH (states/state, is/are, …)
  return /^[a-z]+$/i.test(b);
}

/**
 * Strip shared prefix/suffix tokens so only the differing grammar span remains.
 * Keeps shared auxiliaries when they belong to a passive/progressive contrast
 * (e.g. are being held / are holding).
 * Keeps shared relative/WH words when the remainder is a verb contrast
 * (e.g. which states / which state).
 */
export function minimizeChoicePair(
  correctText: string,
  incorrectText: string
): {
  correctText: string;
  incorrectText: string;
  prefixTokenCount: number;
  suffixTokenCount: number;
} | null {
  const cTok = tokenizeForWordOrder(correctText).map((t) => t.surface);
  const iTok = tokenizeForWordOrder(incorrectText).map((t) => t.surface);
  if (cTok.length === 0 || iTok.length === 0) return null;

  let pre = 0;
  while (
    pre < cTok.length &&
    pre < iTok.length &&
    surfacesEqual(cTok[pre]!, iTok[pre]!)
  ) {
    const shared = bareToken(cTok[pre]!);
    const cRest = cTok.slice(pre + 1);
    const iRest = iTok.slice(pre + 1);
    if (
      AUX_OR_MODAL.has(shared) &&
      looksVerbalRemainder(cRest) &&
      looksVerbalRemainder(iRest)
    ) {
      break;
    }
    if (
      WH_REL.has(shared) &&
      looksLikeVerbToken(cRest[0]) &&
      looksLikeVerbToken(iRest[0])
    ) {
      break;
    }
    pre += 1;
  }

  let suf = 0;
  while (
    suf < cTok.length - pre &&
    suf < iTok.length - pre &&
    surfacesEqual(cTok[cTok.length - 1 - suf]!, iTok[iTok.length - 1 - suf]!)
  ) {
    // Never strip a shared suffix if it would empty either mid span
    if (cTok.length - pre - (suf + 1) <= 0) break;
    if (iTok.length - pre - (suf + 1) <= 0) break;
    suf += 1;
  }

  let cMid = cTok.slice(pre, cTok.length - suf);
  let iMid = iTok.slice(pre, iTok.length - suf);

  // Drop leading/trailing punctuation-only tokens from the minimized span
  while (cMid.length && isPunctOnly(cMid[0]!)) {
    cMid = cMid.slice(1);
    pre += 1;
  }
  while (iMid.length && isPunctOnly(iMid[0]!)) {
    iMid = iMid.slice(1);
  }
  while (cMid.length && isPunctOnly(cMid[cMid.length - 1]!)) {
    cMid = cMid.slice(0, -1);
    suf += 1;
  }
  while (iMid.length && isPunctOnly(iMid[iMid.length - 1]!)) {
    iMid = iMid.slice(0, -1);
  }

  if (cMid.length === 0 || iMid.length === 0) return null;
  if (cMid.every(isPunctOnly) || iMid.every(isPunctOnly)) return null;

  const correct = cMid.join(" ");
  const incorrect = iMid.join(" ");
  if (surfacesEqual(correct, incorrect)) return null;
  if (wordCount(correct) > GRAMMAR_CHOICE_MAX_WORDS) return null;
  if (correct.length > GRAMMAR_CHOICE_MAX_CHARS) return null;
  if (incorrect.length > GRAMMAR_CHOICE_MAX_CHARS) return null;

  return {
    correctText: correct,
    incorrectText: incorrect,
    prefixTokenCount: pre,
    suffixTokenCount: suf,
  };
}

/** Locate exact (or quote-normalized) substring; returns [start, end) char indices. */
export function findCharSpanInSource(
  source: string,
  needle: string,
  fromIndex = 0
): { start: number; end: number; text: string } | null {
  if (!needle) return null;
  const exact = source.indexOf(needle, fromIndex);
  if (exact >= 0) {
    return { start: exact, end: exact + needle.length, text: needle };
  }

  const nNeedle = normalizeGrammarSurface(needle);
  if (!nNeedle) return null;
  const startAt = Math.max(0, fromIndex);
  // Window lengths around needle length (quotes/dashes can change length slightly)
  const minLen = Math.max(1, nNeedle.length - 4);
  const maxLen = nNeedle.length + 8;
  for (let i = startAt; i < source.length; i++) {
    for (let len = minLen; len <= maxLen && i + len <= source.length; len++) {
      const slice = source.slice(i, i + len);
      if (normalizeGrammarSurface(slice) === nNeedle) {
        return { start: i, end: i + len, text: slice };
      }
    }
  }
  return null;
}

/**
 * After repair: minimize pair, re-locate span in sentence, keep exact source text.
 */
export function minimizeAndRelocateCandidate(
  candidate: GrammarChoiceCandidate,
  sentenceEnglish: string
): GrammarChoiceCandidate | null {
  const minimized = minimizeChoicePair(
    candidate.correctText,
    candidate.incorrectText
  );
  if (!minimized) return null;

  const tokens = tokenizeForWordOrder(sentenceEnglish).map((t) => t.surface);
  let start = candidate.startTokenIndex + minimized.prefixTokenCount;
  let end = candidate.endTokenIndex - minimized.suffixTokenCount;

  const windowOk =
    start >= 0 &&
    end < tokens.length &&
    start <= end &&
    surfacesEqual(
      tokens
        .slice(start, end + 1)
        .join(" ")
        .replace(/[.,;:!?]+$/g, ""),
      minimized.correctText.replace(/[.,;:!?]+$/g, "")
    );

  if (!windowOk) {
    // Prefer occurrence nearest the original span (avoid relocating to an earlier "that"/"what")
    const want = tokenizeForWordOrder(minimized.correctText).map((t) => t.surface);
    let best: { start: number; end: number; dist: number } | null = null;
    if (want.length > 0) {
      for (let i = 0; i <= tokens.length - want.length; i++) {
        let ok = true;
        for (let j = 0; j < want.length; j++) {
          if (!surfacesEqual(tokens[i + j]!, want[j]!)) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        const dist = Math.abs(i - candidate.startTokenIndex);
        if (!best || dist < best.dist) {
          best = { start: i, end: i + want.length - 1, dist };
        }
      }
    }
    if (best) {
      start = best.start;
      end = best.end;
    } else {
      return null;
    }
  }

  const exactRaw = tokens.slice(start, end + 1).join(" ");
  // Prefer span without trailing sentence punctuation attached to last token
  const exact = exactRaw.replace(/[.,;:!?]+$/g, "");
  if (!exact || surfacesEqual(exact, "")) return null;

  // Only re-find if current window still has trailing punct on last token
  if (!surfacesEqual(exactRaw.replace(/[.,;:!?]+$/g, ""), exactRaw)) {
    const want = tokenizeForWordOrder(exact).map((t) => t.surface);
    let best: { start: number; end: number; dist: number } | null = null;
    for (let i = 0; i <= tokens.length - want.length; i++) {
      let ok = true;
      for (let j = 0; j < want.length; j++) {
        const a = tokens[i + j]!.replace(/[.,;:!?]+$/g, "");
        const b = want[j]!.replace(/[.,;:!?]+$/g, "");
        if (!surfacesEqual(a, b)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const dist = Math.abs(i - start);
      if (!best || dist < best.dist) {
        best = { start: i, end: i + want.length - 1, dist };
      }
    }
    if (best) {
      start = best.start;
      end = best.end;
    }
  }

  const finalText = tokens
    .slice(start, end + 1)
    .join(" ")
    .replace(/[.,;:!?]+$/g, "");

  if (wordCount(finalText) > GRAMMAR_CHOICE_MAX_WORDS) return null;
  if (finalText.length > GRAMMAR_CHOICE_MAX_CHARS) return null;
  if (/^[.,;:!?]+$/.test(finalText)) return null;

  // incorrect also drop trailing punct
  const incorrect = minimized.incorrectText.replace(/[.,;:!?]+$/g, "");

  return {
    ...candidate,
    startTokenIndex: start,
    endTokenIndex: end,
    originalText: finalText,
    correctText: finalText,
    incorrectText: incorrect,
  };
}

export function assignPassageCharIndices(
  sourcePassage: string,
  items: Array<{
    correctText: string;
    sentenceId: string;
  }>,
  _sentenceOrder: string[]
): Array<{ startCharIndex: number; endCharIndex: number } | null> {
  const bySentenceProgress = new Map<string, number>();
  const out: Array<{ startCharIndex: number; endCharIndex: number } | null> =
    [];
  let searchFrom = 0;
  for (const it of items) {
    const preferFrom = bySentenceProgress.get(it.sentenceId) ?? searchFrom;
    const found =
      findCharSpanInSource(sourcePassage, it.correctText, preferFrom) ||
      findCharSpanInSource(sourcePassage, it.correctText, 0);
    if (!found) {
      out.push(null);
      continue;
    }
    if (sourcePassage.slice(found.start, found.end) !== found.text) {
      out.push(null);
      continue;
    }
    if (
      normalizeWhitespace(found.text) !==
        normalizeWhitespace(it.correctText) &&
      !surfacesEqual(found.text, it.correctText)
    ) {
      out.push(null);
      continue;
    }
    out.push({ startCharIndex: found.start, endCharIndex: found.end });
    searchFrom = found.end;
    bySentenceProgress.set(it.sentenceId, found.end);
  }
  return out;
}
