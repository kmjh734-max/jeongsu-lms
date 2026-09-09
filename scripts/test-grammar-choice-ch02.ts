/**
 * Chapter 02 tense. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch02.ts
 */
import assert from "node:assert/strict";
import { detectVoiceCh03 } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  TENSE_CH02_RULES,
  detectTenseCh02,
  rejectTenseChoice,
  tenseLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/tense-ch02";

function questions(text: string, code?: string) {
  return detectTenseCh02(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectTenseCh02(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(TENSE_CH02_RULES.every((rule) => rule.referenceChapter === "CH02"));
assert.ok(TENSE_CH02_RULES.every((rule) => rule.timeReference && rule.temporalEvidence && rule.eventOrder));
assert.equal(ontologyPoint("TENSE_PRESENT_PAST")?.chapter, "C03");
assert.equal(ontologyPoint("TENSE_PRESENT_PAST")?.referenceChapter, "CH02");
assert.equal(ontologyPoint("TENSE_SINCE_FOR")?.referenceChapter, "CH02");
assert.equal(ontologyPoint("TENSE_TIME_CONDITION_CLAUSE")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("TENSE_REPORTED_SPEECH")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("VOICE_PERFECT_PASSIVE")?.referenceChapter, "CH03");

assert.deepEqual(spans("He visited Paris last year.", "TENSE_PRESENT_PAST"), ["visited"]);
assert.deepEqual(spans("Eisenhower once said the same thing.", "TENSE_PRESENT_PAST"), ["said"]);
assert.equal(tenseLocalDistractor("TENSE_PRESENT_PAST", "visited"), "has visited");
assert.equal(none("She works in the lab.", "TENSE_PRESENT_PAST"), true);
assert.equal(none("Darwin observed variation among the finches.", "TENSE_PRESENT_PAST"), true);
assert.ok(has("Darwin observed variation among the finches.", "TENSE_PRESENT_PAST", "HISTORICAL"));

assert.deepEqual(spans("Water boils at 100°C.", "TENSE_UNIVERSAL_TRUTH"), ["boils"]);
assert.deepEqual(spans("The sun rises every morning.", "TENSE_UNIVERSAL_TRUTH"), ["rises"]);
assert.equal(tenseLocalDistractor("TENSE_UNIVERSAL_TRUTH", "boils"), "boiled");
assert.equal(none("We actually live with uncertainty.", "TENSE_UNIVERSAL_TRUTH"), true);
assert.equal(none("The speaker lives with doubt.", "TENSE_UNIVERSAL_TRUTH"), true);
assert.ok(has("We actually live with uncertainty.", "TENSE_PRESENT_PAST", "PRESENT_STATE"));

assert.deepEqual(spans("He visited Seoul yesterday.", "TENSE_PRESENT_PERFECT_PAST"), ["visited"]);
assert.deepEqual(spans("She left the city last year.", "TENSE_PRESENT_PERFECT_PAST"), ["left"]);
assert.equal(none("Perhaps you have heard this story.", "TENSE_PRESENT_PERFECT_PAST"), true);
assert.equal(none("Our species has many kinds of minds.", "TENSE_PRESENT_PERFECT_PAST"), true);
assert.ok(has("Perhaps you have heard this story.", "TENSE_PRESENT_PERFECT_PAST", "EXPERIENCE"));
assert.ok(has("Our species has many kinds of minds.", "TENSE_PRESENT_PERFECT_PAST", "HAVE_NOUN"));

assert.deepEqual(spans("She has lived here since 2020.", "TENSE_SINCE_FOR"), ["has lived"]);
assert.deepEqual(spans("The climate has been stable for years.", "TENSE_SINCE_FOR"), ["has been"]);
assert.deepEqual(spans("This is the best book I have ever read.", "TENSE_SINCE_FOR"), ["have ever read"]);
assert.equal(tenseLocalDistractor("TENSE_SINCE_FOR", "has lived"), "lived");
assert.equal(tenseLocalDistractor("TENSE_SINCE_FOR", "has been"), "was");
assert.equal(none("The method has been used by experts.", "TENSE_SINCE_FOR"), true);
assert.equal(none("She has lived somewhere.", "TENSE_SINCE_FOR"), true);
assert.ok(has("The method has been used by experts.", "TENSE_SINCE_FOR", "VOICE_DEFER"));
assert.ok(detectVoiceCh03("The method has been used by experts.").some((hit) => hit.questionable && hit.code === "VOICE_PERFECT_PASSIVE"));

assert.deepEqual(spans("It has been three years since he left.", "TENSE_BY_THE_TIME"), ["left"]);
assert.deepEqual(spans("It has been a decade since she arrived.", "TENSE_BY_THE_TIME"), ["arrived"]);
assert.equal(tenseLocalDistractor("TENSE_BY_THE_TIME", "left"), "has left");
assert.equal(none("He left the office.", "TENSE_BY_THE_TIME"), true);
assert.equal(none("If it rains tomorrow, we will stay home.", "TENSE_BY_THE_TIME"), true);

assert.deepEqual(spans("By the time she arrived, he had already left.", "TENSE_PAST_PERFECT"), ["had already left"]);
assert.deepEqual(spans("By the time they arrived, he had already finished.", "TENSE_PAST_PERFECT"), ["had already finished"]);
assert.equal(tenseLocalDistractor("TENSE_PAST_PERFECT", "had already left"), "has already left");
assert.equal(none("He finished the letter and then she arrived.", "TENSE_PAST_PERFECT"), true);
assert.equal(none("She arrived after the meeting ended.", "TENSE_PAST_PERFECT"), true);

assert.deepEqual(spans("By next month, she will have worked here for ten years.", "TENSE_FUTURE_PERFECT"), ["will have worked"]);
assert.deepEqual(spans("By next year, she will have finished the project.", "TENSE_FUTURE_PERFECT"), ["will have finished"]);
assert.equal(tenseLocalDistractor("TENSE_FUTURE_PERFECT", "will have worked"), "has worked");
assert.equal(none("She will work here next month.", "TENSE_FUTURE_PERFECT"), true);
assert.equal(none("They are going to help the team.", "TENSE_FUTURE_PERFECT"), true);
assert.ok(has("The train leaves at six tomorrow.", "TENSE_EXPLICIT_TIME_MARKER", "SCHEDULED_PRESENT"));
assert.ok(has("She is meeting the director tomorrow.", "TENSE_EXPLICIT_TIME_MARKER", "PLAN_PROGRESSIVE"));
assert.equal(none("The train leaves at six tomorrow.", "TENSE_EXPLICIT_TIME_MARKER"), true);
assert.equal(none("They will help, and they are going to help.", "TENSE_EXPLICIT_TIME_MARKER"), true);

assert.deepEqual(spans("I have known him for years.", "TENSE_PROGRESSIVE"), ["have known"]);
assert.deepEqual(spans("This bag belongs to her.", "TENSE_PROGRESSIVE"), ["belongs"]);
assert.equal(tenseLocalDistractor("TENSE_PROGRESSIVE", "have known"), "have been knowing");
assert.equal(tenseLocalDistractor("TENSE_PROGRESSIVE", "belongs"), "is belonging");
assert.equal(none("I have been thinking about the plan.", "TENSE_PROGRESSIVE"), true);
assert.equal(none("She sees the doctor tomorrow.", "TENSE_PROGRESSIVE"), true);

assert.ok(has("The letter was written in German.", "TENSE_PRESENT_PAST", "PAST_PASSIVE"));
assert.equal(none("The letter was written in German.", "TENSE_PRESENT_PAST"), true);
assert.equal(none("She said that he was tired.", "TENSE_SEQUENCE"), true);
assert.equal(
  rejectTenseChoice({
    pointCode: "TENSE_PRESENT_PAST",
    correct: "work",
    wrong: "works",
    sentence: "She works in the lab.",
  }),
  "MECHANICAL_MODAL_FORM"
);

assert.equal(localTemplateDistractor("TENSE_PRESENT_PAST", "visited"), "has visited");
assert.equal(localTemplateDistractor("TENSE_SINCE_FOR", "has lived"), "lived");
assert.equal(localTemplateDistractor("TENSE_PROGRESSIVE", "belongs"), "is belonging");

console.log("grammar-choice ch02 tense: PASS");
