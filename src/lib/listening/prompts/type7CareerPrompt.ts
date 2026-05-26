import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 7번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE7_QUESTION_TYPE = "장래 희망 파악";

export const TYPE7_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 7,
      "question_type": "장래 희망 파악",
      "instruction": "대화를 듣고, 여자의 장래 희망으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["작가", "기자", "화가", "요리사", "통역사"],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "target_person": "여자",
      "dream_job": "작가",
      "interest_clues": ["노트에 아이디어 적기", "학교 생활 미스터리 이야기 쓰기"],
      "quality_check_focus": [
        "장래 희망이 명확히 제시되었는가",
        "관심사와 직업이 자연스럽게 연결되는가",
        "선택지가 모두 한국어 직업명인가",
        "정답 직업이 하나만 가능한가",
        "직업명이 너무 초반에 갑자기 나오지 않는가"
      ]
    }
  ]
}

order_index는 반드시 7.
M/W 대화 6~8턴. 관심사→활동→이유→후반 "I want to be a/an ...".
choices: 한국어 직업명 5개. target_person은 "남자" 또는 "여자"(지시문과 일치).
dream_job과 correct_answer 일치. needs_image_choices false.
`.trim();

const TYPE7_GENERATION_RULES = `
==================================================
7번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 장래 희망 파악
지시문: 대화를 듣고, 남자/여자의 장래 희망으로 가장 적절한 것을 고르시오.

문항 목적: 관심사·활동을 듣고 장래 직업을 고른다.

형식:
- M/W 대화 6~8턴.
- 흐름: 관심 질문 → 활동 → 이유 → 장래 희망 질문 → I want to be a/an ... → 마무리.
- choices: 한국어 직업명 5개 (같은 범주).
- 직업명은 대화 후반에 명확히 1회 이상.
- needs_image_choices: false, visual_choice_type: "none".

소재: 글쓰기·동물·사진·악기·요리·운동·과학·컴퓨터 등 → 연결된 직업.
중1 수준 직업만. 영어/한글 보기 혼용 금지.

target_person, dream_job, interest_clues 필수.
question_text 비움.
`.trim();

const TYPE7_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (7번 전용):
1. I want to be a/an ... 포함
2. target_person = 지시문 남자/여자 = 장래 희망 말한 화자
3. choices 한국어 직업 5개
4. dream_job = correct_answer
`.trim();

export function buildType7OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE7_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE7_VALIDATION_CRITERIA}

${TYPE7_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType7PromptBlockForExam(): string {
  return `
### 7번 유형: 장래 희망 파악
${TYPE7_GENERATION_RULES}

필수: target_person, dream_job, interest_clues, needs_image_choices=false
`.trim();
}
