import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 15번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE15_QUESTION_TYPE = "부탁한 일 파악";

export const TYPE15_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 15,
      "question_type": "부탁한 일 파악",
      "instruction": "대화를 듣고, 여자가 남자에게 부탁한 일로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["책 읽기", "상자 옮기기", "숙제 끝내기", "도서관 청소하기", "책 제목 적기"],
      "choice_image_prompts": [],
      "correct_answer": 2,
      "answer_clue": "Could you help me carry this box?",
      "explanation": "",
      "requester": "여자",
      "requested_person": "남자",
      "requested_action": "상자 옮기기",
      "request_expression": "Could you help me carry this box?",
      "mentioned_actions": [
        { "action": "책 읽기", "role": "context_or_distractor" },
        { "action": "상자 옮기기", "role": "requested_action" }
      ],
      "quality_check_focus": [
        "부탁 표현이 명확한가",
        "부탁한 사람과 부탁받은 사람이 지시문과 일치하는가",
        "정답은 상대에게 부탁한 행동인가",
        "선택지가 모두 한글 행동 표현인가",
        "제안 유형과 섞이지 않았는가"
      ]
    }
  ]
}

order_index는 반드시 15.
M/W 대화 6~8턴. Can/Could/Would you 부탁 표현(후반). Why don't we/Let's 금지.
requester=부탁한 사람, requested_person=부탁받은 사람. requested_action=correct_answer.
choices: 한글 행동 5개 (~하기). segments=영어, script_translation=한국어.
needs_image_choices false.
`.trim();

const TYPE15_GENERATION_RULES = `
==================================================
15번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 부탁한 일 파악
지시문: 대화를 듣고, 남자/여자가 상대에게 부탁한 일로 가장 적절한 것을 고르시오.

문항 목적: 한 사람이 상대에게 요청한 행동(부탁)을 고른다. 16번 제안과 구분.

15번 vs 16번:
- 15번: Can/Could/Would you ~? (상대에게 해달라고 요청)
- 16번: Why don't we / How about / Let's (제안) — 15번에서 금지

그림: needs_image_choices=false, visual_choice_type="none"

대본 (M/W, 6~8턴):
1. 상황/문제 → 2. 이해/질문 → 3. 부탁 이유 → 4. Can/Could/Would you ~? → 5. 수락

choices: 한글 행동 5개 (~하기). 정답=부탁받은 사람이 할 행동.
오답: 맥락 관련이나 실제 부탁 아님. 제안형 오답 금지.

필수: requester, requested_person, requested_action, request_expression, mentioned_actions.
requester=지시문 첫 인물=부탁 말한 화자. requested_action=correct_answer.

소재: 학교생활, 행사 준비, 가족/집, 친구 사이.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE15_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (15번 전용):
1. Can/Could/Would you 부탁 표현 명확
2. requester/requested_person = 지시문
3. choices 한글 행동 5개
4. requested_action = correct_answer
5. 제안 표현 중심 아님
`.trim();

export function buildType15OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE15_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE15_VALIDATION_CRITERIA}

${TYPE15_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType15PromptBlockForExam(): string {
  return `
### 15번 유형: 부탁한 일 파악
${TYPE15_GENERATION_RULES}

필수: requester, requested_person, requested_action, request_expression, mentioned_actions
`.trim();
}
