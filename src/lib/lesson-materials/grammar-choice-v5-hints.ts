import { createHash } from "node:crypto";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type { AnalysisHint } from "@/lib/lesson-materials/grammar-choice-v5-types";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

export function buildAnalysisHints(
  report: AnalysisReportData | null | undefined,
  sentences: Array<{ id: string; english: string }>
): AnalysisHint[] {
  if (!report?.sentences?.length) return [];
  const idSet = new Set(sentences.map((s) => s.id));
  const out: AnalysisHint[] = [];

  for (const s of report.sentences) {
    const sentenceId = s.itemId;
    if (!sentenceId || !idSet.has(sentenceId)) continue;
    for (const g of s.grammarPoints ?? []) {
      const grammarName = (g.title || g.category || "").trim();
      if (!grammarName) continue;
      const explanationKo = (
        g.decisionRule ||
        g.detail ||
        g.sentenceStructure ||
        g.teacherExplanation ||
        ""
      ).trim();
      const quoted = (g.example || "").trim() || null;
      const hay = `${grammarName} ${explanationKo}`.toLowerCase();
      const importance: AnalysisHint["importance"] =
        /관계|수동|능동|준동사|동명사|부정사|가주어|진주어|병렬|분사|간접|what|meant|made|allow|help|목적격보어/.test(
          hay
        )
          ? "high"
          : /시제|일치|접속|전치사|비교|가정|도치/.test(hay)
            ? "medium"
            : "low";
      out.push({
        sentenceId,
        grammarName,
        explanationKo,
        quotedExpression: quoted,
        importance,
      });
    }
  }
  return out;
}

export function hashAnalysisHints(hints: AnalysisHint[]): string {
  if (!hints.length) return "no-hints";
  const payload = hints
    .map(
      (h) =>
        `${h.sentenceId}|${h.grammarName}|${h.quotedExpression ?? ""}|${h.importance}`
    )
    .sort()
    .join("\n");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function desiredCandidateCount(finalTargetMax: number): number {
  return computeCandidateBudget(finalTargetMax, 1);
}

function clampCount(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Target student items. Not a license to pad with invalid questions. */
export function computeDesiredQuestionCount(englishWordCount: number): number {
  if (englishWordCount < 80) return 8;
  return clampCount(Math.round(englishWordCount / 9), 12, 20);
}

export function computeCandidateBudget(
  desiredCount: number,
  sentenceCount: number
): number {
  return Math.min(
    Math.max(desiredCount * 4, Math.max(1, sentenceCount) * 3),
    72
  );
}

export function computeTopUpCandidateBudget(missingCount: number): number {
  return Math.max(missingCount * 4, 12);
}

/** Independent non-overlapping points may all be used. Word count is not a quota. */
export function maxQuestionsForSentence(_wordCount: number): number {
  return 6;
}

export function getGrammarChoiceFinalTargetRange(englishWordCount: number): {
  min: number;
  max: number;
} {
  const desired = computeDesiredQuestionCount(englishWordCount);
  return { min: desired, max: desired };
}

export function formatSentencesForGrammarChoice(
  sentences: Array<{ id: string; english: string }>
): Array<{ id: string; english: string }> {
  return sentences.map((s) => ({
    id: s.id,
    english: formatWorkbookPassage(s.english),
  }));
}
