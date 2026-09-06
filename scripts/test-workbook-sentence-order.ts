/**
 * Sentence-order workbook unit tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-sentence-order.ts
 */
import assert from "node:assert/strict";
import {
  SENTENCE_ORDER_ALGORITHM_VERSION,
  SENTENCE_ORDER_SKIP_TOO_FEW,
} from "../src/lib/lesson-materials/sentence-order-constants";
import {
  generateWorkbookSentenceOrder,
  resolvePassageSentences,
} from "../src/lib/lesson-materials/generate-workbook-sentence-order";
import {
  adjacentPairKeepRatio,
  buildSentenceOrderSeed,
  formatAnswerLabelSequence,
  isAcceptableShuffle,
  isExactReverse,
  planSentenceOrderSetSizes,
  samePositionRatio,
  shuffleSentenceIds,
  validateSentenceOrderQuestion,
} from "../src/lib/lesson-materials/sentence-order-shuffle";
import {
  sentencesRestoreOriginal,
  splitEnglishPassageIntoSentences,
} from "../src/lib/lesson-materials/split-english-sentences";

assert.equal(SENTENCE_ORDER_ALGORITHM_VERSION, "sentence-order-v1");

function mkSentences(n: number, prefix = "S") {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    english: `Sentence number ${i + 1} is unique content here for testing.`,
  }));
}

// --- set size planning ---
{
  assert.deepEqual(planSentenceOrderSetSizes(2), []);
  assert.deepEqual(planSentenceOrderSetSizes(3), [3]);
  assert.deepEqual(planSentenceOrderSetSizes(10), [10]);
  assert.deepEqual(planSentenceOrderSetSizes(11), [6, 5]);
  assert.deepEqual(planSentenceOrderSetSizes(12), [6, 6]);
  assert.deepEqual(planSentenceOrderSetSizes(13), [7, 6]);
  assert.deepEqual(planSentenceOrderSetSizes(14), [7, 7]);
  assert.deepEqual(planSentenceOrderSetSizes(15), [8, 7]);
  assert.deepEqual(planSentenceOrderSetSizes(16), [8, 8]);
}

// --- 3-sentence passage ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb-test|2026",
    passages: [
      {
        projectId: "p3",
        title: "Three",
        source: null,
        sentences: mkSentences(3),
      },
    ],
  });
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.questions.length, 1);
  const q = result.questions[0]!;
  assert.equal(q.pinFirstSentence, false);
  assert.equal(q.shuffledItems.length, 3);
  assert.notEqual(
    q.shuffledSentenceIds.join("|"),
    q.originalSentenceIds.join("|")
  );
  assert.ok(!isExactReverse(q.originalSentenceIds, q.shuffledSentenceIds));
  const check = validateSentenceOrderQuestion(q);
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
  console.log("3-sentence answer:", formatAnswerLabelSequence(q.answerLabels));
  console.log(
    "3-sentence shuffled:",
    q.shuffledItems.map((x) => `(${x.label}) ${x.sentenceId}`).join(" | ")
  );
}

// --- 6-sentence passage ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb-test|2026",
    passages: [
      {
        projectId: "p6",
        title: "Six",
        source: "src",
        sentences: mkSentences(6),
      },
    ],
  });
  const q = result.questions[0]!;
  assert.equal(q.pinFirstSentence, false);
  assert.ok(samePositionRatio(q.originalSentenceIds, q.shuffledSentenceIds) < 0.3);
  assert.ok(
    adjacentPairKeepRatio(q.originalSentenceIds, q.shuffledSentenceIds) < 0.4
  );
  assert.ok(
    isAcceptableShuffle(q.originalSentenceIds, q.shuffledSentenceIds)
  );
  assert.equal(validateSentenceOrderQuestion(q).ok, true);
}

