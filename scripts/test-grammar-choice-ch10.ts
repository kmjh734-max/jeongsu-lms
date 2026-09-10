/**
 * Chapter 10 conjunction rules. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch10.ts
 */
import assert from "node:assert/strict";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  CONJUNCTION_CH10_RULES,
  conjunctionLocalDistractor,
  detectConjunctionCh10,
  rejectConjunctionChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";

function questions(text: string, code?: string) {
  return detectConjunctionCh10(text).filter(
    (hit) => hit.questionable && (!code || hit.code === code)
  );
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

assert.ok(CONJUNCTION_CH10_RULES.every((rule) => rule.referenceChapter === "CH10"));
assert.ok(CONJUNCTION_CH10_RULES.every((rule) => rule.clauseRequirement && rule.detectionSignals.length));
assert.equal(ontologyPoint("NOUN_CLAUSE_THAT")?.chapter, "C09");
assert.equal(ontologyPoint("NOUN_CLAUSE_THAT")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("CORRELATIVE_BOTH_AND")?.chapter, "C11");
assert.equal(ontologyPoint("CORRELATIVE_BOTH_AND")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("INDIRECT_QUESTION_ORDER")?.chapter, "C09");
assert.equal(ontologyPoint("INDIRECT_QUESTION_ORDER")?.referenceChapter, "CH10");

const loaIndirect = "Consider what limiting beliefs you have about money.";
const howOrder = "Ask how things should be arranged around you.";
const bothAnd = "The same custom appears both within a single culture and across cultures.";
const becauseClause = "This matters because variation is critical to survival.";
const evenThough = "People still decide even though we actually live with enormous uncertainty.";

assert.deepEqual(spans(loaIndirect, "INDIRECT_QUESTION_ORDER"), ["you have"]);
assert.equal(conjunctionLocalDistractor("INDIRECT_QUESTION_ORDER", "you have"), "do you have");
assert.equal(none(loaIndirect, "NOUN_CLAUSE_THAT"), true);
assert.deepEqual(spans(howOrder, "INDIRECT_QUESTION_ORDER"), ["things should"]);
assert.equal(conjunctionLocalDistractor("INDIRECT_QUESTION_ORDER", "things should"), "should things");
assert.deepEqual(spans(bothAnd, "CORRELATIVE_BOTH_AND"), ["and"]);
assert.equal(conjunctionLocalDistractor("CORRELATIVE_BOTH_AND", "and"), "or");
assert.deepEqual(spans(becauseClause, "CONJUNCTION_PREPOSITION_CONTRAST"), ["because"]);
assert.equal(conjunctionLocalDistractor("CONJUNCTION_PREPOSITION_CONTRAST", "because"), "because of");
assert.deepEqual(spans(evenThough, "CONJUNCTION_PREPOSITION_CONTRAST"), ["even though"]);
assert.equal(conjunctionLocalDistractor("CONJUNCTION_PREPOSITION_CONTRAST", "even though"), "despite");
assert.deepEqual(
  spans("Even when you first drank milk, there was a choice.", "CONJUNCTION_PREPOSITION_CONTRAST"),
  ["when"]
);
assert.equal(conjunctionLocalDistractor("CONJUNCTION_PREPOSITION_CONTRAST", "when"), "during");
assert.ok(
  none("I remember the day when he arrived home.", "CONJUNCTION_PREPOSITION_CONTRAST")
);

assert.equal(
  none("Nothing changes if you don't truly believe the claim.", "ADVERB_CLAUSE_CONDITION"),
  true
);
assert.equal(
  rejectConjunctionChoice({
    pointCode: "ADVERB_CLAUSE_CONDITION",
    correct: "if",
    wrong: "unless",
    sentence: "Nothing changes if you don't truly believe the claim.",
  }),
  "MEANING_ONLY_CONTRAST"
);
assert.equal(none("I wonder whether she will agree later.", "NOUN_CLAUSE_WHETHER_IF"), true);
assert.equal(none("I don't know if she is ready now.", "NOUN_CLAUSE_WHETHER_IF"), true);
assert.equal(
  rejectConjunctionChoice({
    pointCode: "INDIRECT_QUESTION_ORDER",
    correct: "what limiting beliefs you have about money",
    wrong: "what limiting beliefs do you have about money",
    sentence: loaIndirect,
  }),
  "NON_MINIMAL_SPAN"
);
assert.equal(
  rejectConjunctionChoice({
    pointCode: "PARALLEL_AND_OR_BUT",
    correct: "and",
    wrong: "but",
    sentence: "She stayed and she listened.",
  }),
  "MEANING_ONLY_CONTRAST"
);

assert.ok(
  detectConjunctionCh10("He studied hard, so he passed the exam.").some(
    (hit) => hit.code === "PARALLEL_AND_OR_BUT" && !hit.questionable
  )
);
assert.ok(
  detectConjunctionCh10("She was tired, yet she finished the work.").some(
    (hit) => hit.code === "PARALLEL_AND_OR_BUT" && !hit.questionable
  )
);
assert.equal(none("He studied hard, but he failed the test."), true);
assert.equal(none("She can stay or she can leave now."), true);

assert.deepEqual(spans("She can choose either tea or coffee.", "CORRELATIVE_EITHER_OR"), ["or"]);
assert.deepEqual(spans("Either you call her or you write a note.", "CORRELATIVE_EITHER_OR"), ["or"]);
assert.equal(none("She can stay or she can leave now.", "CORRELATIVE_EITHER_OR"), true);
assert.equal(none("You or I can finish this.", "CORRELATIVE_EITHER_OR"), true);

assert.deepEqual(spans("Neither the teacher nor the students arrived.", "CORRELATIVE_NEITHER_NOR"), ["nor"]);
assert.deepEqual(spans("He is neither rich nor famous today.", "CORRELATIVE_NEITHER_NOR"), ["nor"]);
assert.equal(none("She is not rich or famous today.", "CORRELATIVE_NEITHER_NOR"), true);
assert.equal(none("The students arrived late today.", "CORRELATIVE_NEITHER_NOR"), true);

assert.deepEqual(
  spans("The trip changed not only the price but also the quality.", "CORRELATIVE_NOT_ONLY_BUT_ALSO"),
  ["but also"]
);
assert.deepEqual(
  spans("She not only sings but also dances well.", "CORRELATIVE_NOT_ONLY_BUT_ALSO"),
  ["but also"]
);
assert.equal(none("She sings and dances well.", "CORRELATIVE_NOT_ONLY_BUT_ALSO"), true);
assert.equal(none("The price and the quality both changed.", "CORRELATIVE_NOT_ONLY_BUT_ALSO"), true);

assert.deepEqual(
  spans("They acknowledge that cognitive biases can influence everybody.", "NOUN_CLAUSE_THAT"),
  ["that"]
);
assert.deepEqual(
  spans("The truth is that all tongue regions participate equally.", "NOUN_CLAUSE_THAT"),
  ["that"]
);
assert.equal(conjunctionLocalDistractor("NOUN_CLAUSE_THAT", "that"), "what");
assert.equal(none("I like the book that we read yesterday.", "NOUN_CLAUSE_THAT"), true);
assert.equal(none("I know he left early yesterday.", "NOUN_CLAUSE_THAT"), true);

assert.ok(spans("They argued about whether the plan would work.", "NOUN_CLAUSE_WHETHER_IF").includes("whether"));
assert.ok(spans("She could not decide whether to stay longer.", "NOUN_CLAUSE_WHETHER_IF").includes("whether"));
assert.ok(spans("Whether she comes is still unclear.", "NOUN_CLAUSE_WHETHER_IF").includes("whether"));
assert.equal(conjunctionLocalDistractor("NOUN_CLAUSE_WHETHER_IF", "whether"), "if");

assert.deepEqual(spans("Tell me what new ideas you have now.", "INDIRECT_QUESTION_ORDER"), ["you have"]);
assert.equal(none("How should things be arranged?", "INDIRECT_QUESTION_ORDER"), true);
assert.equal(none("You can create images of what you want.", "INDIRECT_QUESTION_ORDER"), true);
assert.equal(none("We visited the town where she was born.", "INDIRECT_QUESTION_ORDER"), true);

assert.deepEqual(spans("She told the students to wait outside.", "TENSE_REPORTED_SPEECH"), ["to"]);
assert.deepEqual(spans("He asked them to leave quietly.", "TENSE_REPORTED_SPEECH"), ["to"]);
assert.equal(none("She said that she was tired yesterday.", "TENSE_REPORTED_SPEECH"), true);
assert.equal(none("She said that water boils at that point.", "TENSE_REPORTED_SPEECH"), true);

assert.deepEqual(spans("While she was waiting, the bus left.", "ADVERB_CLAUSE_TIME"), ["while"]);
assert.deepEqual(spans("Wait here until she arrives later.", "ADVERB_CLAUSE_TIME"), ["until"]);
assert.equal(conjunctionLocalDistractor("ADVERB_CLAUSE_TIME", "while"), "during");
assert.equal(none("We visited the town where she was born.", "ADVERB_CLAUSE_TIME"), true);
assert.equal(none("After finishing the work, he left.", "ADVERB_CLAUSE_TIME"), true);

assert.ok(
  detectConjunctionCh10("If it rains tomorrow, we will stay home.").some(
    (hit) => hit.code === "ADVERB_CLAUSE_CONDITION" && !hit.questionable
  )
);
assert.ok(
  detectConjunctionCh10("When she arrives, we will start the lesson.").some(
    (hit) => hit.code === "ADVERB_CLAUSE_CONDITION" && !hit.questionable
  ) === false
);
assert.equal(none("I wonder if he will come tomorrow.", "ADVERB_CLAUSE_CONDITION"), true);
assert.equal(none("If she were here, she would help us.", "ADVERB_CLAUSE_CONDITION"), true);

assert.deepEqual(spans("When she arrives, we will start the lesson.", "TENSE_TIME_CONDITION_CLAUSE"), ["arrives"]);
assert.deepEqual(spans("If it rains tomorrow, we will stay home.", "TENSE_TIME_CONDITION_CLAUSE"), ["rains"]);
assert.equal(conjunctionLocalDistractor("TENSE_TIME_CONDITION_CLAUSE", "arrives"), "will arrive");
assert.equal(conjunctionLocalDistractor("TENSE_TIME_CONDITION_CLAUSE", "rains"), "will rain");
assert.equal(none("If you will wait a moment, I will help you.", "TENSE_TIME_CONDITION_CLAUSE"), true);
assert.equal(none("If you would be so kind, I would be grateful.", "TENSE_TIME_CONDITION_CLAUSE"), true);
assert.equal(none("I wonder if he will come tomorrow.", "TENSE_TIME_CONDITION_CLAUSE"), true);
assert.equal(none("If she were here, she would help us.", "TENSE_TIME_CONDITION_CLAUSE"), true);

assert.deepEqual(spans("They left early because the weather was bad.", "CONJUNCTION_PREPOSITION_CONTRAST"), ["because"]);
assert.deepEqual(
  spans("The game was canceled because of the heavy rain.", "CONJUNCTION_PREPOSITION_CONTRAST"),
  ["because of"]
);
assert.deepEqual(
  spans("Although she was tired, she finished the work.", "CONJUNCTION_PREPOSITION_CONTRAST"),
  ["although"]
);
assert.deepEqual(spans("They went out despite the heavy rain.", "CONJUNCTION_PREPOSITION_CONTRAST"), ["despite"]);
assert.equal(none("They left since the weather was bad.", "CONJUNCTION_PREPOSITION_CONTRAST"), true);
assert.equal(none("They stayed because maybe later.", "CONJUNCTION_PREPOSITION_CONTRAST"), true);

assert.deepEqual(
  spans("She spoke slowly so that they could follow her.", "ADVERB_CLAUSE_PURPOSE"),
  ["so that"]
);
assert.deepEqual(
  spans("He left early in order that he might catch the train.", "ADVERB_CLAUSE_PURPOSE"),
  ["in order that"]
);
assert.equal(conjunctionLocalDistractor("ADVERB_CLAUSE_PURPOSE", "so that"), "in order to");
assert.equal(none("She left so she could rest at home.", "ADVERB_CLAUSE_PURPOSE"), true);
assert.equal(none("She left in order to catch the train.", "ADVERB_CLAUSE_PURPOSE"), true);

assert.deepEqual(
  spans("The puzzle was so difficult that students cannot solve it.", "ADVERB_CLAUSE_RESULT"),
  ["that"]
);
assert.deepEqual(
  spans("It was such a hard problem that students cannot solve it.", "ADVERB_CLAUSE_RESULT"),
  ["that"]
);
assert.equal(conjunctionLocalDistractor("ADVERB_CLAUSE_RESULT", "that"), "to");
assert.equal(none("The puzzle was very difficult for students.", "ADVERB_CLAUSE_RESULT"), true);
assert.equal(none("She spoke slowly so that they could follow.", "ADVERB_CLAUSE_RESULT"), true);

const tooRelation = CONJUNCTION_CH10_RULES.find((rule) => rule.code === "RESULT_RELATION_TOO_TO");
const enoughRelation = CONJUNCTION_CH10_RULES.find((rule) => rule.code === "RESULT_RELATION_ENOUGH_TO");
assert.equal(tooRelation?.ownerChapter, "CH10");
assert.equal(enoughRelation?.ownerChapter, "CH10");
assert.equal(tooRelation?.referenceChapter, "CH10");
assert.equal(enoughRelation?.referenceChapter, "CH10");
assert.equal(tooRelation?.analysisOnly, true);
assert.equal(enoughRelation?.analysisOnly, true);
assert.equal(tooRelation?.assessmentAxis, "RESULT_RELATION");
assert.equal(ontologyPoint("RESULT_RELATION_TOO_TO")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("RESULT_RELATION_ENOUGH_TO")?.referenceChapter, "CH10");
assert.equal(ontologyPoint("TOO_TO")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("ENOUGH_TO")?.referenceChapter, "CH06");

function analysis(text: string, code: string) {
  return detectConjunctionCh10(text).filter((hit) => hit.code === code && hit.questionable === false);
}

assert.equal(none("The puzzle is too difficult to solve quickly.", "TOO_TO"), true);
assert.equal(none("He ran too fast to stop safely.", "TOO_TO"), true);
assert.equal(none("The puzzle is too difficult to solve quickly.", "RESULT_RELATION_TOO_TO"), true);
assert.equal(analysis("The puzzle is too difficult to solve quickly.", "RESULT_RELATION_TOO_TO").length, 1);
assert.equal(analysis("He ran too fast to stop safely.", "RESULT_RELATION_TOO_TO").length, 1);
assert.equal(none("The puzzle is so difficult that students fail.", "TOO_TO"), true);
assert.equal(none("She left in order to catch the train.", "TOO_TO"), true);

assert.equal(none("The hall is large enough to hold everyone.", "ENOUGH_TO"), true);
assert.equal(none("She spoke clearly enough to be heard.", "ENOUGH_TO"), true);
assert.equal(none("The hall is large enough to hold everyone.", "RESULT_RELATION_ENOUGH_TO"), true);
assert.equal(analysis("The hall is large enough to hold everyone.", "RESULT_RELATION_ENOUGH_TO").length, 1);
assert.equal(analysis("She spoke clearly enough to be heard.", "RESULT_RELATION_ENOUGH_TO").length, 1);
assert.equal(none("The hall is large for everyone.", "ENOUGH_TO"), true);
assert.equal(none("She has enough time today.", "ENOUGH_TO"), true);

assert.equal(localTemplateDistractor("NOUN_CLAUSE_THAT", "that"), "what");
assert.equal(localTemplateDistractor("CONJUNCTION_PREPOSITION_CONTRAST", "because"), "because of");
assert.equal(localTemplateDistractor("CORRELATIVE_BOTH_AND", "and"), "or");
assert.equal(localTemplateDistractor("INDIRECT_QUESTION_ORDER", "you have"), "do you have");

console.log("grammar-choice ch10 conjunctions: PASS");
