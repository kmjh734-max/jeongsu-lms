import { rankCandidates } from "@/lib/lesson-materials/grammar-choice-v2/candidate-ranker";
import { buildCoverage } from "@/lib/lesson-materials/grammar-choice-v2/coverage";
import { COMPARISON_CH12_RULES } from "@/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { codeSpanContractMismatch, explanationContractMismatch } from "@/lib/lesson-materials/grammar-choice-v2/assessment-contract";
import { explanationFitsPair, repairChoice, safeLocalCandidates } from "@/lib/lesson-materials/grammar-choice-v2/choice-repair";
import { isWhToInfinitiveSpan } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { explainChoice } from "@/lib/lesson-materials/grammar-choice-v2/explanation-templates";
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import {
  normalizeOccurrenceCounts,
  occurrenceIdOf,
} from "@/lib/lesson-materials/grammar-choice-v2/occurrence-metrics";
import {
  generationPolicyFor,
  localTemplateDistractor,
} from "@/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { validateMinimalPair } from "@/lib/lesson-materials/grammar-choice-v2/minimal-pair";
import {
  needsAuditor,
  rejectCandidate,
  repairForbiddenConditionalDistractor,
  subtypeKey,
} from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import { scanLocalMandatory } from "@/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import {
  assignSeededSides,
  passageHash,
  renderChoices,
  restoreCorrectAnswers,
} from "@/lib/lesson-materials/grammar-choice-v2/renderer";
import { findOccurrences, resolveSpan } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import type {
  AuditResult,
  DetectedGrammarPoint,
  ExactSentence,
  GrammarCandidate,
  GrammarPriority,
  LocalRejectCode,
  ResolvedCandidate,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import { buildPassageSegmentsFromSource } from "@/lib/lesson-materials/grammar-choice-display";
import type {
  GrammarChoiceCandidate,
  WorkbookGrammarChoiceDiagnostics,
  WorkbookGrammarChoiceItem,
  WorkbookGrammarChoiceSection,
} from "@/lib/lesson-materials/workbook-types";

export type V2Reject = {
  candidateId: string;
  sentenceId: string;
  pointCode: GrammarCandidate["pointCode"];
  reason: string;
  pair: string;
};

export type FinalizeInput = {
  projectId: string;
  title: string;
  source: string | null;
  originalPassage: string;
  sentences: ExactSentence[];
  detected: DetectedGrammarPoint[];
  candidates: GrammarCandidate[];
  audits?: AuditResult[];
  seedKey: string;
  diagnosticsBase: WorkbookGrammarChoiceDiagnostics;
};

export function resolveAndFilter(input: {
  sentences: ExactSentence[];
  candidates: GrammarCandidate[];
}): { resolved: ResolvedCandidate[]; rejected: V2Reject[] } {
  const byId = new Map(input.sentences.map((s) => [s.sentenceId, s]));
  const extras = input.sentences.flatMap((s) => safeLocalCandidates(s.sentenceId, s.text));
  const seenLocal = new Set(input.candidates.map((c) => `${c.sentenceId}|${c.pointCode}|${c.sourceSpan.toLowerCase()}`));
  const candidates = [
    ...input.candidates,
    ...extras.filter((c) => !seenLocal.has(`${c.sentenceId}|${c.pointCode}|${c.sourceSpan.toLowerCase()}`)),
  ];
  const resolved: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  const seenPair = new Set<string>();

  for (const raw of candidates) {
    let candidate = repairForbiddenConditionalDistractor(raw);
    const policy = generationPolicyFor(candidate.pointCode);
    if (policy === "NOT_QUESTIONABLE") {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "NOT_PEDAGOGICALLY_USEFUL",
        pair: `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`,
      });
      continue;
    }
    const sentence = byId.get(candidate.sentenceId);
    if (sentence) {
      const repaired = repairChoice({
        pointCode: candidate.pointCode,
        correct: candidate.sourceSpan,
        wrong: candidate.distractors[0] ?? "",
        sentence: sentence.text,
      });
      if (repaired && sentence.text.toLowerCase().includes(repaired.correct.toLowerCase())) {
        const hits = findOccurrences(sentence.text, repaired.correct);
        const occurrenceIndex = Math.max(0, hits.findIndex((hit) => hit === repaired.at));
        candidate = {
          ...candidate,
          pointCode: repaired.pointCode,
          sourceSpan: repaired.correct,
          correctAnswer: repaired.correct,
          distractors: [repaired.wrong],
          occurrenceIndex,
        };
      }
    }
    if (
      candidate.pointCode === "INDIRECT_QUESTION_ORDER" &&
      isWhToInfinitiveSpan(`${candidate.sourceSpan} ${candidate.correctAnswer}`)
    ) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "ANALYSIS_ONLY",
        pair: `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`,
      });
      continue;
    }
    const repairedPolicy = generationPolicyFor(candidate.pointCode);
    if (repairedPolicy === "LOCAL_TEMPLATE" && sentence) {
      const shrunk = shrinkLocalSpan(candidate.sourceSpan, sentence.text, candidate.pointCode);
      if (shrunk) {
        candidate = {
          ...candidate,
          sourceSpan: shrunk,
          correctAnswer: shrunk,
          occurrenceIndex: 0,
        };
      }
      const localWrong = localTemplateDistractor(
        candidate.pointCode,
        candidate.sourceSpan
      );
      if (localWrong) candidate = { ...candidate, distractors: [localWrong] };
    }
    const pair = `${candidate.correctAnswer} / ${candidate.distractors[0] ?? ""}`;
    if (!sentence) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_SPAN_NOT_FOUND",
        pair,
      });
      continue;
    }
    const local =
      rejectCandidate({ candidate, sentence }) ??
      validateMinimalPair({
        pointCode: candidate.pointCode,
        sourceSpan: candidate.sourceSpan,
        distractor: candidate.distractors[0] ?? "",
        sentence: sentence.text,
      });
    if (local) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: local,
        pair,
      });
      continue;
    }
    const span =
      resolveSpan({
        sentence,
        sourceSpan: candidate.sourceSpan,
        occurrenceIndex: candidate.occurrenceIndex,
      }) ??
      resolveSpan({
        sentence,
        sourceSpan: candidate.sourceSpan,
        occurrenceIndex:
          candidate.occurrenceIndex > 0 ? candidate.occurrenceIndex - 1 : 1,
      });
    if (!span || span.resolvedText !== candidate.sourceSpan) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_SPAN_NOT_FOUND",
        pair,
      });
      continue;
    }
    if (candidate.correctAnswer !== candidate.sourceSpan) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "SOURCE_ANSWER_MISMATCH",
        pair,
      });
      continue;
    }
    const exactPair = `${candidate.sentenceId}|${candidate.sourceSpan}|${normalize(candidate.distractors[0] ?? "")}`;
    if (seenPair.has(exactPair)) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: "DUPLICATE_SATISFIED_BY_PRIMARY",
        pair,
      });
      continue;
    }
    seenPair.add(exactPair);
    const def = ontologyPoint(candidate.pointCode);
    const presented = studentPresentation(
      candidate.pointCode,
      candidate.correctAnswer,
      candidate.distractors[0] ?? ""
    );
    const contract = codeSpanContractMismatch({
      pointCode: candidate.pointCode,
      subtype: presented.subtype,
      assessmentAxis: presented.assessmentAxis,
      correct: candidate.correctAnswer,
      wrong: candidate.distractors[0] ?? "",
      sentence: sentence.text,
    });
    if (contract) {
      rejected.push({
        candidateId: candidate.candidateId,
        sentenceId: candidate.sentenceId,
        pointCode: candidate.pointCode,
        reason: contract,
        pair,
      });
      continue;
    }
    resolved.push({
      ...candidate,
      priority: presented.priority ?? def?.priority ?? candidate.priority,
      passageStart: span.passageStart,
      passageEnd: span.passageEnd,
      subtypeKey: presented.subtype,
    });
  }
  return { resolved, rejected };
}

