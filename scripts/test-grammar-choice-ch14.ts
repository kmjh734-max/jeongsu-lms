/**
 * Chapter 14 special constructions. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch14.ts
 */
import assert from "node:assert/strict";
import { detectConditionalCh05 } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  SPECIAL_CH14_RULES,
  detectSpecialCh14,
  rejectSpecialChoice,
  specialLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/special-ch14";

function questions(text: string, code?: string) {
  return detectSpecialCh14(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, span?: string) {
  return detectSpecialCh14(text).some(
    (hit) => hit.code === code && (!span || hit.sourceSpan.toLowerCase() === span.toLowerCase())
  );
}

assert.ok(SPECIAL_CH14_RULES.every((rule) => rule.referenceChapter === "CH14"));
assert.ok(SPECIAL_CH14_RULES.every((rule) => rule.triggerExpression && rule.requiredWordOrder));
assert.equal(ontologyPoint("INVERSION_NEGATIVE")?.chapter, "C14");
assert.equal(ontologyPoint("INVERSION_NEGATIVE")?.referenceChapter, "CH14");
assert.equal(ontologyPoint("CONDITIONAL_INVERTED_HAD")?.referenceChapter, "CH05");
assert.equal(ontologyPoint("CLEFT_IT_THAT")?.code, "CLEFT_IT_THAT");

assert.deepEqual(spans("Never have I seen such a sight.", "INVERSION_NEGATIVE"), ["have i seen"]);
assert.deepEqual(spans("Rarely do we meet such a person.", "INVERSION_NEGATIVE"), ["do we meet"]);
assert.equal(specialLocalDistractor("INVERSION_NEGATIVE", "have I seen"), "I have seen");
assert.equal(none("I have never seen such a sight.", "INVERSION_NEGATIVE"), true);
assert.equal(none("She rarely meets such a person.", "INVERSION_NEGATIVE"), true);

assert.deepEqual(spans("Not until midnight did he return.", "INVERSION_NEGATIVE"), ["did he return"]);
assert.deepEqual(spans("Not until Monday did she leave.", "INVERSION_NEGATIVE"), ["did she leave"]);
assert.equal(specialLocalDistractor("INVERSION_NEGATIVE", "did he return"), "he returned");
assert.equal(none("He did not return until midnight.", "INVERSION_NEGATIVE"), true);
assert.equal(none("They waited until midnight.", "INVERSION_NEGATIVE"), true);

assert.deepEqual(spans("Only then did I understand the truth.", "INVERSION_ONLY"), ["did i understand"]);
assert.deepEqual(spans("Only after the talk did they understand the point.", "INVERSION_ONLY"), ["did they understand"]);
assert.equal(specialLocalDistractor("INVERSION_ONLY", "did I understand"), "I understood");
assert.equal(none("I understood the truth only then.", "INVERSION_ONLY"), true);
assert.equal(none("Only the truth mattered to them.", "INVERSION_ONLY"), true);

assert.deepEqual(spans("No sooner had she arrived than it began to rain.", "INVERSION_NEGATIVE"), ["had she arrived"]);
assert.equal(specialLocalDistractor("INVERSION_NEGATIVE", "had she arrived"), "she had arrived");

assert.deepEqual(spans("Here comes the bus.", "INVERSION_PLACE_DIRECTION"), ["comes the bus"]);
assert.deepEqual(spans("Here he comes.", "INVERSION_PLACE_DIRECTION"), ["he comes"]);
assert.equal(specialLocalDistractor("INVERSION_PLACE_DIRECTION", "comes the bus"), "the bus comes");
assert.equal(specialLocalDistractor("INVERSION_PLACE_DIRECTION", "he comes"), "comes he");
assert.equal(none("The bus comes here every hour.", "INVERSION_PLACE_DIRECTION"), true);
assert.equal(none("There is a bus at the corner.", "INVERSION_PLACE_DIRECTION"), true);

assert.deepEqual(spans("So do I.", "INVERSION_SO_NEITHER"), ["do i"]);
assert.deepEqual(spans("Neither can she.", "INVERSION_SO_NEITHER"), ["can she"]);
assert.equal(specialLocalDistractor("INVERSION_SO_NEITHER", "do I"), "I do");
assert.equal(specialLocalDistractor("INVERSION_SO_NEITHER", "can she"), "she can");
assert.equal(none("I do too.", "INVERSION_SO_NEITHER"), true);
assert.equal(none("She left so that he could rest.", "INVERSION_SO_NEITHER"), true);

assert.deepEqual(spans("So great was the noise that we left.", "INVERSION_COMPLEMENT"), ["was the noise"]);
assert.equal(none("The noise was great that night.", "INVERSION_COMPLEMENT"), true);

assert.deepEqual(spans("What he did do was apologize.", "EMPHATIC_DO"), ["did do"]);
assert.deepEqual(spans("What she did do was apologize.", "EMPHATIC_DO"), ["did do"]);
assert.equal(specialLocalDistractor("EMPHATIC_DO", "did do"), "did");
assert.equal(none("I do like this plan.", "EMPHATIC_DO"), true);
assert.equal(none("She could try the door again.", "EMPHATIC_DO"), true);

assert.deepEqual(spans("It was not until midnight that he returned.", "CLEFT_IT_THAT"), ["that"]);
assert.deepEqual(spans("It was not until Monday that she left.", "CLEFT_IT_THAT"), ["that"]);
assert.equal(specialLocalDistractor("CLEFT_IT_THAT", "that"), "when");
assert.ok(has("It is important that he left early.", "DUMMY_IT_SUBJECT"));
assert.equal(none("It is important that he left early.", "CLEFT_IT_THAT"), true);
assert.ok(has("It was John that called last night.", "CLEFT_IT_THAT"));
assert.equal(none("It was John that called last night."), true);
assert.equal(
  rejectSpecialChoice({
    pointCode: "CLEFT_IT_THAT",
    correct: "that",
    wrong: "who",
    sentence: "It was John that called last night.",
  }),
  "BOTH_GRAMMATICAL"
);

assert.deepEqual(spans("the fact that he refused the offer", "APPOSITIVE_THAT"), ["that"]);
assert.deepEqual(spans("the news that he had won the prize", "APPOSITIVE_THAT"), ["that"]);
assert.equal(specialLocalDistractor("APPOSITIVE_THAT", "that"), "what");
assert.equal(specialLocalDistractor("APPOSITIVE_THAT", "that", "APPOSITIVE_NEWS"), "which");
assert.equal(none("the book that he read yesterday", "APPOSITIVE_THAT"), true);
assert.equal(none("the members who are well suited", "APPOSITIVE_THAT"), true);

assert.deepEqual(spans("My brother, along with his friends, is attending.", "INSERTION"), ["is"]);
assert.deepEqual(spans("The students, together with the teacher, are waiting.", "INSERTION"), ["are"]);
assert.equal(specialLocalDistractor("INSERTION", "is"), "are");
assert.equal(none("My brother is attending tonight.", "INSERTION"), true);
assert.equal(none("The friends are attending tonight.", "INSERTION"), true);

assert.deepEqual(spans("She wants not fame but respect.", "NEGATION_SCOPE"), ["but"]);
assert.deepEqual(spans("He bought not coffee but tea.", "NEGATION_SCOPE"), ["but"]);
assert.ok(has("Not all students passed the quiz.", "PARTIAL_NEGATION"));
assert.equal(none("Not all students passed the quiz."), true);
assert.ok(has("Few mistakes, if any, remain in the draft.", "ELLIPSIS_COMMON_ELEMENT"));
assert.equal(none("Few mistakes, if any, remain in the draft."), true);
assert.ok(has("She runs faster than he does.", "ELLIPSIS_SUBSTITUTION"));
assert.equal(none("She runs faster than he does."), true);

const had = "Had I known the truth, I would have called.";
assert.equal(detectSpecialCh14(had).length, 0);
assert.ok(detectConditionalCh05(had).some((hit) => hit.code === "CONDITIONAL_INVERTED_HAD"));
assert.equal(detectSpecialCh14("Were she here, she would help.").length, 0);
assert.equal(detectSpecialCh14("Should he fail, we would stop.").length, 0);

assert.equal(localTemplateDistractor("INVERSION_NEGATIVE", "have I seen"), "I have seen");
assert.equal(localTemplateDistractor("CLEFT_IT_THAT", "that"), "when");
assert.equal(localTemplateDistractor("EMPHATIC_DO", "did do"), "did");

console.log("grammar-choice ch14 special constructions: PASS");
