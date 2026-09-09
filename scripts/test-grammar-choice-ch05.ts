/**
 * Chapter 05 conditional rules. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch05.ts
 */
import assert from "node:assert/strict";
import {
  CONDITIONAL_CH05_RULES,
  conditionalLocalDistractor,
  detectConditionalCh05,
  rejectConditionalChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { scanLocalMandatory } from "../src/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import { segmentPassage } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";

function spans(text: string, code: string) {
  return detectConditionalCh05(text)
    .filter((hit) => hit.code === code)
    .map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  const hits = detectConditionalCh05(text);
  return code ? hits.filter((hit) => hit.code === code) : hits;
}

assert.ok(CONDITIONAL_CH05_RULES.every((rule) => rule.referenceChapter === "CH05"));
assert.equal(ontologyPoint("CONDITIONAL_SECOND")?.chapter, "C06");
assert.equal(ontologyPoint("CONDITIONAL_SECOND")?.referenceChapter, "CH05");
assert.equal(ontologyPoint("CONDITIONAL_SECOND")?.code, "CONDITIONAL_SECOND");

const darwin =
  "If we all had the same kind of mind—if there were only one human nature—then when disaster struck, we might become extinct.";
const darwinHits = detectConditionalCh05(darwin);
assert.ok(darwinHits.some((hit) => hit.code === "CONDITIONAL_SECOND" && hit.sourceSpan === "had"));
assert.ok(darwinHits.some((hit) => hit.code === "CONDITIONAL_SECOND" && hit.sourceSpan === "were"));
assert.equal(conditionalLocalDistractor("CONDITIONAL_SECOND", "had"), null);
assert.equal(conditionalLocalDistractor("CONDITIONAL_SECOND", "were"), null);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "had",
    wrong: "would have",
    sentence: darwin,
  }),
  "MECHANICAL_IF_WOULD_CONTRAST"
);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "were",
    wrong: "would be",
    sentence: darwin,
  }),
  "MECHANICAL_IF_WOULD_CONTRAST"
);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "had",
    wrong: "had had",
    sentence: darwin,
  }),
  "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR"
);

const open =
  "If there's a huge change in the environment, a species without much variation might be completely wiped out.";
assert.equal(detectConditionalCh05(open).length, 0);
const scanned = scanLocalMandatory(segmentPassage(open, [{ id: "s1", english: open }]));
assert.equal(scanned.filter((hint) => hint.pointCode.startsWith("CONDITIONAL_")).length, 0);

assert.deepEqual(spans("If she knew the plan, she would stay home.", "CONDITIONAL_SECOND"), ["knew"]);
assert.deepEqual(spans("If he lived nearby, he could visit us.", "CONDITIONAL_SECOND"), ["lived"]);
assert.equal(none("If it rained yesterday, the game was canceled.", "CONDITIONAL_SECOND").length, 0);
assert.equal(none("If it is sunny tomorrow, we will go out.", "CONDITIONAL_SECOND").length, 0);

assert.deepEqual(spans("If I had known the truth, I would have told you.", "CONDITIONAL_THIRD"), ["had"]);
assert.deepEqual(spans("If she had left earlier, she could have caught the train.", "CONDITIONAL_THIRD"), ["had"]);
assert.equal(none("If she had a ticket, she would enter.", "CONDITIONAL_THIRD").length, 0);
assert.equal(none("If I had the same book, I might lend it.", "CONDITIONAL_THIRD").length, 0);

assert.deepEqual(
  spans("If I had studied harder, I would be successful now.", "CONDITIONAL_MIXED"),
  ["would"]
);
assert.deepEqual(
  spans("If she had left yesterday, she would be here today.", "CONDITIONAL_MIXED"),
  ["would"]
);
assert.equal(none("If I had studied harder, I would have passed then.", "CONDITIONAL_MIXED").length, 0);
assert.equal(none("If I studied now, I would pass today.", "CONDITIONAL_MIXED").length, 0);

assert.ok(spans("Had I known the truth, I would have called you.", "CONDITIONAL_INVERTED_HAD").includes("known"));
assert.ok(spans("Had she seen the sign, she would have stopped.", "CONDITIONAL_INVERTED_HAD").includes("seen"));
assert.equal(none("Had I known? I would have called.", "CONDITIONAL_INVERTED_HAD").length, 0);
assert.equal(none("If I had known the truth, I would have called.", "CONDITIONAL_INVERTED_HAD").length, 0);

