/**
 * Grammar Choice V2 local tests. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-v2.ts
 */
import assert from "node:assert/strict";
import { ontologyCounts } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { findOccurrences } from "../src/lib/lesson-materials/grammar-choice-v2/span-resolver";
import { rejectCandidate, subtypeKey } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
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
assert.equal(missing.ok, false);
assert.ok(missing.missingMandatory.some((m) => m.includes("CONDITIONAL_SECOND")));

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
assert.equal(kept.section?.items.length, 1);
assert.equal(kept.section?.items.length, kept.section?.diagnostics?.renderedQuestionCount);
assert.equal(kept.section?.diagnostics?.passageRestored, true);

const rendered = renderChoices({
  originalPassage: darwin,
  items: [
    {
      ...kept.section!.items[0]!,
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
      passageStart: kept.section!.items[0]!.startCharIndex,
      passageEnd: kept.section!.items[0]!.endCharIndex,
      subtypeKey: "x",
      leftText: kept.section!.items[0]!.leftText,
      rightText: kept.section!.items[0]!.rightText,
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
