import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 11번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE11_QUESTION_TYPE = "이동 방법 파악";

export const TYPE11_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 11,
      "question_type": "이동 방법 파악",
      "instruction": "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["버스", "도보", "택시", "자전거", "지하철"],
      "choice_image_prompts": [],
      "correct_answer": 5,
      "answer_clue": "Good idea. Let's take the subway.",
      "explanation": "",
      "destination": "art museum",
      "final_transport": "지하철",
      "mentioned_transport_options": [
        { "transport": "버스", "role": "candidate", "reason": "traffic is heavy" },
        { "transport": "도보", "role": "candidate", "reason": "too long on foot" },
        { "transport": "지하철", "role": "final", "reason": "station close to museum" }
      ],
      "quality_check_focus": [
        "최종 이동 방법이 명확한가",
        "대화에 여러 교통수단이 자연스럽게 등장하는가",
        "선택지가 모두 한글 교통수단인가",
        "정답은 두 사람이 함께 이동하기로 한 방법인가",
        "중간 이동 방법과 최종 이동 방법이 혼동되지 않는가"
      ]
    }
  ]
}

order_index는 반드시 11.
M/W 대화 6~8턴. 목적지 명확, 교통수단 2개 이상 언급, 마지막에 최종 결정.
choices: 한글 교통수단 5개 (도보, 버스, 지하철, 택시, 자전거, 자동차, 기차, 비행기, 배).
final_transport = correct_answer 선택지. answer_clue = Let's take ... 최종 결정 문장.
segments=영어, script_translation=한국어. needs_image_choices false.
`.trim();

const TYPE11_GENERATION_RULES = `
==================================================
11번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 이동 방법 파악
지시문: 대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.

문항 목적: 여러 이동 방법을 듣고, 두 사람이 최종적으로 함께 이동하기로 한 교통수단을 고른다.

그림: needs_image_choices=false, visual_choice_type="none", choice_image_prompts=[]

대본 (M/W, 6~8턴):
1. 목적지 언급
2. 이동 방법 질문/제안
3. 첫 후보 교통수단
4. 문제점 (too slow, crowded, far, expensive, no parking, rain 등)
5. 다른 후보 제안
6. 최종 동의 — 마지막 1~2턴에 Let's take ... / Let's walk there together

choices: 한글 교통수단 5개 (도보, 버스, 지하철, 택시, 자전거, 자동차, 기차, 비행기, 배).
장소·행동·목적지를 선택지에 넣지 않음.

오답: 대화에 언급된 후보 또는 그럴듯한 교통수단.
정답: 최종 함께 이동하기로 한 방법 하나만 명확.

필수: destination, final_transport, mentioned_transport_options, answer_clue, explanation.
final_transport = correct_answer. answer_clue는 제안(We can take)이 아니라 최종 결정(Let's take) 문장.

소재: 가족 행사, 학교/학원 견학, 친구 약속, 나들이 등.
기존 기출 복사 금지. 중1 수준 영어, 관계대명사·가정법·분사구문 금지.
`.trim();

const TYPE11_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (11번 전용):
1. 목적지(destination) 명확
2. 교통수단 2개 이상 언급, 최종 1개만 정답
3. choices 한글 교통수단 5개
4. final_transport = correct_answer
5. answer_clue = Let's take / Let's walk 최종 결정 문장
`.trim();

export function buildType11OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE11_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE11_VALIDATION_CRITERIA}

${TYPE11_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType11PromptBlockForExam(): string {
  return `
### 11번 유형: 이동 방법 파악
${TYPE11_GENERATION_RULES}

필수: destination, final_transport, mentioned_transport_options, needs_image_choices=false
`.trim();
}