function studentPresentation(
  pointCode: string,
  correct: string,
  wrong: string
): { subtype: string; assessmentAxis: string; priority?: GrammarPriority } {
  const pair = [correct, wrong].map((s) => s.trim().toLowerCase()).sort().join("|");
  if (pointCode === "ONE_OF_SUPERLATIVE" && pair === "insight|insights") {
    const rule = COMPARISON_CH12_RULES.find(
      (row) => row.code === "ONE_OF_SUPERLATIVE" && row.subtype === "ONE_OF_PLURAL"
    );
    return { subtype: "ONE_OF_PLURAL", assessmentAxis: "ONE_OF_PLURAL", priority: rule?.priority };
  }
  if (pointCode === "PREPOSITION_INSTEAD_OF") {
    return { subtype: "INSTEAD_OF_NOUN", assessmentAxis: "FIXED_PREPOSITIONAL_PHRASE" };
  }
  if (pointCode === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    return { subtype: "OMITTED_THAT_SV_ORDER", assessmentAxis: "NOUN_CLAUSE_DECLARATIVE_ORDER" };
  }
  if (pointCode === "GERUND_PREPOSITION_OBJECT") {
    return { subtype: "PREP_GERUND", assessmentAxis: "GERUND_PREPOSITION_OBJECT", priority: "CORE" };
  }
  if (pointCode === "INFINITIVE_PASSIVE" && pair === "be wiped|wipe") {
    return { subtype: "TO_BE_PP", assessmentAxis: "INFINITIVE_PASSIVE" };
  }
  return { subtype: subtypeKey(pointCode, correct, wrong), assessmentAxis: pointCode };
}

