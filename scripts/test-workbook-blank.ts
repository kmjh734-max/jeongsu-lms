/**
 * Blank selection v5 unit tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-blank.ts
 */
import assert from "node:assert/strict";
import {
  isBlankCandidateEligible,
  isBlankCandidateEligibleC,
} from "../src/lib/lesson-materials/blank-concept-score";
import { mergeBlankCandidateSources } from "../src/lib/lesson-materials/merge-blank-candidates";
import {
  selectBlankCandidatesByDensity,
  validateBlankCandidates,
} from "../src/lib/lesson-materials/validate-workbook-blank";
import { BLANK_POOL_ALGORITHM_VERSION } from "../src/lib/lesson-materials/workbook-blank-cache";
import {
  computeBlankTargetCount,
  countEnglishWords,
  getBlankTargetRange,
} from "../src/lib/lesson-materials/workbook-types";

assert.equal(
  BLANK_POOL_ALGORITHM_VERSION,
  "blank-selection-v5-density-trace"
);

{
  assert.deepEqual(
    getBlankTargetRange({ englishWordCount: 120, density: "standard" }),
    { low: 17, high: 20 }
  );
  assert.deepEqual(
    getBlankTargetRange({ englishWordCount: 120, density: "high" }),
    { low: 21, high: 25 }
  );
  const t = computeBlankTargetCount({
    englishWordCount: 120,
    density: "standard",
    hintType: "first_letter",
    showTranslation: true,
  });
  assert.ok(t >= 17 && t <= 20, String(t));
}

function mk(
  answerText: string,
  sentenceId: string,
  partOfSpeech: string,
  wordFamily: string,
  semanticRole: string,
  centrality: number,
  extra?: {
    competitionGroup?: string;
    commonnessPenalty?: number;
    learningValue?: number;
    centrality?: number;
    collocationValue?: number;
    contextImportance?: number;
    grade?: "A" | "B" | "C";
    sources?: Array<"ai" | "saved-vocabulary" | "deterministic-fallback">;
  }
) {
  const c = extra?.centrality ?? centrality;
  return {
    candidateId: `${sentenceId}-${answerText}`,
    sentenceId,
    answerText,
    occurrenceIndex: 0,
    lemma: answerText.toLowerCase(),
    wordFamily,
    partOfSpeech,
    meaningKo: answerText,
    grade: extra?.grade ?? (c >= 4 ? "A" : c >= 3 ? "B" : "C"),
    semanticRole,
    competitionGroup: extra?.competitionGroup ?? null,
    sources: extra?.sources ?? ["ai"],
    scores: {
      centrality: c,
      learningValue: extra?.learningValue ?? Math.max(2, c),
      contextImportance: extra?.contextImportance ?? c,
      examUsefulness: Math.max(2, c - 1),
      collocationValue: extra?.collocationValue ?? 3,
      commonnessPenalty: extra?.commonnessPenalty ?? 1,
      redundancyPenalty: 1,
    },
    reasonKo: semanticRole,
    priority: Math.min(5, Math.max(1, c)),
  };
}

function printDiag(
  label: string,
  selected: { lemma: string }[],
  diagnostics: Array<{
    token: string;
    selected: boolean;
    decisionReason: string;
    rejectionCodes: string[];
    grade: string;
  }>
) {
  console.log(`\n=== ${label} selected ===`);
  console.log(selected.map((s) => s.lemma).join(", "));
  console.log(`=== ${label} rejected (sample) ===`);
  for (const d of diagnostics.filter((x) => !x.selected).slice(0, 12)) {
    console.log(
      `- ${d.token} [${d.grade}] ${d.decisionReason} (${d.rejectionCodes.join("|")})`
    );
  }
}

