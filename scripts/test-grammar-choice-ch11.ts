/**
 * Chapter 11 relative rules. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch11.ts
 */
import assert from "node:assert/strict";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  RELATIVE_CH11_RULES,
  detectRelativeCh11,
  rejectRelativeChoice,
  relativeLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/relative-ch11";

function questions(text: string, code?: string) {
  return detectRelativeCh11(text).filter(
    (hit) => hit.questionable && (!code || hit.code === code)
  );
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

assert.ok(RELATIVE_CH11_RULES.every((rule) => rule.referenceChapter === "CH11"));
assert.ok(RELATIVE_CH11_RULES.every((rule) => rule.antecedentRule && rule.clauseGapRule));
assert.equal(ontologyPoint("RELATIVE_NONRESTRICTIVE")?.chapter, "C10");
assert.equal(ontologyPoint("RELATIVE_NONRESTRICTIVE")?.referenceChapter, "CH11");
assert.equal(ontologyPoint("RELATIVE_WHO_WHOM")?.code, "RELATIVE_WHO_WHOM");
assert.equal(ontologyPoint("INDIRECT_QUESTION_ORDER")?.chapter, "C09");
assert.equal(ontologyPoint("INDIRECT_QUESTION_ORDER")?.referenceChapter, "CH10");

const loaComma =
  "Perhaps you have heard of the Law of Attraction, which states that similar things attract.";
const loaWhat = "You can create images of what you want.";
const loaIndirect = "Consider what limiting beliefs you have about money.";
assert.deepEqual(spans(loaComma, "RELATIVE_NONRESTRICTIVE"), ["which"]);
assert.equal(relativeLocalDistractor("RELATIVE_NONRESTRICTIVE", "which"), "that");
assert.equal(questions(loaWhat, "RELATIVE_WHAT")[0]?.sourceSpan, "what");
assert.equal(relativeLocalDistractor("RELATIVE_WHAT", "what"), "that");
assert.equal(questions(loaIndirect, "RELATIVE_WHAT").length, 0);
assert.deepEqual(spans(loaIndirect, "INDIRECT_QUESTION_ORDER"), ["you have"]);
assert.equal(relativeLocalDistractor("INDIRECT_QUESTION_ORDER", "you have"), "do you have");
assert.equal(localTemplateDistractor("INDIRECT_QUESTION_ORDER", "you have"), "do you have");

const movementPrep = "We can feel the wonder for which we were created.";
const movementThat = "It is the very thing that will help them.";
assert.deepEqual(spans(movementPrep, "RELATIVE_PREPOSITION_WHICH"), ["which"]);
assert.equal(relativeLocalDistractor("RELATIVE_PREPOSITION_WHICH", "which"), "that");
assert.deepEqual(spans(movementThat, "RELATIVE_SUBJECT"), ["that"]);
assert.equal(relativeLocalDistractor("RELATIVE_SUBJECT", "that"), "what");
assert.equal(questions(movementThat, "RELATIVE_WHAT").length, 0);

const darwin = "It preserves the members who are well suited to their environment.";
assert.deepEqual(spans(darwin, "RELATIVE_WHO_WHOM"), ["who"]);
assert.equal(questions(darwin, "RELATIVE_AGREEMENT").length, 0);
assert.equal(relativeLocalDistractor("RELATIVE_WHO_WHOM", "who"), "whom");

assert.deepEqual(spans("She found the plan which works best here.", "RELATIVE_SUBJECT"), ["which"]);
assert.deepEqual(spans("This is the idea that will change everything.", "RELATIVE_SUBJECT"), ["that"]);
assert.ok(none("I like the book that we read yesterday.", "RELATIVE_SUBJECT"));
assert.ok(none("I heard that will not happen tomorrow.", "RELATIVE_SUBJECT"));

assert.deepEqual(spans("They invited the artist whom we admired.", "RELATIVE_OBJECT"), ["whom"]);
assert.deepEqual(spans("She called the doctor whom he recommended.", "RELATIVE_OBJECT"), ["whom"]);
assert.ok(none("I like the book that we read yesterday.", "RELATIVE_OBJECT"));
assert.ok(none("the person who I met yesterday stayed late.", "RELATIVE_OBJECT"));

const omissionA = "I finished the book I bought yesterday.";
const omissionB = "She kept the letter she wrote last year.";
assert.ok(detectRelativeCh11(omissionA).some((hit) => hit.code === "RELATIVE_OMISSION" && !hit.questionable));
assert.ok(detectRelativeCh11(omissionB).some((hit) => hit.code === "RELATIVE_OMISSION" && !hit.questionable));
assert.ok(none(omissionA));
assert.ok(none(omissionB));

assert.deepEqual(spans("I met the writer whose novel won a prize.", "RELATIVE_POSSESSIVE"), ["whose"]);
assert.deepEqual(spans("She helped the girl whose bag is missing.", "RELATIVE_POSSESSIVE"), ["whose"]);
assert.ok(none("Whose book is this?", "RELATIVE_POSSESSIVE"));
assert.ok(none("Who is coming to the party tonight?", "RELATIVE_POSSESSIVE"));

assert.deepEqual(spans("She wrote about what they want next.", "RELATIVE_WHAT"), ["what"]);
assert.ok(none("the very thing that will help them.", "RELATIVE_WHAT"));
assert.ok(none("the book what you want is missing.", "RELATIVE_WHAT"));

assert.deepEqual(spans("This is the tool with which they worked.", "RELATIVE_PREPOSITION_WHICH"), ["which"]);
assert.deepEqual(spans("Nothing turns me off quicker than that, by which I mean habit.", "RELATIVE_PREPOSITION_WHICH"), ["which"]);
assert.deepEqual(spans("They crossed the river through which trade moved.", "RELATIVE_PREPOSITION_WHICH"), ["which"]);
assert.ok(none("We visited the town where she was born.", "RELATIVE_PREPOSITION_WHICH"));
assert.ok(none("I like the book which we read yesterday.", "RELATIVE_PREPOSITION_WHICH"));

assert.deepEqual(spans("She is the teacher to whom they wrote.", "RELATIVE_PREPOSITION_WHOM"), ["whom"]);
assert.deepEqual(spans("He is the friend with whom she traveled.", "RELATIVE_PREPOSITION_WHOM"), ["whom"]);
assert.ok(none("She is the teacher who is kind to us.", "RELATIVE_PREPOSITION_WHOM"));
assert.ok(none("She is the teacher that they liked a lot.", "RELATIVE_PREPOSITION_WHOM"));

assert.deepEqual(spans("We visited the town where she was born.", "RELATIVE_ADVERB_WHERE"), ["where"]);
assert.deepEqual(spans("This is the room where he works now.", "RELATIVE_ADVERB_WHERE"), ["where"]);
assert.ok(none("I visited the city which we knew well.", "RELATIVE_ADVERB_WHERE"));
assert.ok(none("This is the place in which he lives now.", "RELATIVE_ADVERB_WHERE"));

assert.deepEqual(spans("I remember the day when he arrived home.", "RELATIVE_ADVERB_WHEN"), ["when"]);
assert.deepEqual(spans("That was the year when she left school.", "RELATIVE_ADVERB_WHEN"), ["when"]);
assert.ok(none("I left when he arrived at the station.", "RELATIVE_ADVERB_WHEN"));
assert.ok(none("I remember the moment that he arrived.", "RELATIVE_ADVERB_WHEN"));

assert.deepEqual(spans("I know the reason why she left early.", "RELATIVE_ADVERB_WHY"), ["why"]);
assert.deepEqual(spans("That is the reason why they stayed home.", "RELATIVE_ADVERB_WHY"), ["why"]);
assert.ok(none("Why did she leave so early today?", "RELATIVE_ADVERB_WHY"));
assert.ok(none("This is the cause which made them leave.", "RELATIVE_ADVERB_WHY"));

assert.deepEqual(spans("That is how she finished the work.", "RELATIVE_ADVERB_HOW"), ["how"]);
assert.deepEqual(spans("This is how they built the bridge.", "RELATIVE_ADVERB_HOW"), ["how"]);
assert.ok(none("I know how she finished the work.", "RELATIVE_ADVERB_HOW"));
assert.ok(none("This is the way how she studies every day.", "RELATIVE_ADVERB_HOW"));

assert.deepEqual(spans("He bought a new car, which costs a lot.", "RELATIVE_NONRESTRICTIVE"), ["which"]);
assert.ok(none("the law which states the rule clearly.", "RELATIVE_NONRESTRICTIVE"));
assert.ok(none("I like the book that we read yesterday.", "RELATIVE_NONRESTRICTIVE"));

assert.deepEqual(spans("Whoever finishes first will win a prize.", "RELATIVE_COMPOUND"), ["whoever"]);
assert.deepEqual(spans("Whoever arrives late must wait outside.", "RELATIVE_COMPOUND"), ["whoever"]);
assert.deepEqual(spans("Whomever you invite may stay tonight.", "RELATIVE_COMPOUND"), ["whomever"]);
assert.deepEqual(spans("Whatever she chooses is fine with us.", "RELATIVE_COMPOUND"), ["whatever"]);
assert.ok(none("Who finishes first in this race?", "RELATIVE_COMPOUND"));
assert.ok(none("What she wants is unclear to us.", "RELATIVE_COMPOUND"));

assert.deepEqual(spans("She is one of the players who are ready.", "RELATIVE_AGREEMENT"), ["are"]);
assert.deepEqual(spans("She is one of the students who have finished.", "RELATIVE_AGREEMENT"), ["have"]);
assert.deepEqual(spans("He is the only one of the players who is ready.", "RELATIVE_AGREEMENT"), ["is"]);
assert.deepEqual(spans("He is the only one of the students who has finished.", "RELATIVE_AGREEMENT"), ["has"]);
assert.ok(none("The members are ready for the match.", "RELATIVE_AGREEMENT"));
assert.ok(none("The students who live nearby study hard.", "RELATIVE_AGREEMENT"));
assert.equal(relativeLocalDistractor("RELATIVE_AGREEMENT", "are"), "is");
assert.equal(relativeLocalDistractor("RELATIVE_AGREEMENT", "is"), "are");

assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_RESTRICTIVE",
    correct: "that",
    wrong: "which",
    sentence: "I like the book that we read yesterday.",
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_SUBJECT",
    correct: "who",
    wrong: "that",
    sentence: "the person who lives nearby",
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_ADVERB_WHERE",
    correct: "where",
    wrong: "in which",
    sentence: "the town where she was born",
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_NONRESTRICTIVE",
    correct: "which",
    wrong: "that",
    sentence: loaComma,
  }),
  null
);
assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_PREPOSITION_WHICH",
    correct: "which",
    wrong: "that",
    sentence: movementPrep,
  }),
  null
);
assert.equal(
  rejectRelativeChoice({
    pointCode: "RELATIVE_AGREEMENT",
    correct: "are",
    wrong: "is",
    sentence: "The members are ready.",
  }),
  "TOO_TRIVIAL_SHORT_AGREEMENT"
);

assert.equal(localTemplateDistractor("RELATIVE_SUBJECT", "that"), "what");
assert.equal(localTemplateDistractor("RELATIVE_COMPOUND", "whoever"), "whomever");
assert.equal(localTemplateDistractor("RELATIVE_POSSESSIVE", "whose"), "who");

console.log("grammar-choice ch11 relatives: PASS");
