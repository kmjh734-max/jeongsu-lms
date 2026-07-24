import {
  buildStudentRecordChatBody,
  getStudentRecordModelCandidates,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
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
  return {
    academyName,
    parentTitle,
    senderRole,
    senderName,
    enrollmentDate,
    studyDuration,
    reportUrl,
    latestTestDate,
    studentName: analysis.studentName.trim(),
  };
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
      (d.status === "major_growth" ||
        d.status === "growth" ||
        d.status === "advanced_challenge") &&
      d.beforeLevel &&
      d.afterLevel &&
      d.beforeLevel !== d.afterLevel
    ) {
      out.push(
        `${d.label} 수준이 ${d.beforeLevel}에서 ${d.afterLevel}로 성장했습니다`
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

function durationParagraph(
  name: string,
  academyName: string,
  studyDuration: string | null
): string {
  if (studyDuration) {
    return `${name}가 ${academyName}과 함께 공부한 지도 어느덧 ${studyDuration}이 되었습니다.\n처음 수업을 시작했을 때와 비교하면 영어를 대하는 태도와 기본 실력 모두 많이 안정된 모습입니다.`;
  }
  return `${name}가 ${academyName}에서 꾸준히 영어 공부를 이어오고 있는데요.\n그동안 쌓아 온 실력을 확인해 보기 위해 이번에 NELT를 진행했습니다.`;
}

function neltReasonParagraph(
  name: string,
  studyDuration: string | null,
  attemptCount: number
): string {
  if (studyDuration) {
    return `그동안 ${name}가 어떻게 성장했는지 확인해 보기 위해 이번에 NELT를 ${
      attemptCount >= 2 ? "다시 " : ""
    }진행했습니다.`;
  }
  return "";
}

/** 규칙 기반 폴백 — 따뜻한 카카오톡 편지형 */
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
  const name = m.studentName;
  const highlights = growthHighlights(analysis);
  const areas = mainGrowthAreas(analysis);
  const focus = focusAreas(analysis);
  const plans = learningPlanLines(analysis);
  const highlightLimit = tone === "short" ? 2 : tone === "detail" ? 3 : 3;

  const parts: string[] = [];
  parts.push(greetingLine(m));
  parts.push("");
  parts.push(durationParagraph(name, m.academyName, m.studyDuration));

  const reason = neltReasonParagraph(
    name,
    m.studyDuration,
    analysis.attemptCount
  );
  if (reason) {
    parts.push("");
    parts.push(reason);
  }

  parts.push("");
  parts.push(
    `${analysis.attemptCount}차례의 결과를 모아 성장 리포트로 정리해 보내드립니다.`
  );

  if (highlights.length > 0) {
    parts.push("");
    const areaPhrase =
      areas.length > 0
        ? `이번 누적 결과에서 가장 눈에 띄는 부분은 ${areas.join("와 ")}였습니다.`
        : "이번 누적 결과에서 눈에 띄는 성장이 확인되었습니다.";
    parts.push(areaPhrase);
    parts.push(highlights.slice(0, highlightLimit).join(".\n") + ".");
  }

  if (tone !== "short") {
    parts.push("");
    parts.push(
      `짧은 기간에 만들어진 결과라기보다, ${name}가 수업과 학습을 꾸준히 따라와 준 결과라고 생각합니다.\n성장한 부분은 충분히 칭찬해 주셔도 좋을 것 같습니다.`
    );
  }

  if (tone !== "short" && (focus.length > 0 || plans.length > 0)) {
    parts.push("");
    if (focus.length > 0) {
      parts.push(
        `${focus.join("·")} 쪽은 아직 조금 더 연습이 필요한 부분도 함께 확인할 수 있었습니다.`
      );
    }
    if (plans.length > 0) {
      parts.push(`앞으로는 ${plans.join(" ")}`);
      if (!plans[plans.length - 1]?.endsWith("습니다.") && !plans[plans.length - 1]?.endsWith("겠습니다.")) {
        // keep as-is; learningPlan already sentence-like
      }
    } else {
      parts.push(
        "앞으로는 이 부분을 수업에서 더욱 꼼꼼히 채워가겠습니다."
      );
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
  if (tone === "short") {
    parts.push(
      `앞으로도 ${name}가 꾸준히 성장할 수 있도록 세심하게 지도하겠습니다.\n궁금하신 부분은 언제든 편하게 말씀해 주세요. 감사합니다 :)`
    );
  } else {
    parts.push(
      `앞으로도 ${name}의 강점은 더욱 살리고,\n아직 채워야 할 부분은 수업에서 꼼꼼히 보완해 나가겠습니다.\n리포트를 보시고 궁금하신 부분이 있으시면\n언제든 편하게 말씀해 주세요~ 감사합니다.`
    );
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

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
안녕하세요~ {studentName} {parentTitle} :)
정수학원 {senderRole} {senderName}입니다.
(senderRole/senderName이 없으면 "정수학원입니다."로 대체. parentTitle이 아버님이면 어머님을 쓰지 말 것.)

학생 이름 뒤에 "학생"을 반복하지 말 것. "{이름}가", "{이름}는", "{이름}의"를 자연스럽게 사용.

문장 끝 예시: 보내드립니다 / 확인해 보시면 좋을 것 같습니다 / 앞으로도 꼼꼼히 지도하겠습니다 / 함께 지켜봐 주세요 / 궁금하신 부분은 언제든 편하게 말씀해 주세요.

절대 금지 표현:
귀 자녀, 상기 학생, 평가 결과를 송부드립니다, 다음과 같이 안내드립니다, 분석 결과에 의하면, 학습 결손, 현저히 부족함, 성취도가 저조함, 보완이 요구됩니다, 참고하시기 바랍니다, 점수가 하락했습니다, 성적이 떨어졌습니다, 서로 다른 난이도는 단순 비교하지 않습니다.

이모티콘: 첫 인사 :) 또는 마무리에 가벼운 기호 최대 1~2개. 하트·박수·불꽃 과다 금지.

구성 순서(필수):
1) 따뜻한 인사와 발신자 소개
2) 학생이 정수학원과 함께한 기간 (studyDuration 있으면 시간의 흐름이 느껴지게; 없으면 임의 기간 만들지 말고 꾸준히 공부해 온 흐름으로)
3) 이번 NELT를 실시한 이유
4) 성장 리포트 전달 안내
5) 가장 크게 성장한 부분 2~3개 (실제 수치·수준만, 추상적 "많이 향상" 금지)
6) 성장에 대한 따뜻한 칭찬
7) 보완할 부분 1~2개 + 구체적 지도 계획 (부정 평가 금지, 다음 학습 목표로)
8) 리포트 링크 안내 후 링크 단독 줄 (reportUrl 있을 때만 URL 출력; 없으면 URL을 지어내지 말 것)
9) 함께 성장·문의 환영 마무리

