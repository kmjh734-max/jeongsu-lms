/**
 * Grammar Choice V2 local tests. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-v2.ts
 */
import assert from "node:assert/strict";
import { ontologyCounts } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { findOccurrences } from "../src/lib/lesson-materials/grammar-choice-v2/span-resolver";
import { isMechanicalToInfinitiveMarker } from "../src/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { rejectCandidate, subtypeKey } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { validateMinimalPair } from "../src/lib/lesson-materials/grammar-choice-v2/minimal-pair";
import { rankCandidates } from "../src/lib/lesson-materials/grammar-choice-v2/candidate-ranker";
import { scanLocalMandatory } from "../src/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import {
  assignSeededSides,
  restoreCorrectAnswers,
  renderChoices,
} from "../src/lib/lesson-materials/grammar-choice-v2/renderer";
import { buildV2CacheKey, cacheKeyDigest } from "../src/lib/lesson-materials/grammar-choice-v2/cache";
import { finalizeV2Passage } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { measureRuntimePrompt, buildAnalyzerUserPayload } from "../src/lib/lesson-materials/grammar-choice-v2/runtime-prompt";
import { segmentPassage } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import type { GrammarCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/types";
import type { WorkbookGrammarChoiceDiagnostics } from "../src/lib/lesson-materials/workbook-types";

const counts = ontologyCounts();
assert.equal(counts.chapterCount, 14);
assert.ok(counts.pointCount >= 180, `point count ${counts.pointCount}`);

const sentence = "This is the principle that applies here.";
assert.deepEqual(findOccurrences(sentence, "is"), [5]);
assert.equal(findOccurrences(sentence, "principle").length, 1);

const loa = "Perhaps you have heard of the Law of Attraction, which states that like attracts like.";
const sentences = segmentPassage(loa, [{ id: "s1", english: loa }]);
assert.equal(sentences[0]?.passageStart, 0);

function cand(partial: Partial<GrammarCandidate> & Pick<GrammarCandidate, "pointCode" | "sourceSpan" | "correctAnswer" | "distractors">): GrammarCandidate {
  return {
    candidateId: partial.candidateId ?? "c1",
    sentenceId: partial.sentenceId ?? "s1",
    occurrenceIndex: partial.occurrenceIndex ?? 0,
    transformCode: partial.transformCode ?? "FORM_SWAP",
    priority: partial.priority ?? "CORE",
    difficulty: partial.difficulty ?? "CORE",
    evidence: partial.evidence ?? "",
    ruleSummaryKo: partial.ruleSummaryKo ?? "",
    riskLevel: partial.riskLevel ?? "LOW",
    ...partial,
  };
}

const s1 = segmentPassage("Think about the plan to know the facts.", [
  { id: "s1", english: "Think about the plan to know the facts." },
])[0]!;

assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "INFINITIVE_NOUN_ROLE",
      sourceSpan: "know",
      correctAnswer: "know",
      distractors: ["knowing"],
    }),
    sentence: s1,
  }),
  "MECHANICAL_GOVERNOR_FORM"
);

assert.equal(isMechanicalToInfinitiveMarker("to know", "to knowing"), true);
assert.equal(isMechanicalToInfinitiveMarker("to face", "to facing"), true);
assert.equal(isMechanicalToInfinitiveMarker("to be", "to being"), true);
assert.equal(isMechanicalToInfinitiveMarker("meeting", "to meet"), false);
assert.equal(isMechanicalToInfinitiveMarker("working", "to work"), false);
assert.equal(isMechanicalToInfinitiveMarker("paying", "to pay"), false);
assert.equal(isMechanicalToInfinitiveMarker("to smoke", "smoking"), false);

assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "GERUND_PREPOSITION_OBJECT",
      sourceSpan: "moving",
      correctAnswer: "moving",
      distractors: ["move"],
    }),
    sentence: sentenceOf("She left instead of moving the box."),
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "INFINITIVE_NOUN_ROLE",
      sourceSpan: "to know",
      correctAnswer: "to know",
      distractors: ["to knowing"],
    }),
    sentence: sentenceOf("They wanted to know the answer."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "INFINITIVE_ADVERB_ROLE",
      sourceSpan: "to face",
      correctAnswer: "to face",
      distractors: ["to facing"],
    }),
    sentence: sentenceOf("They had to face the problem."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "INFINITIVE_DUMMY_IT",
      sourceSpan: "to be",
      correctAnswer: "to be",
      distractors: ["to being"],
    }),
    sentence: sentenceOf("It is hard to be honest."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);


