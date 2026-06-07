import { extractHtmlFromModelOutput } from "@/lib/student-records/extract-html";
import { STUDENT_RECORD_ANALYSIS_TIMEOUT_MS } from "@/lib/student-records/limits";
import {
  buildStudentRecordChatBody,
  getStudentRecordModelCandidates,
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
} from "@/lib/student-records/model";
import { STUDENT_RECORD_ANALYSIS_SYSTEM_PROMPT } from "@/lib/student-records/system-prompt";

type RequestProfile = {
  includeTemperature: boolean;
  includeReasoningEffort: boolean;
};

function defaultProfile(model: string): RequestProfile {
  return {
    includeTemperature: !isGpt5FamilyModel(model),
    includeReasoningEffort: isGpt5FamilyModel(model),
  };
}

function relaxProfile(
  profile: RequestProfile,
  bodyText: string
): RequestProfile | null {
  const next = { ...profile };
  let changed = false;

  if (next.includeTemperature && isUnsupportedTemperatureError(bodyText)) {
    next.includeTemperature = false;
    changed = true;
  }
  if (
    next.includeReasoningEffort &&
    isUnsupportedParameterError(bodyText, "reasoning_effort")
  ) {
    next.includeReasoningEffort = false;
    changed = true;
  }

  return changed ? next : null;
}

export async function generateStudentRecordReport(
  studentName: string,
  text: string
): Promise<{ ok: true; html: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 설정되어 있지 않습니다." };
  }

  if (!text.trim()) {
    return { ok: false, message: "분석할 학생부 내용이 없습니다." };
  }

  const nameHint =
    studentName === "학생"
      ? "학생명이 지정되지 않았습니다. 자료에서 학생명·학교명·학년을 추출해 Hero 섹션에 반영하세요."
      : `분석 대상 학생: ${studentName}`;

  const userText = [
    nameHint,
    "",
    "아래는 학교생활기록부 원문 자료입니다. 시스템 지침의 섹션 0~7을 모두 준수하여 HTML만 출력하세요.",
    "",
    "【생성 전 필수 확인】",
    "□ 석차등급 가중평균으로 5등급제 평균 계산 (1·2학기·전체, 계산표 포함)",
    "□ 5등급 평균 → 9등급 환산 추정값 (앵커표 선형 보간, 1.8배 금지, 「약」표기)",
    "□ 9등급 환산 면책 문구(비교 지표·모집요강 재확인) 섹션 2에 포함",
    "□ 대학 수준은 입결 밴드 예시만, 합격·안정권·단정 표현 금지",
    "□ 자가진단 8항목: 측정값 숫자 + 인용 + 점수, 총점 Hero와 일치",
    "□ 교과전형 판단과 학생부종합전형 판단 분리",
    "□ <!DOCTYPE html> ~ </html> HTML만 출력",
    "",
    "=== 학생부 원문 ===",
    text.trim(),
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    STUDENT_RECORD_ANALYSIS_TIMEOUT_MS
  );

  const models = getStudentRecordModelCandidates();
  let lastMessage = "학생부 분석 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";

  try {
    for (let i = 0; i < models.length; i++) {
      const model = models[i]!;
      let profile = defaultProfile(model);

      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify(
            buildStudentRecordChatBody(
              model,
              STUDENT_RECORD_ANALYSIS_SYSTEM_PROMPT,
              userText,
              profile
            )
          ),
        });

        const bodyText = await res.text();
        if (!res.ok) {
          if (
            i < models.length - 1 &&
            isModelUnavailableError(res.status, bodyText)
          ) {
            break;
          }
          const relaxed = relaxProfile(profile, bodyText);
          if (relaxed) {
            profile = relaxed;
            continue;
          }
          lastMessage =
            "학생부 분석 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
          break;
        }

        const parsed = JSON.parse(bodyText) as {
          choices?: { message?: { content?: string }; finish_reason?: string }[];
        };
        const raw = parsed.choices?.[0]?.message?.content?.trim() ?? "";
        if (!raw) {
          const reason = parsed.choices?.[0]?.finish_reason ?? "unknown";
          lastMessage = `분석 결과가 비어 있습니다 (finish_reason=${reason}).`;
          break;
        }

        const html = extractHtmlFromModelOutput(raw);
        if (!html.includes("<")) {
          lastMessage = "HTML 보고서 형식으로 생성되지 않았습니다.";
          break;
        }

        return { ok: true, html };
      }
    }

    return { ok: false, message: lastMessage };
  } catch {
    return {
      ok: false,
      message:
        "보고서 생성 시간이 초과되었거나 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  } finally {
    clearTimeout(timer);
  }
}
