import { createHash } from "node:crypto";
import type {
  AnalysisGrammarPoint,
  AnalysisReportData,
} from "@/lib/lesson-materials/generate-analysis-report";
import { formatCheonilmunClassification } from "@/lib/lesson-materials/cheonilmun-basic-taxonomy";
import { findTargetInSentence } from "@/lib/lesson-materials/grammar-blueprint-sentences";
import type {
  GrammarBlueprintPoint,
  GrammarBlueprintSentence,
  GrammarContrastType,
  GrammarNoTestableReason,
  PassageSentenceSpan,
} from "@/lib/lesson-materials/grammar-blueprint-types";
import { inferContrastType } from "@/lib/lesson-materials/grammar-blueprint-contrast";
import { buildIncorrectForTarget } from "@/lib/lesson-materials/grammar-blueprint-contrast";
import { isBlockedLowQualityPair } from "@/lib/lesson-materials/grammar-choice-quality-block";

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
  return createHash("sha1").update(String(label)).digest("hex").slice(0, 12);
}

function importanceOf(g: AnalysisGrammarPoint): "high" | "medium" | "low" {
  const hay = `${g.title} ${g.category} ${bookTermOf(g)}`.toLowerCase();
  if (
    /관계|수동|능동|준동사|동명사|부정사|가주어|진주어|병렬|분사|가정|도치|간접|what|목적격보어|meant|made|allow|help/.test(
      hay
    )
  ) {
    return "high";
  }
  if (/시제|일치|접속|전치사|비교/.test(hay)) return "medium";
  return "low";
}

