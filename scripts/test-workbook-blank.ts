/**
 * Blank selection v4 unit tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-blank.ts
 */
import assert from "node:assert/strict";
import {
  computeBlankFinalScore,
  conflictsWithNearSynonym,
  isBlankCandidateEligible,
} from "../src/lib/lesson-materials/blank-concept-score";
import { assessWorkbookTranslation } from "../src/lib/lesson-materials/refine-workbook-translation";
import { buildBlankCandidatesFromVocab } from "../src/lib/lesson-materials/build-blank-candidates-from-vocab";
import {
  assignBlankNumbers,
  buildBlankTokensForSentence,
  restorePassageFromTokens,
} from "../src/lib/lesson-materials/insert-workbook-blanks";
import {
  findExactWordOccurrences,
  isExcludedBlankWord,
  selectBlankCandidatesByDensity,
  validateBlankCandidates,
} from "../src/lib/lesson-materials/validate-workbook-blank";
import { BLANK_POOL_ALGORITHM_VERSION } from "../src/lib/lesson-materials/workbook-blank-cache";
import {
  computeBlankTargetCount,
  countEnglishWords,
  getBlankTargetRange,
  getMaxBlanksForSentence,
} from "../src/lib/lesson-materials/workbook-types";

assert.equal(BLANK_POOL_ALGORITHM_VERSION, "blank-selection-v4");

const s0 =
  "Perhaps you have heard of the Law of Attraction and its magnetic power.";
const s1 =
  "Belief systems are extremely magnetic and more powerful than affirmations.";

const sentences = [
  { id: "s0", english: s0 },
  { id: "s1", english: s1 },
];

{
  const hits = findExactWordOccurrences(s0, "Attraction");
  assert.equal(hits.length, 1);
  assert.equal(s0.slice(hits[0]!.start, hits[0]!.end), "Attraction");
}

{
  const raw = [
    {
      candidateId: "b1",
      sentenceId: "s0",
      answerText: "Attraction",
      occurrenceIndex: 0,
      lemma: "attraction",
      wordFamily: "attract",
      partOfSpeech: "noun",
      meaningKo: "끌어당김",
      grade: "A",
      semanticRole: "theme",
      competitionGroup: null,
      scores: {
        centrality: 5,
        learningValue: 5,
        contextImportance: 4,
        examUsefulness: 4,
        collocationValue: 3,
        commonnessPenalty: 1,
        redundancyPenalty: 1,
      },
      reasonKo: "주제 핵심 명사",
      priority: 5,
    },
    {
      candidateId: "b2",
      sentenceId: "s1",
      answerText: "Belief",
      occurrenceIndex: 0,
      lemma: "belief",
      wordFamily: "believe",
      partOfSpeech: "noun",
      meaningKo: "신념",
      grade: "A",
      semanticRole: "main_claim",
      competitionGroup: null,
      scores: {
        centrality: 5,
        learningValue: 5,
        contextImportance: 5,
        examUsefulness: 4,
        collocationValue: 4,
        commonnessPenalty: 0,
        redundancyPenalty: 1,
      },
      reasonKo: "중심 주장",
      priority: 5,
    },
    {
      candidateId: "b3",
      sentenceId: "s1",
      answerText: "extremely",
      occurrenceIndex: 0,
      lemma: "extremely",
      wordFamily: "extreme",
      partOfSpeech: "adverb",
      meaningKo: "극도로",
      grade: "C",
      semanticRole: "context",
      competitionGroup: null,
      scores: {
        centrality: 1,
        learningValue: 1,
        contextImportance: 1,
        examUsefulness: 1,
        collocationValue: 0,
        commonnessPenalty: 5,
        redundancyPenalty: 1,
      },
      reasonKo: "정도부사",
      priority: 1,
    },
  ];
  const { valid } = validateBlankCandidates({
    passageId: "p1",
    responsePassageId: "p1",
    sentences,
    generatedCandidates: raw,
    recommendedCount: 10,
  });
  assert.ok(valid.some((v) => v.lemma === "belief"));
  assert.ok(!valid.some((v) => v.lemma === "extremely"));
  const tokens = buildBlankTokensForSentence({
    sentence: s1,
    blanks: valid.filter((v) => v.sentenceId === "s1").slice(0, 1),
    numberByKey: assignBlankNumbers(
      valid.filter((v) => v.sentenceId === "s1").slice(0, 1),
      ["s1"]
    ),
    hintType: "first_letter",
  });
  assert.ok(tokens.some((t) => t.type === "blank"));
  const blank = tokens.find((t) => t.type === "blank");
  assert.ok(blank && blank.type === "blank" && blank.firstLetter === "B");
  assert.equal(restorePassageFromTokens(tokens), s1);
}

