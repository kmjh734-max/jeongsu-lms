/** Near-synonym / same-concept clusters — at most one blank from a cluster when close. */
export const BLANK_NEAR_SYNONYM_GROUPS: string[][] = [
  ["worthy", "deserving", "enough", "lovable"],
  ["powerful", "strong", "extreme", "extremely"],
  ["belief", "believe", "faith", "conviction"],
  ["attract", "attraction", "attractor", "magnetic"],
  ["affirm", "affirmation", "affirmations"],
  ["desire", "desires", "want", "wants"],
  ["limit", "limiting", "limited"],
  ["result", "results", "outcome", "outcomes"],
  ["thought", "thoughts", "thinking"],
  ["visualize", "visualization", "visualizing"],
  ["manifest", "manifestation"],
  ["movement", "move", "moving"],
  ["anxiety", "anxious", "depression", "depressed"],
];

const GENERIC_ADJECTIVES = new Set([
  "powerful",
  "beautiful",
  "important",
  "great",
  "good",
  "bad",
  "big",
  "small",
  "new",
  "old",
  "true",
  "false",
  "common",
  "special",
  "ordinary",
  "extraordinary",
  "successful",
  "passionate",
  "loving",
  "available",
  "challenging",
]);

const CONCEPT_NOUN_BOOST = new Set([
  "belief",
  "attraction",
  "vibration",
  "attractor",
  "flaw",
  "design",
  "movement",
  "repertoire",
  "anxiety",
  "disease",
  "diseases",
  "devices",
  "manifest",
  "affirmation",
]);

export function synonymClusterId(lemma: string): string | null {
  const L = lemma.toLowerCase();
  for (let i = 0; i < BLANK_NEAR_SYNONYM_GROUPS.length; i++) {
    if (BLANK_NEAR_SYNONYM_GROUPS[i]!.includes(L)) return `syn-${i}`;
  }
  return null;
}

export function computeConceptScore(input: {
  lemma: string;
  partOfSpeech: string;
  priority: number;
  vocabLemmas?: Set<string>;
  titleText?: string;
}): number {
  const lemma = input.lemma.toLowerCase();
  let score = input.priority;
  if (input.partOfSpeech === "noun") score += 2;
  if (input.partOfSpeech === "verb") score += 1.5;
  if (CONCEPT_NOUN_BOOST.has(lemma)) score += 3;
  if (input.vocabLemmas?.has(lemma)) score += 2;
  if (input.titleText?.toLowerCase().includes(lemma)) score += 1.5;
  if (GENERIC_ADJECTIVES.has(lemma) && input.partOfSpeech === "adjective") {
    score -= 2;
  }
  return score;
}

/** True if two candidates are near-synonyms and too close in the passage. */
export function conflictsWithNearSynonym(
  a: { lemma: string; globalWordIndex: number; sentenceId: string },
  b: { lemma: string; globalWordIndex: number; sentenceId: string },
  maxWordDistance = 25
): boolean {
  const ca = synonymClusterId(a.lemma);
  const cb = synonymClusterId(b.lemma);
  if (!ca || ca !== cb) return false;
  if (a.sentenceId === b.sentenceId) return true;
  return Math.abs(a.globalWordIndex - b.globalWordIndex) < maxWordDistance;
}
