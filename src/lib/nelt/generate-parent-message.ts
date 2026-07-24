import {
  buildStudentRecordChatBody,
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  STUDENT_RECORD_MODEL_FALLBACK,
  STUDENT_RECORD_MODEL_PRIMARY,
} from "@/lib/student-records/model";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import {
  buildKoreanNameForms,
  joinKoreanList,
  normalizeStudentNamesInMessage,
  type KoreanNameForms,
} from "@/lib/nelt/korean-name";
import { ACADEMY_NAME } from "@/lib/branding";

export type NeltParentMessageTone = "standard" | "short" | "detail";

export type NeltParentMessageMeta = {
  parentTitle?: string;
  senderRole?: string;
  senderName?: string;
  enrollmentDate?: string | null;
  studyDuration?: string | null;
  reportUrl?: string | null;
  academyName?: string;
  /** 같은 톤에서도 문구가 달라지도록 (재생성 시 전달) */
  variationSeed?: number | string | null;
};

function formatDateDots(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.replaceAll("-", ".");
}

/** 수강 시작일 → "1년 7개월" 형식. 없으면 null */
export function formatStudyDuration(
  enrollmentDate: string | null | undefined,
  asOf: Date = new Date()
): string | null {
  if (!enrollmentDate) return null;
  const start = new Date(`${enrollmentDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  let months =
    (asOf.getFullYear() - start.getFullYear()) * 12 +
    (asOf.getMonth() - start.getMonth());
  if (asOf.getDate() < start.getDate()) months -= 1;
  if (months < 1) return "한 달";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}개월`;
  if (rem === 0) return `${years}년`;
  return `${years}년 ${rem}개월`;
}

function resolveMeta(
  analysis: NeltGrowthAnalysis,
  meta: NeltParentMessageMeta = {}
) {
  const academyName = meta.academyName?.trim() || ACADEMY_NAME;
  const parentTitle = (meta.parentTitle?.trim() || "어머님").replace(
    /^학부모\s*/,
    ""
  );
  const senderRole = meta.senderRole?.trim() || "";
  const senderName = meta.senderName?.trim() || "";
  const enrollmentDate = meta.enrollmentDate?.trim() || null;
  const studyDuration =
    meta.studyDuration?.trim() ||
    formatStudyDuration(enrollmentDate) ||
    null;
  const reportUrl = meta.reportUrl?.trim() || null;
  const latestTestDate =
    formatDateDots(analysis.end.testDate) ||
    formatDateDots(analysis.start.testDate);
  const names = buildKoreanNameForms(analysis.studentName.trim());
  return {
    academyName,
    parentTitle,
    senderRole,
    senderName,
    enrollmentDate,
    studyDuration,
    reportUrl,
    latestTestDate,
    studentName: names.fullName,
    names,
    variationSeed: meta.variationSeed ?? null,
  };
}

export const NELT_PARENT_MESSAGE_TITLE = "[NELT 성장 리포트]";

/** 카카오톡 본문 맨 앞에 제목 보장 */
export function ensureNeltMessageTitle(message: string): string {
  const t = message.trim();
  if (!t) return NELT_PARENT_MESSAGE_TITLE;
  if (
    t.startsWith(NELT_PARENT_MESSAGE_TITLE) ||
    /^\[NELT[^\]]*\]/.test(t)
  ) {
    return t;
  }
  return `${NELT_PARENT_MESSAGE_TITLE}\n\n${t}`;
}

function greetingLine(m: ReturnType<typeof resolveMeta>): string {
  const intro =
    m.senderRole && m.senderName
      ? `${m.academyName} ${m.senderRole} ${m.senderName}입니다.`
      : m.senderName
        ? `${m.academyName} ${m.senderName}입니다.`
        : `${m.academyName}입니다.`;
  // 인사만 풀네임 유지: "서윤우 어머님"
  return `안녕하세요~ ${m.studentName} ${m.parentTitle} :)\n${intro}`;
}