function repeatedCodeSubtypePairs(
  items: Array<{
    correctText: string;
    incorrectText: string;
    grammarCategoryId: string;
    internalProvenance?: { subtype?: string; code?: string } | null;
  }>
): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const pair = [item.correctText, item.incorrectText].map((s) => s.trim().toLowerCase()).sort().join("|");
    const key = `${item.internalProvenance?.code ?? item.grammarCategoryId}|${item.internalProvenance?.subtype ?? ""}|${pair}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([key]) => key);
}

function shrinkLocalSpan(span: string, sentence: string, pointCode: string): string | null {
  if (!pointCode.startsWith("CONDITIONAL_")) return null;
  if (/\bhad\b/i.test(span) && findWord(sentence, "had")) return "had";
  if (/\bwere\b/i.test(span) && findWord(sentence, "were")) return "were";
  return null;
}

function findWord(sentence: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(sentence);
}

function refineAfterAudit(
  items: ResolvedCandidate[],
  sentences: ExactSentence[]
): { kept: ResolvedCandidate[]; rejected: V2Reject[] } {
  const byId = new Map(sentences.map((s) => [s.sentenceId, s]));
  const kept: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  for (const item of items) {
    const sentence = byId.get(item.sentenceId);
    if (!sentence) {
      kept.push(item);
      continue;
    }
    const repaired = repairChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      sentence: sentence.text,
    });
    let next = item;
    if (
      repaired &&
      repaired.correct !== item.correctAnswer &&
      sentence.text.toLowerCase().includes(repaired.correct.toLowerCase())
    ) {
      const hits = findOccurrences(sentence.text, repaired.correct);
      const occurrenceIndex = Math.max(0, hits.findIndex((hit) => hit === repaired.at));
      const span =
        resolveSpan({ sentence, sourceSpan: repaired.correct, occurrenceIndex }) ??
        resolveSpan({
          sentence,
          sourceSpan: repaired.correct,
          occurrenceIndex: occurrenceIndex > 0 ? occurrenceIndex - 1 : 1,
        });
      if (span && span.resolvedText === repaired.correct) {
        const presented = studentPresentation(repaired.pointCode, repaired.correct, repaired.wrong);
        next = {
          ...item,
          pointCode: repaired.pointCode,
          sourceSpan: repaired.correct,
          correctAnswer: repaired.correct,
          distractors: [repaired.wrong],
          occurrenceIndex,
          passageStart: span.passageStart,
          passageEnd: span.passageEnd,
          subtypeKey: presented.subtype,
          priority: presented.priority ?? item.priority,
        };
      }
    }
    const presented = studentPresentation(next.pointCode, next.correctAnswer, next.distractors[0] ?? "");
    const contract = codeSpanContractMismatch({
      pointCode: next.pointCode,
      subtype: presented.subtype,
      assessmentAxis: presented.assessmentAxis,
      correct: next.correctAnswer,
      wrong: next.distractors[0] ?? "",
      sentence: sentence.text,
    });
    if (contract) {
      rejected.push({
        candidateId: next.candidateId,
        sentenceId: next.sentenceId,
        pointCode: next.pointCode,
        reason: contract,
        pair: `${next.correctAnswer} / ${next.distractors[0] ?? ""}`,
      });
      continue;
    }
    kept.push({ ...next, subtypeKey: presented.subtype, priority: presented.priority ?? next.priority });
  }
  return { kept, rejected };
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function applyAudits(
  items: ResolvedCandidate[],
  audits: AuditResult[] | undefined
): { kept: ResolvedCandidate[]; rejected: V2Reject[] } {
  if (!audits || audits.length === 0) return { kept: items, rejected: [] };
  const byId = new Map(audits.map((a) => [a.candidateId, a]));
  const kept: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  for (const item of items) {
    if (!needsAuditor(item)) {
      kept.push(item);
      continue;
    }
    const audit = byId.get(item.candidateId);
    const pass =
      audit?.decision === "PASS" &&
      audit.uniqueInContext &&
      audit.plausibleLearnerError &&
      audit.singleGrammarAxis;
    if (!pass) {
      const alt = item.distractors[1];
      const altId = `${item.candidateId}#alt`;
      const altAudit = byId.get(altId);
      const altPass =
        !!alt &&
        altAudit?.decision === "PASS" &&
        altAudit.uniqueInContext &&
        altAudit.plausibleLearnerError &&
        altAudit.singleGrammarAxis;
      if (altPass) {
        kept.push({ ...item, distractors: [alt, item.distractors[0]!] });
        continue;
      }
      rejected.push({
        candidateId: item.candidateId,
        sentenceId: item.sentenceId,
        pointCode: item.pointCode,
        reason: audit?.rejectionCode || "BOTH_GRAMMATICAL",
        pair: `${item.correctAnswer} / ${item.distractors[0] ?? ""}`,
      });
      continue;
    }
    kept.push(item);
  }
  return { kept, rejected };
}

