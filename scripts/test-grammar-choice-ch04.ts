/**
 * Chapter 04 modals. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch04.ts
 */
import assert from "node:assert/strict";
import { buildCoverage } from "../src/lib/lesson-materials/grammar-choice-v2/coverage";
import { detectConditionalCh05, conditionalLocalDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { localTemplateDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  MODAL_CH04_RULES,
  detectModalCh04,
  modalLocalDistractor,
  rejectModalChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { detectSpecialCh14 } from "../src/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { detectVoiceCh03 } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";

function questions(text: string, code?: string, subtype?: string) {
  return detectModalCh04(text).filter(
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
  return detectModalCh04(text).some(
    (hit) => hit.code === code && (!subtype || hit.subtype === subtype)
  );
}

assert.ok(MODAL_CH04_RULES.every((rule) => rule.referenceChapter === "CH04"));
assert.ok(MODAL_CH04_RULES.every((rule) => rule.meaningCondition && rule.timeReference && rule.requiredForm));
assert.equal(ontologyPoint("MODAL_HAVE_PP")?.chapter, "C05");
assert.equal(ontologyPoint("MODAL_HAVE_PP")?.referenceChapter, "CH04");
assert.equal(ontologyPoint("SUBSTITUTE_DO")?.referenceChapter, "CH04");
assert.equal(ontologyPoint("USED_TO")?.referenceChapter, "CH04");
assert.equal(ontologyPoint("VOICE_MODAL_PASSIVE")?.referenceChapter, "CH03");
assert.equal(ontologyPoint("CONDITIONAL_SECOND")?.referenceChapter, "CH05");
assert.equal(ontologyPoint("EMPHATIC_DO")?.referenceChapter, "CH14");

assert.deepEqual(spans("He must have forgotten the appointment.", "MODAL_PAST_INFERENCE"), ["have forgotten"]);
assert.deepEqual(spans("She must have left last night.", "MODAL_PAST_INFERENCE"), ["have left"]);
assert.equal(modalLocalDistractor("MODAL_PAST_INFERENCE", "have forgotten"), "forget");
assert.equal(none("He must leave now.", "MODAL_PAST_INFERENCE"), true);
assert.equal(none("He must have a ticket.", "MODAL_PAST_INFERENCE"), true);

assert.deepEqual(spans("You should have told me yesterday.", "MODAL_REGRET_CRITICISM"), ["have told"]);
assert.deepEqual(spans("They ought to have finished the work last week.", "MODAL_REGRET_CRITICISM"), ["have finished"]);
assert.equal(modalLocalDistractor("MODAL_REGRET_CRITICISM", "have told"), "tell");
assert.equal(none("You should tell me now.", "MODAL_REGRET_CRITICISM"), true);
assert.equal(none("You should have told me.", "MODAL_REGRET_CRITICISM"), true);

assert.deepEqual(spans("She cannot have seen him last night.", "MODAL_HAVE_PP"), ["have seen"]);
assert.deepEqual(spans("He need not have waited yesterday.", "MODAL_HAVE_PP"), ["have waited"]);
assert.equal(modalLocalDistractor("MODAL_HAVE_PP", "have seen"), "see");
assert.equal(none("She cannot see him now.", "MODAL_HAVE_PP"), true);
assert.equal(none("She might have seen him.", "MODAL_HAVE_PP"), true);

assert.deepEqual(spans("The doctor recommended that he rest now.", "MANDATIVE_SHOULD"), ["rest"]);
assert.deepEqual(spans("It is essential that every student be informed.", "MANDATIVE_SHOULD"), ["be"]);
assert.equal(modalLocalDistractor("MANDATIVE_SHOULD", "rest"), "rested");
assert.equal(modalLocalDistractor("MANDATIVE_SHOULD", "be"), "is");
assert.ok(has("His silence suggested that he was tired.", "MANDATIVE_SHOULD", "SUGGEST_IMPLY"));
assert.ok(has("The results suggest that the plan works.", "MANDATIVE_SHOULD", "SUGGEST_IMPLY"));
assert.equal(none("His silence suggested that he was tired.", "MANDATIVE_SHOULD"), true);
assert.equal(none("The results suggest that the plan works.", "MANDATIVE_SHOULD"), true);
assert.ok(has("She insisted that he was honest.", "MANDATIVE_SHOULD", "INSIST_FACT"));
assert.equal(none("She insisted that he was honest.", "MANDATIVE_SHOULD"), true);
assert.equal(none("The doctor recommended that he should rest.", "MANDATIVE_SHOULD"), true);

assert.deepEqual(spans("She speaks English better than I do.", "SUBSTITUTE_DO"), ["do"]);
assert.deepEqual(spans("He promised to help, and he did.", "SUBSTITUTE_DO"), ["did"]);
assert.equal(modalLocalDistractor("SUBSTITUTE_DO", "do"), "am");
assert.equal(modalLocalDistractor("SUBSTITUTE_DO", "did"), "was");
assert.equal(none("She does the dishes every night.", "SUBSTITUTE_DO"), true);
assert.equal(none("What he did do was apologize.", "SUBSTITUTE_DO"), true);
assert.ok(detectSpecialCh14("What he did do was apologize.").some((hit) => hit.questionable && hit.code === "EMPHATIC_DO"));

assert.ok(has("People used to live near the river.", "USED_TO", "USED_TO_V"));
assert.ok(has("She is used to living alone.", "USED_TO", "BE_USED_TO"));
assert.ok(has("They got used to the noise.", "USED_TO", "GET_USED_TO"));
assert.equal(none("People used to live near the river.", "USED_TO"), true);
assert.equal(none("She is used to living alone.", "USED_TO"), true);
assert.equal(none("They are getting used to the schedule.", "USED_TO"), true);
assert.equal(modalLocalDistractor("USED_TO", "live"), null);
assert.equal(
  rejectModalChoice({
    pointCode: "USED_TO",
    correct: "live",
    wrong: "living",
    sentence: "People used to live near the river.",
  }),
  "MECHANICAL_MODAL_FORM"
);

assert.ok(has("You had better go now.", "HAD_BETTER"));
assert.equal(none("You had better go now.", "HAD_BETTER"), true);
assert.equal(
  rejectModalChoice({
    pointCode: "HAD_BETTER",
    correct: "go",
    wrong: "goes",
    sentence: "You had better go now.",
  }),
  "MECHANICAL_MODAL_FORM"
);
assert.ok(has("I would rather stay home.", "WOULD_RATHER"));
assert.equal(none("I would rather stay home.", "WOULD_RATHER"), true);
assert.equal(
  rejectModalChoice({
    pointCode: "WOULD_RATHER",
    correct: "stay",
    wrong: "stayed",
    sentence: "I would rather stay home.",
  }),
  "MECHANICAL_MODAL_FORM"
);
assert.equal(
  detectConditionalCh05("I would rather stay home.").filter((hit) => !hit.exclusionReason && (hit.code === "WOULD_RATHER" || hit.code === "WOULD_RATHER_SUBJUNCTIVE")).length,
  0
);
const presentWish = detectConditionalCh05("I would rather you stayed home.").filter((hit) => !hit.exclusionReason);
assert.deepEqual(presentWish.map((hit) => [hit.code, hit.subtype, hit.sourceSpan.toLowerCase()]), [
  ["WOULD_RATHER_SUBJUNCTIVE", "PRESENT_FUTURE_PREFERENCE", "stayed"],
]);
assert.equal(conditionalLocalDistractor("WOULD_RATHER_SUBJUNCTIVE", "stayed"), "will stay");
assert.equal("I would rather you stayed home.".replace("stayed", "will stay").replace("will stay", "stayed"), "I would rather you stayed home.");
assert.deepEqual(
  detectConditionalCh05("I would rather you had told me yesterday.")
    .filter((hit) => !hit.exclusionReason)
    .map((hit) => [hit.code, hit.subtype, hit.sourceSpan.toLowerCase()]),
  [["WOULD_RATHER_SUBJUNCTIVE", "PAST_REGRET", "had told"]]
);
assert.equal(
  "I would rather you had told me yesterday.".replace("had told", "told").replace("told", "had told"),
  "I would rather you had told me yesterday."
);
assert.equal(
  detectConditionalCh05("I would rather you stayed home yesterday.").find((hit) => hit.code === "WOULD_RATHER_SUBJUNCTIVE")
    ?.exclusionReason,
  "AMBIGUOUS_TENSE"
);
const bareRule = MODAL_CH04_RULES.find((rule) => rule.code === "WOULD_RATHER");
assert.equal(bareRule?.analysisOnly, true);
assert.equal(bareRule?.ownerChapter, "CH04");
assert.equal(bareRule?.referenceChapter, "CH04");
assert.equal(ontologyPoint("WOULD_RATHER")?.referenceChapter, "CH04");
assert.equal(ontologyPoint("WOULD_RATHER_SUBJUNCTIVE")?.referenceChapter, "CH05");
const ratherAnalysis = detectModalCh04("I would rather stay home.").find((hit) => hit.code === "WOULD_RATHER");
const coverage = buildCoverage({
  sentenceIds: ["s1"],
  detected: ratherAnalysis
    ? [{
        sentenceId: "s1",
        pointCode: "WOULD_RATHER",
        sourceSpan: ratherAnalysis.sourceSpan,
        occurrenceIndex: ratherAnalysis.occurrenceIndex,
        priority: "CORE",
        questionability: "NOT_SUITABLE",
        evidence: "CH04 analysisOnly",
      }]
    : [],
  localMandatory: [],
  approved: [],
  droppedReasons: [],
});
assert.deepEqual(coverage.reports[0]?.detectedPointCodes, ["WOULD_RATHER"]);
assert.deepEqual(coverage.reports[0]?.generatedQuestionPointCodes, []);
assert.ok(has("Every winter he would visit the museum.", "WOULD_PAST_HABIT"));
assert.equal(none("Every winter he would visit the museum.", "WOULD_PAST_HABIT"), true);

assert.equal(none("One can bring about positive or negative results.", "MODAL_MEANING"), true);
assert.ok(has("One can bring about positive or negative results.", "MODAL_MEANING"));
assert.equal(none("The next step may be more challenging.", "MODAL_MEANING"), true);
assert.equal(none("The forest might be completely wiped out.", "MODAL_MEANING"), true);
assert.equal(none("The species might become extinct.", "MODAL_MEANING"), true);
assert.equal(none("We could bear in mind the cost.", "MODAL_MEANING"), true);
assert.equal(none("What we think is going to happen might not be true.", "MODAL_MEANING"), true);
assert.equal(none("All we have to do is wait.", "MODAL_MEANING"), true);
assert.equal(
  rejectModalChoice({
    pointCode: "MODAL_MEANING",
    correct: "try",
    wrong: "tries",
    sentence: "She could try the door again.",
  }),
  "MECHANICAL_MODAL_FORM"
);

const voice = "This can be done by diversifying the sources.";
assert.equal(none(voice), true);
assert.ok(detectVoiceCh03(voice).some((hit) => hit.questionable && hit.sourceSpan.toLowerCase() === "can be done"));

const darwin = "If we all had the same kind of mind, we might become extinct.";
assert.equal(none(darwin), true);
assert.ok(detectConditionalCh05(darwin).some((hit) => hit.code === "CONDITIONAL_SECOND"));

assert.equal(localTemplateDistractor("MODAL_REGRET_CRITICISM", "have told"), "tell");
assert.equal(localTemplateDistractor("MANDATIVE_SHOULD", "rest"), "rested");
assert.equal(localTemplateDistractor("SUBSTITUTE_DO", "do"), "am");

console.log("grammar-choice ch04 modals: PASS");