const wanted = segmentPassage("They wanted to know the answer.", [
  { id: "wanted", english: "They wanted to know the answer." },
])[0]!;
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "NOUN_CLAUSE_THAT",
      sourceSpan: "to know",
      correctAnswer: "to know",
      distractors: ["to knowing"],
      sentenceId: "wanted",
    }),
    sentence: wanted,
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);

assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "MODAL_MEANING",
      sourceSpan: "try",
      correctAnswer: "try",
      distractors: ["tries"],
      sentenceId: "s1",
    }),
    sentence: segmentPassage("They could try again.", [
      { id: "s1", english: "They could try again." },
    ])[0]!,
  }),
  "MECHANICAL_MODAL_FORM"
);

assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "PARALLEL_VERBS",
      sourceSpan: "Think",
      correctAnswer: "Think",
      distractors: ["Thinks"],
    }),
    sentence: s1,
  }),
  "TRIVIAL_IMPERATIVE_INFLECTION"
);

const short = segmentPassage("The variation is useful.", [
  { id: "s1", english: "The variation is useful." },
])[0]!;
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "AGREEMENT_LONG_SUBJECT",
      sourceSpan: "is",
      correctAnswer: "is",
      distractors: ["are"],
    }),
    sentence: short,
  }),
  "TOO_TRIVIAL_SHORT_AGREEMENT"
);

assert.equal(
  subtypeKey("SINGULAR_PLURAL_NOUN", "many kind", "many kinds"),
  subtypeKey("SINGULAR_PLURAL_NOUN", "many kinds", "many kind")
);

function sentenceOf(text: string, id = "s1") {
  return segmentPassage(text, [{ id, english: text }])[0]!;
}

function expectReject(sentence: string, correct: string, wrong: string, code: string, pointCode = "PARALLEL_VERBS") {
  assert.equal(
    rejectCandidate({
      candidate: cand({
        pointCode: pointCode as GrammarCandidate["pointCode"],
        sourceSpan: correct,
        correctAnswer: correct,
        distractors: [wrong],
      }),
      sentence: sentenceOf(sentence),
    }),
    code,
    `${correct} / ${wrong}`
  );
}

expectReject("They tried to present the data clearly.", "present", "presenting", "MECHANICAL_GOVERNOR_FORM");
expectReject("The chart was designed to mislead readers.", "mislead", "misleading", "MECHANICAL_GOVERNOR_FORM");
expectReject("The speech was meant to stirring the crowd.", "stirring", "to stir", "MECHANICAL_GOVERNOR_FORM");
expectReject("The first step is to identifying the cause.", "identifying", "to identify", "MECHANICAL_GOVERNOR_FORM");
expectReject("Graphs have shown the same pattern.", "have", "has", "TOO_TRIVIAL_SHORT_AGREEMENT", "AGREEMENT_SIMPLE");
expectReject("The information is available online.", "is", "are", "TOO_TRIVIAL_SHORT_AGREEMENT", "AGREEMENT_SIMPLE");
expectReject("The sections are clearly labeled.", "are", "is", "TOO_TRIVIAL_SHORT_AGREEMENT", "AGREEMENT_SIMPLE");
expectReject("Humans need many kinds of minds.", "kinds", "kind", "TOO_TRIVIAL_SHORT_AGREEMENT", "SINGULAR_PLURAL_NOUN");
expectReject("It became clear later.", "It", "This", "BOTH_GRAMMATICAL", "PRONOUN_REFERENCE");
expectReject("The result was important for everyone.", "important", "significant", "MEANING_ONLY_CONTRAST", "LEXICAL_CHOICE");

assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "POSSESSIVE",
      sourceSpan: "its",
      correctAnswer: "its",
      distractors: ["it's"],
    }),
    sentence: sentenceOf("The species changed its behavior."),
  }),
  // 2026-09-11 선생님 검토: its/it's는 고등 수준에 너무 쉬워 출제하지 않는다.
  "TOO_BASIC_FOR_LEVEL"
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "RELATIVE_WHAT",
      sourceSpan: "which",
      correctAnswer: "which",
      distractors: ["what"],
    }),
    sentence: sentenceOf("I know which book you mean."),
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "ADVERB_VERB_MODIFIER",
      sourceSpan: "quickly",
      correctAnswer: "quickly",
      distractors: ["quick"],
    }),
    sentence: sentenceOf("She answered the question quickly."),
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "VOICE_PROGRESSIVE_PASSIVE",
      sourceSpan: "are being held",
      correctAnswer: "are being held",
      distractors: ["are holding"],
    }),
    sentence: sentenceOf("Many kids today are being held captive by devices."),
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "PARALLEL_VERBS",
      sourceSpan: "socialize and read",
      correctAnswer: "socialize and read",
      distractors: ["socializing and read"],
    }),
    sentence: sentenceOf("They are not learning how to socialize and read physical cues."),
  }),
  null
);
const longAgree = "One of Charles Darwin's greatest insights was that variation is a prerequisite.";
assert.equal(
  rejectCandidate({
    candidate: cand({
      pointCode: "AGREEMENT_DISTANCE",
      sourceSpan: "was",
      correctAnswer: "was",
      distractors: ["were"],
    }),
    sentence: sentenceOf(longAgree),
  }),
  null
);

