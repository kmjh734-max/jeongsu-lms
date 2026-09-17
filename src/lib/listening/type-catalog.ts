/**
 * 듣기 유형 카탈로그 — 유형을 "번호"가 아니라 "의미"로 정의한다.
 *
 * 예전에는 유형 id = 학년별 문항 번호라서 같은 숫자가 학년마다 다른 뜻이었고(중등 1=묘사, 고등 1=목적),
 * 중2·중3은 중1 배치의 복사본이었다. 2023~2026 시·도교육청 공식 문제지 24회로 확인한 결과
 * 중1·중2·중3의 번호 배치가 서로 달라(중3은 20자리 중 19자리가 달랐다) 번호 = 유형 구조로는 맞출 수 없었다.
 *
 * - 유형 정의(지시문 틀·변형·선택지 형식·대본 형식·정답 규칙)는 여기 한 곳.
 * - 학년별 번호 배치는 grade-blueprints.ts.
 * - 예전 문항(question_type 문자열)은 legacy-type-map.ts가 이 키로 옮긴다.
 * - engine: 이미 만들어 둔 유형 모듈(fix-typeN, typeN 프롬프트·선택지 검사)의 옛 번호.
 *   중등 모듈은 중1 배치 번호(1~20), 고등 모듈은 고1 배치 번호(1~17)다. 새 유형은 engine이 없다.
 *
 * 지시문 틀은 모든 한국 듣기평가가 공통으로 쓰는 표준 문구이고, 대본·선택지는 한 줄도 옮기지 않았다.
 */
import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";

export type ListeningTypeKey =
  // 중등
  | "M_RIDDLE"
  | "M_PICTURE_SELECT"
  | "M_WEATHER"
  | "M_INTENT"
  | "M_NOT_MENTIONED_MONO"
  | "M_NOT_MENTIONED_DIALOGUE"
  | "M_TIME"
  | "M_DREAM_JOB"
  | "M_EMOTION"
  | "M_TODO_NOW"
  | "M_TOPIC_DIALOGUE"
  | "M_TOPIC_MONO"
  | "M_TRANSPORT"
  | "M_REASON"
  | "M_PLACE"
  | "M_TABLE_MISMATCH"
  | "M_REQUEST"
  | "M_SUGGEST"
  | "M_PLAN_AT_TIME"
  | "M_JOB"
  | "M_RESPONSE"
  | "M_DID"
  | "M_SPECIFIC"
  | "M_MISMATCH_DIALOGUE"
  | "M_PURPOSE_CALL"
  | "M_AMOUNT"
  | "M_RELATION"
  | "M_PICTURE_SITUATION"
  | "M_FLYER_BLANKS"
  | "M_EXPRESSION_MEANING"
  | "M_DESCRIBE"
  | "M_AWKWARD_DIALOGUE"
  | "M_TABLE_SELECT"
  | "M_DATE"
  | "M_PURPOSE_ANNOUNCE"
  | "M_SITUATION_SAY"
  // 고등 (고1~수능 17문항)
  | "H_PURPOSE"
  | "H_OPINION"
  | "H_GIST"
  | "H_PICTURE_MISMATCH"
  | "H_TODO"
  | "H_AMOUNT"
  | "H_REASON"
  | "H_NOT_MENTIONED"
  | "H_MISMATCH"
  | "H_TABLE"
  | "H_RESP_SHORT"
  | "H_RESP_LONG"
  | "H_SITUATION"
  | "H_SET_TOPIC"
  | "H_SET_MENTION";

/** 대본 형식 */
export type ListeningScriptForm =
  | "dialogue"
  /** 한 사람 담화(안내·설명·예보·상황 나레이션) */
  | "monologue"
  /** 짧은 대화 5개(각 2턴) — 그림 상황·어색한 대화. 번호 안내(ANN "Number one.")로 나눈다 */
  | "mini_dialogues"
  /** 고등 16·17 공유 담화 */
  | "set_monologue";

/** 선택지 형식 */
export type ListeningChoiceFormat =
  | "ko"
  | "en"
  /** 선택지마다 그림 1장 (5장) */
  | "picture"
  /** 시각·금액 (오름차순) */
  | "number"
  /** 날짜·요일 (이른 순) */
  | "date"
  /** 표 5행 — 선택지는 행 */
  | "table"
  /** 인쇄 양식(전단·티켓)의 빈칸 (A)(B) 짝 */
  | "flyer"
  /** 그림 한 장 속 ①~⑤ 라벨 */
  | "figure_labels"
  /** 소리로만 듣는 ①~⑤ (짧은 대화 5개) — 그림 상황형은 장면 그림 1장이 붙는다 */
  | "spoken_labels";

/** 응답 방향: wm = 여자의 마지막 말 → 남자의 응답, mw = 반대 */
export type ResponseDirection = "wm" | "mw";

export interface ListeningTypeVariant {
  id: string;
  /** 편집기·보고서용 짧은 이름 */
  label: string;
  /** 이 변형의 지시문 틀 (없으면 기본 지시문) */
  instruction?: string;
  /** 생성 프롬프트에 덧붙일 안내 */
  note?: string;
  /** 학년별 비율 (0이면 그 학년에서 쓰지 않음). 없으면 weight */
  weightByGrade?: Partial<Record<ListeningGradeLevel, number>>;
  weight?: number;
}

export interface ListeningTypeDef {
  key: ListeningTypeKey;
  family: "middle" | "high";
  /** DB question_type에 저장되는 한글 이름 — 유형마다 달라야 역추정이 정확하다 */
  label: string;
  /** 기본 지시문 틀 (○○는 생성 때 채움) */
  instruction: string;
  variants?: ListeningTypeVariant[];
  scriptForm: ListeningScriptForm;
  choiceFormat: ListeningChoiceFormat;
  /** 선택지 순서가 대본 순서·표 행·그림 라벨·음성 번호로 정해져 섞으면 안 된다 (정답 자리를 미리 배정) */
  orderBound?: boolean;
  /** 옛 유형 모듈 번호 (family 기준). 응답 유형은 방향으로 정한다(engineForDirection) */
  engine?: number;
  /** 문항당 생성 그림 수 (원가 계산용) */
  imagesPerQuestion?: number;
  format_guide: string;
  segment_guide: string;
  choice_guide: string;
  /** 생성 프롬프트의 유형별 출제 요령 (정답 근거·오답 설계) */
  craft: string;
  /** 기본 난이도 구간 (배치표가 번호대로 덮어쓸 수 있음) */
  tier: ListeningDifficultyTier;
}