function growthHighlights(analysis: NeltGrowthAnalysis): string[] {
  const out: string[] = [];
  const v = analysis.vocabularyGrowth;
  if (v.sizeDelta != null && v.sizeDelta > 0) {
    out.push(
      `알고 있는 어휘가 약 ${v.beforeSize?.toLocaleString()}단어에서 약 ${v.afterSize?.toLocaleString()}단어로 늘었습니다`
    );
  }
  if (v.requiredPctDelta != null && v.requiredPctDelta > 0) {
    out.push(
      `초등 필수 어휘 이해도가 ${v.beforeRequiredPct}%에서 ${v.afterRequiredPct}%로 올랐습니다`
    );
  }
  for (const d of analysis.domainGrowth) {
    if (
      (d.status === "major_growth" || d.status === "growth") &&
      d.levelDelta != null &&
      d.levelDelta > 0.4 &&
      d.beforeLevel &&
      d.afterLevel &&
      d.beforeLevel !== d.afterLevel
    ) {
      out.push(
        `${d.label} 실력이 ${d.beforeLevel}에서 ${d.afterLevel} 수준으로 올라왔습니다`
      );
    }
  }
  if (
    analysis.start.overallLevel &&
    analysis.end.overallLevel &&
    analysis.start.overallLevel !== analysis.end.overallLevel
  ) {
    out.unshift(
      `종합 레벨이 ${analysis.start.overallLevel}에서 ${analysis.end.overallLevel}로 올랐습니다`
    );
  }
  if (
    analysis.start.overallPercentile != null &&
    analysis.end.overallPercentile != null &&
    analysis.end.overallPercentile < analysis.start.overallPercentile
  ) {
    out.push(
      `동학년 대비 위치가 상위 ${analysis.start.overallPercentile}%에서 상위 ${analysis.end.overallPercentile}%로 향상되었습니다`
    );
  }
  return out.slice(0, 4);
}

function mainGrowthAreas(analysis: NeltGrowthAnalysis): string[] {
  return analysis.domainGrowth
    .filter(
      (d) =>
        d.status === "major_growth" ||
        d.status === "growth" ||
        d.status === "advanced_challenge"
    )
    .map((d) => d.label)
    .slice(0, 3);
}

function focusAreas(analysis: NeltGrowthAnalysis): string[] {
  const focus = analysis.domainGrowth
    .filter((d) => d.status === "focus_needed")
    .map((d) => d.label);
  if (focus.length > 0) return focus.slice(0, 2);
  return analysis.domainGrowth
    .filter((d) => d.status === "maintained")
    .map((d) => d.label)
    .slice(0, 1);
}

function learningPlanLines(analysis: NeltGrowthAnalysis): string[] {
  const labels = focusAreas(analysis);
  const lines: string[] = [];
  for (const label of labels) {
    const d = analysis.domainGrowth.find((x) => x.label === label);
    if (d) lines.push(analysis.learningPlan[d.domain].nextGoal);
  }
  if (lines.length > 0) return lines.slice(0, 2);
  return [analysis.nextGoalsNarrative].filter(Boolean).slice(0, 2);
}

