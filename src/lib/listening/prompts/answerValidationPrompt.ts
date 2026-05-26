import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export const ANSWER_CLARITY_PASS_THRESHOLD = 80;

export const ANSWER_VALIDATION_SYSTEM_PROMPT =
  "You are a strict reviewer for Korean national middle school Grade 1 English listening exam items. Output only valid JSON. Be conservative: if two choices could reasonably be correct, mark has_multiple_possible_answers true.";

export function buildAnswerValidationUserPrompt(
  q: GeneratedListeningQuestion,
  typeLabel?: string
): string {
  const choices = q.choices
    .map((c, i) => `${i + 1}. ${c}${q.correct_answer === i + 1 ? " (marked correct)" : ""}`)
    .join("\n");

  const script = q.segments.map((s) => `${s.speaker}: ${s.text}`).join("\n");

  return `너는 중학교 1학년 영어듣기평가 문항 검수자다.
아래 문항의 정답이 명확한지 검토해라.

유형: ${typeLabel ?? q.question_type} (${q.order_index}번)
지시문: ${q.instruction}
${q.question_text ? `지문/표: ${q.question_text}` : ""}

대본:
${script}

선택지:
${choices}

정답 번호: ${q.correct_answer}
정답 근거(작성됨): ${q.answer_clue || "(없음)"}
해설: ${q.explanation || "(없음)"}

검토할 항목:
1. 대본만 듣고 정답을 고를 수 있는가?
2. 정답 근거가 대본 안에 분명히 있는가?
3. 선택지 중 정답이 2개 이상으로 보일 가능성이 있는가?
4. 오답 선택지가 너무 정답과 비슷하거나 애매한가?
5. 정답 번호가 실제 정답과 일치하는가?
6. 해설이 정답 근거와 일치하는가?
7. 5번 "언급하지 않은 것" 유형이면, 언급하지 않은 항목이 정확히 하나인가?
8. 14번 "표/정보 불일치" 유형이면, 불일치 항목이 정확히 하나인가?
9. 19~20번 "이어질 말" 유형이면, 정답만 문맥상 자연스럽게 이어지는가?

출력은 반드시 JSON:
{
  "is_answer_clear": true,
  "correct_answer_verified": true,
  "has_multiple_possible_answers": false,
  "ambiguous_choices": [],
  "answer_clue": "정답 근거 문장(대본에서 인용)",
  "problems": [],
  "suggestions": [],
  "answer_clarity_score": 0
}

answer_clarity_score: 0~100 (80 이상이면 정답 명확).
has_multiple_possible_answers가 true이면 ambiguous_choices에 해당 선택지 번호 또는 텍스트를 넣어라.`;
}
