/**
 * Chapter 09 nonfinite synthesis. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch09.ts
 */
import assert from "node:assert/strict";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import {
  NONFINITE_CH09_RULES,
  detectNonfiniteCh09,
  nonfiniteLocalDistractor,
  rejectNonfiniteChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";

function questions(text: string, code?: string) {
  return detectNonfiniteCh09(text).filter(
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
  return detectNonfiniteCh09(text).some(
    (hit) => hit.code === code && (!span || hit.sourceSpan.toLowerCase() === span.toLowerCase())
  );
}

assert.ok(NONFINITE_CH09_RULES.every((rule) => rule.referenceChapter === "CH09"));
assert.ok(NONFINITE_CH09_RULES.every((rule) => rule.finiteVerbRequirement && rule.logicalSubjectRule));
assert.equal(ontologyPoint("INFINITIVE_LOGICAL_SUBJECT")?.chapter, "C07");
assert.equal(ontologyPoint("INFINITIVE_LOGICAL_SUBJECT")?.referenceChapter, "CH06");
assert.equal(ontologyPoint("AGREEMENT_GERUND_SUBJECT")?.chapter, "C02");
assert.equal(ontologyPoint("AGREEMENT_GERUND_SUBJECT")?.referenceChapter, "CH07");
assert.equal(ontologyPoint("PARTICIPLE_NOUN_MODIFIER")?.referenceChapter, "CH08");

const letting = "Letting go of our need for control is difficult.";
const attracting = "Attracting a great career and a happy life may be difficult.";
const focusing = "You grow by focusing on the result you want.";
const planning = "Planning and thinking about the future takes time.";
const allow = "We must allow ourselves to participate in the work.";
const help = "These tools help them learn, communicate, create, and become fluent.";
const held = "Many animals are being held captive in small cages.";
const selection = "It takes time for natural selection to work on a species.";

assert.equal(none(letting, "AGREEMENT_GERUND_SUBJECT"), true);
assert.equal(none(letting, "GERUND_SUBJECT_AGREEMENT_ANALYSIS"), true);
assert.ok(has(letting, "GERUND_SUBJECT_AGREEMENT_ANALYSIS"));
assert.equal(nonfiniteLocalDistractor("AGREEMENT_GERUND_SUBJECT", "is"), "are");
assert.equal(none(attracting, "GERUND_SUBJECT"), true);
assert.ok(has(attracting, "GERUND_SUBJECT_ANALYSIS"));
assert.equal(none(attracting), true);
assert.equal(none(focusing, "GERUND_PREPOSITION_OBJECT"), true);
assert.ok(has(focusing, "GERUND_PREP_OBJECT_ANALYSIS"));
assert.equal(none(focusing), true);
assert.equal(none(planning, "GERUND_SUBJECT"), true);
assert.ok(has(planning, "GERUND_SUBJECT_ANALYSIS"));
assert.equal(none(planning), true);
assert.equal(none(allow, "OBJECT_COMPLEMENT_TO_V"), true);
assert.ok(has(allow, "OBJECT_COMPLEMENT_TO_V_ANALYSIS"));
assert.equal(none(allow), true);
assert.equal(none(help, "OBJECT_COMPLEMENT_BARE_V"), true);
assert.ok(has(help, "OBJECT_COMPLEMENT_BARE_ANALYSIS"));
assert.equal(none(help), true);
assert.ok(has(held, "VOICE_PROGRESSIVE_PASSIVE", "held"));
assert.equal(none(held), true);
assert.ok(has(selection, "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", "for"));
assert.equal(none(selection, "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(none(selection, "NONFINITE_LOGICAL_SUBJECT_ANALYSIS"), true);
assert.equal(
  rejectNonfiniteChoice({
    pointCode: "INFINITIVE_LOGICAL_SUBJECT",
    correct: "to work",
    wrong: "to working",
    sentence: selection,
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

assert.equal(none("It is important for humans to have many kinds of minds.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.ok(has("It is important for humans to have many kinds of minds.", "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", "for"));
assert.equal(none("It is important for humans to have many kinds of minds.", "NONFINITE_LOGICAL_SUBJECT_ANALYSIS"), true);
assert.equal(none("It is necessary for students to review the rules.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(nonfiniteLocalDistractor("INFINITIVE_LOGICAL_SUBJECT", "for"), "of");
assert.equal(none("It was kind of her to wait at the door.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.ok(has("It was kind of her to wait at the door.", "NONFINITE_LOGICAL_SUBJECT_ANALYSIS", "of"));
assert.equal(none("It was foolish of them to ignore the warning.", "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(none(selection, "INFINITIVE_LOGICAL_SUBJECT"), true);
assert.equal(none("I remember his leaving the room early.", "GERUND_LOGICAL_SUBJECT"), true);
assert.equal(
  rejectNonfiniteChoice({
    pointCode: "GERUND_LOGICAL_SUBJECT",
    correct: "his",
    wrong: "him",
    sentence: "I remember his leaving the room early.",
  }),
  "BOTH_GRAMMATICAL"
);

assert.equal(none("Reading long novels every night is tiring for students.", "AGREEMENT_GERUND_SUBJECT"), true);
assert.ok(has("Reading long novels every night is tiring for students.", "GERUND_SUBJECT_AGREEMENT_ANALYSIS"));
assert.equal(none("To master several languages at once is difficult.", "AGREEMENT_GERUND_SUBJECT"), true);
assert.equal(none("Swimming is fun for children.", "AGREEMENT_GERUND_SUBJECT"), true);
assert.equal(none("She is reading a long novel tonight.", "AGREEMENT_GERUND_SUBJECT"), true);

assert.equal(none("The rapid growth of online platforms has changed society.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);
assert.ok(has("The rapid growth of online platforms has changed society.", "PREP_MODIFIER_AGREEMENT_ANALYSIS"));
assert.equal(none("The sudden rise of mobile users has changed daily life.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);
assert.ok(has("The sudden rise of mobile users has changed daily life.", "PREP_MODIFIER_AGREEMENT_ANALYSIS"));
assert.equal(nonfiniteLocalDistractor("AGREEMENT_PREPOSITIONAL_MODIFIER", "has"), "have");
assert.equal(none("The platforms have changed society already.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);
assert.equal(none("The students of this class are ready now.", "AGREEMENT_PREPOSITIONAL_MODIFIER"), true);

assert.deepEqual(
  spans("She seems to have forgotten the appointment today.", "INFINITIVE_PERFECT"),
  ["to have forgotten"]
);
assert.deepEqual(
  spans("He claims to have written the letter already.", "INFINITIVE_PERFECT"),
  ["to have written"]
);
assert.equal(
  nonfiniteLocalDistractor("INFINITIVE_PERFECT", "to have forgotten"),
  "to have been forgotten"
);
assert.equal(none("She forgot the appointment today.", "INFINITIVE_PERFECT"), true);
assert.equal(none("She seems to have left already.", "INFINITIVE_PERFECT"), true);

assert.deepEqual(
  spans("He admitted having broken the vase yesterday.", "GERUND_PERFECT"),
  ["having broken"]
);
assert.deepEqual(
  spans("She denied having taken the money yesterday.", "GERUND_PERFECT"),
  ["having taken"]
);
assert.equal(none("Having finished the work, she left early.", "GERUND_PERFECT"), true);
assert.equal(none("She broke the vase yesterday.", "GERUND_PERFECT"), true);

assert.deepEqual(
  spans("The plan is expected to be completed soon.", "INFINITIVE_PASSIVE"),
  ["to be completed"]
);
assert.deepEqual(
  spans("The house is said to be finished next month.", "INFINITIVE_PASSIVE"),
  ["to be finished"]
);
assert.equal(nonfiniteLocalDistractor("INFINITIVE_PASSIVE", "to be completed"), "to complete");
assert.equal(none("She expects to complete the plan soon.", "INFINITIVE_PASSIVE"), true);
assert.equal(none(held, "INFINITIVE_PASSIVE"), true);

assert.deepEqual(
  spans("Having been warned about the danger, he stayed home.", "GERUND_PASSIVE"),
  ["having been warned"]
);
assert.deepEqual(
  spans("Having been told about the change, they waited outside.", "GERUND_PASSIVE"),
  ["having been told"]
);
assert.equal(
  nonfiniteLocalDistractor("GERUND_PASSIVE", "Having been warned"),
  "Having warned"
);
assert.deepEqual(spans("She dislikes being ignored in meetings.", "GERUND_PASSIVE"), ["being ignored"]);
assert.equal(none(held, "GERUND_PASSIVE"), true);
assert.equal(none("The story stating that fact is new.", "GERUND_PASSIVE"), true);

assert.equal(none("They want to know the answer.", "INFINITIVE_NOUN_ROLE"), true);
assert.equal(
  rejectNonfiniteChoice({
    pointCode: "OBJECT_COMPLEMENT_BARE_V",
    correct: "try",
    wrong: "tries",
    sentence: "She could try the door again.",
  }),
  "MECHANICAL_MODAL_FORM"
);
assert.equal(
  rejectNonfiniteChoice({
    pointCode: "GERUND_PREPOSITION_OBJECT",
    correct: "moving",
    wrong: "move",
    sentence: "She left instead of moving the box.",
  }),
  null
);
assert.equal(
  rejectNonfiniteChoice({
    pointCode: "GERUND_FIXED_CONSTRUCTION",
    correct: "having",
    wrong: "have",
    sentence: "There is nothing wrong with having a plan.",
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

assert.equal(localTemplateDistractor("INFINITIVE_LOGICAL_SUBJECT", "for"), "of");
assert.equal(localTemplateDistractor("AGREEMENT_GERUND_SUBJECT", "is"), "are");
assert.equal(localTemplateDistractor("INFINITIVE_PASSIVE", "to be completed"), "to complete");

const locked = [
  ["Please remember to lock the door before you leave.", "NONFINITE_MEMORY_COMPLEMENT", "to lock", "FUTURE_DUTY"],
  ["I still remember meeting her in Paris last year.", "NONFINITE_MEMORY_COMPLEMENT", "meeting", "PAST_EXPERIENCE"],
  ["Don't forget to submit the form by Friday.", "NONFINITE_MEMORY_COMPLEMENT", "to submit", "FUTURE_DUTY"],
  ["I will never forget seeing the eclipse.", "NONFINITE_MEMORY_COMPLEMENT", "seeing", "PAST_EXPERIENCE"],
  ["He stopped smoking last year.", "NONFINITE_STOP_COMPLEMENT", "smoking", "CEASE_ACTION"],
  ["She stopped to rest because she was tired.", "NONFINITE_STOP_COMPLEMENT", "to rest", "PAUSE_FOR_PURPOSE"],
  ["She tried to open the window, but it was stuck.", "NONFINITE_TRY_COMPLEMENT", "to open", "EFFORT_UNCERTAIN"],
  ["If the key does not work, try turning it the other way.", "NONFINITE_TRY_COMPLEMENT", "turning", "EXPERIMENT"],
  ["I meant to call you, but I forgot.", "NONFINITE_MEAN_COMPLEMENT", "to call", "INTENTION"],
  ["Missing the bus means waiting another hour.", "NONFINITE_MEAN_COMPLEMENT", "waiting", "RESULT_ENTAILMENT"],
  ["After the break, she went on to explain the next chapter.", "NONFINITE_GO_ON_COMPLEMENT", "to explain", "NEXT_STAGE"],
  ["Despite the noise, he went on talking.", "NONFINITE_GO_ON_COMPLEMENT", "talking", "CONTINUE_SAME"],
] as const;
for (const [text, code, span, lock] of locked) {
  const hit = detectNonfiniteCh09(text).find((item) => item.code === code && item.questionable);
  assert.ok(hit, text);
  assert.equal(hit?.sourceSpan.toLowerCase(), span);
  assert.equal(hit?.contextLockType, lock);
  assert.ok(hit?.evidenceSpan && text.includes(hit.evidenceSpan));
  assert.equal(localTemplateDistractor(code, hit!.sourceSpan)?.toLowerCase() !== span, true);
}
const ambiguous = [
  "I remember locking the door.",
  "She forgot calling him.",
  "He stopped smoking.",
  "They stopped to think.",
  "She tried to open it.",
  "She tried opening it.",
  "This means to help.",
  "This means helping.",
  "He went on to explain.",
  "He went on explaining.",
];
for (const text of ambiguous) {
  const asked = detectNonfiniteCh09(text).filter((hit) => hit.questionable && hit.code.endsWith("_COMPLEMENT"));
  assert.equal(asked.length, 0, text);
}
assert.equal(detectNonfiniteCh09("He went on to explain.").some((hit) => hit.code === "NONFINITE_GO_ON_COMPLEMENT"), true);
assert.equal(none("They began to leave.", "NONFINITE_MEMORY_COMPLEMENT"), true);

console.log("grammar-choice ch09 nonfinites: PASS");
