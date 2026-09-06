/**
 * Blank selection v3 unit tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-blank.ts
 */
import assert from "node:assert/strict";
import {
  computeBlankFinalScore,
  conflictsWithNearSynonym,
  normalizeWordFamily,
  sameWordFamily,
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
  selectBlankCandidates,
  validateBlankCandidates,
  type ValidatedBlankCandidate,
} from "../src/lib/lesson-materials/validate-workbook-blank";
import { BLANK_POOL_ALGORITHM_VERSION } from "../src/lib/lesson-materials/workbook-blank-cache";
import {
  computeBlankTargetCount,
  countEnglishWords,
  getMaxBlanksForSentence,
} from "../src/lib/lesson-materials/workbook-types";

assert.equal(BLANK_POOL_ALGORITHM_VERSION, "blank-selection-v3");

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
      semanticRole: "theme",
      competitionGroup: null,
      scores: {
        centrality: 5,
        learningValue: 5,
        contextualImportance: 4,
        reusability: 4,
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
      semanticRole: "main_claim",
      competitionGroup: null,
      scores: {
        centrality: 5,
        learningValue: 5,
        contextualImportance: 5,
        reusability: 5,
        collocationValue: 5,
        commonnessPenalty: 1,
        redundancyPenalty: 1,
      },
      reasonKo: "중심 주장",
    },
    {
      candidateId: "ex",
      sentenceId: "s1",
      answerText: "extremely",
      occurrenceIndex: 0,
      lemma: "extremely",
      wordFamily: "extreme",
      partOfSpeech: "adverb",
      meaningKo: "극도로",
      semanticRole: "context",
      competitionGroup: null,
      scores: {
        centrality: 1,
        learningValue: 1,
        contextualImportance: 1,
        reusability: 1,
        collocationValue: 1,
        commonnessPenalty: 5,
        redundancyPenalty: 1,
      },
      reasonKo: "정도부사",
    },
    {
      candidateId: "pow",
      sentenceId: "s1",
      answerText: "powerful",
      occurrenceIndex: 0,
      lemma: "powerful",
      wordFamily: "power",
      partOfSpeech: "adjective",
      meaningKo: "강력한",
      semanticRole: "context",
      competitionGroup: null,
      scores: {
        centrality: 2,
        learningValue: 2,
        contextualImportance: 2,
        reusability: 2,
        collocationValue: 1,
        commonnessPenalty: 4,
        redundancyPenalty: 1,
      },
      reasonKo: "일반 형용사",
    },
    {
      id: "bad",
      sentenceId: "s0",
      answerText: "the",
      occurrenceIndex: 0,
      lemma: "the",
      partOfSpeech: "noun",
      meaningKo: "그",
      selectionReasonKo: "관사",
      priority: 5,
    },
  ];

  const { valid, rejected } = validateBlankCandidates({
    passageId: "p1",
    responsePassageId: "p1",
    sentences,
    generatedCandidates: raw,
    recommendedCount: 6,
    density: "high",
    coreSentenceIds: ["s1"],
  });
  assert.ok(valid.some((v) => v.lemma === "belief"));
  assert.ok(valid.some((v) => v.lemma === "attraction"));
  assert.ok(!valid.some((v) => v.lemma === "extremely"));
  assert.ok(rejected.some((r) => r.reason.includes("제외") || r.reason.includes("쉬운")));

  const { selected } = selectBlankCandidates(valid, 6, {
    density: "high",
    sentenceWordCounts: new Map([
      ["s0", countEnglishWords(s0)],
      ["s1", countEnglishWords(s1)],
    ]),
    coreSentenceIds: ["s1"],
    sentenceOrder: ["s0", "s1"],
  });
  assert.ok(selected.some((c) => c.lemma === "belief"), "core sentence belief");
  assert.ok(!selected.some((c) => c.lemma === "extremely"));
  // belief should beat powerful when both present
  if (selected.some((c) => c.lemma === "powerful")) {
    assert.ok(
      selected.find((c) => c.lemma === "belief")!.finalScore >
        selected.find((c) => c.lemma === "powerful")!.finalScore
    );
  }

  const order = ["s0", "s1"];
  const numbers = assignBlankNumbers(selected, order);
  const bySentence = new Map<string, ValidatedBlankCandidate[]>();
  for (const c of selected) {
    const list = bySentence.get(c.sentenceId) ?? [];
    list.push(c);
    bySentence.set(c.sentenceId, list);
  }
  for (const sid of order) {
    const blanks = bySentence.get(sid) ?? [];
    const sentence = sentences.find((s) => s.id === sid)!.english;
    const tokens = buildBlankTokensForSentence({
      sentence,
      blanks,
      numberByKey: numbers,
      hintType: "first_letter",
    });
    assert.equal(restorePassageFromTokens(tokens), sentence);
  }
}

