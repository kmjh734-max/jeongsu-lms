import { examPrepChatJson } from "@/lib/exam-prep/exam-prep-openai";
import type { GradeResult } from "@/lib/exam-prep/grade";
import type { ExamGradingStatus } from "@/lib/exam-prep/types";

export type WritingGradeInput = {
  questionId: string;
  questionType: string;
  prompt: string;
  modelAnswer: string;
  studentAnswer: string;
  points: number;
};

export type WritingGradeAiResult = {
  questionId: string;
  isCorrect: boolean;
  scoreRatio: number;
  feedback: string;
};

const SYSTEM = `당신은 한국 중고등 영어 내신 서술형·해석 채점 교사다.
JSON만 출력한다: {"results":[{"questionId":"...","isCorrect":true|false,"scoreRatio":0~1,"feedback":"한국어 한 줄"}]}

채점 원칙:
- writing(영작): 의미·핵심 표현이 모범답과 같으면 정답. 철자·관사 사소한 실수는 부분점수(scoreRatio 0.5~0.9).
- translation_practice(해석): 의미가 같으면 정답. 표현만 다르면 정답.
- error_correction: 올바른 문장과 실질적으로 같으면 정답.
- 빈 답·무관한 답은 isCorrect false, scoreRatio 0.
- 원문/모범답을 학생이 그대로 베낀 것이 아니라 의미 일치면 인정.
- feedback은 학부모가 봐도 되는 짧은 한국어.`;

export async function gradeWritingAnswersWithAi(
  items: WritingGradeInput[]
): Promise<WritingGradeAiResult[] | null> {
  if (items.length === 0) return [];
  if (!process.env.OPENAI_API_KEY?.trim()) return null;

  try {
    const raw = await examPrepChatJson({
      system: SYSTEM,
      user: JSON.stringify(
        {
          items: items.map((it) => ({
            questionId: it.questionId,
            questionType: it.questionType,
            prompt: it.prompt.slice(0, 400),
            modelAnswer: it.modelAnswer.slice(0, 500),
            studentAnswer: it.studentAnswer.slice(0, 500),
          })),
        },
        null,
        2
      ),
      temperature: 0.2,
      maxTokens: 2500,
    });

    const list =
      raw && typeof raw === "object"
        ? (raw as { results?: unknown }).results
        : null;
    if (!Array.isArray(list)) return null;

    const byId = new Map<string, WritingGradeAiResult>();
    for (const row of list) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const id = typeof r.questionId === "string" ? r.questionId : "";
      if (!id) continue;
      const ratioRaw = Number(r.scoreRatio);
      const ratio = Number.isFinite(ratioRaw)
        ? Math.min(1, Math.max(0, ratioRaw))
        : r.isCorrect
          ? 1
          : 0;
      byId.set(id, {
        questionId: id,
        isCorrect: Boolean(r.isCorrect) || ratio >= 0.85,
        scoreRatio: ratio,
        feedback:
          typeof r.feedback === "string" && r.feedback.trim()
            ? r.feedback.trim()
            : Boolean(r.isCorrect)
              ? "의미상 정답으로 채점했습니다."
              : "모범답과 차이가 있습니다.",
      });
    }

    return items.map((it) => {
      const hit = byId.get(it.questionId);
      if (hit) return hit;
      return {
        questionId: it.questionId,
        isCorrect: false,
        scoreRatio: 0,
        feedback: "AI 채점 결과를 받지 못했습니다.",
      };
    });
  } catch {
    return null;
  }
}

export function aiResultToGradeResult(
  ai: WritingGradeAiResult,
  points: number
): GradeResult {
  const score = Math.round(points * ai.scoreRatio * 100) / 100;
  const status: ExamGradingStatus = ai.isCorrect
    ? "auto_correct"
    : ai.scoreRatio > 0
      ? "auto_incorrect"
      : "auto_incorrect";
  return {
    isCorrect: ai.isCorrect,
    score,
    gradingStatus: status,
    feedback: ai.feedback,
  };
}

export function extractModelAnswerText(correctAnswer: unknown): string {
  if (typeof correctAnswer === "string") return correctAnswer;
  if (
    correctAnswer &&
    typeof correctAnswer === "object" &&
    "text" in correctAnswer
  ) {
    return String((correctAnswer as { text: unknown }).text ?? "");
  }
  return "";
}

export function extractStudentText(answer: unknown): string {
  if (typeof answer === "string") return answer;
  if (answer && typeof answer === "object" && "text" in answer) {
    return String((answer as { text: unknown }).text ?? "");
  }
  return "";
}
