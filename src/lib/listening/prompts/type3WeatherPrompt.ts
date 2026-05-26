import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 3번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE3_QUESTION_TYPE = "날씨 파악";

export const TYPE3_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 3,
      "question_type": "날씨 파악",
      "instruction": "다음을 듣고, 부산의 오늘 오후 날씨로 가장 적절한 것을 고르시오.",
      "needs_image_choices": true,
      "visual_choice_type": "weather_icon",
      "segments": [{ "speaker": "W", "text": "" }],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["", "", "", "", ""],
      "choice_image_prompts": ["", "", "", "", ""],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "weather_target_location": "부산",
      "weather_target_time": "오늘 오후",
      "weather_answer": "비",
      "mentioned_weather_by_time": [
        { "time": "오늘 아침", "weather": "흐림" },
        { "time": "오늘 오후", "weather": "비" },
        { "time": "내일", "weather": "맑음" }
      ],
      "quality_check_focus": [
        "질문 시점과 정답 시점이 일치하는가",
        "정답 날씨가 대본에 명확히 제시되었는가",
        "선택지가 모두 날씨 범주인가",
        "날씨 아이콘으로 표현 가능한가",
        "오답이 다른 시점의 날씨와 자연스럽게 연결되는가"
      ]
    }
  ]
}

order_index는 반드시 3.
instruction에 지역명(한국어)과 질문 시점(현재/오늘 오후/내일 등)을 명확히 넣는다.
choices는 한국어 날씨 표현으로 통일 권장 (맑음, 흐림, 비, 눈, 바람, 안개 등).
weather_answer와 correct_answer가 가리키는 날씨가 일치해야 한다.
`.trim();

const TYPE3_GENERATION_RULES = `
==================================================
3번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 날씨 파악
지시문 예: 다음을 듣고, ○○의 오늘 오후/현재/내일 날씨로 가장 적절한 것을 고르시오.

문항 목적: 짧은 날씨 안내를 듣고 질문에서 묻는 특정 시점의 날씨를 고른다.

형식:
- 한 명(W 또는 M) 날씨 안내 담화.
- 지역명 포함 (Busan, Jeju, Daejeon, Gangneung, Green City 등 — instruction에는 한국어 지명).
- 여러 시점 날씨 언급 → 질문 시점만 정답.
- needs_image_choices: true, visual_choice_type: "weather_icon"
- choice_image_prompts 5개 — 단순 날씨 아이콘 설명.

대본 (언어 — 매우 중요):
- segments[].text: 반드시 영어 (듣기·TTS용). 한국어 금지.
- script_translation: 반드시 한국어 해석 (남:/여:/안내: 화자 표기).
- script_text: segments와 동일한 영어 대본 (M:/W:/ANN: 형식).
- segments와 script_translation을 바꿔 넣지 말 것.

내용:
- 날씨 뉴스 형식, 5~7문장, 중1 수준.
- 흐름: 안내 시작 → 다른 시점 언급 → 질문 시점 날씨 명확 제시 → 생활 안내 → 또 다른 시점 → 마무리.
- humidity, precipitation 등 어려운 기상 용어 금지.

질문 시점 예: 현재, 오늘 오후, 내일 아침, 내일
- 질문이 오늘 오후면 오늘 오후 날씨가 정답.
- 다른 시점 날씨는 오답 선택지로 활용 가능.

선택지:
- 5개, 모두 날씨 범주 (맑음·흐림·비·눈·바람·안개 등).
- 맑음/화창함 중복 금지.
- 우산·버스 등 비날씨 항목 금지.

weather_target_location, weather_target_time, weather_answer 필수.
mentioned_weather_by_time: 대본 시점별 날씨 배열.

question_text는 비워 둔다.
`.trim();

const TYPE3_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (3번 전용):
1. 지시문·지역명·질문 시점 명확
2. 대본에 정답 시점 날씨 명확
3. answer_clue가 질문 시점 날씨 문장
4. 선택지 5개 날씨 범주, 중복 의미 없음
5. choice_image_prompts 5개, 아이콘 구분 가능
6. weather_answer와 correct_answer 일치
7. segments는 영어, script_translation은 한국어인지 확인
`.trim();

export function buildType3OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE3_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE3_VALIDATION_CRITERIA}

${TYPE3_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType3PromptBlockForExam(): string {
  return `
### 3번 유형: 날씨 파악
${TYPE3_GENERATION_RULES}

필수: needs_image_choices=true, visual_choice_type="weather_icon", choice_image_prompts[5], weather_* 필드, question_text=""
`.trim();
}
