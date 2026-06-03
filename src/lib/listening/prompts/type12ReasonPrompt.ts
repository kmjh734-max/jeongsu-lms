import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 12번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE12_QUESTION_TYPE = "이유 파악";

export const TYPE12_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 12,
      "question_type": "이유 파악",
      "instruction": "대화를 듣고, 남자가 시립 공원에 가는 이유로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["자전거를 타기 위해서", "그림을 그리기 위해서", "나무를 심기 위해서", "곤충을 관찰하기 위해서", "친구를 만나기 위해서"],
      "choice_image_prompts": [],
      "correct_answer": 3,
      "answer_clue": "We'll plant young trees near the lake.",
      "explanation": "",
      "target_person": "남자",
      "target_place": "시립 공원",
      "reason_for_going": "나무를 심기 위해서",
      "mentioned_possible_reasons": [
        { "reason": "자전거를 타기 위해서", "role": "mentioned_but_not_answer" },
        { "reason": "나무를 심기 위해서", "role": "answer_reason" }
      ],
      "quality_check_focus": [
        "장소에 가는 이유가 명확한가",
        "정답은 장소가 아니라 이유인가",
        "지시문 대상과 이유를 말한 화자가 일치하는가",
        "선택지가 모두 한글 이유 표현인가",
        "오답은 장소와 관련 있지만 실제 이유는 아닌가"
      ]
    }
  ]
}

order_index는 반드시 12.
M/W 대화 6~8턴. target_person=남자/여자, target_place=한글 장소명.
instruction: "대화를 듣고, 남자/여자가 ○○에 가는 이유로 ..."
choices: 한글 이유 5개 (~하기 위해서). reason_for_going = correct_answer.
answer_clue = 이유를 직접 보여주는 영어 문장. segments=영어, script_translation=한국어.
needs_image_choices false.
`.trim();

const TYPE12_GENERATION_RULES = `
==================================================
12번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 이유 파악
지시문: 대화를 듣고, 남자/여자가 ○○(한글 장소)에 가는 이유로 가장 적절한 것을 고르시오.

문항 목적: 특정 인물이 특정 장소에 가는 이유(목적)를 고른다. 정답은 장소가 아니라 이유.

그림: needs_image_choices=false, visual_choice_type="none", choice_image_prompts=[]

대본 (M/W, 6~8턴):
1. 어디에 가는지 말함
2. 왜 가는지 질문
3. 오해 가능한 다른 활동 언급 가능
4. 목표 인물이 실제 이유 설명
5. 마지막에 이유 재확인

choices: 한글 이유 5개 (~하기 위해서). 장소명·단어만 금지.
오답: 같은 장소에서 할 법한 활동이지만 대본에서 확정되지 않은 것.

필수: target_person, target_place, reason_for_going, mentioned_possible_reasons, answer_clue.
target_person = 지시문 남자/여자 = 이유를 말한 화자.
reason_for_going = correct_answer. answer_clue는 이유 직접 제시 (I'm going there 금지).

소재: 공원, 도서관, 체육관, 동물 보호소, 박물관, 우체국 등.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE12_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (12번 전용):
1. target_person = 지시문 = 이유 말한 화자
2. target_place가 instruction과 대본에 일치
3. choices 한글 이유 5개
4. reason_for_going = correct_answer
5. answer_clue = 이유 직접 보여주는 문장
`.trim();

export function buildType12OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE12_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE12_VALIDATION_CRITERIA}

${TYPE12_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType12PromptBlockForExam(): string {
  return `
### 12번 유형: 이유 파악
${TYPE12_GENERATION_RULES}

필수: target_person, target_place, reason_for_going, mentioned_possible_reasons, needs_image_choices=false
`.trim();
}
