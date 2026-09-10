/**
 * 유일성 게이트 단위 테스트. OpenAI 호출 없음.
 * Run: npx tsx scripts/test-grammar-choice-v2-uniqueness.ts
 */
import assert from "node:assert/strict";
import { applyUniqueness } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import {
  buildSlotSentence,
  expandUniquenessItems,
} from "../src/lib/lesson-materials/grammar-choice-v2/uniqueness-audit";
import type { ResolvedCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/types";

/* ---------- buildSlotSentence ---------- */

assert.equal(
  buildSlotSentence("They miss the very thing that will help them.", "that", 0),
  "They miss the very thing [[SLOT]] will help them."
);

// 같은 낱말이 여러 번 나오면 occurrenceIndex가 가리키는 자리를 판다.
assert.equal(
  buildSlotSentence("He said that she knew that it worked.", "that", 1),
  "He said that she knew [[SLOT]] it worked."
);

// 문장에 없는 span은 슬롯을 못 판다.
assert.equal(buildSlotSentence("A short sentence.", "missing", 0), null);

// occurrenceIndex가 실제 등장 횟수를 넘으면 판정을 포기한다.
assert.equal(buildSlotSentence("only one that here", "that", 3), null);

console.log("buildSlotSentence ok");

/* ---------- applyUniqueness ---------- */

function candidate(id: string, correct: string, wrong: string): ResolvedCandidate {
  return {
    candidateId: id,
    sentenceId: "s1",
    pointCode: "RELATIVE_NONRESTRICTIVE",
    sourceSpan: correct,
    occurrenceIndex: 0,
    correctAnswer: correct,
    distractors: [wrong],
    transformCode: "RELATIVE_CHOICE",
    priority: "CORE",
    difficulty: "CORE",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
    passageStart: 0,
    passageEnd: correct.length,
  } as unknown as ResolvedCandidate;
}

const items = [
  candidate("keep", "which", "that"),
  candidate("both", "who", "that"),
  candidate("flipped", "what", "that"),
  candidate("unjudged", "when", "where"),
];

const applied = applyUniqueness(items, [
  { candidateId: "keep", unique: true },
  { candidateId: "both", unique: false, reason: "BOTH_GRAMMATICAL" },
  { candidateId: "flipped", unique: false, reason: "CORRECT_ANSWER_WRONG" },
]);

// 정답만 문법적인 항목은 살고, 둘 다 맞거나 정답이 틀린 항목은 떨어진다.
assert.deepEqual(
  applied.kept.map((i) => i.candidateId).sort(),
  ["keep", "unjudged"]
);
assert.deepEqual(
  applied.rejected.map((r) => r.reason).sort(),
  ["BOTH_GRAMMATICAL", "CORRECT_ANSWER_WRONG"]
);

// 첫 오답이 떨어져도 두 번째 오답이 통과하면 그쪽으로 살아난다.
const withAlt = candidate("rescue", "which", "that");
withAlt.distractors = ["that", "what"];
const rescued = applyUniqueness(
  [withAlt],
  [
    { candidateId: "rescue", unique: false, reason: "BOTH_GRAMMATICAL" },
    { candidateId: "rescue#alt", unique: true },
  ]
);
assert.equal(rescued.rejected.length, 0);
assert.deepEqual(rescued.kept[0]!.distractors, ["what", "that"]);

// 두 번째 오답도 떨어지면 문항은 사라진다.
const notRescued = applyUniqueness(
  [withAlt],
  [
    { candidateId: "rescue", unique: false, reason: "BOTH_GRAMMATICAL" },
    { candidateId: "rescue#alt", unique: false, reason: "BOTH_GRAMMATICAL" },
  ]
);
assert.equal(notRescued.kept.length, 0);
assert.equal(notRescued.rejected.length, 1);

console.log("alt rescue ok");

// expandUniquenessItems는 두 번째 오답이 있을 때만 #alt를 만든다.
assert.deepEqual(
  expandUniquenessItems([candidate("solo", "which", "that"), withAlt]).map(
    (i) => i.candidateId
  ),
  ["solo", "rescue", "rescue#alt"]
);

console.log("expandUniquenessItems ok");

// 판정이 아예 없으면 게이트는 아무것도 건드리지 않는다.
assert.equal(applyUniqueness(items, []).kept.length, 4);
assert.equal(applyUniqueness(items, undefined).kept.length, 4);
assert.equal(applyUniqueness(items, undefined).rejected.length, 0);

console.log("applyUniqueness ok");
console.log("grammar-choice-v2 uniqueness tests: PASS");
