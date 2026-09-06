import type { BlankPartOfSpeech } from "@/lib/lesson-materials/workbook-types";

export type BlankSemanticRole =
  | "theme"
  | "main_claim"
  | "logic"
  | "academic"
  | "context"
  | "collocation";

export type BlankGrade = "A" | "B" | "C";

export type BlankCandidateScore = {
  centrality: number;
  learningValue: number;
  /** Alias accepted from AI: contextImportance */
  contextImportance: number;
  examUsefulness: number;
  collocationValue: number;
  commonnessPenalty: number;
  redundancyPenalty: number;
};

export function clampScore0to5(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}

export function normalizeBlankScores(
  raw: Partial<BlankCandidateScore> & {
    contextualImportance?: number;
    reusability?: number;
  } | null | undefined
): BlankCandidateScore {
  const contextImportance = clampScore0to5(
    Number(
      raw?.contextImportance ??
        raw?.contextualImportance ??
        3
    )
  );
  const examUsefulness = clampScore0to5(
    Number(raw?.examUsefulness ?? raw?.reusability ?? 3)
  );
  return {
    centrality: clampScore0to5(Number(raw?.centrality ?? 3)),
    learningValue: clampScore0to5(Number(raw?.learningValue ?? 3)),
    contextImportance,
    examUsefulness,
    collocationValue: clampScore0to5(Number(raw?.collocationValue ?? 2)),
    commonnessPenalty: clampScore0to5(Number(raw?.commonnessPenalty ?? 2)),
    redundancyPenalty: clampScore0to5(Number(raw?.redundancyPenalty ?? 1)),
  };
}

/** v4 score formula */
export function computeBlankFinalScore(scores: BlankCandidateScore): number {
  const s = normalizeBlankScores(scores);
  return (
    s.centrality * 4 +
    s.learningValue * 3 +
    s.contextImportance * 3 +
    s.examUsefulness * 2 +
    s.collocationValue * 2 -
    s.commonnessPenalty * 4 -
    s.redundancyPenalty * 4
  );
}

/** A/B: learning-value gate. C fillers use isBlankCandidateEligibleC. */
export function isBlankCandidateEligible(scores: BlankCandidateScore): boolean {
  const s = normalizeBlankScores(scores);
  const strong =
    s.centrality >= 3 || s.learningValue >= 3 || s.contextImportance >= 3;
  return strong && s.commonnessPenalty <= 3 && s.redundancyPenalty <= 3;
}

/** C-grade filler: content words only; never function-word level commons. */
export function isBlankCandidateEligibleC(scores: BlankCandidateScore): boolean {
  const s = normalizeBlankScores(scores);
  if (s.commonnessPenalty >= 5) return false;
  return (
    s.learningValue >= 2 ||
    s.contextImportance >= 2 ||
    s.centrality >= 2
  );
}

export function parseBlankGrade(raw: unknown): BlankGrade | null {
  const g = String(raw ?? "").trim().toUpperCase();
  if (g === "A" || g === "B" || g === "C") return g;
  return null;
}

export function inferGradeFromScores(scores: BlankCandidateScore): BlankGrade {
  const s = normalizeBlankScores(scores);
  if (s.centrality >= 4 || s.learningValue >= 4 || s.contextImportance >= 4) {
    if (s.commonnessPenalty <= 3) return "A";
  }
  if (isBlankCandidateEligible(s) && s.commonnessPenalty <= 2) return "B";
  if (isBlankCandidateEligibleC(s)) return "C";
  return "C";
}

export const BLANK_NEAR_SYNONYM_GROUPS: string[][] = [
  ["worthy", "deserving", "enough", "lovable"],
  ["powerful", "strong", "extreme", "extremely"],
  ["belief", "believe", "beliefs", "faith", "conviction"],
  ["attract", "attraction", "attractor", "attractive"],
  ["magnetic", "magnetism"],
  ["affirm", "affirmation", "affirmations"],
  ["desire", "desires", "want", "wants"],
  ["limit", "limiting", "limited"],
  ["result", "results", "outcome", "outcomes"],
  ["thought", "thoughts", "thinking"],
  ["visualize", "visualization", "visualizing"],
  ["manifest", "manifestation"],
  ["movement", "move", "moving"],
  ["anxiety", "anxious"],
  ["depression", "depressed"],
  ["disease", "diseases"],
  ["run", "skip", "climb", "walk", "jump"],
  ["cues", "cue", "signal", "signals"],
  ["repertoire", "range", "set"],
  ["everywhere", "nowhere", "anywhere"],
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
  "more",
  "most",
  "many",
]);

