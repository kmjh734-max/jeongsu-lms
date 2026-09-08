import type {
  GrammarCandidateReview,
  ValidatedGrammarCandidate,
} from "@/lib/lesson-materials/grammar-choice-v5-types";
import { isReviewAcceptedByCode } from "@/lib/lesson-materials/grammar-choice-v5-review";
import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";

export type ReviewedAcceptedCandidate = {
  validated: ValidatedGrammarCandidate;
  review: GrammarCandidateReview;
  qualityScore: number;
  learningValue: number;
  difficultyScore: number;
  hintBoost: number;
};

const HARD_REVIEW_REJECT = new Set([
  "CORRECT_NOT_ORIGINAL",
  "CORRECT_UNGRAMMATICAL",
  "BOTH_OPTIONS_POSSIBLE",
  "LEXICAL_OR_COLLOCATION",
]);

function syntheticAcceptedReview(
  v: ValidatedGrammarCandidate
): GrammarCandidateReview {
  const quality = Math.min(5, Math.max(4, Math.round(v.confidence) || 4));
  const difficulty = Math.min(5, Math.max(1, Math.round(v.estimatedDifficulty) || 3));
  return {
    candidateId: v.candidateId,
    correctMatchesOriginal: true,
    correctSentenceIsGrammatical: true,
    incorrectSentenceIsUngrammatical: true,
    onlyOneAnswerPossible: true,
    testsGrammarNotVocabulary: true,
    distractorIsPlausible: true,
    selectionRangeIsMinimal: true,
    suitableForHighSchoolExam: true,
    ambiguityRisk: "low",
    qualityScore: quality,
    difficultyScore: difficulty,
    accepted: true,
    rejectionReasons: [],
    finalBookTerm: v.bookTerm,
    finalExplanationKo: v.explanationKo,
    finalIncorrectReasonKo: v.incorrectReasonKo,
  };
}

/** Code-validated items already restored the original and passed the quality block. */
export function acceptCodeValidatedCandidates(
  validated: ValidatedGrammarCandidate[],
  reviews: GrammarCandidateReview[] = []
): ReviewedAcceptedCandidate[] {
  const byId = new Map(reviews.map((r) => [r.candidateId, r]));
  const usable = validated.filter((v) => {
    const r = byId.get(v.candidateId);
    if (!r) return true;
    return !r.rejectionReasons.some((reason) => HARD_REVIEW_REJECT.has(reason));
  });
  const pool = usable.length > 0 ? usable : validated;
  return pool.map((v) => {
    const review = syntheticAcceptedReview(v);
    return {
      validated: v,
      review,
      qualityScore: review.qualityScore,
      learningValue: v.learningValue,
      difficultyScore: review.difficultyScore,
      hintBoost: v.sourceHintUsed && v.sourceHintName ? 1 : 0,
    };
  });
}

export function pairReviewsWithCandidates(
  validated: ValidatedGrammarCandidate[],
  reviews: GrammarCandidateReview[]
): {
  accepted: ReviewedAcceptedCandidate[];
  rejectedReviews: GrammarCandidateReview[];
} {
  const byId = new Map(reviews.map((r) => [r.candidateId, r]));
  const accepted: ReviewedAcceptedCandidate[] = [];
  const rejectedReviews: GrammarCandidateReview[] = [];

  for (const v of validated) {
    const r = byId.get(v.candidateId);
    if (!r) {
      rejectedReviews.push({
        candidateId: v.candidateId,
        correctMatchesOriginal: false,
        correctSentenceIsGrammatical: false,
        incorrectSentenceIsUngrammatical: false,
        onlyOneAnswerPossible: false,
        testsGrammarNotVocabulary: false,
        distractorIsPlausible: false,
        selectionRangeIsMinimal: false,
        suitableForHighSchoolExam: false,
        ambiguityRisk: "high",
        qualityScore: 1,
        difficultyScore: 1,
        accepted: false,
        rejectionReasons: ["OTHER"],
        finalBookTerm: v.bookTerm,
        finalExplanationKo: v.explanationKo,
        finalIncorrectReasonKo: v.incorrectReasonKo,
      });
      continue;
    }
    if (!isReviewAcceptedByCode(r)) {
      rejectedReviews.push(r);
      continue;
    }
    accepted.push({
      validated: v,
      review: r,
      qualityScore: r.qualityScore,
      learningValue: v.learningValue,
      difficultyScore: r.difficultyScore,
      hintBoost: v.sourceHintUsed && v.sourceHintName ? 1 : 0,
    });
  }
  return { accepted, rejectedReviews };
}

