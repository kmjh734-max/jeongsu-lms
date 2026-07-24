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
    /** 전체 영역 그래프와 동일하게 수준(order) 기준 */
    kind: "level" | "metrics";
    series: Array<{
      name: string;
      values: number[];
      display: string[];
    }>;
    maxY: number;
    /** 수준 그래프 색 — 전체 영역 차트와 맞춤 */
    color?: string;
  };
};

/** 영역별 수준 선그래프 (전체 영역 변화와 같은 축) */
function levelChartForDomain(
  attempts: NeltAttemptBundle[],
  domain: NeltDomain,
  seriesName: string
): NeltDomainSection["chart"] {
  const values = attempts.map(
    (a) =>
      a.domains.find((d) => d.domain === domain)?.evaluatedLevelOrder ?? 0
  );
  return {
    kind: "level",
    maxY: 13,
    color:
      domain === "vocabulary"
        ? "#f28c28"
        : domain === "grammar"
          ? "#244a78"
          : domain === "listening"
            ? "#168f62"
            : "#7c3aed",
    series: [
      {
        name: seriesName,
        values,
        display: attempts.map((a) =>
          shortLevel(
            a.domains.find((d) => d.domain === domain)?.evaluatedLevel ?? null
          )
        ),
      },
    ],
  };
}

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

function levelUp(g: { levelDelta: number | null } | undefined): boolean {
  return g?.levelDelta != null && g.levelDelta > 0.4;
}