const DEFS: ListeningTypeDef[] = [
  // ───────────────────────── 중등: 기존 모듈을 쓰는 유형 ─────────────────────────
  {
    key: "M_RIDDLE",
    family: "middle",
    label: "묘사 듣고 대상 고르기",
    instruction: "다음을 듣고, ‘I’가 무엇인지 가장 적절한 것을 고르시오.",
    variants: [
      { id: "i", label: "‘I’", weight: 5 },
      {
        id: "this",
        label: "‘this’",
        weight: 4,
        instruction: "다음을 듣고, ‘this’가 가리키는 것으로 가장 적절한 것을 고르시오.",
        note: "화자가 대상을 1인칭 I가 아니라 this로 설명한다(\"This is something you …\"). 마지막 문장은 \"What is this?\". 'I' 수수께끼 규칙(What am I?)은 이 문항에 쓰지 않는다.",
      },
      {
        // 공식 1/8회. 1번 소재 풀(단수 동물·물건)과 맞지 않아 생성에서는 쓰지 않고, 저장된 문항 인식에만 쓴다
        id: "these",
        label: "‘these’",
        weight: 0,
        instruction: "다음을 듣고, ‘these’가 가리키는 것으로 가장 적절한 것을 고르시오.",
        note: "짝이나 여러 개로 쓰는 물건(장갑·젓가락·스키 등)을 these로 설명한다(\"These are things you …\"). 마지막 문장은 \"What are these?\". What am I? 규칙은 쓰지 않는다.",
      },
    ],
    scriptForm: "monologue",
    choiceFormat: "picture",
    engine: 1,
    imagesPerQuestion: 5,
    format_guide:
      "One speaker describes an object/animal with clues from general to specific. Picture choices: needs_image_choices true, choice_image_prompts[5] (same category).",
    segment_guide: "Monologue only (M or W). No dialogue.",
    choice_guide: "5 English nouns in the same category, each with a picture prompt. One matches all clues.",
    craft: "묘사: 단서 3~4개를 일반→구체 순으로, 결정적 단서는 뒤에. 오답은 같은 범주에서 앞 단서 일부와 맞는 것. 대상 이름을 말하지 않는다.",
    tier: "foundation",
  },
  {
    key: "M_PICTURE_SELECT",
    family: "middle",
    label: "구입/주문 정보 파악",
    instruction: "대화를 듣고, ○○가 구입할 ○○로 가장 적절한 것을 고르시오.",
    variants: [
      { id: "buy", label: "구입할", weight: 6 },
      {
        id: "order",
        label: "주문할",
        weight: 2,
        instruction: "대화를 듣고, ○○가 주문할 ○○로 가장 적절한 것을 고르시오.",
      },
      {
        id: "made",
        label: "만든",
        weight: 2,
        instruction: "대화를 듣고, 두 사람이 만든 ○○로 가장 적절한 것을 고르시오.",
        note: "가게가 아니라 두 사람이 함께 디자인·제작하는 물건(스티커·포스터·케이크 장식 등)으로 만든다. 조건을 하나씩 정하고 한 번 바꾼다.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "picture",
    engine: 2,
    imagesPerQuestion: 5,
    format_guide:
      "Purchase/design dialogue. Visual conditions (pattern, shape, text, position) are settled one by one with one change of mind. Image choices required (needs_image_choices, choice_image_prompts[5]).",
    segment_guide: "M/W dialogue.",
    choice_guide: "5 English choices of the same product; each picture differs by one or two attributes.",
    craft: "그림 선택: 속성 2~3개를 하나씩 확정하고 한 번 번복한다. \"필요 없다\" 같은 부정 응답 함정 하나. 마지막 말이 정답 선택지 전체를 되풀이하지 않는다(\"I'll take that one.\" 정도).",
    tier: "foundation",
  },
  {
    key: "M_WEATHER",
    family: "middle",
    label: "날씨 파악",
    instruction: "다음을 듣고, ○○의 ○○ 날씨로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "picture",
    engine: 3,
    imagesPerQuestion: 5,
    format_guide:
      "Weather report monologue covering 3~4 time points. weather_target_* fields. Weather icon choices.",
    segment_guide: "Monologue only (W or M).",
    choice_guide: "5 Korean weather words; correct = the asked time/place.",
    craft: "날씨: 정답 외 날씨 2~3개가 다른 시점·지역으로 대본에 나온다. 묻는 시점 앞뒤 날씨가 오답.",
    tier: "foundation",
  },
  {
    key: "M_INTENT",
    family: "middle",
    label: "마지막 말의 의도 파악",
    instruction: "대화를 듣고, ○○가 한 마지막 말의 의도로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 4,
    format_guide: "Dialogue; last_speaker/target_intention/final_utterance. Final line carries the intent.",
    segment_guide: "M/W dialogue. Last line = intent clue; instruction ○○ = last speaker.",
    choice_guide: "5 Korean intention nouns (감사, 거절, 칭찬, 사과, 격려 …).",
    craft: "의도: 마지막 말은 의도어(칭찬·사과 등)를 직접 말하지 않는다. 마지막 말은 대화 상대에게 하는 말이어야 한다(자리에 없는 사람에게 하는 말 금지).",
    tier: "foundation",
  },
  {
    key: "M_NOT_MENTIONED_MONO",
    family: "middle",
    label: "언급하지 않은 것",
    instruction: "다음을 듣고, ○○가 ○○에 대해 언급하지 않은 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    orderBound: true,
    engine: 5,
    format_guide: "Monologue; mention_plan with 4 mentioned + 1 unmentioned. Korean label choices in mention order.",
    segment_guide: "Monologue (M or W).",
    choice_guide: "5 Korean information labels in script order. correct_answer = unmentioned item.",
    craft: "언급하지 않은 것(담화): 네 항목을 대본 순서대로 분명히 말하고, 선택지도 그 순서. 빠진 항목은 같은 범주의 그럴듯한 항목(비용·준비물·연락처 등).",
    tier: "foundation",
  },
  {
    key: "M_TIME",
    family: "middle",
    label: "시각 파악",
    instruction: "대화를 듣고, 두 사람이 만날 시각을 고르시오.",
    variants: [
      { id: "meet", label: "만날 시각", weightByGrade: { middle1: 5, middle2: 6, middle3: 4 } },
      {
        id: "current",
        label: "현재 시각",
        weightByGrade: { middle1: 2, middle2: 1, middle3: 0 },
        instruction: "대화를 듣고, 현재 시각을 고르시오.",
        note: "지금 몇 시인지를 묻는다. 두 사람이 시계·일정으로 현재 시각을 확인하거나 계산한다(\"The movie starts at 5, and that's in 20 minutes.\" → 4:40).",
      },
      {
        id: "start",
        label: "시작하는 시각",
        weightByGrade: { middle1: 2, middle2: 1, middle3: 1 },
        instruction: "대화를 듣고, ○○가 시작하는 시각을 고르시오.",
      },
      {
        id: "reserve",
        label: "예약한 시각",
        weightByGrade: { middle1: 0, middle2: 1, middle3: 3 },
        instruction: "대화를 듣고, ○○가 ○○를 예약한 시각을 고르시오.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "number",
    engine: 6,
    format_guide: "M/W dialogue; 2+ candidate times; final_time matches the instruction target. time_question_target, mentioned_times.",
    segment_guide: "M/W dialogue. Final time settled in the last 1~2 turns.",
    choice_guide: "5 English times (e.g. 4:30 p.m.) in ascending order.",
    craft: "시각: 후보 시각 2~3개가 제안·거절되고 마지막에 확정. 오름차순 선택지에서 정답은 ②~④ 자리.",
    tier: "foundation",
  },
  {
    key: "M_DREAM_JOB",
    family: "middle",
    label: "장래 희망 파악",
    instruction: "대화를 듣고, ○○의 장래 희망으로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 7,
    format_guide: "Interest → dream job; target_person, dream_job, interest_clues.",
    segment_guide: "M/W dialogue. Dream job in later turns.",
    choice_guide: "5 Korean job names.",
    craft: "장래 희망: 다른 직업(부모님 권유·예전 꿈·친구의 꿈) 1~2개를 대본에 넣어 오답으로 쓰고, 정답 직업은 하는 일로 설명하거나 한 번만 말한다.",
    tier: "standard",
  },
  {
    key: "M_EMOTION",
    family: "middle",
    label: "심정 파악",
    instruction: "대화를 듣고, ○○의 심정으로 가장 적절한 것을 고르시오.",
    variants: [
      {
        id: "ko",
        label: "한국어 감정어",
        weightByGrade: { middle1: 3, middle2: 1, middle3: 0 },
        note: "선택지는 한국어 감정 명사 5개(실망·안도·걱정·설렘·자랑스러움 …).",
      },
      {
        id: "en",
        label: "영어 형용사",
        weightByGrade: { middle1: 1, middle2: 3, middle3: 1 },
        note: "선택지는 영어 감정 형용사 5개(소문자: relieved, nervous, proud, disappointed …). 유형 규칙의 한국어 감정 명사 대신 이 형식을 쓴다.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 8,
    format_guide: "Target person's emotion; target_person, target_emotion, emotion_clues.",
    segment_guide: "M/W dialogue. Clues in the target speaker's lines.",
    choice_guide: "5 emotion choices (Korean nouns or English adjectives by variant).",
    craft: "심정: 상황·반응으로 드러내고, 오답 1~2개는 상황상 그럴듯한 감정(처음 걱정했다가 안도 등). 중2부터는 대상 화자가 감정 단어를 직접 말하지 않는다. 선택지 다섯 개의 감정어(정답·오답 모두)는 대본에 어떤 형태로도 넣지 않는다 — \"What a relief!\"는 relieved를, \"I'm so proud\"는 proud를 그대로 말한 것이라 그 선택지가 답으로 읽힌다. 대신 몸·행동·다음 계획으로 보여 준다(예: 긴장이 풀려 몸이 늘어지는 말, 무언가를 거듭 확인하는 행동, 다음에 할 일을 서두르는 말). 이런 방법만 따르고 문장은 그 대화에 맞게 새로 쓴다 — 설명에 나온 표현을 그대로 옮기지 않는다(같은 문장이 여러 회차에 되풀이되었다).",
    tier: "standard",
  },
  {
    key: "M_TODO_NOW",
    family: "middle",
    label: "대화 직후 할 일 파악",
    instruction: "대화를 듣고, ○○가 대화 직후에 할 일로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 9,
    format_guide: "Immediate next action; target_person, immediate_action, mentioned_actions.",
    segment_guide: "M/W dialogue. Last 1~2 turns settle the immediate action.",
    choice_guide: "5 Korean action phrases (~하기).",
    craft: "직후 할 일: 오답은 이미 한 일·상대가 할 일·나중에 할 일. 정답 동작은 선택지 직역과 다른 표현으로.",
    tier: "standard",
  },
  {
    key: "M_TOPIC_DIALOGUE",
    family: "middle",
    label: "대화의 핵심 내용 파악",
    instruction: "대화를 듣고, 무엇에 관한 내용인지 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 10,
    format_guide: "Core content noun phrase; main_content, content_clues, topic_distractor_reasons.",
    segment_guide: "M/W dialogue. One consistent core topic throughout.",
    choice_guide: "5 Korean content noun phrases.",
    craft: "핵심 내용: 한 주제를 여러 턴에 걸쳐 다루고, 오답은 대본에 스쳐 간 소재.",
    tier: "standard",
  },
  {
    key: "M_TRANSPORT",
    family: "middle",
    label: "이동 방법 파악",
    instruction: "대화를 듣고, 두 사람이 함께 이동할 방법으로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 11,
    format_guide: "Multiple transport candidates; final_transport, destination, mentioned_transport_options.",
    segment_guide: "M/W dialogue. Destination clear; final decision at the end.",
    choice_guide: "5 Korean transports.",
    craft: "이동 방법: 다른 교통수단 2~3개를 이유와 함께 배제한 뒤 결정. 처음 나온 수단은 대체로 오답.",
    tier: "standard",
  },
  {
    key: "M_REASON",
    family: "middle",
    label: "이유 파악",
    instruction: "대화를 듣고, ○○가 ○○하는 이유로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 12,
    format_guide: "Reason; target_person, target_place (if going somewhere), reason_for_going, mentioned_possible_reasons.",
    segment_guide: "M/W dialogue. Partner guesses once, then the real reason.",
    choice_guide: "5 Korean reason phrases (~하기 위해서 / ~해서).",
    craft: "이유: 상대가 이유를 추측→부정→진짜 이유. 추측된 이유를 오답으로.",
    tier: "standard",
  },
  {
    key: "M_PLACE",
    family: "middle",
    label: "대화 장소 파악",
    instruction: "대화를 듣고, 두 사람이 대화하는 장소로 가장 적절한 곳을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 13,
    format_guide: "Infer place from clues; target_place, place_clues, distractor_places. Do NOT name the place.",
    segment_guide: "M/W dialogue. At least 2 place clues.",
    choice_guide: "5 Korean place names.",
    craft: "장소: 장소명을 말하지 않고 단서 2개 이상으로 추론. 대본에 언급된 다른 장소를 오답으로.",
    tier: "standard",
  },
  {
    key: "M_TABLE_MISMATCH",
    family: "middle",
    label: "표 정보 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 표에서 일치하지 않는 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "table",
    orderBound: true,
    engine: 14,
    format_guide: "Announcement monologue + printed table (5 rows: Korean item + English/number value), exactly 1 row mismatches. table_data, source_facts_from_script.",
    segment_guide: "Single speaker (M or W) announcement.",
    choice_guide: "5 Korean labels matching table_data.rows order. correct_answer = mismatch_no.",
    craft: "표 불일치: 표 5행은 대본 언급 순서. 불일치 행은 숫자·요일·장소 등 한 값만 다르다.",
    tier: "applied",
  },
  {
    key: "M_REQUEST",
    family: "middle",
    label: "부탁한 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 15,
    format_guide: "Request (Can/Could/Would you). requester, requested_person, requested_action, request_expression.",
    segment_guide: "M/W dialogue. Request in the latter half.",
    choice_guide: "5 Korean action phrases (~하기).",
    craft: "부탁: 앞에서 거절·보류된 다른 부탁이나 이미 끝난 일을 오답으로. 부탁 표현은 선택지 직역과 다르게.",
    tier: "applied",
  },
  {
    key: "M_SUGGEST",
    family: "middle",
    label: "제안한 것 파악",
    instruction: "대화를 듣고, ○○가 ○○에게 제안한 것으로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 16,
    format_guide: "Suggestion (Why don't / How about / Let's). suggester, suggested_to, suggested_action, suggestion_expression.",
    segment_guide: "M/W dialogue. Problem first, suggestion in the latter half.",
    choice_guide: "5 Korean action phrases (~하기).",
    craft: "제안: 상대가 제안을 받기 전 고민·다른 선택지를 말하게 하고, 제안하는 사람이 스스로 할 일은 오답으로.",
    tier: "applied",
  },
  {
    key: "M_PLAN_AT_TIME",
    family: "middle",
    label: "특정 시점에 할 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에 할 일로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 17,
    format_guide: "Plan at a set future time (tomorrow / this weekend / after the call). target_person, target_time, planned_action, mentioned_other_actions.",
    segment_guide: "M/W dialogue. Multiple activities; final plan for target_time clear.",
    choice_guide: "5 Korean activity phrases (~하기).",
    craft: "특정 시점 할 일(미래): 원래 계획·취소된 일·다른 날 할 일을 오답으로. 지시문의 시점과 대본의 시점이 같아야 한다.",
    tier: "applied",
  },
  {
    key: "M_JOB",
    family: "middle",
    label: "직업 파악",
    instruction: "대화를 듣고, ○○의 직업으로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 18,
    format_guide: "Job NOT named. target_person, target_job, job_clues (2+), distractor_jobs.",
    segment_guide: "M/W dialogue. Work clues from actions/tools/settings.",
    choice_guide: "5 Korean job names.",
    craft: "직업: 직업명을 말하지 않는다. 대본에 나온 다른 사람·동물·물건과 관련된 직업을 오답으로.",
    tier: "applied",
  },
  {
    key: "M_RESPONSE",
    family: "middle",
    label: "응답 고르기",
    instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
    variants: [
      {
        id: "wm",
        label: "여→남",
        weight: 1,
        instruction: "대화를 듣고, 여자의 마지막 말에 이어질 남자의 말로 가장 적절한 것을 고르시오.",
      },
      {
        id: "mw",
        label: "남→여",
        weight: 1,
        instruction: "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "en",
    format_guide: "Dialogue ending BEFORE the responder's reply. question_text \"Man: ______\" or \"Woman: ______\". Reply NOT in segments.",
    segment_guide: "M/W dialogue; the last segment is the prompt speaker; previous_turn = that line.",
    choice_guide: "5 English reply sentences. No bare Okay/Yes/Sure. correct_response_function required.",
    craft: "응답: 마지막 말이 Yes/No 부탁이고 정답이 \"Sure, I'll …\" 되풀이인 구조 금지. 정답은 마지막 말 단어를 되풀이하지 않고, 오답 1~2개는 대본 단어를 빌린 함정, 나머지는 기능이 어긋난 응답.",
    tier: "advanced",
  },

  // ───────────────────────── 중등: 새 유형 ─────────────────────────
  {
    key: "M_NOT_MENTIONED_DIALOGUE",
    family: "middle",
    label: "언급하지 않은 것(대화)",
    instruction: "대화를 듣고, ○○에 관해 언급되지 않은 것을 고르시오.",
    variants: [
      { id: "about", label: "~에 관해 언급되지 않은", weightByGrade: { middle2: 0, middle3: 1 } },
      {
        id: "two",
        label: "두 사람이 언급하지 않은",
        weightByGrade: { middle2: 1, middle3: 0 },
        instruction: "대화를 듣고, 두 사람이 ○○에 대해 언급하지 않은 것을 고르시오.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "ko",
    orderBound: true,
    format_guide:
      "M/W dialogue about one event/place/program (English name in the instruction ○○). mention_plan: 4 items mentioned in order through questions and answers + 1 never mentioned.",
    segment_guide: "M/W dialogue; the four facts come out through natural questions and answers.",
    choice_guide: "5 Korean information labels in the order they are mentioned. correct_answer = the unmentioned label.",
    craft: "언급하지 않은 것(대화): 네 항목은 한 사람이 묻고 다른 사람이 답하며 자연스럽게 나온다. 선택지 순서 = 대본 언급 순서. 빠진 항목은 같은 범주의 그럴듯한 항목이고 대본에서 전혀 말하지 않는다.",
    tier: "standard",
  },
  {
    key: "M_TOPIC_MONO",
    family: "middle",
    label: "담화의 내용 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 내용으로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    format_guide: "One speaker (teacher, announcer, club leader, guide) talks about one topic. main_content, content_clues.",
    segment_guide: "Monologue (M or W) with a greeting, the main message, and one or two details.",
    choice_guide: "5 Korean noun phrases (…안내 / …방법 / …변경 등).",
    craft: "하는 말의 내용: 인사→핵심 안내→세부 1~2개. 정답은 전체를 포괄하는 명사구, 오답은 담화에 스쳐 간 소재나 같은 소재의 다른 안내.",
    tier: "standard",
  },
  {
    key: "M_DID",
    family: "middle",
    label: "한 일 파악",
    instruction: "대화를 듣고, ○○가 ○○에 한 일로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    format_guide:
      "Dialogue about a past time (yesterday / last weekend / this morning). target_person, target_time, completed_action, mentioned_other_actions.",
    segment_guide: "M/W dialogue in past tense about what happened; partner's experience also mentioned.",
    choice_guide: "5 Korean action phrases (~하기).",
    craft: "한 일(과거): 대상 화자가 실제로 한 일이 정답. 오답은 상대가 한 일·하려다 못 한 일(날씨·일정 때문에 취소)·앞으로 할 일. 정답 표현은 대본 직역과 다르게.",
    tier: "foundation",
  },
  {
    key: "M_SPECIFIC",
    family: "middle",
    label: "특정 정보 파악",
    instruction: "대화를 듣고, ○○가 가져올 물건으로 가장 적절한 것을 고르시오.",
    variants: [
      { id: "bring", label: "가져올 물건", weight: 3 },
      {
        id: "buy",
        label: "구입할 물품",
        weight: 3,
        instruction: "대화를 듣고, ○○가 구입할 물품으로 가장 적절한 것을 고르시오.",
      },
      {
        id: "choose",
        label: "선택할 것",
        weight: 2,
        instruction: "대화를 듣고, ○○가 선택할 ○○로 가장 적절한 것을 고르시오.",
        note: "고를 대상(수업·체험 프로그램·메뉴 등)을 지시문 ○○에 한국어로 넣는다.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "ko",
    format_guide: "Dialogue that settles one specific thing (item to bring/buy, class to choose). target_person, specific_answer.",
    segment_guide: "M/W dialogue; 3~4 candidates discussed, one settled.",
    choice_guide: "5 Korean nouns / short noun phrases of the same category.",
    craft: "특정 정보: 후보 3~4개가 대본에 나오고 이유와 함께 하나만 남는다. 이미 가진 것·상대가 가져올 것·필요 없다고 한 것이 오답.",
    tier: "standard",
  },
  {
    key: "M_MISMATCH_DIALOGUE",
    family: "middle",
    label: "내용 불일치(대화)",
    instruction: "대화를 듣고, ○○에 대한 내용과 일치하지 않는 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    orderBound: true,
    format_guide:
      "M/W dialogue about one event/trip/program (Korean noun in the instruction ○○). Five facts in script order; the key changes exactly one element (number, day, place, target).",
    segment_guide: "M/W dialogue; one asks, the other explains the facts.",
    choice_guide: "5 Korean statements in script order; exactly one contradicts the script.",
    craft: "내용 불일치(대화): 선택지 5개는 대본 순서대로 쓴 한국어 서술문. 정답은 수·요일·장소·대상 등 한 요소만 바꾼 문장이고, 나머지 넷은 대본과 정확히 맞는다.",
    tier: "standard",
  },
  {
    key: "M_PURPOSE_CALL",
    family: "middle",
    label: "목적 파악(전화·방문)",
    instruction: "대화를 듣고, ○○가 ○○에게 전화한 목적으로 가장 적절한 것을 고르시오.",
    variants: [
      { id: "call", label: "전화한 목적", weightByGrade: { middle2: 5, middle3: 7 } },
      {
        id: "outing",
        label: "외출하는 목적",
        weightByGrade: { middle2: 2, middle3: 0 },
        instruction: "대화를 듣고, ○○가 ○○를 만나러 가는 목적으로 가장 적절한 것을 고르시오.",
        note: "전화가 아니라 집·학교에서 나가는 사람과의 대화. 어디에 누구를 만나러 가는지와 그 목적이 대화로 드러난다.",
      },
      {
        id: "visit",
        label: "찾아간 목적",
        weightByGrade: { middle2: 1, middle3: 1 },
        instruction: "대화를 듣고, ○○가 ○○에게 찾아간 목적으로 가장 적절한 것을 고르시오.",
        note: "교무실·상담실·가게 등에 직접 찾아간 대화. 인사 뒤에 용건을 말한다.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "ko",
    format_guide: "Phone call (or visit) dialogue: greeting and small talk, then the real purpose. target_person, purpose.",
    segment_guide: "M/W dialogue. For a call, open with a phone greeting (\"Hello, this is …\").",
    choice_guide: "5 Korean purpose phrases (~하려고 / ~하기 위해서).",
    craft: "목적: 인사·잡담 뒤에 용건. 용건과 관련된 다른 행동(예약 변경 vs 예약 취소, 물건 확인 vs 물건 구입)과 잡담 소재가 오답. 정답은 용건을 다른 말로 요약한다.",
    tier: "standard",
  },
  {
    key: "M_AMOUNT",
    family: "middle",
    label: "금액 파악",
    instruction: "대화를 듣고, ○○가 지불할 금액을 고르시오.",
    variants: [
      {
        id: "change",
        label: "받을 거스름돈",
        weightByGrade: { middle2: 7, middle3: 0 },
        instruction: "대화를 듣고, ○○가 받을 거스름돈으로 가장 적절한 것을 고르시오.",
        note: "손님이 낸 돈(지폐 금액)을 대본에서 말하고, 거스름돈 = 낸 돈 − 지불액. price_calculation에 \"paid_amount\"(낸 돈)를 넣는다. 지불액과 거스름돈은 대본에서 말하지 않는다.",
      },
      { id: "pay", label: "지불할 금액", weightByGrade: { middle2: 3, middle3: 1 } },
    ],
    scriptForm: "dialogue",
    choiceFormat: "number",
    format_guide:
      "Shop/ticket dialogue with unit prices, quantities and one adjustment (coupon, discount, extra item, changed quantity). price_calculation required.",
    segment_guide: "M/W dialogue; all numbers spoken clearly; the final amount is never spoken.",
    choice_guide: "5 dollar amounts in ascending order; the key sits at ②~④.",
    craft: "금액(중등): 단가×수량에 조정 한 단계(할인·쿠폰·한 개 더·수량 정정). 최종 금액(거스름돈 문항은 지불액과 거스름돈 모두)은 대본에서 말하지 않는다. 오답은 조정 누락·수량 착오 값. 정답은 오름차순 선택지 ②~④.",
    tier: "applied",
  },
  {
    key: "M_RELATION",
    family: "middle",
    label: "관계 파악",
    instruction: "대화를 듣고, 두 사람의 관계로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    format_guide: "Dialogue where the roles are inferred from place/work clues; titles are never spoken. relation_clues.",
    segment_guide: "M/W dialogue with 2+ role clues (tools, services, requests).",
    choice_guide: "5 Korean relation pairs written as \"A – B\" (e.g. 손님 – 사진사).",
    craft: "관계: 직함·관계명(teacher, doctor, customer 등)을 말하지 않고 업무·요청 단서 2개 이상으로 추론. 같은 장소의 다른 관계(손님–점원 vs 손님–요리사)를 오답으로.",
    tier: "applied",
  },
  {
    key: "M_PICTURE_SITUATION",
    family: "middle",
    label: "그림 상황에 맞는 대화",
    instruction: "다음 그림의 상황에 가장 적절한 대화를 고르시오.",
    scriptForm: "mini_dialogues",
    choiceFormat: "spoken_labels",
    orderBound: true,
    imagesPerQuestion: 1,
    format_guide:
      "One picture of a situation + five short exchanges (①~⑤, 2 turns each) in the same kind of place. Only one exchange matches what the people in the picture are doing. choice_image_prompts[1] = the scene.",
    segment_guide:
      "Segments: ANN \"Number one.\" then W/M line then M/W line, repeated for 1~5. Nothing else.",
    choice_guide: "choices = [\"①\",\"②\",\"③\",\"④\",\"⑤\"]; correct_answer = the exchange that matches the picture.",
    craft: "그림 상황: 다섯 대화 모두 그림과 같은 장소 소재를 쓰고, 그림 속 행동·상황과 맞는 것은 하나뿐. 오답 대화도 그 자체로는 자연스럽다(어색한 대화 유형과 다름). 그림에는 글자·숫자를 넣지 않는다.",
    tier: "foundation",
  },
  {
    key: "M_FLYER_BLANKS",
    family: "middle",
    label: "양식 빈칸 정보",
    instruction: "대화를 듣고, ○○의 빈칸 (A), (B)에 들어갈 정보로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "flyer",
    orderBound: true,
    format_guide:
      "Printed flyer/ticket (table_data kind \"flyer\": title + 4~6 rows of English label/value, two values are \"(A)\" and \"(B)\"). The dialogue gives the missing values, with one candidate changed once.",
    segment_guide: "M/W dialogue looking at the flyer/ticket and confirming details.",
    choice_guide: "5 choices each \"(A) value – (B) value\" (English/number). Distractors mix a first-mentioned or changed value.",
    craft: "양식 빈칸: 인쇄된 양식에 빈칸 두 곳 (A)(B). 두 사람이 양식을 보며 빈칸 정보를 말하고, 그중 한 값은 처음 말한 뒤 바뀐다. 오답 짝은 바뀌기 전 값·다른 줄의 값을 섞는다. 양식의 다른 줄 정보는 대본과 맞아야 한다.",
    tier: "applied",
  },
  {
    key: "M_EXPRESSION_MEANING",
    family: "middle",
    label: "표현의 의미 파악",
    instruction: "대화를 듣고, ○○의 “○○”가 의미하는 바로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    format_guide:
      "Dialogue where one speaker uses a common English expression (idiom or short saying). The instruction quotes it exactly as spoken. expression, target_person.",
    segment_guide: "M/W dialogue; the expression appears once, in the target speaker's line, with context before it.",
    choice_guide: "5 Korean spoken-style sentences (예: 네가 정말 큰 도움이 됐어.). Distractors: literal meaning, opposite attitude, meaning of another line.",
    craft: "표현의 의미: 지시문에 대본 속 영어 표현을 그대로 인용한다(철자·문장부호 같게). 정답은 맥락 속 의미를 한국어 구어 문장으로, 오답은 글자 그대로의 뜻·반대 태도·다른 대사의 의미.",
    tier: "applied",
  },
  {
    key: "M_DESCRIBE",
    family: "middle",
    label: "설명 대상 파악",
    instruction: "다음을 듣고, 무엇에 관한 설명인지 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    format_guide: "Third-person explanation of one object/tool/animal/place/event: definition → use → features. The name is never spoken.",
    segment_guide: "Monologue (M or W). Starts with \"This is …\" or \"People use this …\"; never says the name.",
    choice_guide: "5 Korean nouns of the same category.",
    craft: "설명 대상: 정의→용도→특징 순서로 3인칭 설명. 대상 이름은 끝까지 말하지 않는다. 오답은 같은 범주에서 일부 설명과 맞는 것.",
    tier: "standard",
  },
  {
    key: "M_AWKWARD_DIALOGUE",
    family: "middle",
    label: "어색한 대화 고르기",
    instruction: "다음을 듣고, 두 사람의 대화가 어색한 것을 고르시오.",
    scriptForm: "mini_dialogues",
    choiceFormat: "spoken_labels",
    orderBound: true,
    format_guide:
      "Five unrelated short exchanges (①~⑤, 2 turns each). Exactly one reply misses the intent of the question. Vary the mismatch each time (how much → answers when, who → answers how, why → answers where, an offer → answers with a price); do not reuse the same mismatch pair across sets.",
    segment_guide: "Segments: ANN \"Number one.\" then two lines (M/W alternate), repeated for 1~5. Nothing else.",
    choice_guide: "choices = [\"①\",\"②\",\"③\",\"④\",\"⑤\"]; correct_answer = the awkward exchange.",
    craft: "어색한 대화: 네 쌍은 완전히 자연스럽고, 한 쌍만 질문 의도와 어긋난 대답(방법↔장소, 시간↔방향, 제안↔감사). 어색한 대답도 문법은 맞고 같은 소재 단어를 쓴다. 회차마다 어긋나는 짝을 바꾸고, \"How long …?\"에 장소로 답하는 짝은 되풀이하지 않는다.",
    tier: "standard",
  },
  {
    key: "M_TABLE_SELECT",
    family: "middle",
    label: "표 보고 고르기",
    instruction: "다음 표를 보면서 대화를 듣고, ○○가 구입할 ○○을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "table",
    orderBound: true,
    format_guide:
      "Table with 5 rows (A~E) and 3~4 columns. Three conditions are applied one by one until one row remains. table_data required; question_text empty.",
    segment_guide: "M/W dialogue. Speakers state requirements only and never name the answer row.",
    choice_guide: "table_data { title \"Name (Col / Col / Col)\", rows[5] {no,label,value \"Col: v / Col: v\"}, mismatch_no = correct row }. choices = row labels.",
    craft: "표 보고 고르기: 조건 3개를 차례로 적용하고 마지막은 \"that one\"처럼 가리키기만. 오답 행은 각각 조건을 정확히 하나씩만 어긴다. 정답 행 이름·기호를 말하지 않는다.",
    tier: "applied",
  },
  {
    key: "M_DATE",
    family: "middle",
    label: "날짜 파악",
    instruction: "대화를 듣고, 두 사람이 ○○할 날짜를 고르시오.",
    variants: [
      { id: "date", label: "날짜", weight: 6 },
      {
        id: "weekday",
        label: "요일",
        weight: 1,
        instruction: "대화를 듣고, ○○가 ○○할 요일을 고르시오.",
        note: "선택지는 한국어 요일 5개(월요일~일요일 중, 이른 요일부터). 대본은 요일로 일정을 맞춘다.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "date",
    format_guide:
      "Scheduling dialogue: a period is given, 2~3 candidate dates are ruled out by other plans, one is chosen. final_date, mentioned_dates.",
    segment_guide: "M/W dialogue; dates spoken as \"May 12th\" or with weekdays.",
    choice_guide: "5 Korean dates (○월 ○일) in calendar order (or 5 weekdays for the weekday variant).",
    craft: "날짜: 기간 제시 → 후보 날짜 2~3개가 다른 일정 때문에 탈락 → 확정. 탈락한 후보 날짜를 오답으로, 선택지는 이른 날짜부터, 정답은 ②~④ 자리.",
    tier: "applied",
  },
  {
    key: "M_PURPOSE_ANNOUNCE",
    family: "middle",
    label: "방송 목적 파악",
    instruction: "다음을 듣고, 방송의 목적으로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    format_guide: "School/facility PA announcement: greeting, background, the purpose, details, closing.",
    segment_guide: "Monologue (M or W), announcement style (\"Attention, students.\").",
    choice_guide: "5 Korean purpose phrases (~하려고).",
    craft: "방송 목적: 배경 설명 뒤에 목적(변경 안내·요청·모집·주의). 같은 소재의 다른 목적(홍보 vs 장소 변경)이 오답.",
    tier: "applied",
  },
  {
    key: "M_SITUATION_SAY",
    family: "middle",
    label: "상황에 맞는 말",
    instruction: "다음 상황 설명을 듣고, ○○가 ○○에게 할 말로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "en",
    format_guide:
      "Third-person narration about two named people; ends with \"In this situation, what would A most likely say to B?\". question_text \"A: ______\". State A's intention with different words from the correct choice - never let the narration repeat the choice's content words (if the answer is \"Please practice before ten or wear headphones.\", the narration says the late drumming keeps her brother awake, not \"she wants to ask him to practice earlier or use headphones\").",
    segment_guide: "Monologue narrator (M or W).",
    choice_guide: "5 English utterances (4~9 words). One matches the intended speech act.",
    craft: "상황 발화(중등): 배경→문제→A의 생각. A가 하려는 말의 취지는 밝히되(wants to suggest / thank …) 정답 문장과 같은 단어로 쓰지 않는다. 오답은 다른 사람이 할 말·다른 시점의 말.",
    tier: "advanced",
  },

  // ───────────────────────── 고등 (고1~수능) ─────────────────────────
  {
    key: "H_PURPOSE",
    family: "high",
    label: "목적 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    engine: 1,
    format_guide:
      "School/community announcement monologue. Purpose = inform, request, invite, encourage, or announce a change. Korean choices.",
    segment_guide:
      "Monologue only (M or W). 9~12 sentences. Opens with greeting/self-ID, states plan/change, closes with thanks/cooperation.",
    choice_guide:
      "5 Korean purpose statements (…하려고). Only one matches the announced purpose; distractors share topic words.",
    craft: "목적: 인사·배경으로 시작하고 목적은 중반 이후에. 오답은 대본 소재어(행사·장소 등)를 쓴 다른 목적(홍보·사과·모집 등).",
    tier: "foundation",
  },
  {
    key: "H_OPINION",
    family: "high",
    label: "의견 파악",
    instruction: "대화를 듣고, ○○의 의견으로 가장 적절한 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 2,
    format_guide: "M/W dialogue. Target speaker states/repeats a clear opinion or advice. Korean choices.",
    segment_guide: "M/W dialogue. Opinion appears in later turns and may be restated.",
    choice_guide:
      "5 Korean opinion statements. Correct = speaker's stance; distractors = other speaker or related but wrong claim.",
    craft: "의견: 대상 화자가 의견을 2~3번 다른 표현으로 말한다(I think / You'd better / It's worth …). 정답은 일반화한 문장, 오답에는 상대 화자의 말·세부 사실·반대 주장을 넣는다.",
    tier: "foundation",
  },
  {
    key: "H_GIST",
    family: "high",
    label: "요지 파악",
    instruction: "다음을 듣고, ○○가 하는 말의 요지로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    engine: 3,
    format_guide: "Radio tip / advice monologue. Gist is a generalizable main idea, not a single detail. Korean choices.",
    segment_guide: "Monologue (M or W). 7~10 sentences. Hook → tip → brief why it works.",
    choice_guide: "5 Korean gist statements. Correct abstracts the tip; distractors are details or opposite advice.",
    craft: "요지: 문제 제기→주장→예시→재강조. 정답은 마지막 재강조 문장의 직역이 아니라 일반화.",
    tier: "foundation",
  },
  {
    key: "H_PICTURE_MISMATCH",
    family: "high",
    label: "그림 불일치",
    instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "figure_labels",
    orderBound: true,
    engine: 4,
    imagesPerQuestion: 1,
    format_guide:
      "Dialogue describes a scene/poster with 5 labeled details (①–⑤). Exactly one detail in the picture does NOT match the dialogue. needs_image_choices true.",
    segment_guide: "M/W dialogue. Speakers mention all five labeled items; one statement conflicts with the image design.",
    choice_guide:
      "choices = [\"①\",\"②\",\"③\",\"④\",\"⑤\"]. correct_answer = the labeled part that mismatches. choice_image_prompts: one composite scene with five clear labels.",
    craft: "그림: 그림 속 사물 5개를 왼쪽→오른쪽·위→아래처럼 자연스러운 순서로 언급한다(First/Second 같은 번호로 세지 않는다). 각 언급에 짧은 반응·이유를 섞는다(\"Oh, the striped one? It matches the sofa.\"). 사물은 정확히 5개만 묘사. 분량은 도입 2턴 + 사물마다 묘사·반응 2턴 정도로 채운다.",
    tier: "foundation",
  },
  {
    key: "H_TODO",
    family: "high",
    label: "할 일",
    instruction: "대화를 듣고, ○○가 할 일로 가장 적절한 것을 고르시오.",
    variants: [
      { id: "todo", label: "할 일", weight: 7 },
      {
        id: "request",
        label: "부탁한 일",
        weight: 2,
        instruction: "대화를 듣고, ○○가 ○○에게 부탁한 일로 가장 적절한 것을 고르시오.",
        note: "부탁하는 사람과 받는 사람을 대본과 맞추고, 오답은 부탁하지 않은 일·스스로 하겠다고 한 일로.",
      },
      {
        id: "for",
        label: "~를 위해 할 일",
        weight: 1,
        instruction: "대화를 듣고, ○○가 ○○를 위해 할 일로 가장 적절한 것을 고르시오.",
        note: "정답은 대상 화자가 상대를 위해 하겠다고 한 일, 오답은 이미 한 일·상대가 스스로 할 일로.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 5,
    format_guide:
      "Checklist dialogue: several tasks already done vs one remaining action for the target speaker. Korean choices.",
    segment_guide: "M/W dialogue. Target says they will do X / I'll … right away for the remaining task.",
    choice_guide: "5 Korean action phrases (…하기). Correct = remaining task; distractors = already completed tasks.",
    craft: "할 일: 준비 점검 대화. 이미 한 일·상대가 할 일·하려다 필요 없다고 한 일을 오답으로. 정답 과제는 \"The only thing left\" 없이 후반부 부탁·제안과 수락으로 정한다.",
    tier: "foundation",
  },
  {
    key: "H_AMOUNT",
    family: "high",
    label: "금액 계산",
    instruction: "대화를 듣고, ○○가 지불할 금액을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "number",
    engine: 6,
    format_guide:
      "Purchase/rental dialogue with unit prices, quantities, optional extras, and optional coupon/discount. Dollar choices. Often 3 points.",
    segment_guide: "M/W dialogue. All numbers spoken clearly; final payable amount computable.",
    choice_guide:
      "5 dollar amounts (e.g. $25). Correct = exact final payment after options/discount. Distractors = common calc errors.",
    craft: "금액: 단가·수량·할인(쿠폰·회원·%)·추가 요금. 할인 전 합계는 말해도 되지만 최종 지불액은 말하지 않는다. 오답은 할인 누락·순서 착오·수량 착오 값이며 정답은 오름차순 선택지에서 ②~④ 자리. 특정 품목에만 적용되는 할인은 price_calculation adjustment에 applies_to로 품목 label을 적는다. % 할인 뒤 금액이 센트 없이 떨어지도록 단가·수량을 고른다(10% 할인이면 할인 대상 합계를 10의 배수로) — 반올림한 금액을 정답으로 쓰지 않는다.",
    tier: "standard",
  },
  {
    key: "H_REASON",
    family: "high",
    label: "이유 파악",
    instruction: "대화를 듣고, ○○가 … 이유를 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    engine: 7,
    format_guide:
      "Dialogue about inability/absence/failure. Partner guesses wrong reasons; true reason stated later. Korean choices.",
    segment_guide: "M/W dialogue. Deny 1~2 wrong guesses, then give real reason.",
    choice_guide: "5 Korean reason phrases (…해서). Correct = true reason; distractors = guessed or mentioned but denied reasons.",
    craft: "이유: 상대가 1~2번 틀린 이유를 추측→부정(No, that's not it)→진짜 이유. 진짜 이유는 선택지와 다른 말로 설명한다.",
    tier: "standard",
  },
  {
    key: "H_NOT_MENTIONED",
    family: "high",
    label: "미언급",
    instruction: "대화를 듣고, ○○에 관해 언급되지 않은 것을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "ko",
    orderBound: true,
    engine: 8,
    format_guide: "Event/class info dialogue. Four of five choice labels are mentioned; one is not. Korean item labels.",
    segment_guide: "M/W dialogue. Explicitly cover date, fee, how to join, materials, etc. — omit exactly one.",
    choice_guide: "5 Korean labels (날짜, 참가비, 준비물…). correct_answer = unmentioned label.",
    craft: "미언급: 네 항목은 질문·대답으로 자연스럽게 나오고, 선택지는 대본 언급 순서대로 쓴다.",
    tier: "standard",
  },
  {
    key: "H_MISMATCH",
    family: "high",
    label: "내용 불일치",
    instruction: "○○에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "ko",
    orderBound: true,
    engine: 9,
    format_guide:
      "Event announcement monologue. Four facts match choices; one choice conflicts with the script. Korean choices.",
    segment_guide: "Monologue (M or W). 9~12 sentences. Place, time, features, fee/reservation clearly stated.",
    choice_guide: "5 Korean factual claims. Correct = the false claim relative to the script.",
    craft: "내용 불일치: 선택지 5개는 대본 순서대로. 정답은 수·요일·대상 등 한 요소만 바꾼 문장.",
    tier: "standard",
  },
  {
    key: "H_TABLE",
    family: "high",
    label: "표 선택",
    instruction: "다음 표를 보면서 대화를 듣고, ○○가 …을 고르시오.",
    scriptForm: "dialogue",
    choiceFormat: "table",
    orderBound: true,
    engine: 10,
    format_guide:
      "Table with 5 rows (A–E) and 3~4 columns. Speakers apply constraints until one row remains. table_data required. question_text empty.",
    segment_guide:
      "M/W dialogue. Speakers apply sequential filters (budget, size, feature…) by describing REQUIREMENTS only. NEVER name the correct row label/title/letter. Close with 'that one / that remaining option / let's book it' after the last distinguishing condition.",
    choice_guide:
      "table_data: { title, rows[5] with no/label/value summary, mismatch_no=correct row 1~5, mismatch_reason=why that row }. choices may be row labels A–E. Script must force students to use the table — do not spoil by naming the answer row.",
    craft: "표: 조건 3~4개를 차례로 적용하고 마지막은 \"that one / this model\"처럼 가리키기만. 오답 행은 각각 조건을 정확히 하나씩만 어긴다. table_data.value는 열 이름이 드러나게 \"열이름: 값 / 열이름: 값\" 형식.",
    tier: "standard",
  },
  {
    key: "H_RESP_SHORT",
    family: "high",
    label: "짧은 응답",
    instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
    variants: [
      {
        id: "wm",
        label: "여→남",
        instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      },
      {
        id: "mw",
        label: "남→여",
        instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "en",
    format_guide:
      "Short dialogue ending BEFORE the responder's reply. English response choices. previous_turn + blank_speaker required.",
    segment_guide:
      "M/W short dialogue of exactly 3 turns (A-B-A). Last segment = previous_turn speaker only. Do NOT include the reply in segments.",
    choice_guide:
      "5 English replies (5~10 words). One fits function+context. No bare Okay/Yes/Sure. question_text like \"Woman: _____\" or \"Man: _____\".",
    craft: "짧은 응답: A-B-A 3턴. 마지막 말은 평서문(걱정·소식·계획)이나 의문사 의문문 위주 — \"Could you …? / Shall I …?\" 부탁으로 끝내고 \"Sure, I'll …\"을 정답으로 하는 구조 금지. 정답은 마지막 말의 단어를 되풀이하지 않는다.",
    tier: "applied",
  },
  {
    key: "H_RESP_LONG",
    family: "high",
    label: "긴 응답",
    instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
    variants: [
      {
        id: "mw",
        label: "남→여",
        instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      },
      {
        id: "wm",
        label: "여→남",
        instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      },
    ],
    scriptForm: "dialogue",
    choiceFormat: "en",
    format_guide: "Longer counseling/planning dialogue. Printed blank line (Man:/Woman:). English choices. Often 3 points.",
    segment_guide: "M/W dialogue. Rich context before last prompt turn. Reply not in segments.",
    choice_guide: "5 English replies with specific detail from context. question_text \"Man: _____\" or \"Woman: _____\".",
    craft: "긴 응답: 마지막 말은 고민·의견·계획을 말하는 평서문이나 의문사 의문문. 정답은 대화 전체 맥락을 종합한 반응이고, 오답 2개 이상은 대본 단어를 빌린 함정. Yes/No 부탁→수락 되풀이 금지.",
    tier: "applied",
  },
  {
    key: "H_SITUATION",
    family: "high",
    label: "상황 발화",
    instruction: "다음 상황 설명을 듣고, ○○가 ○○에게 할 말로 가장 적절한 것을 고르시오.",
    scriptForm: "monologue",
    choiceFormat: "en",
    engine: 15,
    format_guide:
      "Third-person situation narration (English). Ask what A would say to B. English utterance choices. Printed \"Name: _____\".",
    segment_guide:
      "Monologue narrator (M or W or ANN). 9~12 sentences. Ends with: In this situation, what would A most likely say to B?",
    choice_guide: "5 English utterances (request, thanks, suggestion, apology…). Only one matches the intended speech act.",
    craft: "상황 발화: 배경→문제→A의 판단. 마지막에 A가 하려는 말의 취지는 밝히되(wants to suggest / encourage …) 정답 문장과 같은 단어로 쓰지 않는다.",
    tier: "applied",
  },
  {
    key: "H_SET_TOPIC",
    family: "high",
    label: "주제",
    instruction: "○○가 하는 말의 주제로 가장 적절한 것은?",
    scriptForm: "set_monologue",
    choiceFormat: "en",
    engine: 16,
    format_guide:
      "[16~17] shared long monologue played TWICE. Topic question. English topic choices. Must share identical segments with the paired mention question.",
    segment_guide:
      "Monologue (M or W). 10~13 sentences listing 4 items with 1~2 sentences each. Intro + enumerated items + wrap-up.",
    choice_guide: "5 English topic phrases. Correct = overall topic; distractors = one detail or wrong focus.",
    craft: "주제: 도입→항목 4개(각 1~2문장 설명)→마무리. 정답은 영어 주제구(ways to / effects of / reasons why …)로, 첫 문장을 그대로 옮기지 않는다.",
    tier: "advanced",
  },
  {
    key: "H_SET_MENTION",
    family: "high",
    label: "언급 여부",
    instruction: "언급된 ○○이/가 아닌 것은?",
    scriptForm: "set_monologue",
    choiceFormat: "en",
    orderBound: true,
    engine: 17,
    format_guide:
      "Same audio as the paired topic question. Ask which listed item was NOT mentioned. MUST copy segments/script_text from it exactly.",
    segment_guide: "Identical segments to the topic question. Do not invent a new script.",
    choice_guide: "5 English nouns/items from the list category. Four appear in the script; one does not.",
    craft: "언급 여부: 같은 범주의 구체 명사(동물·음식·장소·도구 등) 1~3단어. 지시문 범주어와 선택지가 정확히 맞아야 한다. 4개는 대본에 순서대로 등장.",
    tier: "advanced",
  },
];

const BY_KEY = new Map<ListeningTypeKey, ListeningTypeDef>(DEFS.map((d) => [d.key, d]));

/**
 * 옛 모듈이 없는 새 중등 유형의 모듈 번호. 유형 모듈·검수는 (학년, 번호)로 갈라지므로
 * 새 유형도 번호가 있어야 한다 — 옛 중등 번호 1~20과 겹치지 않게 21부터 쓴다.
 */
const NEW_MIDDLE_CODES: Partial<Record<ListeningTypeKey, number>> = {
  M_NOT_MENTIONED_DIALOGUE: 21,
  M_TOPIC_MONO: 22,
  M_DID: 23,
  M_SPECIFIC: 24,
  M_MISMATCH_DIALOGUE: 25,
  M_PURPOSE_CALL: 26,
  M_AMOUNT: 27,
  M_RELATION: 28,
  M_PICTURE_SITUATION: 29,
  M_FLYER_BLANKS: 30,
  M_EXPRESSION_MEANING: 31,
  M_DESCRIBE: 32,
  M_AWKWARD_DIALOGUE: 33,
  M_TABLE_SELECT: 34,
  M_DATE: 35,
  M_PURPOSE_ANNOUNCE: 36,
  M_SITUATION_SAY: 37,
};

/** 응답 유형의 기본 방향 (변형을 정하지 않았을 때) */
const DEFAULT_RESPONSE_DIRECTION: Partial<Record<ListeningTypeKey, ResponseDirection>> = {
  M_RESPONSE: "wm",
  H_RESP_SHORT: "wm",
  H_RESP_LONG: "mw",
};

/**
 * 유형 모듈 번호 — fix-typeN·typeN 프롬프트·검수·정답 풀이 쓰는 번호.
 * 옛 유형은 옛 번호(중등 = 중1 배치 1~20, 고등 = 고1 배치 1~17), 응답은 방향으로 정하고, 새 중등 유형은 21~37.
 */
export function typeCode(key: ListeningTypeKey, variantId?: string | null): number {
  const dir = DEFAULT_RESPONSE_DIRECTION[key];
  if (dir) {
    const v = variantId === "wm" || variantId === "mw" ? variantId : dir;
    return engineForDirection(key, v)!;
  }
  const def = getTypeDef(key);
  return def.engine ?? NEW_MIDDLE_CODES[key] ?? 0;
}

/** 모듈 번호 → 유형 키 (학년군별) */
export function keyForCode(code: number, family: "middle" | "high"): ListeningTypeKey | undefined {
  if (family === "middle") {
    if (code === 19 || code === 20) return "M_RESPONSE";
  } else {
    if (code === 11 || code === 12) return "H_RESP_SHORT";
    if (code === 13 || code === 14) return "H_RESP_LONG";
  }
  return DEFS.find(
    (d) => d.family === family && (d.engine === code || NEW_MIDDLE_CODES[d.key] === code)
  )?.key;
}

/** 모듈 번호에 담긴 응답 방향 (응답 유형이 아니면 undefined) */
export function directionOfCode(code: number, family: "middle" | "high"): ResponseDirection | undefined {
  if (family === "middle") {
    if (code === 19) return "wm";
    if (code === 20) return "mw";
    return undefined;
  }
  if (code === 11 || code === 14) return "wm";
  if (code === 12 || code === 13) return "mw";
  return undefined;
}

export const LISTENING_TYPE_KEYS: ListeningTypeKey[] = DEFS.map((d) => d.key);

export function isListeningTypeKey(raw: unknown): raw is ListeningTypeKey {
  return typeof raw === "string" && BY_KEY.has(raw as ListeningTypeKey);
}

export function getTypeDef(key: ListeningTypeKey): ListeningTypeDef {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`알 수 없는 듣기 유형: ${key}`);
  return def;
}

export function allTypeDefs(): ListeningTypeDef[] {
  return DEFS;
}

/** 응답 유형(빈칸 뒤 응답을 고르는 문항) */
export function isResponseTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  return key === "M_RESPONSE" || key === "H_RESP_SHORT" || key === "H_RESP_LONG";
}

/** 상황 발화 (인쇄 "Name: ___") */
export function isSituationTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  return key === "M_SITUATION_SAY" || key === "H_SITUATION";
}

export function isMiniDialogueTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  return key != null && getTypeDef(key).scriptForm === "mini_dialogues";
}

export function isMonologueTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  if (!key) return false;
  const f = getTypeDef(key).scriptForm;
  return f === "monologue" || f === "set_monologue";
}

export function isDialogueTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  return key != null && getTypeDef(key).scriptForm === "dialogue";
}

export function isOrderBoundTypeKey(key: ListeningTypeKey | undefined | null): boolean {
  return key != null && Boolean(getTypeDef(key).orderBound);
}

/** 표(table_data)를 쓰는 유형 */
export function usesTableData(key: ListeningTypeKey | undefined | null): boolean {
  if (!key) return false;
  const f = getTypeDef(key).choiceFormat;
  return f === "table" || f === "flyer";
}

/** 응답 방향에 맞는 옛 모듈 번호 (중등 19=여→남·20=남→여, 고등 11·14=여→남·12·13=남→여) */
export function engineForDirection(key: ListeningTypeKey, direction: ResponseDirection): number | undefined {
  if (key === "M_RESPONSE") return direction === "wm" ? 19 : 20;
  if (key === "H_RESP_SHORT") return direction === "wm" ? 11 : 12;
  if (key === "H_RESP_LONG") return direction === "wm" ? 14 : 13;
  return getTypeDef(key).engine;
}

/** 지시문·빈칸 화자로 응답 방향을 읽는다 (여자의 마지막 말 → 남자 = wm) */
export function responseDirectionOf(q: {
  instruction?: string;
  blank_speaker?: string;
  question_text?: string;
  segments?: Array<{ speaker: string }>;
}): ResponseDirection | null {
  const ins = String(q.instruction ?? "");
  if (/여자의\s*마지막\s*말/.test(ins)) return "wm";
  if (/남자의\s*마지막\s*말/.test(ins)) return "mw";
  const blank = String(q.blank_speaker ?? "").trim().toUpperCase();
  if (blank === "M") return "wm";
  if (blank === "W") return "mw";
  const qt = String(q.question_text ?? "");
  if (/^\s*Man\s*:/i.test(qt)) return "wm";
  if (/^\s*Woman\s*:/i.test(qt)) return "mw";
  const spoken = (q.segments ?? []).filter((s) => s.speaker === "M" || s.speaker === "W");
  const last = spoken[spoken.length - 1]?.speaker;
  if (last === "W") return "wm";
  if (last === "M") return "mw";
  return null;
}

/** 이 유형·변형이 학년에서 쓰일 가중치 */
export function variantWeight(v: ListeningTypeVariant, grade: ListeningGradeLevel): number {
  if (v.weightByGrade && grade in v.weightByGrade) return v.weightByGrade[grade] ?? 0;
  return v.weight ?? 1;
}

export function findVariant(key: ListeningTypeKey, variantId: string | undefined | null): ListeningTypeVariant | undefined {
  if (!variantId) return undefined;
  return getTypeDef(key).variants?.find((v) => v.id === variantId);
}

/** 학년 비율대로 변형 하나를 고른다 (변형이 없으면 undefined) */
export function pickVariant(
  key: ListeningTypeKey,
  grade: ListeningGradeLevel,
  allowed?: string[]
): string | undefined {
  const variants = (getTypeDef(key).variants ?? []).filter(
    (v) => (!allowed || allowed.includes(v.id)) && variantWeight(v, grade) > 0
  );
  if (variants.length === 0) return undefined;
  const total = variants.reduce((n, v) => n + variantWeight(v, grade), 0);
  let r = Math.random() * total;
  for (const v of variants) {
    r -= variantWeight(v, grade);
    if (r <= 0) return v.id;
  }
  return variants[variants.length - 1]!.id;
}

/**
 * 학년마다 표준 지시문 문구가 조금 다른 곳 (공식 문제지 8회 기준).
 * 중3 응답은 "마지막 말에 대한 …의 응답으로", 중3 언급X(담화)는 "…에 대해 언급되지 않은 것".
 */
function gradeInstruction(key: ListeningTypeKey, grade: ListeningGradeLevel | undefined, text: string): string {
  if (grade !== "middle3") return text;
  if (key === "M_RESPONSE") {
    return text.replace(/마지막 말에 이어질 (남자|여자)의 말로/, "마지막 말에 대한 $1의 응답으로");
  }
  if (key === "M_NOT_MENTIONED_MONO") return "다음을 듣고, ○○에 대해 언급되지 않은 것을 고르시오.";
  return text;
}

/** 변형을 반영한 지시문 틀 (학년을 주면 그 학년의 표준 문구로) */
export function instructionFor(
  key: ListeningTypeKey,
  variantId?: string | null,
  grade?: ListeningGradeLevel
): string {
  return gradeInstruction(key, grade, findVariant(key, variantId)?.instruction ?? getTypeDef(key).instruction);
}

/** 문항당 생성 그림 수 (원가 계산용) */
export function imagesPerQuestion(key: ListeningTypeKey): number {
  return getTypeDef(key).imagesPerQuestion ?? 0;
}
