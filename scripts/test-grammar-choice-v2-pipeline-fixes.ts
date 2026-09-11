/**
 * Local fixtures from the last live Grammar Choice V2 run.
 * No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-v2-pipeline-fixes.ts
 */
import assert from "node:assert/strict";
import { buildCoverage } from "../src/lib/lesson-materials/grammar-choice-v2/coverage";
import { rejectFabricatedDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { finalizeV2Passage } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { rejectCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { segmentPassage } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import type { DetectedGrammarPoint, GrammarCandidate, GrammarPointCode } from "../src/lib/lesson-materials/grammar-choice-v2/types";
import type { WorkbookGrammarChoiceDiagnostics } from "../src/lib/lesson-materials/workbook-types";

assert.equal(
  rejectFabricatedDistractor({
    pointCode: "PARALLEL_AND_OR_BUT",
    correct: "negative",
    wrong: "negativing",
    sentence: "one can bring about positive or negative results",
  }),
  "FABRICATED_INFLECTION"
);
assert.equal(
  rejectFabricatedDistractor({
    pointCode: "ADJECTIVE_NOUN_MODIFIER",
    correct: "important",
    wrong: "importanting",
    sentence: "It is important for humans",
  }),
  "FABRICATED_INFLECTION"
);
// 분석 추론을 끈 실측에서 나온 없는 낱말들.
for (const [pointCode, correct, wrong] of [
  ["ADVERB_ADJECTIVE_MODIFIER", "often", "oftenly"],
  ["ADJECTIVE_SUBJECT_COMPLEMENT", "likely", "likelyly"],
  ["MODAL_MEANING", "will", "wills"],
  ["COMPARATIVE", "more predictable", "predictabler"],
  ["COMPARATIVE", "most beautiful", "beautifulest"],
  // 접속부사 + ly (2026-09-11 운영: ④[Howeverly / However], do they live happily)
  ["ADVERB_SENTENCE_MODIFIER", "However", "Howeverly"],
  ["ADVERB_SENTENCE_MODIFIER", "Therefore", "Thereforely"],
] as const) {
  assert.equal(
    rejectFabricatedDistractor({ pointCode, correct, wrong, sentence: "" }),
    "FABRICATED_INFLECTION",
    `${correct} / ${wrong}`
  );
}
// 실제로 있는 형태는 막지 않는다.
for (const [pointCode, correct, wrong] of [
  ["COMPARATIVE", "happy", "happier"],
  ["ADVERB_ADJECTIVE_MODIFIER", "hard", "hardly"],
  ["COMPARATIVE", "pleasant", "pleasanter"],
  ["ADVERB_ADJECTIVE_MODIFIER", "extreme", "extremely"],
] as const) {
  assert.equal(
    rejectFabricatedDistractor({ pointCode, correct, wrong, sentence: "" }),
    null,
    `${correct} / ${wrong}`
  );
}
assert.equal(
  rejectFabricatedDistractor({
    pointCode: "COUNTABLE_UNCOUNTABLE",
    correct: "information",
    wrong: "informations",
    sentence: "information is useful",
  }),
  null
);
assert.equal(
  rejectFabricatedDistractor({
    pointCode: "PARALLEL_AND_OR_BUT",
    correct: "information",
    wrong: "informations",
    sentence: "information is useful",
  }),
  "FABRICATED_INFLECTION"
);
assert.equal(
  rejectFabricatedDistractor({
    pointCode: "PARALLEL_VERBS",
    correct: "visualize",
    wrong: "visualizing",
    sentence: "think about or visualize something",
  }),
  null
);
assert.equal(
  rejectFabricatedDistractor({
    pointCode: "AGREEMENT_SIMPLE",
    correct: "apply",
    wrong: "applies",
    sentence: "the same principle applies to human minds",
  }),
  null
);

const loa = runFixture({
  id: "loa",
  title: "Law of Attraction",
  lines: [
    "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.",
    "Consider what limiting beliefs you have that contradict your desires and upgrade them to beliefs that are in line with what you want to attract.",
  ],
  detected: [
    det("PARALLEL_AND_OR_BUT", "negative"),
    det("PSEUDO_CLEFT_ALL", "is"),
    det("INDIRECT_QUESTION_ORDER", "you have"),
  ],
  candidates: [
    cand("PARALLEL_AND_OR_BUT", "negative", "negativing"),
    cand("AGREEMENT_LONG_SUBJECT", "is", "are"),
    cand("INDIRECT_QUESTION_ORDER", "what limiting beliefs you have", "do you have"),
    cand("PARALLEL_VERBS", "visualize", "visualizing"),
  ],
});
assert.equal(loa.ok, true, loa.reason);
assert.ok((loa.section?.items.length ?? 0) > 0);
assert.equal(loa.section?.diagnostics?.passageRestored, true);
assert.equal(loa.section?.items.length, loa.section?.diagnostics?.renderedQuestionCount);
assert.equal(loa.section?.items.some((item) => /negativ/.test(item.incorrectText)), false);
assert.ok(loa.section?.items.some((item) => item.correctText === "you have" && item.incorrectText === "do you have"));
assert.ok(loa.section?.items.some((item) => item.grammarCategoryId === "PSEUDO_CLEFT_ALL" && item.correctText === "is"));
assert.equal(loa.missingMandatory.length, 0);

const movement = runFixture({
  id: "movement",
  title: "Movement",
  lines: [
    "They are not learning how to socialize and read physical cues from others.",
    "They are not even learning how to run, how to skip, or how to climb.",
    "We were made to move—and through movement, we are meant to live extraordinary lives.",
  ],
  detected: [
    det("INDIRECT_QUESTION_ORDER", "how to socialize"),
    det("INDIRECT_QUESTION_ORDER", "how to run"),
    det("PARALLEL_CLAUSES", "how to run, how to skip, or how to climb"),
    det("VOICE_BE_MADE_TO", "were made to move"),
  ],
  candidates: [
    cand("INDIRECT_QUESTION_ORDER", "how to socialize and read physical cues from others", "how can they socialize and read physical cues from others"),
    cand("INDIRECT_QUESTION_ORDER", "how to run", "how can they run"),
    cand("PARALLEL_CLAUSES", "how to run, how to skip, or how to climb", "how to run, skipping, or how to climb"),
    cand("VOICE_BE_MADE_TO", "were made to move", "were made move"),
  ],
});
assert.equal(movement.ok, true, movement.reason);
assert.ok((movement.section?.items.length ?? 0) > 0);
assert.equal(movement.section?.diagnostics?.passageRestored, true);
assert.equal(movement.missingMandatory.filter((row) => row.includes("INDIRECT_QUESTION_ORDER")).length, 0);
assert.ok(movement.section?.items.some((item) => item.grammarCategoryId === "VOICE_BE_MADE_TO" && item.correctText === "made to move"));
assert.equal(movement.section?.items.some((item) => item.grammarCategoryId === "INDIRECT_QUESTION_ORDER"), false);

const uncertainty = runFixture({
  id: "uncertainty",
  title: "Uncertainty",
  lines: [
    "We cling to our plans and ideas about how things should be and turn out ever so desperately.",
    "Imagine if we all used pencil instead of ink to write in our calendars and planners.",
  ],
  detected: [
    det("INDIRECT_QUESTION_ORDER", "things should be"),
    det("CONDITIONAL_SECOND", "used"),
    det("PARALLEL_CLAUSES", "When we don’t know, when things are uncertain"),
  ],
  candidates: [
    cand("INDIRECT_QUESTION_ORDER", "things should be", "should things be"),
    cand("CONDITIONAL_SECOND", "used", "would use"),
    cand("PARALLEL_CLAUSES", "When we don’t know, when things are uncertain", "When we don’t know, when things being uncertain"),
  ],
});
assert.equal(uncertainty.ok, true, uncertainty.reason);
assert.ok((uncertainty.section?.items.length ?? 0) > 0);
assert.ok(uncertainty.section?.items.some((item) => item.correctText === "things should be" && item.incorrectText === "should things be"));
assert.equal(uncertainty.section?.items.some((item) => item.correctText === "used"), false);
assert.equal(uncertainty.missingMandatory.filter((row) => row.includes("CONDITIONAL_SECOND")).length, 0);
assert.equal(uncertainty.section?.diagnostics?.sectionStatus === "REJECTED", false);

const movingBox = runFixture({
  id: "moving-box",
  title: "Moving Box",
  lines: ["She left instead of moving the box."],
  detected: [det("GERUND_PREPOSITION_OBJECT", "moving"), det("GERUND_PREP_OBJECT_ANALYSIS", "moving")],
  candidates: [cand("GERUND_PREPOSITION_OBJECT", "moving", "move")],
});
assert.equal(movingBox.ok, true, movingBox.reason);
assert.equal(movingBox.section?.diagnostics?.passageRestored, true);
const movingItems = movingBox.section?.items ?? [];
const movingCh07 = movingItems.filter((item) => item.grammarCategoryId === "GERUND_PREPOSITION_OBJECT");
const movingCh09 = movingItems.filter((item) => item.grammarCategoryId === "GERUND_PREP_OBJECT_ANALYSIS");
assert.equal(movingCh07.length, 1);
assert.equal(movingCh07[0]?.correctText, "moving");
assert.equal(movingCh07[0]?.incorrectText, "move");
assert.equal(movingCh09.length, 0);
assert.ok((movingBox.section?.diagnostics?.analysisOnlyCount ?? 0) >= 1);
assert.ok(
  movingBox.stages.occurrences.some(
    (row) =>
      row.code === "GERUND_PREP_OBJECT_ANALYSIS" &&
      (row.status === "ANALYSIS_ONLY" || row.reason === "SECONDARY_OWNER_SUPPRESSED" || row.reason === "ANALYSIS_ONLY")
  )
);
assert.equal(
  rejectCandidate({
    candidate: cand("GERUND_PREPOSITION_OBJECT", "moving", "move"),
    sentence: {
      sentenceId: "moving-box-0",
      text: "She left instead of moving the box.",
      passageStart: 0,
      passageEnd: "She left instead of moving the box.".length,
    },
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand("INFINITIVE_NOUN_ROLE", "to know", "to knowing"),
    sentence: {
      sentenceId: "to-know",
      text: "They wanted to know the answer.",
      passageStart: 0,
      passageEnd: "They wanted to know the answer.".length,
    },
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

const darwin = runFixture({
  id: "darwin",
  title: "Darwin",
  lines: [
    "If we all had the same kind of mind—if there were only one human nature—then when disaster struck, we might become extinct.",
    "our species has many kinds of minds, both within a single culture and across cultures, so we’re less likely to be wiped out.",
  ],
  detected: [
    det("CONDITIONAL_SECOND", "had"),
    det("CONDITIONAL_SECOND", "were"),
    det("RELATIVE_AGREEMENT", "are"),
    det("PARALLEL_CLAUSES", "both within a single culture and across cultures"),
    det("CORRELATIVE_BOTH_AND", "and"),
  ],
  candidates: [
    cand("CONDITIONAL_SECOND", "had", "would have"),
    cand("CONDITIONAL_SECOND", "were", "would be"),
    cand("RELATIVE_AGREEMENT", "are", "is"),
    cand("PARALLEL_CLAUSES", "both within a single culture and across cultures", "both within a single culture or across cultures"),
    cand("CORRELATIVE_BOTH_AND", "both within a single culture and across cultures", "both within a single culture or across cultures", "both-a"),
    cand("CORRELATIVE_BOTH_AND", "and", "or", "both-b"),
  ],
});
assert.equal(darwin.ok, true, darwin.reason);
assert.ok((darwin.section?.items.length ?? 0) > 0);
assert.equal(darwin.section?.items.some((item) => item.correctText === "had" && item.incorrectText === "would have"), false);
assert.equal(darwin.section?.items.some((item) => item.correctText === "were" && item.incorrectText === "would be"), false);
assert.equal(darwin.missingMandatory.filter((row) => row.includes("CONDITIONAL_SECOND")).length, 0);
assert.equal(darwin.missingMandatory.filter((row) => row.includes("RELATIVE_AGREEMENT")).length, 0);
const bothItems = darwin.section?.items.filter((item) => item.grammarCategoryId === "CORRELATIVE_BOTH_AND") ?? [];
assert.equal(bothItems.length, 1);
assert.equal(darwin.section?.diagnostics?.passageRestored, true);
assert.equal(darwin.section?.items.length, darwin.section?.diagnostics?.renderedQuestionCount);

const reports = [loa, movement, uncertainty, darwin];
assert.equal(reports.filter((row) => (row.section?.items.length ?? 0) === 0).length, 0);
assert.equal(reports.filter((row) => row.section?.diagnostics?.passageRestored).length, 4);
for (const row of reports) {
  console.log(row.id, summarize(row));
}

console.log("pipeline-fixes ok");

function summarize(row: ReturnType<typeof runFixture>) {
  const d = row.section?.diagnostics;
  return {
    items: row.section?.items.length ?? 0,
    status: d?.sectionStatus,
    detected: d?.mandatoryDetected,
    analysisOnly: d?.analysisOnlyCount,
    eligible: d?.eligibleQuestionCount,
    excluded: d?.excludedOccurrenceCount,
    rendered: d?.mandatoryRendered,
    missingEligible: d?.missingEligibleCount,
    coverage: d?.mandatoryCoverage,
  };
}

function runFixture(input: {
  id: string;
  title: string;
  lines: string[];
  detected: Array<Omit<DetectedGrammarPoint, "sentenceId">>;
  candidates: GrammarCandidate[];
}) {
  const tagged = input.lines.map((english, index) => ({ id: `${input.id}-${index}`, english }));
  const originalPassage = input.lines.join("\n");
  const sentences = segmentPassage(originalPassage, tagged);
  const boundDetected = input.detected.map((point, index) => ({
    ...point,
    sentenceId: sentences[Math.min(index, sentences.length - 1)]?.sentenceId ?? tagged[0]!.id,
  }));
  const byText = new Map(sentences.map((sentence) => [sentence.text, sentence.sentenceId]));
  const boundCandidates = input.candidates.map((candidate) => {
    const owner = sentences.find((sentence) => sentence.text.includes(candidate.sourceSpan)) ?? sentences[0]!;
    return { ...candidate, sentenceId: byText.get(owner.text) ?? owner.sentenceId };
  });
  const result = finalizeV2Passage({
    projectId: input.id,
    title: input.title,
    source: null,
    originalPassage,
    sentences,
    detected: boundDetected,
    candidates: boundCandidates,
    seedKey: input.id,
    diagnosticsBase: blankDiag(),
  });
  return { id: input.id, ...result };
}

function det(pointCode: GrammarPointCode, sourceSpan: string): Omit<DetectedGrammarPoint, "sentenceId"> {
  return {
    pointCode,
    sourceSpan,
    occurrenceIndex: 0,
    priority: "MANDATORY",
    questionability: "SAFE",
    evidence: "live-fixture",
  };
}

function cand(
  pointCode: GrammarPointCode,
  correct: string,
  wrong: string,
  candidateId = `${pointCode}-${correct}`
): GrammarCandidate {
  return {
    candidateId,
    sentenceId: "pending",
    pointCode,
    sourceSpan: correct,
    occurrenceIndex: 0,
    correctAnswer: correct,
    distractors: [wrong],
    transformCode: "FORM_SWAP",
    priority: "MANDATORY",
    difficulty: "CORE",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
  };
}

function blankDiag(): WorkbookGrammarChoiceDiagnostics {
  return {
    sentenceCount: 1,
    analysisHintCount: 0,
    generatedCandidateCount: 0,
    codeValidatedCount: 0,
    originalMismatchCount: 0,
    rangeErrorCount: 0,
    overlapDuplicateCount: 0,
    reviewSubmittedCount: 0,
    reviewAcceptedCount: 0,
    bothPossibleRejectCount: 0,
    lexicalRejectCount: 0,
    trivialRejectCount: 0,
    finalCount: 0,
    grammarCategoryCount: 0,
    averageQualityScore: 0,
    passageRestored: false,
    cacheHit: false,
    generatorModel: "gpt-5.6-sol",
    reviewerModel: "gpt-5.6-sol",
    generatorResponseModel: "gpt-5.6-sol",
    reviewerResponseModel: "gpt-5.6-sol",
    generatorActualResponseModel: "gpt-5.6-sol",
    reviewerActualResponseModel: "gpt-5.6-sol",
    generatorReasoningEffort: "medium",
    reviewerReasoningEffort: "high",
    reasoningEffort: "medium",
    openAICallCount: 0,
    localFallbackUsed: false,
    generatorVersion: "grammar-choice-v2",
    reviewerVersion: "risk-audit-v1",
    apiCalls: [],
    forceRegenerate: false,
    oldQuestionReuseCount: 0,
    generatorActualModel: "gpt-5.6-sol",
    reviewerActualModel: "gpt-5.6-sol",
    newQuestionCount: 0,
    generateApiCalls: 0,
    reviewApiCalls: 0,
    underTargetReason: null,
    reviewRejectSamples: [],
    codeRejectSamples: [],
  };
}

void buildCoverage;

const numbering = runFixture({
  id: "numbering-core-before-mandatory",
  title: "Numbering mixed priority",
  lines: [
    "Nothing is quicker than a false rumor in this town.",
    "Consider what limiting beliefs you have about money.",
  ],
  detected: [det("COMPARATIVE", "than"), det("INDIRECT_QUESTION_ORDER", "you have")],
  candidates: [
    { ...cand("COMPARATIVE", "than", "as"), priority: "CORE" },
    cand("INDIRECT_QUESTION_ORDER", "you have", "do you have"),
  ],
});
assert.equal(numbering.ok, true, numbering.reason);
assert.equal(numbering.section?.diagnostics?.passageRestored, true);
assert.equal(numbering.section?.items.length, numbering.section?.diagnostics?.renderedQuestionCount);
const numberedItems = numbering.section?.items ?? [];
assert.deepEqual(numberedItems.map((item) => item.number), numberedItems.map((_, i) => i + 1));
assert.equal(numberedItems[0]?.correctText, "than");
assert.equal(numberedItems[1]?.correctText, "you have");
assert.deepEqual(
  (numbering.section?.segments ?? []).filter((seg) => seg.type === "choice").map((seg) => seg.number),
  [1, 2]
);
console.log("pipeline-fixes numbering ok");

