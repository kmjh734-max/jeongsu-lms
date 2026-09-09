/**
 * Chapter 12 comparison. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch12.ts
 */
import assert from "node:assert/strict";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  COMPARISON_CH12_RULES,
  applyBasicRatioCap,
  comparisonLocalDistractor,
  detectComparisonCh12,
  rejectComparisonChoice,
  restoresSource,
  type ComparisonHit,
} from "../src/lib/lesson-materials/grammar-choice-v2/comparison-ch12";

function questions(text: string, code?: string) {
  return detectComparisonCh12(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectComparisonCh12(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(COMPARISON_CH12_RULES.every((rule) => rule.referenceChapter === "CH12"));
assert.ok(COMPARISON_CH12_RULES.every((rule) => rule.subtype && rule.allowedMinimalPairs && rule.rejectConditions));
assert.equal(ontologyPoint("COMPARATIVE")?.chapter, "C13");
assert.equal(ontologyPoint("COMPARATIVE")?.referenceChapter, "CH12");
assert.equal(ontologyPoint("AS_AS")?.referenceChapter, "CH12");
assert.equal(ontologyPoint("ONE_OF_SUPERLATIVE")?.referenceChapter, "CH12");
assert.equal(ontologyPoint("RELATIVE_NONRESTRICTIVE")?.referenceChapter, "CH11");

assert.deepEqual(spans("This method is not as reliable as the old one.", "AS_AS"), ["as"]);
assert.deepEqual(spans("She is not so careful as her sister.", "AS_AS"), ["so"]);
assert.deepEqual(spans("We have as many opportunities as they do.", "AS_AS"), ["many"]);
assert.deepEqual(spans("They need as much information as we have.", "AS_AS"), ["much"]);
assert.deepEqual(spans("She explained the rule as carefully as possible.", "AS_AS"), ["as"]);
assert.equal(comparisonLocalDistractor("AS_AS", "as"), "than");
assert.equal(comparisonLocalDistractor("AS_AS", "many"), "much");
assert.equal(none("She arrived as well as her brother.", "AS_AS"), true);
assert.equal(none("The box is twice as large as the old one.", "AS_AS"), true);
assert.ok(has("The box is twice as large as the old one.", "MULTIPLICATIVE_COMPARISON", "TIMES_AS"));

assert.deepEqual(spans("This tool is far more effective than the old one.", "COMPARATIVE"), ["more"]);
assert.deepEqual(spans("The new plan is much more useful than the last.", "COMPARATIVE"), ["more"]);
assert.deepEqual(spans("Of the two plans, this is the better one.", "COMPARATIVE"), ["better"]);
assert.deepEqual(spans("Of the two answers, hers is the more accurate one.", "COMPARATIVE"), ["more"]);
assert.equal(comparisonLocalDistractor("COMPARATIVE", "more"), "most");
assert.equal(comparisonLocalDistractor("COMPARATIVE", "better"), "best");
assert.equal(none("This result is most interesting to readers.", "COMPARATIVE"), true);
assert.equal(none("She is taller than I am.", "COMPARATIVE"), true);
assert.ok(has("He is taller than I am.", "COMPARISON_TARGET", "THAN_I_ME"));
assert.equal(none("He is taller than me.", "COMPARISON_TARGET"), true);

assert.deepEqual(spans("The more carefully we examine it, the clearer it becomes.", "THE_COMPARATIVE"), ["more"]);
assert.deepEqual(spans("The more data we collect, the clearer the pattern becomes.", "THE_COMPARATIVE"), ["more"]);
assert.equal(none("More and more students arrived early.", "THE_COMPARATIVE"), true);
assert.equal(none("The best result is already clear.", "THE_COMPARATIVE"), true);

assert.deepEqual(spans("The problem is becoming more and more difficult.", "COMPARATIVE_AND_COMPARATIVE"), ["more and more"]);
assert.deepEqual(spans("The noise grew better and better after the repair.", "COMPARATIVE_AND_COMPARATIVE"), ["better and better"]);
assert.equal(comparisonLocalDistractor("COMPARATIVE_AND_COMPARATIVE", "more and more"), "more and most");
assert.equal(none("She is more careful than her brother.", "COMPARATIVE_AND_COMPARATIVE"), true);
assert.equal(none("The city is large and quiet.", "COMPARATIVE_AND_COMPARATIVE"), true);

assert.deepEqual(spans("This is by far the most effective method.", "SUPERLATIVE"), ["most"]);
assert.deepEqual(spans("Seoul is the second largest city in the country.", "SUPERLATIVE"), ["largest"]);
assert.equal(comparisonLocalDistractor("SUPERLATIVE", "largest"), "larger");
assert.equal(comparisonLocalDistractor("SUPERLATIVE", "most"), "more");
assert.ok(has("This result is most interesting to readers.", "SUPERLATIVE", "AMBIGUOUS_MOST"));
assert.equal(none("This result is most interesting to readers.", "SUPERLATIVE"), true);
assert.equal(none("She ran quickly across the field.", "SUPERLATIVE"), true);

assert.deepEqual(spans("She is one of the most influential scientists in the field.", "ONE_OF_SUPERLATIVE"), ["scientists"]);
assert.deepEqual(spans("It is one of the most useful methods we have.", "ONE_OF_SUPERLATIVE"), ["methods"]);
assert.equal(comparisonLocalDistractor("ONE_OF_SUPERLATIVE", "scientists"), "scientist");
assert.equal(none("One of the students was late today.", "ONE_OF_SUPERLATIVE"), true);
assert.equal(none("One student was the most careful today.", "ONE_OF_SUPERLATIVE"), true);

assert.deepEqual(spans("The climate here is milder than that of the northern region.", "COMPARISON_TARGET"), ["that"]);
assert.deepEqual(spans("These results are more reliable than those of the earlier study.", "COMPARISON_TARGET"), ["those"]);
assert.deepEqual(spans("This island is larger than any other species nearby.", "COMPARISON_TARGET"), ["other"]);
assert.equal(comparisonLocalDistractor("COMPARISON_TARGET", "that"), "those");
assert.equal(comparisonLocalDistractor("COMPARISON_TARGET", "other"), "others");
assert.equal(none("The result was the one that arrived later.", "COMPARISON_TARGET"), true);
assert.equal(none("He finished earlier than I expected.", "COMPARISON_TARGET"), true);

assert.deepEqual(spans("This method is superior to the previous one.", "COMPARATIVE"), ["to"]);
assert.deepEqual(spans("Many students prefer reading to memorizing rules.", "COMPARATIVE"), ["to"]);
assert.deepEqual(spans("The result is different from the earlier report.", "COMPARATIVE"), ["from"]);
assert.equal(comparisonLocalDistractor("COMPARATIVE", "to"), "than");
assert.equal(comparisonLocalDistractor("COMPARATIVE", "from"), "than");
assert.ok(has("I would rather stay than leave.", "COMPARATIVE", "RATHER_DEFER"));
assert.equal(none("I would rather stay than leave.", "COMPARATIVE"), true);
assert.equal(none("This amount is no more than we expected.", "COMPARATIVE"), true);

const samples = [
  "This method is not as reliable as the old one.",
  "We have as many opportunities as they do.",
  "This tool is far more effective than the old one.",
  "The more carefully we examine it, the clearer it becomes.",
  "She is one of the most influential scientists in the field.",
  "The climate here is milder than that of the northern region.",
];
for (const text of samples) {
  for (const hit of detectComparisonCh12(text).filter((item) => hitQuestion(item))) {
    assert.equal(restoresSource(text, hit), true, `${hit.sourceSpan} @ ${text}`);
  }
}

function hitQuestion(hit: ComparisonHit): boolean {
  return hit.questionable;
}

const twice = "This method is far more effective than the old one and much more useful than the last.";
assert.equal(questions(twice, "COMPARATIVE").filter((hit) => hit.sourceSpan.toLowerCase() === "more").length <= 2, true);
assert.equal(new Set(questions(twice, "COMPARATIVE").map((hit) => hit.occurrenceIndex)).size, questions(twice, "COMPARATIVE").length);

assert.equal(
  rejectComparisonChoice({
    pointCode: "COMPARATIVE",
    correct: "more important",
    wrong: "importanter",
    sentence: "The issue is more important than before.",
  }),
  "IMPLAUSIBLE_DISTRACTOR"
);
assert.equal(
  rejectComparisonChoice({
    pointCode: "COMPARISON_TARGET",
    correct: "than I",
    wrong: "than me",
    sentence: "She is taller than I.",
  }),
  "BOTH_GRAMMATICAL"
);

const capped = applyBasicRatioCap([
  q("COMPARATIVE", "THAN_FRAME", "more"),
  q("THE_COMPARATIVE", "THE_MORE_THE_MORE", "more"),
  q("ONE_OF_SUPERLATIVE", "ONE_OF_PLURAL", "scientists"),
  q("COMPARATIVE", "BASIC_FORM", "more"),
  q("COMPARATIVE", "BASIC_FORM", "larger"),
  q("COMPARATIVE", "BASIC_FORM", "better"),
]);
const asked = capped.filter((hit) => hit.questionable);
const basic = asked.filter((hit) => hit.subtype === "BASIC_FORM").length;
assert.ok(basic / asked.length <= 0.25);

assert.equal(localTemplateDistractor("AS_AS", "many"), "much");
assert.equal(localTemplateDistractor("COMPARISON_TARGET", "those"), "that");
assert.equal(localTemplateDistractor("SUPERLATIVE", "largest"), "larger");

console.log("grammar-choice ch12 comparison: PASS");

function q(code: ComparisonHit["code"], subtype: string, sourceSpan: string): ComparisonHit {
  return { code, subtype, sourceSpan, occurrenceIndex: 0, questionable: true };
}
