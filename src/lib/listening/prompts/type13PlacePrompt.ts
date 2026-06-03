import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 13번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE13_QUESTION_TYPE = "대화 장소 파악";

export const TYPE13_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 13,
      "question_type": "대화 장소 파악",
      "instruction": "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["보건실", "교무실", "음악실", "미술실", "과학실"],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "Let me check your temperature first. / Please lie down on this bed.",
      "explanation": "",
      "target_place": "보건실",
      "place_clues": ["check your temperature", "lie down on this bed", "call your homeroom teacher"],
      "distractor_places": [
        { "place": "교무실", "reason": "열·침대·체온 단서와 맞지 않음" }
      ],
      "quality_check_focus": [
        "정답 장소명을 직접 말하지 않았는가",
        "장소를 추론할 수 있는 단서가 충분한가",
        "선택지가 모두 한글 장소명인가",
        "정답 장소가 하나만 가능한가",
        "오답 장소가 너무 애매하게 겹치지 않는가"
      ]
    }
  ]
}

order_index는 반드시 13.
M/W 대화 6~8턴. 장소명 직접 언급 금지 (We are in the library 등).
choices: 한글 장소명 5개. target_place = correct_answer.
place_clues 2개 이상, answer_clue = 장소 추론 핵심 문장 2개.
segments=영어, script_translation=한국어. needs_image_choices false.
`.trim();

const TYPE13_GENERATION_RULES = `
==================================================
13번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 대화 장소 파악
지시문: 대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.

문항 목적: 대화 속 단서(물건·행동·서비스)로 두 사람이 현재 어디에 있는지 추론.

그림: needs_image_choices=false, visual_choice_type="none", choice_image_prompts=[]

대본 (M/W, 6~8턴):
- 장소명 직접 말하지 않음 (library, pharmacy, We are in ... 금지)
- 장소 단서 최소 2개 (temperature/bed→보건실, shoes/size→신발 가게, borrow/return→도서관)
- 마지막에 장소가 더 명확해지는 표현

choices: 한글 장소명 5개. 행동·물건·이유 금지.
오답: 비슷한 생활 장소이지만 대화 단서와 맞지 않음.

필수: target_place, place_clues, distractor_places, answer_clue, explanation.
target_place = correct_answer. answer_clue = 장소 추론 핵심 문장 2개.

소재: 보건실, 신발 가게, 약국, 도서관, 우체국, 동물병원, 영화관 등.
도서관 vs 서점: borrow/return/card 사용, buy/price 금지.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE13_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (13번 전용):
1. 대본에 정답 장소명 직접 언급 없음
2. place_clues 2개 이상
3. choices 한글 장소명 5개
4. target_place = correct_answer
5. answer_clue = 장소 추론 단서 2문장
`.trim();

export function buildType13OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE13_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE13_VALIDATION_CRITERIA}

${TYPE13_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType13PromptBlockForExam(): string {
  return `
### 13번 유형: 대화 장소 파악
${TYPE13_GENERATION_RULES}

필수: target_place, place_clues, distractor_places, needs_image_choices=false
`.trim();
}
