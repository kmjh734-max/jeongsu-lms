import { formatReviewWordParentLine, formatVocabSetParentLine } from "@/lib/reports/format-lines";
import type { StudentReport } from "@/lib/reports/types";

function buildReportContext(report: StudentReport): string {
  const { student, rangeLabel, courses, vocabSets, reviewWords, summary } =
    report;

  const courseLines =
    courses.length === 0
      ? ["- 배정된 영상 강좌 없음"]
      : courses.flatMap((c) => {
          const head = `- ${c.courseTitle}: 총 ${c.totalLessons}강 중 ${c.completedLessons}강 완료, 진도율 ${c.progressPercent}%`;
          if (c.completedLessonsList.length === 0) return [head];
          return [
            head,
            ...c.completedLessonsList.map((t) => `  · 완료: ${t}`),
          ];
        });

  const vocabLines =
    vocabSets.length === 0
      ? ["- 배정된 단어장 없음"]
      : vocabSets.map((s) => formatVocabSetParentLine(s).replace(/^- /, ""));

  const reviewLines =
    reviewWords.length === 0
      ? ["- 복습 필요 단어 없음"]
      : reviewWords.map((w) => formatReviewWordParentLine(w).replace(/^- /, ""));

  return [
    `학생: ${student.name}`,
    `기간: ${rangeLabel}`,
    "",
    "시스템 요약:",
    `- ${summary.videoLine}`,
    `- ${summary.vocabLine}`,
    `- ${summary.reviewLine}`,
    "",
    "영상 학습:",
    ...courseLines,
    "",
    "단어학습:",
    ...vocabLines,
    "",
    "복습 필요 단어:",
    ...reviewLines,
  ].join("\n");
}

const DRAFT_SYSTEM = `너는 영어 학원에서 학부모에게 카카오톡·문자로 보내는 안내를 쓰는 현직 강사다.
학습 리포트 본문을 한 덩어리의 자연스러운 한국어로 작성한다.

문체 (매우 중요):
- 보고서·논문체 금지. "~한 것으로 확인됩니다", "~하였으며", "~수행하였습니다" 같은 표현을 반복하지 말 것
- 학부모에게 바로내도 어색하지 않은 따뜻한 안내문 톤
- 실제 강사가 직접 쓴 것처럼 자연스럽게
- 4~6문장, 한 단락

내용:
- 학생의 잘한 점·꾸준함을 먼저 긍정적으로 언급
- 부족한 점은 부드럽게, 다음에 어떻게 도울지 짧게 안내
- 영상 학습이 있으면 자연스럽게 언급, 없으면 단어학습 중심으로 안내
- 단어장별 진행·4단계 점수·합격 여부는 구체적 이름·점수로 짧게
- 복습 필요 단어는 딱딱한 목록 대신 문장 안에 자연스럽게 녹여 설명 (예: careful, choose처럼)
- "꾸준히", "차근차근", "다시 점검", "보완해가겠습니다", "지도하겠습니다" 등 학원 안내 표현 사용 가능
- 과장·단정·기계적 나열 금지

출력:
- 번호, 제목, 인사말 없이 본문만
- JSON·따옴표 없이 순수 텍스트만`;

export async function generateReportDraft(
  report: StudentReport
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 설정되어 있지 않습니다." };
  }

  const context = buildReportContext(report);
  const userPrompt = `아래 학습 데이터를 바탕으로, 학부모 카톡에 붙여넣을 학습 리포트 본문을 작성해 주세요. 보고서 말투가 아니라 담임 강사가 직접 쓴 안내문처럼 자연스럽게 써 주세요.\n\n${context}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.55,
        messages: [
          { role: "system", content: DRAFT_SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      return { ok: false, message: "AI 리포트 생성에 실패했습니다." };
    }

    const parsed = JSON.parse(bodyText) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = parsed.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return { ok: false, message: "AI 리포트 생성에 실패했습니다." };
    }

    return { ok: true, text };
  } catch {
    return { ok: false, message: "AI 리포트 생성에 실패했습니다." };
  } finally {
    clearTimeout(timer);
  }
}
