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

const DRAFT_SYSTEM = `너는 영어 학원 담임 강사다. 학부모에게 보내는 학습 리포트 본문을 한 단락으로 쓴다.

문체 (매우 중요):
- 담백하고 신뢰감 있게. 과한 칭찬·감탄·"훌륭합니다" "매우 우수" 같은 과장 금지
- 보고서체·논문체 금지 ("~한 것으로 확인됩니다", "~하였으며", "~수행하였습니다" 등)
- 실제 강사가 카톡·문자로 보내는 안내문처럼 자연스럽게
- 4~5문장, 한 단락만

내용 순서:
1. 잘하고 있는 점·꾸준한 부분을 먼저 (구체적 단어장명·점수·영상 진도율 숫자 포함)
2. 부족한 부분은 부드럽게 (재도전, 복습 필요 등)
3. 오답·복습 단어가 있으면 영어 단어를 문장 안에 자연스럽게 나열 (예: careful, choose, collect)
4. 마지막에 앞으로 지도·복습 방향을 한 문장으로

금지:
- 번호·제목·인사말("안녕하세요")
- JSON·따옴표
- 데이터 나열식 문장 연속
- 없는 사실 지어내기

좋은 예시 톤:
"○○ 학생은 최근 단어학습을 꾸준히 진행하고 있으며, Day1 단어장은 100점으로 안정적으로 마무리했습니다. 영상 강의도 현재 50%까지 수강하며 흐름을 잘 따라오고 있습니다. 다만 Day3 단어장은 종합테스트에서 80점으로 나타나, 일부 단어는 한 번 더 복습이 필요합니다. 다음 학습에서는 careful, choose, collect와 같은 오답 단어를 중심으로 다시 점검하며 완성도를 높여가겠습니다."`;

export async function generateReportDraft(
  report: StudentReport
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 설정되어 있지 않습니다." };
  }

  const context = buildReportContext(report);
  const userPrompt = `아래 학습 데이터만 근거로, 학부모에게 보낼 학습 리포트 본문을 4~5문장으로 작성해 주세요. 담백한 담임 강사 톤으로, 과장 없이 구체적인 숫자·단어장 이름을 넣어 주세요.\n\n${context}`;

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
        temperature: 0.45,
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