assert.ok(spans("Were she richer, she would travel more.", "CONDITIONAL_INVERTED_WERE").includes("were"));
assert.ok(spans("Were he here, he could help us.", "CONDITIONAL_INVERTED_WERE").includes("were"));
assert.equal(conditionalLocalDistractor("CONDITIONAL_INVERTED_WERE", "Were"), "If");
assert.equal(none("If she were richer, she would travel more.", "CONDITIONAL_INVERTED_WERE").length, 0);
assert.equal(none("Were they late?", "CONDITIONAL_INVERTED_WERE").length, 0);
assert.equal(none("The children were tired, so they stayed home.", "CONDITIONAL_INVERTED_WERE").length, 0);

assert.ok(spans("Should he fail, we would stop the plan.", "CONDITIONAL_INVERTED_SHOULD").includes("fail"));
assert.ok(spans("Should it rain, we might cancel the trip.", "CONDITIONAL_INVERTED_SHOULD").includes("rain"));
assert.equal(none("Should I try again?", "CONDITIONAL_INVERTED_SHOULD").length, 0);
assert.equal(none("You should try this soup.", "CONDITIONAL_INVERTED_SHOULD").length, 0);

assert.deepEqual(spans("I wish I knew the answer.", "WISH_PAST"), ["knew"]);
assert.deepEqual(spans("I wish she lived closer.", "WISH_PAST"), ["lived"]);
assert.equal(none("I wish you luck on the exam.", "WISH_PAST").length, 0);
assert.equal(none("I wish I was taller.", "WISH_PAST").length, 0);

assert.deepEqual(spans("I wish I had studied harder.", "WISH_PAST_PERFECT"), ["had studied"]);
assert.deepEqual(spans("I wish she had left earlier.", "WISH_PAST_PERFECT"), ["had left"]);
assert.equal(none("I wish I studied harder yesterday.", "WISH_PAST_PERFECT").length, 0);
assert.equal(none("I wish you success.", "WISH_PAST_PERFECT").length, 0);
assert.equal(conditionalLocalDistractor("WISH_PAST_PERFECT", "had studied"), "studied");

assert.deepEqual(spans("I wish you would stay longer.", "WISH_WOULD"), ["would"]);
assert.deepEqual(spans("I wish he would stop talking.", "WISH_WOULD"), ["would"]);
assert.equal(none("I wish I knew the answer.", "WISH_WOULD").length, 0);
assert.equal(none("I wish you luck.", "WISH_WOULD").length, 0);

assert.deepEqual(spans("He talks as if he knew the answer.", "AS_IF_PAST"), ["knew"]);
assert.deepEqual(spans("She acts as though she lived there.", "AS_IF_PAST"), ["lived"]);
assert.equal(none("He talks as if he knows the answer.", "AS_IF_PAST").length, 0);
assert.equal(none("He looked tired as if he knew, and he does.", "AS_IF_PAST").length, 0);

assert.deepEqual(spans("He talks as if he had seen a ghost.", "AS_IF_PAST_PERFECT"), ["had seen"]);
assert.deepEqual(spans("She looks as though she had lost the key.", "AS_IF_PAST_PERFECT"), ["had lost"]);
assert.equal(none("He talks as if he knows the plan.", "AS_IF_PAST_PERFECT").length, 0);
assert.equal(none("He talks as if he knew the plan.", "AS_IF_PAST_PERFECT").length, 0);

assert.deepEqual(spans("Without your help, I would fail the test.", "WITHOUT_IF_CONDITION"), ["would"]);
assert.deepEqual(spans("But for the rain, we would start now.", "WITHOUT_IF_CONDITION"), ["would"]);
assert.equal(none("A species without much variation might disappear.", "WITHOUT_IF_CONDITION").length, 0);
assert.equal(none("Without a map, the hikers turned back.", "WITHOUT_IF_CONDITION").length, 0);

assert.deepEqual(spans("Hurry up; otherwise we would miss the train.", "OTHERWISE_CONDITIONAL"), ["would"]);
assert.deepEqual(spans("Leave now, otherwise she would wait all night.", "OTHERWISE_CONDITIONAL"), ["would"]);
assert.equal(none("Leave now; otherwise we miss the train.", "OTHERWISE_CONDITIONAL").length, 0);
assert.equal(none("The plan was otherwise unchanged.", "OTHERWISE_CONDITIONAL").length, 0);

