import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 4번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE4_QUESTION_TYPE = "마지막 말의 의도 파악";

export const TYPE4_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 4,
      "question_type": "마지막 말의 의도 파악",
      "instruction": "대화를 듣고, 여자가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["", "", "", "", ""],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "last_speaker": "W",
      "final_utterance": "",
      "target_intention": "칭찬",
      "intention_candidates": ["칭찬", "사과", "거절", "부탁", "항의"],
      "quality_check_focus": [
        "마지막 발화자의 의도가 명확한가",
        "지시문 속 화자와 실제 마지막 화자가 일치하는가",
        "선택지 중 정답이 하나뿐인가",
        "마지막 발화가 너무 짧거나 모호하지 않은가",
        "대화 전체 맥락이 마지막 의도를 뒷받침하는가"
      ]
    }
  ]
}

order_index는 반드시 4.
last_speaker는 "M" 또는 "W" (마지막 segment 화자와 일치).
instruction: 마지막 화자가 남자면 "남자가", 여자면 "여자가".
choices는 한국어 의도어 명사형 5개 (감사·거절·칭찬·사과·항의·격려·부탁·제안·동의·걱정 중).
target_intention과 correct_answer가 가리키는 의도가 일치해야 한다.
needs_image_choices는 false, choice_image_prompts는 [].
`.trim();

const TYPE4_GENERATION_RULES = `
==================================================
4번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 마지막 말의 의도 파악
지시문: 대화를 듣고, 남자/여자가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.

문항 목적: 짧은 대화를 듣고 마지막 발화의 의도를 고른다.

형식:
- M과 W 대화 6~8턴.
- 마지막 말의 의도가 명확 (감사·거절·칭찬·사과·항의·격려·부탁·제안·동의·걱정 중 하나).
- 선택지: 한국어 의도어 5개 (짧은 명사형).
- needs_image_choices: false, visual_choice_type: "none", choice_image_prompts: [].

대본:
- 마지막 발화자 = 지시문의 남자/여자와 일치.
- 마지막 말만으로도 의도가 보이되, 대화 맥락이 뒷받침.
- 두 의도로 해석되면 안 됨. "Okay." "Sure." "Thanks."만으로 끝내지 말 것.
- 중1 수준 영어. 어려운 문법 금지.

의도별 설계 (마지막 말 예):
- 칭찬: You're doing a great job. / Your drawing looks wonderful.
- 사과: I'm sorry about that. / Sorry for the trouble.
- 거절: I don't want to swim this time. / I can't join you today.
- 부탁: Could you help me carry this box?
- 항의: Please check the order next time. (공손한 불만)
- 감사: Thank you for your help.
- 격려: Don't worry. You can do it.

대화 흐름: 상황 제시 → 반응 → 배경 → 의도 유도 → 마지막 말에서 의도 명확.

last_speaker, final_utterance, target_intention, intention_candidates 필수.
question_text는 비워 둔다.
`.trim();

const TYPE4_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (4번 전용):
1. 지시문·마지막 화자 일치
2. 마지막 발화 의도 명확·모호하지 않음
3. choices 한국어 의도어 5개, 정답 하나
4. answer_clue에 마지막 발화 포함
5. 그림 선택지 없음
`.trim();

export function buildType4OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE4_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE4_VALIDATION_CRITERIA}

${TYPE4_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType4PromptBlockForExam(): string {
  return `
### 4번 유형: 마지막 말의 의도 파악
${TYPE4_GENERATION_RULES}

필수: needs_image_choices=false, visual_choice_type="none", last_speaker/target_intention/final_utterance, question_text=""
`.trim();
}