export function expandAuditItems(items: ResolvedCandidate[]): ResolvedCandidate[] {
  const out: ResolvedCandidate[] = [];
  for (const item of items) {
    if (!needsAuditor(item)) continue;
    out.push(item);
    if (
      item.priority === "MANDATORY" &&
      item.distractors[1] &&
      item.distractors[1] !== item.distractors[0]
    ) {
      out.push({
        ...item,
        candidateId: `${item.candidateId}#alt`,
        distractors: [item.distractors[1], item.distractors[0]!],
      });
    }
  }
  return out;
}

export function finalizeV2Passage(input: FinalizeInput): {
  ok: boolean;
  section?: WorkbookGrammarChoiceSection;
  rejected: V2Reject[];
  missingMandatory: string[];
  reason?: string;
  stages: PipelineStages;
} {
  const filtered = resolveAndFilter({
    sentences: input.sentences,
    candidates: input.candidates,
  });
  const beforeReviewer = filtered.resolved;
  const audited = applyAudits(filtered.resolved, input.audits);
  const refined = refineAfterAudit(audited.kept, input.sentences);
  const beforeRank = refined.kept;
  const ranked = rankCandidates(beforeRank, input.sentences.length, input.sentences);
  const rejected: V2Reject[] = [
    ...filtered.rejected,
    ...audited.rejected,
    ...refined.rejected,
    ...ranked.dropped.map((d) => ({
      candidateId: d.item.candidateId,
      sentenceId: d.item.sentenceId,
      pointCode: d.item.pointCode,
      reason: d.reason,
      pair: `${d.item.correctAnswer} / ${d.item.distractors[0] ?? ""}`,
    })),
  ];

  const explainable = ranked.kept.filter((item) => {
    const explained = explainChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      ruleSummaryKo: item.ruleSummaryKo,
      evidence: item.evidence,
    });
    const text = `${explained.explanationKo} ${explained.wrongReasonKo} ${explained.structure}`;
    if (
      explanationFitsPair(text, item.correctAnswer, item.distractors[0] ?? "") &&
      !explanationContractMismatch({
        pointCode: item.pointCode,
        correct: item.correctAnswer,
        wrong: item.distractors[0] ?? "",
        explanation: text,
      })
    ) {
      return true;
    }
    rejected.push({
      candidateId: item.candidateId,
      sentenceId: item.sentenceId,
      pointCode: item.pointCode,
      reason: explanationContractMismatch({
        pointCode: item.pointCode,
        correct: item.correctAnswer,
        wrong: item.distractors[0] ?? "",
        explanation: text,
      })
        ? "CODE_SPAN_CONTRACT_MISMATCH"
        : "EXPLANATION_MISMATCH",
      pair: `${item.correctAnswer} / ${item.distractors[0] ?? ""}`,
    });
    return false;
  });

  const localMandatory = scanLocalMandatory(input.sentences);
  const coverage = buildCoverage({
    sentenceIds: input.sentences.map((s) => s.sentenceId),
    detected: input.detected,
    localMandatory,
    approved: explainable,
    resolved: filtered.resolved,
    droppedReasons: rejected.map((r) => ({
      sentenceId: r.sentenceId,
      pointCode: r.pointCode,
      reason: r.reason,
      pair: r.pair,
    })),
  });

  const sides = assignSeededSides(explainable, input.seedKey);
  const numbered = explainable.map((item, i) => ({
    ...item,
    number: i + 1,
    leftText: sides[i]!.leftText,
    rightText: sides[i]!.rightText,
    correctSide: sides[i]!.correctSide,
  }));
  const rendered = renderChoices({
    originalPassage: input.originalPassage,
    items: numbered,
  });
  const restored = restoreCorrectAnswers(
    rendered.rendered,
    numbered.map((n) => ({ number: n.number, correctText: n.correctAnswer }))
  );
  const stages = buildStages({
    candidates: input.candidates,
    filtered,
    beforeReviewer,
    audited,
    beforeRank,
    ranked,
    explainable,
    coverage,
    rejected,
    ok: restored === input.originalPassage,
    reason: restored === input.originalPassage ? undefined : "원문 복원 실패",
  });

  if (restored !== input.originalPassage) {
    return {
      ok: false,
      rejected,
      missingMandatory: [],
      reason: "원문 복원 실패",
      stages,
    };
  }

  const items = toWorkbookItems(numbered);
  const segments = buildPassageSegmentsFromSource(
    input.originalPassage,
    items
  );
  if (!segments || items.length !== numbered.length) {
    return {
      ok: false,
      rejected,
      missingMandatory: [],
      reason: "렌더 불변식 실패",
      stages,
    };
  }

  const rejectReasonCounts: Record<string, number> = {};
  for (const r of rejected) {
    rejectReasonCounts[r.reason] = (rejectReasonCounts[r.reason] ?? 0) + 1;
  }
  const mix = { BASIC: 0, CORE: 0, ADVANCED: 0 };
  for (const item of numbered) mix[item.difficulty] += 1;

  const counts = normalizeOccurrenceCounts({
    detected: input.detected,
    occurrences: coverage.occurrences,
    renderedStudentItems: items.length,
  });

  const diagnostics: WorkbookGrammarChoiceDiagnostics = {
    ...input.diagnosticsBase,
    generatedCandidateCount: input.candidates.length,
    codeValidatedCount: filtered.resolved.length,
    originalMismatchCount: rejected.filter((r) =>
      r.reason.startsWith("SOURCE_")
    ).length,
    overlapDuplicateCount: rejected.filter((r) =>
      r.reason.includes("OVERLAP") || r.reason.includes("DUPLICATE")
    ).length,
    reviewSubmittedCount: expandAuditItems(filtered.resolved).length,
    reviewAcceptedCount: explainable.length,
    mandatoryDetected: coverage.metrics.mandatoryDetected,
    mandatoryEligible: coverage.metrics.mandatoryEligible,
    mandatoryRendered: coverage.metrics.mandatoryRendered,
    mandatoryExcludedWithValidReason: coverage.metrics.mandatoryExcludedWithValidReason,
    sectionStatus: coverage.metrics.missingEligible > 0 ? "PARTIAL" : "COMPLETE",
    analysisOnlyCount: coverage.metrics.analysisOnly,
    eligibleQuestionCount: coverage.metrics.eligible,
    excludedOccurrenceCount: coverage.metrics.excluded,
    missingEligibleCount: coverage.metrics.missingEligible,
    mandatoryCoverage: coverage.metrics.coverage,
    detectedMandatoryOccurrences: counts.detectedMandatoryOccurrences,
    analysisOnlyMandatoryOccurrences: counts.analysisOnlyMandatoryOccurrences,
    eligibleMandatoryOccurrences: counts.eligibleMandatoryOccurrences,
    validExcludedMandatoryOccurrences: counts.validExcludedMandatoryOccurrences,
    renderedMandatoryOccurrences: counts.renderedMandatoryOccurrences,
    missingEligibleMandatoryOccurrences: counts.missingEligibleMandatoryOccurrences,
    totalEligibleQuestions: counts.totalEligibleQuestions,
    totalRenderedQuestions: counts.totalRenderedQuestions,
    totalExcludedOccurrences: counts.totalExcludedOccurrences,
    countUnits: counts.units,
    finalCount: items.length,
    finalQuestionCount: items.length,
    renderedQuestionCount: items.length,
    newQuestionCount: items.length,
    grammarCategoryCount: new Set(items.map((i) => i.grammarCategoryId)).size,
    passageRestored: true,
    countMismatch: false,
    difficultyMix: mix,
    rejectReasonCounts,
    repeatedCodeSubtypePairs: repeatedCodeSubtypePairs(items),
    underTargetReason: null,
  };

  const section: WorkbookGrammarChoiceSection = {
    projectId: input.projectId,
    title: input.title,
    source: input.source,
    sourcePassage: input.originalPassage,
    items,
    segments,
    algorithmVersion: "grammar-choice-v2",
    diagnostics,
  };

  if (
    diagnostics.finalQuestionCount !== items.length ||
    section.items.length !== items.length
  ) {
    return { ok: false, rejected, missingMandatory: [], reason: "개수 불일치", stages };
  }

  stages.finalize = { ok: true, reason: undefined, sectionStatus: diagnostics.sectionStatus ?? null };
  stages.studentItems = items;
  return { ok: true, section, rejected, missingMandatory: coverage.missing, stages };
}

