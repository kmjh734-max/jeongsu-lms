import { DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type {
  NeltAttemptBundle,
  NeltGrowthAnalysis,
} from "@/lib/nelt/compare/types";
import type { NeltDomain } from "@/types/nelt";

export type NeltDomainSection = {
  domain: NeltDomain;
  label: string;
  icon: string;
  badge: string;
  badgeTone: "growth" | "focus" | "stable";
  subtitle: string;
  stages: Array<{
    attempt: number;
    difficulty: string | null;
    level: string | null;
    score: number | null;
  }>;
  keyPoints: Array<{ label: string; value: string }>;
  subskills: Array<{ name: string; series: string }>;
  explanation: string;
  plan: string;
  chart: {
    kind: "level" | "metrics";
    series: Array<{
      name: string;
      values: number[];
      display: string[];
    }>;
    maxY: number;
  };
};

function shortLevel(level: string | null | undefined): string {
  if (!level) return "—";
  return level
    .replace("초등학교 ", "초")
    .replace("중학교 ", "중")
    .replace("고등학교 ", "고")
    .replace("학년", "");
}

function seriesJoin(
  attempts: NeltAttemptBundle[],
  pick: (a: NeltAttemptBundle) => string | number | null | undefined
): string {
  return attempts
    .map((a) => {
      const v = pick(a);
      if (v == null || v === "") return "—";
      return typeof v === "number" ? String(v) : v;
    })
    .join(" → ");
}

function subskillSeries(
  attempts: NeltAttemptBundle[],
  domain: NeltDomain,
  nameIncludes: string[]
): { name: string; series: string } | null {
  const values: Array<number | null> = [];
  let displayName = nameIncludes[0];
  for (const a of attempts) {
    const d = a.domains.find((x) => x.domain === domain);
    const skill = d?.subskills.find((s) =>
      nameIncludes.some((k) => s.name.includes(k))
    );
    if (skill?.name) displayName = skill.name;
    values.push(skill?.studentAccuracy ?? null);
  }
  if (values.every((v) => v == null)) return null;
  return {
    name: displayName,
    series: values.map((v) => (v == null ? "—" : `${v}%`)).join(" → "),
  };
}

function domainBadge(
  analysis: NeltGrowthAnalysis,
  domain: NeltDomain
): { badge: string; tone: "growth" | "focus" | "stable" } {
  const g = analysis.domainGrowth.find((d) => d.domain === domain);
  if (!g) return { badge: "변화 확인", tone: "stable" };
  if (g.status === "major_growth" || g.status === "growth") {
    if (domain === "vocabulary") return { badge: "가장 큰 성장", tone: "growth" };
    if (domain === "reading") return { badge: "꾸준한 수준 상승", tone: "growth" };
    return { badge: "성장 확인", tone: "growth" };
  }
  if (g.status === "advanced_challenge") {
    return { badge: "상위 범위 도전", tone: "growth" };
  }
  if (g.status === "focus_needed") {
    return { badge: "다음 성장 목표", tone: "focus" };
  }
  if (domain === "listening") {
    return { badge: `${shortLevel(g.afterLevel)} 유지`, tone: "stable" };
  }
  return { badge: "안정 유지", tone: "stable" };
}

function parentDomainExplanation(
  analysis: NeltGrowthAnalysis,
  domain: NeltDomain
): string {
  const attempts = analysis.attempts;
  const first = attempts[0];
  const last = attempts[attempts.length - 1];
  const d0 = first.domains.find((d) => d.domain === domain);
  const dN = last.domains.find((d) => d.domain === domain);
  const plan = analysis.learningPlan[domain];

  if (domain === "vocabulary") {
    const s0 = first.vocabulary?.vocabularySize;
    const sN = last.vocabulary?.vocabularySize;
    const e0 = first.vocabulary?.elementaryRequiredPercentage;
    const eN = last.vocabulary?.elementaryRequiredPercentage;
    const use = subskillSeries(attempts, "vocabulary", ["사용"]);
    const ctx = subskillSeries(attempts, "vocabulary", ["문맥"]);
    return [
      `${shortLevel(d0?.evaluatedLevel)} 단계에서 ${shortLevel(dN?.evaluatedLevel)} 단계까지 어휘 실력이 넓어졌습니다.`,
      s0 != null && sN != null
        ? `알고 있는 어휘는 약 ${s0.toLocaleString()}단어에서 약 ${sN.toLocaleString()}단어로 늘었습니다.`
        : "",
      e0 != null && eN != null
        ? `초등 필수 어휘 이해율도 ${e0}%에서 ${eN}%로 올랐습니다.`
        : "",
      ctx ? `문맥에서 단어를 이해하는 능력은 ${ctx.series}로 나타났습니다.` : "",
      use ? `단어를 문장에 맞게 쓰는 능력은 ${use.series}입니다.` : "",
      plan.nextGoal,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (domain === "grammar") {
    const newly = analysis.newlyCorrectGrammar
      .slice(0, 3)
      .map((g) => g.category || g.detail.slice(0, 12));
    const focus = analysis.focusGrammar
      .slice(0, 3)
      .map((g) => g.category || g.detail.slice(0, 12));
    const codes = attempts
      .map((a) => a.domains.find((d) => d.domain === "grammar")?.difficultyCode)
      .filter(Boolean)
      .join(" → ");
    return [
      `문법 수준은 ${shortLevel(d0?.evaluatedLevel)}에서 시작해 회차를 거치며 기초 문장 구조를 넓혀 왔습니다.`,
      codes
        ? `${codes} 범위에서 학습 성과와 다음 보완 항목이 구체적으로 확인되었습니다.`
        : "",
      newly.length
        ? `최근 평가에서 확인된 강점으로는 ${newly.join("·")} 등이 있습니다.`
        : "",
      focus.length
        ? `앞으로는 ${focus.join("·")}을(를) 중심으로 문장에 적용하는 연습을 이어가겠습니다.`
        : plan.nextGoal,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (domain === "listening") {
    const main = subskillSeries(attempts, "listening", ["대의"]);
    return [
      `듣기는 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)} 수준으로 성장했습니다.`,
      d0?.evaluatedLevel === dN?.evaluatedLevel ||
      (dN?.evaluatedLevelOrder ?? 0) >= 5
        ? `최근 평가에서도 ${shortLevel(dN?.evaluatedLevel)} 수준을 안정적으로 유지하고 있습니다.`
        : "",
      main ? `대화의 중심 내용을 파악하는 능력은 ${main.series}입니다.` : "",
      "앞으로는 세부 정보를 놓치지 않도록 핵심 표현 받아쓰기와 짧은 쉐도잉을 병행하고, 추론·적절한 표현 선택 문제를 함께 보완하겠습니다.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  // reading
  const main = subskillSeries(attempts, "reading", ["대의"]);
  const detail = subskillSeries(attempts, "reading", ["세부"]);
  return [
    `독해는 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)}까지 매 평가에서 판정 수준이 꾸준히 올라갔습니다.`,
    main ? `글의 중심 내용을 파악하는 능력은 ${main.series}입니다.` : "",
    detail ? `세부 정보 파악은 ${detail.series}입니다.` : "",
    "앞으로는 추론 문제와 문장·단락 사이의 관계를 집중적으로 연습하고, 하나의 지문으로 여러 유형을 해결하는 훈련을 강화하겠습니다.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDomainSections(
  analysis: NeltGrowthAnalysis
): NeltDomainSection[] {
  const attempts = analysis.attempts;
  const domains: NeltDomain[] = [
    "vocabulary",
    "grammar",
    "listening",
    "reading",
  ];

  return domains.map((domain) => {
    const { badge, tone } = domainBadge(analysis, domain);
    const stages = attempts.map((a) => {
      const d = a.domains.find((x) => x.domain === domain);
      return {
        attempt: a.attemptNumber,
        difficulty: d?.difficultyCode ?? null,
        level: shortLevel(d?.evaluatedLevel ?? null),
        score: d?.rawScore ?? null,
      };
    });

    let keyPoints: NeltDomainSection["keyPoints"] = [];
    let subskills: NeltDomainSection["subskills"] = [];
    let chart: NeltDomainSection["chart"];
    let subtitle = "";

    if (domain === "vocabulary") {
      subtitle = "Vocabulary Size · 필수 어휘 이해율 · 활용 능력";
      keyPoints = [
        {
          label: "어휘량",
          value: seriesJoin(
            attempts,
            (a) =>
              a.vocabulary?.vocabularySize != null
                ? `${a.vocabulary.vocabularySize.toLocaleString()}단어`
                : null
          ),
        },
        {
          label: "필수 어휘 이해율",
          value: seriesJoin(
            attempts,
            (a) =>
              a.vocabulary?.elementaryRequiredPercentage != null
                ? `${a.vocabulary.elementaryRequiredPercentage}%`
                : null
          ),
        },
        {
          label: "수능 기출 어휘",
          value: seriesJoin(
            attempts,
            (a) =>
              a.vocabulary?.csatVocabularyPercentage != null
                ? `${a.vocabulary.csatVocabularyPercentage}%`
                : null
          ),
        },
        {
          label: "단어 사용",
          value:
            subskillSeries(attempts, "vocabulary", ["사용"])?.series ?? "—",
        },
      ];
      subskills = [
        subskillSeries(attempts, "vocabulary", ["의미"]),
        subskillSeries(attempts, "vocabulary", ["문맥"]),
        subskillSeries(attempts, "vocabulary", ["상관", "관계"]),
        subskillSeries(attempts, "vocabulary", ["사용"]),
      ].filter(Boolean) as NeltDomainSection["subskills"];
      chart = {
        kind: "metrics",
        maxY: Math.max(
          100,
          ...attempts.map((a) => (a.vocabulary?.vocabularySize ?? 0) / 10)
        ),
        series: [
          {
            name: "어휘량(÷10)",
            values: attempts.map((a) =>
              Math.round((a.vocabulary?.vocabularySize ?? 0) / 10)
            ),
            display: attempts.map((a) =>
              a.vocabulary?.vocabularySize != null
                ? String(a.vocabulary.vocabularySize)
                : "—"
            ),
          },
          {
            name: "필수어휘(%)",
            values: attempts.map(
              (a) => a.vocabulary?.elementaryRequiredPercentage ?? 0
            ),
            display: attempts.map((a) =>
              a.vocabulary?.elementaryRequiredPercentage != null
                ? `${a.vocabulary.elementaryRequiredPercentage}%`
                : "—"
            ),
          },
          {
            name: "수능어휘(%)",
            values: attempts.map(
              (a) => a.vocabulary?.csatVocabularyPercentage ?? 0
            ),
            display: attempts.map((a) =>
              a.vocabulary?.csatVocabularyPercentage != null
                ? `${a.vocabulary.csatVocabularyPercentage}%`
                : "—"
            ),
          },
        ],
      };
    } else if (domain === "grammar") {
      subtitle = "기초 문장 구조 · 문법 이해율 · 항목별 정답";
      keyPoints = [
        {
          label: "점수",
          value: seriesJoin(
            attempts,
            (a) => a.domains.find((d) => d.domain === "grammar")?.rawScore
          ),
        },
        {
          label: "필수 문법 이해율",
          value: seriesJoin(
            attempts,
            (a) =>
              a.grammar?.elementaryGrammarPercentage != null
                ? `${a.grammar.elementaryGrammarPercentage}%`
                : null
          ),
        },
        {
          label: "정답 문법 항목",
          value: seriesJoin(
            attempts,
            (a) =>
              a.grammar?.correctItemCount != null
                ? `${a.grammar.correctItemCount}개`
                : null
          ),
        },
        {
          label: "최신 확인 강점",
          value:
            analysis.newlyCorrectGrammar
              .slice(0, 3)
              .map((g) => g.category || "항목")
              .join("·") || "기초 항목 확인",
        },
      ];
      subskills = [
        subskillSeries(attempts, "grammar", ["판단"]),
        subskillSeries(attempts, "grammar", ["사용"]),
        {
          name: "새롭게 확인된 항목",
          series:
            analysis.newlyCorrectGrammar
              .slice(0, 2)
              .map((g) => g.category || g.detail.slice(0, 10))
              .join("·") || "—",
        },
        {
          name: "집중 지도 항목",
          series:
            analysis.focusGrammar
              .slice(0, 3)
              .map((g) => g.category || g.detail.slice(0, 10))
              .join("·") || "—",
        },
      ].filter(Boolean) as NeltDomainSection["subskills"];
      chart = {
        kind: "metrics",
        maxY: 100,
        series: [
          {
            name: "점수",
            values: attempts.map(
              (a) =>
                a.domains.find((d) => d.domain === "grammar")?.rawScore ?? 0
            ),
            display: attempts.map((a) => {
              const s = a.domains.find((d) => d.domain === "grammar")?.rawScore;
              return s != null ? String(s) : "—";
            }),
          },
          {
            name: "이해율(%)",
            values: attempts.map(
              (a) => a.grammar?.elementaryGrammarPercentage ?? 0
            ),
            display: attempts.map((a) =>
              a.grammar?.elementaryGrammarPercentage != null
                ? `${a.grammar.elementaryGrammarPercentage}%`
                : "—"
            ),
          },
          {
            name: "정답항목",
            values: attempts.map((a) => a.grammar?.correctItemCount ?? 0),
            display: attempts.map((a) =>
              a.grammar?.correctItemCount != null
                ? `${a.grammar.correctItemCount}`
                : "—"
            ),
          },
        ],
      };
    } else if (domain === "listening") {
      subtitle = "대의 파악 · 세부 정보 · 추론 · 상황 표현";
      keyPoints = [
        {
          label: "수준 변화",
          value: seriesJoin(attempts, (a) =>
            shortLevel(
              a.domains.find((d) => d.domain === "listening")?.evaluatedLevel ??
                null
            )
          ),
        },
        {
          label: "대의 파악",
          value:
            subskillSeries(attempts, "listening", ["대의"])?.series ?? "—",
        },
        {
          label: "세부 사항",
          value:
            subskillSeries(attempts, "listening", ["세부"])?.series ?? "—",
        },
        {
          label: "추론",
          value:
            subskillSeries(attempts, "listening", ["추론"])?.series ?? "—",
        },
      ];
      subskills = [
        subskillSeries(attempts, "listening", ["대의"]),
        subskillSeries(attempts, "listening", ["세부"]),
        subskillSeries(attempts, "listening", ["추론"]),
        subskillSeries(attempts, "listening", ["표현", "적절"]),
      ].filter(Boolean) as NeltDomainSection["subskills"];
      chart = {
        kind: "level",
        maxY: 13,
        series: [
          {
            name: "듣기 수준",
            values: attempts.map(
              (a) =>
                a.domains.find((d) => d.domain === "listening")
                  ?.evaluatedLevelOrder ?? 0
            ),
            display: attempts.map((a) =>
              shortLevel(
                a.domains.find((d) => d.domain === "listening")
                  ?.evaluatedLevel ?? null
              )
            ),
          },
        ],
      };
    } else {
      subtitle = "대의 파악 · 세부 내용 · 추론 · 논리적 관계";
      keyPoints = [
        {
          label: "수준 변화",
          value: seriesJoin(attempts, (a) =>
            shortLevel(
              a.domains.find((d) => d.domain === "reading")?.evaluatedLevel ??
                null
            )
          ),
        },
        {
          label: "대의 파악",
          value: subskillSeries(attempts, "reading", ["대의"])?.series ?? "—",
        },
        {
          label: "세부 사항",
          value: subskillSeries(attempts, "reading", ["세부"])?.series ?? "—",
        },
        {
          label: "추론",
          value: subskillSeries(attempts, "reading", ["추론"])?.series ?? "—",
        },
      ];
      subskills = [
        subskillSeries(attempts, "reading", ["대의"]),
        subskillSeries(attempts, "reading", ["세부"]),
        subskillSeries(attempts, "reading", ["추론"]),
        subskillSeries(attempts, "reading", ["논리", "관계"]),
      ].filter(Boolean) as NeltDomainSection["subskills"];
      chart = {
        kind: "level",
        maxY: 13,
        series: [
          {
            name: "독해 수준",
            values: attempts.map(
              (a) =>
                a.domains.find((d) => d.domain === "reading")
                  ?.evaluatedLevelOrder ?? 0
            ),
            display: attempts.map((a) =>
              shortLevel(
                a.domains.find((d) => d.domain === "reading")?.evaluatedLevel ??
                  null
              )
            ),
          },
        ],
      };
    }

    return {
      domain,
      label: DOMAIN_LABEL[domain],
      icon:
        domain === "vocabulary"
          ? "V"
          : domain === "grammar"
            ? "G"
            : domain === "listening"
              ? "L"
              : "R",
      badge,
      badgeTone: tone,
      subtitle,
      stages,
      keyPoints,
      subskills,
      explanation: parentDomainExplanation(analysis, domain),
      plan: analysis.learningPlan[domain].nextGoal,
      chart,
    };
  });
}

export function buildParentOverallSummary(analysis: NeltGrowthAnalysis): string {
  const name = analysis.studentName;
  const n = analysis.attemptCount;
  const v = analysis.vocabularyGrowth;
  const reading = analysis.domainGrowth.find((d) => d.domain === "reading");
  const listening = analysis.domainGrowth.find((d) => d.domain === "listening");
  const grammar = analysis.domainGrowth.find((d) => d.domain === "grammar");

  const bits: string[] = [];
  bits.push(
    `${name} 학생은 ${n}차례의 NELT 평가를 통해 <strong>어휘와 독해 영역에서 가장 뚜렷한 성장</strong>을 보였습니다.`
  );
  if (v.sizeDelta != null && v.sizeDelta > 0) {
    bits.push(
      `어휘량은 약 ${v.beforeSize?.toLocaleString()}단어에서 ${v.afterSize?.toLocaleString()}단어로 확대되었습니다.`
    );
  }
  if (reading?.beforeLevel && reading.afterLevel) {
    bits.push(
      `독해 수준은 ${shortLevel(reading.beforeLevel)}에서 ${shortLevel(reading.afterLevel)}까지 향상되었습니다.`
    );
  }
  if (listening?.afterLevel) {
    bits.push(
      `듣기는 ${shortLevel(listening.afterLevel)} 수준에 도달해 안정적으로 유지하고 있습니다.`
    );
  }
  if (grammar) {
    bits.push(
      `문법은 기초 문장 구조에서 시작해 다양한 문법 항목을 학습하는 단계로 발전했습니다.`
    );
  }
  return bits.join(" ");
}
