import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { circledNumber } from "@/lib/lesson-materials/grammar-choice-constants";
import { parseAnalyzerRawJson } from "@/lib/lesson-materials/grammar-choice-v2/analyze-and-generate";
import { codeSpanContractMismatch, explanationContractMismatch } from "@/lib/lesson-materials/grammar-choice-v2/assessment-contract";
import { parseAuditorRawJson } from "@/lib/lesson-materials/grammar-choice-v2/ambiguity-auditor";
import { rejectFabricatedDistractor } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { isDoubleDegreeMarking } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import { assertOccurrenceInvariants } from "@/lib/lesson-materials/grammar-choice-v2/occurrence-metrics";
import {
  finalizeV2Passage,
  hashPassage,
  type PipelineStages,
} from "@/lib/lesson-materials/grammar-choice-v2/pipeline";
import { restoreCorrectAnswers } from "@/lib/lesson-materials/grammar-choice-v2/renderer";
import { segmentPassage } from "@/lib/lesson-materials/grammar-choice-v2/sentence-segmenter";
import { studentReplayDigest } from "@/lib/lesson-materials/grammar-choice-v2/snapshot-store";
import { GRAMMAR_CHOICE_V2_ENGINE } from "@/lib/lesson-materials/grammar-choice-v2/types";
import type { WorkbookGrammarChoiceDiagnostics } from "@/lib/lesson-materials/workbook-types";

export type ReplayPassageResult = {
  sourceId: string;
  ok: boolean;
  reason?: string;
  itemCount: number;
  digestMatch: boolean;
  assertionErrors: string[];
  digest: ReturnType<typeof studentReplayDigest> | null;
  liveDigest: unknown;
};

