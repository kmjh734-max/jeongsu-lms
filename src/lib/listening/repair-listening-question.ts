import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { getListeningSystemPrompt } from "@/lib/listening/prompts/commonPrompt";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import type { QuestionValidationPayload } from "@/lib/listening/run-question-validation";

const REPAIR_SYSTEM = `You fix Korean middle-school English listening exam questions.
Output JSON only: { "questions": [ ONE fixed question object ] }
Keep the same JSON field names and structure as the input.
Do not change order_index or question_type unless required to fix errors.
For types 19–20: item must be "best response to LAST utterance only", not whole-dialogue topic.
segments must end at last speaker before blank; blank response must NOT appear in segments.
Dialogue types: segments MUST include both M and W speakers, alternating naturally (not one person only).`;

function questionToRepairUserPayload(
  q: GeneratedListeningQuestion,
  validation: QuestionValidationPayload,
  typeHint?: ExamTypeTemplate
): string {
  const problems = [
    ...validation.problems,
    ...validation.suggestions.map((s) => `[제안] ${s}`),
  ];
  return `
유형: ${typeHint?.question_type ?? q.question_type} (${q.order_index}번)
지시문: ${typeHint?.instruction ?? q.instruction}

검수 점수: quality=${validation.quality_score}, answer_clarity=${validation.answer_clarity_score}
문제 목록:
${problems.map((p) => `- ${p}`).join("\n") || "- (없음)"}

현재 문항 JSON (이 구조를 유지하며 수정):
${JSON.stringify({ questions: [q] }, null, 0)}
`.trim();
}

export async function repairListeningQuestionWithAi(
  apiKey: string,
  q: GeneratedListeningQuestion,
  validation: QuestionValidationPayload,
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<GeneratedListeningQuestion | null> {
  try {
    const parsed = await listeningChatJson<{ questions?: unknown[] }>(apiKey, {
      temperature: 0.35,
      system: `${getListeningSystemPrompt(gradeLevel)}\n\n${REPAIR_SYSTEM}`,
      user: questionToRepairUserPayload(q, validation, typeHint),
    });
    const raw = parsed.questions?.[0];
    if (!raw || typeof raw !== "object") return null;
    const fixed = applyQuestionFixes(
      { ...q, ...(raw as GeneratedListeningQuestion) },
      typeHint?.id,
      gradeLevel
    );
    if (!fixed.instruction?.trim() || fixed.segments.length === 0) return null;
    return fixed;
  } catch {
    return null;
  }
}
