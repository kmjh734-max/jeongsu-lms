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

function periodLabel(analysis: NeltGrowthAnalysis): string {
  if (analysis.start.testDate && analysis.end.testDate) {
    return `${analysis.start.testDate.replaceAll("-", ".")} ~ ${analysis.end.testDate.replaceAll("-", ".")}`;
  }
  return `${analysis.attemptCount}회차`;
}

function growthFacts(analysis: NeltGrowthAnalysis): string[] {
  const facts: string[] = [];
  if (
    analysis.start.overallLevel &&
    analysis.end.overallLevel &&
    analysis.start.overallLevel !== analysis.end.overallLevel
  ) {
    facts.push(
      `종합 레벨이 ${analysis.start.overallLevel}에서 ${analysis.end.overallLevel}로 올랐습니다.`
    );
  }
  if (
    analysis.vocabularyGrowth.sizeDelta != null &&
    analysis.vocabularyGrowth.sizeDelta > 0
  ) {
    facts.push(
      `알고 있는 어휘가 약 ${analysis.vocabularyGrowth.beforeSize?.toLocaleString()}단어에서 약 ${analysis.vocabularyGrowth.afterSize?.toLocaleString()}단어로 늘었습니다.`
    );
  }
  if (
    analysis.vocabularyGrowth.requiredPctDelta != null &&
    analysis.vocabularyGrowth.requiredPctDelta > 0
  ) {
    facts.push(
      `초등 필수 어휘 이해도가 ${analysis.vocabularyGrowth.beforeRequiredPct}%에서 ${analysis.vocabularyGrowth.afterRequiredPct}%로 올랐습니다.`
    );
  }
  for (const d of analysis.domainGrowth) {
    if (
      d.status === "major_growth" ||
      d.status === "growth" ||
      d.status === "advanced_challenge"
    ) {
      if (d.beforeLevel && d.afterLevel && d.beforeLevel !== d.afterLevel) {
        facts.push(
          `${d.label} 수준이 ${d.beforeLevel}에서 ${d.afterLevel}로 성장했습니다.`
        );
      } else if (d.difficultyUp) {
        facts.push(
          `${d.label}에서 ${d.afterDifficulty ?? "다음"} 단계에 도전하며 학습 성과를 확인했습니다.`
        );
      }
    }
  }
  const pctImproved =
    analysis.start.overallPercentile != null &&
    analysis.end.overallPercentile != null &&
    analysis.end.overallPercentile < analysis.start.overallPercentile;
  if (pctImproved) {
    facts.push(
      `동학년 대비 위치가 상위 ${analysis.start.overallPercentile}%에서 상위 ${analysis.end.overallPercentile}%로 향상되었습니다.`
    );
  }
  return facts;
}

function domainLevelLines(analysis: NeltGrowthAnalysis): string[] {
  return analysis.domainGrowth.map((d) => {
    const level = d.afterLevel ?? "현재 수준";
    if (d.beforeLevel && d.afterLevel && d.beforeLevel !== d.afterLevel) {
      return `· ${d.label}: ${d.beforeLevel} → ${d.afterLevel}`;
    }
    return `· ${d.label}: ${level}`;
  });
}

function planLines(analysis: NeltGrowthAnalysis): string[] {
  const focus = analysis.domainGrowth
    .filter((d) => d.status === "focus_needed" || d.status === "maintained")
    .slice(0, 2)
    .map((d) => analysis.learningPlan[d.domain].nextGoal);
  if (focus.length > 0) return focus;
  return [analysis.nextGoalsNarrative];
}

