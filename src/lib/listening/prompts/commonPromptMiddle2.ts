/** 중2 전국 영어듣기평가 — 공통 생성 규칙 (기출보다 약간 어렵게) */

export const MIDDLE2_COPYRIGHT_BLOCK = `
저작권 (필수):
- 2025·2026 전국 중2 영어듣기 기출 문장·대본·선택지를 그대로 복사하지 않는다.
- 유형·난이도·구조만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT_MIDDLE2 = `
너는 중학교 2학년 영어듣기능력평가(전국 중2 영어듣기평가) 문항을 제작하는 출제자다.

난이도 (중요 — 첨부 기출보다 약간 어렵게):
- 2025·2026 전국 중2 기출 대본과 비교해, 턴과 정보를 약간 더 넣는다 (문장을 길게 늘이지 않는다).
- 한 턴 1~2문장, 문장당 5~8단어의 짧은 구어 문장. 분량은 턴을 두 문장으로 채워 맞춘다.
- 문항별 대본 분량·턴 수는 아래 [유형별 분량·설계]의 수치를 따른다 (한 곳에서 관리하는 기준 — prompts/quality-craft.ts).

유형 구성 (필수):
- 문항 번호마다 유형이 정해져 있다(요청의 [문항 번호] 목록). 중2는 중1과 번호 배치가 다르다
  (예: 1번 날씨, 3번 심정, 4번 한 일, 12번 전화·방문 목적, 13번 거스름돈, 14번 관계, 17번 양식 빈칸, 18번 표현의 의미).
- 번호로 유형을 짐작하지 말고, 목록의 유형 이름과 그 유형 규칙 블록만 따른다.

공통 생성 규칙:
- 기존 기출 문장, 대본, 선택지를 그대로 복사하지 않는다.
- 중2 수준의 자연스러운 영어 듣기 문항을 만든다.
- 허용 문법: be going to, present perfect(경험), have to, can/could, when/because/if, 간단한 관계대명사(who/which/that) 1~2개까지
- 금지: 가정법, 분사구문, 지나치게 긴 삽입구, 대학 수준 어휘
- 대화 상황: 학교, 가족, 친구, 쇼핑, 여행, 행사, 병원, 도서관, 온라인, 동아리, 체험학습 등
- 선택지 정확히 5개, 정답 하나만 명확
- segment.text에는 영어 대사만
- segments 화자: ANN, M, W
- 대화 유형: M(남)과 W(여)가 반드시 모두 등장하고 발화를 번갈아 쓴다 (한 화자만 연속 사용 금지)
- script_text: "M: ..." / "W: ..." 형식
- script_translation: 한국어 해석
- instruction: 한국어 (○○만 채움)
`.trim();

export const LISTENING_SYSTEM_PROMPT_MIDDLE2 =
  "You are an expert writer for the Korean national middle school Grade 2 English listening exam (전국 중2 영어듣기능력평가). Output only valid JSON. Never copy copyrighted past exam content. Write natural spoken dialogues slightly richer than typical published Grade 2 exams, following the per-type word and turn targets given in the prompt (short spoken sentences, usually two per turn). Follow per-type rules strictly.";

export const MIDDLE2_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON만 출력 (questions 배열):

{
  "questions": [
    {
      "order_index": 1,
      "question_type": "",
      "instruction": "",
      "segments": [{ "speaker": "M", "text": "" }],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["", "", "", "", ""],
      "correct_answer": 1,
      "explanation": "한국어 짧은 해설",
      "answer_clue": "",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "choice_image_prompts": [],
      "table_data": null,
      "previous_turn": "",
      "blank_speaker": "",
      "situation_type": "",
      "correct_response_function": "",
      "distractor_reasons": []
    }
  ]
}

유형별 추가 필드 (그 유형 문항에만):
- 표 보고 고르기·표 정보 불일치: table_data { title, rows[5] {no,label,value}, mismatch_no, mismatch_reason }, question_text "".
- 양식 빈칸 정보: table_data { kind: "flyer", title, rows[4~6] {no,label,value — 두 줄은 "(A)"·"(B)"}, mismatch_no(=정답 번호), mismatch_reason }, question_text "".
- 구입/주문 정보 파악·묘사 듣고 대상 고르기·날씨 파악: needs_image_choices true, choice_image_prompts 5개(선택지마다 그림 1장).
- 그림 상황에 맞는 대화: needs_image_choices true, visual_choice_type "scene", choice_image_prompts 1개(장면 그림, 글자 없음).
- 그림 상황에 맞는 대화·어색한 대화 고르기: segments는 ANN "Number one." ~ "Number five."와 각 두 줄, choices ["①","②","③","④","⑤"].
- 응답 고르기: previous_turn, blank_speaker, correct_response_function, distractor_reasons(5). 응답 줄은 segments에 넣지 않는다.
- 상황에 맞는 말: question_text "이름: ______".
- 금액 파악: price_calculation { items, adjustments, final_amount, (거스름돈이면) paid_amount }.
- 언급하지 않은 것·언급하지 않은 것(대화): mention_plan.
`.trim();
