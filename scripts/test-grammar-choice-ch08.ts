/**
 * Chapter 08 participle rules. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch08.ts
 */
import assert from "node:assert/strict";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  PARTICIPLE_CH08_RULES,
  detectParticipleCh08,
  participleLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/participle-ch08";

function questions(text: string, code?: string) {
  return detectParticipleCh08(text).filter(
    (hit) => hit.questionable && (!code || hit.code === code)
  );
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, span?: string) {
  return detectParticipleCh08(text).some(
    (hit) =>
      hit.code === code &&
      (!span || hit.sourceSpan.toLowerCase() === span.toLowerCase())
  );
}

assert.ok(PARTICIPLE_CH08_RULES.every((rule) => rule.referenceChapter === "CH08"));
assert.ok(PARTICIPLE_CH08_RULES.every((rule) => rule.logicalSubjectRule && rule.voiceRelation && rule.timeRelation));
assert.equal(ontologyPoint("PARTICIPLE_NOUN_MODIFIER")?.chapter, "C08");
assert.equal(ontologyPoint("PARTICIPLE_NOUN_MODIFIER")?.referenceChapter, "CH08");
assert.equal(ontologyPoint("GERUND_PREPOSITION_OBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("VOICE_PROGRESSIVE_PASSIVE")?.referenceChapter, "CH03");

const byFocusing = "You grow by focusing on the result you want.";
const attracting = "Attracting a great career and a happy life may be difficult.";
const held = "Many animals are being held captive in small cages.";
const suited = "It preserves the members who are well suited to their environment.";
const published = "They spread false information published and promoted as true.";
const employed = "She studied the algorithms employed in social media.";
const stating = "He told a story stating that right-handers are smarter.";
const planning = "Planning and thinking about the future takes time.";

assert.ok(has(byFocusing, "GERUND_PREPOSITION_OBJECT", "focusing"));
assert.equal(none(byFocusing), true);
assert.ok(has(attracting, "GERUND_SUBJECT", "Attracting") || has(attracting, "GERUND_SUBJECT", "attracting"));
assert.equal(none(attracting), true);
assert.ok(has(held, "VOICE_PROGRESSIVE_PASSIVE", "held"));
assert.equal(none(held), true);
assert.deepEqual(spans(suited, "PARTICIPLE_SUBJECT_COMPLEMENT"), ["suited"]);
assert.equal(participleLocalDistractor("PARTICIPLE_SUBJECT_COMPLEMENT", "suited"), "suiting");
assert.equal(none(suited, "PARTICIPLE_NOUN_MODIFIER"), true);
assert.equal(none(suited, "VOICE_PROGRESSIVE_PASSIVE"), true);
assert.deepEqual(spans(published, "PARTICIPLE_NOUN_MODIFIER"), ["published"]);
assert.equal(participleLocalDistractor("PARTICIPLE_NOUN_MODIFIER", "published"), "publishing");
assert.deepEqual(spans(employed, "PARTICIPLE_NOUN_MODIFIER"), ["employed"]);
assert.equal(participleLocalDistractor("PARTICIPLE_NOUN_MODIFIER", "employed"), "employing");
assert.deepEqual(spans(stating, "PARTICIPLE_NOUN_MODIFIER"), ["stating"]);
assert.equal(participleLocalDistractor("PARTICIPLE_NOUN_MODIFIER", "stating"), "stated");
assert.ok(has(planning, "GERUND_SUBJECT", "Planning and thinking") || has(planning, "GERUND_SUBJECT", "planning and thinking"));
assert.equal(none(planning), true);

assert.deepEqual(spans("The letter written by the clerk arrived late.", "PARTICIPLE_NOUN_MODIFIER"), ["written"]);
assert.deepEqual(spans("I met a student holding the heavy bag.", "PARTICIPLE_NOUN_MODIFIER"), ["holding"]);
assert.equal(none("The book was published in 1998.", "PARTICIPLE_NOUN_MODIFIER"), true);
assert.equal(none("She is reading a long novel.", "PARTICIPLE_NOUN_MODIFIER"), true);

assert.deepEqual(spans("The old door remained closed all night.", "PARTICIPLE_SUBJECT_COMPLEMENT"), ["closed"]);
assert.deepEqual(spans("The safe remained locked after the theft.", "PARTICIPLE_SUBJECT_COMPLEMENT"), ["locked"]);
assert.equal(none("She is reading a long novel.", "PARTICIPLE_SUBJECT_COMPLEMENT"), true);
assert.equal(none("The door was closed by the guard.", "PARTICIPLE_SUBJECT_COMPLEMENT"), true);

assert.deepEqual(spans("I found the window broken this morning.", "PARTICIPLE_OBJECT_COMPLEMENT"), ["broken"]);
assert.deepEqual(spans("They saw the children playing outside.", "PARTICIPLE_OBJECT_COMPLEMENT"), ["playing"]);
assert.equal(none("I enjoy playing the piano.", "PARTICIPLE_OBJECT_COMPLEMENT"), true);
assert.equal(none("She found that the window was old.", "PARTICIPLE_OBJECT_COMPLEMENT"), true);

assert.deepEqual(spans("Many people feel frightened by the noise.", "PARTICIPLE_EMOTION"), ["frightened"]);
assert.deepEqual(spans("She had a frightening experience yesterday.", "PARTICIPLE_EMOTION"), ["frightening"]);
assert.equal(participleLocalDistractor("PARTICIPLE_EMOTION", "frightened"), "frightening");
assert.equal(participleLocalDistractor("PARTICIPLE_EMOTION", "frightening"), "frightened");
assert.equal(none("The news was read aloud.", "PARTICIPLE_EMOTION"), true);
assert.equal(none("People feel tired after work.", "PARTICIPLE_EMOTION") === false, true);

assert.deepEqual(spans("Opening the door, she entered the room.", "PARTICIPIAL_CLAUSE_ACTIVE"), ["opening"]);
assert.deepEqual(spans("Crossing the street, they waved at us.", "PARTICIPIAL_CLAUSE_ACTIVE"), ["crossing"]);
assert.equal(none("Walking down the street, the tree looked old.", "PARTICIPIAL_CLAUSE_ACTIVE"), true);
assert.equal(none(byFocusing, "PARTICIPIAL_CLAUSE_ACTIVE"), true);

assert.deepEqual(spans("Having finished the work, she left early.", "PARTICIPIAL_CLAUSE_PERFECT"), ["having finished"]);
assert.deepEqual(spans("Having written the letter, he posted it.", "PARTICIPIAL_CLAUSE_PERFECT"), ["having written"]);
assert.equal(participleLocalDistractor("PARTICIPIAL_CLAUSE_PERFECT", "Having finished"), "Having been finished");
assert.equal(none("Finishing the work, she left early.", "PARTICIPIAL_CLAUSE_PERFECT"), true);
assert.equal(none("She has finished the work already.", "PARTICIPIAL_CLAUSE_PERFECT"), true);

assert.deepEqual(spans("Written in haste, the letter contained errors.", "PARTICIPIAL_CLAUSE_PASSIVE"), ["written"]);
assert.deepEqual(spans("Built in Rome, the bridge still stands.", "PARTICIPIAL_CLAUSE_PASSIVE"), ["built"]);
assert.equal(none("The letter was written in haste.", "PARTICIPIAL_CLAUSE_PASSIVE"), true);
assert.equal(none(held, "PARTICIPIAL_CLAUSE_PASSIVE"), true);

assert.deepEqual(spans("When walking home, she met an old friend.", "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION"), ["walking"]);
assert.deepEqual(spans("While waiting there, he read a short note.", "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION"), ["waiting"]);
assert.equal(none("When she walked home, she met a friend.", "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION"), true);
assert.equal(none("If walking is hard, use the bus.", "PARTICIPIAL_CLAUSE_WITH_CONJUNCTION"), true);

assert.deepEqual(spans("His work finished, he left the office.", "ABSOLUTE_PARTICIPLE"), ["finished"]);
assert.deepEqual(spans("The weather being fine, we went outside.", "ABSOLUTE_PARTICIPLE"), ["being"]);
assert.equal(none("Walking down the street, the tree looked old.", "ABSOLUTE_PARTICIPLE"), true);
assert.equal(none("He finished the work and left.", "ABSOLUTE_PARTICIPLE"), true);

assert.deepEqual(spans("She sat with her eyes closed for a minute.", "WITH_OBJECT_PARTICIPLE"), ["closed"]);
assert.deepEqual(spans("He waited with the baby crying beside him.", "WITH_OBJECT_PARTICIPLE"), ["crying"]);
assert.equal(participleLocalDistractor("WITH_OBJECT_PARTICIPLE", "closed"), "closing");
assert.equal(none(byFocusing, "WITH_OBJECT_PARTICIPLE"), true);
assert.equal(none("She left with a closed umbrella.", "WITH_OBJECT_PARTICIPLE"), true);

assert.deepEqual(spans("Generally speaking, exercise is beneficial.", "PARTICIPIAL_CLAUSE_ACTIVE"), ["speaking"]);
assert.deepEqual(spans("Frankly speaking, the plan needs more time.", "PARTICIPIAL_CLAUSE_ACTIVE"), ["speaking"]);
assert.equal(participleLocalDistractor("PARTICIPIAL_CLAUSE_ACTIVE", "speaking"), "spoken");

assert.deepEqual(spans("Not knowing the answer, she asked again.", "PARTICIPIAL_CLAUSE_NEGATIVE"), ["knowing"]);
assert.deepEqual(spans("Not realizing the risk, they continued ahead.", "PARTICIPIAL_CLAUSE_NEGATIVE"), ["realizing"]);
assert.equal(none("She was not knowing the answer.", "PARTICIPIAL_CLAUSE_NEGATIVE"), true);
assert.equal(none("Not the answer, she asked again.", "PARTICIPIAL_CLAUSE_NEGATIVE"), true);

assert.ok(has("Walking down the street, the tree looked old.", "DANGLING_PARTICIPLE", "Walking"));
assert.ok(has("Opening the box, the idea seemed strange.", "DANGLING_PARTICIPLE", "Opening"));
assert.equal(none("Walking down the street, the tree looked old."), true);
assert.equal(none("Opening the box, the idea seemed strange."), true);

assert.equal(localTemplateDistractor("PARTICIPLE_NOUN_MODIFIER", "published"), "publishing");
assert.equal(localTemplateDistractor("PARTICIPLE_SUBJECT_COMPLEMENT", "suited"), "suiting");
assert.equal(localTemplateDistractor("PARTICIPLE_EMOTION", "frightened"), "frightening");

console.log("grammar-choice ch08 participles: PASS");
