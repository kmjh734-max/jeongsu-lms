import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 17번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE17_QUESTION_TYPE = "특정 시점에 할 일 파악";

export const TYPE17_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 17,
      "question_type": "특정 시점에 할 일 파악",
      "instruction": "대화를 듣고, 남자가 이번 주말에 할 일로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["친구와 영화 보기", "할머니 댁 방문하기", "도서관에서 공부하기", "축구 경기 보러 가기", "과학 숙제 하기"],
      "choice_image_prompts": [],
      "correct_answer": 2,
      "answer_clue": "I'm going to visit my grandmother this weekend.",
      "explanation": "",
      "target_person": "남자",
      "target_time": "이번 주말",
      "planned_action": "할머니 댁 방문하기",
      "mentioned_other_actions": [
        { "action": "친구와 영화 보기", "role": "original_plan_or_distractor" },
        { "action": "할머니 댁 방문하기", "role": "planned_action" }
      ],
      "quality_check_focus": [
        "특정 시점이 명확한가",
        "지시문 대상과 실제 할 일을 말한 사람이 일치하는가",
        "정답은 실제로 하기로 한 일인가",
        "원래 계획이나 취소된 일을 정답으로 잘못 잡지 않았는가",
        "선택지가 모두 한글 활동/행동 표현인가"
      ]
    }
  ]
}

order_index는 반드시 17.
M/W 대화 6~8턴. 특정 시점(today afternoon, this weekend, tomorrow 등) 명확.
target_person=지시문 남자/여자=최종 계획 말한 화자. target_time=지시문 시점.
planned_action=correct_answer. answer_clue=실제 할 일(I'm going to / We will) 문장.
wanted to / planned to / was going to = 취소된 계획(정답·answer_clue 금지).
9번(대화 직후), 15번(부탁), 16번(제안)과 구분.
choices: 한글 활동 5개 (~하기). needs_image_choices false.
`.trim();

const TYPE17_GENERATION_RULES = `
==================================================
17번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 특정 시점에 할 일 파악
지시문: 대화를 듣고, 남자/여자가 ○○(시점)에 할 일로 가장 적절한 것을 고르시오.

시점 예: 오늘 오후, 오늘 방과 후, 오늘 저녁, 내일, 이번 토요일, 이번 주말

17번 vs 다른 유형:
- 9번: 대화 직후 즉시 할 일 (now/right away) — 17번은 특정 시점
- 15번: 부탁(Can/Could/Would you) — 17번은 본인/가족 계획
- 16번: 제안(Why don't / Let's) — 17번은 실제로 하기로 한 일

그림: needs_image_choices=false, visual_choice_type="none"

대본 (M/W, 6~8턴):
1. 시점 계획 질문 → 2. 다른 활동/가능성 언급 → 3. 일정 변경·사정 → 4. 최종 계획 명확 → 5. 확인

정답: 지시문 시점에 실제로 하기로 한 일 하나만 명확.
오답: 대화에 언급된 원래 계획·취소된 일·다른 시점 활동.

필수: target_person, target_time, planned_action, mentioned_other_actions.
target_person=지시문 남자/여자. planned_action=correct_answer.
answer_clue: I'm going to / We're going to / I will (취소된 wanted/planned/was going to 금지).

소재: 주말·방과 후·내일·토요일 일정, 가족·친구·날씨·건강으로 계획 변경.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE17_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (17번 전용):
1. target_time이 지시문에 명확
2. target_person = 지시문 = 최종 계획 말한 화자
3. planned_action = correct_answer (실제 할 일)
4. answer_clue에 최종 계획 문장 (취소된 계획 아님)
5. choices 한글 활동 5개
6. 9/15/16번 유형과 혼동 없음
`.trim();

export function buildType17OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE17_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE17_VALIDATION_CRITERIA}

${TYPE17_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType17PromptBlockForExam(): string {
  return `
### 17번 유형: 특정 시점에 할 일 파악
${TYPE17_GENERATION_RULES}

필수: target_person, target_time, planned_action, mentioned_other_actions
`.trim();
}