export type PipelineStages = {
  afterAnalyzer: GrammarCandidate[];
  afterLocalFilter: { resolved: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeReviewer: ResolvedCandidate[];
  afterReviewer: { kept: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeRank: ResolvedCandidate[];
  afterRank: { kept: ResolvedCandidate[]; dropped: Array<{ item: ResolvedCandidate; reason: string }> };
  beforeDedup: ResolvedCandidate[];
  afterDedup: ResolvedCandidate[];
  coverage: ReturnType<typeof buildCoverage>;
  finalize: { ok: boolean; reason?: string; sectionStatus: string | null };
  studentItems: WorkbookGrammarChoiceItem[];
  exclusions: V2Reject[];
  occurrences: ReturnType<typeof buildCoverage>["occurrences"];
};

function buildStages(input: {
  candidates: GrammarCandidate[];
  filtered: { resolved: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeReviewer: ResolvedCandidate[];
  audited: { kept: ResolvedCandidate[]; rejected: V2Reject[] };
  beforeRank: ResolvedCandidate[];
  ranked: { kept: ResolvedCandidate[]; dropped: Array<{ item: ResolvedCandidate; reason: string }> };
  explainable: ResolvedCandidate[];
  coverage: ReturnType<typeof buildCoverage>;
  rejected: V2Reject[];
  ok: boolean;
  reason?: string;
}): PipelineStages {
  return {
    afterAnalyzer: input.candidates,
    afterLocalFilter: input.filtered,
    beforeReviewer: input.beforeReviewer,
    afterReviewer: input.audited,
    beforeRank: input.beforeRank,
    afterRank: input.ranked,
    beforeDedup: input.beforeRank,
    afterDedup: input.explainable,
    coverage: input.coverage,
    finalize: { ok: input.ok, reason: input.reason, sectionStatus: null },
    studentItems: [],
    exclusions: input.rejected,
    occurrences: input.coverage.occurrences,
  };
}

function toWorkbookItems(
  numbered: Array<
    ResolvedCandidate & {
      number: number;
      leftText: string;
      rightText: string;
      correctSide: "left" | "right";
    }
  >
): WorkbookGrammarChoiceItem[] {
  return numbered.map((item) => {
    const explained = explainChoice({
      pointCode: item.pointCode,
      correct: item.correctAnswer,
      wrong: item.distractors[0] ?? "",
      ruleSummaryKo: item.ruleSummaryKo,
      evidence: item.evidence,
    });
    const difficulty =
      item.difficulty === "ADVANCED" ? 5 : item.difficulty === "CORE" ? 3 : 2;
    return {
      number: item.number,
      choiceId: item.candidateId,
      internalProvenance: {
        code: item.pointCode,
        subtype: studentPresentation(item.pointCode, item.correctAnswer, item.distractors[0] ?? "").subtype,
        priority: item.priority,
        assessmentAxis: studentPresentation(item.pointCode, item.correctAnswer, item.distractors[0] ?? "").assessmentAxis,
        occurrenceId: occurrenceIdOf({
          sentenceId: item.sentenceId,
          code: item.pointCode,
          sourceSpan: item.sourceSpan,
        }),
        sourceSpan: item.sourceSpan,
        candidateId: item.candidateId,
        exclusionReason: null,
      },
      sentenceId: item.sentenceId,
      startTokenIndex: 0,
      endTokenIndex: 0,
      startCharIndex: item.passageStart,
      endCharIndex: item.passageEnd,
      originalText: item.correctAnswer,
      correctText: item.correctAnswer,
      incorrectText: item.distractors[0] ?? "",
      leftText: item.leftText,
      rightText: item.rightText,
      correctSide: item.correctSide,
      grammarCategoryId: item.pointCode,
      grammarCategoryName: explained.titleKo,
      bookTerm: explained.titleKo,
      explanationKo: explained.explanationKo,
      incorrectReasonKo: explained.wrongReasonKo,
      difficulty,
      learningValue: item.priority === "MANDATORY" ? 5 : 3,
      structureSummary: explained.structure,
    };
  });
}

export function hashPassage(text: string): string {
  return passageHash(text);
}

export type { LocalRejectCode, GrammarChoiceCandidate };
