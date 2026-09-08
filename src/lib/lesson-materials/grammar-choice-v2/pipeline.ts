import { rankCandidates } from "@/lib/lesson-materials/grammar-choice-v2/candidate-ranker";
import { buildCoverage } from "@/lib/lesson-materials/grammar-choice-v2/coverage";
import { explainChoice } from "@/lib/lesson-materials/grammar-choice-v2/explanation-templates";
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
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
import { resolveSpan } from "@/lib/lesson-materials/grammar-choice-v2/span-resolver";
import type {
  AuditResult,
  DetectedGrammarPoint,
  ExactSentence,
  GrammarCandidate,
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
  const resolved: ResolvedCandidate[] = [];
  const rejected: V2Reject[] = [];
  const seenPair = new Set<string>();

  for (const raw of input.candidates) {
    const candidate = repairForbiddenConditionalDistractor(raw);
    const sentence = byId.get(candidate.sentenceId);
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
    const local = rejectCandidate({ candidate, sentence });
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
        reason: "DUPLICATE_EXACT_PAIR",
        pair,
      });
      continue;
    }
    seenPair.add(exactPair);
    const def = ontologyPoint(candidate.pointCode);
    resolved.push({
      ...candidate,
      priority: def?.priority ?? candidate.priority,
      passageStart: span.passageStart,
      passageEnd: span.passageEnd,
      subtypeKey: subtypeKey(
        candidate.pointCode,
        candidate.correctAnswer,
        candidate.distractors[0] ?? ""
      ),
    });
  }
  return { resolved, rejected };
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
} {
  const filtered = resolveAndFilter({
    sentences: input.sentences,
    candidates: input.candidates,
  });
  const audited = applyAudits(filtered.resolved, input.audits);
  const ranked = rankCandidates(audited.kept);
  const rejected: V2Reject[] = [
    ...filtered.rejected,
    ...audited.rejected,
    ...ranked.dropped.map((d) => ({
      candidateId: d.item.candidateId,
      sentenceId: d.item.sentenceId,
      pointCode: d.item.pointCode,
      reason: d.reason,
      pair: `${d.item.correctAnswer} / ${d.item.distractors[0] ?? ""}`,
    })),
  ];

  const localMandatory = scanLocalMandatory(input.sentences);
  const coverage = buildCoverage({
    sentenceIds: input.sentences.map((s) => s.sentenceId),
    detected: input.detected,
    localMandatory,
    approved: ranked.kept,
    droppedReasons: rejected.map((r) => ({
      sentenceId: r.sentenceId,
      pointCode: r.pointCode,
      reason: r.reason,
    })),
  });
  if (coverage.missing.length > 0) {
    return {
      ok: false,
      rejected,
      missingMandatory: coverage.missing,
      reason: `MISSING_MANDATORY_GRAMMAR_POINT: ${coverage.missing.join(", ")}`,
    };
  }

  const sides = assignSeededSides(ranked.kept, input.seedKey);
  const numbered = ranked.kept.map((item, i) => ({
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
  if (restored !== input.originalPassage) {
    return {
      ok: false,
      rejected,
      missingMandatory: [],
      reason: "원문 복원 실패",
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
    };
  }

  const rejectReasonCounts: Record<string, number> = {};
  for (const r of rejected) {
    rejectReasonCounts[r.reason] = (rejectReasonCounts[r.reason] ?? 0) + 1;
  }
  const mix = { BASIC: 0, CORE: 0, ADVANCED: 0 };
  for (const item of numbered) mix[item.difficulty] += 1;

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
    reviewAcceptedCount: ranked.kept.length,
    finalCount: items.length,
    finalQuestionCount: items.length,
    renderedQuestionCount: items.length,
    newQuestionCount: items.length,
    grammarCategoryCount: new Set(items.map((i) => i.grammarCategoryId)).size,
    passageRestored: true,
    countMismatch: false,
    difficultyMix: mix,
    rejectReasonCounts,
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
    return { ok: false, rejected, missingMandatory: [], reason: "개수 불일치" };
  }

  return { ok: true, section, rejected, missingMandatory: [] };
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