function variationIndex(seed: number | string | null | undefined, mod: number): number {
  if (mod <= 0) return 0;
  if (seed == null || seed === "") {
    return Math.floor(Math.random() * mod);
  }
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function durationParagraph(
  names: KoreanNameForms,
  academyName: string,
  studyDuration: string | null,
  variant: number
): string {
  const { eunNeun, iGa, ui } = names;
  if (studyDuration) {
    const opts = [
      `${eunNeun} ${academyName}과 함께 공부한 지도 어느덧 ${studyDuration}이 되었습니다.\n처음 수업을 시작했을 때와 비교하면 영어를 대하는 태도와 기본 실력 모두 많이 안정된 모습입니다.`,
      `${academyName}에서 ${iGa} 영어를 배우기 시작한 지 ${studyDuration}, 차근차근 실력이 쌓이는 게 느껴집니다.`,
      `${ui} 수업이 ${studyDuration}째 이어지고 있는데요. 그동안의 변화를 이번 NELT로 정리해 보았습니다.`,
    ];
    return opts[variant % opts.length]!;
  }
  const opts = [
    `${eunNeun} ${academyName}에서 꾸준히 영어 공부를 이어오고 있는데요.\n그동안 쌓아 온 실력을 확인해 보기 위해 이번에 NELT를 진행했습니다.`,
    `${academyName}에서 ${iGa} 차근차근 실력을 키워 오고 있습니다.\n그 흐름을 확인해 보고자 이번에 NELT 결과를 모아 보았습니다.`,
    `평소 수업에서 ${ui} 성장이 느껴져, 이번엔 NELT로 구체적인 변화를 정리해 드렸습니다.`,
  ];
  return opts[variant % opts.length]!;
}

function neltReasonParagraph(
  names: KoreanNameForms,
  studyDuration: string | null,
  attemptCount: number,
  variant: number
): string {
  const { iGa, eunNeun } = names;
  if (!studyDuration) return "";
  const again = attemptCount >= 2 ? "다시 " : "";
  const opts = [
    `그동안 ${iGa} 어떻게 성장했는지 확인해 보기 위해 이번에 NELT를 ${again}진행했습니다.`,
    `${eunNeun} 수업 시간에 보여 준 변화를 숫자로도 확인하고자 NELT를 ${again}실시했습니다.`,
    `학원에서 쌓아 온 실력을 한눈에 보여 드리려고 NELT를 ${again}진행했습니다.`,
  ];
  return opts[variant % opts.length]!;
}

function deliverParagraph(attemptCount: number, variant: number): string {
  const opts = [
    `${attemptCount}차례의 결과를 모아 성장 리포트로 정리해 보내드립니다.`,
    `NELT ${attemptCount}회 결과를 한곳에 모아, 성장이 보이는 부분 위주로 정리했습니다.`,
    `${attemptCount}번의 기록을 비교해 보니 변화가 분명해, 학부모님께 공유드립니다.`,
  ];
  return opts[variant % opts.length]!;
}

function praiseParagraph(names: KoreanNameForms, variant: number): string {
  const { iGa, eunNeun } = names;
  const opts = [
    `짧은 기간에 만들어진 결과라기보다, ${iGa} 수업과 학습을 꾸준히 따라와 준 결과라고 생각합니다.\n성장한 부분은 충분히 칭찬해 주셔도 좋을 것 같습니다.`,
    `${eunNeun} 꾸준히 따라와 준 덕분에 이런 변화가 보였습니다. 가정에서도 한 번 꼭 칭찬해 주시면 좋겠습니다.`,
    `숫자로만 보면 간단해 보여도, 매일 수업에서 쌓인 노력이 반영된 결과입니다. ${iGa} 스스로도 뿌듯해할 만합니다.`,
  ];
  return opts[variant % opts.length]!;
}

function closingParagraph(
  names: KoreanNameForms,
  tone: NeltParentMessageTone,
  variant: number
): string {
  const { iGa, ui, eunNeun } = names;
  if (tone === "short") {
    const opts = [
      `앞으로도 ${iGa} 꾸준히 성장할 수 있도록 세심하게 지도하겠습니다.\n궁금하신 부분은 언제든 편하게 말씀해 주세요. 감사합니다 :)`,
      `${ui} 다음 목표도 수업에서 차근차근 챙기겠습니다. 편하게 연락 주세요~`,
    ];
    return opts[variant % opts.length]!;
  }
  const opts = [
    `앞으로도 ${ui} 강점은 더욱 살리고,\n아직 채워야 할 부분은 수업에서 꼼꼼히 보완해 나가겠습니다.\n리포트를 보시고 궁금하신 부분이 있으시면\n언제든 편하게 말씀해 주세요~ 감사합니다.`,
    `${eunNeun} 앞으로 더 자신 있게 영어를 쓸 수 있도록 학원에서 세심히 챙기겠습니다.\n리포트 보시며 궁금한 점 있으시면 언제든 말씀해 주세요.`,
    `가정과 학원이 같은 방향으로 응원해 주시면 ${iGa} 더 빠르게 안정될 수 있습니다.\n궁금하신 부분은 편하게 연락 주세요. 감사합니다 :)`,
  ];
  return opts[variant % opts.length]!;
}

/** 규칙 기반 폴백 — 따뜻한 카카오톡 편지형 (버전 다양) */
export function buildNeltParentMessageFallback(
  analysis: NeltGrowthAnalysis,
  academyNameOrMeta: string | NeltParentMessageMeta = ACADEMY_NAME,
  tone: NeltParentMessageTone = "standard"
): string {
  const metaIn: NeltParentMessageMeta =
    typeof academyNameOrMeta === "string"
      ? { academyName: academyNameOrMeta }
      : academyNameOrMeta;
  const m = resolveMeta(analysis, metaIn);
  const names = m.names;
  const v = variationIndex(m.variationSeed, 6);
  const highlights = growthHighlights(analysis);
  const areas = mainGrowthAreas(analysis);
  const focus = focusAreas(analysis);
  const plans = learningPlanLines(analysis);
  const highlightLimit = tone === "short" ? 2 : 3;

  const parts: string[] = [];
  parts.push(NELT_PARENT_MESSAGE_TITLE);
  parts.push("");
  parts.push(greetingLine(m));
  parts.push("");
  parts.push(durationParagraph(names, m.academyName, m.studyDuration, v));

  const reason = neltReasonParagraph(
    names,
    m.studyDuration,
    analysis.attemptCount,
    v + 1
  );
  if (reason) {
    parts.push("");
    parts.push(reason);
  }

  parts.push("");
  parts.push(deliverParagraph(analysis.attemptCount, v + 2));

  if (highlights.length > 0) {
    parts.push("");
    const areaLabel = joinKoreanList(areas);
    const areaOpts = [
      areaLabel
        ? `이번 누적 결과에서 가장 눈에 띄는 부분은 ${areaLabel}입니다.`
        : "이번 누적 결과에서 눈에 띄는 성장이 확인되었습니다.",
      areaLabel
        ? `특히 ${areaLabel} 쪽에서 변화가 또렷했습니다.`
        : "전반적으로 고른 성장 흐름이 보였습니다.",
      areaLabel
        ? `학부모님께 가장 먼저 말씀드리고 싶은 성장은 ${areaLabel}입니다.`
        : "작은 변화들이 모여 확실한 성장으로 이어지고 있습니다.",
    ];
    parts.push(areaOpts[v % areaOpts.length]!);
    // 하이라이트 순서도 살짝 섞기
    const ordered = [...highlights];
    if (v % 2 === 1) ordered.reverse();
    parts.push(ordered.slice(0, highlightLimit).join(".\n") + ".");
  }

  if (tone !== "short") {
    parts.push("");
    parts.push(praiseParagraph(names, v));
  }

  if (tone !== "short" && (focus.length > 0 || plans.length > 0)) {
    parts.push("");
    if (focus.length > 0) {
      const focusLabel = joinKoreanList(focus);
      const focusOpts = [
        `${focusLabel} 쪽은 아직 조금 더 연습이 필요한 부분도 함께 확인할 수 있었습니다.`,
        `다음으로 다듬을 부분은 ${focusLabel}입니다. 부담 없이 수업에서 천천히 채워가면 됩니다.`,
        `${focusLabel}은 지금부터 수업 안에서 더 자주 다루겠습니다.`,
      ];
      parts.push(focusOpts[v % focusOpts.length]!);
    }
    if (plans.length > 0) {
      parts.push(`앞으로는 ${plans.join(" ")}`);
    } else {
      parts.push("앞으로는 이 부분을 수업에서 더욱 꼼꼼히 채워가겠습니다.");
    }
  }

  parts.push("");
  parts.push(
    "자세한 영역별 변화와 앞으로의 학습 계획은\n아래 리포트에 정리해 두었습니다."
  );
  if (m.reportUrl) {
    parts.push("");
    parts.push(m.reportUrl);
  }

  parts.push("");
  parts.push(closingParagraph(names, tone, v));

  const raw = parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalizeStudentNamesInMessage(raw, m.studentName);
}

const STYLE_HINTS = [
  "조금 더 다정하고 짧은 문장 위주로",
  "성장 수치를 문장 앞에 자연스럽게 배치",
  "칭찬을 한 문단 더 살리고 보완점은 부드럽게",
  "수업 장면이 떠오르도록 구체적 표현",
  "학부모 안심이 느껴지게 차분한 톤",
  "첫 성장 문단을 다른 순서로 시작해 차별화",
];

function systemForTone(tone: NeltParentMessageTone): string {
  const lengthHint =
    tone === "short"
      ? "분량: 공백 포함 약 350~500자. 성장 사실 2개, 보완점은 짧게 1개."
      : tone === "detail"
        ? "분량: 공백 포함 약 700~900자. 성장 사실 3개 + 보완·지도 계획 구체화."
        : "분량: 공백 포함 약 500~800자. 문단 5~7개.";

  return `당신은 정수학원 영어 선생님이 학부모에게 보내는 카카오톡 안내문을 작성한다.

목적: 일반적인 성적표 발송 공지가 아니라, 학생이 정수학원에서 공부해 온 시간과 성장 과정을 함께 돌아보며 따뜻하게 리포트를 전달하는 메시지.

말투: 따뜻하고 친근한 카카오톡 말투. 학부모에게 직접 이야기하듯. 가볍거나 장난스럽지 않게.
첫 문장 형식(필수):
안녕하세요~ {fullName} {parentTitle} :)
정수학원 {senderRole} {senderName}입니다.
(senderRole/senderName이 없으면 "정수학원입니다."로 대체. parentTitle이 아버님이면 어머님을 쓰지 말 것.)

이름 규칙(매우 중요):
- 인사(어머님/아버님 앞)에만 성+이름 풀네임(fullName)을 쓴다. 예: "서윤우 어머님"
- 본문에서는 반드시 이름만(givenName)을 쓴다. 예: 서윤우→윤우, 신지환→지환
- 조사는 받침에 맞게: 윤우가/윤우는/윤우의, 지환이/지환이는/지환의
- 절대 "서윤우가", "신지환가"처럼 풀네임+잘못된 조사를 쓰지 말 것.
- 학생 이름 뒤에 "학생"을 반복하지 말 것.

다양성(필수):
- 매번 문장 구조·연결어·문단 시작을 바꿔 다른 버전의 편지를 쓴다.
- 같은 템플릿 문장("꾸준히 영어 공부를 이어오고 있는데요", "3차례의 결과를 모아 성장 리포트로 정리해 보내드립니다")을 그대로 복사하지 말 것.
- styleHint와 variationSeed를 반영해 표현을 달리할 것.

문장 끝 예시: 보내드립니다 / 확인해 보시면 좋을 것 같습니다 / 앞으로도 꼼꼼히 지도하겠습니다 / 함께 지켜봐 주세요 / 궁금하신 부분은 언제든 편하게 말씀해 주세요.

절대 금지 표현:
판정 수준, 귀 자녀, 상기 학생, 평가 결과를 송부드립니다, 다음과 같이 안내드립니다, 분석 결과에 의하면, 학습 결손, 현저히 부족함, 성취도가 저조함, 보완이 요구됩니다, 참고하시기 바랍니다, 점수가 하락했습니다, 성적이 떨어졌습니다, 서로 다른 난이도는 단순 비교하지 않습니다.

"판정 수준" 대신 "실력", "학년 수준", "초등 ○학년 수준"처럼 자연스럽게 말할 것.
학년 수준이 실제로 오른 경우만 성장이라고 말할 것. 시험 범위(난이도)만 넓어지고 실력이 그대로이거나 낮아진 경우는 성장이라고 쓰지 말고 "더 넓은 범위에 도전"으로 설명할 것.
기계적·보고서 말투("확인됩니다", "분석 결과")를 피하고 선생님이 학부모께 말하듯 쓸 것.

이모티콘: 첫 인사 :) 또는 마무리에 가벼운 기호 최대 1~2개. 하트·박수·불꽃 과다 금지.

구성 순서(필수):
0) 맨 첫 줄에 반드시 단독으로: [NELT 성장 리포트]
1) 따뜻한 인사와 발신자 소개
2) 학생이 정수학원과 함께한 기간 (studyDuration 있으면 시간의 흐름이 느껴지게; 없으면 임의 기간 만들지 말고 꾸준히 공부해 온 흐름으로)
3) 이번 NELT를 실시한 이유
4) 성장 리포트 전달 안내
5) 가장 크게 성장한 부분 2~3개 (실제 수치·수준만, 추상적 "많이 향상" 금지)
6) 성장에 대한 따뜻한 칭찬
7) 보완할 부분 1~2개 + 구체적 지도 계획 (부정 평가 금지, 다음 학습 목표로)
8) 리포트 링크 안내 후 링크 단독 줄 (reportUrl 있을 때만 URL 출력; 없으면 URL을 지어내지 말 것)
9) 함께 성장·문의 환영 마무리

"학원 안내" 같은 별도의 섹션 제목은 쓰지 말 것.
목록·보고서 형식보다 자연스러운 편지형. 핵심 성장이 많을 때만 짧은 항목 2~3개 허용.
${lengthHint}
반드시 제공된 JSON 사실만 사용. 없는 기간·없는 성장을 만들지 말 것.
상위 %는 향상된 경우(숫자 감소)에만 언급.
안내문 본문만 출력. 작성 설명·마크다운 금지.`;
}

function getNeltParentMessageModels(): string[] {
  const configured = process.env.OPENAI_MODEL_NELT?.trim();
  const list = [
    configured,
    STUDENT_RECORD_MODEL_PRIMARY,
    "gpt-5.5",
    STUDENT_RECORD_MODEL_FALLBACK,
    "gpt-5",
  ].filter((m): m is string => Boolean(m && m.trim()));
  return [...new Set(list)];
}

export async function generateNeltParentMessageAi(
  analysis: NeltGrowthAnalysis,
  academyNameOrMeta: string | NeltParentMessageMeta = ACADEMY_NAME,
  tone: NeltParentMessageTone = "standard"
): Promise<{ ok: true; message: string; model: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 없습니다." };
  }

  const metaIn: NeltParentMessageMeta =
    typeof academyNameOrMeta === "string"
      ? { academyName: academyNameOrMeta }
      : academyNameOrMeta;
  const m = resolveMeta(analysis, metaIn);
  const seed =
    m.variationSeed != null && m.variationSeed !== ""
      ? String(m.variationSeed)
      : String(Date.now());
  const styleHint = STYLE_HINTS[variationIndex(seed, STYLE_HINTS.length)]!;

  const facts = {
    tone,
    variationSeed: seed,
    styleHint,
    fullName: m.names.fullName,
    givenName: m.names.givenName,
    nameForms: {
      iGa: m.names.iGa,
      eunNeun: m.names.eunNeun,
      ui: m.names.ui,
      eulReul: m.names.eulReul,
    },
    parentTitle: m.parentTitle,
    senderRole: m.senderRole || null,
    senderName: m.senderName || null,
    academyName: m.academyName,
    enrollmentDate: m.enrollmentDate,
    studyDuration: m.studyDuration,
    attemptCount: analysis.attemptCount,
    latestTestDate: m.latestTestDate,
    reportUrl: m.reportUrl,
    mainGrowthAreas: mainGrowthAreas(analysis),
    growthHighlights: growthHighlights(analysis),
    focusAreas: focusAreas(analysis),
    learningPlan: learningPlanLines(analysis),
    overall: {
      from: analysis.start.overallLevel,
      to: analysis.end.overallLevel,
      percentileFrom: analysis.start.overallPercentile,
      percentileTo: analysis.end.overallPercentile,
      percentileImproved:
        analysis.start.overallPercentile != null &&
        analysis.end.overallPercentile != null &&
        analysis.end.overallPercentile < analysis.start.overallPercentile,
    },
    vocabulary: analysis.vocabularyGrowth,
    domains: analysis.domainGrowth.map((d) => ({
      label: d.label,
      status: d.status,
      beforeLevel: d.beforeLevel,
      afterLevel: d.afterLevel,
      difficultyUp: d.difficultyUp,
      beforeDifficulty: d.beforeDifficulty,
      afterDifficulty: d.afterDifficulty,
    })),
  };

  const user = `다음 JSON 사실만으로 학부모 카카오톡 안내문을 한국어로 작성하세요.
본문 이름·조사는 nameForms(iGa/eunNeun/ui)를 그대로 사용하세요.
styleHint(${styleHint})와 variationSeed(${seed})에 맞춰 이전과 다른 문장으로 쓰세요.

${JSON.stringify(facts, null, 2)}`;
  const SYSTEM = systemForTone(tone);

  const candidates = getNeltParentMessageModels();
  let lastErr = "AI 생성 실패";

  for (const model of candidates) {
    try {
      let includeTemperature = true;
      let includeReasoningEffort = true;
      for (let attempt = 0; attempt < 4; attempt++) {
        const body = buildStudentRecordChatBody(model, SYSTEM, user, {
          includeTemperature,
          includeReasoningEffort,
        });
        // gpt-5 계열은 temperature 미지원 — 넣지 않음
        if (
          includeTemperature &&
          "temperature" in body &&
          !isGpt5FamilyModel(model)
        ) {
          body.temperature = 0.9;
        }
        if (isGpt5FamilyModel(model)) {
          // reasoning이 completion을 잡아먹어 빈 응답이 나오지 않게
          body.max_completion_tokens = tone === "detail" ? 5000 : 4000;
          if (includeReasoningEffort) {
            body.reasoning_effort = attempt >= 2 ? "low" : "medium";
          }
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        if (!res.ok) {
          if (isModelUnavailableError(res.status, text)) {
            lastErr = text.slice(0, 200);
            break;
          }
          if (includeTemperature && isUnsupportedTemperatureError(text)) {
            includeTemperature = false;
            continue;
          }
          if (
            includeReasoningEffort &&
            isUnsupportedParameterError(text, "reasoning_effort")
          ) {
            includeReasoningEffort = false;
            continue;
          }
          lastErr = text.slice(0, 200);
          break;
        }
        const json = JSON.parse(text) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content?.trim();
        if (!content) {
          lastErr = "빈 응답";
          // 빈 응답이면 reasoning 낮추고 재시도
          if (includeReasoningEffort && attempt < 3) {
            includeReasoningEffort = attempt >= 1 ? false : true;
            if (attempt >= 1) includeReasoningEffort = false;
            continue;
          }
          break;
        }
        const normalized = normalizeStudentNamesInMessage(
          ensureNeltMessageTitle(content),
          m.studentName
        );
        return { ok: true, message: normalized, model };
      }
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "요청 실패";
    }
  }

  return { ok: false, message: lastErr };
}

/** 공유 링크를 안내문 본문에 자연스럽게 붙이거나 교체 */
export function attachReportUrlToMessage(
  message: string,
  reportUrl: string
): string {
  const url = reportUrl.trim();
  const base = ensureNeltMessageTitle(message);
  if (!url) return base;
  if (base.includes(url)) return base;
  if (/https?:\/\/\S+/i.test(base)) {
    return base.replace(/https?:\/\/\S+/gi, url);
  }
  return `${base}\n\n자세한 영역별 변화와 앞으로의 학습 계획은\n아래 리포트에 정리해 두었습니다.\n\n${url}`;
}