assert.ok(spans("If only I had known the risk.", "IF_ONLY").includes("had known"));
assert.ok(spans("If only she were here with us.", "IF_ONLY").includes("were"));
assert.equal(none("Only if you call will I leave.", "IF_ONLY").length, 0);
assert.equal(none("If only it is true, we can relax.", "IF_ONLY").length, 0);

assert.deepEqual(spans("It is time you went home.", "IT_IS_TIME_SUBJUNCTIVE"), ["went"]);
assert.deepEqual(spans("It is high time she left the room.", "IT_IS_TIME_SUBJUNCTIVE"), ["left"]);
assert.equal(none("It is time to go home.", "IT_IS_TIME_SUBJUNCTIVE").length, 0);
assert.equal(none("It is time for lunch.", "IT_IS_TIME_SUBJUNCTIVE").length, 0);

assert.deepEqual(spans("I would rather stay home tonight.", "WOULD_RATHER_SUBJUNCTIVE"), []);
assert.deepEqual(
  detectConditionalCh05("I would rather you went home.")
    .filter((hit) => hit.code === "WOULD_RATHER_SUBJUNCTIVE" && !hit.exclusionReason)
    .map((hit) => [hit.subtype, hit.sourceSpan.toLowerCase()]),
  [["PRESENT_FUTURE_PREFERENCE", "went"]]
);
assert.equal(conditionalLocalDistractor("WOULD_RATHER_SUBJUNCTIVE", "went"), "will go");
assert.equal(conditionalLocalDistractor("WOULD_RATHER_SUBJUNCTIVE", "had told"), "told");
assert.equal(
  detectConditionalCh05("I would rather you stayed home yesterday.").find((hit) => hit.code === "WOULD_RATHER_SUBJUNCTIVE")
    ?.exclusionReason,
  "AMBIGUOUS_TENSE"
);
assert.equal(
  CONDITIONAL_CH05_RULES.find((rule) => rule.subtype === "PRESENT_FUTURE_PREFERENCE")?.ownerChapter,
  "CH05"
);
assert.equal(
  CONDITIONAL_CH05_RULES.find((rule) => rule.subtype === "PAST_REGRET")?.referenceChapter,
  "CH05"
);
assert.equal(none("I would rather try this method.", "WOULD_RATHER").length, 0);
assert.equal(none("They would rather not.", "WOULD_RATHER").length, 0);

assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "if",
    wrong: "unless",
    sentence: "If we all had the same mind, we might agree.",
  }),
  "MEANING_ONLY_CONTRAST"
);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "was",
    wrong: "were",
    sentence: "The result was clear.",
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "If we all had the same kind of mind",
    wrong: "If we all would have the same kind of mind",
    sentence: darwin,
  }),
  "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR"
);

const second = "If she were more careful in general, she would make fewer mistakes.";
assert.equal(spans(second, "CONDITIONAL_SECOND").includes("were"), true);
assert.equal(none(second, "CONDITIONAL_THIRD").length, 0);
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "were",
    wrong: "had been",
    sentence: second,
  }),
  null
);

const third = "If she had been more careful yesterday, she would not have made that mistake.";
assert.ok(spans(third, "CONDITIONAL_THIRD").includes("had"));
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_THIRD",
    correct: "had been",
    wrong: "were",
    sentence: third,
  }),
  null
);

const result = "If she had left earlier, she would have caught the train.";
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_THIRD",
    correct: "would have caught",
    wrong: "would catch",
    sentence: result,
  }),
  null
);

const mixed = "If he had taken the medicine then, he would be better now.";
assert.ok(spans(mixed, "CONDITIONAL_MIXED").length > 0);
assert.equal(none(mixed, "CONDITIONAL_SECOND").length, 0);
assert.equal(none(mixed, "CONDITIONAL_THIRD").length, 0);

const ambiguous = "If she were here, she would help them.";
assert.equal(
  rejectConditionalChoice({
    pointCode: "CONDITIONAL_SECOND",
    correct: "were",
    wrong: "had been",
    sentence: ambiguous,
  }),
  "AMBIGUOUS_CONDITIONAL_TIME"
);

console.log(
  JSON.stringify({
    rules: CONDITIONAL_CH05_RULES.map((rule) => ({
      code: rule.code,
      subtype: rule.subtype,
      pairs: rule.allowedMinimalPairs,
    })),
  })
);
console.log("grammar-choice-ch05 tests: PASS");