// --- 8-sentence: pin first ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb-test|2026",
    passages: [
      {
        projectId: "p8",
        title: "Eight",
        source: null,
        sentences: mkSentences(8),
      },
    ],
  });
  const q = result.questions[0]!;
  assert.equal(q.pinFirstSentence, true);
  assert.ok(q.givenSentence);
  assert.equal(q.givenSentence!.sentenceId, "S1");
  assert.equal(q.shuffledItems.length, 7);
  assert.equal(q.answerLabels.length, 7);
  assert.ok(!q.shuffledItems.some((it) => it.sentenceId === "S1"));
  const check = validateSentenceOrderQuestion(q);
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
  console.log("8-sentence (pinned) answer:", formatAnswerLabelSequence(q.answerLabels));
}

// --- 11-sentence: split 6+5, no pin ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb-test|2026",
    passages: [
      {
        projectId: "p11",
        title: "Eleven",
        source: null,
        sentences: mkSentences(11),
      },
    ],
  });
  assert.equal(result.questions.length, 2);
  assert.equal(result.questions[0]!.originalSentenceIds.length, 6);
  assert.equal(result.questions[1]!.originalSentenceIds.length, 5);
  assert.equal(result.questions[0]!.pinFirstSentence, false);
  assert.equal(result.questions[1]!.pinFirstSentence, false);
  const allIds = result.questions.flatMap((q) => q.originalSentenceIds);
  assert.equal(allIds.length, 11);
  assert.equal(new Set(allIds).size, 11);
  for (const q of result.questions) {
    assert.equal(validateSentenceOrderQuestion(q).ok, true);
  }
  console.log(
    "11-sentence answers:",
    result.questions
      .map((q) => `${q.setIndex}: ${formatAnswerLabelSequence(q.answerLabels)}`)
      .join(" / ")
  );
}

// --- duplicate English text, distinct ids ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb-dup",
    passages: [
      {
        projectId: "pdup",
        title: "Dup",
        source: null,
        sentences: [
          { id: "a", english: "Movement is life to us." },
          { id: "b", english: "Movement is life to us." },
          { id: "c", english: "Stillness is death to us." },
          { id: "d", english: "Choose movement every day." },
        ],
      },
    ],
  });
  assert.equal(result.questions.length, 1);
  const q = result.questions[0]!;
  assert.equal(new Set(q.originalSentenceIds).size, 4);
  assert.equal(validateSentenceOrderQuestion(q).ok, true);
}

// --- quote / long sentence splitter ---
{
  const passage =
    'He said, "Wait. Do not go yet." Then she left. Movement is life to us.';
  const parts = splitEnglishPassageIntoSentences(passage);
  assert.ok(parts.length >= 2, `got ${parts.length}: ${JSON.stringify(parts)}`);
  assert.ok(parts.some((p) => p.includes('"Wait. Do not go yet."')));
  assert.ok(sentencesRestoreOriginal(passage, parts));

  const resolved = resolvePassageSentences({
    projectId: "pq",
    sentences: [{ id: "one", english: passage }],
  });
  assert.equal(resolved.ok, true);
  if (resolved.ok) {
    assert.ok(resolved.sentences.length >= 3);
  }
}

// --- deterministic shuffle ---
{
  const ids = ["a", "b", "c", "d", "e", "f"];
  const seed = buildSentenceOrderSeed({
    workbookId: "w",
    passageId: "p",
    setIndex: 1,
    sourceHash: "abc",
  });
  const s1 = shuffleSentenceIds(ids, seed);
  const s2 = shuffleSentenceIds(ids, seed);
  assert.deepEqual(s1, s2);
  const other = shuffleSentenceIds(ids, seed + "x");
  assert.notDeepEqual(s1, other);
}

// --- too few sentences skipped ---
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb",
    passages: [
      {
        projectId: "p2",
        title: "Two",
        source: null,
        sentences: mkSentences(2),
      },
      {
        projectId: "p4",
        title: "Four",
        source: null,
        sentences: mkSentences(4),
      },
    ],
  });
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0]!.reason, SENTENCE_ORDER_SKIP_TOO_FEW);
  assert.equal(result.questions.length, 1);
  assert.equal(result.questions[0]!.passageId, "p4");
}

console.log("\nAll sentence-order tests passed.");
