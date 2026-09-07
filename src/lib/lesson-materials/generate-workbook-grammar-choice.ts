import {
  ensureGrammarBlueprint,
} from "@/lib/lesson-materials/ensure-grammar-blueprint";
import type { StoredGrammarBlueprintCache } from "@/lib/lesson-materials/grammar-blueprint-cache";
import {
  convertBlueprintPointToCandidate,
  isMustIncludeBlueprintPoint,
} from "@/lib/lesson-materials/grammar-blueprint-to-choice";
import {
  getCachedGrammarChoiceCandidates,
  hashEnglishLines,
  upsertGrammarChoiceCache,
  type StoredGrammarChoiceCache,
  type StoredGrammarChoiceCacheRow,
} from "@/lib/lesson-materials/grammar-choice-cache";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "@/lib/lesson-materials/grammar-choice-constants";
import { isBlockedLowQualityPair } from "@/lib/lesson-materials/grammar-choice-quality-block";
import { validateAndFilterCandidates } from "@/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "@/lib/lesson-materials/grammar-choice-select";
import {
  buildGrammarChoiceItems,
  buildPassageSegmentsFromSource,
} from "@/lib/lesson-materials/grammar-choice-display";
import { repairCandidateAgainstPassage } from "@/lib/lesson-materials/grammar-choice-repair";
import { minimizeAndRelocateCandidate } from "@/lib/lesson-materials/grammar-choice-minimize";
import {
  countEnglishWords,
  formatWorkbookPassage,
  getGrammarChoiceTargetRange,
  type GrammarChoiceCandidate,
  type WorkbookGenerationTiming,
  type WorkbookGrammarChoiceDiagnostics,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
} from "@/lib/lesson-materials/workbook-types";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";

function finalizeCandidate(
  c: GrammarChoiceCandidate,
  sentenceRows: Array<{ id: string; english: string }>
): GrammarChoiceCandidate | null {
  const blocked = isBlockedLowQualityPair(c.correctText, c.incorrectText);
  if (blocked.blocked) return null;
  const repaired = repairCandidateAgainstPassage(c, sentenceRows);
  if (!repaired) return null;
  const eng = sentenceRows.find((s) => s.id === repaired.sentenceId)?.english;
  if (!eng) return null;
  const minimized = minimizeAndRelocateCandidate(repaired, eng);
  if (!minimized) return null;
  if (isBlockedLowQualityPair(minimized.correctText, minimized.incorrectText).blocked) {
    return null;
  }
  return {
    ...minimized,
    sourceType: c.sourceType,
    analysisPointId: c.analysisPointId ?? null,
    grammarCategoryName: c.grammarCategoryName || minimized.grammarCategoryName,
    bookTerm: c.bookTerm || minimized.bookTerm,
    explanationKo: c.explanationKo || minimized.explanationKo,
    incorrectReasonKo: c.incorrectReasonKo || minimized.incorrectReasonKo,
    learningValue: c.learningValue,
    difficulty: c.difficulty,
  };
}

function mergeUnique(
  base: GrammarChoiceCandidate[],
  extra: GrammarChoiceCandidate[]
): GrammarChoiceCandidate[] {
  const out = [...base];
  const occupied = base.map((c) => ({
    sentenceId: c.sentenceId,
    start: c.startTokenIndex,
    end: c.endTokenIndex,
  }));
  for (const c of extra) {
    const overlaps = occupied.some(
      (o) =>
        o.sentenceId === c.sentenceId &&
        !(c.endTokenIndex < o.start || c.startTokenIndex > o.end)
    );
    if (overlaps) continue;
    out.push(c);
    occupied.push({
      sentenceId: c.sentenceId,
      start: c.startTokenIndex,
      end: c.endTokenIndex,
    });
  }
  return out;
}