function domainBadge(
  analysis: NeltGrowthAnalysis,
  domain: NeltDomain
): { badge: string; tone: "growth" | "focus" | "stable" } {
  const g = analysis.domainGrowth.find((d) => d.domain === domain);
  if (!g) return { badge: "변화 살펴보기", tone: "stable" };
  if (
    (g.status === "major_growth" || g.status === "growth") &&
    levelUp(g)
  ) {
    if (domain === "vocabulary") return { badge: "가장 큰 성장", tone: "growth" };
    if (domain === "reading") return { badge: "꾸준히 올라옴", tone: "growth" };
    return { badge: "실력 향상", tone: "growth" };
  }
  if (g.status === "advanced_challenge" || g.difficultyUp) {
    return { badge: "더 넓은 범위 도전", tone: "stable" };
  }
  if (g.status === "focus_needed") {
    return { badge: "앞으로 채워갈 부분", tone: "focus" };
  }
  if (domain === "listening") {
    return { badge: `${shortLevel(g.afterLevel)} 유지`, tone: "stable" };
  }
  return { badge: "실력 유지", tone: "stable" };
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
  const g = analysis.domainGrowth.find((d) => d.domain === domain);
  const plan = analysis.learningPlan[domain];
  const up = levelUp(g);
  const sameLevel =
    !!d0?.evaluatedLevel &&
    !!dN?.evaluatedLevel &&
    d0.evaluatedLevel === dN.evaluatedLevel;

  if (domain === "vocabulary") {
    const s0 = first.vocabulary?.vocabularySize;
    const sN = last.vocabulary?.vocabularySize;
    const e0 = first.vocabulary?.elementaryRequiredPercentage;
    const eN = last.vocabulary?.elementaryRequiredPercentage;
    const use = subskillSeries(attempts, "vocabulary", ["사용"]);
    const ctx = subskillSeries(attempts, "vocabulary", ["문맥"]);
    const sizeUp = s0 != null && sN != null && sN > s0;
    const pctUp = e0 != null && eN != null && eN > e0;
    return [
      up
        ? `어휘 실력은 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)} 정도까지 넓어졌습니다.`
        : sameLevel
          ? `어휘는 ${shortLevel(dN?.evaluatedLevel)} 실력을 잘 이어가고 있습니다.`
          : `어휘는 지금 ${shortLevel(dN?.evaluatedLevel)} 정도를 기준으로 보면 됩니다.`,
      sizeUp
        ? `알고 있는 단어는 약 ${s0!.toLocaleString()}개에서 약 ${sN!.toLocaleString()}개로 늘었습니다.`
        : "",
      pctUp
        ? `초등에서 꼭 알아야 할 어휘도 ${e0}%에서 ${eN}%까지 더 잘 이해하고 있습니다.`
        : "",
      ctx ? `문장 속에서 뜻을 파악하는 모습은 ${ctx.series}로 나타났습니다.` : "",
      use ? `단어를 문장에 맞게 쓰는 연습은 ${use.series}입니다.` : "",
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
      up
        ? `문법은 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)} 수준으로 기초가 넓어졌습니다.`
        : g?.difficultyUp
          ? `문법은 ${codes || "다음"} 범위에 도전해 보며, 앞으로 채울 항목이 더 분명해졌습니다.`
          : `문법은 ${shortLevel(dN?.evaluatedLevel)} 기초를 다지는 단계입니다.`,
      newly.length
        ? `최근에는 ${newly.join("·")} 같은 항목을 잘 이해하고 있습니다.`
        : "",
      focus.length
        ? `앞으로는 ${focus.join("·")}을(를) 문장 속에서 쓰는 연습을 수업에서 이어가겠습니다.`
        : plan.nextGoal,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (domain === "listening") {
    const main = subskillSeries(attempts, "listening", ["대의"]);
    return [
      up
        ? `듣기는 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)} 수준으로 올라왔습니다.`
        : `듣기는 ${shortLevel(dN?.evaluatedLevel)} 실력을 잘 유지하고 있습니다.`,
      main
        ? `대화의 중심 내용을 잡는 모습은 ${main.series}로 나타났습니다.`
        : "",
      "앞으로는 세부 내용을 놓치지 않도록 받아쓰기와 짧은 따라 읽기를 함께 하겠습니다.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  // reading
  const main = subskillSeries(attempts, "reading", ["대의"]);
  const detail = subskillSeries(attempts, "reading", ["세부"]);
  return [
    up
      ? `독해는 ${shortLevel(d0?.evaluatedLevel)}에서 ${shortLevel(dN?.evaluatedLevel)}까지 차근차근 올라왔습니다.`
      : sameLevel
        ? `독해는 ${shortLevel(dN?.evaluatedLevel)} 실력을 이어가고 있습니다.`
        : `독해는 지금 ${shortLevel(dN?.evaluatedLevel)} 정도를 기준으로 지도하고 있습니다.`,
    main ? `글의 중심 내용을 파악하는 모습은 ${main.series}입니다.` : "",
    detail ? `세부 내용을 찾는 연습은 ${detail.series}입니다.` : "",
    "앞으로는 숨은 뜻을 찾는 문제와 문장 연결을 조금 더 연습하겠습니다.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDomainSections(
  analysis: NeltGrowthAnalysis,
  overrides?: {
    explanations?: Partial<Record<NeltDomain, string>>;
    plans?: Partial<Record<NeltDomain, string>>;
  }
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
      chart = levelChartForDomain(attempts, "vocabulary", "어휘 수준");
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
      chart = levelChartForDomain(attempts, "grammar", "문법 수준");
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
      chart = levelChartForDomain(attempts, "listening", "듣기 수준");
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
      chart = levelChartForDomain(attempts, "reading", "독해 수준");
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
      explanation:
        overrides?.explanations?.[domain]?.trim() ||
        parentDomainExplanation(analysis, domain),
      plan:
        overrides?.plans?.[domain]?.trim() ||
        analysis.learningPlan[domain].nextGoal,
      chart,
    };
  });
}

export function buildParentOverallSummary(analysis: NeltGrowthAnalysis): string {
  const name = analysis.studentName;
  const n = analysis.attemptCount;
  const v = analysis.vocabularyGrowth;
  const grown = analysis.domainGrowth.filter(
    (d) =>
      (d.status === "major_growth" || d.status === "growth") &&
      d.levelDelta != null &&
      d.levelDelta > 0.4
  );
  const bits: string[] = [];

  if (grown.length > 0) {
    bits.push(
      `${name}는 ${n}차례 NELT를 거쳐 <strong>${grown
        .map((d) => d.label)
        .join("·")}에서 실력이 눈에 띄게 좋아졌습니다</strong>.`
    );
  } else {
    bits.push(
      `${name}는 ${n}차례 NELT를 통해 지금 실력을 점검하고, 앞으로 채울 부분을 정리해 보았습니다.`
    );
  }

  if (v.sizeDelta != null && v.sizeDelta > 0) {
    bits.push(
      `알고 있는 단어는 약 ${v.beforeSize?.toLocaleString()}개에서 ${v.afterSize?.toLocaleString()}개로 늘었습니다.`
    );
  }

  for (const d of grown.slice(0, 2)) {
    if (d.beforeLevel && d.afterLevel && d.beforeLevel !== d.afterLevel) {
      bits.push(
        `${d.label}는 ${shortLevel(d.beforeLevel)}에서 ${shortLevel(d.afterLevel)} 수준으로 올라왔습니다.`
      );
    }
  }

  const listening = analysis.domainGrowth.find((d) => d.domain === "listening");
  if (
    listening?.afterLevel &&
    !grown.some((d) => d.domain === "listening")
  ) {
    bits.push(
      `듣기는 ${shortLevel(listening.afterLevel)} 실력을 잘 유지하고 있습니다.`
    );
  }

  const challenge = analysis.domainGrowth.filter(
    (d) =>
      d.difficultyUp &&
      (d.levelDelta == null || d.levelDelta <= 0.4)
  );
  if (challenge.length > 0) {
    bits.push(
      `${challenge.map((d) => d.label).join("·")}은 더 넓은 범위에 도전해 보았고, 수업에서 차근차근 채워가겠습니다.`
    );
  }

  return bits.join(" ");
}