function pointId(
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

function buildPointFromReport(
  sentenceId: string,
  sentenceText: string,
  g: AnalysisGrammarPoint,
  index: number,
  sourceAnalysisPointId: string | null
): GrammarBlueprintPoint | null {
  const title = (g.title || g.category || "어법").trim();
  const targetRaw = (g.example || "").trim();
  const located = targetRaw
    ? findTargetInSentence(sentenceText, targetRaw)
    : null;
  const targetText = located?.text ?? targetRaw;
  const contrastType = inferContrastType(title, bookTermOf(g), targetText);
  const importance = importanceOf(g);
  const testWorthiness =
    importance === "high" ? 5 : importance === "medium" ? 4 : 2;

  let exclusionReason: GrammarBlueprintPoint["exclusionReason"] = "NONE";
  let convertibleToChoice = false;
  let conversionReason = "";

  if (!located || !targetText) {
    exclusionReason = "NO_EXACT_SOURCE_SPAN";
    conversionReason = "원문에서 분석 대상 표현을 찾지 못함";
  } else {
    const pair = buildIncorrectForTarget(
      located.text,
      contrastType,
      g.wrongForms?.[0]
    );
    if (!pair) {
      exclusionReason = "CANNOT_CREATE_MINIMAL_PAIR";
      conversionReason = "최소 쌍 오답을 만들지 못함";
    } else if (
      isBlockedLowQualityPair(pair.correctText, pair.incorrectText).blocked
    ) {
      exclusionReason = "TOO_TRIVIAL";
      conversionReason = "저품질 선택지 차단";
    } else if (testWorthiness < 4) {
      exclusionReason = "TOO_TRIVIAL";
      conversionReason = "시험 가치가 낮음";
    } else {
      convertibleToChoice = true;
      conversionReason = `contrastType=${contrastType}`;
    }
  }

  return {
    grammarPointId: pointId(sentenceId, title, targetText || targetRaw, index),
    sourceAnalysisPointId,
    targetText: targetText || targetRaw,
    targetStartCharIndex: located?.start ?? -1,
    targetEndCharIndex: located?.end ?? -1,
    grammarCategoryId: categoryIdOf(g),
    grammarCategoryName: g.category || title,
    bookTerm: bookTermOf(g),
    structure: g.sentenceStructure || g.detail || "",
    explanationKo: explanationOf(g),
    importance,
    testWorthiness,
    convertibleToChoice,
    conversionReason,
    exclusionReason,
    contrastType,
    analysisOrigin: "formal_report",
  };
}

export function blueprintSentencesFromFormalReport(input: {
  spans: PassageSentenceSpan[];
  report: AnalysisReportData;
  coveredSentenceIds: Set<string>;
}): GrammarBlueprintSentence[] {
  const byItem = new Map(
    input.report.sentences.map((s) => [s.itemId, s] as const)
  );

  return input.spans.map((span) => {
    if (!input.coveredSentenceIds.has(span.sentenceId)) {
      return emptyBlueprintSentence(span);
    }
    const rs =
      byItem.get(span.sentenceId) ||
      input.report.sentences.find(
        (s) =>
          s.enChunks.map((c) => c.text).join(" ").trim() === span.originalText
      );

    const points: GrammarBlueprintPoint[] = [];
    (rs?.grammarPoints ?? []).forEach((g, index) => {
      const p = buildPointFromReport(
        span.sentenceId,
        span.originalText,
        g,
        index,
        pointId(span.sentenceId, g.title || "", g.example || "", index)
      );
      if (p) points.push(p);
    });

    // important constructions for this sentence
    for (const c of input.report.importantConstructions ?? []) {
      if (c.itemId && c.itemId !== span.sentenceId) continue;
      if (
        !c.itemId &&
        c.originalSentence.trim() !== span.originalText
      ) {
        continue;
      }
      const fake: AnalysisGrammarPoint = {
        title: "중요 구문",
        detail: [c.structure, c.restoredElements, c.readingTip]
          .filter(Boolean)
          .join(" "),
        example: c.targetConstruction,
        bookTerms: [c.structure || "중요 구문"],
        sentenceStructure: c.structure,
      };
      const p = buildPointFromReport(
        span.sentenceId,
        span.originalText,
        fake,
        900 + points.length,
        null
      );
      if (p) {
        p.importance = "medium";
        p.testWorthiness = Math.max(p.testWorthiness, 3);
        points.push(p);
      }
    }

    const testable = points.filter((p) => p.convertibleToChoice);
    let noTestablePointReason: GrammarNoTestableReason = "NONE";
    if (points.length === 0) {
      noTestablePointReason = "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT";
    } else if (testable.length === 0) {
      noTestablePointReason = "ONLY_AMBIGUOUS_CONTRAST";
    }

    return {
      sentenceId: span.sentenceId,
      sentenceIndex: span.sentenceIndex,
      originalText: span.originalText,
      startCharIndex: span.startCharIndex,
      endCharIndex: span.endCharIndex,
      structureSummary:
        rs?.grammarPoints?.[0]?.sentenceStructure ||
        rs?.contextNote ||
        "",
      sentencePattern: rs?.grammarPoints?.[0]?.sentencePattern || "",
      hasGrammarPoints: points.length > 0,
      hasTestableGrammarPoint: testable.length > 0,
      noTestablePointReason,
      grammarPoints: points,
    };
  });
}

export function emptyBlueprintSentence(
  span: PassageSentenceSpan
): GrammarBlueprintSentence {
  return {
    sentenceId: span.sentenceId,
    sentenceIndex: span.sentenceIndex,
    originalText: span.originalText,
    startCharIndex: span.startCharIndex,
    endCharIndex: span.endCharIndex,
    structureSummary: "",
    sentencePattern: "",
    hasGrammarPoints: false,
    hasTestableGrammarPoint: false,
    noTestablePointReason: "SIMPLE_SENTENCE_NO_HIGH_VALUE_POINT",
    grammarPoints: [],
  };
}

export function hashBlueprintPoints(
  sentences: GrammarBlueprintSentence[]
): string {
  const payload = sentences
    .flatMap((s) =>
      s.grammarPoints.map(
        (p) =>
          `${s.sentenceId}|${p.grammarPointId}|${p.targetText}|${p.bookTerm}|${p.convertibleToChoice}`
      )
    )
    .sort()
    .join("\n");
  return createHash("sha256").update(payload || "empty").digest("hex").slice(0, 16);
}
