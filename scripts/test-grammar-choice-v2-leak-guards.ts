/**
 * 배포 전 16지문(236문항) 점검에서 판정·검수를 통과해 나온 문항(2026-09-11)과,
 * 같은 실행에서 나온 멀쩡한 문항. 앞의 것은 막히고 뒤의 것은 그대로 나와야 한다.
 */
import assert from "node:assert/strict";
import { rejectFabricatedDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { checkLabelContract } from "../src/lib/lesson-materials/grammar-choice-v2/label-contract";
import { rejectCandidate, spanStart } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { rejectAtPosition } from "../src/lib/lesson-materials/grammar-choice-v2/position-guards";
import { preferWhichOverWhom } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { relativeLocalDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { buildSlotSentence } from "../src/lib/lesson-materials/grammar-choice-v2/uniqueness-audit";
import type { GrammarCandidate, GrammarPointCode } from "../src/lib/lesson-materials/grammar-choice-v2/types";

type Row = [code: string, correct: string, wrong: string, sentence: string];

function position(code: string, correct: string, wrong: string, sentence: string) {
  const at = spanStart(sentence, correct);
  assert.ok(at >= 0, `정답이 문장에 없다: ${correct}`);
  return rejectAtPosition({ pointCode: code, correct, wrong, sentence, at });
}

// 1. 막아야 하는 것
const LEAKS: Array<[...Row, string]> = [
  ["PREPOSITION_COLLOCATION", "in", "during", "Studies show that more than 70% of people report feeling impostor syndrome at some point in their lives.", "BOTH_GRAMMATICAL"],
  ["PREPOSITION_COLLOCATION", "in", "of", "Therefore, to keep yourself entertained for a long time, you need to increase the level of variety in your everyday routine.", "BOTH_GRAMMATICAL"],
  ["INFINITIVE_ADVERB_ROLE", "to keep", "keeping", "Therefore, to keep yourself entertained for a long time, you need to increase the level of variety in your everyday routine.", "BOTH_GRAMMATICAL"],
  ["COMPARATIVE", "more", "most", "In today’s world, we need the first advantage to handle pocketbook strain; but we need the second advantage to handle something potentially more important―brain strain.", "BOTH_GRAMMATICAL"],
  ["AGREEMENT_PREPOSITIONAL_MODIFIER", "would become", "would becomes", "As these communities grew in size, though, the inadequacies of this system would become evident.", "MECHANICAL_MODAL_FORM"],
  ["AGREEMENT_LONG_SUBJECT", "will damage", "will damages", "You may think such frequent paragraphing will damage the development of your point.", "MECHANICAL_MODAL_FORM"],
  ["AGREEMENT_PREPOSITIONAL_MODIFIER", "circulated", "circulates", "An agenda with a meeting start time and a topic will probably be circulated before the meeting.", "UNREALISTIC_LEARNER_ERROR"],
  ["TENSE_TIME_CONDITION_CLAUSE", "find", "will find", "Some of the ants set forth from the nest to find fresh vegetation; when they find it, they chew off large pieces that they carry back to the nest.", "MECHANICAL_INFINITIVE_MARKER"],
  ["PARTICIPLE_NOUN_MODIFIER", "meeting", "met", "An agenda with a meeting start time and a topic will probably be circulated before the meeting.", "CODE_SPAN_CONTRACT_MISMATCH"],
  ["PARALLEL_ADJECTIVES", "flexible", "flexibly", "In flexible-time cultures, it seems clear that the most productive meetings grow in unpredictable ways.", "CODE_SPAN_CONTRACT_MISMATCH"],
  ["RELATIVE_OMISSION", "in", "him in", "You may accidentally bump into someone on the street, and the person turns out to be a friend you haven’t seen in a while.", "IMPLAUSIBLE_DISTRACTOR"],
  // 2차 실행
  ["LINKING_VERB_COMPLEMENT", "like", "likely", "It sounds like you might be experiencing what some experts refer to as “impostor syndrome.”", "BOTH_GRAMMATICAL"],
  ["RELATIVE_OMISSION", "everyone", "which everyone", "So get out there and do the work everyone feels you are competent enough to handle!", "BOTH_GRAMMATICAL"],
  ["SENTENCE_SVC", "is my advice", "does my advice", "Whenever you feel like you aren’t good enough for the task at hand, here is my advice.", "IMPLAUSIBLE_DISTRACTOR"],
  ["PARALLEL_AND_OR_BUT", "the penalties", "penalized", "we can rehearse forthcoming actions, without the risks or the penalties of doing them in the real world.", "DISTRACTOR_NOT_ALLOWED"],
  // 3차 실행
  ["RELATIVE_COMPOUND", "much", "many", "That is, no matter how much other people believe in your abilities, you seem to have doubts.", "BOTH_GRAMMATICAL"],
  ["ADVERB_VERB_MODIFIER", "continuously", "continuous", "Which do you think you’ll enjoy more: continuously listening to the same song you love or alternating between songs?", "BOTH_GRAMMATICAL"],
  ["RELATIVE_OMISSION", "it would take", "would take it", "However, he believed that one bad race was all it would take for others to doubt his athletic abilities.", "IMPLAUSIBLE_DISTRACTOR"],
  ["OBJECT_COMPLEMENT_BARE_V", "continue functioning", "continue to functioning", "This essential survival mechanism relieves negative feelings and helps us continue functioning effectively.", "IMPLAUSIBLE_DISTRACTOR"],
  ["DUMMY_IT_SUBJECT", "it", "them", "However, it seems you don’t feel up to the task.", "TOO_BASIC_FOR_LEVEL"],
  // 선생님 지적
  ["CORRELATIVE_CONJUNCTION", "as a", "a", "Well, Albert Einstein actually thought of himself, at least in his later years, not as a genius but as a fraud!", "BOTH_GRAMMATICAL"],
  // 4차 실행
  ["PARALLEL_NOUN_PHRASES", "songs you don’t", "you don’t songs", "alternating between listening to songs you like and songs you don’t?", "IMPLAUSIBLE_DISTRACTOR"],
  ["SUBJECT_COMPLEMENT", "a", "to a", "The result can be a misunderstood text with the need for further clarification.", "IMPLAUSIBLE_DISTRACTOR"],
];
for (const [code, correct, wrong, sentence, expected] of LEAKS) {
  assert.equal(position(code, correct, wrong, sentence), expected, `${correct} / ${wrong}`);
}

for (const [code, correct, wrong] of [
  ["OBJECT_COMPLEMENT_NOUN_ADJ", "ill", "illy"],
  ["ADVERB_VERB_MODIFIER", "fast", "fastly"],
  ["ADJECTIVE_NOUN_MODIFIER", "small", "smallly"],
  ["ADJECTIVE_NOUN_MODIFIER", "big", "bigly"],
] as const) {
  assert.equal(rejectFabricatedDistractor({ pointCode: code, correct, wrong, sentence: "" }), "FABRICATED_INFLECTION", `${correct} / ${wrong}`);
}
assert.equal(
  rejectFabricatedDistractor({ pointCode: "OBJECT_COMPLEMENT_NOUN_ADJ", correct: "harder", wrong: "more hardly", sentence: "" }),
  "DISTRACTOR_NOT_ALLOWED"
);
// 실재하는 -ly는 그대로
for (const [correct, wrong] of [["full", "fully"], ["hard", "hardly"], ["high", "highly"], ["most", "mostly"]] as const) {
  assert.equal(rejectFabricatedDistractor({ pointCode: "ADVERB_VERB_MODIFIER", correct, wrong, sentence: "" }), null, `${correct} / ${wrong}`);
}

// 2. 같은 실행에서 나온 멀쩡한 문항은 그대로
const GOOD: Row[] = [
  ["PREPOSITION_COLLOCATION", "to", "with", "Recent research suggests that if we are repeatedly exposed to either option several times, the latter becomes more enjoyable."],
  ["PREPOSITION_COLLOCATION", "to", "at", "People with impostor syndrome sometimes believe that they lack knowledge, skills, and capabilities compared to other people."],
  ["PREPOSITION_COLLOCATION", "in", "on", "Happiness is a state that we must put in constant effort to sustain."],
  ["PREPOSITION_COLLOCATION", "for", "of", "a tool that uses shared rules to bridge differences of culture and geography, allowing for the exchange of information."],
  ["COMPARATIVE", "than", "as", "Recent research shows that, when it comes to happiness, frequency is more important than intensity."],
  ["CONDITIONAL_SECOND", "could", "can", "If the world were a perfect substitute, then anytime you felt hungry you could simply imagine yourself at a banquet."],
  ["VOICE_MODAL_PASSIVE", "can be released", "can release", "the fluid movement in the prelude usually creates a tension that can be released in the subsequent movement."],
  ["VOICE_MODAL_PASSIVE", "might be caused", "might cause", "But there the tension might be caused by the ambiguity of the rhythm."],
  ["INFINITIVE_ADVERB_ROLE", "to reap", "reaping", "We are often told that we have to sacrifice our present to reap the rewards of the future."],
  ["INFINITIVE_ADVERB_ROLE", "to doubt", "doubting", "However, he believed that one bad race was all it would take for others to doubt his athletic abilities."],
  ["GERUND_FIXED_CONSTRUCTION", "hearing", "hear", "I look forward to hearing from you."],
  ["THERE_BE_STRUCTURE", "be", "have", "I’m sure there must be a better candidate!"],
  ["ADJECTIVE_NOUN_MODIFIER", "happy", "happily", "In other words, happiness comes from accumulating small happy moments."],
  ["RELATIVE_OMISSION", "make", "make them", "Then, what are some of the efforts we should make?"],
  ["TENSE_TIME_CONDITION_CLAUSE", "ends", "will end", "Is there nothing but happiness in Cinderella and Snow White’s lives once the story ends?"],
  ["COMPARATIVE_AND_COMPARATIVE", "more", "most", "The world is becoming more and more complex."],
  ["RELATIVE_OMISSION", "everyone", "what everyone", "So get out there and do the work everyone feels you are competent enough to handle!"],
  ["INVERSION_NEGATIVE", "was he", "did he", "Not only was he tired, but he was also hungry."],
  ["ADVERB_SENTENCE_MODIFIER", "likely", "like", "Only they will know, but I would say it’s not likely."],
  ["ADVERB_VERB_MODIFIER", "constantly", "constant", "When we are ‘always on’ we are constantly ingesting content."],
  ["GERUND_SUBJECT", "frequent", "frequently", "You may think such frequent paragraphing will damage the development of your point."],
  ["QUANTIFIER", "much", "many", "No matter how much progress we make, there is more to learn."],
  ["QUANTIFIER", "much", "many", "I don’t know how much is needed."],
  ["RELATIVE_OMISSION", "we should make", "should we make", "Then, what are some of the efforts we should make?"],
  ["GERUND_FIXED_CONSTRUCTION", "to hearing", "to hear", "I look forward to hearing from you."],
  ["PRONOUN_ANTECEDENT", "it", "them", "Some of the ants set forth from the nest to find fresh vegetation; when they find it, they chew off large pieces."],
  ["ADVERB_VERB_MODIFIER", "clearly", "clear", "She spoke clearly during the presentation."],
  ["PARALLEL_CLAUSES", "and I am", "and am I", "My name is Minjun, and I am a sophomore at Jackson High School."],
  ["NOUN_CLAUSE_THAT", "they were impostors", "were they impostors", "Even the greatest minds like Einstein felt they were impostors."],
];
for (const [code, correct, wrong, sentence] of GOOD) {
  assert.equal(position(code, correct, wrong, sentence), null, `${correct} / ${wrong}`);
}

// 3. 라벨
function label(code: string, correct: string, wrong: string, sentence: string) {
  return checkLabelContract({ pointCode: code as GrammarPointCode, correct, wrong, sentence, at: spanStart(sentence, correct) });
}
assert.deepEqual(
  label("OBJECT_COMPLEMENT_NOUN_ADJ", "comfortable", "comfortably", "Music can bring us into a very comfortable rhythm, and it can be satisfying in and of itself."),
  { pointCode: "ADJECTIVE_NOUN_MODIFIER", showLabel: true }
);
assert.deepEqual(
  label("APPOSITION", "our", "ours", "As our will attempts to digest the virtual content its forces are diverted from the physical content."),
  { pointCode: "POSSESSIVE", showLabel: true }
);
assert.equal(label("ADVERB_CLAUSE_TIME", "As", "During", "As the Bard said, “You cannot cloy the hungry edge of appetite.”").showLabel, false);
assert.equal(label("ADVERB_CLAUSE_REASON", "As", "Despite", "As James Oppenheim said, “The foolish man seeks happiness in the distance.”").showLabel, false);
assert.equal(label("TENSE_TIME_CONDITION_CLAUSE", "find", "will find", "Some of the ants set forth from the nest to find fresh vegetation.").showLabel, false);
assert.deepEqual(
  label("PARTICIPLE_OBJECT_COMPLEMENT", "thinking", "thought", "He apparently thought of himself as an impostor who was tricking everyone into thinking that he was a genius."),
  { pointCode: "GERUND_PREPOSITION_OBJECT", showLabel: true }
);
assert.deepEqual(
  label("ADJECTIVE_NOUN_MODIFIER", "such a position", "a such position", "I don’t think I am cut out for such a position."),
  { pointCode: "SO_SUCH", showLabel: true }
);
assert.equal(label("VOICE_MODAL_PASSIVE", "can be", "can", "The result can be a misunderstood text with the need for further clarification.").showLabel, false);
assert.equal(label("ADVERB_SENTENCE_MODIFIER", "likely", "like", "Only they will know, but I would say it’s not likely.").showLabel, false);
assert.equal(label("CORRELATIVE_BOTH_AND", "and", "or", "alternating between listening to songs you like and songs you don’t?").showLabel, false);
assert.equal(label("RELATIVE_ADVERB_WHEN", "as", "which", "the effective manager is flexible enough to capitalize on changing needs as they arise.").showLabel, false);
assert.deepEqual(
  label("PARALLEL_CLAUSES", "where", "which", "This, in turn, creates new and other types of tensions, where the rhythm is unambiguous and predictable."),
  { pointCode: "RELATIVE_NONRESTRICTIVE", showLabel: true }
);
assert.deepEqual(
  label("DUMMY_REFERENTIAL_IT", "this", "these", "Obviously The New Yorker is obsessed by this fear—a reader can go for miles without relief."),
  { pointCode: "ADJECTIVE_NOUN_MODIFIER", showLabel: true }
);
assert.deepEqual(
  label("INFINITIVE_ADVERB_ROLE", "to operate", "operating", "The extent to which we have learned to operate mechanically on that assumption is illustrated."),
  { pointCode: "INFINITIVE_NOUN_ROLE", showLabel: true }
);
assert.deepEqual(
  label("POSSESSIVE", "our", "ours", "As our will attempts to digest the virtual content its forces are diverted."),
  { pointCode: "POSSESSIVE", showLabel: true }
);
assert.equal(label("ADVERB_ADJECTIVE_MODIFIER", "unsurprising", "unsurprisingly", "Einstein felt they were impostors; it’s therefore unsurprising that we sometimes feel the same way.").showLabel, false);
assert.equal(label("NOUN_CLAUSE_WHETHER_IF", "When", "Whether", "When we are ‘always on’ we are constantly ingesting content.").showLabel, false);
assert.deepEqual(
  label("ADJECTIVE_NOUN_MODIFIER", "smaller", "more small", "Instead, smaller worker ants take the pieces of leaves."),
  { pointCode: "COMPARATIVE", showLabel: true }
);
// 맞는 라벨은 그대로
assert.deepEqual(
  label("ADVERB_VERB_MODIFIER", "happily", "happy", "“And they lived happily ever after.”"),
  { pointCode: "ADVERB_VERB_MODIFIER", showLabel: true }
);
assert.deepEqual(
  label("INFINITIVE_ADVERB_ROLE", "to reap", "reaping", "We are often told that we have to sacrifice our present to reap the rewards of the future."),
  { pointCode: "INFINITIVE_ADVERB_ROLE", showLabel: true }
);
assert.deepEqual(
  label("VOICE_ACTIVE_PASSIVE", "cannot cloy", "cannot be cloyed", "As the Bard said, “You cannot cloy the hungry edge of appetite by bare imagination of a feast.”"),
  { pointCode: "VOICE_ACTIVE_PASSIVE", showLabel: true }
);
assert.deepEqual(
  label("OBJECT_COMPLEMENT_NOUN_ADJ", "happy", "happily", "The unexpected gift made her happy all day."),
  { pointCode: "OBJECT_COMPLEMENT_NOUN_ADJ", showLabel: true }
);
assert.deepEqual(
  label("TENSE_TIME_CONDITION_CLAUSE", "am", "will be", "Also, I’m afraid that even if I am lucky enough to win the election, I won’t be able to meet everyone’s expectations."),
  { pointCode: "TENSE_TIME_CONDITION_CLAUSE", showLabel: true }
);
assert.deepEqual(
  label("ADVERB_CLAUSE_TIME", "As", "During", "As these communities grew in size, though, the inadequacies of this system would become evident."),
  { pointCode: "ADVERB_CLAUSE_TIME", showLabel: true }
);
assert.deepEqual(
  label("PARALLEL_CLAUSES", "I’ve been", "being", "I’ve been nominated as a candidate for the president of the student council, and I’ve been nervous ever since."),
  { pointCode: "PARALLEL_CLAUSES", showLabel: true }
);

// 4. 위치는 낱말 경계로 찾는다(in이 feeling 안에서 잡히지 않게)
const lives = "Studies show that more than 70% of people report feeling impostor syndrome at some point in their lives.";
assert.equal(lives.slice(spanStart(lives, "in"), spanStart(lives, "in") + 12), "in their liv");
assert.equal(buildSlotSentence(lives, "in", 0), lives.replace(" in their", " [[SLOT]] their"));

// 5. 주어 자리 주격 대명사는 너무 쉽다(표 순서와 알파벳순이 달라 they / them, we / us가 새던 것)
function local(code: string, correct: string, wrong: string, sentence: string) {
  const candidate = {
    candidateId: "x", sentenceId: "s", pointCode: code, sourceSpan: correct, occurrenceIndex: 0, correctAnswer: correct,
    distractors: [wrong], transformCode: "FORM_SWAP", priority: "CORE", difficulty: "CORE", evidence: "", ruleSummaryKo: "", riskLevel: "MEDIUM",
  } as unknown as GrammarCandidate;
  return rejectCandidate({ candidate, sentence: { sentenceId: "s", text: sentence, passageStart: 0, passageEnd: sentence.length } });
}
for (const [correct, wrong, sentence] of [
  ["they", "them", "People with impostor syndrome sometimes believe that they lack knowledge."],
  ["we", "us", "Most of the time, however, we want something more to happen."],
  ["she", "her", "I think she knows the answer."],
  ["you", "your", "Even if you don’t feel like it, try joining an astronomy camp."],
] as const) {
  assert.equal(local("PRONOUN_SUBJECT_OBJECT_CASE", correct, wrong, sentence), "TOO_BASIC_FOR_LEVEL", `${correct} / ${wrong}`);
}
// 문장 첫머리 지시대명사 that은 절 표지가 아니다
assert.equal(local("NOUN_CLAUSE_THAT", "that", "what", "However, that doesn’t mean you should sacrifice every present moment."), "CODE_SPAN_CONTRACT_MISMATCH");
assert.equal(local("NOUN_CLAUSE_THAT", "that", "what", "Studies show that more than 70% of people report feeling it."), null);
// 목적어 자리는 고등 문항이라 둔다
assert.notEqual(local("PRONOUN_SUBJECT_OBJECT_CASE", "them", "they", "The teacher gave them a lot of homework."), "TOO_BASIC_FOR_LEVEL");

console.log("leak-guards ok");

// 6. who/whom 대신 who/which (선생님: 요즘 who/whom은 잘 안 묻는다)
{
  const base = {
    candidateId: "x", sentenceId: "s", sourceSpan: "who", occurrenceIndex: 0, correctAnswer: "who",
    transformCode: "FORM_SWAP", priority: "CORE", difficulty: "CORE", evidence: "", ruleSummaryKo: "", riskLevel: "MEDIUM",
  };
  const subject = preferWhichOverWhom({ ...base, pointCode: "RELATIVE_WHO_WHOM", distractors: ["whom"] } as unknown as GrammarCandidate);
  assert.deepEqual([subject.pointCode, subject.distractors[0]], ["RELATIVE_SUBJECT", "which"]);
  const kept = preferWhichOverWhom({ ...base, pointCode: "RELATIVE_SUBJECT", distractors: ["what"] } as unknown as GrammarCandidate);
  assert.equal(kept.distractors[0], "what");
  assert.equal(relativeLocalDistractor("RELATIVE_WHO_WHOM", "whom"), "which");
  console.log("who/which ok");
}
