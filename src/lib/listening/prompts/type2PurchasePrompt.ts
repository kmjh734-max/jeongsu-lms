import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 2번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE2_QUESTION_TYPE = "구입/주문 정보 파악";

export const TYPE2_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 2,
      "question_type": "구입/주문 정보 파악",
      "instruction": "대화를 듣고, 남자가 구입한 것으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": true,
      "visual_choice_type": "image",
      "segments": [
        { "speaker": "W", "text": "" },
        { "speaker": "M", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["", "", "", "", ""],
      "choice_image_prompts": ["", "", "", "", ""],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "selected_conditions": {
        "item_type": "",
        "color": "",
        "pattern_or_shape": "",
        "extra_feature": "",
        "final_choice_sentence": ""
      },
      "quality_check_focus": [
        "최종 선택 문장이 있는가",
        "그림 선택지가 필요한 유형으로 설정되었는가",
        "choice_image_prompts가 5개 모두 있는가",
        "선택지 5개가 모두 같은 물건 범주인가",
        "정답 조건을 만족하는 그림 선택지가 하나뿐인가",
        "오답 그림이 조건 하나씩 다르게 자연스럽게 구성되었는가",
        "대화가 실제 구매/주문 상황처럼 자연스러운가"
      ]
    }
  ]
}

order_index는 반드시 2.
instruction의 ○○는 구매하는 사람이 남자면 "남자", 여자면 "여자"로 채운다.
구입/주문 중 상황에 맞는 표현을 사용한다.
`.trim();

const TYPE2_GENERATION_RULES = `
==================================================
2번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 구입/주문 정보 파악
지시문: 대화를 듣고, 남자/여자가 구입한(또는 주문한) 것으로 가장 적절한 것을 고르시오.
(구매자가 남자면 "남자가 구입한", 여자면 "여자가 구입한" — 주문 상황이면 "주문한")

문항 목적:
가게·카페·식당·문구점·옷가게 등에서 대화를 듣고, 화자가 최종 선택·주문한 물건을 파악한다.

핵심:
- 음성 대화만으로 정답 조건 파악.
- 선택지는 그림 선택지가 원칙 (needs_image_choices: true, visual_choice_type: "image").
- choice_image_prompts 5개 필수 — 중학교 시험지용 단순 일러스트 설명.

그림으로 구분 가능한 조건: 색상, 무늬, 모양, 토핑, 부속품, 크기, 주머니/리본/바퀴 등.
피할 조건: 가격만 다름, 브랜드명만, 미묘한 선호만, 그림으로 차이 안 나는 조건 (cheap, popular, nice만 다른 것).

대본:
- M과 W 모두 사용. 점원·손님 역할.
- 대화 6~8턴. 중1 수준 자연스러운 영어.
- 여러 후보 후 마지막에 최종 선택 명확.
- 구매 조건 2~3개, 그림으로 표현 가능하게.
- 정답 단서는 대화 마지막 부분.

대화 흐름:
1. 점원 인사/무엇을 원하는지
2. 손님 물건 종류
3. 점원 후보·조건 제시
4. 손님 선택·거절
5. 점원 추가 조건 물건
6. 손님 최종 조건 확인
7. 손님 최종 선택 ("I'll take the ..." / "I'll have the ..." / "I'll buy ...")
8. 확인·감사

최종 선택 문장 필수. "I like it."만으로 끝내지 말 것.

소재 예: 아이스크림(cup/cone, topping), 가방(색·무늬·주머니), 모자, 우산, 인형(직업·부속), 코트, 음료 등.
기출 예시 문장·상황 복사 금지. 새 상황·새 문장.

선택지:
- 영어로 같은 물건 범주 5개 (예: 모두 ice cream, 모두 bag).
- 각 선택지는 그림으로 구분 가능하게 (색·무늬·토핑·부속 등 1~2가지 차이).
- 정답 1개. 오답은 정답 조건 일부만 맞고 핵심이 다름.
- choice_image_prompts: "A simple test-style illustration of ..."

selected_conditions 필수:
- item_type, color, pattern_or_shape, extra_feature, final_choice_sentence

question_text는 비워 둔다.
`.trim();

const TYPE2_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (2번 전용):
1. needs_image_choices true, visual_choice_type "image"
2. choice_image_prompts 5개
3. 선택지 같은 물건 범주
4. 정답 그림 조건 하나뿐
5. 최종 선택 문장 대본에 있음
6. answer_clue에 최종 선택 포함
7. 그림으로 구분 가능한 조건만 사용
8. 중1 수준·너무 유치하지 않음
`.trim();

export function buildType2OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE2_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE2_VALIDATION_CRITERIA}

${TYPE2_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType2PromptBlockForExam(): string {
  return `
### 2번 유형: 구입/주문 정보 파악
${TYPE2_GENERATION_RULES}

필수: needs_image_choices=true, visual_choice_type="image", choice_image_prompts[5], selected_conditions, question_text=""
`.trim();
}