{
  // v4 target ranges
  assert.deepEqual(getBlankTargetRange({ englishWordCount: 80, density: "standard" }), {
    low: 10,
    high: 13,
  });
  assert.deepEqual(getBlankTargetRange({ englishWordCount: 120, density: "standard" }), {
    low: 14,
    high: 17,
  });
  assert.deepEqual(getBlankTargetRange({ englishWordCount: 180, density: "high" }), {
    low: 22,
    high: 26,
  });
  assert.deepEqual(getBlankTargetRange({ englishWordCount: 220, density: "high" }), {
    low: 26,
    high: 32,
  });
  const n = 120;
  const std = computeBlankTargetCount({
    englishWordCount: n,
    density: "standard",
    hintType: "first_letter",
    showTranslation: true,
  });
  const hard = computeBlankTargetCount({
    englishWordCount: n,
    density: "high",
    hintType: "first_letter",
    showTranslation: true,
  });
  assert.ok(std >= 14 && std <= 17, String(std));
  assert.ok(hard >= 18 && hard <= 22, String(hard));
  assert.ok(hard > std);
  assert.equal(getMaxBlanksForSentence(10, "high"), 2);
  assert.equal(getMaxBlanksForSentence(20, "high"), 3);
  assert.equal(getMaxBlanksForSentence(30, "high"), 4);
}

{
  const longEn =
    "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.";
  const truncatedKo =
    "아마도 당신은 ‘유사한 것이 유사한 것을 끌어당긴다’고 말하는 끌어당김의 법칙에 대해 들어본 적이 있을 것입니다.";
  assert.equal(assessWorkbookTranslation(longEn, truncatedKo).ok, false);
  assert.equal(isExcludedBlankWord("extremely"), true);
  assert.equal(isExcludedBlankWord("belief"), false);
}

{
  assert.equal(
    conflictsWithNearSynonym(
      { lemma: "worthy", globalWordIndex: 10, sentenceId: "s1" },
      { lemma: "deserving", globalWordIndex: 12, sentenceId: "s1" }
    ),
    true
  );
  assert.equal(
    isBlankCandidateEligible({
      centrality: 2,
      learningValue: 2,
      contextImportance: 2,
      examUsefulness: 2,
      collocationValue: 1,
      commonnessPenalty: 3,
      redundancyPenalty: 1,
    }),
    false
  );
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
    examUsefulness?: number;
    grade?: "A" | "B" | "C";
    redundancyPenalty?: number;
  }
) {
  const c = extra?.centrality ?? centrality;
  const scores = {
    centrality: c,
    learningValue: extra?.learningValue ?? Math.max(2, c),
    contextImportance: extra?.contextImportance ?? c,
    examUsefulness: extra?.examUsefulness ?? Math.max(2, c - 1),
    collocationValue: extra?.collocationValue ?? 3,
    commonnessPenalty: extra?.commonnessPenalty ?? 1,
    redundancyPenalty: extra?.redundancyPenalty ?? 1,
  };
  return {
    candidateId: `${sentenceId}-${answerText}`,
    sentenceId,
    answerText,
    occurrenceIndex: 0,
    lemma: answerText.toLowerCase(),
    wordFamily,
    partOfSpeech,
    meaningKo: answerText,
    grade: extra?.grade ?? (c >= 4 ? "A" : "B"),
    semanticRole,
    competitionGroup: extra?.competitionGroup ?? null,
    scores,
    reasonKo: semanticRole,
    priority: Math.min(5, Math.max(1, c)),
  };
}

