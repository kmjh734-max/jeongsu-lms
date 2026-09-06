import {
  conflictsWithNearSynonym,
  type BlankGrade,
} from "@/lib/lesson-materials/blank-concept-score";
import type {
  BlankCandidateDiagnostic,
  BlankRejectionCode,
  BlankSelectionStats,
} from "@/lib/lesson-materials/blank-selection-diagnostics";
import { printBlankSelectionDiagnostics } from "@/lib/lesson-materials/blank-selection-diagnostics";
import type { ValidatedBlankCandidate } from "@/lib/lesson-materials/validate-workbook-blank";
import {
  getMaxBlanksForSentence,
  type BlankDensity,
} from "@/lib/lesson-materials/workbook-types";

function candidatePosKey(c: { sentenceId: string; start: number }): string {
  return `${c.sentenceId}:${c.start}`;
}

function sortPassageOrder(
  list: ValidatedBlankCandidate[],
  sentenceOrder?: string[]
): ValidatedBlankCandidate[] {
  return [...list].sort((a, b) => {
    if (a.sentenceId !== b.sentenceId) {
      if (sentenceOrder) {
        const ia = sentenceOrder.indexOf(a.sentenceId);
        const ib = sentenceOrder.indexOf(b.sentenceId);
        if (ia >= 0 && ib >= 0 && ia !== ib) return ia - ib;
      }
      return a.sentenceId.localeCompare(b.sentenceId, undefined, {
        numeric: true,
      });
    }
    return a.start - b.start;
  });
}

function gradeRank(g: BlankGrade): number {
  if (g === "A") return 0;
  if (g === "B") return 1;
  return 2;
}

export type SelectBlankResult = {
  selected: ValidatedBlankCandidate[];
  shortfallReason: string | null;
  diagnostics: BlankCandidateDiagnostic[];
  stats: BlankSelectionStats;
};

/**
 * v5 selection: A → B → (C only to meet targetMin).
 * Phrase swap + word-family dedupe + diagnostics.
 */