const darwin =
  "If we all had the same kind of mind —if there were only one human nature— then when disaster struck, we might become extinct.";
const dSentences = segmentPassage(darwin, [{ id: "d1", english: darwin }]);
const hints = scanLocalMandatory(dSentences);
assert.ok(hints.some((h) => h.pointCode === "CONDITIONAL_SECOND"));

const missing = finalizeV2Passage({
  projectId: "darwin",
  title: "Darwin",
  source: null,
  originalPassage: darwin,
  sentences: dSentences,
  detected: [],
  candidates: [],
  seedKey: "darwin-seed",
  diagnosticsBase: blankDiag(),
});
assert.equal(missing.ok, true);
assert.equal(missing.missingMandatory.length, 0);
assert.equal(missing.section?.diagnostics?.sectionStatus, "COMPLETE");

const kept = finalizeV2Passage({
  projectId: "darwin",
  title: "Darwin",
  source: null,
  originalPassage: darwin,
  sentences: dSentences,
  detected: [
    {
      sentenceId: "d1",
      pointCode: "CONDITIONAL_SECOND",
      sourceSpan: "had",
      occurrenceIndex: 0,
      priority: "MANDATORY",
      questionability: "SAFE",
      evidence: "if + past",
    },
  ],
  candidates: [
    cand({
      candidateId: "had",
      sentenceId: "d1",
      pointCode: "CONDITIONAL_SECOND",
      sourceSpan: "had",
      correctAnswer: "had",
      distractors: ["would have"],
      transformCode: "CONDITIONAL_FORM",
      priority: "MANDATORY",
      riskLevel: "LOW",
    }),
  ],
  seedKey: "darwin-seed",
  diagnosticsBase: blankDiag(),
});
assert.equal(kept.ok, true, kept.reason);
assert.equal(kept.section?.items.some((item) => item.correctText === "had"), false);
assert.equal(kept.missingMandatory.filter((row) => row.includes("CONDITIONAL_SECOND")).length, 0);
assert.equal(kept.section?.diagnostics?.passageRestored, true);

const hadAt = darwin.indexOf("had");
const rendered = renderChoices({
  originalPassage: darwin,
  items: [
    {
      candidateId: "had",
      sentenceId: "d1",
      pointCode: "CONDITIONAL_SECOND",
      sourceSpan: "had",
      occurrenceIndex: 0,
      correctAnswer: "had",
      distractors: ["would have"],
      transformCode: "CONDITIONAL_FORM",
      priority: "MANDATORY",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: hadAt,
      passageEnd: hadAt + 3,
      subtypeKey: "x",
      leftText: "had",
      rightText: "would have",
      number: 1,
    },
  ],
});
const restored = restoreCorrectAnswers(rendered.rendered, [
  { number: 1, correctText: "had" },
]);
assert.equal(restored, darwin);

const a = assignSeededSides(
  [
    {
      candidateId: "a",
      sentenceId: "d1",
      pointCode: "CONDITIONAL_SECOND",
      sourceSpan: "had",
      occurrenceIndex: 0,
      correctAnswer: "had",
      distractors: ["would have"],
      transformCode: "CONDITIONAL_FORM",
      priority: "MANDATORY",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: 0,
      passageEnd: 3,
      subtypeKey: "x",
    },
  ],
  "same-seed"
);
const b = assignSeededSides(
  [
    {
      candidateId: "a",
      sentenceId: "d1",
      pointCode: "CONDITIONAL_SECOND",
      sourceSpan: "had",
      occurrenceIndex: 0,
      correctAnswer: "had",
      distractors: ["would have"],
      transformCode: "CONDITIONAL_FORM",
      priority: "MANDATORY",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: 0,
      passageEnd: 3,
      subtypeKey: "x",
    },
  ],
  "same-seed"
);
assert.deepEqual(a, b);

const ranked = rankCandidates([
  {
    candidateId: "basic",
    sentenceId: "s1",
    pointCode: "ARTICLE",
    sourceSpan: "a",
    occurrenceIndex: 0,
    correctAnswer: "a",
    distractors: ["the"],
    transformCode: "FORM_SWAP",
    priority: "BASIC",
    difficulty: "BASIC",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
    passageStart: 0,
    passageEnd: 1,
    subtypeKey: "ARTICLE:a|the",
  },
  {
    candidateId: "core",
    sentenceId: "s1",
    pointCode: "RELATIVE_NONRESTRICTIVE",
    sourceSpan: "which",
    occurrenceIndex: 0,
    correctAnswer: "which",
    distractors: ["that"],
    transformCode: "RELATIVE_CHOICE",
    priority: "MANDATORY",
    difficulty: "CORE",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
    passageStart: 10,
    passageEnd: 15,
    subtypeKey: "REL:which|that",
  },
]);
assert.equal(ranked.kept[0]?.candidateId, "core");