// --- Fixture 1: belief / attraction ---
{
  const claim =
    "But the most powerful attractor is our belief system.";
  const fixtureSentences = [
    {
      id: "a0",
      english:
        "Perhaps you have heard of the Law of Attraction, which states that like attracts like and that by focusing on positive or negative thoughts, one can bring about positive or negative results.",
    },
    {
      id: "a1",
      english:
        "The common flaw is that people try to visualize and manifest without changing their vibration.",
    },
    {
      id: "a2",
      english: "Our thoughts and words are extremely magnetic.",
    },
    { id: "a3", english: claim },
    {
      id: "a4",
      english:
        "You must affirm that you are worthy, lovable, and deserving while challenging limiting beliefs that contradict your desires to upgrade.",
    },
  ];

  const raw = [
    mk("focusing", "a0", "verb", "focus", "logic", 4),
    mk("thoughts", "a0", "noun", "thought", "theme", 4),
    mk("results", "a0", "noun", "result", "logic", 3, { grade: "B" }),
    mk("negative", "a0", "adjective", "negative", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
      grade: "B",
    }),
    mk("flaw", "a1", "noun", "flaw", "theme", 5, {
      competitionGroup: "common flaw",
    }),
    mk("common", "a1", "adjective", "common", "context", 2, {
      competitionGroup: "common flaw",
      commonnessPenalty: 3,
      learningValue: 2,
    }),
    mk("visualize", "a1", "verb", "visualize", "academic", 5),
    mk("manifest", "a1", "verb", "manifest", "academic", 5),
    mk("vibration", "a1", "noun", "vibration", "theme", 5),
    mk("level", "a1", "noun", "level", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
    }),
    mk("create", "a1", "verb", "create", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
    }),
    mk("magnetic", "a2", "adjective", "magnetic", "collocation", 5),
    mk("powerful", "a3", "adjective", "power", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
      competitionGroup: "powerful attractor",
    }),
    mk("attractor", "a3", "noun", "attract", "main_claim", 5, {
      competitionGroup: "powerful attractor",
    }),
    mk("belief", "a3", "noun", "believe", "main_claim", 5, {
      competitionGroup: "belief system",
    }),
    mk("system", "a3", "noun", "system", "context", 2, {
      competitionGroup: "belief system",
      commonnessPenalty: 3,
      learningValue: 2,
    }),
    mk("affirm", "a4", "verb", "affirm", "academic", 4),
    mk("worthy", "a4", "adjective", "worthy", "context", 3, {
      competitionGroup: "worth-group",
      grade: "B",
    }),
    mk("lovable", "a4", "adjective", "lovable", "context", 2, {
      competitionGroup: "worth-group",
      commonnessPenalty: 2,
      grade: "B",
    }),
    mk("deserving", "a4", "adjective", "deserving", "context", 4, {
      competitionGroup: "worth-group",
    }),
    mk("contradict", "a4", "verb", "contradict", "logic", 4),
    mk("desires", "a4", "noun", "desire", "theme", 4),
    mk("upgrade", "a4", "verb", "upgrade", "academic", 4),
  ];

  const { valid } = validateBlankCandidates({
    passageId: "belief-pass",
    responsePassageId: "belief-pass",
    sentences: fixtureSentences,
    generatedCandidates: raw,
    recommendedCount: 24,
    density: "high",
    coreSentenceIds: ["a3"],
  });

  assert.ok(!valid.some((v) => v.lemma === "extremely"));
  assert.ok(!valid.some((v) => v.lemma === "powerful"));
  assert.ok(!valid.some((v) => v.lemma === "level"));
  assert.ok(!valid.some((v) => v.lemma === "create"));
  assert.ok(!valid.some((v) => v.lemma === "common"));
  assert.ok(!valid.some((v) => v.lemma === "system"));

  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );
  const wordCount = countEnglishWords(
    fixtureSentences.map((s) => s.english).join(" ")
  );
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

  const normal = selectBlankCandidatesByDensity(valid, {
    density: "standard",
    standardTarget,
    highTarget,
    sentenceWordCounts: wc,
    coreSentenceIds: ["a3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });
  const hard = selectBlankCandidatesByDensity(valid, {
    density: "high",
    standardTarget,
    highTarget,
    sentenceWordCounts: wc,
    coreSentenceIds: ["a3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });

  const normalKeys = new Set(
    normal.selected.map((c) => `${c.sentenceId}:${c.start}`)
  );
  for (const c of normal.selected) {
    assert.ok(
      hard.selected.some(
        (h) => h.sentenceId === c.sentenceId && h.start === c.start
      ),
      `normal ⊆ hard missing ${c.lemma}`
    );
  }
  assert.ok(hard.selected.length >= normal.selected.length);

  const lemmas = hard.selected.map((c) => c.lemma);
  const coreHits = ["flaw", "manifest", "magnetic", "belief", "attractor"].filter(
    (w) => lemmas.includes(w)
  );
  assert.ok(coreHits.length >= 3, `core majority: ${lemmas.join(",")}`);
  assert.ok(
    lemmas.includes("belief") || lemmas.includes("attractor"),
    `claim sentence: ${lemmas.join(",")}`
  );
  assert.ok(!lemmas.includes("powerful") || lemmas.includes("attractor"));
  assert.ok(!lemmas.includes("level") || lemmas.includes("vibration"));
  assert.ok(
    !lemmas.includes("create") ||
      lemmas.includes("affirm") ||
      lemmas.includes("belief")
  );
  const worthCount = ["worthy", "lovable", "deserving"].filter((w) =>
    lemmas.includes(w)
  ).length;
  assert.ok(worthCount <= 2, `parallel: ${lemmas.join(",")}`);
  console.log("fixture1 normal:", normal.selected.map((c) => c.lemma).join(", "));
  console.log("fixture1 hard:", lemmas.join(", "));
  console.log(
    `fixture1 counts normal=${normal.selected.length}/${standardTarget} hard=${hard.selected.length}/${highTarget} (words=${wordCount})`
  );
  void normalKeys;
  void computeBlankFinalScore;
}

// --- Fixture 2: movement / devices ---
{
  const fixtureSentences = [
    {
      id: "b0",
      english:
        "We no longer participate in wonder; screens occupy us and keep us captive to devices that replace how we socialize.",
    },
    {
      id: "b1",
      english:
        "Without physical cues from a rich movement repertoire, children struggle to communicate and mature emotionally.",
    },
    {
      id: "b2",
      english:
        "Kids may run, skip, or climb everywhere and nowhere, yet still face anxiety and diseases.",
    },
    {
      id: "b3",
      english:
        "We are getting further from our design; movement is extraordinary when we reclaim it. Play and life matter, but movement comes first.",
    },
  ];

  const raw = [
    mk("participate", "b0", "verb", "participate", "logic", 4),
    mk("wonder", "b0", "noun", "wonder", "theme", 4),
    mk("occupy", "b0", "verb", "occupy", "logic", 4),
    mk("captive", "b0", "adjective", "captive", "academic", 4),
    mk("devices", "b0", "noun", "device", "theme", 4),
    mk("socialize", "b0", "verb", "social", "academic", 4),
    mk("physical", "b1", "adjective", "physical", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
      collocationValue: 1,
      competitionGroup: "physical cues",
    }),
    mk("cues", "b1", "noun", "cue", "collocation", 5, {
      collocationValue: 5,
      competitionGroup: "physical cues",
    }),
    mk("movement", "b1", "noun", "move", "theme", 3, {
      collocationValue: 2,
      commonnessPenalty: 2,
      competitionGroup: "movement repertoire",
      grade: "B",
    }),
    mk("repertoire", "b1", "noun", "repertoire", "collocation", 5, {
      collocationValue: 5,
      competitionGroup: "movement repertoire",
    }),
    mk("communicate", "b1", "verb", "communicate", "academic", 4),
    mk("mature", "b1", "verb", "mature", "academic", 5, {
      competitionGroup: "mature emotionally",
    }),
    mk("emotionally", "b1", "adverb", "emotion", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 2,
      competitionGroup: "mature emotionally",
    }),
    mk("kids", "b2", "noun", "kid", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 1,
    }),
    mk("run", "b2", "verb", "run", "context", 1, {
      commonnessPenalty: 4,
      learningValue: 1,
      competitionGroup: "motion-parallel",
    }),
    mk("skip", "b2", "verb", "skip", "context", 3, {
      competitionGroup: "motion-parallel",
      grade: "B",
    }),
    mk("climb", "b2", "verb", "climb", "context", 3, {
      competitionGroup: "motion-parallel",
      grade: "B",
    }),
    mk("everywhere", "b2", "adverb", "everywhere", "context", 2, {
      commonnessPenalty: 3,
      competitionGroup: "where-group",
    }),
    mk("nowhere", "b2", "adverb", "nowhere", "context", 2, {
      commonnessPenalty: 3,
      competitionGroup: "where-group",
    }),
    mk("anxiety", "b2", "noun", "anxiety", "theme", 5),
    mk("diseases", "b2", "noun", "disease", "theme", 4),
    mk("design", "b3", "noun", "design", "main_claim", 5),
    mk("extraordinary", "b3", "adjective", "extraordinary", "main_claim", 4),
    mk("movement", "b3", "noun", "move", "main_claim", 5),
    mk("play", "b3", "noun", "play", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 1,
    }),
    mk("life", "b3", "noun", "life", "context", 2, {
      commonnessPenalty: 3,
      learningValue: 1,
    }),
  ];

  const { valid } = validateBlankCandidates({
    passageId: "move-pass",
    responsePassageId: "move-pass",
    sentences: fixtureSentences,
    generatedCandidates: raw,
    recommendedCount: 24,
    density: "high",
    coreSentenceIds: ["b3"],
  });

  assert.ok(!valid.some((v) => v.lemma === "physical"));
  assert.ok(!valid.some((v) => v.lemma === "emotionally"));
  assert.ok(!valid.some((v) => v.lemma === "kids"));
  assert.ok(!valid.some((v) => v.lemma === "run"));
  assert.ok(!valid.some((v) => v.lemma === "play"));
  assert.ok(!valid.some((v) => v.lemma === "life"));
  assert.ok(!valid.some((v) => v.lemma === "everywhere"));
  assert.ok(!valid.some((v) => v.lemma === "nowhere"));

  const cuesV = valid.find((v) => v.lemma === "cues");
  const repV = valid.find((v) => v.lemma === "repertoire");
  assert.ok(cuesV && repV);

  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );
  const wordCount = countEnglishWords(
    fixtureSentences.map((s) => s.english).join(" ")
  );
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

  const normal = selectBlankCandidatesByDensity(valid, {
    density: "standard",
    standardTarget,
    highTarget,
    sentenceWordCounts: wc,
    coreSentenceIds: ["b3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });
  const hard = selectBlankCandidatesByDensity(valid, {
    density: "high",
    standardTarget,
    highTarget,
    sentenceWordCounts: wc,
    coreSentenceIds: ["b3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });

  for (const c of normal.selected) {
    assert.ok(
      hard.selected.some(
        (h) => h.sentenceId === c.sentenceId && h.start === c.start
      ),
      `normal ⊆ hard missing ${c.lemma}`
    );
  }

  const lemmas = hard.selected.map((c) => c.lemma);
  assert.ok(!lemmas.includes("physical"));
  assert.ok(
    lemmas.includes("repertoire") || lemmas.includes("cues"),
    `collocation: ${lemmas.join(",")}`
  );
  // If movement (b1) somehow selected without repertoire — fail
  if (
    hard.selected.some((c) => c.lemma === "movement" && c.sentenceId === "b1")
  ) {
    assert.ok(lemmas.includes("repertoire"));
  }
  const moveFamily = hard.selected.filter((c) => c.wordFamily === "move");
  assert.ok(moveFamily.length <= 1, `move family: ${lemmas.join(",")}`);
  const motion = ["run", "skip", "climb"].filter((w) => lemmas.includes(w));
  assert.ok(motion.length <= 1, `motion: ${lemmas.join(",")}`);
  assert.ok(
    !(lemmas.includes("everywhere") && lemmas.includes("nowhere"))
  );
  assert.ok(
    lemmas.includes("design") ||
      lemmas.includes("extraordinary") ||
      lemmas.includes("movement"),
    `conclusion: ${lemmas.join(",")}`
  );
  const easyBeforeCore =
    ["kids", "play", "run", "life"].some((w) =>
      normal.selected.map((c) => c.lemma).includes(w)
    ) &&
    !["cues", "repertoire", "anxiety", "design"].some((w) =>
      normal.selected.map((c) => c.lemma).includes(w)
    );
  assert.ok(!easyBeforeCore, `easy before core: ${lemmas.join(",")}`);

  console.log("fixture2 normal:", normal.selected.map((c) => c.lemma).join(", "));
  console.log("fixture2 hard:", lemmas.join(", "));
  console.log(
    `fixture2 counts normal=${normal.selected.length}/${standardTarget} hard=${hard.selected.length}/${highTarget} (words=${wordCount})`
  );
}

{
  const fromVocab = buildBlankCandidatesFromVocab({
    sentences,
    vocab: [
      { word: "Attraction", meaning: "n. 끌어당김", synonyms: [], antonyms: [] },
      { word: "belief", meaning: "n. 신념", synonyms: [], antonyms: [] },
      { word: "magnetic", meaning: "a. 끌어당기는", synonyms: [], antonyms: [] },
      { word: "powerful", meaning: "a. 강력한", synonyms: [], antonyms: [] },
      { word: "affirmations", meaning: "n. 확언", synonyms: [], antonyms: [] },
      { word: "systems", meaning: "n. 체계", synonyms: [], antonyms: [] },
    ],
    maxCandidates: 10,
  });
  assert.ok(fromVocab.length >= 3);
}

console.log("ok: workbook blank selection v4 tests passed");