export function installReplayNetworkGuard(): { calls: () => number; restore: () => void } {
  const original = globalThis.fetch.bind(globalThis);
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    throw new Error("REPLAY_NETWORK_FORBIDDEN");
  }) as typeof fetch;
  return {
    calls: () => calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

export function replaySnapshot(snapshotDir: string): {
  networkCalls: number;
  passages: ReplayPassageResult[];
} {
  const guard = installReplayNetworkGuard();
  try {
    const ids = readdirSync(join(snapshotDir, "passages"));
    const passages = ids.map((sourceId) => replayPassage(snapshotDir, sourceId));
    return { networkCalls: guard.calls(), passages };
  } finally {
    guard.restore();
  }
}

function replayPassage(snapshotDir: string, sourceId: string): ReplayPassageResult {
  const source = readJson(join(snapshotDir, "passages", sourceId, "source.json"));
  const analyzer = readJson(join(snapshotDir, "passages", sourceId, "analyzer.json"));
  const reviewer = readJson(join(snapshotDir, "passages", sourceId, "reviewer.json"));
  const live = readJson(join(snapshotDir, "passages", sourceId, "pipeline.json"));
  const passage = String(source.passage ?? "");
  const sentences = Array.isArray(source.sentences) ? source.sentences : [];
  const parsedAnalyzer = parseAnalyzerRawJson(String(analyzer.rawJson ?? ""), sourceId);
  const rawReview = reviewer.rawJson;
  const parsedReview = Array.isArray(rawReview)
    ? rawReview.flatMap((row) => parseAuditorRawJson(String(row)).results)
    : parseAuditorRawJson(String(rawReview ?? "{\"results\":[]}")).results;
  const exact = segmentPassage(
    passage,
    sentences.map((row) => ({
      id: String((row as { sentenceId?: string }).sentenceId ?? ""),
      english: String((row as { text?: string }).text ?? ""),
    }))
  );
  const finalized = finalizeV2Passage({
    projectId: sourceId,
    title: String(source.title ?? ""),
    source: source.source == null ? null : String(source.source),
    originalPassage: passage,
    sentences: exact,
    detected: parsedAnalyzer.detected,
    candidates: parsedAnalyzer.candidates,
    audits: parsedReview.filter((row) =>
      parsedAnalyzer.candidates.some(
        (candidate) =>
          row.candidateId === candidate.candidateId ||
          row.candidateId.startsWith(`${candidate.candidateId}#`)
      )
    ),
    seedKey: `${sourceId}|${hashPassage(passage)}|v2`,
    diagnosticsBase: emptyDiagnostics(exact.length),
  });
  const errors = assertReplay(finalized, passage, finalized.stages);
  const digest = finalized.section
    ? studentReplayDigest(finalized.section, {
        exclusions: finalized.rejected,
        occurrences: finalized.stages.occurrences,
      })
    : null;
  const liveDigest = live.digest ?? null;
  return {
    sourceId,
    ok: finalized.ok,
    reason: finalized.reason,
    itemCount: finalized.section?.items.length ?? 0,
    digestMatch: JSON.stringify(digest) === JSON.stringify(liveDigest),
    assertionErrors: errors,
    digest,
    liveDigest,
  };
}

function assertReplay(
  finalized: ReturnType<typeof finalizeV2Passage>,
  passage: string,
  stages: PipelineStages
): string[] {
  const errors: string[] = [];
  const section = finalized.section;
  if (!section) {
    errors.push(finalized.reason ?? "NO_SECTION");
    return errors;
  }
  const d = section.diagnostics;
  const eligible = d?.eligibleMandatoryOccurrences ?? 0;
  const rendered = d?.renderedMandatoryOccurrences ?? 0;
  const missing = d?.missingEligibleMandatoryOccurrences ?? 0;
  if (rendered > eligible) errors.push("renderedMandatory > eligibleMandatory");
  if (missing !== eligible - rendered) errors.push("missingEligibleMandatory != eligible - rendered");
  if (missing < 0) errors.push("missingEligibleMandatory < 0");
  if ((d?.totalRenderedQuestions ?? -1) !== section.items.length) {
    errors.push("totalRenderedQuestions !== items.length");
  }
  const choiceSegs = section.segments.filter((seg) => seg.type === "choice");
  if (choiceSegs.length !== section.items.length) errors.push("choice markers !== items.length");
  const positional = [...section.items].sort((a, b) => a.startCharIndex - b.startCharIndex || a.endCharIndex - b.endCharIndex);
  for (let i = 0; i < positional.length; i += 1) {
    if (positional[i]!.number !== i + 1) {
      errors.push(`numbering:${positional[i]!.number}@${i}`);
    }
  }
  for (let i = 0; i < section.items.length; i += 1) {
    if (section.items[i]!.number !== i + 1) {
      errors.push(`items-number:${section.items[i]!.number}@${i}`);
    }
  }
  for (let i = 0; i < choiceSegs.length; i += 1) {
    if (choiceSegs[i]!.number !== i + 1) {
      errors.push(`marker-order:${choiceSegs[i]!.number}`);
    }
  }
  if ((d?.passageRestored !== true) || (d?.renderedQuestionCount ?? -1) !== section.items.length) {
    errors.push("passageRestored/count");
  }
  const restored = restoreCorrectAnswers(
    renderedFromItems(passage, section.items),
    section.items.map((item) => ({ number: item.number, correctText: item.correctText }))
  );
  if (restored !== passage || d?.passageRestored !== true) errors.push("restore !== source");
  for (const item of section.items) {
    const fabricated = rejectFabricatedDistractor({
      pointCode: item.grammarCategoryId,
      correct: item.correctText,
      wrong: item.incorrectText,
      sentence: passage,
    });
    if (fabricated) errors.push(`fabricated:${item.number}:${fabricated}`);
    if (isDoubleDegreeMarking(item.incorrectText) || isDoubleDegreeMarking(item.correctText)) {
      errors.push(`double-degree:${item.number}`);
    }
    if (item.grammarCategoryId === "UNMAPPED_HIGH_VALUE_POINT" || item.internalProvenance?.code === "UNMAPPED_HIGH_VALUE_POINT") {
      errors.push(`unmapped:${item.number}`);
    }
    if (/had\s*\/\s*would have|would have\s*\/\s*had|were\s*\/\s*would be|would be\s*\/\s*were/i.test(`${item.correctText} / ${item.incorrectText}`)) {
      errors.push(`mechanical-conditional:${item.number}`);
    }
    if (explanationMismatchesItem(item, passage)) errors.push(`explanation-mismatch:${item.number}`);
    const contract = codeSpanContractMismatch({
      pointCode: item.grammarCategoryId,
      subtype: item.internalProvenance?.subtype ?? "",
      assessmentAxis: item.internalProvenance?.assessmentAxis ?? item.grammarCategoryId,
      correct: item.correctText,
      wrong: item.incorrectText,
      sentence: passage,
    });
    if (contract) errors.push(`code-span-contract:${item.number}`);
    if (item.correctText.trim().toLowerCase() === item.incorrectText.trim().toLowerCase()) {
      errors.push(`both-answers:${item.number}`);
    }
  }
  const spanAxis = new Set<string>();
  for (const item of section.items) {
    const key = `${item.internalProvenance?.assessmentAxis ?? item.grammarCategoryId}|${item.startCharIndex}|${item.endCharIndex}`;
    if (spanAxis.has(key)) errors.push(`duplicate-span-axis:${item.number}`);
    spanAxis.add(key);
  }
  const missingIds = new Set(
    stages.occurrences.filter((row) => row.status === "MISSING_ELIGIBLE").map((row) => `${row.sentenceId}|${row.code}|${row.sourceSpan}`)
  );
  for (const row of stages.occurrences) {
    if (row.status !== "ANALYSIS_ONLY" && row.status !== "VALID_EXCLUSION") continue;
    if (missingIds.has(`${row.sentenceId}|${row.code}|${row.sourceSpan}`)) {
      errors.push(`excluded-in-missing:${row.code}`);
    }
  }
  const renderedSpans = new Set(
    section.items.map((item) => item.internalProvenance?.occurrenceId).filter(Boolean)
  );
  for (const row of stages.occurrences) {
    if (row.status !== "MISSING_ELIGIBLE") continue;
    const id = `${row.sentenceId}|${row.code}|${row.sourceSpan.trim().toLowerCase()}`;
    if (renderedSpans.has(id)) errors.push(`secondary-missing-while-primary-rendered:${row.code}`);
  }
  errors.push(...assertOccurrenceInvariants({
    units: {
      detectedMandatoryOccurrences: "mandatory-occurrence",
      analysisOnlyMandatoryOccurrences: "mandatory-occurrence",
      eligibleMandatoryOccurrences: "mandatory-occurrence",
      validExcludedMandatoryOccurrences: "mandatory-occurrence",
      renderedMandatoryOccurrences: "mandatory-occurrence",
      missingEligibleMandatoryOccurrences: "mandatory-occurrence",
      totalEligibleQuestions: "student-question-candidate",
      totalRenderedQuestions: "student-item",
      totalExcludedOccurrences: "occurrence",
    },
    detectedMandatoryOccurrences: d?.detectedMandatoryOccurrences ?? 0,
    analysisOnlyMandatoryOccurrences: d?.analysisOnlyMandatoryOccurrences ?? 0,
    eligibleMandatoryOccurrences: eligible,
    validExcludedMandatoryOccurrences: d?.validExcludedMandatoryOccurrences ?? 0,
    renderedMandatoryOccurrences: rendered,
    missingEligibleMandatoryOccurrences: missing,
    totalEligibleQuestions: d?.totalEligibleQuestions ?? 0,
    totalRenderedQuestions: d?.totalRenderedQuestions ?? 0,
    totalExcludedOccurrences: d?.totalExcludedOccurrences ?? 0,
  }));
  return errors;
}

function explanationMismatchesItem(item: {
  correctText: string;
  incorrectText: string;
  explanationKo: string;
  grammarCategoryId: string;
}, passage: string): boolean {
  const pair = [item.correctText, item.incorrectText].map((s) => s.trim().toLowerCase()).sort().join("|");
  const text = item.explanationKo;
  if (text.includes("유지할 수 있다")) return true;
  if (pair === "instead|instead of" && /뒤에 오는 성분이 절이면 접속사/.test(text)) return true;
  if (pair === "made move|made to move" && /과거분사를 쓴다/.test(text) && !/be made to/.test(text)) return true;
  if (pair === "that|which" && item.grammarCategoryId === "PARALLEL_CLAUSES" && !/완전한 내용절/.test(text)) return true;
  if (pair === "extreme|extremely" && !/부사/.test(text)) return true;
  if (pair === "are we getting|we are getting" && !/평서문 어순/.test(text)) return true;
  if (pair === "think|thinking" && /to think|to부정사/.test(text)) return true;
  if (pair === "be wiped|wipe" && !/to부정사/.test(text)) return true;
  if (pair === "insight|insights" && !/복수형/.test(text)) return true;
  if (pair === "like|likes" && !/수식어|장거리/.test(text)) return true;
  if (pair === "involved|involving" && (!/후치수식/.test(text) || !/과거분사/.test(text))) return true;
  if (pair === "that|which" && item.grammarCategoryId === "RELATIVE_PREPOSITION_WHICH" && !/전치사/.test(text)) return true;
  if (pair === "as|than" && !/비교급/.test(text)) return true;
  if (pair === "during|when" && !/절/.test(text)) return true;
  if (/\bink\b/i.test(text) && !/\bink\b/i.test(`${item.correctText} ${item.incorrectText} ${passage}`) && pair !== "instead|instead of") {
    return true;
  }
  return explanationContractMismatch({
    pointCode: item.grammarCategoryId,
    correct: item.correctText,
    wrong: item.incorrectText,
    explanation: text,
  });
}

function renderedFromItems(
  passage: string,
  items: Array<{ number: number; leftText: string; rightText: string; startCharIndex: number; endCharIndex: number }>
): string {
  const ordered = [...items].sort((a, b) => b.startCharIndex - a.startCharIndex);
  let text = passage;
  for (const item of ordered) {
    const marker = `${circledNumber(item.number)}[${item.leftText} / ${item.rightText}]`;
    text = text.slice(0, item.startCharIndex) + marker + text.slice(item.endCharIndex);
  }
  return text;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function emptyDiagnostics(sentenceCount: number): WorkbookGrammarChoiceDiagnostics {
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
