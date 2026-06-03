import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 10번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE10_QUESTION_TYPE = "대화의 핵심 내용 파악";

export const TYPE10_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 10,
      "question_type": "대화의 핵심 내용 파악",
      "instruction": "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["동영상 촬영 장소", "악기 보관 방법", "교문 공사 일정", "정원 조성 계획", "인터넷 교체 비용"],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "main_content": "동영상 촬영 장소",
      "content_clues": ["a good place to film it", "record our performance"],
      "distractor_reasons": [
        { "choice": "악기 보관 방법", "reason": "악기는 언급되지만 대화 핵심은 촬영 장소" }
      ],
      "quality_check_focus": [
        "대화 전체의 핵심 내용이 명확한가",
        "정답이 기출형 한글 명사구인가",
        "선택지가 단어가 아니라 핵심 내용 명사구인가",
        "오답은 대화와 일부 관련되지만 전체 내용은 아닌가",
        "대화가 하나의 핵심 내용으로 일관되는가"
      ]
    }
  ]
}

order_index는 반드시 10.
M/W 대화 6~8턴. 대화 전체가 하나의 핵심 내용으로 일관.
choices: 한글 핵심 내용 명사구 5개 (동영상 촬영 장소, 물건 나눔, 발표 연습 장소 등).
단어·장소명·동사만 금지. main_content = correct_answer 선택지.
segments=영어, script_translation=한국어. needs_image_choices false.
distractor_reasons: 오답 4개 각각 { choice, reason }.
`.trim();

const TYPE10_GENERATION_RULES = `
==================================================
10번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 대화의 핵심 내용 파악
지시문: 대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.

문항 목적: 대화 전체를 가장 잘 요약하는 한글 핵심 내용 명사구를 고른다.
단순 추상적 "주제"가 아니라 기출형 핵심 내용 명사구 (동영상 촬영 장소, 물건 나눔, 발표 연습 장소 등).

그림: needs_image_choices=false, visual_choice_type="none", choice_image_prompts=[]

대본:
- M/W 모두 사용, 6~8턴.
- 중1 수준 자연스러운 영어. 관계대명사·가정법·분사구문 금지.
- 초반 상황/문제 → 중간 세부 → 후반 무엇을 하려는지/정하는지 명확.
- 대화 전체가 하나의 핵심 내용으로 일관.

선택지 (choices):
- 한글 핵심 내용 명사구 5개.
- 좋음: 동영상 촬영 장소, 물건 나눔, 발표 연습 장소, 행사 안내 글 작성, 체육복 찾기
- 나쁨: 기타, 장난감, 촬영, 좋은 장소, 찍다 (단어·동사·형용사만)
- 영어 혼용 금지. 정답만 유난히 길거나 구체적이면 안 됨.

오답:
- 대화 일부 단어·상황과 약간 관련되나 전체 핵심 내용은 아님.
- 완전히 엉뚱한 오답 금지 (생일 케이크 주문, 병원 예약 등).

소재 예: 장소 정하기, 물건 나눔/기부, 준비/계획, 잃어버린 물건 찾기, 온라인 게시/안내 글 작성.

필수 필드: main_content, content_clues, distractor_reasons, answer_clue, explanation.
main_content = correct_answer 선택지와 동일.
answer_clue: 대화 핵심을 보여주는 영어 문장 1~2개 (It's quiet, Good idea 같은 약한 단서 금지).
question_text 비움. 너무 넓은 정답(학교생활, 문제 해결) 금지.

기존 기출 대본 복사 금지. 완전히 새로운 상황·문장.
`.trim();

const TYPE10_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (10번 전용):
1. question_type = "대화의 핵심 내용 파악"
2. choices 한글 명사구 5개 (단어 수준 금지)
3. main_content = 정답, 대화 전체 요약
4. answer_clue 핵심 문장 1~2개
5. 오답 distractor_reasons 4개
6. 대화 6~8턴, M/W, 하나의 핵심 내용으로 일관
`.trim();

export function buildType10OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE10_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE10_VALIDATION_CRITERIA}

${TYPE10_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType10PromptBlockForExam(): string {
  return `
### 10번 유형: 대화의 핵심 내용 파악
${TYPE10_GENERATION_RULES}

필수: main_content, content_clues, distractor_reasons, needs_image_choices=false
`.trim();
}
