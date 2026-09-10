/**
 * Production cache replay for the 2026-09-09 taste-social passage.
 * No OpenAI. Does not overwrite live-2026-09-09 snapshots.
 * Run: npx tsx scripts/test-grammar-choice-v2-prod-taste-social.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAnalyzerRawJson } from "../src/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { parseAuditorRawJson } from "../src/lib/lesson-materials/grammar-choice-v2/ambiguity-auditor";
import { finalizeV2Passage, hashPassage } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { replaySnapshot } from "../src/lib/lesson-materials/grammar-choice-v2/replay";
import { segmentPassage } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import type { WorkbookGrammarChoiceDiagnostics } from "../src/lib/lesson-materials/workbook-types";

const SNAPSHOT = join("scripts", "snapshots", "grammar-choice-v2", "prod-2026-09-09-taste-social");
const SOURCE_ID = "b66d5c3a-12da-4683-81d0-efaac143fa29";
const ORIGINAL = ["who / whom", "like / likes", "what they are / what are they", "involving / involved"] as const;

const stored = JSON.parse(readFileSync(join(SNAPSHOT, "passages", SOURCE_ID, "pipeline.json"), "utf8")) as {
  storedSection?: { segments?: Array<{ type?: string; number?: number }> };
  section?: { segments?: Array<{ type?: string; number?: number }> };
};
const storedMarkers = (stored.storedSection?.segments ?? stored.section?.segments ?? [])
  .filter((seg) => seg.type === "choice")
  .map((seg) => seg.number);
assert.deepEqual(storedMarkers, [3, 1, 2, 4], "stored snapshot must keep pre-fix ③→①→②→④");

const replay = replaySnapshot(SNAPSHOT);
assert.equal(replay.networkCalls, 0);
assert.equal(replay.passages.length, 1);
const row = replay.passages[0]!;
assert.equal(row.ok, true, row.reason);
assert.deepEqual(row.assertionErrors, []);

const source = JSON.parse(readFileSync(join(SNAPSHOT, "passages", SOURCE_ID, "source.json"), "utf8")) as {
  passage: string;
  title: string;
  sentences: Array<{ sentenceId: string; text: string }>;
};
const analyzer = JSON.parse(readFileSync(join(SNAPSHOT, "passages", SOURCE_ID, "analyzer.json"), "utf8")) as {
  rawJson: string;
};
const reviewer = JSON.parse(readFileSync(join(SNAPSHOT, "passages", SOURCE_ID, "reviewer.json"), "utf8")) as {
  rawJson: unknown;
};
const parsedAnalyzer = parseAnalyzerRawJson(String(analyzer.rawJson ?? ""), SOURCE_ID);
const rawReview = reviewer.rawJson;
const parsedReview = Array.isArray(rawReview)
  ? rawReview.flatMap((entry) => parseAuditorRawJson(String(entry)).results)
  : parseAuditorRawJson(String(rawReview ?? "{\"results\":[]}")).results;
const exact = segmentPassage(
  source.passage,
  source.sentences.map((entry) => ({ id: entry.sentenceId, english: entry.text }))
);
const finalized = finalizeV2Passage({
  projectId: SOURCE_ID,
  title: source.title,
  source: null,
  originalPassage: source.passage,
  sentences: exact,
  detected: parsedAnalyzer.detected,
  candidates: parsedAnalyzer.candidates,
  audits: parsedReview.filter((entry) =>
    parsedAnalyzer.candidates.some(
      (candidate) =>
        entry.candidateId === candidate.candidateId || entry.candidateId.startsWith(`${candidate.candidateId}#`)
    )
  ),
  seedKey: `${SOURCE_ID}|${hashPassage(source.passage)}|v2`,
  diagnosticsBase: blankDiag(exact.length),
});

assert.equal(finalized.ok, true, finalized.reason);
const section = finalized.section!;
assert.equal(section.diagnostics?.passageRestored, true);
assert.equal(section.items.length, section.diagnostics?.renderedQuestionCount);
assert.deepEqual(
  section.segments.filter((seg) => seg.type === "choice").map((seg) => seg.number),
  section.items.map((_, i) => i + 1)
);
assert.deepEqual(
  section.items.map((item) => item.number),
  section.items.map((_, i) => i + 1)
);

const pairs = section.items.map((item) =>
  [item.correctText, item.incorrectText].map((text) => text.trim().toLowerCase()).sort().join(" / ")
);
for (const original of ORIGINAL) {
  const key = original
    .split(" / ")
    .map((text) => text.trim().toLowerCase())
    .sort()
    .join(" / ");
  assert.ok(pairs.includes(key), `missing original pair ${original}: ${pairs.join(" | ")}`);
}

const who = section.items.find((item) => item.correctText.toLowerCase() === "who");
const likes = section.items.find((item) => item.correctText.toLowerCase() === "likes");
const what = section.items.find((item) => item.correctText.toLowerCase() === "what they are");
const involved = section.items.find((item) => item.correctText.toLowerCase() === "involved");
assert.equal(who?.incorrectText.toLowerCase(), "whom");
assert.equal(likes?.incorrectText.toLowerCase(), "like");
assert.equal(what?.incorrectText.toLowerCase(), "what are they");
assert.equal(involved?.incorrectText.toLowerCase(), "involving");
assert.equal(likes?.grammarCategoryId, "AGREEMENT_DISTANCE");
assert.equal(likes?.internalProvenance?.subtype, "INTERVENING_MODIFIER");
assert.match(likes?.explanationKo ?? "", /수식어|장거리/);
assert.equal(involved?.grammarCategoryId, "PARTICIPLE_ACTIVE_PASSIVE");
assert.equal(involved?.internalProvenance?.subtype, "POSTMODIFYING_PP");
assert.match(involved?.explanationKo ?? "", /후치수식하는 과거분사/);
assert.match(involved?.explanationKo ?? "", /the food involved/i);
assert.equal(section.items.filter((item) => /don'?t/i.test(`${item.correctText} ${item.incorrectText}`)).length, 0);
assert.equal(section.items.filter((item) => item.correctText.toLowerCase() === "who we are").length, 0);
assert.equal(section.items.filter((item) => item.grammarCategoryId === "INDIRECT_QUESTION_ORDER").length, 1);
const either = section.items.find((item) => item.correctText.toLowerCase() === "messed");
assert.equal(either?.incorrectText.toLowerCase(), "messing");
assert.equal(either?.grammarCategoryId, "CORRELATIVE_EITHER_OR");
const than = section.items.find((item) => item.correctText.toLowerCase() === "than");
assert.equal(than?.incorrectText.toLowerCase(), "as");
const which = section.items.find(
  (item) => item.grammarCategoryId === "RELATIVE_PREPOSITION_WHICH" && item.correctText.toLowerCase() === "which"
);
assert.equal(which?.incorrectText.toLowerCase(), "that");
assert.match(which?.explanationKo ?? "", /전치사 바로 뒤에는 관계대명사 which/);

console.log("before", storedMarkers.join("→"));
console.log(
  "after",
  section.items
    .map((item) => `${item.number}:${item.correctText}/${item.incorrectText}:${item.grammarCategoryId}`)
    .join(" | ")
);
console.log("prod-taste-social ok", section.items.length);

function blankDiag(sentenceCount: number): WorkbookGrammarChoiceDiagnostics {
  return {
    sentenceCount,
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