{
  // Word family
  assert.equal(normalizeWordFamily("movement"), "move");
  assert.equal(normalizeWordFamily("belief"), "believe");
  assert.ok(sameWordFamily("moving", "movement"));
  assert.ok(!sameWordFamily("belief", "focusing"));
}

{
  // Score formula
  const score = computeBlankFinalScore({
    centrality: 5,
    learningValue: 5,
    contextualImportance: 5,
    reusability: 4,
    collocationValue: 4,
    commonnessPenalty: 1,
    redundancyPenalty: 1,
  });
  assert.equal(score, 5 * 4 + 5 * 3 + 5 * 3 + 4 * 2 + 4 * 2 - 1 * 3 - 1 * 4);
}

{
  // Density targets ~150 words
  const n = 150;
  assert.equal(
    computeBlankTargetCount({
      englishWordCount: n,
      density: "standard",
      hintType: "first_letter",
      showTranslation: true,
    }),
    11
  );
  assert.equal(
    computeBlankTargetCount({
      englishWordCount: n,
      density: "high",
      hintType: "none",
      showTranslation: true,
    }),
    16
  );
  assert.equal(getMaxBlanksForSentence(10, "high"), 1);
  assert.equal(getMaxBlanksForSentence(20, "high"), 2);
  assert.equal(getMaxBlanksForSentence(30, "high"), 3);
}

{
  // Translation regressions (unchanged)
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
}

