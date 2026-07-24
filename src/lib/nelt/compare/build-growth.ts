import { resolveLevelOrder } from "@/lib/nelt/level-order";
import type { NeltDomain, NeltGrowthStatus } from "@/types/nelt";
import type {
  NeltAttemptBundle,
  NeltDomainGrowth,
  NeltGrammarItemChange,
  NeltGrowthAnalysis,
  NeltGrowthHighlightCard,
  NeltSubskillGrowth,
} from "@/lib/nelt/compare/types";

export const DOMAIN_LABEL: Record<NeltDomain, string> = {
  vocabulary: "어휘",
  grammar: "문법",
  listening: "듣기",
  reading: "독해",
};

const DOMAINS: NeltDomain[] = [
  "vocabulary",
  "grammar",
  "listening",
  "reading",
];

export function difficultyRank(code: string | null | undefined): number | null {
  if (!code) return null;
  const m = /^([VGLR])(\d{2})$/i.exec(code.trim());
  if (!m) return null;
  return Number(m[2]);
}

export function sameDifficulty(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

/** 상위 % — 숫자가 작을수록 좋음. 개선 시에만 delta(양수=개선폭) */
export function percentileImprovement(
  before: number | null | undefined,
  after: number | null | undefined
): { improved: boolean; delta: number | null } {
  if (before == null || after == null) return { improved: false, delta: null };
  const delta = before - after;
  if (delta > 0.5) return { improved: true, delta: Math.round(delta * 10) / 10 };
  return { improved: false, delta: Math.round(delta * 10) / 10 };
}

function statusLabel(status: NeltGrowthStatus): string {
  switch (status) {
    case "major_growth":
      return "크게 성장";
    case "growth":
      return "꾸준한 성장";
    case "advanced_challenge":
      return "상위 레벨 진입";
    case "maintained":
      return "안정적으로 유지";
    case "focus_needed":
      return "다음 성장 목표";
  }
}

function domainOf(
  attempt: NeltAttemptBundle,
  domain: NeltDomain
): NeltAttemptBundle["domains"][number] | null {
  return attempt.domains.find((d) => d.domain === domain) ?? null;
}

function classifyDomain(
  before: NeltAttemptBundle["domains"][number] | null,
  after: NeltAttemptBundle["domains"][number] | null
): {
  status: NeltGrowthStatus;
  levelDelta: number | null;
  difficultyUp: boolean;
  scoreComparable: boolean;
  scoreDelta: number | null;
  percentileImproved: boolean;
  percentileDelta: number | null;
} {
  if (!before || !after) {
    return {
      status: "focus_needed",
      levelDelta: null,
      difficultyUp: false,
      scoreComparable: false,
      scoreDelta: null,
      percentileImproved: false,
      percentileDelta: null,
    };
  }

  const beforeOrder =
    before.evaluatedLevelOrder ?? resolveLevelOrder(before.evaluatedLevel);
  const afterOrder =
    after.evaluatedLevelOrder ?? resolveLevelOrder(after.evaluatedLevel);
  const levelDelta =
    beforeOrder != null && afterOrder != null
      ? Math.round((afterOrder - beforeOrder) * 10) / 10
      : null;

  const beforeDiff = difficultyRank(before.difficultyCode);
  const afterDiff = difficultyRank(after.difficultyCode);
  const difficultyUp =
    beforeDiff != null && afterDiff != null && afterDiff > beforeDiff;

  const scoreComparable = sameDifficulty(
    before.difficultyCode,
    after.difficultyCode
  );
  const scoreDelta =
    scoreComparable && before.rawScore != null && after.rawScore != null
      ? Math.round((after.rawScore - before.rawScore) * 10) / 10
      : null;

  const pct = percentileImprovement(before.percentile, after.percentile);

  let status: NeltGrowthStatus = "maintained";
  if (levelDelta != null && levelDelta >= 2) status = "major_growth";
  else if (levelDelta != null && levelDelta >= 1) status = "growth";
  else if (difficultyUp && (levelDelta == null || levelDelta >= 0))
    status = "advanced_challenge";
  else if (scoreDelta != null && scoreDelta >= 10) status = "growth";
  else if (scoreDelta != null && scoreDelta >= 5) status = "growth";
  else if (levelDelta != null && levelDelta < -0.5) status = "focus_needed";
  else if (scoreComparable && scoreDelta != null && scoreDelta <= -10)
    status = "focus_needed";
  else if (difficultyUp) status = "advanced_challenge";
  else status = "maintained";

  return {
    status,
    levelDelta,
    difficultyUp,
    scoreComparable,
    scoreDelta,
    percentileImproved: pct.improved,
    percentileDelta: pct.delta,
  };
}

function domainNarrative(
  label: string,
  before: NeltAttemptBundle["domains"][number] | null,
  after: NeltAttemptBundle["domains"][number] | null,
  c: ReturnType<typeof classifyDomain>
): string {
  if (!before || !after) {
    return `${label} 영역은 비교할 회차 데이터가 충분하지 않습니다.`;
  }

  const parts: string[] = [];
  if (c.levelDelta != null && c.levelDelta > 0) {
    parts.push(
      `${label} 판정 수준이 ${before.evaluatedLevel ?? "이전"}에서 ${
        after.evaluatedLevel ?? "최근"
      }으로 성장했습니다.`
    );
  } else if (c.difficultyUp) {
    parts.push(
      `${before.difficultyCode ?? "이전"}에서 ${
        after.difficultyCode ?? "최근"
      } 단계로 더 높은 시험 난이도에 도전했습니다.`
    );
    if (after.evaluatedLevel) {
      parts.push(
        `높아진 난이도에서도 ${after.evaluatedLevel} 수준을 ${
          c.levelDelta != null && c.levelDelta >= 0 ? "유지·성장" : "확인"
        }했습니다.`
      );
    }
  } else if (c.scoreComparable && c.scoreDelta != null && c.scoreDelta > 0) {
    parts.push(
      `동일 난이도(${after.difficultyCode})에서 점수가 ${before.rawScore}점에서 ${after.rawScore}점으로 ${c.scoreDelta}점 상승했습니다.`
    );
  } else if (c.status === "maintained") {
    parts.push(
      `${label}은(는) ${after.evaluatedLevel ?? "현재 수준"}을 안정적으로 유지하고 있습니다.`
    );
  } else {
    parts.push(
      `${label}은(는) 다음 성장 목표로 삼아, 현재 ${
        after.evaluatedLevel ?? "수준"
      }을 더 단단히 다질 예정입니다.`
    );
  }

  if (c.percentileImproved && c.percentileDelta != null) {
    parts.push(
      `동학년 대비 상위 비율도 상위 ${before.percentile}%에서 상위 ${after.percentile}%로 ${c.percentileDelta}%p 상승했습니다.`
    );
  }

  return parts.join(" ");
}

function grammarKey(item: {
  category: string | null;
  detail: string;
}): string {
  return `${item.category ?? ""}::${item.detail}`.trim();
}

function buildGrammarChanges(
  start: NeltAttemptBundle,
  end: NeltAttemptBundle
): NeltGrammarItemChange[] {
  const beforeMap = new Map(
    (start.grammar?.items ?? []).map((i) => [grammarKey(i), i])
  );
  const afterItems = end.grammar?.items ?? [];
  const out: NeltGrammarItemChange[] = [];

  for (const after of afterItems) {
    const before = beforeMap.get(grammarKey(after));
    if (!before) {
      out.push({
        category: after.category,
        detail: after.detail,
        kind: after.isCorrect ? "newly_correct" : "still_incorrect",
      });
      continue;
    }
    if (before.isCorrect === true && after.isCorrect === true) {
      out.push({
        category: after.category,
        detail: after.detail,
        kind: "still_correct",
      });
    } else if (before.isCorrect !== true && after.isCorrect === true) {
      out.push({
        category: after.category,
        detail: after.detail,
        kind: "newly_correct",
      });
    } else if (before.isCorrect === true && after.isCorrect !== true) {
      out.push({
        category: after.category,
        detail: after.detail,
        kind: "regressed",
      });
    } else {
      out.push({
        category: after.category,
        detail: after.detail,
        kind: "still_incorrect",
      });
    }
  }
  return out;
}

function buildSubskillGrowth(
  start: NeltAttemptBundle,
  end: NeltAttemptBundle
): NeltSubskillGrowth[] {
  const out: NeltSubskillGrowth[] = [];
  for (const domain of DOMAINS) {
    const b = domainOf(start, domain);
    const a = domainOf(end, domain);
    if (!b || !a) continue;
    const beforeMap = new Map(b.subskills.map((s) => [s.name, s]));
    for (const s of a.subskills) {
      const prev = beforeMap.get(s.name);
      if (
        prev?.studentAccuracy == null ||
        s.studentAccuracy == null ||
        s.studentAccuracy <= prev.studentAccuracy
      ) {
        continue;
      }
      out.push({
        domain,
        name: s.name,
        beforeAccuracy: prev.studentAccuracy,
        afterAccuracy: s.studentAccuracy,
        delta: Math.round((s.studentAccuracy - prev.studentAccuracy) * 10) / 10,
      });
    }
  }
  return out.sort((x, y) => y.delta - x.delta).slice(0, 5);
}

function buildHighlights(
  start: NeltAttemptBundle,
  end: NeltAttemptBundle,
  domainGrowth: NeltDomainGrowth[],
  vocab: NeltGrowthAnalysis["vocabularyGrowth"],
  grammarChanges: NeltGrammarItemChange[]
): NeltGrowthHighlightCard[] {
  const cards: NeltGrowthHighlightCard[] = [];

  const beforeOverall =
    start.overallLevelOrder ?? resolveLevelOrder(start.overallBand);
  const afterOverall =
    end.overallLevelOrder ?? resolveLevelOrder(end.overallBand);
  if (
    beforeOverall != null &&
    afterOverall != null &&
    afterOverall > beforeOverall
  ) {
    cards.push({
      key: "overall_level",
      title: "종합 레벨",
      beforeLabel: start.overallLevel ?? start.overallBand ?? "—",
      afterLabel: end.overallLevel ?? end.overallBand ?? "—",
      deltaLabel: "종합 수준 상승",
      status:
        afterOverall - beforeOverall >= 2 ? "major_growth" : "growth",
      parentVisible: true,
      priority: 100,
    });
  }

  if (vocab.sizeDelta != null && vocab.sizeDelta > 0) {
    const mult =
      vocab.sizeMultiplier != null && vocab.sizeMultiplier >= 2
        ? `약 ${Math.round(vocab.sizeMultiplier * 10) / 10}배 성장`
        : undefined;
    cards.push({
      key: "vocab_size",
      title: "어휘량",
      beforeLabel: `약 ${vocab.beforeSize}단어`,
      afterLabel: `약 ${vocab.afterSize}단어`,
      deltaLabel: `약 ${vocab.sizeDelta}단어 증가${mult ? ` · ${mult}` : ""}`,
      status: vocab.sizeDelta >= 500 ? "major_growth" : "growth",
      parentVisible: true,
      priority: vocab.sizeDelta >= 500 ? 95 : 80,
    });
  }

  for (const d of domainGrowth) {
    if (
      d.status === "major_growth" ||
      d.status === "growth" ||
      d.status === "advanced_challenge"
    ) {
      cards.push({
        key: `domain_${d.domain}`,
        title: `${d.label} 수준`,
        beforeLabel: d.beforeLevel ?? "—",
        afterLabel: d.afterLevel ?? "—",
        deltaLabel: d.difficultyUp
          ? `${d.beforeDifficulty ?? ""} → ${d.afterDifficulty ?? ""} 도전`
          : d.levelDelta != null && d.levelDelta > 0
            ? "판정 수준 상승"
            : statusLabel(d.status),
        status: d.status,
        parentVisible: true,
        priority:
          d.status === "major_growth"
            ? 90
            : d.status === "advanced_challenge"
              ? 85
              : 70,
      });
    }
  }

  if (vocab.requiredPctDelta != null && vocab.requiredPctDelta >= 10) {
    cards.push({
      key: "required_vocab",
      title: "초등 필수 어휘 이해도",
      beforeLabel: `${vocab.beforeRequiredPct}%`,
      afterLabel: `${vocab.afterRequiredPct}%`,
      deltaLabel: `${vocab.requiredPctDelta}%p 상승`,
      status: vocab.requiredPctDelta >= 20 ? "major_growth" : "growth",
      parentVisible: true,
      priority: 75,
    });
  }

  if (
    vocab.requiredCountDelta != null &&
    vocab.requiredCountDelta > 0 &&
    !cards.some((c) => c.key === "required_vocab")
  ) {
    cards.push({
      key: "required_count",
      title: "초등 필수 어휘 이해 개수",
      beforeLabel: `약 ${vocab.beforeRequiredCount}개`,
      afterLabel: `약 ${vocab.afterRequiredCount}개`,
      deltaLabel: `약 ${vocab.requiredCountDelta}개 증가`,
      status: "growth",
      parentVisible: true,
      priority: 72,
    });
  }

  const newly = grammarChanges.filter((g) => g.kind === "newly_correct");
  const beforeCorrect =
    start.grammar?.correctItemCount ??
    (start.grammar?.items ?? []).filter((i) => i.isCorrect).length;
  const afterCorrect =
    end.grammar?.correctItemCount ??
    (end.grammar?.items ?? []).filter((i) => i.isCorrect).length;
  if (
    typeof beforeCorrect === "number" &&
    typeof afterCorrect === "number" &&
    afterCorrect > beforeCorrect
  ) {
    cards.push({
      key: "grammar_o",
      title: "문법 정답 항목",
      beforeLabel: `${beforeCorrect}개`,
      afterLabel: `${afterCorrect}개`,
      deltaLabel: `${afterCorrect - beforeCorrect}개 증가`,
      status: afterCorrect - beforeCorrect >= 3 ? "growth" : "growth",
      parentVisible: true,
      priority: 65,
    });
  } else if (newly.length >= 2) {
    cards.push({
      key: "grammar_new",
      title: "새로 확인된 문법",
      beforeLabel: "이전 미확인",
      afterLabel: `${newly.length}항목`,
      deltaLabel: "새롭게 이해한 항목 증가",
      status: "growth",
      parentVisible: true,
      priority: 60,
    });
  }

  const overallPct = percentileImprovement(
    start.overallPercentile,
    end.overallPercentile
  );
  if (overallPct.improved && overallPct.delta != null) {
    cards.push({
      key: "overall_percentile",
      title: "동학년 석차",
      beforeLabel: `상위 ${start.overallPercentile}%`,
      afterLabel: `상위 ${end.overallPercentile}%`,
      deltaLabel: `${overallPct.delta}%p 상승`,
      status: overallPct.delta >= 20 ? "major_growth" : "growth",
      parentVisible: true,
      priority: 55,
    });
  }

  // Deduplicate related domain cards (keep highest priority per domain-ish)
  const sorted = cards.sort((a, b) => b.priority - a.priority);
  const seen = new Set<string>();
  const unique: NeltGrowthHighlightCard[] = [];
  for (const c of sorted) {
    if (seen.has(c.key)) continue;
    seen.add(c.key);
    unique.push(c);
  }
  return unique.slice(0, 6);
}

function buildLearningPlan(
  domainGrowth: NeltDomainGrowth[],
  end: NeltAttemptBundle,
  focusGrammar: NeltGrammarItemChange[]
): NeltGrowthAnalysis["learningPlan"] {
  const plan = {} as NeltGrowthAnalysis["learningPlan"];
  for (const domain of DOMAINS) {
    const g = domainGrowth.find((d) => d.domain === domain);
    const after = domainOf(end, domain);
    const label = DOMAIN_LABEL[domain];
    const strength =
      g?.status === "major_growth" ||
      g?.status === "growth" ||
      g?.status === "advanced_challenge"
        ? `${label}에서 ${g.afterLevel ?? "현재 수준"}으로 성장·도전이 확인됩니다.`
        : `${label}은(는) ${after?.evaluatedLevel ?? "현재 수준"}을 유지 중입니다.`;

    let nextGoal = `${label}의 다음 단계 표현·문항 유형에 익숙해지도록 연습합니다.`;
    let classFocus = `${label} 핵심 유형을 수업에서 반복 확인합니다.`;
    let homework = `짧은 ${label} 과제를 주 2~3회 꾸준히 진행합니다.`;

    if (domain === "vocabulary") {
      nextGoal =
        "중등 기초 어휘를 예문과 함께 늘리고, 문맥 속 쓰임을 함께 익힙니다.";
      classFocus = "어휘 + 짧은 예문 확인, 유의어·반의어 묶음 학습";
      homework = "하루 10~15개 어휘를 뜻·철자·예문으로 복습";
    } else if (domain === "grammar") {
      const focus = focusGrammar
        .slice(0, 3)
        .map((i) => i.category || i.detail.slice(0, 20))
        .join(", ");
      nextGoal = focus
        ? `${focus} 등 기초 문법을 패턴 문장으로 반복 학습합니다.`
        : "be동사·일반동사·시제 등 기초 문법을 쉬운 문장으로 반복합니다.";
      classFocus = "기초 패턴 문장 쓰기 + 어법성 판단 연습";
      homework = "같은 패턴 문장 5개씩 바꿔 쓰기";
    } else if (domain === "listening") {
      nextGoal =
        "세부 정보·추론 유형을 중심으로 듣기를 듣고 바로 확인하는 연습을 합니다.";
      classFocus = "세부 사항 파악 · 적절한 응답 찾기 유형 집중";
      homework = "짧은 대화를 듣고 핵심 정보 받아쓰기";
    } else {
      nextGoal =
        "추론·문장 관계 파악 유형을 많이 풀어 독해 정확도를 높입니다.";
      classFocus = "대의·세부 파악 이후 추론·논리 관계 문제";
      homework = "짧은 글을 읽고 중심 내용·세부 정보 정리하기";
    }

    if (g?.status === "focus_needed") {
      nextGoal = `다음 성장 목표: ${nextGoal}`;
    }

    plan[domain] = { strength, nextGoal, classFocus, homework };
  }
  return plan;
}

function buildCopy(analysis: Omit<
  NeltGrowthAnalysis,
  | "overallNarrative"
  | "strengthsNarrative"
  | "stableNarrative"
  | "nextGoalsNarrative"
  | "parentCopy"
  | "learningPlan"
> & { learningPlan: NeltGrowthAnalysis["learningPlan"] }): Pick<
  NeltGrowthAnalysis,
  | "overallNarrative"
  | "strengthsNarrative"
  | "stableNarrative"
  | "nextGoalsNarrative"
  | "parentCopy"
> {
  const name = analysis.studentName;
  const n = analysis.attemptCount;
  const grown = analysis.domainGrowth.filter(
    (d) =>
      d.status === "major_growth" ||
      d.status === "growth" ||
      d.status === "advanced_challenge"
  );
  const stable = analysis.domainGrowth.filter(
    (d) => d.status === "maintained" || d.status === "advanced_challenge"
  );
  const focus = analysis.domainGrowth.filter(
    (d) => d.status === "focus_needed"
  );

  const overallNarrative = [
    `${name} 학생의 NELT ${n}회차 결과를 비교한 결과,`,
    grown.length > 0
      ? `${grown.map((d) => d.label).join("·")} 영역에서 눈에 띄는 성장이 확인됩니다.`
      : `여러 영역에서 현재 수준을 다지며 다음 단계로 준비하는 흐름입니다.`,
  ].join(" ");

  const strengthParts: string[] = [];
  if (
    analysis.vocabularyGrowth.sizeDelta != null &&
    analysis.vocabularyGrowth.sizeDelta > 0
  ) {
    strengthParts.push(
      `알고 있는 어휘가 약 ${analysis.vocabularyGrowth.beforeSize}단어에서 약 ${analysis.vocabularyGrowth.afterSize}단어로, 약 ${analysis.vocabularyGrowth.sizeDelta}단어 증가했습니다.`
    );
  }
  if (
    analysis.vocabularyGrowth.requiredPctDelta != null &&
    analysis.vocabularyGrowth.requiredPctDelta > 0
  ) {
    strengthParts.push(
      `초등 필수 어휘 이해도도 ${analysis.vocabularyGrowth.beforeRequiredPct}%에서 ${analysis.vocabularyGrowth.afterRequiredPct}%로 ${analysis.vocabularyGrowth.requiredPctDelta}%p 상승했습니다.`
    );
  }
  for (const d of grown) {
    strengthParts.push(d.narrative);
  }
  if (analysis.newlyCorrectGrammar.length > 0) {
    strengthParts.push(
      `문법에서는 「${analysis.newlyCorrectGrammar
        .slice(0, 4)
        .map((g) => g.category || g.detail.slice(0, 16))
        .join(", ")}」 등을 새롭게 확인했습니다.`
    );
  }
  const strengthsNarrative =
    strengthParts.slice(0, 6).join(" ") ||
    "회차를 거듭하며 기초를 쌓아 가는 과정이 확인됩니다.";

  const stableNarrative =
    stable.length > 0
      ? `${stable
          .map((d) => d.label)
          .join("·")} 영역은 높아진 난이도나 최근 수준을 안정적으로 유지하고 있습니다.`
      : "현재 확보한 수준을 바탕으로 다음 목표를 설정합니다.";

  const focusLines = focus.map((d) => analysis.learningPlan[d.domain].nextGoal);
  if (analysis.focusGrammar.length > 0) {
    focusLines.push(
      `문법 보완: ${analysis.focusGrammar
        .slice(0, 4)
        .map((g) => g.category || g.detail.slice(0, 18))
        .join(", ")}`
    );
  }
  const nextGoalsNarrative =
    focusLines.length > 0
      ? `앞으로의 학습 방향입니다. ${focusLines.slice(0, 4).join(" ")}`
      : `앞으로 ${grown[0]?.label ?? "어휘"}·문법 기초를 문장에 적용하는 힘을 키우겠습니다.`;

  const highlightLines = analysis.highlights
    .filter((h) => h.parentVisible)
    .slice(0, 5)
    .map(
      (h) =>
        `· ${h.title}: ${h.beforeLabel} → ${h.afterLabel}${
          h.deltaLabel ? ` (${h.deltaLabel})` : ""
        }`
    );

  const parentCopy = [
    `[${name} 학생 NELT 영어 성장 리포트]`,
    "",
    overallNarrative,
    "",
    "[주요 성장]",
    ...highlightLines,
    "",
    strengthsNarrative,
    "",
    stableNarrative,
    "",
    "[앞으로의 학습]",
    nextGoalsNarrative,
  ].join("\n");

  return {
    overallNarrative,
    strengthsNarrative,
    stableNarrative,
    nextGoalsNarrative,
    parentCopy,
  };
}

export function buildNeltGrowthAnalysis(
  studentName: string,
  attemptsIn: NeltAttemptBundle[]
): NeltGrowthAnalysis | null {
  const attempts = [...attemptsIn].sort((a, b) => {
    if (a.attemptNumber !== b.attemptNumber)
      return a.attemptNumber - b.attemptNumber;
    return (a.testDate ?? "").localeCompare(b.testDate ?? "");
  });
  if (attempts.length < 2) return null;

  const start = attempts[0];
  const end = attempts[attempts.length - 1];

  const domainGrowth: NeltDomainGrowth[] = DOMAINS.map((domain) => {
    const before = domainOf(start, domain);
    const after = domainOf(end, domain);
    const c = classifyDomain(before, after);
    return {
      domain,
      label: DOMAIN_LABEL[domain],
      status: c.status,
      beforeLevel: before?.evaluatedLevel ?? null,
      afterLevel: after?.evaluatedLevel ?? null,
      levelDelta: c.levelDelta,
      beforeDifficulty: before?.difficultyCode ?? null,
      afterDifficulty: after?.difficultyCode ?? null,
      difficultyUp: c.difficultyUp,
      beforeScore: before?.rawScore ?? null,
      afterScore: after?.rawScore ?? null,
      scoreComparable: c.scoreComparable,
      scoreDelta: c.scoreDelta,
      beforePercentile: before?.percentile ?? null,
      afterPercentile: after?.percentile ?? null,
      percentileImproved: c.percentileImproved,
      percentileDelta: c.percentileDelta,
      beforeSummary: before?.evaluationSummary ?? null,
      afterSummary: after?.evaluationSummary ?? null,
      narrative: domainNarrative(DOMAIN_LABEL[domain], before, after, c),
    };
  });

  const beforeSize = start.vocabulary?.vocabularySize ?? null;
  const afterSize = end.vocabulary?.vocabularySize ?? null;
  const sizeDelta =
    beforeSize != null && afterSize != null ? afterSize - beforeSize : null;
  const sizeMultiplier =
    beforeSize != null && afterSize != null && beforeSize > 0
      ? afterSize / beforeSize
      : null;

  const beforeRequiredPct =
    start.vocabulary?.elementaryRequiredPercentage ?? null;
  const afterRequiredPct = end.vocabulary?.elementaryRequiredPercentage ?? null;
  const requiredPctDelta =
    beforeRequiredPct != null && afterRequiredPct != null
      ? Math.round((afterRequiredPct - beforeRequiredPct) * 10) / 10
      : null;

  const beforeRequiredCount =
    start.vocabulary?.elementaryRequiredEstimatedCount ??
    (start.vocabulary?.elementaryRequiredTotal != null &&
    beforeRequiredPct != null
      ? Math.round(
          (start.vocabulary.elementaryRequiredTotal * beforeRequiredPct) / 100
        )
      : null);
  const afterRequiredCount =
    end.vocabulary?.elementaryRequiredEstimatedCount ??
    (end.vocabulary?.elementaryRequiredTotal != null && afterRequiredPct != null
      ? Math.round(
          (end.vocabulary.elementaryRequiredTotal * afterRequiredPct) / 100
        )
      : null);
  const requiredCountDelta =
    beforeRequiredCount != null && afterRequiredCount != null
      ? afterRequiredCount - beforeRequiredCount
      : null;

  const beforeCsat = start.vocabulary?.csatVocabularyPercentage ?? null;
  const afterCsat = end.vocabulary?.csatVocabularyPercentage ?? null;
  const csatPctDelta =
    beforeCsat != null && afterCsat != null
      ? Math.round((afterCsat - beforeCsat) * 10) / 10
      : null;

  const vocabularyGrowth = {
    beforeSize,
    afterSize,
    sizeDelta,
    sizeMultiplier,
    beforeRequiredPct,
    afterRequiredPct,
    requiredPctDelta,
    beforeRequiredCount,
    afterRequiredCount,
    requiredCountDelta,
    beforeCsatPct: beforeCsat,
    afterCsatPct: afterCsat,
    csatPctDelta,
  };

  const grammarChanges = buildGrammarChanges(start, end);
  const newlyCorrectGrammar = grammarChanges.filter(
    (g) => g.kind === "newly_correct"
  );
  const focusGrammar = grammarChanges
    .filter((g) => g.kind === "still_incorrect" || g.kind === "regressed")
    .slice(0, 8);
  const subskillGrowth = buildSubskillGrowth(start, end);
  const highlights = buildHighlights(
    start,
    end,
    domainGrowth,
    vocabularyGrowth,
    grammarChanges
  );
  const learningPlan = buildLearningPlan(domainGrowth, end, focusGrammar);

  const partial = {
    studentName,
    attemptCount: attempts.length,
    start,
    end,
    attempts,
    highlights,
    domainGrowth,
    vocabularyGrowth,
    subskillGrowth,
    grammarChanges,
    newlyCorrectGrammar,
    focusGrammar,
    learningPlan,
  };

  const copy = buildCopy(partial);

  return { ...partial, ...copy };
}
