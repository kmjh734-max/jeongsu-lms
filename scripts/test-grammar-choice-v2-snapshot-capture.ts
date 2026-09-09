/**
 * Mock capture checkpoint check. Does not call OpenAI and is not live-proof.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAnalyzerRawJson } from "../src/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { finalizeV2Passage, hashPassage } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { replaySnapshot } from "../src/lib/lesson-materials/grammar-choice-v2/replay";
import { segmentPassage } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import {
  captureMetadata,
  studentReplayDigest,
  writeCheckpoint,
} from "../src/lib/lesson-materials/grammar-choice-v2/snapshot-store";
import { GRAMMAR_CHOICE_V2_ENGINE } from "../src/lib/lesson-materials/grammar-choice-v2/types";
import type { WorkbookGrammarChoiceDiagnostics } from "../src/lib/lesson-materials/workbook-types";

const dir = mkdtempSync(join(tmpdir(), "gc-v2-snapshot-"));
const sourceId = "mock-source";
const text = "The common flaw is that we think about or visualize something to manifest it.";
const sentenceId = "s1";
const rawAnalyzer = JSON.stringify({
  sentences: [
    {
      sentenceId,
      detectedPoints: [
        {
          pointCode: "PARALLEL_VERBS",
          sourceSpan: "visualize",
          occurrenceIndex: 0,
          priority: "CORE",
          questionability: "SAFE",
          evidence: "parallel verb",
        },
      ],
      candidates: [
        {
          pointCode: "PARALLEL_VERBS",
          sourceSpan: "visualize",
          occurrenceIndex: 0,
          correctAnswer: "visualize",
          distractors: ["visualizing"],
          transformCode: "PARALLEL_FORM",
          priority: "CORE",
          difficulty: "CORE",
          evidence: "parallel verb",
          ruleSummaryKo: "동사 병렬",
          riskLevel: "LOW",
        },
      ],
    },
  ],
});
const rawReviewer = JSON.stringify({ results: [] });

writeCheckpoint(dir, "run.json", {
  ...captureMetadata({
    generatorModel: "gpt-5.6-sol",
    generatorReasoningEffort: "medium",
    reviewerModel: "gpt-5.6-sol",
    reviewerReasoningEffort: "high",
    forceRegenerate: true,
    cacheHit: false,
    fallback: false,
  }),
  status: "STARTED",
});
writeCheckpoint(dir, `passages/${sourceId}/source.json`, {
  title: "mock",
  source: null,
  passage: text,
  sha256: "mock",
  sentences: [{ sentenceId, order: 0, text }],
});
writeCheckpoint(dir, `passages/${sourceId}/analyzer.json`, { rawJson: rawAnalyzer });
writeCheckpoint(dir, `passages/${sourceId}/reviewer.json`, { rawJson: rawReviewer });

const sentences = segmentPassage(text, [{ id: sentenceId, english: text }]);
const parsed = parseAnalyzerRawJson(rawAnalyzer, sourceId);
const finalized = finalizeV2Passage({
  projectId: sourceId,
  title: "mock",
  source: null,
  originalPassage: text,
  sentences,
  detected: parsed.detected,
  candidates: parsed.candidates,
  audits: [],
  seedKey: `${sourceId}|${hashPassage(text)}|v2`,
  diagnosticsBase: emptyDiagnostics(),
});
assert.equal(finalized.ok, true, finalized.reason);
writeCheckpoint(dir, `passages/${sourceId}/pipeline.json`, {
  ok: finalized.ok,
  digest: studentReplayDigest(finalized.section!, {
    exclusions: finalized.rejected,
    occurrences: finalized.stages.occurrences,
  }),
});

const analyzer = JSON.parse(readFileSync(join(dir, "passages", sourceId, "analyzer.json"), "utf8"));
assert.equal(typeof analyzer.rawJson, "string");
assert.ok(analyzer.rawJson.includes("visualize"));

const replay = replaySnapshot(dir);
assert.equal(replay.networkCalls, 0);
assert.equal(replay.passages.length, 1);
assert.equal(replay.passages[0]?.digestMatch, true, JSON.stringify(replay.passages[0]?.assertionErrors));
assert.deepEqual(replay.passages[0]?.assertionErrors, []);

rmSync(dir, { recursive: true, force: true });
console.log("snapshot-capture mock ok");

function emptyDiagnostics(): WorkbookGrammarChoiceDiagnostics {
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
    generatorVersion: GRAMMAR_CHOICE_V2_ENGINE,
    reviewerVersion: "risk-audit-v1",
    apiCalls: [],
    forceRegenerate: true,
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
