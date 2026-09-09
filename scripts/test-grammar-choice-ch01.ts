/**
 * Chapter 01 sentence patterns. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch01.ts
 */
import assert from "node:assert/strict";
import { detectVoiceCh03 } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { detectNonfiniteCh09 } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { OBJECT_COMPLEMENT_TO_V_OWNERSHIP } from "../src/lib/lesson-materials/grammar-choice-v2/ownership";
import {
  SENTENCE_CH01_RULES,
  detectSentenceCh01,
  rejectSentenceChoice,
  sentenceLocalDistractor,
} from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";

function questions(text: string, code?: string) {
  return detectSentenceCh01(text).filter((hit) => hit.questionable && (!code || hit.code === code));
}

function spans(text: string, code: string) {
  return questions(text, code).map((hit) => hit.sourceSpan.toLowerCase());
}

function none(text: string, code?: string) {
  return questions(text, code).length === 0;
}

function has(text: string, code: string, subtype?: string) {
  return detectSentenceCh01(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

const CH01_IDENTITY = [
  ["SENTENCE_SV", "INTRANSITIVE"],
  ["SENTENCE_SVC", "LINKING_ADJ"],
  ["SENTENCE_SVO", "TRANSITIVE_OBJECT"],
  ["VERB_TRANSITIVE_INTRANSITIVE", "BARE_OBJECT"],
  ["SENTENCE_SVOO", "TO_PERSON"],
  ["OBJECT_COMPLEMENT_NOUN_ADJ", "ADJ_OC"],
  ["OBJECT_COMPLEMENT_TO_V", "TO_V"],
  ["CAUSATIVE_ACTIVE", "BARE_V"],
  ["PERCEPTION_COMPLEMENT", "V_OR_ING"],
  ["OBJECT_COMPLEMENT_PP", "HAVE_GET_PP"],
] as const;

assert.equal(SENTENCE_CH01_RULES.length, 10);
assert.deepEqual(
  SENTENCE_CH01_RULES.map((rule) => [rule.code, rule.subtype]),
  CH01_IDENTITY
);
assert.ok(
  SENTENCE_CH01_RULES.every(
    (rule) =>
      rule.priority &&
      rule.referenceChapter === "CH01" &&
      Array.isArray(rule.allowedMinimalPairs) &&
      Array.isArray(rule.rejectConditions) &&
      rule.sentencePattern &&
      rule.verbClass &&
      rule.requiredArgument
  )
);
assert.ok(
  SENTENCE_CH01_RULES.filter((rule) => rule.allowedMinimalPairs.length === 0).every((rule) =>
    ["SENTENCE_SV", "SENTENCE_SVO", "PERCEPTION_COMPLEMENT"].includes(rule.code)
  )
);
assert.equal(ontologyPoint("SENTENCE_SVC")?.chapter, "C01");
assert.equal(ontologyPoint("SENTENCE_SVC")?.referenceChapter, "CH01");
assert.equal(ontologyPoint("OBJECT_COMPLEMENT_TO_V")?.referenceChapter, "CH01");
assert.equal(ontologyPoint("CAUSATIVE_ACTIVE")?.referenceChapter, "CH01");
assert.equal(ontologyPoint("VOICE_BE_MADE_TO")?.referenceChapter, "CH03");
assert.equal(ontologyPoint("INFINITIVE_OBJECT_COMPLEMENT")?.referenceChapter, "CH09");

assert.ok(has("The sun rose early.", "SENTENCE_SV"));
assert.ok(has("The guests arrived late.", "SENTENCE_SV"));
assert.equal(none("The sun rose early.", "SENTENCE_SV"), true);
assert.equal(none("The guests arrived late.", "SENTENCE_SV"), true);

assert.deepEqual(spans("The soup tastes good.", "SENTENCE_SVC"), ["good"]);
assert.deepEqual(spans("The result seems reasonable.", "SENTENCE_SVC"), ["reasonable"]);
assert.deepEqual(spans("Our thoughts and words are extremely magnetic.", "SENTENCE_SVC"), ["magnetic"]);
assert.equal(sentenceLocalDistractor("SENTENCE_SVC", "good"), "well");
assert.equal(sentenceLocalDistractor("SENTENCE_SVC", "magnetic"), "magnetically");
assert.equal(none("She sings well on stage.", "SENTENCE_SVC"), true);
assert.equal(none("I feel well today.", "SENTENCE_SVC"), true);
assert.ok(has("The most powerful attractor is our belief system.", "SENTENCE_SVC", "NOUN_COMPLEMENT"));
assert.equal(none("The most powerful attractor is our belief system.", "SENTENCE_SVC"), true);

assert.ok(has("Graphs enhance the credibility of data.", "SENTENCE_SVO"));
assert.ok(has("Readers enhance the report overnight.", "SENTENCE_SVO"));
assert.equal(none("Graphs enhance the credibility of data.", "SENTENCE_SVO"), true);
assert.equal(none("Readers enhance the report overnight.", "SENTENCE_SVO"), true);

assert.deepEqual(spans("They discussed the issue after lunch.", "VERB_TRANSITIVE_INTRANSITIVE"), ["the issue"]);
assert.deepEqual(spans("She entered the room quietly.", "VERB_TRANSITIVE_INTRANSITIVE"), ["the room"]);
assert.equal(sentenceLocalDistractor("VERB_TRANSITIVE_INTRANSITIVE", "the issue"), "about the issue");
assert.equal(sentenceLocalDistractor("VERB_TRANSITIVE_INTRANSITIVE", "the room"), "into the room");
assert.equal(none("She entered into a long contract.", "VERB_TRANSITIVE_INTRANSITIVE"), true);
assert.equal(none("They listened to the speaker.", "VERB_TRANSITIVE_INTRANSITIVE"), true);
assert.ok(has("She waited for the result.", "VERB_TRANSITIVE_INTRANSITIVE", "REQUIRED_PREP"));

assert.deepEqual(spans("He explained the rule to me.", "SENTENCE_SVOO"), ["to me"]);
assert.deepEqual(spans("She provided me with the information.", "SENTENCE_SVOO"), ["with"]);
assert.equal(sentenceLocalDistractor("SENTENCE_SVOO", "to me"), "me");
assert.equal(sentenceLocalDistractor("SENTENCE_SVOO", "with"), "∅");
assert.equal(none("She gave me a prize.", "SENTENCE_SVOO"), true);
assert.equal(none("He sent her a letter.", "SENTENCE_SVOO"), true);

assert.deepEqual(spans("The news made him happy.", "OBJECT_COMPLEMENT_NOUN_ADJ"), ["happy"]);
assert.deepEqual(spans("This can make people more susceptible.", "OBJECT_COMPLEMENT_NOUN_ADJ"), ["susceptible"]);
assert.equal(sentenceLocalDistractor("OBJECT_COMPLEMENT_NOUN_ADJ", "happy"), "happily");
assert.equal(sentenceLocalDistractor("OBJECT_COMPLEMENT_NOUN_ADJ", "susceptible"), "susceptibly");
assert.equal(none("She made dinner happily.", "OBJECT_COMPLEMENT_NOUN_ADJ"), true);
assert.equal(none("They called him a hero.", "OBJECT_COMPLEMENT_NOUN_ADJ"), true);

assert.deepEqual(spans("We don't allow ourselves to participate.", "OBJECT_COMPLEMENT_TO_V"), ["to participate"]);
assert.deepEqual(spans("The report can lead people to make decisions.", "OBJECT_COMPLEMENT_TO_V"), ["to make"]);
assert.equal(sentenceLocalDistractor("OBJECT_COMPLEMENT_TO_V", "to participate"), "participate");
assert.equal(none("This can help them learn, communicate, create, and become.", "OBJECT_COMPLEMENT_TO_V"), true);
assert.equal(none("They helped her to finish the draft.", "OBJECT_COMPLEMENT_TO_V"), true);
assert.equal(none("We were made to move through the hall.", "OBJECT_COMPLEMENT_TO_V"), true);
assert.ok(detectVoiceCh03("We were made to move through the hall.").some((hit) => hit.questionable && hit.code === "VOICE_BE_MADE_TO"));

assert.deepEqual(spans("The chart can make one group look better.", "CAUSATIVE_ACTIVE"), ["look"]);
assert.deepEqual(spans("The advertisement made the product look attractive.", "CAUSATIVE_ACTIVE"), ["look"]);
assert.equal(sentenceLocalDistractor("CAUSATIVE_ACTIVE", "look"), "to look");
assert.equal(none("This can help them learn, communicate, create, and become.", "CAUSATIVE_ACTIVE"), true);
assert.ok(has("This can help them learn, communicate, create, and become.", "OBJECT_COMPLEMENT_BARE_V", "HELP_PARALLEL"));
assert.equal(none("I saw him enter the building.", "PERCEPTION_COMPLEMENT"), true);
assert.equal(none("I saw him crossing the street.", "PERCEPTION_COMPLEMENT"), true);

assert.ok(has("I had my car repaired.", "OBJECT_COMPLEMENT_PP", "HAVE_GET_PP"));
assert.ok(has("She got the door painted.", "OBJECT_COMPLEMENT_PP", "HAVE_GET_PP"));
assert.equal(none("I had my car repaired.", "OBJECT_COMPLEMENT_PP"), true);
assert.equal(none("She got the door painted.", "OBJECT_COMPLEMENT_PP"), true);

assert.equal(
  rejectSentenceChoice({
    pointCode: "OBJECT_COMPLEMENT_TO_V",
    correct: "learn",
    wrong: "to learn",
    sentence: "This can help them learn, communicate, create, and become.",
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  detectNonfiniteCh09("We don't allow ourselves to participate.").some(
    (hit) => hit.questionable && hit.sourceSpan.toLowerCase() === "to participate"
  ),
  false
);

assert.equal(localTemplateDistractor("SENTENCE_SVC", "magnetic"), "magnetically");
assert.equal(localTemplateDistractor("OBJECT_COMPLEMENT_TO_V", "to participate"), "participate");
assert.equal(localTemplateDistractor("CAUSATIVE_ACTIVE", "look"), "to look");

function restores(sentence: string, span: string, distractor: string | null) {
  assert.ok(distractor);
  const broken = sentence.replace(span, distractor);
  assert.notEqual(broken, sentence);
  assert.equal(broken.replace(distractor, span), sentence);
}

restores("The soup tastes good.", "good", sentenceLocalDistractor("SENTENCE_SVC", "good"));
restores("They discussed the issue after lunch.", "the issue", sentenceLocalDistractor("VERB_TRANSITIVE_INTRANSITIVE", "the issue"));
restores("He explained the rule to me.", "to me", sentenceLocalDistractor("SENTENCE_SVOO", "to me"));
restores("We don't allow ourselves to participate.", "to participate", sentenceLocalDistractor("OBJECT_COMPLEMENT_TO_V", "to participate"));

const allowObject = "We don't allow ourselves to participate.";
const ch01Object = detectSentenceCh01(allowObject).filter(
  (hit) => hit.questionable && hit.code === "OBJECT_COMPLEMENT_TO_V" && hit.subtype === "TO_V"
);
const ch09Object = detectNonfiniteCh09(allowObject).filter((hit) => hit.code === "OBJECT_COMPLEMENT_TO_V_ANALYSIS");
const objectCandidates = [
  ...ch01Object.map((hit) => ({ owner: "CH01" as const, ...hit })),
  ...ch09Object.filter((hit) => hit.questionable).map((hit) => ({ owner: "CH09" as const, ...hit })),
];
assert.equal(ch01Object.length, 1);
assert.equal(ch09Object.length, 1);
assert.equal(ch09Object[0]?.questionable, false);
assert.equal(objectCandidates.length, 1);
assert.equal(objectCandidates[0]?.owner, OBJECT_COMPLEMENT_TO_V_OWNERSHIP.primary);

const otherNonfinite = "We allow ourselves to participate, and it is important for students to review the rules.";
assert.equal(
  detectNonfiniteCh09(otherNonfinite).some((hit) => hit.questionable && hit.code === "INFINITIVE_LOGICAL_SUBJECT"),
  false
);
assert.ok(
  detectNonfiniteCh09(otherNonfinite).some((hit) => hit.code === "NONFINITE_LOGICAL_SUBJECT_ANALYSIS" && !hit.questionable)
);
restores("The chart can make one group look better.", "look", sentenceLocalDistractor("CAUSATIVE_ACTIVE", "look"));

console.log("grammar-choice ch01 sentence patterns: PASS");
