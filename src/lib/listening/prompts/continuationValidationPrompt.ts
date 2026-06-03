import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export const RESPONSE_CONTEXT_PASS_THRESHOLD = 80;

export function buildContinuationValidationUserPrompt(
  q: GeneratedListeningQuestion
): string {
  const choices = q.choices
    .map((c, i) => `${i + 1}. ${c}${q.correct_answer === i + 1 ? " (정답)" : ""}`)
    .join("\n");
  const script = q.segments.map((s) => `${s.speaker}: ${s.text}`).join("\n");
  const dr = (q.distractor_reason ?? []).map((d, i) => `${i + 1}. ${d}`).join("\n");

  return `19~20번 "응답 고르기" 문항 맥락 검수.
이 유형은 **마지막 발화 직후 한 줄 응답** 문제이며, **대화 전체 요지/주제** 문제가 아니다.

유형: ${q.order_index}번
지시문: ${q.instruction}
question_text: ${q.question_text}
previous_turn(작성): ${q.previous_turn || "(없음)"}
correct_response_function: ${q.correct_response_function || "(없음)"}

대본(segment, 응답 대사 제외):
${script}

선택지:
${choices}

distractor_reason:
${dr || "(없음)"}

검수 항목:
1. 정답이 직전 발화(previous_turn)에 직접 반응하는가?
2. 정답 외 선택지 중 자연스럽게 이어지는 것이 또 있는가?
3. 정답 응답의 기능(감사/동의/안도 등)이 상황과 맞는가?
4. instruction의 화자(남자/여자)와 question_text 빈칸 화자가 일치하는가?
5. 오답이 너무 말이 안 되거나 너무 쉬운가?
6. 오답 중 문맥상 맞는 것이 있으면 has_multiple_possible_answers = true

JSON만 출력:
{
  "is_answer_clear": true,
  "correct_answer_verified": true,
  "has_multiple_possible_answers": false,
  "ambiguous_choices": [],
  "answer_clue": "정답 근거",
  "problems": [],
  "suggestions": [],
  "answer_clarity_score": 0,
  "response_context_score": 0,
  "previous_turn": "검수자가 확인한 직전 발화",
  "best_response": "정답 선택지 문장",
  "second_possible_answer": null,
  "has_context_mismatch": false
}

response_context_score 80 미만이면 맥락 불명확. second_possible_answer에 두 번째로 가능한 선택지 번호 또는 문장.`;
}
