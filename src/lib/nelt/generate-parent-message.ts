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
  /** 재생성 시 살짝 다른 표현을 유도 */
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
  return `안녕하세요~ ${m.studentName} ${m.parentTitle} :)\n${intro}`;
}

/** AI/폴백 공통 — 짧고 읽기 쉬운 성장 사실 */
function growthHighlights(analysis: NeltGrowthAnalysis): string[] {
  const out: string[] = [];
  const v = analysis.vocabularyGrowth;
  if (v.sizeDelta != null && v.sizeDelta > 0) {
    out.push(
      `아는 단어가 대략 ${v.beforeSize?.toLocaleString()}개에서 ${v.afterSize?.toLocaleString()}개 정도로 늘었어요`
    );
  }
  if (v.requiredPctDelta != null && v.requiredPctDelta > 0) {
    out.push(
      `초등 필수 어휘도 ${v.beforeRequiredPct}% → ${v.afterRequiredPct}%로 올랐습니다`
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
        `${d.label}는 ${d.beforeLevel}에서 ${d.afterLevel} 수준으로 올라왔어요`
      );
    }
  }
  if (
    analysis.start.overallLevel &&
    analysis.end.overallLevel &&
    analysis.start.overallLevel !== analysis.end.overallLevel
  ) {
    out.unshift(
      `종합 레벨이 ${analysis.start.overallLevel} → ${analysis.end.overallLevel}로 올랐습니다`
    );
  }
  if (
    analysis.start.overallPercentile != null &&
    analysis.end.overallPercentile != null &&
    analysis.end.overallPercentile < analysis.start.overallPercentile
  ) {
    out.push(
      `같은 학년 기준으로도 상위 ${analysis.start.overallPercentile}%에서 ${analysis.end.overallPercentile}%로 자리가 좋아졌어요`
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

function variationIndex(
  seed: number | string | null | undefined,
  mod: number
): number {
  if (mod <= 0) return 0;
  if (seed == null || seed === "") {
    return Math.floor(Math.random() * mod);
  }
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function softPlanLine(raw: string): string {
  const t = raw.trim();
  if (!t) return "수업에서 그 부분을 조금 더 자주 다뤄볼게요.";
  // learningPlan이 보고서체일 때 부드럽게
  return t
    .replace(/하겠습니다\.?$/u, "할게요.")
    .replace(/보완해 나가겠습니다\.?$/u, "차근차근 채워갈게요.")
    .replace(/지도하겠습니다\.?$/u, "챙길게요.");
}

/** 규칙 기반 폴백 — 실제 카톡처럼 짧게 */
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
  const v = variationIndex(m.variationSeed, 3);
  const highlights = growthHighlights(analysis);
  const areas = mainGrowthAreas(analysis);
  const focus = focusAreas(analysis);
  const plans = learningPlanLines(analysis).map(softPlanLine);
  const highlightLimit = tone === "short" ? 2 : tone === "detail" ? 3 : 2;

  const openers = buildOpeners(names, m.academyName, m.studyDuration);
  const delivers = [
    `NELT를 ${analysis.attemptCount}번 본 결과를 모아서, 성장한 부분 위주로 정리해 드렸어요.`,
    `${analysis.attemptCount}번 본 NELT를 비교해 보니 변화가 보여서, 리포트로 묶어서 보내드립니다.`,
    `그동안 본 NELT ${analysis.attemptCount}회를 한데 모아 리포트로 정리했습니다.`,
  ];

  const parts: string[] = [
    NELT_PARENT_MESSAGE_TITLE,
    "",
    greetingLine(m),
    "",
    openers[v]!,
    "",
    delivers[v]!,
  ];

  if (highlights.length > 0) {
    const areaLabel = joinKoreanList(areas);
    parts.push("");
    parts.push(
      areaLabel
        ? `특히 ${areaLabel}에서 변화가 잘 보였어요.`
        : "눈에 띄는 변화가 몇 가지 있었습니다."
    );
    for (const h of highlights.slice(0, highlightLimit)) {
      parts.push(`· ${h}`);
    }
  }

  if (tone !== "short") {
    parts.push("");
    parts.push(
      [
        `${names.iGa} 수업에서 꾸준히 따라와 준 덕분이에요. 집에서도 한 번 칭찬해 주시면 좋을 것 같아요.`,
        `한순간에 나온 결과가 아니라, ${names.eunNeun} 평소에 잘 따라와 줘서 나온 변화예요.`,
        `${names.ui} 노력 덕분입니다. 성장한 부분은 꼭 말씀해 주시고 격려해 주세요.`,
      ][v]!
    );
  }

  if (tone !== "short" && (focus.length > 0 || plans.length > 0)) {
    parts.push("");
    if (focus.length > 0) {
      parts.push(
        `${joinKoreanList(focus)}는 앞으로 수업에서 좀 더 다듬으면 좋겠어요.`
      );
    }
    if (plans.length > 0) {
      parts.push(plans[0]!);
    } else {
      parts.push("그 부분은 수업에서 차근차근 챙길게요.");
    }
  }

  parts.push("");
  parts.push("자세한 내용은 아래 리포트에 적어 두었습니다.");
  if (m.reportUrl) {
    parts.push("");
    parts.push(m.reportUrl);
  }

  parts.push("");
  if (tone === "short") {
    parts.push(
      `궁금한 점 있으시면 편하게 말씀해 주세요.\n감사합니다 :)`
    );
  } else {
    parts.push(
      [
        `앞으로도 ${names.ui} 강점은 살리고, 부족한 부분은 수업에서 꼼꼼히 챙길게요.\n궁금한 점 있으시면 언제든 편하게 연락 주세요~`,
        `${names.eunNeun} 더 자신 있게 영어를 쓸 수 있도록 학원에서 잘 지도하겠습니다.\n리포트 보시고 궁금하신 거 있으면 편하게 말씀해 주세요.`,
        `가정에서도 한 번씩 응원해 주시면 ${names.iGa} 더 힘을 낼 거예요.\n궁금한 점 있으시면 언제든 말씀해 주세요. 감사합니다 :)`,
      ][v]!
    );
  }

  const raw = parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalizeStudentNamesInMessage(raw, m.studentName);
}

function buildOpeners(
  names: KoreanNameForms,
  academyName: string,
  studyDuration: string | null
): string[] {
  if (studyDuration) {
    return [
      `${names.eunNeun} ${academyName}에서 영어 공부한 지 어느덧 ${studyDuration}이 됐네요.\n이번에 NELT로 그동안 실력이 어떻게 변했는지 한번 정리해 봤어요.`,
      `${academyName}에서 ${names.iGa} 영어를 배운 지 ${studyDuration} 정도 됐어요.\n그동안의 변화를 NELT 결과로 모아서 알려드립니다.`,
      `${names.ui} 수업이 ${studyDuration}째 이어지고 있어요.\n이번에 NELT를 보면서 성장한 부분을 정리해 보았습니다.`,
    ];
  }
  return [
    `${names.eunNeun} ${academyName}에서 영어 공부를 잘 따라오고 있어요.\n이번에 NELT 결과를 모아서 성장한 부분을 정리해 드렸습니다.`,
    `${academyName}에서 ${names.iGa} 차근차근 실력을 쌓고 있어요.\nNELT로 그 변화를 확인해 보았습니다.`,
    `평소 수업에서 ${names.ui} 성장이 느껴져서, NELT 결과로 한번 정리해 봤어요.`,
  ];
}

function systemForTone(tone: NeltParentMessageTone): string {
  const lengthHint =
    tone === "short"
      ? "분량: 공백 포함 280~420자. 성장 사실 1~2개, 보완은 한 줄."
      : tone === "detail"
        ? "분량: 공백 포함 550~750자. 성장 사실 2~3개 + 다음 지도 한두 문장."
        : "분량: 공백 포함 400~600자. 문단은 짧게 끊기.";

  return `너는 영어학원 원장/담임이 학부모 카카오톡에 보내는 메시지를 쓴다.
보고서·공지문이 아니라, 실제 선생님이 카톡으로 툭툭 보내는 말투로 쓴다.

# 말투
- 존댓말. 친근하되 가볍지 않게. "~요/~예요/~습니다"를 자연스럽게 섞어도 됨.
- 한 문장은 짧게. 문단도 2~3줄 이내.
- 과장 금지. 담백하게. "확인됩니다", "누적 결과", "실시했습니다", "공유드립니다", "정리해 보내드립니다", "가장 눈에 띄는 부분은", "짧은 기간에 만들어진 결과라기보다" 같은 AI·보고서 말투 금지.
- "학습 결손", "판정 수준", "귀 자녀", "송부", "하기와 같이" 금지.

# 이름
- 인사에만 풀네임: "안녕하세요~ {fullName} {parentTitle} :)"
- 바로 다음 줄: "{academyName}입니다." 또는 "{academyName} {senderRole} {senderName}입니다."
- 본문은 givenName만. nameForms의 iGa/eunNeun/ui를 그대로 쓸 것.
  예: 서윤우→윤우가/윤우는, 신지환→지환이/지환이는
- "○○학생" 반복 금지. 풀네임+가/는 금지.

# 구성 (자연스럽게, 번호·소제목 없이)
1) [NELT 성장 리포트] 단독 첫 줄
2) 인사 2줄
3) 아이 이야기 한두 문장 (공부 기간이 있으면 자연스럽게, 없으면 지어내지 말 것)
4) NELT를 모아서 리포트 보낸다는 말 한 문장
5) 성장한 점 2개 안팎 — 숫자·레벨이 있으면 넣고, 없으면 영역 이름만. 불릿(·) 써도 됨
6) 짧은 칭찬 한 문장
7) 보완할 점 있으면 부드럽게 한두 문장 + 수업에서 챙기겠다는 말
8) "자세한 내용은 아래 리포트에 적어 두었습니다." + reportUrl이 있을 때만 URL 단독 줄
9) 마무리 한두 문장

# 좋은 예시 (이 톤을 따라라)
[NELT 성장 리포트]

안녕하세요~ 서윤우 어머님 :)
정수학원입니다.

윤우는 학원에서 영어 공부를 꾸준히 잘 따라오고 있어요.
이번에 NELT를 몇 번 본 결과를 모아서, 성장한 부분 위주로 정리해 드렸습니다.

특히 어휘랑 듣기가 많이 좋아졌어요.
· 아는 단어가 예전보다 늘었습니다
· 듣기 실력도 한 단계 올라온 느낌이었어요

수업에서 잘 따라와 준 덕분이에요. 집에서도 한 번 칭찬해 주시면 좋을 것 같아요.
문법은 앞으로 수업에서 조금 더 다듬어 볼게요.

자세한 내용은 아래 리포트에 적어 두었습니다.

(링크가 있으면 여기)

궁금한 점 있으시면 편하게 말씀해 주세요~
감사합니다.

# 나쁜 예시 (이렇게 쓰지 말 것)
- "○○가 정수학원에서 꾸준히 영어 공부를 이어오고 있는데요."
- "3차례의 결과를 모아 성장 리포트로 정리해 보내드립니다."
- "이번 누적 결과에서 가장 눈에 띄는 부분은 어휘와 문법과 듣기였습니다."
- "짧은 기간에 만들어진 결과라기보다…"
- "변화를 숫자로도 확인하고자 NELT를 실시했습니다."

# 사실
- JSON에 있는 성장·수치만 사용. 없는 성장·기간 만들지 말 것.
- 난이도만 올라가고 실력이 그대로면 "성장"이라 쓰지 말고 "더 넓은 범위에 도전"으로.
- 상위 %는 숫자가 줄어든(좋아진) 경우만.
${lengthHint}
재생성(variationSeed)이 있으면 표현만 조금 다르게. 의미·톤은 위 좋은 예시를 유지.
본문만 출력. 마크다운·작성 설명 금지.`;
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
): Promise<
  { ok: true; message: string; model: string } | { ok: false; message: string }
> {
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

  const facts = {
    tone,
    variationSeed: seed,
    fullName: m.names.fullName,
    givenName: m.names.givenName,
    nameForms: {
      iGa: m.names.iGa,
      eunNeun: m.names.eunNeun,
      ui: m.names.ui,
    },
    parentTitle: m.parentTitle,
    senderRole: m.senderRole || null,
    senderName: m.senderName || null,
    academyName: m.academyName,
    studyDuration: m.studyDuration,
    attemptCount: analysis.attemptCount,
    latestTestDate: m.latestTestDate,
    reportUrl: m.reportUrl,
    mainGrowthAreas: mainGrowthAreas(analysis),
    growthHighlights: growthHighlights(analysis),
    focusAreas: focusAreas(analysis),
    nextFocusInClass: learningPlanLines(analysis).map(softPlanLine),
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
    domains: analysis.domainGrowth.map((d) => ({
      label: d.label,
      status: d.status,
      beforeLevel: d.beforeLevel,
      afterLevel: d.afterLevel,
      difficultyUp: d.difficultyUp,
    })),
  };

  const user = `아래 사실만 써서, 위 시스템 지시의 '좋은 예시' 톤으로 학부모 카톡 메시지를 작성하세요.
이름·조사는 nameForms를 그대로 쓰세요. variationSeed=${seed} 이면 표현만 살짝 다르게.

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
        if (
          includeTemperature &&
          "temperature" in body &&
          !isGpt5FamilyModel(model)
        ) {
          body.temperature = 0.7;
        }
        if (isGpt5FamilyModel(model)) {
          body.max_completion_tokens = tone === "detail" ? 4500 : 3500;
          // 문장 품질용 — reasoning은 낮게 (장황한 보고서체 방지)
          if (includeReasoningEffort) body.reasoning_effort = "low";
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
          if (includeReasoningEffort) {
            includeReasoningEffort = false;
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
  return `${base}\n\n자세한 내용은 아래 리포트에 적어 두었습니다.\n\n${url}`;
}