export function selectBlankCandidates(
  valid: ValidatedBlankCandidate[],
  recommendedCount: number,
  options?: {
    density?: BlankDensity;
    sentenceWordCounts?: Map<string, number>;
    coreSentenceIds?: string[];
    sentenceOrder?: string[];
    mustInclude?: ValidatedBlankCandidate[];
    targetMin?: number;
    targetMax?: number;
    passageId?: string;
    totalWordCount?: number;
    sourceCounts?: {
      ai: number;
      vocab: number;
      fallback: number;
      merged: number;
    };
    logDiagnostics?: boolean;
  }
): SelectBlankResult {
  const density = options?.density ?? "standard";
  const targetMax = options?.targetMax ?? recommendedCount;
  const targetMin = options?.targetMin ?? Math.max(1, Math.min(recommendedCount, targetMax));
  const target = Math.min(targetMax, Math.max(targetMin, recommendedCount));
  const minGapPreferred = density === "high" ? 2 : 3;
  const coreSet = new Set(options?.coreSentenceIds ?? []);
  const passageId = options?.passageId ?? "passage";

  const poolAb = valid.filter(
    (c) => c.eligible && (c.grade === "A" || c.grade === "B")
  );
  const poolC = valid.filter((c) => c.eligible && c.grade === "C");
  const poolAll = [...poolAb, ...poolC];

  const sortKey = (a: ValidatedBlankCandidate, b: ValidatedBlankCandidate) => {
    const gr = gradeRank(a.grade) - gradeRank(b.grade);
    if (gr !== 0) return gr;
    const sa = a.sources?.some((s) => s === "ai" || s === "saved-vocabulary")
      ? 0
      : 1;
    const sb = b.sources?.some((s) => s === "ai" || s === "saved-vocabulary")
      ? 0
      : 1;
    if (sa !== sb) return sa - sb;
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.globalWordIndex - b.globalWordIndex;
  };

  const diagMap = new Map<string, BlankCandidateDiagnostic>();
  const ensureDiag = (c: ValidatedBlankCandidate): BlankCandidateDiagnostic => {
    const key = candidatePosKey(c);
    let d = diagMap.get(key);
    if (!d) {
      d = {
        sentenceId: c.sentenceId,
        token: c.answerText,
        lemma: c.lemma,
        wordFamily: c.wordFamily,
        tokenStartIndex: c.start,
        tokenEndIndex: c.end,
        sources: c.sources ?? ["ai"],
        grade: c.grade,
        centrality: c.scores.centrality,
        learningValue: c.scores.learningValue,
        contextImportance: c.scores.contextImportance,
        examUsefulness: c.scores.examUsefulness,
        collocationValue: c.scores.collocationValue,
        commonnessPenalty: c.scores.commonnessPenalty,
        redundancyPenalty: c.scores.redundancyPenalty,
        finalScore: c.finalScore,
        competitionGroup: c.competitionGroup ?? undefined,
        selected: false,
        decisionReason: "아직 검토되지 않음",
        rejectionCodes: [],
      };
      diagMap.set(key, d);
    }
    return d;
  };
  for (const c of valid) ensureDiag(c);

  const markReject = (
    c: ValidatedBlankCandidate,
    reason: string,
    codes: BlankRejectionCode[]
  ) => {
    const d = ensureDiag(c);
    if (d.selected) return;
    d.decisionReason = reason;
    d.rejectionCodes = Array.from(new Set([...d.rejectionCodes, ...codes]));
  };

  const picked: ValidatedBlankCandidate[] = [];
  const usedFamilies = new Map<string, number>();
  const usedCompetition = new Set<string>();
  const usedLemmas = new Map<string, number>();
  const perSentence = new Map<string, number>();
  let hitSentenceCap = false;
  let hitGapCap = false;

  const maxFor = (sentenceId: string) =>
    getMaxBlanksForSentence(
      options?.sentenceWordCounts?.get(sentenceId) ?? 20,
      density
    );

  const alreadyPicked = (c: ValidatedBlankCandidate) =>
    picked.some((p) => candidatePosKey(p) === candidatePosKey(c));

  const higherNeighborUnpicked = (
    c: ValidatedBlankCandidate,
    pool: ValidatedBlankCandidate[]
  ): ValidatedBlankCandidate | null => {
    let best: ValidatedBlankCandidate | null = null;
    for (const d of pool) {
      if (candidatePosKey(d) === candidatePosKey(c)) continue;
      if (alreadyPicked(d)) continue;
      if (d.finalScore <= c.finalScore) continue;
      const samePhrase =
        Boolean(c.competitionGroup) &&
        c.competitionGroup === d.competitionGroup;
      const adjacent =
        d.sentenceId === c.sentenceId &&
        Math.abs(d.wordIndex - c.wordIndex) === 1;
      if (!(samePhrase || adjacent)) continue;
      if (!best || d.finalScore > best.finalScore) best = d;
    }
    return best;
  };

  const conflictCode = (
    c: ValidatedBlankCandidate,
    minGap: number,
    pool: ValidatedBlankCandidate[],
    allowFamilyDup: boolean
  ): {
    code: BlankRejectionCode | null;
    better?: ValidatedBlankCandidate;
    swapKeeper?: ValidatedBlankCandidate;
  } => {
    const better = higherNeighborUnpicked(c, pool);
    if (better) return { code: "BETTER_CANDIDATE_IN_PHRASE", better };
    const lemmaCount = usedLemmas.get(c.lemma) ?? 0;
    if (lemmaCount >= 1) return { code: "REPEATED_OCCURRENCE" };
    const famCount = usedFamilies.get(c.wordFamily) ?? 0;
    if (famCount >= 1 && !allowFamilyDup) {
      const keeper = picked.find((p) => p.wordFamily === c.wordFamily);
      if (
        keeper &&
        (c.finalScore > keeper.finalScore + 2 ||
          ((c.semanticRole === "main_claim" || c.semanticRole === "theme") &&
            keeper.semanticRole !== "main_claim" &&
            keeper.semanticRole !== "theme"))
      ) {
        return { code: "WORD_FAMILY_DUPLICATE", swapKeeper: keeper };
      }
      // Prefer main_claim keeper: do not let weaker form replace
      return { code: "WORD_FAMILY_DUPLICATE" };
    }
    if (famCount >= 2) return { code: "WORD_FAMILY_DUPLICATE" };
    if (c.competitionGroup && usedCompetition.has(c.competitionGroup)) {
      return { code: "PARALLEL_LIST_DUPLICATE" };
    }
    if ((perSentence.get(c.sentenceId) ?? 0) >= maxFor(c.sentenceId)) {
      return { code: "SENTENCE_CAP" };
    }
    for (const p of picked) {
      if (conflictsWithNearSynonym(c, p)) {
        return { code: "SEMANTIC_DUPLICATE" };
      }
      const dist = Math.abs(p.globalWordIndex - c.globalWordIndex);
      if (dist < 2) return { code: "ADJACENT_GAP" };
      if (dist < minGap) return { code: "ADJACENT_GAP" };
      if (
        p.sentenceId === c.sentenceId &&
        Math.abs(p.wordIndex - c.wordIndex) <= 1
      ) {
        return { code: "ADJACENT_GAP" };
      }
    }
    return { code: null };
  };

  const removePicked = (c: ValidatedBlankCandidate) => {
    const idx = picked.findIndex(
      (p) => candidatePosKey(p) === candidatePosKey(c)
    );
    if (idx < 0) return;
    picked.splice(idx, 1);
    usedFamilies.set(
      c.wordFamily,
      Math.max(0, (usedFamilies.get(c.wordFamily) ?? 1) - 1)
    );
    usedLemmas.set(c.lemma, Math.max(0, (usedLemmas.get(c.lemma) ?? 1) - 1));
    if (c.competitionGroup) usedCompetition.delete(c.competitionGroup);
    perSentence.set(
      c.sentenceId,
      Math.max(0, (perSentence.get(c.sentenceId) ?? 1) - 1)
    );
    markReject(
      c,
      `동일 wordFamily의 더 중요한 형태로 교체되어 탈락`,
      ["WORD_FAMILY_DUPLICATE"]
    );
  };

  const tryPick = (
    c: ValidatedBlankCandidate,
    minGap: number,
    pool: ValidatedBlankCandidate[],
    opts?: { allowFamilyDup?: boolean; forceReason?: string }
  ): boolean => {
    if (picked.length >= target) {
      markReject(c, "목표 최대 개수에 도달하여 탈락", ["MAX_COUNT_REACHED"]);
      return false;
    }
    if (alreadyPicked(c)) return false;
    const { code, better, swapKeeper } = conflictCode(
      c,
      minGap,
      pool,
      opts?.allowFamilyDup ?? false
    );
    if (code === "BETTER_CANDIDATE_IN_PHRASE" && better) {
      markReject(
        c,
        `동일 구의 ${better.answerText}보다 학습 가치가 낮아 탈락`,
        ["BETTER_CANDIDATE_IN_PHRASE"]
      );
      return false;
    }
    if (code === "WORD_FAMILY_DUPLICATE" && swapKeeper) {
      removePicked(swapKeeper);
      // fall through to pick c
    } else if (code === "WORD_FAMILY_DUPLICATE") {
      const keeper = picked.find((p) => p.wordFamily === c.wordFamily);
      markReject(
        c,
        keeper
          ? `동일 wordFamily인 ${keeper.answerText}가 이미 선택되어 중복 탈락`
          : "동일 어근 후보가 이미 선택되어 중복 탈락",
        ["WORD_FAMILY_DUPLICATE"]
      );
      return false;
    } else if (
      code === "PARALLEL_LIST_DUPLICATE" ||
      code === "SEMANTIC_DUPLICATE"
    ) {
      markReject(c, "의미·병렬 목록이 겹치는 후보가 이미 선택되어 탈락", [
        code,
      ]);
      return false;
    } else if (code === "SENTENCE_CAP") {
      hitSentenceCap = true;
      markReject(c, "문장별 빈칸 상한에 도달하여 탈락", ["SENTENCE_CAP"]);
      return false;
    } else if (code === "ADJACENT_GAP") {
      hitGapCap = true;
      markReject(c, "인접 빈칸 간격 규칙으로 탈락", ["ADJACENT_GAP"]);
      return false;
    } else if (code === "REPEATED_OCCURRENCE") {
      markReject(c, "동일 표제어가 이미 선택되어 탈락", ["REPEATED_OCCURRENCE"]);
      return false;
    } else if (code) {
      markReject(c, "선정 제약으로 탈락", [code]);
      return false;
    }

    picked.push(c);
    usedLemmas.set(c.lemma, (usedLemmas.get(c.lemma) ?? 0) + 1);
    usedFamilies.set(c.wordFamily, (usedFamilies.get(c.wordFamily) ?? 0) + 1);
    if (c.competitionGroup) usedCompetition.add(c.competitionGroup);
    perSentence.set(c.sentenceId, (perSentence.get(c.sentenceId) ?? 0) + 1);
    const d = ensureDiag(c);
    d.selected = true;
    d.rejectionCodes = [];
    d.decisionReason =
      opts?.forceReason ??
      (swapKeeper
        ? `동일 wordFamily에서 ${swapKeeper.answerText}보다 학습 가치가 높아 교체 선택`
        : c.grade === "A"
          ? "A등급 핵심어로 우선 선택"
          : c.grade === "B"
            ? "B등급 주요 학습어로 선택"
            : "A·B등급 후보 선택 후 목표 개수 보충을 위해 C등급 내용어로 선택");
    return true;
  };

  // mustInclude seeds
  for (const seed of options?.mustInclude ?? []) {
    const match =
      poolAll.find((c) => candidatePosKey(c) === candidatePosKey(seed)) ??
      poolAll.find(
        (c) => c.sentenceId === seed.sentenceId && c.lemma === seed.lemma
      );
    if (match) {
      tryPick(match, 2, poolAll, {
        allowFamilyDup: true,
        forceReason: "일반 모드 핵심 빈칸을 난이도 UP에 포함하여 선택",
      });
    }
  }

  // Core sentences first
  for (const sid of coreSet) {
    if (picked.some((p) => p.sentenceId === sid)) continue;
    const best = [...poolAb]
      .filter((c) => c.sentenceId === sid)
      .sort(sortKey)[0];
    if (best) {
      tryPick(best, minGapPreferred, poolAb, {
        forceReason: "핵심 주장·결론 문장의 최고점 내용어로 선택",
      });
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[BlankSelection] 핵심 문장에 빈칸 없음", {
        passageId,
        sentenceId: sid,
        availableCandidates: valid
          .filter((c) => c.sentenceId === sid)
          .map((c) => c.lemma),
      });
    }
  }

  // Prefer main_claim belief over beliefs: process core/main_claim A first
  for (const grade of ["A", "B"] as const) {
    const gradePool = poolAb
      .filter((c) => c.grade === grade)
      .sort((a, b) => {
        const role = (c: ValidatedBlankCandidate) =>
          c.semanticRole === "main_claim" || c.semanticRole === "theme" ? 0 : 1;
        const rr = role(a) - role(b);
        if (rr !== 0) return rr;
        return sortKey(a, b);
      });
    for (const gap of [minGapPreferred, 2, 1]) {
      for (const c of gradePool) {
        if (alreadyPicked(c)) continue;
        tryPick(c, gap, poolAb);
      }
    }
  }

  // C only to meet targetMin (and fill toward target)
  if (picked.length < target) {
    const cPool = [...poolC].sort(sortKey);
    for (const gap of [minGapPreferred, 2, 1]) {
      for (const c of cPool) {
        if (picked.length >= target) break;
        // Prefer filling to targetMin first; still allow up to target
        tryPick(c, gap, poolAll);
      }
    }
  }

  // Phrase swap post-process: replace weaker selected with stronger unselected in same group
  let swapped = true;
  let guard = 0;
  while (swapped && guard++ < 20) {
    swapped = false;
    for (let i = 0; i < picked.length; i++) {
      const sel = picked[i]!;
      if (!sel.competitionGroup) continue;
      const better = valid
        .filter(
          (c) =>
            c.competitionGroup === sel.competitionGroup &&
            c.finalScore > sel.finalScore &&
            !alreadyPicked(c) &&
            c.eligible
        )
        .sort((a, b) => b.finalScore - a.finalScore)[0];
      if (!better) continue;
      // Replace
      markReject(
        sel,
        `동일 구의 ${better.answerText}가 더 높아 교체 탈락`,
        ["BETTER_CANDIDATE_IN_PHRASE"]
      );
      usedFamilies.set(
        sel.wordFamily,
        Math.max(0, (usedFamilies.get(sel.wordFamily) ?? 1) - 1)
      );
      usedLemmas.set(
        sel.lemma,
        Math.max(0, (usedLemmas.get(sel.lemma) ?? 1) - 1)
      );
      if (sel.competitionGroup) usedCompetition.delete(sel.competitionGroup);
      perSentence.set(
        sel.sentenceId,
        Math.max(0, (perSentence.get(sel.sentenceId) ?? 1) - 1)
      );
      picked[i] = better;
      usedLemmas.set(better.lemma, (usedLemmas.get(better.lemma) ?? 0) + 1);
      usedFamilies.set(
        better.wordFamily,
        (usedFamilies.get(better.wordFamily) ?? 0) + 1
      );
      if (better.competitionGroup) {
        usedCompetition.add(better.competitionGroup);
      }
      perSentence.set(
        better.sentenceId,
        (perSentence.get(better.sentenceId) ?? 0) + 1
      );
      const d = ensureDiag(better);
      d.selected = true;
      d.rejectionCodes = [];
      d.decisionReason = `동일 구에서 ${sel.answerText}보다 학습 가치가 높아 교체 선택`;
      swapped = true;
    }
  }

  // Mark remaining unpicked
  for (const c of valid) {
    const d = ensureDiag(c);
    if (d.selected) continue;
    if (d.rejectionCodes.length === 0) {
      if (c.grade === "C" && picked.length >= targetMin) {
        d.decisionReason =
          "목표 최소 개수를 A·B등급으로 충족하여 C등급 보충이 불필요해 탈락";
        d.rejectionCodes = ["GRADE_DEFERRED"];
      } else {
        d.decisionReason = "점수·제약 검토 후 최종 선택에서 제외";
        d.rejectionCodes = ["NOT_SELECTED"];
      }
    }
  }

  let selected = sortPassageOrder(picked, options?.sentenceOrder);

  // Assign ranks
  selected.forEach((c, idx) => {
    const d = ensureDiag(c);
    d.selected = true;
    d.selectedRank = idx + 1;
  });

  // Ensure mustInclude
  if (options?.mustInclude?.length) {
    const keys = new Set(selected.map(candidatePosKey));
    for (const seed of options.mustInclude) {
      const key = candidatePosKey(seed);
      if (keys.has(key)) continue;
      const match =
        poolAll.find((c) => candidatePosKey(c) === key) ??
        poolAll.find(
          (c) => c.sentenceId === seed.sentenceId && c.lemma === seed.lemma
        );
      if (match) {
        selected.push(match);
        keys.add(candidatePosKey(match));
        const d = ensureDiag(match);
        d.selected = true;
        d.decisionReason = "일반 모드 포함 관계 유지를 위해 강제 포함";
      }
    }
    selected = sortPassageOrder(selected, options?.sentenceOrder);
    selected.forEach((c, idx) => {
      ensureDiag(c).selectedRank = idx + 1;
    });
  }

  let shortfallReason: string | null = null;
  if (selected.length < targetMin) {
    if (poolAll.length < targetMin) {
      shortfallReason = "학습 가능한 내용어 후보 부족";
    } else if (hitSentenceCap) {
      shortfallReason = "문장별 최대 빈칸 제한 적용";
    } else if (hitGapCap) {
      shortfallReason = "인접 빈칸 방지 규칙 적용";
    } else {
      shortfallReason = "품질 기준을 충족하는 후보만 선정";
    }
  }

  const diagnostics = [...diagMap.values()].sort(
    (a, b) => a.tokenStartIndex - b.tokenStartIndex
  );
  const stats: BlankSelectionStats = {
    totalWordCount: options?.totalWordCount ?? 0,
    targetMin,
    targetMax,
    aiCandidateCount: options?.sourceCounts?.ai ?? 0,
    savedVocabularyCandidateCount: options?.sourceCounts?.vocab ?? 0,
    fallbackCandidateCount: options?.sourceCounts?.fallback ?? 0,
    mergedCandidateCount: options?.sourceCounts?.merged ?? valid.length,
    gradeACount: valid.filter((c) => c.grade === "A").length,
    gradeBCount: valid.filter((c) => c.grade === "B").length,
    gradeCCount: valid.filter((c) => c.grade === "C").length,
    rejectedCount: diagnostics.filter((d) => d.grade === "REJECT" || (!d.selected && d.rejectionCodes.length)).length,
    selectedACount: selected.filter((c) => c.grade === "A").length,
    selectedBCount: selected.filter((c) => c.grade === "B").length,
    selectedCCount: selected.filter((c) => c.grade === "C").length,
    finalBlankCount: selected.length,
  };

  if (options?.logDiagnostics !== false) {
    printBlankSelectionDiagnostics(
      passageId,
      density === "high" ? "high" : "standard",
      diagnostics,
      stats
    );
  }

  return { selected, shortfallReason, diagnostics, stats };
}