// --- Fixture 1: Law of Attraction (~110+ words) ---
{
  const fixtureSentences = [
    {
      id: "a0",
      english:
        "Perhaps you have heard of the Law of Attraction, which states that like attracts like and that by focusing on positive or negative thoughts, one can bring about positive or negative results in daily life.",
    },
    {
      id: "a1",
      english:
        "The common flaw is that people try to visualize and manifest outcomes without changing their vibration or upgrading limiting patterns.",
    },
    {
      id: "a2",
      english:
        "Our thoughts and spoken words are extremely magnetic, shaping the relationship between desire and experience.",
    },
    {
      id: "a3",
      english: "But the most powerful attractor is our belief system.",
    },
    {
      id: "a4",
      english:
        "You must affirm that you are worthy, lovable, and deserving while challenging limiting beliefs that contradict your desires to upgrade your inner images.",
    },
    {
      id: "a5",
      english:
        "When understanding replaces fear, attraction begins to work with clarity rather than confusion.",
    },
  ];

  const wordCount = countEnglishWords(
    fixtureSentences.map((s) => s.english).join(" ")
  );
  assert.ok(wordCount >= 100, `fixture1 words ${wordCount}`);

  const aiRaw = [
    mk("Attraction", "a0", "noun", "attract", "theme", 5),
    mk("focusing", "a0", "verb", "focus", "logic", 4),
    mk("thoughts", "a0", "noun", "thought", "theme", 4),
    mk("results", "a0", "noun", "result", "logic", 3, { grade: "B" }),
    mk("understanding", "a5", "noun", "understand", "context", 3, {
      grade: "B",
      learningValue: 3,
    }),
    mk("flaw", "a1", "noun", "flaw", "theme", 5, {
      competitionGroup: "common flaw",
      sources: ["ai", "saved-vocabulary"],
    }),
    mk("visualize", "a1", "verb", "visualize", "academic", 4),
    mk("manifest", "a1", "verb", "manifest", "academic", 5),
    mk("vibration", "a1", "noun", "vibration", "theme", 5),
    mk("magnetic", "a2", "adjective", "magnetic", "collocation", 5),
    mk("relationship", "a2", "noun", "relation", "context", 3, { grade: "B" }),
    mk("powerful", "a3", "adjective", "power", "context", 2, {
      commonnessPenalty: 3,
      competitionGroup: "powerful attractor",
      grade: "C",
    }),
    mk("attractor", "a3", "noun", "attract", "main_claim", 5, {
      competitionGroup: "powerful attractor",
    }),
    mk("belief", "a3", "noun", "believe", "main_claim", 5, {
      competitionGroup: "belief system",
    }),
    mk("affirm", "a4", "verb", "affirm", "academic", 4),
    mk("worthy", "a4", "adjective", "worthy", "context", 3, {
      competitionGroup: "worth-group",
      grade: "B",
    }),
    mk("deserving", "a4", "adjective", "deserving", "context", 4, {
      competitionGroup: "worth-group",
    }),
    mk("challenging", "a4", "verb", "challenge", "logic", 3, { grade: "B" }),
    mk("limiting", "a4", "adjective", "limit", "logic", 3, { grade: "B" }),
    mk("contradict", "a4", "verb", "contradict", "logic", 4),
    mk("desires", "a4", "noun", "desire", "theme", 4),
    mk("upgrade", "a4", "verb", "upgrade", "academic", 4),
    mk("images", "a4", "noun", "image", "context", 2, {
      grade: "C",
      commonnessPenalty: 3,
      learningValue: 2,
    }),
  ];

  const merged = mergeBlankCandidateSources({
    aiCandidates: aiRaw,
    sentences: fixtureSentences,
    vocab: [
      { word: "flaw", meaning: "n. 결함", synonyms: [], antonyms: [] },
      { word: "belief", meaning: "n. 신념", synonyms: [], antonyms: [] },
      { word: "attractor", meaning: "n. 끌어당기는 것", synonyms: [], antonyms: [] },
      { word: "manifest", meaning: "v. 나타내다", synonyms: [], antonyms: [] },
    ],
    titleText: "Law of Attraction",
    maxFallback: 40,
  });

  const { valid } = validateBlankCandidates({
    passageId: "belief-pass",
    responsePassageId: "belief-pass",
    sentences: fixtureSentences,
    generatedCandidates: merged.merged,
    recommendedCount: 24,
    coreSentenceIds: ["a3"],
  });

  const flawInPool = valid.some((v) => v.lemma === "flaw");
  const beliefInPool = valid.some((v) => v.lemma === "belief");
  assert.ok(flawInPool, "flaw must enter candidate pool");
  assert.ok(beliefInPool, "belief must enter candidate pool");

  const range = getBlankTargetRange({
    englishWordCount: wordCount,
    density: "standard",
  });
  const standardTarget = computeBlankTargetCount({
    englishWordCount: wordCount,
    density: "standard",
    hintType: "first_letter",
    showTranslation: true,
  });
  const highTarget = computeBlankTargetCount({
    englishWordCount: wordCount,
    density: "high",
    hintType: "first_letter",
    showTranslation: true,
  });
  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );

  const normal = selectBlankCandidatesByDensity(valid, {
    density: "standard",
    standardTarget,
    highTarget,
    targetMinStandard: range.low,
    targetMaxStandard: range.high,
    targetMinHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).low,
    targetMaxHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).high,
    sentenceWordCounts: wc,
    coreSentenceIds: ["a3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
    passageId: "belief-pass",
    totalWordCount: wordCount,
    sourceCounts: {
      ai: merged.aiCandidateCount,
      vocab: merged.savedVocabularyCandidateCount,
      fallback: merged.fallbackCandidateCount,
      merged: merged.merged.length,
    },
  });

  const hard = selectBlankCandidatesByDensity(valid, {
    density: "high",
    standardTarget,
    highTarget,
    targetMinStandard: range.low,
    targetMaxStandard: range.high,
    targetMinHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).low,
    targetMaxHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).high,
    sentenceWordCounts: wc,
    coreSentenceIds: ["a3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
    passageId: "belief-pass",
    totalWordCount: wordCount,
    sourceCounts: {
      ai: merged.aiCandidateCount,
      vocab: merged.savedVocabularyCandidateCount,
      fallback: merged.fallbackCandidateCount,
      merged: merged.merged.length,
    },
  });

  printDiag("fixture1-normal", normal.selected, normal.diagnostics);
  printDiag("fixture1-hard", hard.selected, hard.diagnostics);

  const lemmas = hard.selected.map((c) => c.lemma);
  const coreHits = [
    "flaw",
    "manifest",
    "magnetic",
    "attractor",
    "belief",
    "contradict",
    "upgrade",
  ].filter((w) => lemmas.includes(w) || (w === "attractor" && lemmas.includes("attraction")));
  assert.ok(coreHits.length >= 6, `core>=6 got ${coreHits.join(",")}; all=${lemmas.join(",")}`);

  if (lemmas.includes("understanding")) {
    assert.ok(lemmas.includes("flaw"), "understanding without flaw");
  }
  if (lemmas.includes("powerful")) {
    assert.ok(lemmas.includes("attractor"), "powerful without attractor");
  }
  if (lemmas.includes("images")) {
    assert.ok(
      lemmas.includes("affirm") || lemmas.includes("belief"),
      "images without affirm/belief"
    );
  }

  for (const c of normal.selected) {
    assert.ok(
      hard.selected.some(
        (h) => h.sentenceId === c.sentenceId && h.start === c.start
      )
    );
  }

  const flawDiag = hard.diagnostics.find((d) => d.lemma === "flaw");
  console.log(
    "flaw diagnostic:",
    flawDiag
      ? {
          selected: flawDiag.selected,
          reason: flawDiag.decisionReason,
          sources: flawDiag.sources,
        }
      : "MISSING FROM DIAG"
  );
  const beliefDiag = hard.diagnostics.find((d) => d.lemma === "belief");
  console.log(
    "belief diagnostic:",
    beliefDiag
      ? {
          selected: beliefDiag.selected,
          reason: beliefDiag.decisionReason,
          sources: beliefDiag.sources,
        }
      : "MISSING"
  );

  console.log(
    `fixture1 counts normal=${normal.selected.length} (min ${range.low}) hard=${hard.selected.length} words=${wordCount}`
  );
  console.log(
    "fixture1 C fillers:",
    hard.selected.filter((c) => c.grade === "C").map((c) => c.lemma)
  );
}

