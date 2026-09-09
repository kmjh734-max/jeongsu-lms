/**
 * Chapter 06 infinitives. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch06.ts
 */
import assert from "node:assert/strict";
import { detectSentenceCh01 } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectVoiceCh03 } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { detectConjunctionCh10 } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import {
  INFINITIVE_CH06_RULES,
  detectInfinitiveCh06,
  rejectInfinitiveChoice,
  infinitiveLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";

function questions(text: string, code?: string) {
  return detectInfinitiveCh06(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectInfinitiveCh06(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(INFINITIVE_CH06_RULES.every((rule) => rule.referenceChapter === "CH06"));
assert.ok(INFINITIVE_CH06_RULES.every((rule) => rule.syntacticRole && rule.modifiedTarget));
assert.equal(ontologyPoint("INFINITIVE_NOUN_ROLE")?.chapter, "C07");
assert.equal(ontologyPoint("INFINITIVE_NOUN_ROLE")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("INFINITIVE_LOGICAL_SUBJECT")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("INFINITIVE_ADJECTIVE_ROLE")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("OBJECT_COMPLEMENT_TO_V")?.referenceChapter, "CH01");
assert.equal(ontologyPoint("VOICE_BE_MADE_TO")?.referenceChapter, "CH03");
assert.equal(ontologyPoint("INFINITIVE_PASSIVE")?.referenceChapter, "CH09");

assert.deepEqual(spans("I found it difficult to understand the theory.", "DUMMY_IT_OBJECT"), ["it"]);
assert.deepEqual(spans("The new system makes it possible to detect errors.", "DUMMY_IT_OBJECT"), ["it"]);
assert.equal(infinitiveLocalDistractor("DUMMY_IT_OBJECT", "it"), "that");
assert.equal(none("I found that idea difficult to explain.", "DUMMY_IT_OBJECT"), true);
assert.equal(none("I found the theory difficult.", "DUMMY_IT_OBJECT"), true);

assert.deepEqual(spans("It's important for humans to have many kinds of minds.", "INFINITIVE_LOGICAL_SUBJECT"), ["for"]);
assert.deepEqual(spans("It is necessary for students to review the rules.", "INFINITIVE_LOGICAL_SUBJECT"), ["for"]);
assert.deepEqual(spans("It was kind of her to wait at the door.", "INFINITIVE_LOGICAL_SUBJECT"), ["of"]);
assert.equal(infinitiveLocalDistractor("INFINITIVE_LOGICAL_SUBJECT", "for"), "of");
assert.equal(spans("It's important for humans to have many kinds of minds.", "INFINITIVE_LOGICAL_SUBJECT").length, 1);
assert.equal(
  "It's important for humans to have many kinds of minds.".replace("for", "of").replace("of", "for"),
  "It's important for humans to have many kinds of minds."
);
assert.equal(none("It is good for you to rest now.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(
  rejectInfinitiveChoice({
    pointCode: "INFINITIVE_LOGICAL_SUBJECT",
    correct: "for",
    wrong: "of",
    sentence: "It is good for you to rest now.",
  }),
  "BOTH_GRAMMATICAL"
);
assert.ok(has("The change allows for natural selection to work.", "INFINITIVE_LOGICAL_SUBJECT", "FOR_TO_BARE"));
assert.equal(none("The change allows for natural selection to work.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(none("She left for the station to meet him.", "INFINITIVE_LOGICAL_SUBJECT"), true);

assert.deepEqual(spans("She needs a chair to sit on.", "INFINITIVE_ADJECTIVE_ROLE"), ["on"]);
assert.deepEqual(spans("I have no one to rely on.", "INFINITIVE_ADJECTIVE_ROLE"), ["on"]);
assert.deepEqual(spans("This is an easy book to read.", "INFINITIVE_ADJECTIVE_ROLE"), ["to read"]);
assert.equal(infinitiveLocalDistractor("INFINITIVE_ADJECTIVE_ROLE", "on"), "∅");
assert.equal(infinitiveLocalDistractor("INFINITIVE_ADJECTIVE_ROLE", "to read"), "to read it");
assert.equal(none("She wants something to eat.", "INFINITIVE_ADJECTIVE_ROLE"), true);
assert.equal(none("There is no one to challenge the accuracy.", "INFINITIVE_ADJECTIVE_ROLE"), true);

assert.ok(has("To learn a language takes time.", "INFINITIVE_NOUN_ROLE", "SUBJECT_TO"));
assert.ok(has("They decided to leave early.", "INFINITIVE_NOUN_ROLE", "OBJECT_TO"));
assert.ok(has("Her goal is to become a doctor.", "INFINITIVE_NOUN_ROLE", "COMPLEMENT_TO"));
assert.equal(none("To learn a language takes time.", "INFINITIVE_NOUN_ROLE"), true);
assert.equal(none("They decided to leave early.", "INFINITIVE_NOUN_ROLE"), true);

assert.ok(has("They asked how to socialize at school.", "INFINITIVE_NOUN_ROLE", "WH_TO"));
assert.ok(has("He wondered whether to accept the offer.", "INFINITIVE_NOUN_ROLE", "WH_TO"));
assert.equal(none("They asked how to socialize at school.", "INFINITIVE_NOUN_ROLE"), true);
assert.equal(none("what to do next is unclear.", "INFINITIVE_NOUN_ROLE"), true);

assert.ok(has("The president is to visit Seoul.", "INFINITIVE_NOUN_ROLE", "BE_TO"));
assert.ok(has("You are to finish the work by Friday.", "INFINITIVE_NOUN_ROLE", "BE_TO"));
assert.equal(none("The president is to visit Seoul.", "INFINITIVE_NOUN_ROLE"), true);
assert.equal(none("No one was to know the truth.", "INFINITIVE_NOUN_ROLE"), true);

assert.ok(has("To be frank, the plan failed.", "INFINITIVE_ADVERB_ROLE", "INDEPENDENT"));
assert.ok(has("Needless to say, the cost rose.", "INFINITIVE_ADVERB_ROLE", "INDEPENDENT"));
assert.equal(none("To be frank, the plan failed.", "INFINITIVE_ADVERB_ROLE"), true);
assert.ok(has("The clause was written to manifest it.", "INFINITIVE_ADVERB_ROLE", "PURPOSE_AMBIGUOUS"));
assert.equal(none("The clause was written to manifest it.", "INFINITIVE_ADVERB_ROLE"), true);

assert.ok(has("All we have to do is think.", "INFINITIVE_ADVERB_ROLE", "BARE_BE_COMPLEMENT"));
assert.equal(none("All we have to do is think.", "INFINITIVE_ADVERB_ROLE"), true);
const tooRule = INFINITIVE_CH06_RULES.find((rule) => rule.code === "TOO_TO");
const enoughRule = INFINITIVE_CH06_RULES.find((rule) => rule.code === "ENOUGH_TO");
assert.equal(tooRule?.priority, "BASIC");
assert.equal(enoughRule?.priority, "BASIC");
assert.equal(tooRule?.ownerChapter, "CH06");
assert.equal(enoughRule?.ownerChapter, "CH06");
assert.equal(tooRule?.referenceChapter, "CH06");
assert.equal(enoughRule?.referenceChapter, "CH06");
assert.equal(tooRule?.assessmentAxis, "INFINITIVE_CONSTRUCTION");
assert.equal(tooRule?.emitsStudentQuestion, true);
assert.equal(ontologyPoint("TOO_TO")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("ENOUGH_TO")?.referenceChapter, "CH06");

const tooText = "The box is too heavy to lift.";
const enoughText = "She is old enough to drive.";
assert.deepEqual(spans(tooText, "TOO_TO"), ["to"]);
assert.deepEqual(spans(enoughText, "ENOUGH_TO"), ["to"]);
assert.equal(questions(tooText).length, 1);
assert.equal(questions(enoughText).length, 1);
assert.deepEqual(spans("He ran too fast to stop.", "TOO_TO"), ["to"]);
assert.deepEqual(spans("She spoke clearly enough to be heard.", "ENOUGH_TO"), ["to"]);
assert.equal(detectConjunctionCh10(tooText).filter((hit) => hit.questionable && (hit.code === "TOO_TO" || hit.code === "ENOUGH_TO" || hit.code === "RESULT_RELATION_TOO_TO")).length, 0);
assert.equal(detectConjunctionCh10(enoughText).filter((hit) => hit.questionable && (hit.code === "TOO_TO" || hit.code === "ENOUGH_TO" || hit.code === "RESULT_RELATION_ENOUGH_TO")).length, 0);
assert.ok(detectConjunctionCh10(tooText).some((hit) => hit.code === "RESULT_RELATION_TOO_TO" && hit.questionable === false));
assert.ok(detectConjunctionCh10(enoughText).some((hit) => hit.code === "RESULT_RELATION_ENOUGH_TO" && hit.questionable === false));
assert.equal(infinitiveLocalDistractor("TOO_TO", "to"), "that");
assert.equal(infinitiveLocalDistractor("ENOUGH_TO", "to"), "that");
assert.equal(localTemplateDistractor("TOO_TO", "to"), "that");
assert.equal(localTemplateDistractor("ENOUGH_TO", "to"), "that");
assert.equal(infinitiveLocalDistractor("TOO_TO", "too"), null);
assert.equal(infinitiveLocalDistractor("ENOUGH_TO", "enough"), null);
assert.equal(
  rejectInfinitiveChoice({
    pointCode: "TOO_TO",
    correct: "to understand",
    wrong: "understanding",
    sentence: "The text is too difficult to understand.",
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectInfinitiveChoice({
    pointCode: "TOO_TO",
    correct: "too",
    wrong: "enough",
    sentence: "The box is too heavy to lift.",
  }),
  "MEANING_ONLY_CONTRAST"
);
assert.equal(
  rejectInfinitiveChoice({
    pointCode: "ENOUGH_TO",
    correct: "to make the decision now",
    wrong: "that make the decision now",
    sentence: "She is old enough to make the decision.",
  }),
  "NON_MINIMAL_SPAN"
);
function restoresSource(text: string, code: string) {
  const hit = detectInfinitiveCh06(text).find((item) => item.questionable && item.code === code);
  if (!hit) return false;
  const blanked = `${text.slice(0, hit.occurrenceIndex)}___${text.slice(hit.occurrenceIndex + hit.sourceSpan.length)}`;
  const restored = blanked.replace("___", hit.sourceSpan);
  return restored === text;
}
assert.equal(restoresSource(tooText, "TOO_TO"), true);
assert.equal(restoresSource(enoughText, "ENOUGH_TO"), true);
assert.equal(none("The puzzle is so difficult that students fail.", "TOO_TO"), true);
assert.equal(none("She has enough time today.", "ENOUGH_TO"), true);

assert.equal(none("We don't allow ourselves to participate.", "INFINITIVE_ADVERB_ROLE"), true);
assert.ok(detectSentenceCh01("We don't allow ourselves to participate.").some((hit) => hit.questionable && hit.code === "OBJECT_COMPLEMENT_TO_V"));
assert.equal(none("We were made to move through the hall.", "INFINITIVE_NOUN_ROLE"), true);
assert.equal(none("Humans are meant to live extraordinary lives.", "INFINITIVE_NOUN_ROLE"), true);
assert.ok(detectVoiceCh03("We were made to move through the hall.").some((hit) => hit.questionable && hit.code === "VOICE_BE_MADE_TO"));

assert.equal(
  rejectInfinitiveChoice({
    pointCode: "INFINITIVE_NOUN_ROLE",
    correct: "to know",
    wrong: "to knowing",
    sentence: "They wanted to know the answer.",
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

assert.equal(localTemplateDistractor("DUMMY_IT_OBJECT", "it"), "that");
assert.equal(localTemplateDistractor("INFINITIVE_LOGICAL_SUBJECT", "for"), "of");
assert.equal(localTemplateDistractor("INFINITIVE_ADJECTIVE_ROLE", "to read"), "to read it");

console.log("grammar-choice ch06 infinitives: PASS");
