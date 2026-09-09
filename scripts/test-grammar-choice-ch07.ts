/**
 * Chapter 07 gerunds. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch07.ts
 */
import assert from "node:assert/strict";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  GERUND_CH07_RULES,
  detectGerundCh07,
  gerundLocalDistractor,
  rejectGerundChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/gerund-ch07";

function questions(text: string, code?: string) {
  return detectGerundCh07(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectGerundCh07(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(GERUND_CH07_RULES.every((rule) => rule.referenceChapter === "CH07"));
assert.ok(GERUND_CH07_RULES.every((rule) => rule.syntacticRole && rule.governingVerb !== undefined));
assert.equal(ontologyPoint("GERUND_VERB_OBJECT")?.chapter, "C07");
assert.equal(ontologyPoint("GERUND_VERB_OBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("GERUND_PREPOSITION_OBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("AGREEMENT_GERUND_SUBJECT")?.chapter, "C02");
assert.equal(ontologyPoint("AGREEMENT_GERUND_SUBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("GERUND_PERFECT")?.referenceChapter, "CH09");
assert.equal(ontologyPoint("GERUND_PASSIVE")?.referenceChapter, "CH09");

const letting = "Letting go of our need for control, along with accepting uncertainty, is difficult.";
const finding = "Finding a quiet room, together with keeping a regular schedule, is hard.";
const attracting = "Attracting a great career and a happy life may be difficult.";
const swimming = "Swimming is fun for children.";

assert.deepEqual(spans(letting, "AGREEMENT_GERUND_SUBJECT"), ["is"]);
assert.deepEqual(spans(finding, "AGREEMENT_GERUND_SUBJECT"), ["is"]);
assert.equal(gerundLocalDistractor("AGREEMENT_GERUND_SUBJECT", "is"), "are");
assert.equal(none(swimming, "AGREEMENT_GERUND_SUBJECT"), true);
assert.equal(none(attracting, "AGREEMENT_GERUND_SUBJECT"), true);
assert.ok(has(attracting, "GERUND_SUBJECT", "SUBJECT_PHRASE"));
assert.equal(none("Reading long novels every night is tiring.", "AGREEMENT_GERUND_SUBJECT"), true);
assert.ok(has("Her hobby is reading novels in the evening.", "GERUND_COMPLEMENT", "COMPLEMENT_ING"));
assert.ok(has("The problem is finding enough time.", "GERUND_COMPLEMENT", "COMPLEMENT_ING"));
assert.equal(none("Her hobby is reading novels in the evening.", "GERUND_COMPLEMENT"), true);
assert.equal(none("Her hobby is reading novels in the evening."), true);

assert.deepEqual(spans("The doctor suggested taking regular exercise.", "GERUND_VERB_OBJECT"), ["taking"]);
assert.deepEqual(spans("They avoided discussing the problem.", "GERUND_VERB_OBJECT"), ["discussing"]);
assert.equal(gerundLocalDistractor("GERUND_VERB_OBJECT", "taking"), "to take");
assert.equal(gerundLocalDistractor("GERUND_VERB_OBJECT", "discussing"), "to discuss");
assert.equal(none("They began studying the chapter early.", "GERUND_VERB_OBJECT"), true);
assert.ok(has("They began studying the chapter early.", "VERB_COMPLEMENT_MEANING_CHANGE", "BOTH_OK"));
assert.ok(has("Students prefer reading print books.", "VERB_COMPLEMENT_MEANING_CHANGE", "BOTH_OK"));
assert.equal(none("They began studying the chapter early."), true);
assert.equal(none("Students prefer reading print books."), true);
assert.ok(has("I remember locking the door.", "VERB_COMPLEMENT_MEANING_CHANGE", "MEANING_DIFF"));
assert.ok(has("She stopped smoking last winter.", "VERB_COMPLEMENT_MEANING_CHANGE", "MEANING_DIFF"));
assert.equal(none("I remember locking the door."), true);
assert.equal(none("She stopped to smoke outside.", "GERUND_VERB_OBJECT"), true);
assert.ok(has("The old clock needs repairing soon.", "GERUND_VERB_OBJECT", "NEED_PASSIVE"));
assert.equal(none("The old clock needs repairing soon."), true);
assert.equal(none("The roof needs to be repaired.", "GERUND_VERB_OBJECT"), true);

assert.deepEqual(spans("You grow by focusing on the result you want.", "GERUND_PREPOSITION_OBJECT"), ["focusing"]);
assert.equal(gerundLocalDistractor("GERUND_PREPOSITION_OBJECT", "focusing"), "focus");
assert.deepEqual(spans("Try something instead of moving away.", "GERUND_PREPOSITION_OBJECT"), ["moving"]);
assert.equal(gerundLocalDistractor("GERUND_PREPOSITION_OBJECT", "moving"), "move");
assert.deepEqual(spans("She left instead of moving the box.", "GERUND_PREPOSITION_OBJECT"), ["moving"]);
assert.equal(questions("She left instead of moving the box.").length, 1);
assert.deepEqual(spans("Think before accepting them as facts.", "GERUND_PREPOSITION_OBJECT"), ["accepting"]);
assert.deepEqual(spans("There is nothing wrong with having plans.", "GERUND_PREPOSITION_OBJECT"), ["having"]);
assert.ok(has("It can be done by diversifying sources such as subscribing to journals.", "GERUND_PREPOSITION_OBJECT", "PREP_GERUND"));
assert.deepEqual(
  spans("It can be done by diversifying sources such as subscribing to journals.", "GERUND_PREPOSITION_OBJECT"),
  ["subscribing"]
);
assert.ok(has("The gap between planning and thinking is wide.", "GERUND_PREPOSITION_OBJECT", "PREP_PARALLEL"));
assert.equal(none("The gap between planning and thinking is wide."), true);

assert.deepEqual(spans("There is no knowing what will happen.", "GERUND_FIXED_CONSTRUCTION"), ["knowing"]);
assert.deepEqual(spans("The book is worth reading again.", "GERUND_FIXED_CONSTRUCTION"), ["reading"]);
assert.deepEqual(spans("He had difficulty solving the problem.", "GERUND_FIXED_CONSTRUCTION"), ["solving"]);
assert.ok(has("We spend our time moving from plan to plan.", "GERUND_FIXED_CONSTRUCTION", "REQUIRED_ING"));
assert.equal(gerundLocalDistractor("GERUND_FIXED_CONSTRUCTION", "knowing"), "to know");
assert.equal(gerundLocalDistractor("GERUND_FIXED_CONSTRUCTION", "reading"), "to read");
assert.ok(has("She looks forward to seeing the results.", "GERUND_FIXED_CONSTRUCTION", "PREP_TO"));
assert.equal(none("She looks forward to seeing the results."), true);
assert.ok(has("He is used to living abroad.", "GERUND_FIXED_CONSTRUCTION", "PREP_TO"));
assert.equal(none("He is used to living abroad."), true);
assert.ok(has("I cannot help laughing at the joke.", "GERUND_FIXED_CONSTRUCTION", "CANNOT_HELP"));
assert.equal(none("I cannot help laughing at the joke."), true);

const learning = "They are not learning the rules yet.";
assert.ok(has(learning, "GERUND_SUBJECT", "PROGRESSIVE_NOT_GERUND"));
assert.equal(none(learning), true);
assert.equal(none("Many animals are being held captive.", "GERUND_VERB_OBJECT"), true);
assert.equal(none("We don't allow ourselves to participate."), true);

assert.equal(
  rejectGerundChoice({
    pointCode: "GERUND_VERB_OBJECT",
    correct: "to know",
    wrong: "to knowing",
    sentence: "They wanted to know the answer.",
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectGerundChoice({
    pointCode: "GERUND_PREPOSITION_OBJECT",
    correct: "focusing",
    wrong: "focus",
    sentence: "You grow by focusing on the result.",
  }),
  null
);
assert.equal(
  rejectGerundChoice({
    pointCode: "GERUND_PREPOSITION_OBJECT",
    correct: "moving",
    wrong: "move",
    sentence: "She left instead of moving the box.",
  }),
  null
);
assert.equal(
  rejectGerundChoice({
    pointCode: "VERB_COMPLEMENT_MEANING_CHANGE",
    correct: "smoking",
    wrong: "to smoke",
    sentence: "She stopped smoking last winter.",
  }),
  "MEANING_ONLY_CONTRAST"
);

assert.equal(localTemplateDistractor("GERUND_VERB_OBJECT", "taking"), "to take");
assert.equal(localTemplateDistractor("GERUND_FIXED_CONSTRUCTION", "solving"), "to solve");
assert.equal(localTemplateDistractor("GERUND_PREPOSITION_OBJECT", "moving"), "move");
assert.equal(localTemplateDistractor("AGREEMENT_GERUND_SUBJECT", "is"), "are");

console.log("grammar-choice ch07 gerunds: PASS");
