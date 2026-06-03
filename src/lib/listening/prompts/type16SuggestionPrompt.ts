import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 16번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE16_QUESTION_TYPE = "제안한 것 파악";

export const TYPE16_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 16,
      "question_type": "제안한 것 파악",
      "instruction": "대화를 듣고, 여자가 남자에게 제안한 것으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["친구에게 전화하기", "선생님께 질문하기", "교과서 버리기", "숙제 제출하기", "문제를 새로 만들기"],
      "choice_image_prompts": [],
      "correct_answer": 2,
      "answer_clue": "Why don't you ask Mr. Lee after class?",
      "explanation": "",
      "suggester": "여자",
      "suggested_to": "남자",
      "suggested_action": "선생님께 질문하기",
      "suggestion_expression": "Why don't you ask Mr. Lee after class?",
      "mentioned_actions": [
        { "action": "친구에게 전화하기", "role": "context_or_distractor" },
        { "action": "선생님께 질문하기", "role": "suggested_action" }
      ],
      "quality_check_focus": [
        "제안 표현이 명확한가",
        "제안한 사람과 제안받은 사람이 지시문과 일치하는가",
        "정답은 제안한 행동인가",
        "선택지가 모두 한글 행동 표현인가",
        "부탁 유형과 섞이지 않았는가"
      ]
    }
  ]
}

order_index는 반드시 16.
M/W 대화 6~8턴. Why don't / How about / Let's / Maybe you can 제안(후반).
Can/Could/Would you 부탁 중심 금지(15번).
suggester=제안한 사람, suggested_to=제안받은 사람. suggested_action=correct_answer.
choices: 한글 행동 5개 (~하기). segments=영어, script_translation=한국어.
needs_image_choices false.
`.trim();

const TYPE16_GENERATION_RULES = `
==================================================
16번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 제안한 것 파악
지시문: 대화를 듣고, 남자/여자가 상대에게 제안한 것으로 가장 적절한 것을 고르시오.

문항 목적: 문제 상황에 대한 해결 방법·함께 할 활동 제안을 고른다. 15번 부탁과 구분.

16번 vs 15번:
- 16번: Why don't / How about / Let's / Maybe you can / You should
- 15번: Can/Could/Would you — 16번에서 금지

그림: needs_image_choices=false, visual_choice_type="none"

대본 (M/W, 6~8턴):
1. 문제/고민 → 2. 이해/질문 → 3. 원인 설명 → 4. 제안 → 5. 수락/긍정 반응

choices: 한글 행동 5개 (~하기). 정답=제안한 내용.
오답: 맥락 관련이나 실제 제안 아님. 부탁형 오답 금지.

필수: suggester, suggested_to, suggested_action, suggestion_expression, mentioned_actions.
suggester=지시문 첫 인물=제안 말한 화자. suggested_action=correct_answer.

소재: 과제 문제, 물건 문제, 건강, 친구/일정, 행사 준비.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE16_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (16번 전용):
1. Why don't / How about / Let's 제안 표현 명확
2. suggester/suggested_to = 지시문
3. choices 한글 행동 5개
4. suggested_action = correct_answer
5. Can/Could/Would you 부탁 중심 아님
`.trim();

export function buildType16OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE16_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE16_VALIDATION_CRITERIA}

${TYPE16_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType16PromptBlockForExam(): string {
  return `
### 16번 유형: 제안한 것 파악
${TYPE16_GENERATION_RULES}

필수: suggester, suggested_to, suggested_action, suggestion_expression, mentioned_actions
`.trim();
}