// --- Fixture: Positive thinking / belief (regression 10-1) ---
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
        "You must affirm that you are worthy, lovable, and deserving while challenging limiting beliefs that contradict your desire to upgrade.",
    },
  ];

  const raw = [
    mk("focusing", "a0", "verb", "focus", "logic", 5),
    mk("thoughts", "a0", "noun", "thought", "theme", 5),
    mk("results", "a0", "noun", "result", "logic", 4),
    mk("flaw", "a1", "noun", "flaw", "theme", 5),
    mk("visualize", "a1", "verb", "visualize", "academic", 5),
    mk("manifest", "a1", "verb", "manifest", "academic", 5),
    mk("vibration", "a1", "noun", "vibration", "theme", 5),
    mk("extremely", "a2", "adverb", "extreme", "context", 1, {
      commonnessPenalty: 5,
      learningValue: 1,
      centrality: 1,
    }),
    mk("magnetic", "a2", "adjective", "attract", "collocation", 5),
    mk("powerful", "a3", "adjective", "power", "context", 2, {
      commonnessPenalty: 4,
      learningValue: 2,
      centrality: 2,
    }),
    mk("attractor", "a3", "noun", "attract", "main_claim", 5),
    mk("belief", "a3", "noun", "believe", "main_claim", 5),
    mk("affirm", "a4", "verb", "affirm", "academic", 4),
    mk("worthy", "a4", "adjective", "worthy", "context", 3, {
      competitionGroup: "worth-group",
    }),
    mk("lovable", "a4", "adjective", "lovable", "context", 2, {
      competitionGroup: "worth-group",
    }),
    mk("deserving", "a4", "adjective", "deserving", "context", 3, {
      competitionGroup: "worth-group",
    }),
    mk("challenging", "a4", "verb", "challenge", "logic", 4),
    mk("limiting", "a4", "adjective", "limit", "logic", 4),
    mk("contradict", "a4", "verb", "contradict", "logic", 4),
    mk("upgrade", "a4", "verb", "upgrade", "academic", 4),
  ];

  const { valid } = validateBlankCandidates({
    passageId: "belief-pass",
    responsePassageId: "belief-pass",
    sentences: fixtureSentences,
    generatedCandidates: raw,
    recommendedCount: 20,
    density: "high",
    coreSentenceIds: ["a3"],
  });
  assert.ok(!valid.some((v) => v.lemma === "extremely"));

  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );
  const { selected } = selectBlankCandidates(valid, 15, {
    density: "high",
    sentenceWordCounts: wc,
    coreSentenceIds: ["a3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });

  const lemmas = selected.map((c) => c.lemma);
  assert.ok(
    lemmas.includes("belief") || lemmas.includes("attractor"),
    `core claim blank missing: ${lemmas.join(",")}`
  );
  assert.ok(!lemmas.includes("extremely"));
  const worthCount = ["worthy", "lovable", "deserving"].filter((w) =>
    lemmas.includes(w)
  ).length;
  assert.ok(worthCount <= 1, `parallel synonyms: ${lemmas.join(",")}`);
  assert.ok(selected.length >= 7 && selected.length <= 16, String(selected.length));
  // magnetic preferred over extremely (extremely already filtered)
  if (valid.some((v) => v.lemma === "magnetic")) {
    assert.ok(lemmas.includes("magnetic") || lemmas.includes("attractor") || lemmas.includes("belief"));
  }
}

// --- Fixture: Born to move (regression 10-2) ---
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
        "Without physical cues from a rich movement repertoire, children struggle to communicate and mature.",
    },
    {
      id: "b2",
      english: "They may run, skip, or climb, yet still face anxiety and disease.",
    },
    {
      id: "b3",
      english:
        "We are getting further from our design; movement is extraordinary when we reclaim it.",
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
      commonnessPenalty: 4,
      centrality: 2,
      learningValue: 2,
      collocationValue: 1,
    }),
    mk("cues", "b1", "noun", "cue", "collocation", 5, {
      collocationValue: 5,
      centrality: 4,
    }),
    mk("movement", "b1", "noun", "move", "theme", 3, {
      collocationValue: 2,
      commonnessPenalty: 3,
    }),
    mk("repertoire", "b1", "noun", "repertoire", "collocation", 5, {
      collocationValue: 5,
      centrality: 5,
    }),
    mk("communicate", "b1", "verb", "communicate", "academic", 4),
    mk("mature", "b1", "verb", "mature", "academic", 5),
    mk("run", "b2", "verb", "run", "context", 1, {
      commonnessPenalty: 5,
      learningValue: 1,
      centrality: 1,
    }),
    mk("skip", "b2", "verb", "skip", "context", 3, {
      competitionGroup: "motion-parallel",
    }),
    mk("climb", "b2", "verb", "climb", "context", 3, {
      competitionGroup: "motion-parallel",
    }),
    mk("anxiety", "b2", "noun", "anxiety", "theme", 5),
    mk("design", "b3", "noun", "design", "main_claim", 5),
    mk("extraordinary", "b3", "adjective", "extraordinary", "main_claim", 4),
    mk("Movement", "b3", "noun", "move", "main_claim", 4),
  ];

  // duplicate movement lemma on b3 — validate drops second same lemma in validate? 
  // validate no longer dedupes lemmas across list — select does via wordFamily
  const { valid } = validateBlankCandidates({
    passageId: "move-pass",
    responsePassageId: "move-pass",
    sentences: fixtureSentences,
    generatedCandidates: raw,
    recommendedCount: 20,
    density: "high",
    coreSentenceIds: ["b3"],
  });

  assert.ok(!valid.some((v) => v.lemma === "run" && v.scores.centrality < 4));
  assert.ok(isExcludedBlankWord("extremely"));

  const wc = new Map(
    fixtureSentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );
  const { selected } = selectBlankCandidates(valid, 15, {
    density: "high",
    sentenceWordCounts: wc,
    coreSentenceIds: ["b3"],
    sentenceOrder: fixtureSentences.map((s) => s.id),
  });
  const lemmas = selected.map((c) => c.lemma);

  assert.ok(!lemmas.includes("physical"), `physical excluded: ${lemmas.join(",")}`);
  const cuesV = valid.find((v) => v.lemma === "cues");
  const physicalV = valid.find((v) => v.lemma === "physical");
  if (cuesV && physicalV) {
    assert.ok(
      cuesV.finalScore > physicalV.finalScore,
      "cues should outrank physical"
    );
  }
  const repV = valid.find((v) => v.lemma === "repertoire");
  const moveV = valid.find(
    (v) => v.lemma === "movement" && v.sentenceId === "b1"
  );
  if (repV && moveV) {
    assert.ok(
      repV.finalScore > moveV.finalScore,
      "repertoire should outrank movement in collocation"
    );
  }
  assert.ok(
    lemmas.includes("repertoire") || lemmas.includes("cues"),
    `collocation head: ${lemmas.join(",")}`
  );
  // only one of move family
  const moveFamily = selected.filter((c) => c.wordFamily === "move");
  assert.ok(moveFamily.length <= 1, `move family dup: ${lemmas.join(",")}`);
  const motion = ["run", "skip", "climb"].filter((w) => lemmas.includes(w));
  assert.ok(motion.length <= 1, `motion parallel: ${lemmas.join(",")}`);
  assert.ok(
    lemmas.includes("design") ||
      lemmas.includes("extraordinary") ||
      lemmas.includes("movement"),
    `core conclusion: ${lemmas.join(",")}`
  );
  assert.ok(selected.length >= 7 && selected.length <= 16, String(selected.length));
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
  assert.ok(fromVocab.length >= 4);
}

console.log("ok: workbook blank selection v3 tests passed");

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
    semanticRole,
    competitionGroup: extra?.competitionGroup ?? null,
    scores: {
      centrality: c,
      learningValue: extra?.learningValue ?? Math.max(2, c),
      contextualImportance: c,
      reusability: 3,
      collocationValue: extra?.collocationValue ?? 3,
      commonnessPenalty: extra?.commonnessPenalty ?? 1,
      redundancyPenalty: 1,
    },
    reasonKo: semanticRole,
  };
}
