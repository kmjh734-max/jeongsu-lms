import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 1번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE1_QUESTION_TYPE = "묘사 듣고 대상 고르기";

export const TYPE1_INSTRUCTION =
  "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.";

export const TYPE1_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 1,
      "question_type": "묘사 듣고 대상 고르기",
      "instruction": "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.",
      "needs_image_choices": true,
      "segments": [
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
      "quality_check_focus": [
        "정답 단서가 충분한가",
        "선택지 중 정답이 하나만 가능한가",
        "그림으로 표현 가능한 선택지인가",
        "문장이 너무 유치하거나 단순하지 않은가",
        "중1 수준을 넘지 않는가"
      ]
    }
  ]
}
`.trim();

const TYPE1_GENERATION_RULES = `
==================================================
1번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 묘사 듣고 대상 고르기
지시문: 다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.

문항 목적:
학생이 짧은 영어 설명을 듣고, 설명 속 "I"가 무엇인지 추론한다.

문항 형식:
- 한 명의 화자(M 또는 W만)가 1인칭(I)으로 자신을 어떤 대상처럼 설명한다.
- 대상은 동물, 사물, 장소, 직업 중 하나.
- 마지막 문장은 반드시 "What am I?"로 끝낸다.
- 학생은 ①~⑤ 중 정답을 고른다.

그림 선택지:
- needs_image_choices: true
- choice_image_prompts 5개 필수 — 각 선택지 그림을 중학교 시험지용 단순 흑백/깔끔 일러스트로 설명.
- 예: "A simple illustration of a turtle with a shell"

생성 기준:
- 기출 대본·문장 복사 금지. 완전히 새 대상·새 문장.
- 형식·난이도는 중1 영어듣기평가 1번 수준.

대본:
- 화자 M 또는 W 한 명만. ANN 사용 금지.
- 5~7문장. 정체 추론에 충분한 단서. 문장이 너무 짧고 유치하지 않게.
- 중1 수준 영어. 관계대명사·가정법·분사구문 금지. because, but, and, when 사용 가능.
- 처음부터 정답이 드러나지 않게. 단서를 점점 구체적으로.
- 마지막 문장 반드시 "What am I?"
- "I am a cat."처럼 정답을 직접 말하지 말 것.

대본 흐름 (참고, 그대로 복사 금지):
1. 사는 곳 또는 사용되는 장소
2. 크기나 모양
3. 특징적인 행동 또는 기능
4. 다른 대상과 구별되는 핵심 특징
5. What am I?

정답 대상:
- turtle, rabbit, pencil, umbrella, library, doctor 등 중1 수준.
- 그림으로 표현하기 쉬운 단어.
- 선택지 5개는 반드시 같은 범주 (모두 동물 / 모두 사물 / 모두 장소 / 모두 직업).
- 범주 섞기 금지 (turtle + pencil + hospital 금지).

선택지:
- 영어 단어 또는 짧은 명사구 (예: A turtle).
- 정답 1개만. 오답은 같은 범주·그럴듯하나 대본 단서와는 맞지 않게.
- correct_answer: 1~5.

정답 명확성:
- answer_clue: 대본 속 근거 문장(영어).
- explanation: 왜 정답인지 한국어 짧게.
- 단서 부족·복수 정답 가능·첫 문장만으로 맞힘·너무 어려움 금지.

question_text는 비워 둔다.
`.trim();

const TYPE1_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (1번 전용):
1. 마지막 문장이 "What am I?"인가?
2. 선택지 5개·같은 범주인가?
3. 정답이 하나만 명확한가?
4. answer_clue가 대본에 있는가?
5. 단서가 너무 노골적이지 않은가?
6. 대본이 너무 짧고 유치하지 않은가?
7. 중1 수준을 넘는 단어·문법이 없는가?
8. choice_image_prompts 5개가 모두 있는가?
`.trim();

/**
 * 1번 유형 단독 생성용 전체 프롬프트 (다른 유형 규칙 없음)
 */
export function buildType1OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE1_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE1_VALIDATION_CRITERIA}

${TYPE1_JSON_OUTPUT_SCHEMA}

order_index는 반드시 1.
`.trim();
}

/** 20문항 일괄 생성 시 1번 슬롯에만 삽입되는 블록 (다른 유형 본문은 포함하지 않음) */
export function getType1PromptBlockForExam(): string {
  return `
### 1번 유형: 묘사 듣고 대상 고르기
${TYPE1_GENERATION_RULES}

필수 필드: needs_image_choices=true, choice_image_prompts[5], question_text=""
`.trim();
}