export function selectBlankCandidatesByDensity(
  valid: ValidatedBlankCandidate[],
  options: {
    density: BlankDensity;
    standardTarget: number;
    highTarget: number;
    targetMinStandard?: number;
    targetMaxStandard?: number;
    targetMinHigh?: number;
    targetMaxHigh?: number;
    sentenceWordCounts?: Map<string, number>;
    coreSentenceIds?: string[];
    sentenceOrder?: string[];
    passageId?: string;
    totalWordCount?: number;
    sourceCounts?: {
      ai: number;
      vocab: number;
      fallback: number;
      merged: number;
    };
  }
): SelectBlankResult {
  const standard = selectBlankCandidates(valid, options.standardTarget, {
    density: "standard",
    sentenceWordCounts: options.sentenceWordCounts,
    coreSentenceIds: options.coreSentenceIds,
    sentenceOrder: options.sentenceOrder,
    targetMin: options.targetMinStandard,
    targetMax: options.targetMaxStandard,
    passageId: options.passageId,
    totalWordCount: options.totalWordCount,
    sourceCounts: options.sourceCounts,
    logDiagnostics: options.density === "standard",
  });
  if (options.density === "standard") return standard;
  return selectBlankCandidates(valid, options.highTarget, {
    density: "high",
    sentenceWordCounts: options.sentenceWordCounts,
    coreSentenceIds: options.coreSentenceIds,
    sentenceOrder: options.sentenceOrder,
    mustInclude: standard.selected,
    targetMin: options.targetMinHigh,
    targetMax: options.targetMaxHigh,
    passageId: options.passageId,
    totalWordCount: options.totalWordCount,
    sourceCounts: options.sourceCounts,
    logDiagnostics: true,
  });
}
