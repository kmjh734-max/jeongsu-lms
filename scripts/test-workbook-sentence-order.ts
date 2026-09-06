/**
 * Sentence-order workbook unit tests (numeric display numbers, no OpenAI).
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
  formatAnswerOrderSequence,
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

assert.equal(SENTENCE_ORDER_ALGORITHM_VERSION, "sentence-order-v2-numeric");

function mkSentences(n: number, prefix = "S") {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    english: `Sentence number ${i + 1} is unique content here for testing.`,
  }));
}

// --- set size: one passage → one question ---
{
  assert.deepEqual(planSentenceOrderSetSizes(2), []);
  assert.deepEqual(planSentenceOrderSetSizes(3), [3]);
  assert.deepEqual(planSentenceOrderSetSizes(6), [6]);
  assert.deepEqual(planSentenceOrderSetSizes(10), [10]);
  assert.deepEqual(planSentenceOrderSetSizes(11), [11]);
  assert.deepEqual(planSentenceOrderSetSizes(16), [16]);
}

// --- 3-sentence ---
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
  assert.deepEqual(
    q.shuffledItems.map((x) => x.displayNumber),
    [1, 2, 3]
  );
  assert.notEqual(
    q.shuffledSentenceIds.join("|"),
    q.originalSentenceIds.join("|")
  );
  assert.ok(!isExactReverse(q.originalSentenceIds, q.shuffledSentenceIds));
  const check = validateSentenceOrderQuestion(q);
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
  console.log("3-sentence answer:", formatAnswerOrderSequence(q.answerOrderNumbers));
}

// --- 6-sentence: (1)~(6), 6 answer boxes ---
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
  assert.equal(result.questions.length, 1);
  const q = result.questions[0]!;
  assert.equal(q.pinFirstSentence, false);
  assert.equal(q.shuffledItems.length, 6);
  assert.equal(q.answerOrderNumbers.length, 6);
  assert.deepEqual(
    q.shuffledItems.map((x) => x.displayNumber),
    [1, 2, 3, 4, 5, 6]
  );
  assert.ok(samePositionRatio(q.originalSentenceIds, q.shuffledSentenceIds) < 0.3);
  assert.ok(
    adjacentPairKeepRatio(q.originalSentenceIds, q.shuffledSentenceIds) < 0.4
  );
  assert.ok(
    isAcceptableShuffle(q.originalSentenceIds, q.shuffledSentenceIds)
  );
  assert.equal(validateSentenceOrderQuestion(q).ok, true);

  const restored = q.answerOrderNumbers.map(
    (n) =>
      q.shuffledItems.find((it) => it.displayNumber === n)?.sentenceId ?? ""
  );
  assert.equal(restored.join("|"), q.originalSentenceIds.join("|"));
  console.log("6-sentence answer:", formatAnswerOrderSequence(q.answerOrderNumbers));
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
  assert.equal(q.answerOrderNumbers.length, 7);
  assert.deepEqual(
    q.shuffledItems.map((x) => x.displayNumber),
    [1, 2, 3, 4, 5, 6, 7]
  );
  assert.ok(!q.shuffledItems.some((it) => it.sentenceId === "S1"));
  const check = validateSentenceOrderQuestion(q);
  assert.equal(check.ok, true, check.ok ? "" : check.reason);
  console.log(
    "8-sentence (pinned) answer:",
    formatAnswerOrderSequence(q.answerOrderNumbers)
  );
}

// --- 11-sentence: single question (1)~(11), no split ---
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
  assert.equal(result.questions.length, 1, "must not split into multiple questions");
  const q = result.questions[0]!;
  assert.equal(q.pinFirstSentence, false);
  assert.equal(q.shuffledItems.length, 11);
  assert.equal(q.answerOrderNumbers.length, 11);
  assert.deepEqual(
    q.shuffledItems.map((x) => x.displayNumber),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  );
  assert.equal(validateSentenceOrderQuestion(q).ok, true);
  const restored = q.answerOrderNumbers.map(
    (n) =>
      q.shuffledItems.find((it) => it.displayNumber === n)?.sentenceId ?? ""
  );
  assert.equal(restored.join("|"), q.originalSentenceIds.join("|"));
  console.log(
    "11-sentence answer:",
    formatAnswerOrderSequence(q.answerOrderNumbers)
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

// --- answer key has no parentheses ---
{
  assert.equal(formatAnswerOrderSequence([2, 4, 3, 1]), "2 → 4 → 3 → 1");
  assert.ok(!formatAnswerOrderSequence([1, 2]).includes("("));
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

// No alphabet leftovers in generated payload
{
  const result = generateWorkbookSentenceOrder({
    workbookId: "wb",
    passages: [
      {
        projectId: "p",
        title: "T",
        source: null,
        sentences: mkSentences(4),
      },
    ],
  });
  const q = result.questions[0]! as Record<string, unknown>;
  assert.equal("answerLabels" in q, false);
  assert.ok(Array.isArray(q.answerOrderNumbers));
  for (const it of q.shuffledItems as Array<Record<string, unknown>>) {
    assert.equal("label" in it, false);
    assert.equal(typeof it.displayNumber, "number");
  }
}

console.log("\nAll sentence-order numeric tests passed.");
