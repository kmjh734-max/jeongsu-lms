import { tokenizeForWordOrder } from "@/lib/lesson-materials/word-order-tokenize";
import { findTokenSpan } from "@/lib/lesson-materials/grammar-choice-repair";
import { classifyLowQualityPair } from "@/lib/lesson-materials/grammar-choice-quality-block";
import type {
  CodeValidateRejectReason,
  GeneratedGrammarCandidate,
  ValidatedGrammarCandidate,
} from "@/lib/lesson-materials/grammar-choice-v5-types";

const MAX_WORDS = 5;

function wordCount(text: string): number {
  return tokenizeForWordOrder(text).length;
}

function nthOccurrence(
  haystack: string,
  needle: string,
  occurrenceIndex: number
): { start: number; end: number } | null {
  if (!needle) return null;
  let from = 0;
  let found = -1;
  for (let i = 0; i <= occurrenceIndex; i++) {
    found = haystack.indexOf(needle, from);
    if (found < 0) return null;
    from = found + Math.max(1, needle.length);
  }
  return { start: found, end: found + needle.length };
}

export function validateGeneratedGrammarCandidates(
  candidates: GeneratedGrammarCandidate[],
  sentenceMap: Map<string, string>
): {
  accepted: ValidatedGrammarCandidate[];
  rejected: Array<{
    candidate: GeneratedGrammarCandidate;
    reason: CodeValidateRejectReason;
  }>;
  stats: {
    originalMismatch: number;
    rangeError: number;
    overlapOrDuplicate: number;
    lowQuality: number;
  };
} {
  const accepted: ValidatedGrammarCandidate[] = [];
  const rejected: Array<{
    candidate: GeneratedGrammarCandidate;
    reason: CodeValidateRejectReason;
  }> = [];
  const occupied: Array<{
    sentenceId: string;
    start: number;
    end: number;
  }> = [];
  const stats = {
    originalMismatch: 0,
    rangeError: 0,
    overlapOrDuplicate: 0,
    lowQuality: 0,
  };

  const sorted = [...candidates].sort(
    (a, b) =>
      b.learningValue - a.learningValue ||
      b.confidence - a.confidence ||
      b.estimatedDifficulty - a.estimatedDifficulty
  );

  for (const c of sorted) {
    const sentence = sentenceMap.get(c.sentenceId);
    if (!sentence) {
      rejected.push({ candidate: c, reason: "missing_sentence" });
      continue;
    }
    if (!c.correctText.trim() || !c.incorrectText.trim()) {
      rejected.push({ candidate: c, reason: "empty_side" });
      stats.rangeError += 1;
      continue;
    }
    if (c.correctText === c.incorrectText) {
      rejected.push({ candidate: c, reason: "same_as_incorrect" });
      continue;
    }
    if (
      wordCount(c.correctText) > MAX_WORDS ||
      wordCount(c.incorrectText) > MAX_WORDS
    ) {
      rejected.push({ candidate: c, reason: "too_many_words" });
      stats.rangeError += 1;
      continue;
    }
    if (
      c.correctText.trim() === sentence.trim() ||
      c.incorrectText.trim() === sentence.trim()
    ) {
      rejected.push({ candidate: c, reason: "whole_sentence" });
      stats.rangeError += 1;
      continue;
    }

    const blocked = classifyLowQualityPair(c.correctText, c.incorrectText);
    if (blocked.blocked && blocked.rejectionCode) {
      rejected.push({
        candidate: c,
        reason: blocked.rejectionCode,
      });
      stats.lowQuality += 1;
      continue;
    }

    if (
      /\b(many kids today|we were made|humans are meant|bodies were)\b/i.test(
        c.incorrectText
      )
    ) {
      rejected.push({ candidate: c, reason: "subject_leak" });
      stats.lowQuality += 1;
      continue;
    }

    if (!sentence.includes(c.correctText)) {
      rejected.push({ candidate: c, reason: "correct_not_in_sentence" });
      stats.originalMismatch += 1;
      continue;
    }

    const loc = nthOccurrence(
      sentence,
      c.correctText,
      c.occurrenceIndex
    );
    if (!loc) {
      rejected.push({ candidate: c, reason: "occurrence_not_found" });
      stats.originalMismatch += 1;
      continue;
    }

    const slice = sentence.slice(loc.start, loc.end);
    if (slice !== c.correctText) {
      rejected.push({ candidate: c, reason: "SOURCE_MISMATCH" });
      stats.originalMismatch += 1;
      continue;
    }
    const before = loc.start > 0 ? sentence[loc.start - 1] : "";
    const after = loc.end < sentence.length ? sentence[loc.end] : "";
    const wordChar = (ch: string) => /[A-Za-z0-9'’]/.test(ch);
    if ((before && wordChar(before)) || (after && wordChar(after))) {
      rejected.push({ candidate: c, reason: "SOURCE_MISMATCH" });
      stats.originalMismatch += 1;
      continue;
    }

    const sentenceWithCorrect =
      sentence.slice(0, loc.start) + c.correctText + sentence.slice(loc.end);
    if (sentenceWithCorrect !== sentence) {
      rejected.push({ candidate: c, reason: "restore_failed" });
      stats.originalMismatch += 1;
      continue;
    }

    const sentenceWithIncorrect =
      sentence.slice(0, loc.start) +
      c.incorrectText +
      sentence.slice(loc.end);

    const tokens = tokenizeForWordOrder(sentence).map((t) => t.surface);
    const found = findTokenSpan(tokens, c.correctText);
    if (!found) {
      rejected.push({ candidate: c, reason: "token_span_failed" });
      stats.rangeError += 1;
      continue;
    }

    const overlaps = occupied.some(
      (o) =>
        o.sentenceId === c.sentenceId &&
        !(found.end < o.start || found.start > o.end)
    );
    if (overlaps) {
      rejected.push({ candidate: c, reason: "overlap" });
      stats.overlapOrDuplicate += 1;
      continue;
    }

    const dup = accepted.some(
      (a) =>
        a.sentenceId === c.sentenceId &&
        a.correctText === c.correctText &&
        a.incorrectText === c.incorrectText
    );
    if (dup) {
      rejected.push({ candidate: c, reason: "duplicate" });
      stats.overlapOrDuplicate += 1;
      continue;
    }

    accepted.push({
      ...c,
      sentenceText: sentence,
      startCharInSentence: loc.start,
      endCharInSentence: loc.end,
      sentenceWithCorrect,
      sentenceWithIncorrect,
      startTokenIndex: found.start,
      endTokenIndex: found.end,
    });
    occupied.push({
      sentenceId: c.sentenceId,
      start: found.start,
      end: found.end,
    });
  }

  return { accepted, rejected, stats };
}
