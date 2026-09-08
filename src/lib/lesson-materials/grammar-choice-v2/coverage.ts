import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  DetectedGrammarPoint,
  GrammarPointCode,
  LocalMandatoryHint,
  OmissionReason,
  ResolvedCandidate,
  SentenceCoverageReport,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

const OMISSIONS = new Set<OmissionReason>([
  "NO_UNIQUE_DISTRACTOR",
  "OVERLAPPING_HIGHER_PRIORITY_POINT",
  "OVERLAP_WITH_HIGHER_PRIORITY",
  "SOURCE_FORM_NOT_EDITABLE",
  "DUPLICATE_SUBTYPE",
  "NOT_PEDAGOGICALLY_USEFUL",
]);

export function buildCoverage(input: {
  sentenceIds: string[];
  detected: DetectedGrammarPoint[];
  localMandatory: LocalMandatoryHint[];
  approved: ResolvedCandidate[];
  droppedReasons: Array<{ sentenceId: string; pointCode: GrammarPointCode; reason: string }>;
}): { reports: SentenceCoverageReport[]; missing: string[] } {
  const reports: SentenceCoverageReport[] = [];
  const missing: string[] = [];

  for (const sentenceId of input.sentenceIds) {
    const detected = input.detected.filter((d) => d.sentenceId === sentenceId);
    const localCodes = input.localMandatory
      .filter((h) => h.sentenceId === sentenceId)
      .map((h) => h.pointCode);
    const detectedCodes = [
      ...new Set([...detected.map((d) => d.pointCode), ...localCodes]),
    ];
    const mandatory = [
      ...new Set(
        detectedCodes.filter((code) => ontologyPoint(code)?.priority === "MANDATORY")
      ),
    ];
    const generated = input.approved
      .filter((c) => c.sentenceId === sentenceId)
      .map((c) => c.pointCode);
    const omitted: SentenceCoverageReport["omittedPoints"] = [];

    for (const code of mandatory) {
      if (generated.includes(code)) continue;
      const fromDetected = detected.find(
        (d) => d.pointCode === code && d.omissionReason && OMISSIONS.has(d.omissionReason)
      );
      const fromDrop = input.droppedReasons.find(
        (d) => d.sentenceId === sentenceId && d.pointCode === code
      );
      const reason = fromDetected?.omissionReason
        ?? mapDrop(fromDrop?.reason);
      if (!reason) {
        if (localCodes.includes(code)) {
          missing.push(`${sentenceId}:${code}`);
          continue;
        }
        omitted.push({ pointCode: code, reason: "NO_UNIQUE_DISTRACTOR" });
        continue;
      }
      omitted.push({ pointCode: code, reason });
    }

    reports.push({
      sentenceId,
      detectedPointCodes: detectedCodes,
      mandatoryPointCodes: mandatory,
      generatedQuestionPointCodes: [...new Set(generated)],
      omittedPoints: omitted,
    });
  }
  return { reports, missing };
}

function mapDrop(reason: string | undefined): OmissionReason | null {
  if (!reason) return null;
  if (reason === "OVERLAPPING_SPAN") return "OVERLAP_WITH_HIGHER_PRIORITY";
  if (reason === "DUPLICATE_SUBTYPE") return "DUPLICATE_SUBTYPE";
  if (
    reason === "NO_UNIQUE_DISTRACTOR" ||
    reason === "BOTH_GRAMMATICAL" ||
    reason === "IMPLAUSIBLE_DISTRACTOR" ||
    reason === "AMBIGUOUS_TENSE"
  ) {
    return "NO_UNIQUE_DISTRACTOR";
  }
  if (reason === "SOURCE_SPAN_NOT_FOUND" || reason === "SOURCE_ANSWER_MISMATCH") {
    return "SOURCE_FORM_NOT_EDITABLE";
  }
  return "NOT_PEDAGOGICALLY_USEFUL";
}
