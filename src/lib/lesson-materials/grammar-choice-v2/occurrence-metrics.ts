import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  DetectedGrammarPoint,
  GrammarPointCode,
} from "@/lib/lesson-materials/grammar-choice-v2/types";
import type { OccurrenceRecord, OccurrenceStatus } from "@/lib/lesson-materials/grammar-choice-v2/coverage";

export const OCCURRENCE_COUNT_UNITS = {
  detectedMandatoryOccurrences: "mandatory-occurrence",
  analysisOnlyMandatoryOccurrences: "mandatory-occurrence",
  eligibleMandatoryOccurrences: "mandatory-occurrence",
  validExcludedMandatoryOccurrences: "mandatory-occurrence",
  renderedMandatoryOccurrences: "mandatory-occurrence",
  missingEligibleMandatoryOccurrences: "mandatory-occurrence",
  totalEligibleQuestions: "student-question-candidate",
  totalRenderedQuestions: "student-item",
  totalExcludedOccurrences: "occurrence",
} as const;

export type NormalizedOccurrenceCounts = {
  units: typeof OCCURRENCE_COUNT_UNITS;
  detectedMandatoryOccurrences: number;
  analysisOnlyMandatoryOccurrences: number;
  eligibleMandatoryOccurrences: number;
  validExcludedMandatoryOccurrences: number;
  renderedMandatoryOccurrences: number;
  missingEligibleMandatoryOccurrences: number;
  totalEligibleQuestions: number;
  totalRenderedQuestions: number;
  totalExcludedOccurrences: number;
};

const STATUS_RANK: Record<OccurrenceStatus, number> = {
  RENDERED: 4,
  MISSING_ELIGIBLE: 3,
  VALID_EXCLUSION: 2,
  ELIGIBLE_QUESTION: 1,
  ANALYSIS_ONLY: 0,
};

export function occurrenceIdOf(input: {
  sentenceId: string;
  code: string;
  sourceSpan: string;
}): string {
  return `${input.sentenceId}|${input.code}|${input.sourceSpan.trim().toLowerCase()}`;
}

export function normalizeOccurrenceCounts(input: {
  detected: DetectedGrammarPoint[];
  occurrences: OccurrenceRecord[];
  renderedStudentItems: number;
}): NormalizedOccurrenceCounts {
  const mandatory = collapse(input.occurrences.filter((row) => isMandatory(row.code)));
  const all = collapse(input.occurrences);
  const renderedMandatory = mandatory.filter((row) => row.status === "RENDERED");
  const missingMandatory = mandatory.filter((row) => row.status === "MISSING_ELIGIBLE");
  const eligibleMandatory = mandatory.filter(
    (row) => row.status === "RENDERED" || row.status === "MISSING_ELIGIBLE"
  );
  const eligibleQuestions = all.filter(
    (row) => row.status === "RENDERED" || row.status === "MISSING_ELIGIBLE"
  );
  return {
    units: OCCURRENCE_COUNT_UNITS,
    detectedMandatoryOccurrences: input.detected.filter((point) => isMandatory(point.pointCode)).length,
    analysisOnlyMandatoryOccurrences: mandatory.filter((row) => row.status === "ANALYSIS_ONLY").length,
    eligibleMandatoryOccurrences: eligibleMandatory.length,
    validExcludedMandatoryOccurrences: mandatory.filter((row) => row.status === "VALID_EXCLUSION").length,
    renderedMandatoryOccurrences: renderedMandatory.length,
    missingEligibleMandatoryOccurrences: eligibleMandatory.length - renderedMandatory.length,
    totalEligibleQuestions: eligibleQuestions.length,
    totalRenderedQuestions: input.renderedStudentItems,
    totalExcludedOccurrences: all.filter((row) => row.status === "VALID_EXCLUSION").length,
  };
}

export function assertOccurrenceInvariants(counts: NormalizedOccurrenceCounts): string[] {
  const errors: string[] = [];
  if (counts.renderedMandatoryOccurrences > counts.eligibleMandatoryOccurrences) {
    errors.push("renderedMandatoryOccurrences > eligibleMandatoryOccurrences");
  }
  if (
    counts.missingEligibleMandatoryOccurrences !==
    counts.eligibleMandatoryOccurrences - counts.renderedMandatoryOccurrences
  ) {
    errors.push("missingEligibleMandatoryOccurrences != eligibleMandatoryOccurrences - renderedMandatoryOccurrences");
  }
  if (counts.missingEligibleMandatoryOccurrences < 0) {
    errors.push("missingEligibleMandatoryOccurrences < 0");
  }
  if (counts.totalRenderedQuestions < 0) {
    errors.push("totalRenderedQuestions < 0");
  }
  return errors;
}

function isMandatory(code: GrammarPointCode | string): boolean {
  return ontologyPoint(code)?.priority === "MANDATORY";
}

function collapse(rows: OccurrenceRecord[]): OccurrenceRecord[] {
  const byId = new Map<string, OccurrenceRecord>();
  for (const row of rows) {
    const id = occurrenceIdOf(row);
    const prev = byId.get(id);
    if (!prev || STATUS_RANK[row.status] > STATUS_RANK[prev.status]) {
      byId.set(id, row);
    }
  }
  return [...byId.values()];
}
