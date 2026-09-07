import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type {
  AnalysisCompleteness,
  PassageSentenceSpan,
} from "@/lib/lesson-materials/grammar-blueprint-types";

/**
 * COMPLETE: every passage sentence has ≥1 grammarPoints (or explicit empty with analysis present for that itemId)
 * PARTIAL: some sentences have report coverage, some missing
 * NONE: no usable report sentences
 */
export function assessAnalysisCompleteness(input: {
  spans: PassageSentenceSpan[];
  report: AnalysisReportData | null | undefined;
}): {
  completeness: AnalysisCompleteness;
  coveredSentenceIds: Set<string>;
  missingSentenceIds: string[];
} {
  const spans = input.spans;
  const report = input.report;
  if (!report?.sentences?.length) {
    return {
      completeness: "NONE",
      coveredSentenceIds: new Set(),
      missingSentenceIds: spans.map((s) => s.sentenceId),
    };
  }

  const covered = new Set<string>();
  for (const s of report.sentences) {
    const id = s.itemId;
    if (!id) continue;
    // Covered if the sentence appears in the report (even with 0 grammar points —
    // empty means analyzed-as-simple)
    covered.add(id);
  }

  // Also match by exact text if itemId drifted
  for (const span of spans) {
    if (covered.has(span.sentenceId)) continue;
    const hit = report.sentences.find((rs) => {
      const text = rs.enChunks.map((c) => c.text).join(" ").trim();
      return text === span.originalText;
    });
    if (hit) covered.add(span.sentenceId);
  }

  const missing = spans
    .map((s) => s.sentenceId)
    .filter((id) => !covered.has(id));

  if (missing.length === 0 && covered.size > 0) {
    return {
      completeness: "COMPLETE",
      coveredSentenceIds: covered,
      missingSentenceIds: [],
    };
  }
  if (covered.size === 0) {
    return {
      completeness: "NONE",
      coveredSentenceIds: covered,
      missingSentenceIds: spans.map((s) => s.sentenceId),
    };
  }
  return {
    completeness: "PARTIAL",
    coveredSentenceIds: covered,
    missingSentenceIds: missing,
  };
}
