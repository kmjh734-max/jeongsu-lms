import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 5번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE5_QUESTION_TYPE = "언급하지 않은 것";

export const TYPE5_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 5,
      "question_type": "언급하지 않은 것",
      "instruction": "다음을 듣고, 남자가 자신의 형에 대해 언급하지 않은 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["이름", "나이", "직업", "성격", "취미"],
      "choice_image_prompts": [],
      "correct_answer": 4,
      "answer_clue": "",
      "explanation": "",
      "mention_plan": {
        "topic": "",
        "choice_items": [
          { "no": 1, "label": "이름", "mentioned": true, "evidence": "" },
          { "no": 2, "label": "나이", "mentioned": true, "evidence": "" },
          { "no": 3, "label": "직업", "mentioned": true, "evidence": "" },
          { "no": 4, "label": "성격", "mentioned": false, "evidence": "" },
          { "no": 5, "label": "취미", "mentioned": true, "evidence": "" }
        ],
        "unmentioned_no": 4,
        "unmentioned_label": "성격"
      },
      "quality_check_focus": [
        "보기 5개가 모두 한글 정보 항목인가",
        "영어 세부정보가 보기에 들어가지 않았는가",
        "언급된 항목이 정확히 4개인가",
        "언급되지 않은 항목이 정확히 1개인가",
        "correct_answer와 unmentioned_no가 일치하는가",
        "정답 항목이 대본에 간접적으로도 언급되지 않았는가"
      ]
    }
  ]
}

order_index는 반드시 5.
화자는 M 또는 W 한 명만 (담화형 5~7문장).
choices는 한글 정보 항목 5개 (이름·나이·직업·성격·취미 또는 행사 날짜·장소 등).
영어 선택지·영어 세부정보 보기 금지.
mention_plan: mentioned true 4개, false 1개. correct_answer = unmentioned_no.
needs_image_choices false, choice_image_prompts [].
`.trim();

const TYPE5_GENERATION_RULES = `
==================================================
5번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 언급하지 않은 것
지시문: 다음을 듣고, 남자/여자가 ○○에 대해 언급하지 않은 것을 고르시오.

문항 목적: 영어 안내/소개를 듣고 한글 보기 5개 중 대본에 언급되지 않은 항목을 고른다.

형식:
- M 또는 W 한 명 담화 5~7문장.
- 보기 5개: 모두 한글 정보 항목 (같은 범주).
- 대본(영어)에 4개만 언급, 1개는 절대 언급하지 않음 → 그 1개가 정답.
- needs_image_choices: false, visual_choice_type: "none", choice_image_prompts: [].

소재 (하나 선택): 사람 소개 / 행사 안내 / 수업·프로그램 안내 / 공연·전시 안내.

mention_plan을 먼저 설계한 뒤 대본 작성:
- mentioned true 4개 → 대본에 evidence 문장 반영.
- mentioned false 1개 → 대본에 직접·간접 언급 금지.
  예: 정답이 성격이면 kind, friendly, nice, quiet 사용 금지.
  예: 정답이 참가비이면 free, fee, pay, dollars 사용 금지.
  예: 정답이 티켓 구입처이면 website, ticket office, online 구입 표현 금지.

선택지 나쁜 예: Chris Jackson, 20 years old, pianist (영어 세부정보)
선택지 좋은 예: 이름, 나이, 직업, 성격, 취미

instruction의 화자(남자/여자)는 segments 화자와 일치.
question_text는 비워 둔다.
`.trim();

const TYPE5_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (5번 전용):
1. choices 한글 정보 항목 5개
2. mention_plan mentioned true 4개 / false 1개
3. correct_answer = unmentioned_no
4. 미언급 항목이 대본에 없음
5. 언급 4개는 evidence가 대본에 있음
`.trim();

export function buildType5OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE5_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE5_VALIDATION_CRITERIA}

${TYPE5_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType5PromptBlockForExam(): string {
  return `
### 5번 유형: 언급하지 않은 것
${TYPE5_GENERATION_RULES}

필수: mention_plan, 한글 choices, needs_image_choices=false, question_text=""
`.trim();
}
