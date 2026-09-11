/**
 * 유일성 게이트 단위 테스트. OpenAI 호출 없음.
 * Run: npx tsx scripts/test-grammar-choice-v2-uniqueness.ts
 */
import assert from "node:assert/strict";
import { applyUniqueness } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import {
  buildSlotSentence,
  expandUniquenessItems,
  verifyChoiceUniqueness,
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

// 정답만 문법적인 항목만 산다. 둘 다 맞거나 정답이 틀린 항목, 판정을 못 받은
// 항목(호출 실패·시간 초과)은 떨어진다.
assert.deepEqual(applied.kept.map((i) => i.candidateId), ["keep"]);
assert.deepEqual(
  applied.rejected.map((r) => r.reason).sort(),
  ["BOTH_GRAMMATICAL", "CORRECT_ANSWER_WRONG", "UNIQUENESS_UNVERIFIED"]
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

// 판정 단계가 돌았는데 판정이 하나도 없으면(호출 전부 실패) 전부 떨어진다.
assert.equal(applyUniqueness(items, []).kept.length, 0);
// 판정 단계가 돌지 않았으면(replay·테스트·옛 캐시) 아무것도 건드리지 않는다.
assert.equal(applyUniqueness(items, undefined).kept.length, 4);
assert.equal(applyUniqueness(items, undefined).rejected.length, 0);

// 줄인 네모는 낱말+순번이 아니라 해소된 위치로 슬롯을 판다.
// further and further의 두 번째 further만 네모인데 occurrenceIndex는 0으로 남아 있다.
async function slotByPosition() {
  const text = "The point is we are getting further and further away from our design.";
  const at = text.indexOf("further", text.indexOf("further") + 1);
  let sentUser = "";
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
    sentUser = JSON.parse(JSON.parse(String(init?.body)).messages[1].content).items[0].sentence;
    return new Response(
      JSON.stringify({
        model: "m",
        choices: [{ finish_reason: "stop", message: { content: '{"results":[]}' } }],
      }),
      { status: 200 }
    );
  }) as typeof fetch;
  const narrowed = {
    ...candidate("far", "further", "far"),
    sentenceId: "s1",
    passageStart: 100 + at,
    passageEnd: 100 + at + "further".length,
  };
  await verifyChoiceUniqueness({
    apiKey: "k",
    model: "m",
    reasoningEffort: "medium",
    sentences: [{ sentenceId: "s1", text, passageStart: 100, passageEnd: 100 + text.length }],
    items: [narrowed],
  });
  globalThis.fetch = realFetch;
  assert.equal(sentUser, "The point is we are getting further and [[SLOT]] away from our design.");
  console.log("slot by position ok");
}

console.log("applyUniqueness ok");
slotByPosition().then(() => console.log("grammar-choice-v2 uniqueness tests: PASS"));
