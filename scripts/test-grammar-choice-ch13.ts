/**
 * Chapter 13 parts of speech. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch13.ts
 */
import assert from "node:assert/strict";
import { detectSentenceCh01 } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  PARTS_CH13_RULES,
  applyBasicRatioCap,
  basicAdjAdvShare,
  detectPartsCh13,
  partsLocalDistractor,
  rejectPartsChoice,
  restoresSource,
  type PartsHit,
} from "../src/lib/lesson-materials/grammar-choice-v2/parts-ch13";

function questions(text: string, code?: string) {
  return detectPartsCh13(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectPartsCh13(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(PARTS_CH13_RULES.every((rule) => rule.referenceChapter === "CH13"));
assert.ok(PARTS_CH13_RULES.every((rule) => rule.allowedMinimalPairs && rule.rejectConditions));
assert.equal(ontologyPoint("COUNTABLE_UNCOUNTABLE")?.chapter, "C12");
assert.equal(ontologyPoint("COUNTABLE_UNCOUNTABLE")?.referenceChapter, "CH13");
assert.equal(ontologyPoint("PRONOUN_REFLEXIVE")?.referenceChapter, "CH13");
assert.equal(ontologyPoint("ADVERB_VERB_MODIFIER")?.chapter, "C13");
assert.equal(ontologyPoint("ADVERB_VERB_MODIFIER")?.referenceChapter, "CH13");
assert.equal(ontologyPoint("COMPARATIVE")?.referenceChapter, "CH12");
assert.equal(ontologyPoint("AGREEMENT_GERUND_SUBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("RELATIVE_AGREEMENT")?.referenceChapter, "CH11");

assert.deepEqual(spans("The report gives much information about the topic.", "COUNTABLE_UNCOUNTABLE"), ["information"]);
assert.deepEqual(spans("She offered a piece of advice after class.", "COUNTABLE_UNCOUNTABLE"), ["advice"]);
assert.ok(has("They collected much evidence from the trial.", "COUNTABLE_UNCOUNTABLE", "EVIDENCE_CUED"));
assert.equal(none("The evidence was clear after the trial.", "COUNTABLE_UNCOUNTABLE"), true);
assert.equal(partsLocalDistractor("COUNTABLE_UNCOUNTABLE", "information"), "informations");
assert.equal(none("The books on the desk are new.", "COUNTABLE_UNCOUNTABLE"), true);
assert.equal(none("Many students joined the club.", "COUNTABLE_UNCOUNTABLE"), true);

assert.deepEqual(spans("The news is surprising this morning.", "SINGULAR_PLURAL_NOUN"), ["is"]);
assert.deepEqual(spans("The news was delayed by the storm.", "SINGULAR_PLURAL_NOUN"), ["was"]);
assert.equal(none("Human beings want a clear answer.", "SINGULAR_PLURAL_NOUN"), true);
assert.equal(none("Many kinds are listed in the chart.", "SINGULAR_PLURAL_NOUN"), true);
assert.ok(has("This species is rare in the region.", "SINGULAR_PLURAL_NOUN", "CONTEXT_NUMBER"));
assert.equal(none("Statistics can be misleading here.", "SINGULAR_PLURAL_NOUN"), true);

assert.deepEqual(spans("They follow the same principle in class.", "ARTICLE"), ["the same"]);
assert.deepEqual(spans("We reached the same conclusion yesterday.", "ARTICLE"), ["the same"]);
assert.equal(partsLocalDistractor("ARTICLE", "the same"), "a same");
assert.equal(none("I saw a cat on the road.", "ARTICLE"), true);
assert.equal(none("The first chapter is short.", "ARTICLE"), true);

assert.deepEqual(spans("How can we protect ourselves from this bias?", "PRONOUN_REFLEXIVE"), ["ourselves"]);
assert.deepEqual(spans("We must protect ourselves in this debate.", "PRONOUN_REFLEXIVE"), ["ourselves"]);
assert.equal(partsLocalDistractor("PRONOUN_REFLEXIVE", "ourselves"), "us");
assert.ok(has("The list, including ourselves, was too long.", "PRONOUN_REFLEXIVE", "INCLUDED"));
assert.equal(none("The list, including ourselves, was too long.", "PRONOUN_REFLEXIVE"), true);
assert.equal(none("It was me at the door.", "PRONOUN_REFLEXIVE"), true);
assert.deepEqual(spans("The letter is between you and me.", "PRONOUN_SUBJECT_OBJECT_CASE"), ["me"]);
assert.equal(none("It was me at the door.", "PRONOUN_SUBJECT_OBJECT_CASE"), true);

assert.ok(has("It may change later.", "PRONOUN_ANTECEDENT", "AMBIGUOUS_IT"));
assert.equal(none("It may change later.", "PRONOUN_ANTECEDENT"), true);
assert.equal(
  rejectPartsChoice({
    pointCode: "PRONOUN_ANTECEDENT",
    correct: "It",
    wrong: "This",
    sentence: "It may change later.",
  }),
  "AMBIGUOUS_REFERENCE"
);

assert.ok(has("This is one such external factor in the study.", "ONE_ONES", "DETERMINER"));
assert.equal(none("This is one such external factor in the study.", "ONE_ONES"), true);
assert.deepEqual(spans("I need a cheaper one for class.", "ONE_ONES"), ["one"]);
assert.deepEqual(spans("She bought another red one yesterday.", "ONE_ONES"), ["one"]);
assert.equal(none("One student was late today.", "ONE_ONES"), true);

assert.deepEqual(spans("One approach focuses on speed; the other focuses on accuracy.", "ANOTHER_OTHER_THE_OTHER"), ["the other"]);
assert.equal(none("Some accepted the proposal, while others rejected it.", "ANOTHER_OTHER_THE_OTHER"), true);
assert.ok(has("Some accepted the proposal, while others rejected it.", "ANOTHER_OTHER_THE_OTHER", "AMBIGUOUS_REFERENCE"));
assert.deepEqual(spans("Three of the five students left. The others stayed.", "ANOTHER_OTHER_THE_OTHER"), ["the others"]);
assert.deepEqual(spans("Several people came, and others joined later.", "ANOTHER_OTHER_THE_OTHER"), ["others"]);
assert.equal(partsLocalDistractor("ANOTHER_OTHER_THE_OTHER", "the other"), "another");
assert.ok(has("That is another cognitive trap for readers.", "ANOTHER_OTHER_THE_OTHER", "DETERMINER"));
assert.equal(none("That is another cognitive trap for readers.", "ANOTHER_OTHER_THE_OTHER"), true);
assert.equal(none("The other day we met again.", "ANOTHER_OTHER_THE_OTHER"), true);

assert.deepEqual(spans("Each of the participants was given the same task.", "AGREEMENT_EACH_EVERY"), ["was"]);
assert.deepEqual(spans("Each of the students is ready now.", "AGREEMENT_EACH_EVERY"), ["is"]);
assert.equal(none("Each student was ready on time.", "AGREEMENT_EACH_EVERY"), true);
assert.equal(none("All of the students were present.", "AGREEMENT_EACH_EVERY"), true);

const use = "The use of these expressions has been recommended by experts.";
assert.equal(has(use, "AGREEMENT_PREPOSITIONAL_MODIFIER", "OWNED_ELSEWHERE"), false);
assert.deepEqual(spans(use, "AGREEMENT_PREPOSITIONAL_MODIFIER"), ["has"]);
assert.deepEqual(spans("The increase in consumer prices has slowed this year.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), ["has"]);
assert.deepEqual(spans("The demand for skilled workers has grown this month.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), ["has"]);
assert.equal(none("The platforms have changed society already.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);
assert.equal(none("This variation preserves the pattern.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);

assert.deepEqual(spans("One of Charles Darwin's greatest insights was that variation matters.", "AGREEMENT_ONE_OF"), ["was"]);
assert.deepEqual(spans("One of the recent reports was missing today.", "AGREEMENT_ONE_OF"), ["was"]);
assert.equal(none("One student was late today.", "AGREEMENT_ONE_OF"), true);
assert.ok(has("One of the players who were selected left early.", "AGREEMENT_ONE_OF", "RELATIVE_DEFER"));
assert.equal(none("One of the players who were selected left early.", "AGREEMENT_ONE_OF"), true);

assert.deepEqual(spans("A number of students are absent today.", "AGREEMENT_NUMBER_OF"), ["are"]);
assert.deepEqual(spans("The number of applicants is increasing now.", "AGREEMENT_NUMBER_OF"), ["is"]);
assert.equal(none("The number is written on the form.", "AGREEMENT_NUMBER_OF"), true);
assert.equal(none("A student is absent today.", "AGREEMENT_NUMBER_OF"), true);

assert.deepEqual(spans("A lot of fake news is shared online.", "AGREEMENT_PARTITIVE"), ["is"]);
assert.deepEqual(spans("Some examples of fake news seem convincing.", "AGREEMENT_PARTITIVE"), ["seem"]);
assert.ok(has("Most of us spend the evening online.", "AGREEMENT_PARTITIVE", "PARTITIVE_HEAD"));
assert.equal(none("Most of us spend the evening online.", "AGREEMENT_PARTITIVE"), true);
assert.equal(none("Our thoughts and words are powerful.", "AGREEMENT_PARTITIVE"), true);

assert.deepEqual(spans("The teacher, along with several students, was present.", "AGREEMENT_DISTANCE"), ["was"]);
assert.deepEqual(spans("The coach, as well as the players, was waiting.", "AGREEMENT_DISTANCE"), ["was"]);
assert.equal(none("Human beings want a fair process.", "AGREEMENT_DISTANCE"), true);
assert.equal(none("The child was present in class.", "AGREEMENT_DISTANCE"), true);

assert.deepEqual(spans("Either the manager or the students are ready.", "AGREEMENT_CORRELATIVE"), ["are"]);
assert.deepEqual(spans("Neither the students nor the teacher is ready.", "AGREEMENT_CORRELATIVE"), ["is"]);
assert.equal(none("Either choice is fine for us.", "AGREEMENT_CORRELATIVE"), true);
assert.equal(none("We can either stay or leave.", "AGREEMENT_CORRELATIVE"), true);

assert.deepEqual(spans("People are often exposed to misleading information.", "PREPOSITION_COLLOCATION"), ["to"]);
assert.deepEqual(spans("We must distinguish facts from opinions.", "PREPOSITION_COLLOCATION"), ["from"]);
assert.deepEqual(spans("This prevents people from making careful judgments.", "PREPOSITION_COLLOCATION"), ["from"]);
assert.equal(partsLocalDistractor("PREPOSITION_COLLOCATION", "to"), "with");
assert.equal(none("She grew by focusing on the result.", "PREPOSITION_COLLOCATION"), true);
assert.equal(none("He waited until noon for the call.", "PREPOSITION_COLLOCATION"), true);
assert.equal(
  rejectPartsChoice({
    pointCode: "PREPOSITION_COLLOCATION",
    correct: "to know",
    wrong: "to knowing",
    sentence: "They wanted to know the answer.",
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

assert.deepEqual(spans("Students should evaluate the information critically.", "ADVERB_VERB_MODIFIER"), ["critically"]);
assert.deepEqual(spans("It is an extremely difficult problem.", "ADVERB_ADJECTIVE_MODIFIER"), ["extremely"]);
assert.deepEqual(spans("We need something useful for the task.", "ADJECTIVE_NOUN_MODIFIER"), ["useful"]);
assert.deepEqual(spans("The guard kept the door open all night.", "ADJECTIVE_OBJECT_COMPLEMENT"), ["open"]);
assert.deepEqual(spans("The report sounds trustworthy to readers.", "ADJECTIVE_SUBJECT_COMPLEMENT"), ["trustworthy"]);
assert.ok(has("This makes people susceptible to misinformation.", "ADJECTIVE_OBJECT_COMPLEMENT", "OWNED_CH01"));
assert.equal(none("This makes people susceptible to misinformation.", "ADJECTIVE_OBJECT_COMPLEMENT"), true);
assert.ok(detectSentenceCh01("This makes people susceptible to misinformation.").some((hit) => hit.questionable && hit.sourceSpan.toLowerCase() === "susceptible"));
assert.equal(none("She ran quickly across the field.", "ADVERB_VERB_MODIFIER"), true);
assert.equal(none("The red door looks new.", "ADJECTIVE_SUBJECT_COMPLEMENT"), true);

assert.deepEqual(spans("The evidence was not strong enough.", "TOO_ENOUGH"), ["strong enough"]);
assert.deepEqual(spans("She is old enough to travel alone.", "TOO_ENOUGH"), ["old enough"]);
assert.equal(partsLocalDistractor("TOO_ENOUGH", "strong enough"), "enough strong");
assert.equal(none("The box is too heavy to lift.", "TOO_ENOUGH"), true);
assert.equal(none("They wanted to know the result.", "TOO_ENOUGH"), true);

assert.equal(none("They work hard every day.", "CONFUSABLE_ADVERB"), true);
assert.equal(none("The class is nearly finished now.", "CONFUSABLE_ADVERB"), true);
assert.equal(none("The mountain is high above the town.", "CONFUSABLE_ADVERB"), true);
assert.equal(none("Most students left early today.", "CONFUSABLE_ADVERB"), true);

const samples = [
  "The report gives much information about the topic.",
  "The news is surprising this morning.",
  "How can we protect ourselves from this bias?",
  "The evidence was not strong enough.",
  "Students should evaluate the information critically.",
  "It is an extremely difficult problem.",
  "We need something useful for the task.",
  "The coach reviewed the draft extremely carefully.",
];
for (const text of samples) {
  for (const hit of detectPartsCh13(text).filter((hit) => hit.questionable)) {
    assert.equal(restoresSource(text, hit), true, `${hit.sourceSpan} @ ${text}`);
  }
}
const twice = "They follow the same rule and the same principle.";
assert.equal(questions(twice, "ARTICLE").length, 1);

const capped = applyBasicRatioCap([
  q("AGREEMENT_ONE_OF", "ONE_OF_PLURAL", "was"),
  q("PRONOUN_REFLEXIVE", "REQUIRED_REFLEXIVE", "ourselves"),
  q("PREPOSITION_COLLOCATION", "REQUIRED_PARTICLE", "to"),
  q("ADVERB_VERB_MODIFIER", "ADJ_ADV_BASIC", "critically"),
  q("ADVERB_ADJECTIVE_MODIFIER", "ADJ_ADV_BASIC", "extremely"),
  q("ADJECTIVE_NOUN_MODIFIER", "ADJ_ADV_BASIC", "useful"),
]);
assert.ok(basicAdjAdvShare(capped) <= 0.25);

assert.equal(none("She works hard every day.", "CONFUSABLE_ADVERB"), true);
assert.ok(has("She works hard every day.", "CONFUSABLE_ADVERB", "MEANING_ONLY"));
assert.equal(none("The report is nearly finished.", "CONFUSABLE_ADVERB"), true);
assert.deepEqual(spans("We taught ourselves the method.", "PRONOUN_REFLEXIVE"), ["ourselves"]);
assert.equal(none("The list, including ourselves, was too long.", "PRONOUN_REFLEXIVE"), true);
assert.deepEqual(spans("The teacher invited me to the meeting.", "PRONOUN_SUBJECT_OBJECT_CASE"), ["me"]);
assert.deepEqual(spans("He explained the result.", "PRONOUN_SUBJECT_OBJECT_CASE"), ["he"]);
assert.equal(none("It was me at the door.", "PRONOUN_SUBJECT_OBJECT_CASE"), true);
assert.equal(localTemplateDistractor("COUNTABLE_UNCOUNTABLE", "evidence"), "evidences");
assert.equal(localTemplateDistractor("PRONOUN_REFLEXIVE", "ourselves"), "us");
assert.equal(localTemplateDistractor("AGREEMENT_ONE_OF", "was"), "were");

console.log("grammar-choice ch13 parts: PASS");

function q(code: PartsHit["code"], subtype: string, sourceSpan: string): PartsHit {
  return { code, subtype, sourceSpan, occurrenceIndex: 0, questionable: true };
}
