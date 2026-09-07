import type { GrammarChoiceCandidate } from "@/lib/lesson-materials/workbook-types";

const PRIORITY_A_KEYWORDS = [
  "수 일치",
  "일치",
  "수동",
  "능동",
  "본동사",
  "준동사",
  "분사",
  "병렬",
  "관계대명사",
  "관계부사",
  "what",
  "접속사",
  "전치사",
  "명사절",
  "가주어",
  "가목적어",
  "진주어",
  "진목적어",
  "목적격보어",
  "가정법",
  "도치",
  "비교",
  "강조",
];

const PRIORITY_B_KEYWORDS = [
  "동명사",
  "to부정사",
  "형용사",
  "부사",
  "대명사",
  "시제",
  "관사",
  "수량",
];

export function categoryPriorityScore(
  categoryName: string,
  bookTerm: string
): number {
  const hay = `${categoryName} ${bookTerm}`.toLowerCase();
  if (PRIORITY_A_KEYWORDS.some((k) => hay.includes(k.toLowerCase()))) return 3;
  if (PRIORITY_B_KEYWORDS.some((k) => hay.includes(k.toLowerCase()))) return 2;
  return 1;
}

export function scoreGrammarChoiceCandidate(
  c: GrammarChoiceCandidate,
  opts: {
    categoryCounts: Map<string, number>;
    sentenceCounts: Map<string, number>;
  }
): number {
  const catKey = c.grammarCategoryId || c.bookTerm;
  const catCount = opts.categoryCounts.get(catKey) ?? 0;
  const sentCount = opts.sentenceCounts.get(c.sentenceId) ?? 0;
  const categoryPriority = categoryPriorityScore(
    c.grammarCategoryName,
    c.bookTerm
  );
  const repetitionPenalty = Math.max(0, catCount);
  const sentenceConcentrationPenalty = Math.max(0, sentCount);
  return (
    c.learningValue * 4 +
    c.difficulty * 2 +
    categoryPriority * 3 -
    repetitionPenalty * 4 -
    sentenceConcentrationPenalty * 3
  );
}

export function selectFinalGrammarChoices(
  candidates: GrammarChoiceCandidate[],
  softMax: number
): GrammarChoiceCandidate[] {
  if (candidates.length === 0) return [];
  const remaining = [...candidates];
  const selected: GrammarChoiceCandidate[] = [];
  const categoryCounts = new Map<string, number>();
  const sentenceCounts = new Map<string, number>();

  while (selected.length < softMax && remaining.length > 0) {
    remaining.sort(
      (a, b) =>
        scoreGrammarChoiceCandidate(b, { categoryCounts, sentenceCounts }) -
        scoreGrammarChoiceCandidate(a, { categoryCounts, sentenceCounts })
    );
    const next = remaining.shift()!;
    const catKey = next.grammarCategoryId || next.bookTerm;
    const catCount = categoryCounts.get(catKey) ?? 0;
    if (catCount >= 2) continue;
    selected.push(next);
    categoryCounts.set(catKey, catCount + 1);
    sentenceCounts.set(
      next.sentenceId,
      (sentenceCounts.get(next.sentenceId) ?? 0) + 1
    );
  }

  // Prefer diversity when we have 6+ and fewer than 4 categories — drop lowest
  // only if we still have enough; never add weak fillers.
  if (selected.length >= 6) {
    const cats = new Set(
      selected.map((c) => c.grammarCategoryId || c.bookTerm)
    );
    if (cats.size < 4) {
      // keep as-is; do not invent more
    }
  }

  // Stable order by passage appearance: sentence order then token index
  return selected.sort((a, b) => {
    if (a.sentenceId !== b.sentenceId) {
      return a.sentenceId.localeCompare(b.sentenceId);
    }
    return a.startTokenIndex - b.startTokenIndex;
  });
}