assert.equal(
  validateMinimalPair({
    pointCode: "VOICE_BE_MADE_TO",
    sourceSpan: "are wonderfully made",
    distractor: "wonderfully make",
    sentence: "We are wonderfully made, yet we don’t allow ourselves to participate.",
  }),
  "MULTI_AXIS_EDIT"
);

const denseSentence = sentenceOf("They should think plan and write carefully.", "dense");
const dense = rankCandidates(
  [
    {
      candidateId: "d1",
      sentenceId: "dense",
      pointCode: "PARALLEL_VERBS",
      sourceSpan: "Think",
      occurrenceIndex: 0,
      correctAnswer: "Think",
      distractors: ["Thinking"],
      transformCode: "PARALLEL_FORM",
      priority: "CORE",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: denseSentence.passageStart,
      passageEnd: denseSentence.passageStart + 5,
      subtypeKey: "p1",
    },
    {
      candidateId: "d2",
      sentenceId: "dense",
      pointCode: "PARALLEL_VERBS",
      sourceSpan: "plan",
      occurrenceIndex: 0,
      correctAnswer: "plan",
      distractors: ["planning"],
      transformCode: "PARALLEL_FORM",
      priority: "CORE",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: denseSentence.passageStart + 7,
      passageEnd: denseSentence.passageStart + 11,
      subtypeKey: "p2",
    },
    {
      candidateId: "d3",
      sentenceId: "dense",
      pointCode: "ARTICLE",
      sourceSpan: "the",
      occurrenceIndex: 0,
      correctAnswer: "the",
      distractors: ["a"],
      transformCode: "FORM_SWAP",
      priority: "BASIC",
      difficulty: "BASIC",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: denseSentence.passageStart + 16,
      passageEnd: denseSentence.passageStart + 19,
      subtypeKey: "p3",
    },
  ],
  4,
  [denseSentence]
);
assert.equal(dense.kept.length, 2);
assert.ok(dense.dropped.some((row) => row.reason === "OVERDENSE_CLAUSE"));

const coupled = sentenceOf("the members who are well suited for the new environment.", "rel");
const whoAt = coupled.text.indexOf("who");
const areAt = coupled.text.indexOf("are");
const linked = rankCandidates(
  [
    {
      candidateId: "who",
      sentenceId: "rel",
      pointCode: "RELATIVE_SUBJECT",
      sourceSpan: "who",
      occurrenceIndex: 0,
      correctAnswer: "who",
      distractors: ["whom"],
      transformCode: "RELATIVE_CHOICE",
      priority: "CORE",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: coupled.passageStart + whoAt,
      passageEnd: coupled.passageStart + whoAt + 3,
      subtypeKey: "who",
    },
    {
      candidateId: "are",
      sentenceId: "rel",
      pointCode: "RELATIVE_AGREEMENT",
      sourceSpan: "are",
      occurrenceIndex: 0,
      correctAnswer: "are",
      distractors: ["is"],
      transformCode: "NUMBER_SWAP",
      priority: "MANDATORY",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "LOW",
      passageStart: coupled.passageStart + areAt,
      passageEnd: coupled.passageStart + areAt + 3,
      subtypeKey: "are",
    },
  ],
  4,
  [coupled]
);
assert.deepEqual(
  linked.kept.map((item) => item.candidateId),
  ["are"]
);
assert.ok(linked.dropped.some((row) => row.reason === "INTERDEPENDENT_CHOICES"));

const key = buildV2CacheKey({
  passageHash: "abc",
  analyzerModel: "gpt-5.6-sol",
  analyzerReasoningEffort: "medium",
  auditorReasoningEffort: "medium",
});
assert.equal(cacheKeyDigest(key), cacheKeyDigest({ ...key }));
assert.equal(key.engineVersion, "grammar-choice-v2");

const prompt = measureRuntimePrompt(
  buildAnalyzerUserPayload({
    passageId: "p",
    sentences: [{ sentenceId: "s1", text: loa }],
  })
);
assert.ok(prompt > 500);
console.log(
  JSON.stringify({
    ontology: counts,
    promptCharsSample: prompt,
  })
);
console.log("grammar-choice-v2 local tests: PASS");

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
    reviewerReasoningEffort: "medium",
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