/** 규칙 기반 폴백 — AI 실패 시에도 자연스러운 학부모 안내 */
export function buildNeltParentMessageFallback(
  analysis: NeltGrowthAnalysis,
  academyName = ACADEMY_NAME,
  tone: NeltParentMessageTone = "standard"
): string {
  const name = analysis.studentName;
  const n = analysis.attemptCount;
  const period = periodLabel(analysis);
  const facts = growthFacts(analysis);
  const plans = planLines(analysis);

  if (tone === "short") {
    return `[${academyName}] ${name} 학생 NELT 성장 안내

안녕하세요. ${academyName}입니다.
${name} 학생의 NELT ${n}회차(${period}) 성장 리포트를 보내드립니다.

${facts
  .slice(0, 3)
  .map((f) => `· ${f}`)
  .join("\n") || "· 회차를 이어가며 기초를 다지고 있습니다."}

자세한 내용은 아래 링크에서 확인해 주세요.
궁금한 점이 있으시면 언제든 연락 주세요.
감사합니다.
${academyName} 드림`;
  }

  if (tone === "detail") {
    const steps =
      analysis.attemptSteps.length > 0
        ? analysis.attemptSteps.map((s) => `· ${s.summary}`).join("\n")
        : "";
    return `[${academyName}] ${name} 학생 NELT 영어 성장 안내

안녕하세요. ${academyName}입니다.
${name} 학생의 NELT ${n}회차(${period}) 결과를 바탕으로 성장 리포트를 보내드립니다.

■ 이번 평가에서 눈에 띄는 변화
${facts.map((f) => `· ${f}`).join("\n") || "· 회차를 이어가며 기초를 다지고 있습니다."}

■ 영역별 현재 수준
${domainLevelLines(analysis).join("\n")}

${steps ? `■ 회차별 흐름\n${steps}\n` : ""}
■ 앞으로 학원에서 챙길 부분
${plans
  .slice(0, 4)
  .map((p) => `· ${p}`)
  .join("\n")}

자세한 성장 리포트는 아래 링크에서 영역별 그래프와 함께 확인해 주세요.
(링크는 별도로 함께 보내드립니다.)

궁금한 점이 있으시면 언제든 학원으로 연락 주세요.
감사합니다.
${academyName} 드림`;
  }

  // standard
  return `[${academyName}] ${name} 학생 NELT 영어 성장 안내

안녕하세요. ${academyName}입니다.
${name} 학생의 NELT ${n}회차(${period}) 결과를 바탕으로 성장 리포트를 보내드립니다.

■ 이번 평가에서 눈에 띄는 변화
${facts
  .slice(0, 5)
  .map((f) => `· ${f}`)
  .join("\n") || "· 회차를 이어가며 기초를 다지고 있습니다."}

■ 영역별 현재 수준
${domainLevelLines(analysis).join("\n")}

■ 앞으로 학원에서 챙길 부분
${plans
  .slice(0, 3)
  .map((p) => `· ${p}`)
  .join("\n")}

자세한 성장 리포트는 아래 링크에서 확인해 주세요.
(링크는 별도로 함께 보내드립니다.)

궁금한 점이 있으시면 언제든 학원으로 연락 주세요.
감사합니다.
${academyName} 드림`;
}

function systemForTone(tone: NeltParentMessageTone): string {
  const lengthHint =
    tone === "short"
      ? "분량: 짧게. 성장 사실 2~3개만. 영역 상세·회차 흐름은 생략."
      : tone === "detail"
        ? "분량: 상세. 성장 사실 4~6개 + 영역별 현재 수준 + 3회차 이상이면 회차 흐름 + 지도 계획."
        : "분량: 기본. 성장 사실 3~5개 + 영역 요약 + 지도 계획.";

  return `당신은 영어학원 원장이 학부모에게 보내는 카카오톡·문자 안내문을 작성한다.
절대 금지: "~입니다요", "시너지", "퀀텀 점프", "놀라운 성장", "AI가", "분석 결과 기반", 과도한 감탄사, 영어 남발, 이모지.
금지 문구: "서로 다른 난이도는 단순 비교하지 않습니다", "직접 비교가 어렵습니다", "점수가 하락했습니다", "성적이 떨어졌습니다".
어조: 차분하고 구체적이며 학부모에게 설명하듯. 짧은 문장. 사실만.
반드시 제공된 숫자·레벨·회차만 사용. 없는 성적·없는 성장을 지어내지 말 것.
상위 %는 숫자가 작아진(향상된) 경우에만 언급.
난이도가 다른 점수는 "점수 하락"이라고 쓰지 말고, 다음 단계 도전·판정 수준으로 설명.
${lengthHint}
형식:
1) 인사와 학원명
2) 몇 회차인지, 기간
3) 구체적 성장 사실
4) 영역별 현재 수준 요약 (short 톤에서는 생략 가능)
5) 앞으로 학원에서 지도할 부분
6) 링크 확인 안내 + 맺음말
본문만 출력. 제목 마크다운 금지.`;
}

export async function generateNeltParentMessageAi(
  analysis: NeltGrowthAnalysis,
  academyName = ACADEMY_NAME,
  tone: NeltParentMessageTone = "standard"
): Promise<{ ok: true; message: string; model: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 없습니다." };
  }

  const facts = {
    tone,
    academyName,
    studentName: analysis.studentName,
    attemptCount: analysis.attemptCount,
    startDate: analysis.start.testDate,
    endDate: analysis.end.testDate,
    overall: {
      from: analysis.start.overallLevel,
      to: analysis.end.overallLevel,
      bandFrom: analysis.start.overallBand,
      bandTo: analysis.end.overallBand,
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
      beforeDifficulty: d.beforeDifficulty,
      afterDifficulty: d.afterDifficulty,
      difficultyUp: d.difficultyUp,
      scoreComparable: d.scoreComparable,
      scoreDelta: d.scoreDelta,
      percentileImproved: d.percentileImproved,
      percentileDelta: d.percentileDelta,
    })),
    attemptSteps: analysis.attemptSteps.map((s) => ({
      summary: s.summary,
      vocabDelta: s.vocabDelta,
      overall: `${s.overallLevelBefore} → ${s.overallLevelAfter}`,
    })),
    nextGoals: analysis.nextGoalsNarrative,
    highlights: analysis.highlights
      .filter((h) => h.parentVisible)
      .map((h) => ({
        title: h.title,
        before: h.beforeLabel,
        after: h.afterLabel,
        delta: h.deltaLabel,
      })),
  };

  const user = `다음 JSON 사실만으로 학부모 안내문을 한국어로 작성하세요. tone=${tone}\n${JSON.stringify(facts, null, 2)}`;
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
          body.temperature = 0.55;
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