목록·보고서 형식보다 자연스러운 편지형. 핵심 성장이 많을 때만 짧은 항목 2~3개 허용.
${lengthHint}
반드시 제공된 JSON 사실만 사용. 없는 기간·없는 성장을 만들지 말 것.
상위 %는 향상된 경우(숫자 감소)에만 언급.
본문만 출력. 제목·설명·마크다운 금지.`;
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

  const facts = {
    tone,
    studentName: m.studentName,
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

  const user = `다음 JSON 사실만으로 학부모 카카오톡 안내문을 한국어로 작성하세요.\n${JSON.stringify(facts, null, 2)}`;
  const SYSTEM = systemForTone(tone);

  const candidates = getStudentRecordModelCandidates();
  let lastErr = "AI 생성 실패";

  for (const model of candidates) {
    try {
      let includeTemperature = true;
      let includeReasoningEffort = true;
      for (let attempt = 0; attempt < 3; attempt++) {
        const body = buildStudentRecordChatBody(model, SYSTEM, user, {
          includeTemperature,
          includeReasoningEffort,
        });
        if (includeTemperature && "temperature" in body) {
          body.temperature = 0.65;
        }
        if (isGpt5(model)) {
          body.max_completion_tokens = tone === "detail" ? 2800 : 2200;
          if (includeReasoningEffort) body.reasoning_effort = "medium";
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
          break;
        }
        return { ok: true, message: content, model };
      }
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "요청 실패";
    }
  }

  return { ok: false, message: lastErr };
}

function isGpt5(model: string) {
  return model.trim().toLowerCase().startsWith("gpt-5");
}

/** 공유 링크를 안내문 본문에 자연스럽게 붙이거나 교체 */
export function attachReportUrlToMessage(
  message: string,
  reportUrl: string
): string {
  const url = reportUrl.trim();
  if (!url) return message;
  if (message.includes(url)) return message;
  const trimmed = message.trim();
  if (/https?:\/\/\S+/i.test(trimmed)) {
    return trimmed.replace(/https?:\/\/\S+/gi, url);
  }
  return `${trimmed}\n\n자세한 영역별 변화와 앞으로의 학습 계획은\n아래 리포트에 정리해 두었습니다.\n\n${url}`;
}
