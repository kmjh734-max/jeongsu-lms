/**
 * Unit checks for workbook blank density + translation assess (no OpenAI).
 * Run: npx tsx scripts/test-workbook-blank.ts
 */
import assert from "node:assert/strict";
import { assessWorkbookTranslation } from "../src/lib/lesson-materials/refine-workbook-translation";
import {
  assignBlankNumbers,
  buildBlankTokensForSentence,
  restorePassageFromTokens,
} from "../src/lib/lesson-materials/insert-workbook-blanks";
import {
  findExactWordOccurrences,
  selectBlankCandidates,
  validateBlankCandidates,
  type ValidatedBlankCandidate,
} from "../src/lib/lesson-materials/validate-workbook-blank";
import {
  computeBlankTargetCount,
  countEnglishWords,
  getMaxBlanksForSentence,
} from "../src/lib/lesson-materials/workbook-types";

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
      id: "b1",
      sentenceId: "s0",
      answerText: "Attraction",
      occurrenceIndex: 0,
      lemma: "attraction",
      partOfSpeech: "noun",
      meaningKo: "끌어당김",
      selectionReasonKo: "주제 핵심 명사",
      priority: 5,
    },
    {
      id: "b2",
      sentenceId: "s1",
      answerText: "magnetic",
      occurrenceIndex: 0,
      lemma: "magnetic",
      partOfSpeech: "adjective",
      meaningKo: "끌어당기는",
      selectionReasonKo: "핵심 형용사",
      priority: 4,
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
    {
      id: "missing",
      sentenceId: "s0",
      answerText: "unicorn",
      occurrenceIndex: 0,
      lemma: "unicorn",
      partOfSpeech: "noun",
      meaningKo: "유니콘",
      selectionReasonKo: "없음",
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
  });
  assert.ok(valid.length >= 2);
  assert.ok(rejected.some((r) => r.reason.includes("제외")));
  assert.ok(rejected.some((r) => r.reason.includes("occurrence")));

  const { selected } = selectBlankCandidates(valid, 6, {
    density: "high",
    sentenceWordCounts: new Map([
      ["s0", countEnglishWords(s0)],
      ["s1", countEnglishWords(s1)],
    ]),
  });
  assert.ok(selected.length >= 2);
  assert.ok(selected.every((c) => c.answerText !== "the"));

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
  const sentence = "Power and power can attract power.";
  const hits = findExactWordOccurrences(sentence, "power");
  assert.equal(hits.length, 2);
  const raw = [
    {
      id: "b1",
      sentenceId: "sx",
      answerText: "power",
      occurrenceIndex: 1,
      lemma: "power",
      partOfSpeech: "noun",
      meaningKo: "힘",
      selectionReasonKo: "두 번째",
      priority: 5,
    },
  ];
  const { valid } = validateBlankCandidates({
    passageId: "p",
    responsePassageId: "p",
    sentences: [{ id: "sx", english: sentence }],
    generatedCandidates: raw,
    recommendedCount: 1,
  });
  assert.equal(valid.length, 1);
  const numbers = assignBlankNumbers(valid, ["sx"]);
  const tokens = buildBlankTokensForSentence({
    sentence,
    blanks: valid,
    numberByKey: numbers,
    hintType: "none",
  });
  assert.equal(restorePassageFromTokens(tokens), sentence);
  const restoredPositions = findExactWordOccurrences(sentence, "power");
  assert.equal(valid[0]!.start, restoredPositions[1]!.start);
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
      hintType: "first_letter",
      showTranslation: true,
    }),
    18
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
  assert.equal(
    computeBlankTargetCount({
      englishWordCount: n,
      density: "high",
      hintType: "first_letter",
      showTranslation: false,
    }),
    15
  );
  assert.equal(
    computeBlankTargetCount({
      englishWordCount: n,
      density: "high",
      hintType: "none",
      showTranslation: false,
    }),
    12
  );
  assert.equal(getMaxBlanksForSentence(10, "high"), 1);
  assert.equal(getMaxBlanksForSentence(20, "high"), 2);
  assert.equal(getMaxBlanksForSentence(30, "high"), 3);
  assert.equal(countEnglishWords("well-known state-of-the-art tool"), 3);
}

{
  // Translation regression cases
  const longEn =
    "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.";
  const truncatedKo =
    "아마도 당신은 ‘유사한 것이 유사한 것을 끌어당긴다’고 말하는 끌어당김의 법칙에 대해 들어본 적이 있을 것입니다.";
  assert.equal(assessWorkbookTranslation(longEn, truncatedKo).ok, false);

  assert.equal(
    assessWorkbookTranslation(
      "our thoughts and words are extremely magnetic",
      "우리의 생각과 말은 매우 매력적이다."
    ).ok,
    false
  );
  assert.ok(
    assessWorkbookTranslation(
      "our thoughts and words are extremely magnetic",
      "우리의 생각과 말에는 매우 강한 끌어당기는 힘이 있다."
    ).ok
  );

  assert.equal(
    assessWorkbookTranslation(
      "you are available for an incredibly successful career",
      "자신을 확인할 수 있지만"
    ).ok,
    false
  );

  assert.equal(
    assessWorkbookTranslation(
      "we are getting further and further away from our design",
      "우리는 우리의 디자인에서 점점 멀어지고 있다."
    ).ok,
    false
  );
  assert.ok(
    assessWorkbookTranslation(
      "we are getting further and further away from our design",
      "우리가 본래 창조된 모습에서 점점 더 멀어지고 있다."
    ).ok
  );

  assert.equal(
    assessWorkbookTranslation(
      "Movement is life to us.",
      "움직임은 우리에게 삶입니다."
    ).ok,
    false
  );
  assert.ok(
    assessWorkbookTranslation(
      "Movement is life to us.",
      "우리에게 움직임은 곧 생명이다."
    ).ok
  );
}

console.log("ok: workbook blank density + translation tests passed");