export function selectFinalReviewedCandidates(
  accepted: ReviewedAcceptedCandidate[],
  softMax: number
): ReviewedAcceptedCandidate[] {
  if (accepted.length === 0) return [];

  const remaining = [...accepted];
  const selected: ReviewedAcceptedCandidate[] = [];
  const categoryCounts = new Map<string, number>();
  const sentenceCounts = new Map<string, number>();
  const occupied: Array<{ sentenceId: string; start: number; end: number }> =
    [];

  const score = (c: ReviewedAcceptedCandidate) => {
    const cat = c.validated.grammarCategory;
    const catCount = categoryCounts.get(cat) ?? 0;
    const sentCount = sentenceCounts.get(c.validated.sentenceId) ?? 0;
    return (
      c.qualityScore * 5 +
      c.learningValue * 3 +
      c.difficultyScore * 2 +
      c.hintBoost * 2 -
      catCount * 3 -
      sentCount * 2
    );
  };

  while (selected.length < softMax && remaining.length > 0) {
    remaining.sort((a, b) => score(b) - score(a));
    const next = remaining.shift()!;
    const cat = next.validated.grammarCategory;
    const catCount = categoryCounts.get(cat) ?? 0;
    if (catCount >= 2 && selected.length >= Math.min(softMax, 6)) {
      // allow up to 3 only if still early and high quality
      if (!(catCount < 3 && next.qualityScore >= 5 && next.hintBoost)) {
        continue;
      }
    }
    const overlaps = occupied.some(
      (o) =>
        o.sentenceId === next.validated.sentenceId &&
        !(
          next.validated.endTokenIndex < o.start ||
          next.validated.startTokenIndex > o.end
        )
    );
    if (overlaps) continue;

    selected.push(next);
    categoryCounts.set(cat, catCount + 1);
    sentenceCounts.set(
      next.validated.sentenceId,
      (sentenceCounts.get(next.validated.sentenceId) ?? 0) + 1
    );
    occupied.push({
      sentenceId: next.validated.sentenceId,
      start: next.validated.startTokenIndex,
      end: next.validated.endTokenIndex,
    });
  }

  return selected.sort((a, b) => {
    if (a.validated.sentenceId !== b.validated.sentenceId) {
      return a.validated.sentenceId.localeCompare(b.validated.sentenceId);
    }
    return a.validated.startTokenIndex - b.validated.startTokenIndex;
  });
}

function pickBookTerm(
  finalBookTerm: string,
  bookTerm: string,
  grammarStructure: string
): string {
  const final = finalBookTerm.trim();
  const orig = bookTerm.trim();
  const structure = grammarStructure.trim();
  const generic = /^(어법|grammar|기타|other)$/i;
  if (final && !generic.test(final)) return final;
  if (orig && !generic.test(orig)) return orig;
  if (structure && !generic.test(structure)) return structure;
  return final || orig || "어법";
}

export function toGrammarChoiceCandidate(
  row: ReviewedAcceptedCandidate
): GrammarChoiceCandidate {
  const v = row.validated;
  const r = row.review;
  return {
    choiceId: v.candidateId.slice(0, 80),
    passageId: v.passageId,
    sentenceId: v.sentenceId,
    startTokenIndex: v.startTokenIndex,
    endTokenIndex: v.endTokenIndex,
    originalText: v.correctText,
    correctText: v.correctText,
    incorrectText: v.incorrectText,
    grammarCategoryId: v.grammarCategory,
    grammarCategoryName: v.grammarCategory,
    bookTerm: pickBookTerm(r.finalBookTerm, v.bookTerm, v.grammarStructure),
    explanationKo: r.finalExplanationKo || v.explanationKo,
    incorrectReasonKo: r.finalIncorrectReasonKo || v.incorrectReasonKo,
    difficulty: Math.min(5, Math.max(1, row.difficultyScore)) as 1 | 2 | 3 | 4 | 5,
    learningValue: Math.min(5, Math.max(1, row.learningValue)) as 1 | 2 | 3 | 4 | 5,
    ambiguityRisk: "low",
    sourceType: v.sourceHintUsed ? "analysis_required" : "ai_supplement",
    analysisPointId: null,
    structureSummary: v.grammarStructure || undefined,
  };
}
