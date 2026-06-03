import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 9번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE9_QUESTION_TYPE = "대화 직후 할 일 파악";

export const TYPE9_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 9,
      "question_type": "대화 직후 할 일 파악",
      "instruction": "대화를 듣고, 여자가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["샌드위치 만들기", "물병 사기", "돗자리 접기", "피크닉 테이블 가져오기", "과일 씻기"],
      "choice_image_prompts": [],
      "correct_answer": 4,
      "answer_clue": "",
      "explanation": "",
      "target_person": "여자",
      "immediate_action": "피크닉 테이블 가져오기",
      "mentioned_actions": [
        { "action": "샌드위치 만들기", "role": "mentioned_but_not_immediate" },
        { "action": "피크닉 테이블 가져오기", "role": "immediate_action" }
      ],
      "quality_check_focus": [
        "대화 직후 할 행동이 명확한가",
        "지시문 대상과 실제 행동을 말한 화자가 일치하는가",
        "정답 근거가 마지막 부분에 있는가",
        "선택지가 모두 한국어 행동 표현인가",
        "오답은 언급되었지만 대화 직후 행동이 아닌가"
      ]
    }
  ]
}

order_index는 반드시 9.
M/W 대화 6~8턴. target_person = 지시문 남자/여자.
마지막 1~2턴에 목표 인물의 I'll ... now/right now/right away.
choices: 한국어 행동 표현 5개 (~하기, ~가기). 장소·명사만 금지.
immediate_action과 correct_answer 일치. segments=영어, script_translation=한국어.
needs_image_choices false.
`.trim();

const TYPE9_GENERATION_RULES = `
==================================================
9번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 대화 직후 할 일 파악
지시문: 대화를 듣고, 남자/여자가 대화 직후에 할 일로 가장 적절한 것을 고르시오.

문항 목적: 대화가 끝난 바로 다음에 특정 인물이 할 행동을 고른다.

형식:
- M/W 대화 6~8턴.
- 여러 물건·행동 언급 가능, 대화 직후 실제 행동은 하나만 명확.
- 마지막에 목표 인물: I'll go get ... right now / I'll call ... now 등.
- choices: 한국어 행동 표현 5개 (피크닉 테이블 가져오기, 도서관 가기 등).
- needs_image_choices: false.

흐름: 상황 → 준비 확인 → 여러 행동/물건 → 아직 안 한 일 → 즉시 행동 선언.

target_person, immediate_action, mentioned_actions 필수.
question_text 비움. 나중에 할 일(later, next week) 금지.
`.trim();

const TYPE9_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (9번 전용):
1. target_person = 지시문 = 즉시 행동 말한 화자
2. choices 한국어 행동 5개
3. immediate_action = 정답, I'll ... now 근거
4. 오답은 대화와 관련 있으나 직후 행동 아님
`.trim();

export function buildType9OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE9_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE9_VALIDATION_CRITERIA}

${TYPE9_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType9PromptBlockForExam(): string {
  return `
### 9번 유형: 대화 직후 할 일 파악
${TYPE9_GENERATION_RULES}

필수: target_person, immediate_action, mentioned_actions, needs_image_choices=false
`.trim();
}
