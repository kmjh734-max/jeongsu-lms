import {
  normalizeWhitespace,
  tokenizeForWordOrder,
} from "@/lib/lesson-materials/word-order-tokenize";

/** Normalize curly quotes / dashes so AI surfaces can match OCR text. */
export function normalizeGrammarSurface(text: string): string {
  return normalizeWhitespace(text)
    .replace(/[‘’‛‹›]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...");
}

export function surfacesEqual(a: string, b: string): boolean {
  return normalizeGrammarSurface(a) === normalizeGrammarSurface(b);
}

export function findTokenSpan(
  tokens: string[],
  needle: string
): { start: number; end: number; text: string } | null {
  const want = tokenizeForWordOrder(needle).map((t) => t.surface);
  if (want.length === 0 || want.length > tokens.length) return null;

  for (let i = 0; i <= tokens.length - want.length; i++) {
    let ok = true;
    for (let j = 0; j < want.length; j++) {
      if (!surfacesEqual(tokens[i + j]!, want[j]!)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      return {
        start: i,
        end: i + want.length - 1,
        text: tokens.slice(i, i + want.length).join(" "),
      };
    }
  }

  // Allow trailing punctuation difference on the last token only
  for (let i = 0; i <= tokens.length - want.length; i++) {
    let ok = true;
    for (let j = 0; j < want.length; j++) {
      const a = normalizeGrammarSurface(tokens[i + j]!);
      const b = normalizeGrammarSurface(want[j]!);
      if (j < want.length - 1) {
        if (a !== b) {
          ok = false;
          break;
        }
      } else {
        const strip = (s: string) => s.replace(/[.,;:!?]+$/g, "");
        if (strip(a) !== strip(b) && a !== b) {
          ok = false;
          break;
        }
      }
    }
    if (ok) {
      return {
        start: i,
        end: i + want.length - 1,
        text: tokens.slice(i, i + want.length).join(" "),
      };
    }
  }

  return null;
}

export function resolveSentenceId(
  rawId: string,
  sentences: Array<{ id: string; english: string }>,
  originalText: string
): string | null {
  const id = String(rawId ?? "").trim();
  if (sentences.some((s) => s.id === id)) return id;

  const asNum = Number(id);
  if (
    Number.isInteger(asNum) &&
    asNum >= 1 &&
    asNum <= sentences.length
  ) {
    return sentences[asNum - 1]!.id;
  }

  // "s1" / "sentence-1"
  const m = id.match(/(?:^s(?:entence)?)[_-]?(\d+)$/i);
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= sentences.length) return sentences[n - 1]!.id;
  }

  const needle = normalizeGrammarSurface(originalText);
  if (needle.length >= 2) {
    for (const s of sentences) {
      if (normalizeGrammarSurface(s.english).includes(needle)) return s.id;
    }
  }
  return null;
}

/**
 * Fix AI token indices / sentenceId using originalText (or correctText) lookup.
 */
export function repairCandidateAgainstPassage<
  T extends {
    sentenceId: string;
    originalText: string;
    correctText: string;
    startTokenIndex: number;
    endTokenIndex: number;
  },
>(
  candidate: T,
  sentences: Array<{ id: string; english: string }>
): T | null {
  const sentenceId =
    resolveSentenceId(
      candidate.sentenceId,
      sentences,
      candidate.originalText || candidate.correctText
    ) ?? null;
  if (!sentenceId) return null;

  const english =
    sentences.find((s) => s.id === sentenceId)?.english ?? "";
  const tokens = tokenizeForWordOrder(english).map((t) => t.surface);
  const needle =
    candidate.originalText?.trim() || candidate.correctText?.trim() || "";
  if (!needle) return null;

  // Prefer stated indices when they already match
  const start = candidate.startTokenIndex;
  const end = candidate.endTokenIndex;
  if (
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end < tokens.length &&
    start <= end
  ) {
    const span = tokens.slice(start, end + 1).join(" ");
    if (surfacesEqual(span, needle) || surfacesEqual(span, candidate.correctText)) {
      return {
        ...candidate,
        sentenceId,
        originalText: span,
        correctText: span,
        startTokenIndex: start,
        endTokenIndex: end,
      };
    }
  }

  const found =
    findTokenSpan(tokens, needle) ||
    findTokenSpan(tokens, candidate.correctText);
  if (!found) return null;

  return {
    ...candidate,
    sentenceId,
    originalText: found.text,
    correctText: found.text,
    startTokenIndex: found.start,
    endTokenIndex: found.end,
  };
}
