import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

export const OBJECT_COMPLEMENT_TO_V_OWNERSHIP = {
  code: "OBJECT_COMPLEMENT_TO_V",
  primary: "CH01",
  secondary: "CH09",
} as const;

type SpanHit = {
  code: string;
  subtype: string;
  sourceSpan: string;
  occurrenceIndex: number;
  questionable: boolean;
};

export function isResolvedSecondaryOwnership(code: string, chapters: string[]): boolean {
  if (code !== OBJECT_COMPLEMENT_TO_V_OWNERSHIP.code) return false;
  const owners = new Set(chapters);
  return (
    owners.size === 2 &&
    owners.has(OBJECT_COMPLEMENT_TO_V_OWNERSHIP.primary) &&
    owners.has(OBJECT_COMPLEMENT_TO_V_OWNERSHIP.secondary)
  );
}

export function objectComplementSpansOverlap(left: SpanHit, right: SpanHit): boolean {
  const leftStart = left.occurrenceIndex;
  const leftEnd = leftStart + left.sourceSpan.length;
  const rightStart = right.occurrenceIndex;
  const rightEnd = rightStart + right.sourceSpan.length;
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function isObjectComplementToVAxis(hit: { code: string; subtype: string }): boolean {
  return hit.code === OBJECT_COMPLEMENT_TO_V_OWNERSHIP.code && (hit.subtype === "TO_V" || hit.subtype === "OBJECT_TO_V");
}

export function suppressSecondarySameAxis<T extends SpanHit & { exclusionReason?: LocalRejectCode }>(
  primary: SpanHit[],
  secondary: T[],
  assessmentAxis: string
): T[] {
  if (assessmentAxis !== "LOGICAL_SUBJECT_FOR_OF") return secondary;
  const owners = primary.filter(
    (hit) => hit.questionable && hit.code === "INFINITIVE_LOGICAL_SUBJECT" && /^(?:for|of)$/i.test(hit.sourceSpan)
  );
  return secondary.map((hit) => {
    if (hit.code !== "INFINITIVE_LOGICAL_SUBJECT" || !/^(?:for|of)$/i.test(hit.sourceSpan)) return hit;
    const owned = owners.some((owner) => objectComplementSpansOverlap(hit, owner));
    if (!owned) return hit;
    return { ...hit, questionable: false, exclusionReason: "SECONDARY_OWNER_SUPPRESSED" };
  });
}

export function suppressSecondaryObjectComplement<T extends SpanHit & { exclusionReason?: LocalRejectCode }>(
  primary: SpanHit[],
  secondary: T[]
): T[] {
  const owners = primary.filter((hit) => hit.questionable && hit.code === OBJECT_COMPLEMENT_TO_V_OWNERSHIP.code && hit.subtype === "TO_V");
  return secondary.map((hit) => {
    if (hit.subtype !== "OBJECT_TO_V" || !isObjectComplementToVAxis(hit)) return hit;
    const owned = owners.some((owner) => objectComplementSpansOverlap(hit, owner));
    if (!owned) return hit;
    return { ...hit, questionable: false, exclusionReason: "SECONDARY_OWNER_SUPPRESSED" };
  });
}
