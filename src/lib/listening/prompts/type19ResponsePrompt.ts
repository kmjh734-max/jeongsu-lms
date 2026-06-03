import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 19번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE19_QUESTION_TYPE = "응답 고르기";

export const TYPE19_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 19,
      "question_type": "응답 고르기",
      "instruction": "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "W", "text": "I can't find my science notebook." },
        { "speaker": "M", "text": "When did you last use it?" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "Man: __________________________",
      "choices": [
        "I can go with you if you want.",
        "I don't like science very much.",
        "The movie starts at five.",
        "My brother lost his shoes.",
        "Let's eat lunch in the classroom."
      ],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "직전 발화 W: You're right. I should check there before science class. 정답은 공책을 찾으러 가는 여자에게 남자가 함께 가줄 수 있다고 말하는 자연스러운 응답이다.",
      "explanation": "",
      "previous_turn": "W: You're right. I should check there before science class.",
      "blank_speaker": "M",
      "correct_response_function": "도움 제공",
      "distractor_reasons": [
        { "choice": "I can go with you if you want.", "reason": "직전 발화에 직접 반응하는 정답" },
        { "choice": "I don't like science very much.", "reason": "science는 관련 있으나 응답 기능이 맞지 않음" }
      ],
      "quality_check_focus": [
        "직전 발화와 정답 응답이 자연스럽게 연결되는가",
        "정답 외 선택지 중 자연스러운 응답이 없는가",
        "question_text의 화자와 지시문 속 화자가 일치하는가",
        "정답이 너무 일반적이지 않은가",
        "오답이 문법적으로는 가능하지만 현재 맥락에는 맞지 않는가"
      ]
    }
  ]
}

order_index는 반드시 19.
M/W 대화 5~7턴. 마지막 segment 화자=W(여자). 남자 응답은 segments에 넣지 않음.
question_text: "Man: __________________________" (blank_speaker=M).
instruction: 여자의 마지막 말 → 남자의 말.
choices: 영어 응답 5개. Okay/Yes/Sure/Thank you 단독 금지.
정답만 previous_turn에 직접·맥락에 맞게 이어짐. 복수 자연 응답 금지.
필수: previous_turn, blank_speaker, correct_response_function, distractor_reasons.
`.trim();

const TYPE19_GENERATION_RULES = `
==================================================
19번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 응답 고르기
지시문: 대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.

문항 목적: 직전 발화·대화 맥락에 가장 자연스럽게 이어지는 영어 응답 선택.

그림: needs_image_choices=false, visual_choice_type="none"

대본 (M/W, 5~7턴):
- segments는 여자 마지막 발화(W)까지만
- 남자 빈칸 응답은 segments·음원에 포함 금지
- question_text: Man: __________________________

정답 설계 (correct_response_function):
감사, 수락/동의, 거절, 안도, 도움 제공, 정보 확인, 사과, 격려 중 하나

선택지 규칙:
- 영어 문장 5개, 중1 수준
- 정답: 직전 발화+맥락에 직접 반응 (구체적)
- 오답: 문법상 가능하나 현재 맥락 부적절
- Okay/Yes/Sure/Thank you/I see 단독 금지
- 2개 이상 자연스러우면 실패

필수: previous_turn, blank_speaker(M), correct_response_function, distractor_reasons.
blank_speaker=M ↔ instruction 남자의 말 ↔ question_text Man:

소재: 잃어버린 물건, 약속, 과제, 친구 도움, 건강, 행사 준비.
기존 기출 복사 금지.
`.trim();

const TYPE19_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (19번 전용):
1. 마지막 segment 화자=W
2. question_text Man: ______ / blank_speaker M
3. choices 영어 5개, 너무 일반적 정답 아님
4. previous_turn = 마지막 W 발화
5. 정답만 직전 발화에 자연스럽게 연결
6. distractor_reasons 5개
`.trim();

export function buildType19OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE19_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE19_VALIDATION_CRITERIA}

${TYPE19_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType19PromptBlockForExam(): string {
  return `
### 19번 유형: 응답 고르기
${TYPE19_GENERATION_RULES}

필수: previous_turn, blank_speaker, correct_response_function, distractor_reasons
`.trim();
}
