import { createHash } from "node:crypto";
import type {
  AnalysisGrammarPoint,
  AnalysisReportData,
} from "@/lib/lesson-materials/generate-analysis-report";
import { formatCheonilmunClassification } from "@/lib/lesson-materials/cheonilmun-basic-taxonomy";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";
import {
  findCharSpanInSource,
} from "@/lib/lesson-materials/grammar-choice-minimize";
import {
  surfacesEqual,
  normalizeGrammarSurface,
} from "@/lib/lesson-materials/grammar-choice-repair";

export type AnalysisPointImportance = "core" | "supporting";

export type ExtractedAnalysisPoint = {
  analysisPointId: string;
  sentenceId: string;
  sentenceText: string;
  title: string;
  categoryName: string;
  bookTerm: string;
  targetExpression: string;
  explanationKo: string;
  importance: AnalysisPointImportance;
  categoryId: string;
  /** Preferred incorrect forms from analysis report, if any */
  wrongForms: string[];
  wrongReasons: string[];
};

export type AnalysisExclusionReason =
  | "NONE"
  | "NO_EXACT_SOURCE_SPAN"
  | "BOTH_OPTIONS_POSSIBLE"
  | "LEXICAL_ONLY"
  | "CANNOT_CREATE_MINIMAL_PAIR"
  | "DUPLICATE_GRAMMAR_POINT"
  | "PUNCTUATION_ONLY"
  | "NOT_TEST_WORTHY";

function stablePointId(
  sentenceId: string,
  title: string,
  example: string,
  index: number
): string {
  return createHash("sha1")
    .update(`${sentenceId}|${title}|${example}|${index}`)
    .digest("hex")
    .slice(0, 16);
}

function bookTermOf(g: AnalysisGrammarPoint): string {
  return (
    g.bookTerms?.[0] ||
    g.primaryClassification?.unitTitle ||
    g.title ||
    g.category ||
    "어법"
  );
}

function explanationOf(g: AnalysisGrammarPoint): string {
  return (
    g.decisionRule ||
    g.detail ||
    g.sentenceStructure ||
    g.teacherExplanation ||
    g.studentSummary ||
    ""
  ).trim();
}

function categoryIdOf(g: AnalysisGrammarPoint): string {
  if (g.primaryClassification?.unitNumber != null) {
    return `cheonilmun-unit-${g.primaryClassification.unitNumber}`;
  }
  const label =
    g.classificationLabel ||
    (g.primaryClassification
      ? formatCheonilmunClassification(g.primaryClassification)
      : "") ||
    g.category ||
    g.title;
  return createHash("sha1").update(label).digest("hex").slice(0, 12);
}

/**
 * Flatten analysis_report_json grammar points into required conversion targets.
 * All report grammarPoints are treated as core (report already filters 모의고사급).
 * importantConstructions become supporting if not already covered.
 */
