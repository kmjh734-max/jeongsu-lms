import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 14번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE14_QUESTION_TYPE = "표 정보 불일치";

export const TYPE14_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 14,
      "question_type": "표 정보 불일치",
      "instruction": "One-Day Baking Class에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "table",
      "segments": [
        { "speaker": "W", "text": "Hello, students. Let me tell you about our One-Day Baking Class." }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["날짜", "장소", "주제", "참가비", "준비물"],
      "choice_image_prompts": [],
      "correct_answer": 3,
      "answer_clue": "대본에서는 banana muffins를 만든다고 했지만, 표에는 초콜릿 쿠키 만들기",
      "explanation": "",
      "table_data": {
        "title": "One-Day Baking Class",
        "rows": [
          { "no": 1, "label": "날짜", "value": "5월 12일" },
          { "no": 2, "label": "장소", "value": "학교 요리실" },
          { "no": 3, "label": "주제", "value": "초콜릿 쿠키 만들기" },
          { "no": 4, "label": "참가비", "value": "5달러" },
          { "no": 5, "label": "준비물", "value": "앞치마" }
        ],
        "mismatch_no": 3,
        "mismatch_reason": "대본에서는 바나나 머핀을 만든다고 했지만, 표에는 초콜릿 쿠키 만들기라고 되어 있음"
      },
      "source_facts_from_script": [
        { "label": "날짜", "value": "5월 12일" },
        { "label": "장소", "value": "학교 요리실" },
        { "label": "주제", "value": "바나나 머핀 만들기" },
        { "label": "참가비", "value": "5달러" },
        { "label": "준비물", "value": "앞치마" }
      ],
      "quality_check_focus": [
        "table_data가 존재하는가",
        "표 항목이 정확히 5개인가",
        "불일치 항목이 정확히 하나인가",
        "correct_answer와 mismatch_no가 일치하는가",
        "나머지 4개 항목은 대본과 표가 일치하는가"
      ]
    }
  ]
}

order_index는 반드시 14.
table_data 필수 (없으면 실패). rows 5개, mismatch_no 1~5, correct_answer = mismatch_no.
화자 M 또는 W 한 명, 안내문 5~7문장. visual_choice_type="table", needs_image_choices=false.
choices = table rows label 순서. 4개 일치 + 1개만 표와 다르게.
question_text 비움. segments=영어, script_translation=한국어.
`.trim();

const TYPE14_GENERATION_RULES = `
==================================================
14번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 표 정보 불일치
지시문: ○○(영어 프로그램명)에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.

문항 목적: 영어 안내문을 듣고 표와 비교하여 일치하지 않는 항목 1개를 고른다.

필수: table_data { title, rows[5], mismatch_no, mismatch_reason }
- rows: no 1~5, label(한글 항목명), value(한글 또는 영어)
- 4개 row는 대본과 일치, 1개 row만 대본과 불일치
- correct_answer = mismatch_no

그림: needs_image_choices=false, visual_choice_type="table", choice_image_prompts=[]

대본:
- M 또는 W 한 명, 안내문 5~7문장
- 날짜·시간·장소·대상·참가비·준비물·신청 방법·활동 내용 등 5개 정보 모두 포함
- 불일치 항목은 대본과 표에서 명확히 다르게

choices: table rows의 label 5개 (같은 순서).
source_facts_from_script: 대본 기준 5개 정보 { label, value }.

설계 순서: 5개 정보 → 대본에 모두 넣기 → 표 4개 일치 + 1개만 다르게.
날짜/일시, 장소/위치 중복 항목 금지.

소재: 베이킹 수업, 음악 축제, 독서 캠프, 축구 교실, 과학 박람회 등.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE14_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (14번 전용):
1. table_data 존재, rows 5개
2. 불일치 정확히 1개, correct_answer = mismatch_no
3. choices = label 순서
4. mismatch_reason 명확
5. 단일 화자 안내문
`.trim();

export function buildType14OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE14_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE14_VALIDATION_CRITERIA}

${TYPE14_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType14PromptBlockForExam(): string {
  return `
### 14번 유형: 표 정보 불일치
${TYPE14_GENERATION_RULES}

필수: table_data, source_facts_from_script, visual_choice_type="table"
`.trim();
}