// --- Fixture 2: movement / devices ---
{
  const fixtureSentences = [
    {
      id: "b0",
      english:
        "We no longer participate in wonder; glowing screens occupy us and keep us captive to devices that quietly replace how we socialize with friends and family.",
    },
    {
      id: "b1",
      english:
        "Without physical cues from a rich movement repertoire, children struggle to communicate clearly and mature emotionally in complex social settings.",
    },
    {
      id: "b2",
      english:
        "Kids may run, skip, or climb across limited square footage, yet still face anxiety, depression, and related diseases created by sedentary habits.",
    },
    {
      id: "b3",
      english:
        "We are getting further from our design; movement is extraordinary when we reclaim it, and moving bodies restore focus better than another glowing screen.",
    },
    {
      id: "b4",
      english:
        "Play and life still matter, but design-centered movement practice rebuilds the extraordinary capacity we were born with.",
    },
  ];

  const wordCount = countEnglishWords(
    fixtureSentences.map((s) => s.english).join(" ")
  );
  assert.ok(wordCount >= 100, `fixture2 words ${wordCount}`);

  const aiRaw = [
    mk("participate", "b0", "verb", "participate", "logic", 4),
    mk("wonder", "b0", "noun", "wonder", "theme", 4),
    mk("occupy", "b0", "verb", "occupy", "logic", 4),
    mk("captive", "b0", "adjective", "captive", "academic", 4),
    mk("devices", "b0", "noun", "device", "theme", 4),
    mk("socialize", "b0", "verb", "social", "academic", 4),
    mk("physical", "b1", "adjective", "physical", "context", 2, {
      commonnessPenalty: 3,
      competitionGroup: "physical cues",
      grade: "C",
    }),
    mk("cues", "b1", "noun", "cue", "collocation", 5, {
      competitionGroup: "physical cues",
      collocationValue: 5,
    }),
    mk("movement", "b1", "noun", "move", "theme", 3, {
      competitionGroup: "movement repertoire",
      grade: "B",
      commonnessPenalty: 2,
    }),
    mk("repertoire", "b1", "noun", "repertoire", "collocation", 5, {
      competitionGroup: "movement repertoire",
      collocationValue: 5,
      sources: ["ai", "saved-vocabulary"],
    }),
    mk("communicate", "b1", "verb", "communicate", "academic", 4),
    mk("mature", "b1", "verb", "mature", "academic", 5, {
      competitionGroup: "mature emotionally",
    }),
    mk("emotionally", "b1", "adverb", "emotion", "context", 2, {
      commonnessPenalty: 3,
      competitionGroup: "mature emotionally",
      grade: "C",
    }),
    mk("run", "b2", "verb", "run", "context", 1, {
      commonnessPenalty: 4,
      grade: "C",
      learningValue: 1,
    }),
    mk("climb", "b2", "verb", "climb", "context", 3, { grade: "B" }),
    mk("anxiety", "b2", "noun", "anxiety", "theme", 5),
    mk("depression", "b2", "noun", "depression", "theme", 4),
    mk("diseases", "b2", "noun", "disease", "theme", 4),
    mk("created", "b2", "verb", "create", "logic", 3, { grade: "B" }),
    mk("design", "b3", "noun", "design", "main_claim", 5),
    mk("extraordinary", "b3", "adjective", "extraordinary", "main_claim", 5),
    mk("movement", "b3", "noun", "move", "main_claim", 5),
    mk("moving", "b3", "verb", "move", "context", 2, {
      grade: "C",
      commonnessPenalty: 3,
      learningValue: 2,
    }),
    mk("life", "b4", "noun", "life", "context", 2, {
      grade: "C",
      commonnessPenalty: 3,
      learningValue: 1,
    }),
  ];

  const merged = mergeBlankCandidateSources({
    aiCandidates: aiRaw,
    sentences: fixtureSentences,
    vocab: [
      { word: "repertoire", meaning: "n. 레퍼토리", synonyms: [], antonyms: [] },
      { word: "design", meaning: "n. 설계", synonyms: [], antonyms: [] },
      { word: "extraordinary", meaning: "a. 非凡한", synonyms: [], antonyms: [] },
      { word: "mature", meaning: "v. 성숙하다", synonyms: [], antonyms: [] },
    ],
    titleText: "Born to move",
    maxFallback: 40,
  });

  const { valid } = validateBlankCandidates({
    passageId: "move-pass",
    responsePassageId: "move-pass",
    sentences: fixtureSentences,
    generatedCandidates: merged.merged,
    recommendedCount: 24,
    coreSentenceIds: ["b3", "b4"],
  });

  const repertoireInPool = valid.some((v) => v.lemma === "repertoire");
  assert.ok(repertoireInPool, "repertoire must enter pool");
  const designInPool = valid.some((v) => v.lemma === "design");
  const extraordinaryInPool = valid.some((v) => v.lemma === "extraordinary");
  console.log("design in pool?", designInPool);
  console.log("extraordinary in pool?", extraordinaryInPool);

  const range = getBlankTargetRange({
    englishWordCount: wordCount,
    density: "standard",
  });
  const standardTarget = computeBlankTargetCount({
    englishWordCount: wordCount,
    density: "standard",
    hintType: "first_letter",
    showTranslation: true,
  });
  const highTarget = computeBlankTargetCount({
    englishWordCount: wordCount,
    density: "high",
    hintType: "first_letter",
    showTranslation: true,
  });
  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );

  const normal = selectBlankCandidatesByDensity(valid, {
    density: "standard",
    standardTarget,
    highTarget,
    targetMinStandard: range.low,
    targetMaxStandard: range.high,
    targetMinHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).low,
    targetMaxHigh: getBlankTargetRange({
      englishWordCount: wordCount,
      density: "high",
    }).high,
    sentenceWordCounts: wc,
    coreSentenceIds: ["b3", "b4"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
    passageId: "move-pass",
    totalWordCount: wordCount,
    sourceCounts: {
      ai: merged.aiCandidateCount,
      vocab: merged.savedVocabularyCandidateCount,
      fallback: merged.fallbackCandidateCount,
      merged: merged.merged.length,
    },
  });

  printDiag("fixture2-normal", normal.selected, normal.diagnostics);

  const lemmas = normal.selected.map((c) => c.lemma);
  const key4 = ["repertoire", "cues", "mature", "design", "extraordinary"].filter(
    (w) => lemmas.includes(w)
  );
  assert.ok(key4.length >= 4, `key4 ${key4.join(",")}`);

  const core15 = [
    "participate",
    "wonder",
    "occupy",
    "captive",
    "devices",
    "socialize",
    "cues",
    "repertoire",
    "communicate",
    "mature",
    "anxiety",
    "diseases",
    "design",
    "extraordinary",
    "movement",
  ];
  const hit15 = core15.filter((w) => lemmas.includes(w));
  assert.ok(hit15.length >= 10, `core15 hit ${hit15.length}: ${hit15.join(",")}`);

  if (
    normal.selected.some((c) => c.lemma === "movement" && c.sentenceId === "b1")
  ) {
    assert.ok(lemmas.includes("repertoire"));
  }
  if (lemmas.includes("emotionally")) {
    assert.ok(lemmas.includes("mature"));
  }
  if (lemmas.includes("life")) {
    assert.ok(
      lemmas.includes("movement") ||
        lemmas.includes("design") ||
        lemmas.includes("extraordinary")
    );
  }
  const moveForms = normal.selected.filter((c) => c.wordFamily === "move");
  assert.ok(
    moveForms.length <= 1,
    `move family dup: ${moveForms.map((c) => c.lemma).join(",")}`
  );
  if (lemmas.includes("run")) {
    assert.ok(
      lemmas.includes("anxiety") ||
        lemmas.includes("diseases") ||
        lemmas.includes("design") ||
        lemmas.includes("extraordinary")
    );
  }

  const repDiag = normal.diagnostics.find((d) => d.lemma === "repertoire");
  const movingDiag = normal.diagnostics.find((d) => d.lemma === "moving");
  const movementDiag = normal.diagnostics.find(
    (d) => d.lemma === "movement" && d.selected
  );
  console.log("repertoire:", {
    selected: repDiag?.selected,
    reason: repDiag?.decisionReason,
  });
  console.log("moving:", {
    selected: movingDiag?.selected,
    reason: movingDiag?.decisionReason,
    codes: movingDiag?.rejectionCodes,
  });
  console.log("selected movement:", movementDiag?.token, movementDiag?.decisionReason);
  console.log(
    `fixture2 counts normal=${normal.selected.length} (min ${range.low}) words=${wordCount}`
  );
  console.log(
    "fixture2 C fillers:",
    normal.selected.filter((c) => c.grade === "C").map((c) => c.lemma)
  );
}

{
  assert.equal(
    isBlankCandidateEligible({
      centrality: 2,
      learningValue: 2,
      contextImportance: 2,
      examUsefulness: 2,
      collocationValue: 1,
      commonnessPenalty: 4,
      redundancyPenalty: 1,
    }),
    false
  );
  assert.equal(
    isBlankCandidateEligibleC({
      centrality: 2,
      learningValue: 2,
      contextImportance: 2,
      examUsefulness: 2,
      collocationValue: 1,
      commonnessPenalty: 3,
      redundancyPenalty: 1,
    }),
    true
  );
}

console.log("\nok: workbook blank selection v5 tests passed");