/** Soft / typically low-value — raises commonnessPenalty in heuristics, not a hard ban list. */
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
  "kids",
  "play",
  "life",
  "create",
  "negative",
  "level",
  "more",
  "many",
  "same",
  "today",
  "everywhere",
  "nowhere",
  "anywhere",
  "emotionally",
  "common",
  "powerful",
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
    ],
  },
  {
    root: "magnetic",
    members: ["magnetic", "magnetism", "magnetically"],
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
  {
    root: "communicate",
    members: [
      "communicate",
      "communicates",
      "communicated",
      "communicating",
      "communication",
    ],
  },
  { root: "occupy", members: ["occupy", "occupies", "occupied", "occupying"] },
  {
    root: "participate",
    members: ["participate", "participates", "participated", "participating"],
  },
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

export function synthesizeScoresForLemma(input: {
  lemma: string;
  partOfSpeech: BlankPartOfSpeech | string;
  vocabLemmas?: Set<string>;
  titleText?: string;
  semanticRole?: BlankSemanticRole | null;
  grade?: BlankGrade | null;
}): BlankCandidateScore {
  const lemma = input.lemma.toLowerCase();
  let centrality = 3;
  let learningValue = 3;
  let contextImportance = 3;
  const examUsefulness = 3;
  let collocationValue = 2;
  let commonnessPenalty = 1;
  const redundancyPenalty = 1;

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
    contextImportance = 5;
  }
  if (DEGREE_ADVERBS.has(lemma) || isSoftEasyWord(lemma)) {
    commonnessPenalty = 4;
    learningValue = Math.min(learningValue, 2);
    centrality = Math.min(centrality, 2);
  }
  // Prefer canonical noun forms within a family when scoring heuristically
  if (lemma === "moving" || lemma === "move") {
    commonnessPenalty = Math.max(commonnessPenalty, 3);
    learningValue = Math.min(learningValue, 3);
  }
  if (lemma === "movement" || lemma === "movements") {
    centrality = Math.max(centrality, 4);
    learningValue = Math.max(learningValue, 4);
    commonnessPenalty = Math.min(commonnessPenalty, 1);
  }
  if (
    [
      "cues",
      "repertoire",
      "belief",
      "beliefs",
      "attractor",
      "vibration",
      "design",
      "flaw",
      "manifest",
      "extraordinary",
      "mature",
      "contradict",
      "upgrade",
    ].includes(lemma)
  ) {
    collocationValue = 5;
    centrality = Math.max(centrality, 4);
    learningValue = Math.max(learningValue, 4);
    commonnessPenalty = 0;
  }
  if (
    ["physical", "system", "powerful", "common", "level", "create", "nowhere", "everywhere", "run", "life"].includes(
      lemma
    )
  ) {
    commonnessPenalty = Math.max(commonnessPenalty, 3);
    collocationValue = Math.min(collocationValue, 2);
  }
  if (input.grade === "A") {
    centrality = Math.max(centrality, 4);
    learningValue = Math.max(learningValue, 4);
    commonnessPenalty = Math.min(commonnessPenalty, 1);
  }
  if (input.grade === "C") {
    commonnessPenalty = Math.max(commonnessPenalty, 2);
  }

  return normalizeBlankScores({
    centrality,
    learningValue,
    contextImportance,
    examUsefulness,
    collocationValue,
    commonnessPenalty,
    redundancyPenalty,
  });
}

/** @deprecated */
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
  a: {
    lemma: string;
    globalWordIndex: number;
    sentenceId: string;
    competitionGroup?: string | null;
  },
  b: {
    lemma: string;
    globalWordIndex: number;
    sentenceId: string;
    competitionGroup?: string | null;
  },
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