export function extractRequiredAnalysisPoints(input: {
  report: AnalysisReportData | null | undefined;
  sentences: Array<{ id: string; english: string }>;
}): ExtractedAnalysisPoint[] {
  const sentenceById = new Map(
    input.sentences.map((s) => [s.id, formatWorkbookPassage(s.english)] as const)
  );
  const out: ExtractedAnalysisPoint[] = [];
  const seenExpr = new Set<string>();

  const report = input.report;
  if (!report?.sentences?.length) return out;

  for (const s of report.sentences) {
    const sentenceId = s.itemId;
    const sentenceText =
      sentenceById.get(sentenceId) ||
      formatWorkbookPassage(s.enChunks.map((c) => c.text).join(" "));
    (s.grammarPoints ?? []).forEach((g, index) => {
      const title = (g.title || g.category || "어법").trim();
      const targetExpression = (g.example || "").trim();
      const id = stablePointId(sentenceId, title, targetExpression, index);
      const exprKey = normalizeGrammarSurface(
        `${sentenceId}|${targetExpression || title}`
      );
      if (seenExpr.has(exprKey)) return;
      seenExpr.add(exprKey);
      out.push({
        analysisPointId: id,
        sentenceId,
        sentenceText,
        title,
        categoryName: g.category || title,
        bookTerm: bookTermOf(g),
        targetExpression,
        explanationKo: explanationOf(g),
        importance: "core",
        categoryId: categoryIdOf(g),
        wrongForms: (g.wrongForms ?? [])
          .map((x) => String(x).trim())
          .filter(Boolean),
        wrongReasons: (g.wrongReasons ?? [])
          .map((x) => String(x).trim())
          .filter(Boolean),
      });
    });
  }

  for (const c of report.importantConstructions ?? []) {
    const sentenceId =
      c.itemId ||
      input.sentences.find((s) =>
        surfacesEqual(
          formatWorkbookPassage(s.english),
          formatWorkbookPassage(c.originalSentence)
        )
      )?.id ||
      "";
    if (!sentenceId) continue;
    const sentenceText =
      sentenceById.get(sentenceId) ||
      formatWorkbookPassage(c.originalSentence);
    const title = "중요 구문";
    const targetExpression = (c.targetConstruction || "").trim();
    const exprKey = normalizeGrammarSurface(
      `${sentenceId}|${targetExpression}`
    );
    if (!targetExpression || seenExpr.has(exprKey)) continue;
    seenExpr.add(exprKey);
    out.push({
      analysisPointId: stablePointId(
        sentenceId,
        title,
        targetExpression,
        900 + out.length
      ),
      sentenceId,
      sentenceText,
      title,
      categoryName: title,
      bookTerm: c.structure || title,
      targetExpression,
      explanationKo: [c.structure, c.restoredElements, c.readingTip]
        .filter(Boolean)
        .join(" "),
      importance: "supporting",
      categoryId: "important-construction",
      wrongForms: [],
      wrongReasons: [],
    });
  }

  return out;
}

export function computeGrammarAnalysisHash(
  points: ExtractedAnalysisPoint[]
): string {
  if (!points.length) return "no-analysis";
  const payload = points
    .map(
      (p) =>
        `${p.analysisPointId}|${p.sentenceId}|${p.title}|${p.targetExpression}|${p.bookTerm}`
    )
    .sort()
    .join("\n");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

/** Pre-check: can we locate a source span for this analysis point? */
export function locateAnalysisTargetSpan(
  point: ExtractedAnalysisPoint
): { start: number; end: number; text: string } | null {
  const needle = point.targetExpression.trim();
  if (!needle) return null;
  return (
    findCharSpanInSource(point.sentenceText, needle, 0) ||
    // try shorter last 1–4 tokens of expression
    (() => {
      const parts = needle.split(/\s+/).filter(Boolean);
      for (let n = Math.min(4, parts.length); n >= 1; n--) {
        const sub = parts.slice(-n).join(" ");
        const hit = findCharSpanInSource(point.sentenceText, sub, 0);
        if (hit) return hit;
      }
      return null;
    })()
  );
}

export function coreConvertibleReflection(input: {
  corePoints: ExtractedAnalysisPoint[];
  includedAnalysisPointIds: Set<string>;
  exclusions: Array<{ analysisPointId: string; reason: AnalysisExclusionReason }>;
}): { required: number; included: number; rate: number } {
  const requiredIds = new Set(input.corePoints.map((p) => p.analysisPointId));
  // Points excluded for legitimate non-convertible reasons don't count against 100%
  const legitExcluded = new Set(
    input.exclusions
      .filter((e) => e.reason !== "NONE")
      .map((e) => e.analysisPointId)
  );
  const mustInclude = [...requiredIds].filter((id) => !legitExcluded.has(id));
  // Actually user wants: among convertible core points, 100% reflection.
  // So rate = included / (included + convertible_but_missing)
  // For display: includedConvertible / totalConvertibleWhereConvertibleTrue
  const included = mustInclude.filter((id) =>
    input.includedAnalysisPointIds.has(id)
  ).length;
  const required = mustInclude.length;
  return {
    required,
    included,
    rate: required === 0 ? 1 : included / required,
  };
}
