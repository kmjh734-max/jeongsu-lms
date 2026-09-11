import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { isWhToInfinitiveSpan } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import type {
  DetectedGrammarPoint,
  GrammarPointCode,
  LocalMandatoryHint,
  OmissionReason,
  ResolvedCandidate,
  SentenceCoverageReport,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

export type OccurrenceStatus =
  | "ANALYSIS_ONLY"
  | "ELIGIBLE_QUESTION"
  | "VALID_EXCLUSION"
  | "RENDERED"
  | "MISSING_ELIGIBLE";

export type OccurrenceRecord = {
  sourceId: string;
  sentenceId: string;
  code: GrammarPointCode;
  subtype: string;
  assessmentAxis: string;
  sourceSpan: string;
  sourceAnswer: string;
  status: OccurrenceStatus;
  reason?: string;
};

export type MandatoryMetrics = {
  mandatoryDetected: number;
  mandatoryEligible: number;
  mandatoryRendered: number;
  mandatoryExcludedWithValidReason: number;
  analysisOnly: number;
  eligible: number;
  excluded: number;
  rendered: number;
  missingEligible: number;
  coverage: "N/A" | number;
};

const VALID_EXCLUSION = new Set([
  "BOTH_GRAMMATICAL",
  "UNIQUENESS_UNVERIFIED",
  "BOTH_CHOICES_GRAMMATICAL_IN_CONTEXT",
  "AMBIGUOUS_SUBJECT_BOUNDARY",
  "AMBIGUOUS_TENSE",
  "AMBIGUOUS_MEANING_CONTRAST",
  "NO_UNIQUE_DISTRACTOR",
  "OVERLAPPING_SPAN",
  "OVERLAPPING_HIGHER_PRIORITY_POINT",
  "OVERLAP_WITH_HIGHER_PRIORITY",
  "DUPLICATE_SUBTYPE",
  "DUPLICATE_EXACT_PAIR",
  "DUPLICATE_SATISFIED_BY_PRIMARY",
  "MISCLASSIFIED_ASSESSMENT_AXIS",
  "DOUBLE_DEGREE_MARKING",
  "UNMAPPED_ASSESSMENT_AXIS",
  "MECHANICAL_IF_WOULD_CONTRAST",
  "AMBIGUOUS_CONDITIONAL_TIME",
  "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR",
  "SECONDARY_OWNER_SUPPRESSED",
  "IMPLAUSIBLE_DISTRACTOR",
  "MEANING_ONLY_CONTRAST",
  "SOURCE_FORM_NOT_EDITABLE",
  "SOURCE_SPAN_NOT_FOUND",
  "SOURCE_ANSWER_MISMATCH",
  "NOT_PEDAGOGICALLY_USEFUL",
  "EXPLANATION_MISMATCH",
  "TOO_TRIVIAL_SHORT_AGREEMENT",
  "NON_MINIMAL_SPAN",
  "ANALYSIS_ONLY",
  "DISTRACTOR_NOT_ALLOWED",
  "FABRICATED_INFLECTION",
  "MULTI_AXIS_EDIT",
  "IMPLAUSIBLE_CLAUSE_REWRITE",
  "UNREALISTIC_LEARNER_ERROR",
  "FUNCTION_WORD_OR_ARGUMENT_DROPPED",
  "MECHANICAL_INFINITIVE_MARKER",
  "MECHANICAL_MODAL_FORM",
  "INTERDEPENDENT_CHOICES",
  "OVERDENSE_CLAUSE",
  "CODE_SPAN_CONTRACT_MISMATCH",
  "TOO_BASIC_FOR_LEVEL",
]);

export function canShrinkToSafePair(correct: string, wrong: string): boolean {
  const c = correct.trim().split(/\s+/).filter(Boolean);
  const w = wrong.trim().split(/\s+/).filter(Boolean);
  if (!c.length || !w.length) return false;
  let start = 0;
  while (start < c.length && start < w.length && c[start]!.toLowerCase() === w[start]!.toLowerCase()) start += 1;
  let end = 0;
  while (
    end < c.length - start &&
    end < w.length - start &&
    c[c.length - 1 - end]!.toLowerCase() === w[w.length - 1 - end]!.toLowerCase()
  ) {
    end += 1;
  }
  if (start === 0 && end === 0) return false;
  const nextC = c.slice(start, c.length - end);
  const nextW = w.slice(start, w.length - end);
  return nextC.length > 0 && nextW.length > 0 && nextC.length <= 4 && nextW.length <= 4;
}

export function buildCoverage(input: {
  sentenceIds: string[];
  detected: DetectedGrammarPoint[];
  localMandatory: LocalMandatoryHint[];
  approved: ResolvedCandidate[];
  resolved?: ResolvedCandidate[];
  droppedReasons: Array<{ sentenceId: string; pointCode: GrammarPointCode; reason: string; pair?: string }>;
  safeEligible?: Array<{ sentenceId: string; pointCode: GrammarPointCode }>;
}): {
  reports: SentenceCoverageReport[];
  missing: string[];
  metrics: MandatoryMetrics;
  occurrences: OccurrenceRecord[];
} {
  const renderedKeys = new Set(input.approved.map(occurrenceKey));
  const resolved = input.resolved ?? input.approved;
  const occurrences: OccurrenceRecord[] = [];

  for (const item of input.approved) {
    occurrences.push(recordFromCandidate(item, "RENDERED"));
  }
  for (const item of resolved) {
    if (renderedKeys.has(occurrenceKey(item))) continue;
    const dropped = input.droppedReasons.find(
      (drop) => drop.sentenceId === item.sentenceId && drop.pointCode === item.pointCode && VALID_EXCLUSION.has(drop.reason)
    );
    occurrences.push(recordFromCandidate(item, dropped ? "VALID_EXCLUSION" : "MISSING_ELIGIBLE"));
  }

  for (const drop of input.droppedReasons) {
    if (occurrences.some((row) => row.sentenceId === drop.sentenceId && row.code === drop.pointCode && row.status === "RENDERED")) {
      occurrences.push({
        sourceId: "",
        sentenceId: drop.sentenceId,
        code: drop.pointCode,
        subtype: "",
        assessmentAxis: drop.pointCode,
        sourceSpan: drop.pair ?? "",
        sourceAnswer: (drop.pair ?? "").split(" / ")[0] ?? "",
        status: "VALID_EXCLUSION",
        reason: "DUPLICATE_SATISFIED_BY_PRIMARY",
      });
      continue;
    }
    if (isAnalysisOnlyDrop(drop)) {
      occurrences.push(dropRecord(drop, "ANALYSIS_ONLY"));
      continue;
    }
    if (VALID_EXCLUSION.has(drop.reason)) {
      occurrences.push(dropRecord(drop, "VALID_EXCLUSION"));
      continue;
    }
    const wasEligible = resolved.some((item) => item.sentenceId === drop.sentenceId && item.pointCode === drop.pointCode);
    occurrences.push(dropRecord(drop, wasEligible ? "MISSING_ELIGIBLE" : "ANALYSIS_ONLY"));
  }

  for (const point of input.detected) {
    if (occurrences.some((row) => row.sentenceId === point.sentenceId && row.code === point.pointCode)) continue;
    occurrences.push({
      sourceId: "",
      sentenceId: point.sentenceId,
      code: point.pointCode,
      subtype: "",
      assessmentAxis: point.pointCode,
      sourceSpan: point.sourceSpan,
      sourceAnswer: point.sourceSpan,
      status: analysisStatus(point),
      reason: point.omissionReason,
    });
  }

  for (const hint of input.localMandatory) {
    if (occurrences.some((row) => row.sentenceId === hint.sentenceId && row.code === hint.pointCode)) continue;
    occurrences.push({
      sourceId: "",
      sentenceId: hint.sentenceId,
      code: hint.pointCode,
      subtype: "",
      assessmentAxis: hint.pointCode,
      sourceSpan: hint.sourceSpan,
      sourceAnswer: hint.sourceSpan,
      status: "ANALYSIS_ONLY",
    });
  }

  const missing = occurrences
    .filter((row) => row.status === "MISSING_ELIGIBLE")
    .map((row) => `${row.sentenceId}:${row.code}`);

  const eligible = occurrences.filter((row) => row.status === "ELIGIBLE_QUESTION" || row.status === "RENDERED" || row.status === "MISSING_ELIGIBLE");
  const rendered = occurrences.filter((row) => row.status === "RENDERED");
  const excluded = occurrences.filter((row) => row.status === "VALID_EXCLUSION");
  const analysisOnly = occurrences.filter((row) => row.status === "ANALYSIS_ONLY");
  const mandatoryEligible = eligible.filter((row) => ontologyPoint(row.code)?.priority === "MANDATORY");
  const coverage: "N/A" | number = mandatoryEligible.length === 0
    ? "N/A"
    : Math.round((mandatoryEligible.filter((row) => row.status === "RENDERED").length / mandatoryEligible.length) * 100);

  const reports = input.sentenceIds.map((sentenceId) => {
    const rows = occurrences.filter((row) => row.sentenceId === sentenceId);
    return {
      sentenceId,
      detectedPointCodes: [...new Set(rows.map((row) => row.code))],
      mandatoryPointCodes: [...new Set(rows.filter((row) => ontologyPoint(row.code)?.priority === "MANDATORY").map((row) => row.code))],
      generatedQuestionPointCodes: [...new Set(input.approved.filter((item) => item.sentenceId === sentenceId).map((item) => item.pointCode))],
      omittedPoints: rows
        .filter((row) => row.status === "VALID_EXCLUSION" || row.status === "ANALYSIS_ONLY")
        .map((row) => ({ pointCode: row.code, reason: mapDrop(row.reason) ?? "NOT_PEDAGOGICALLY_USEFUL" })),
    };
  });

  return {
    reports,
    missing,
    occurrences,
    metrics: {
      mandatoryDetected: input.detected.filter((point) => ontologyPoint(point.pointCode)?.priority === "MANDATORY").length,
      mandatoryEligible: mandatoryEligible.length,
      mandatoryRendered: mandatoryEligible.filter((row) => row.status === "RENDERED").length,
      mandatoryExcludedWithValidReason: excluded.filter((row) => ontologyPoint(row.code)?.priority === "MANDATORY").length,
      analysisOnly: analysisOnly.length,
      eligible: eligible.length,
      excluded: excluded.length,
      rendered: rendered.length,
      missingEligible: missing.length,
      coverage,
    },
  };
}

function occurrenceKey(item: { sentenceId: string; pointCode: string; passageStart?: number; sourceSpan: string }): string {
  return `${item.sentenceId}|${item.pointCode}|${item.passageStart ?? ""}|${item.sourceSpan.toLowerCase()}`;
}

function recordFromCandidate(item: ResolvedCandidate, status: OccurrenceStatus): OccurrenceRecord {
  return {
    sourceId: "",
    sentenceId: item.sentenceId,
    code: item.pointCode,
    subtype: item.subtypeKey,
    assessmentAxis: item.pointCode,
    sourceSpan: item.sourceSpan,
    sourceAnswer: item.correctAnswer,
    status,
  };
}

function dropRecord(
  drop: { sentenceId: string; pointCode: GrammarPointCode; reason: string; pair?: string },
  status: OccurrenceStatus
): OccurrenceRecord {
  return {
    sourceId: "",
    sentenceId: drop.sentenceId,
    code: drop.pointCode,
    subtype: "",
    assessmentAxis: drop.pointCode,
    sourceSpan: drop.pair ?? "",
    sourceAnswer: (drop.pair ?? "").split(" / ")[0] ?? "",
    status,
    reason: drop.reason,
  };
}

function isAnalysisOnlyDrop(drop: { pointCode: string; reason: string; pair?: string }): boolean {
  if (drop.reason === "ANALYSIS_ONLY") return true;
  if (drop.pointCode === "INDIRECT_QUESTION_ORDER" && isWhToInfinitiveSpan(drop.pair ?? "")) return true;
  if (drop.pointCode === "PARALLEL_CLAUSES" && (drop.reason === "NON_MINIMAL_SPAN" || drop.reason === "NO_UNIQUE_DISTRACTOR")) return true;
  if (drop.reason === "NO_UNIQUE_HIGH_VALUE_CONDITIONAL_PAIR") return true;
  if (drop.pointCode.startsWith("CONDITIONAL_") && drop.reason === "MECHANICAL_IF_WOULD_CONTRAST") return true;
  return false;
}

function analysisStatus(point: DetectedGrammarPoint): OccurrenceStatus {
  if (point.pointCode === "INDIRECT_QUESTION_ORDER" && isWhToInfinitiveSpan(point.sourceSpan)) return "ANALYSIS_ONLY";
  if (point.pointCode === "PARALLEL_CLAUSES") return "ANALYSIS_ONLY";
  if (point.omissionReason) return "VALID_EXCLUSION";
  return "ANALYSIS_ONLY";
}

function mapDrop(reason: string | undefined): OmissionReason | null {
  if (!reason) return "NOT_PEDAGOGICALLY_USEFUL";
  if (reason === "OVERLAPPING_SPAN") return "OVERLAP_WITH_HIGHER_PRIORITY";
  if (reason === "DUPLICATE_SUBTYPE" || reason === "DUPLICATE_SATISFIED_BY_PRIMARY") return "DUPLICATE_SUBTYPE";
  if (
    reason === "NO_UNIQUE_DISTRACTOR" ||
    reason === "BOTH_GRAMMATICAL" ||
    reason === "BOTH_CHOICES_GRAMMATICAL_IN_CONTEXT" ||
    reason === "IMPLAUSIBLE_DISTRACTOR" ||
    reason === "AMBIGUOUS_TENSE" ||
    reason === "TOO_TRIVIAL_SHORT_AGREEMENT"
  ) {
    return "NO_UNIQUE_DISTRACTOR";
  }
  if (reason === "SOURCE_SPAN_NOT_FOUND" || reason === "SOURCE_ANSWER_MISMATCH") {
    return "SOURCE_FORM_NOT_EDITABLE";
  }
  return "NOT_PEDAGOGICALLY_USEFUL";
}
