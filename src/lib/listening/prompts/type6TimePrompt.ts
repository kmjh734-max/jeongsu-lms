import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 6번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE6_QUESTION_TYPE = "시각 파악";

export const TYPE6_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 6,
      "question_type": "시각 파악",
      "instruction": "대화를 듣고, 두 사람이 만날 시각을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["1:30 p.m.", "2:00 p.m.", "2:30 p.m.", "3:00 p.m.", "3:30 p.m."],
      "choice_image_prompts": [],
      "correct_answer": 2,
      "answer_clue": "",
      "explanation": "",
      "time_question_target": "만날 시각",
      "final_time": "2:00 p.m.",
      "mentioned_times": [
        { "time": "2:30 p.m.", "role": "영화 시작 시각" },
        { "time": "1:30 p.m.", "role": "처음 제안한 만남 시각" },
        { "time": "2:00 p.m.", "role": "최종 만남 시각 / 정답" }
      ],
      "quality_check_focus": [
        "지시문이 묻는 시각과 final_time이 일치하는가",
        "대본에 여러 시각이 자연스럽게 등장하는가",
        "최종 시각이 마지막 부분에서 명확히 확인되는가",
        "선택지 5개가 모두 시각인가",
        "현재 시각, 시작 시각, 만날 시각, 출발 시각이 서로 혼동되지 않는가"
      ]
    }
  ]
}

order_index는 반드시 6.
M/W 대화 6~8턴. 시각 2~3개 이상 (현재·제안·변경·최종).
choices: 영어 시각 5개 통일 형식 (예: 4:30 p.m.) — a.m./p.m. 필수.
final_time = 지시문에서 묻는 최종 시각. correct_answer는 final_time과 일치.
needs_image_choices false, choice_image_prompts [].
`.trim();

const TYPE6_GENERATION_RULES = `
==================================================
6번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 시각 파악
지시문 예: 만날 시각 / 수업 시작 시각 / 행사 시작 시각 / 출발 시각 (상황에 맞게)

문항 목적: 대화 속 여러 시각 중 지시문이 묻는 최종 시각을 고른다.

형식:
- M과 W 대화 6~8턴.
- 시각 2~3개 이상 (current, original, suggested, changed, final).
- 마지막 1~2턴에서 final_time 확인 (So we'll meet at ..., right? / That's right).
- choices: 시각 5개 (3:30 p.m. 형식 통일). 오답은 대본의 다른 시각 포함 가능.
- needs_image_choices: false, visual_choice_type: "none".

상황: 약속 시각 / 수업 시작 / 행사 시작 / 출발 시각 중 하나.

주의:
- 지시문이 만날 시각이면 정답은 만남 시각 (영화 시작 시각 X).
- 지시문이 출발 시각이면 정답은 leave home 시각 (기차 출발 시각 X).
- final_time과 time_question_target 일치.
- question_text 비움.
`.trim();

const TYPE6_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (6번 전용):
1. choices 시각 5개, a.m./p.m. 명확
2. final_time = 정답, 지시문과 일치
3. answer_clue에 final_time 확인 문장
4. 대본 시각 2개 이상, 마지막에 최종 확인
`.trim();

export function buildType6OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE6_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE6_VALIDATION_CRITERIA}

${TYPE6_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType6PromptBlockForExam(): string {
  return `
### 6번 유형: 시각 파악
${TYPE6_GENERATION_RULES}

필수: time_question_target, final_time, mentioned_times, needs_image_choices=false
`.trim();
}