export async function generateWorkbookGrammarChoice(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string }>;
    analysisReport?: AnalysisReportData | null;
    grammarChoiceCache?: StoredGrammarChoiceCache | null;
    grammarBlueprintCache?: StoredGrammarBlueprintCache | null;
  }>;
}): Promise<{
  sections: WorkbookGrammarChoiceSection[];
  skipped: WorkbookGrammarChoiceSkip[];
  cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceCache;
    blueprintCache?: StoredGrammarBlueprintCache;
  }>;
  timing: WorkbookGenerationTiming;
}> {
  const t0 = Date.now();
  const sections: WorkbookGrammarChoiceSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  const cachesToSave: Array<{
    projectId: string;
    cache: StoredGrammarChoiceCache;
    blueprintCache?: StoredGrammarBlueprintCache;
  }> = [];
  let totalOpenAi = 0;

  for (const p of input.passages) {
    const sentenceRows = p.sentences.map((s) => ({
      id: s.id,
      english: formatWorkbookPassage(s.english),
    }));
    const sourceHash = hashEnglishLines(sentenceRows.map((s) => s.english));

    let openAiRequestCount = 0;
    let modelUsed: string | null = null;
    let blueprintCacheHit = false;

    const ensured = await ensureGrammarBlueprint({
      passageId: p.projectId,
      sentences: sentenceRows,
      analysisReport: p.analysisReport,
      blueprintCache: p.grammarBlueprintCache,
    });
    openAiRequestCount += ensured.openAiRequestCount;
    totalOpenAi += ensured.openAiRequestCount;
    modelUsed = ensured.modelUsed;
    blueprintCacheHit = ensured.cacheHit;
    const { blueprint, sourcePassage } = ensured;

    // Choice cache keyed by blueprint hash
    const cachedChoices = getCachedGrammarChoiceCandidates(
      p.grammarChoiceCache,
      p.projectId,
      sourceHash,
      blueprint.fullAnalysisHash
    );

    const sentenceMap = new Map(
      sentenceRows.map((s) => [s.id, s.english] as const)
    );

    let originalMismatchCount = 0;
    let bothPossibleCount = 0;
    let lexicalExcludedCount = 0;
    let lowQualityExcludedCount = 0;
    let overlapExcludedCount = 0;
    const exclusions: WorkbookGrammarChoiceDiagnostics["exclusions"] = [];
    const sentencesWithoutChoices: WorkbookGrammarChoiceDiagnostics["sentencesWithoutChoices"] =
      [];

    let accepted: GrammarChoiceCandidate[] = [];
    let choiceCacheHit = false;

    if (cachedChoices) {
      accepted = cachedChoices;
      choiceCacheHit = true;
    } else {
      const must: GrammarChoiceCandidate[] = [];
      const optional: GrammarChoiceCandidate[] = [];

      for (const s of blueprint.sentences) {
        let produced = 0;
        for (const gp of s.grammarPoints) {
          if (!gp.convertibleToChoice || gp.exclusionReason !== "NONE") {
            exclusions.push({
              analysisPointId: gp.grammarPointId,
              reason: gp.exclusionReason,
              title: gp.bookTerm || gp.grammarCategoryName,
            });
            if (gp.exclusionReason === "BOTH_OPTIONS_POSSIBLE") {
              bothPossibleCount += 1;
            }
            if (
              gp.exclusionReason === "LEXICAL_ONLY" ||
              gp.exclusionReason === "SPELLING_ONLY"
            ) {
              lexicalExcludedCount += 1;
            }
            continue;
          }

          const cand = convertBlueprintPointToCandidate({
            passageId: p.projectId,
            sentenceId: s.sentenceId,
            sentenceText: s.originalText,
            point: gp,
          });
          if (!cand) {
            exclusions.push({
              analysisPointId: gp.grammarPointId,
              reason: "CANNOT_CREATE_MINIMAL_PAIR",
              title: gp.bookTerm || gp.grammarCategoryName,
            });
            lowQualityExcludedCount += 1;
            continue;
          }
          const finalized = finalizeCandidate(cand, sentenceRows);
          if (!finalized) {
            originalMismatchCount += 1;
            exclusions.push({
              analysisPointId: gp.grammarPointId,
              reason: "NO_EXACT_SOURCE_SPAN",
              title: gp.bookTerm || gp.grammarCategoryName,
            });
            continue;
          }
          if (isMustIncludeBlueprintPoint(gp)) {
            must.push(finalized);
          } else if (gp.testWorthiness >= 4) {
            optional.push(finalized);
          } else {
            exclusions.push({
              analysisPointId: gp.grammarPointId,
              reason: "TOO_TRIVIAL",
              title: gp.bookTerm || gp.grammarCategoryName,
            });
            continue;
          }
          produced += 1;
        }
        if (produced === 0) {
          sentencesWithoutChoices.push({
            sentenceId: s.sentenceId,
            reason: s.noTestablePointReason,
            preview: s.originalText.slice(0, 80),
          });
        }
      }

      const { accepted: mustOk, rejected: mustRej } =
        validateAndFilterCandidates(must, sentenceMap);
      const { accepted: optOk, rejected: optRej } =
        validateAndFilterCandidates(optional, sentenceMap);

      for (const r of [...mustRej, ...optRej]) {
        if (r.reason === "ambiguous_pair") bothPossibleCount += 1;
        if (r.reason === "vocab_collocation") lexicalExcludedCount += 1;
        if (r.reason === "overlap") overlapExcludedCount += 1;
        if (
          r.reason === "original_mismatch" ||
          r.reason === "restore_failed" ||
          r.reason === "correct_not_original"
        ) {
          originalMismatchCount += 1;
        }
      }

      accepted = mergeUnique(mustOk, optOk);
    }

    const range = getGrammarChoiceTargetRange(
      countEnglishWords(sourcePassage)
    );
    // Must-include analysis points never dropped; softMax only limits optional
    const mustFinal = accepted.filter(
      (c) => c.sourceType === "analysis_required" || c.learningValue >= 5
    );
    const rest = accepted.filter((c) => !mustFinal.includes(c));
    const selectedRest = selectFinalGrammarChoices(
      [...mustFinal, ...rest],
      Math.max(range.max, mustFinal.length)
    );
    const mergedSelected = mergeUnique(mustFinal, selectedRest);

    const orderIndex = new Map(sentenceRows.map((s, i) => [s.id, i]));
    mergedSelected.sort((a, b) => {
      const oa = orderIndex.get(a.sentenceId) ?? 0;
      const ob = orderIndex.get(b.sentenceId) ?? 0;
      if (oa !== ob) return oa - ob;
      return a.startTokenIndex - b.startTokenIndex;
    });

    if (mergedSelected.length === 0) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: "검증을 통과한 어법 선택 후보가 없습니다.",
      });
      continue;
    }

    if (!choiceCacheHit && accepted.length > 0) {
      const row: StoredGrammarChoiceCacheRow = {
        passageId: p.projectId,
        sourceHash,
        grammarAnalysisVersion: blueprint.fullAnalysisHash,
        grammarChoicePromptVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
        candidates: accepted,
        createdAt: new Date().toISOString(),
      };
      cachesToSave.push({
        projectId: p.projectId,
        cache: upsertGrammarChoiceCache(p.grammarChoiceCache, row),
        blueprintCache: ensured.cacheToSave ?? undefined,
      });
    } else if (ensured.cacheToSave) {
      cachesToSave.push({
        projectId: p.projectId,
        cache: p.grammarChoiceCache ?? {
          algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
          byPassageId: {},
        },
        blueprintCache: ensured.cacheToSave,
      });
    }

    const seedKey = `${p.projectId}|${sourceHash}|${GRAMMAR_CHOICE_PROMPT_VERSION}|${blueprint.fullAnalysisHash}`;
    const items = buildGrammarChoiceItems(
      mergedSelected,
      seedKey,
      sourcePassage,
      sentenceRows.map((s) => s.id)
    );
    if (!items) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: "원문 문자 위치 검증에 실패했습니다.",
      });
      continue;
    }
    for (let i = 0; i < items.length; i++) {
      const src = mergedSelected[i]!;
      const bpSentence = blueprint.sentences.find(
        (s) => s.sentenceId === src.sentenceId
      );
      const bpPoint = bpSentence?.grammarPoints.find(
        (gp) =>
          gp.grammarPointId === src.analysisPointId ||
          gp.sourceAnalysisPointId === src.analysisPointId
      );
      items[i] = {
        ...items[i]!,
        sourceType: src.sourceType,
        analysisPointId: src.analysisPointId ?? null,
        bookTerm: src.bookTerm || items[i]!.bookTerm,
        grammarCategoryName:
          src.grammarCategoryName || items[i]!.grammarCategoryName,
        explanationKo: src.explanationKo || items[i]!.explanationKo,
        incorrectReasonKo:
          src.incorrectReasonKo || items[i]!.incorrectReasonKo,
        structureSummary: bpPoint?.structure || bpSentence?.structureSummary || "",
        analysisOriginLabel:
          bpPoint?.analysisOrigin === "formal_report"
            ? "정식 지문 분석"
            : bpPoint?.analysisOrigin === "internal_ai"
              ? "내부 간이 분석"
              : src.sourceType === "analysis_required"
                ? "정식 지문 분석"
                : "내부 간이 분석",
      };
    }

    const segments = buildPassageSegmentsFromSource(sourcePassage, items);
    if (!segments) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: "원문 슬라이스 렌더링 검증에 실패했습니다.",
      });
      continue;
    }

    let rebuilt = "";
    for (const seg of segments) {
      if (seg.type === "text") rebuilt += seg.text;
      else {
        const it = items.find((x) => x.number === seg.number)!;
        rebuilt += it.correctText;
      }
    }
    const passageRestored = rebuilt === sourcePassage;

    const allPoints = blueprint.sentences.flatMap((s) => s.grammarPoints);
    const corePoints = allPoints.filter(
      (gp) => gp.importance === "high" && gp.testWorthiness >= 4
    );
    const convertibleCore = corePoints.filter(
      (gp) => gp.convertibleToChoice && gp.exclusionReason === "NONE"
    );
    const includedIds = new Set(
      items.map((i) => i.analysisPointId).filter((x): x is string => !!x)
    );
    const coreIncluded = convertibleCore.filter(
      (gp) =>
        includedIds.has(gp.grammarPointId) ||
        includedIds.has(gp.sourceAnalysisPointId ?? "")
    ).length;
    // Points that were convertible in blueprint but failed late validation
    // are recorded in exclusions — treat those as non-convertible for rate.
    const lateFailed = new Set(
      exclusions
        .filter((e) =>
          [
            "CANNOT_CREATE_MINIMAL_PAIR",
            "NO_EXACT_SOURCE_SPAN",
            "TOO_TRIVIAL",
            "OVERLAPPING_WITH_HIGHER_PRIORITY",
          ].includes(e.reason)
        )
        .map((e) => e.analysisPointId)
    );
    const convertibleCoreEffective = convertibleCore.filter(
      (gp) =>
        !lateFailed.has(gp.grammarPointId) ||
        includedIds.has(gp.grammarPointId) ||
        includedIds.has(gp.sourceAnalysisPointId ?? "")
    );
    const coreIncludedEffective = convertibleCoreEffective.filter(
      (gp) =>
        includedIds.has(gp.grammarPointId) ||
        includedIds.has(gp.sourceAnalysisPointId ?? "")
    ).length;
    const coreReflectionRate =
      convertibleCoreEffective.length === 0
        ? 1
        : coreIncludedEffective / convertibleCoreEffective.length;

    const formalCount = allPoints.filter(
      (gp) => gp.analysisOrigin === "formal_report"
    ).length;
    const internalCount = allPoints.filter(
      (gp) => gp.analysisOrigin === "internal_ai"
    ).length;

    const diagnostics: WorkbookGrammarChoiceDiagnostics = {
      sentenceCount: blueprint.sentenceCount,
      analyzedSentenceCount: blueprint.analyzedSentenceCount,
      sentenceAnalysisRate:
        blueprint.sentenceCount === 0
          ? 1
          : blueprint.analyzedSentenceCount / blueprint.sentenceCount,
      formalAnalysisPointCount: formalCount,
      internalSupplementPointCount: internalCount,
      analysisPointCount: allPoints.length,
      corePointCount: corePoints.length,
      convertibleCount: allPoints.filter((gp) => gp.convertibleToChoice).length,
      analysisBasedCount: items.filter((i) => i.sourceType === "analysis_required")
        .length,
      aiSupplementCount: items.filter((i) => i.sourceType !== "analysis_required")
        .length,
      finalCount: items.length,
      coreReflectionRate,
      sentencesWithoutChoices,
      exclusions,
      originalMismatchCount,
      bothPossibleCount,
      lexicalExcludedCount,
      overlapExcludedCount,
      lowQualityExcludedCount,
      passageRestored,
      cacheHit: choiceCacheHit,
      blueprintCacheHit,
      analysisCompleteness: blueprint.completeness,
      analysisSource: blueprint.analysisSource,
      openAiRequestCount,
      modelUsed,
    };

    console.info("[workbook-grammar-choice]", {
      title: p.title,
      diagnostics,
    });

    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source,
      sourcePassage,
      segments,
      items,
      algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
      diagnostics,
    });
  }

  return {
    sections,
    skipped,
    cachesToSave,
    timing: {
      dataLoadMs: 0,
      translationLookupMs: 0,
      blankSelectionMs: Date.now() - t0,
      pdfRenderMs: 0,
      totalMs: Date.now() - t0,
      openAiRequestCount: totalOpenAi,
    },
  };
}
