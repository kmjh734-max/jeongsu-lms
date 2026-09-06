/**
 * Unit checks for workbook blank validate/insert (no OpenAI).
 * Run: npx tsx scripts/test-workbook-blank.ts
 */
import assert from "node:assert/strict";
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
      meaningKo: "자기적인",
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
  });
  assert.ok(valid.length >= 2);
  assert.ok(rejected.some((r) => r.reason.includes("제외")));
  assert.ok(rejected.some((r) => r.reason.includes("occurrence")));

  const selected = selectBlankCandidates(valid, 6);
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
    const blankTok = tokens.find((t) => t.type === "blank");
    if (blankTok && blankTok.type === "blank") {
      assert.ok(blankTok.firstLetter);
      assert.equal(blankTok.firstLetter, blankTok.answerText.charAt(0));
    }
  }
}

{
  // Same word twice — occurrenceIndex must target the right one
  const sentence = "Power and power can attract power.";
  const hits = findExactWordOccurrences(sentence, "power");
  assert.equal(hits.length, 2); // case-sensitive: only lowercase "power"
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
  assert.equal(valid[0]!.occurrenceIndex, 1);
  const numbers = assignBlankNumbers(valid, ["sx"]);
  const tokens = buildBlankTokensForSentence({
    sentence,
    blanks: valid,
    numberByKey: numbers,
    hintType: "none",
  });
  assert.equal(restorePassageFromTokens(tokens), sentence);
  // Must blank the second "power", not replaceAll
  const restoredPositions = findExactWordOccurrences(sentence, "power");
  assert.equal(valid[0]!.start, restoredPositions[1]!.start);
}

console.log("ok: workbook blank validate/insert tests passed");
