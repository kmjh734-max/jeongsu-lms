/**
 * Chapter 03 voice. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch03.ts
 */
import assert from "node:assert/strict";
import { detectConditionalCh05 } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { detectNonfiniteCh09 } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { detectParticipleCh08 } from "../src/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import {
  VOICE_CH03_RULES,
  detectVoiceCh03,
  rejectVoiceChoice,
  voiceLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";

function questions(text: string, code?: string, subtype?: string) {
  return detectVoiceCh03(text).filter(
    (hit) => hit.questionable && (!code || hit.code === code) && (!subtype || hit.subtype === subtype)
  );
}

function spans(text: string, code: string, subtype?: string) {
  return questions(text, code, subtype).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectVoiceCh03(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(VOICE_CH03_RULES.every((rule) => rule.referenceChapter === "CH03"));
assert.ok(VOICE_CH03_RULES.every((rule) => rule.transitivityRule && rule.subjectRole && rule.auxiliaryPattern));
assert.equal(ontologyPoint("VOICE_BE_MADE_TO")?.chapter, "C04");
assert.equal(ontologyPoint("VOICE_BE_MADE_TO")?.referenceChapter, "CH03");
assert.equal(ontologyPoint("VOICE_PROGRESSIVE_PASSIVE")?.referenceChapter, "CH03");
assert.equal(ontologyPoint("PARTICIPLE_NOUN_MODIFIER")?.referenceChapter, "CH08");
assert.equal(ontologyPoint("INFINITIVE_PASSIVE")?.referenceChapter, "CH09");
assert.equal(ontologyPoint("CAUSATIVE_PASSIVE")?.chapter, "C01");
assert.equal(ontologyPoint("CAUSATIVE_PASSIVE")?.referenceChapter, undefined);

assert.deepEqual(
  spans("Many kids today are being held captive by smart devices.", "VOICE_PROGRESSIVE_PASSIVE"),
  ["are being held"]
);
assert.deepEqual(
  spans("The walls were being painted by the crew.", "VOICE_PROGRESSIVE_PASSIVE"),
  ["were being painted"]
);
assert.equal(voiceLocalDistractor("VOICE_PROGRESSIVE_PASSIVE", "are being held"), "are holding");
assert.equal(voiceLocalDistractor("VOICE_PROGRESSIVE_PASSIVE", "held"), null);
assert.equal(none("She is being careful today.", "VOICE_PROGRESSIVE_PASSIVE"), true);
assert.equal(none("They are holding the rope now.", "VOICE_PROGRESSIVE_PASSIVE"), true);
assert.equal(
  rejectVoiceChoice({
    pointCode: "VOICE_PROGRESSIVE_PASSIVE",
    correct: "held",
    wrong: "holding",
    sentence: "Many kids today are being held captive by smart devices.",
  }),
  "UNREALISTIC_LEARNER_ERROR"
);

assert.deepEqual(
  spans("The recommendation has been accepted by the committee.", "VOICE_PERFECT_PASSIVE"),
  ["has been accepted"]
);
assert.deepEqual(
  spans("The report had been recommended by experts.", "VOICE_PERFECT_PASSIVE"),
  ["had been recommended"]
);
assert.equal(voiceLocalDistractor("VOICE_PERFECT_PASSIVE", "has been accepted"), "has accepted");
assert.equal(none("She has accepted the offer already.", "VOICE_PERFECT_PASSIVE"), true);
assert.equal(none("She has been tired all morning.", "VOICE_PERFECT_PASSIVE"), true);

assert.deepEqual(
  spans("This can be done by diversifying the sources.", "VOICE_MODAL_PASSIVE"),
  ["can be done"]
);
assert.deepEqual(
  spans("The task must be finished by the team.", "VOICE_MODAL_PASSIVE"),
  ["must be finished"]
);
assert.equal(voiceLocalDistractor("VOICE_MODAL_PASSIVE", "can be done"), "can do");
assert.equal(none("These graphs can misrepresent the trend.", "VOICE_MODAL_PASSIVE"), true);
assert.equal(none("These graphs can be misrepresented.", "VOICE_MODAL_PASSIVE"), true);

assert.deepEqual(
  spans("False information can be broken down into two types.", "VOICE_PHRASAL_VERB_PASSIVE"),
  ["can be broken down"]
);
assert.deepEqual(
  spans("The child is looked after by relatives.", "VOICE_PHRASAL_VERB_PASSIVE"),
  ["is looked after"]
);
assert.ok(spans("Students should be exposed to content.", "VOICE_PHRASAL_VERB_PASSIVE").includes("be exposed to"));
assert.equal(voiceLocalDistractor("VOICE_PHRASAL_VERB_PASSIVE", "can be broken down"), "can break down");
assert.equal(voiceLocalDistractor("VOICE_PHRASAL_VERB_PASSIVE", "be exposed to"), "expose to");
assert.equal(voiceLocalDistractor("VOICE_PHRASAL_VERB_PASSIVE", "is looked after"), "looks after");
assert.equal(none("She looked after the child every day.", "VOICE_PHRASAL_VERB_PASSIVE"), true);
assert.equal(none("The car broke down on the road.", "VOICE_PHRASAL_VERB_PASSIVE"), true);
assert.equal(
  rejectVoiceChoice({
    pointCode: "VOICE_PHRASAL_VERB_PASSIVE",
    correct: "looked after",
    wrong: "looked",
    sentence: "The child is looked after by relatives.",
  }),
  "FUNCTION_WORD_OR_ARGUMENT_DROPPED"
);

assert.deepEqual(spans("A prize was given to her.", "VOICE_SVOO_PASSIVE", "PREP_TO_FOR"), ["to"]);
assert.deepEqual(spans("A cake was bought for them.", "VOICE_SVOO_PASSIVE", "PREP_TO_FOR"), ["for"]);
assert.equal(voiceLocalDistractor("VOICE_SVOO_PASSIVE", "to"), "for");
assert.equal(voiceLocalDistractor("VOICE_SVOO_PASSIVE", "for"), "to");
assert.equal(none("She was given a prize.", "VOICE_SVOO_PASSIVE"), true);
assert.equal(none("They were offered a seat.", "VOICE_SVOO_PASSIVE"), true);
assert.ok(has("She was given a prize.", "VOICE_SVOO_PASSIVE", "IO_SUBJECT"));

assert.deepEqual(spans("We were made to move through the hall.", "VOICE_BE_MADE_TO"), ["made to move"]);
assert.deepEqual(spans("The students were made to wait outside.", "VOICE_BE_MADE_TO"), ["made to wait"]);
assert.equal(voiceLocalDistractor("VOICE_BE_MADE_TO", "made to move"), "made move");
assert.equal(none("She made us move quickly.", "VOICE_BE_MADE_TO"), true);
assert.equal(none("The dress was made to order.", "VOICE_BE_MADE_TO"), true);

assert.deepEqual(spans("He was seen to enter the building.", "VOICE_BE_SEEN_TO"), ["seen to enter"]);
assert.deepEqual(spans("She was heard to sing the chorus.", "VOICE_BE_SEEN_TO"), ["heard to sing"]);
assert.equal(voiceLocalDistractor("VOICE_BE_SEEN_TO", "seen to enter"), "seen enter");
assert.equal(none("They saw him enter the building.", "VOICE_BE_SEEN_TO"), true);
assert.equal(none("He was seen to the door.", "VOICE_BE_SEEN_TO"), true);

assert.deepEqual(spans("Humans are meant to live extraordinary lives.", "VOICE_ACTIVE_PASSIVE", "PASSIVE_IDIOM"), ["are meant to"]);
assert.deepEqual(spans("The ad is not intended to deceive readers.", "VOICE_ACTIVE_PASSIVE", "PASSIVE_IDIOM"), ["is not intended to"]);
// be meant/intended to의 능동형(mean to, intend to)은 뜻만 다른 정문이라 오답을 만들지 않는다.
assert.equal(voiceLocalDistractor("VOICE_ACTIVE_PASSIVE", "are meant to"), null);
assert.equal(voiceLocalDistractor("VOICE_ACTIVE_PASSIVE", "is not intended to"), null);
assert.equal(voiceLocalDistractor("VOICE_ACTIVE_PASSIVE", "are supposed to"), "suppose to");
assert.equal(none("She is interested in science.", "VOICE_ACTIVE_PASSIVE"), true);
assert.equal(none("The members are well suited to the role.", "VOICE_ACTIVE_PASSIVE"), true);
assert.ok(has("She is interested in science.", "VOICE_ACTIVE_PASSIVE", "STATIVE_ADJECTIVE"));
assert.equal(none("The accident happened yesterday.", "VOICE_ACTIVE_PASSIVE"), true);
assert.equal(none("The meeting took place at noon.", "VOICE_ACTIVE_PASSIVE"), true);

assert.deepEqual(spans("The letter is accepted by the office.", "VOICE_ACTIVE_PASSIVE", "SIMPLE_BE_PP"), ["is accepted"]);
assert.deepEqual(spans("The plan was recommended by the board.", "VOICE_ACTIVE_PASSIVE", "SIMPLE_BE_PP"), ["was recommended"]);
assert.equal(voiceLocalDistractor("VOICE_ACTIVE_PASSIVE", "is accepted"), "accepts");

assert.deepEqual(spans("He is said to be honest.", "VOICE_NONFINITE_PASSIVE", "SAID_TO"), ["said to"]);
assert.deepEqual(spans("She is believed to be right.", "VOICE_NONFINITE_PASSIVE", "SAID_TO"), ["believed to"]);
assert.equal(voiceLocalDistractor("VOICE_NONFINITE_PASSIVE", "said to"), "said");
assert.equal(none("People say that he is honest.", "VOICE_NONFINITE_PASSIVE"), true);
assert.equal(none("It is said that he is honest.", "VOICE_NONFINITE_PASSIVE"), true);
assert.ok(has("It is said that he is honest.", "VOICE_NONFINITE_PASSIVE", "IT_IS_SAID"));
assert.equal(
  questions("He is said to be honest.", "VOICE_NONFINITE_PASSIVE").some((hit) => /to be|to have/.test(hit.sourceSpan)),
  false
);

assert.ok(has("She was called a hero.", "VOICE_SVOC_PASSIVE", "COMPLEMENT_KEPT"));
assert.ok(has("He was elected president.", "VOICE_SVOC_PASSIVE", "COMPLEMENT_KEPT"));
assert.equal(none("She was called a hero.", "VOICE_SVOC_PASSIVE"), true);
assert.equal(none("They called her a hero.", "VOICE_SVOC_PASSIVE"), true);

assert.deepEqual(spans("She had the car repaired.", "VOICE_CAUSATIVE_HAVE_GET"), ["repaired"]);
assert.deepEqual(spans("They got the door fixed.", "VOICE_CAUSATIVE_HAVE_GET"), ["fixed"]);
assert.equal(voiceLocalDistractor("VOICE_CAUSATIVE_HAVE_GET", "repaired"), "repair");
assert.equal(none("She had a car.", "VOICE_CAUSATIVE_HAVE_GET"), true);
assert.equal(none("She repaired the car herself.", "VOICE_CAUSATIVE_HAVE_GET"), true);

const held = "Many kids today are being held captive by smart devices.";
assert.equal(
  detectParticipleCh08(held).some((hit) => hit.questionable && hit.sourceSpan.toLowerCase() === "are being held"),
  false
);
assert.equal(
  detectNonfiniteCh09("He is said to be honest.").some((hit) => hit.sourceSpan.toLowerCase() === "said to"),
  false
);
assert.equal(detectConditionalCh05("Had he arrived, we would have left.").some((hit) => hit.code.startsWith("VOICE_")), false);

assert.equal(localTemplateDistractor("VOICE_PROGRESSIVE_PASSIVE", "are being held"), "are holding");
assert.equal(localTemplateDistractor("VOICE_BE_MADE_TO", "made to move"), "made move");
assert.equal(localTemplateDistractor("VOICE_BE_MADE_TO", "to move"), "move");

console.log("grammar-choice ch03 voice: PASS");
