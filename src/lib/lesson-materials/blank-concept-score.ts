import type { BlankPartOfSpeech } from "@/lib/lesson-materials/workbook-types";

export type BlankSemanticRole =
  | "theme"
  | "main_claim"
  | "logic"
  | "academic"
  | "context"
  | "collocation";

export type BlankCandidateScore = {
  centrality: number;
  learningValue: number;
  contextualImportance: number;
  reusability: number;
  collocationValue: number;
  commonnessPenalty: number;
  redundancyPenalty: number;
};

export const BLANK_SCORE_KEYS = [
  "centrality",
  "learningValue",
  "contextualImportance",
  "reusability",
  "collocationValue",
  "commonnessPenalty",
  "redundancyPenalty",
] as const;

export function clampScore1to5(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function normalizeBlankScores(
  raw: Partial<BlankCandidateScore> | null | undefined
): BlankCandidateScore {
  return {
    centrality: clampScore1to5(Number(raw?.centrality ?? 3)),
    learningValue: clampScore1to5(Number(raw?.learningValue ?? 3)),
    contextualImportance: clampScore1to5(
      Number(raw?.contextualImportance ?? 3)
    ),
    reusability: clampScore1to5(Number(raw?.reusability ?? 3)),
    collocationValue: clampScore1to5(Number(raw?.collocationValue ?? 2)),
    commonnessPenalty: clampScore1to5(Number(raw?.commonnessPenalty ?? 2)),
    redundancyPenalty: clampScore1to5(Number(raw?.redundancyPenalty ?? 1)),
  };
}

/** finalScore = weighted positives − penalties */
export function computeBlankFinalScore(scores: BlankCandidateScore): number {
  const s = normalizeBlankScores(scores);
  return (
    s.centrality * 4 +
    s.learningValue * 3 +
    s.contextualImportance * 3 +
    s.reusability * 2 +
    s.collocationValue * 2 -
    s.commonnessPenalty * 3 -
    s.redundancyPenalty * 4
  );
}

/** Near-synonym / competition clusters (fallback when AI omits competitionGroup). */
export const BLANK_NEAR_SYNONYM_GROUPS: string[][] = [
  ["worthy", "deserving", "enough", "lovable"],
  ["powerful", "strong", "extreme", "extremely"],
  ["belief", "believe", "faith", "conviction"],
  ["attract", "attraction", "attractor", "magnetic", "attractive"],
  ["affirm", "affirmation", "affirmations"],
  ["desire", "desires", "want", "wants"],
  ["limit", "limiting", "limited"],
  ["result", "results", "outcome", "outcomes"],
  ["thought", "thoughts", "thinking"],
  ["visualize", "visualization", "visualizing"],
  ["manifest", "manifestation"],
  ["movement", "move", "moving"],
  ["anxiety", "anxious", "depression", "depressed"],
  ["run", "skip", "climb", "walk", "jump"],
  ["cues", "cue", "signal", "signals"],
  ["repertoire", "range", "set"],
];

export const DEGREE_ADVERBS = new Set([
  "very",
  "extremely",
  "really",
  "quite",
  "rather",
  "fairly",
  "highly",
  "so",
  "too",
  "pretty",
  "incredibly",
  "totally",
  "completely",
  "absolutely",
  "especially",
  "particularly",
]);

/** Soft-exclude unless AI marks high centrality (≥4) / main_claim. */
export const EASY_WORDS_SOFT = new Set([
  "very",
  "extremely",
  "really",
  "good",
  "bad",
  "big",
  "small",
  "make",
  "have",
  "do",
  "go",
  "get",
  "run",
  "thing",
  "people",
  "physical",
  "system",
  "systems",
]);

const WORD_FAMILY_ROOTS: Array<{ root: string; members: string[] }> = [
  { root: "move", members: ["move", "moves", "moved", "moving", "movement", "movements"] },
  {
    root: "believe",
    members: ["believe", "believes", "believed", "believing", "belief", "beliefs"],
  },
  {
    root: "create",
    members: [
      "create",
      "creates",
      "created",
      "creating",
      "creative",
      "creativity",
      "creation",
    ],
  },
  {
    root: "attract",
    members: [
      "attract",
      "attracts",
      "attracted",
      "attracting",
      "attraction",
      "attractions",
      "attractive",
      "attractor",
      "attractors",
      "magnetic",
    ],
  },
  {
    root: "visualize",
    members: ["visualize", "visualizes", "visualized", "visualizing", "visualization"],
  },
  {
    root: "manifest",
    members: ["manifest", "manifests", "manifested", "manifesting", "manifestation"],
  },
  {
    root: "affirm",
    members: ["affirm", "affirms", "affirmed", "affirming", "affirmation", "affirmations"],
  },
  { root: "limit", members: ["limit", "limits", "limited", "limiting"] },
  { root: "social", members: ["social", "socialize", "socializing", "socialized"] },
  { root: "communicate", members: ["communicate", "communicates", "communicated", "communicating", "communication"] },
  { root: "occupy", members: ["occupy", "occupies", "occupied", "occupying"] },
  { root: "participate", members: ["participate", "participates", "participated", "participating"] },
  { root: "mature", members: ["mature", "matures", "matured", "maturing"] },
];

export function normalizeWordFamily(
  lemma: string,
  explicit?: string | null
): string {
  if (explicit?.trim()) return explicit.trim().toLowerCase();
  const L = lemma.toLowerCase().trim();
  for (const fam of WORD_FAMILY_ROOTS) {
    if (fam.members.includes(L)) return fam.root;
  }
  // light stemming fallback
  return L
    .replace(/tions$/, "t")
    .replace(/tion$/, "t")
    .replace(/ments$/, "m")
    .replace(/ment$/, "m")
    .replace(/ings$/, "ing")
    .replace(/ies$/, "y")
    .replace(/ied$/, "y")
    .replace(/(?:ing|ed|es|s)$/, "");
}

export function synonymClusterId(lemma: string): string | null {
  const L = lemma.toLowerCase();
  for (let i = 0; i < BLANK_NEAR_SYNONYM_GROUPS.length; i++) {
    if (BLANK_NEAR_SYNONYM_GROUPS[i]!.includes(L)) return `syn-${i}`;
  }
  return null;
}

export function sameWordFamily(a: string, b: string): boolean {
  return normalizeWordFamily(a) === normalizeWordFamily(b);
}

export function isSoftEasyWord(lemma: string): boolean {
  const L = lemma.toLowerCase();
  return EASY_WORDS_SOFT.has(L) || DEGREE_ADVERBS.has(L);
}

/** Heuristic scores when AI scores are missing (vocab / legacy cache). */
export function synthesizeScoresForLemma(input: {
  lemma: string;
  partOfSpeech: BlankPartOfSpeech | string;
  vocabLemmas?: Set<string>;
  titleText?: string;
  semanticRole?: BlankSemanticRole | null;
}): BlankCandidateScore {
  const lemma = input.lemma.toLowerCase();
  let centrality = 3;
  let learningValue = 3;
  let contextualImportance = 3;
  let reusability = 3;
  let collocationValue = 2;
  let commonnessPenalty = 2;
  let redundancyPenalty = 1;

  if (input.partOfSpeech === "noun") {
    centrality += 1;
    learningValue += 1;
  }
  if (input.partOfSpeech === "verb") learningValue += 1;
  if (input.vocabLemmas?.has(lemma)) {
    learningValue += 1;
    centrality += 1;
  }
  if (input.titleText?.toLowerCase().includes(lemma)) centrality += 1;
  if (input.semanticRole === "main_claim" || input.semanticRole === "theme") {
    centrality = 5;
    contextualImportance = 5;
  }
  if (DEGREE_ADVERBS.has(lemma)) {
    commonnessPenalty = 5;
    learningValue = 1;
    centrality = 1;
  }
  if (EASY_WORDS_SOFT.has(lemma)) {
    commonnessPenalty = Math.max(commonnessPenalty, 4);
    learningValue = Math.min(learningValue, 2);
  }
  // Prefer head nouns in known collocations
  if (["cues", "repertoire", "belief", "attractor", "vibration", "design"].includes(lemma)) {
    collocationValue = 5;
    centrality = Math.max(centrality, 4);
    learningValue = Math.max(learningValue, 4);
  }
  if (["physical", "system", "powerful", "movement"].includes(lemma)) {
    commonnessPenalty = Math.max(commonnessPenalty, 3);
    collocationValue = Math.min(collocationValue, 2);
  }

  return normalizeBlankScores({
    centrality,
    learningValue,
    contextualImportance,
    reusability,
    collocationValue,
    commonnessPenalty,
    redundancyPenalty,
  });
}

/** @deprecated — maps to finalScore for older call sites */
export function computeConceptScore(input: {
  lemma: string;
  partOfSpeech: string;
  priority: number;
  vocabLemmas?: Set<string>;
  titleText?: string;
}): number {
  const scores = synthesizeScoresForLemma({
    lemma: input.lemma,
    partOfSpeech: input.partOfSpeech,
    vocabLemmas: input.vocabLemmas,
    titleText: input.titleText,
  });
  return computeBlankFinalScore(scores) + input.priority;
}

export function conflictsWithNearSynonym(
  a: { lemma: string; globalWordIndex: number; sentenceId: string; competitionGroup?: string | null },
  b: { lemma: string; globalWordIndex: number; sentenceId: string; competitionGroup?: string | null },
  maxWordDistance = 25
): boolean {
  if (
    a.competitionGroup &&
    b.competitionGroup &&
    a.competitionGroup === b.competitionGroup
  ) {
    return true;
  }
  const ca = synonymClusterId(a.lemma);
  const cb = synonymClusterId(b.lemma);
  if (!ca || ca !== cb) return false;
  if (a.sentenceId === b.sentenceId) return true;
  return Math.abs(a.globalWordIndex - b.globalWordIndex) < maxWordDistance;
}
