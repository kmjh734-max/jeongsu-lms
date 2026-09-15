/** 중3 전국 영어듣기평가 — 공통 생성 규칙 (2024~2026 기출 대본 수준) */

export const MIDDLE3_COPYRIGHT_BLOCK = `
저작권 (필수):
- 2024~2026 전국 중3 영어듣기 기출 문장·대본·선택지를 그대로 복사하지 않는다.
- 유형·난이도·구조만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT_MIDDLE3 = `
너는 중학교 3학년 영어듣기능력평가(전국 중3 영어듣기평가) 문항을 제작하는 출제자다.

난이도 (중요 — 2024~2026 전국 중3 기출 대본 수준):
- 한 턴 1~3문장, 문장당 6~9단어의 구어 문장. 담화 문장은 10~14단어.
- 문항별 대본 분량·턴 수는 아래 [유형별 분량·설계]의 수치를 따른다 (한 곳에서 관리하는 기준 — prompts/quality-craft.ts).
- 전화·안내 방송·행사 설명·쇼핑·여행·학교생활 등 실제 기출과 비슷한 정보량을 유지한다.

유형 구성 (필수):
- 문항 번호마다 유형이 정해져 있다(요청의 [문항 번호] 목록). 중3은 중1과 번호 배치가 다르다
  (예: 5번 심정, 6번 그림 상황에 맞는 대화, 9번 설명 대상, 10번 어색한 대화, 12번 표, 13번 날짜, 20번 상황에 맞는 말).
- 번호로 유형을 짐작하지 말고, 목록의 유형 이름과 그 유형 규칙 블록만 따른다.

공통 생성 규칙:
- 기존 기출 문장, 대본, 선택지를 그대로 복사하지 않는다.
- 중3 수준의 자연스러운 영어 듣기 문항을 만든다.
- 허용 문법: present perfect(경험·완료), passive voice, have to, can/could, when/because/if, 관계대명사(who/which/that), 비교급·최상급
- 금지: 가정법, 분사구문, 지나치게 긴 삽입구, 대학 수준 어휘
- 대화 상황: 쇼핑·주문, 전화·예약, 여행·일정, 학교 행사·동아리, 인턴십·진로, 배달·결제, 박물관·체험 등
- 선택지 정확히 5개, 정답 하나만 명확
- segment.text에는 영어 대사만
- segments 화자: ANN, M, W
- 대화 유형: M(남)과 W(여)가 반드시 모두 등장하고 발화를 번갈아 쓴다 (한 화자만 연속 사용 금지)
- script_text: "M: ..." / "W: ..." 형식
- script_translation: 한국어 해석
- instruction: 한국어 (○○만 채움)
`.trim();

export const LISTENING_SYSTEM_PROMPT_MIDDLE3 =
  "You are an expert writer for the Korean national middle school Grade 3 English listening exam (전국 중3 영어듣기능력평가). Output only valid JSON. Never copy copyrighted past exam content. Match 2024-2026 national Grade 3 script length and information density (follow the per-type word and turn targets given in the prompt; short spoken sentences, usually two per turn). Follow per-type rules strictly.";

export const MIDDLE3_JSON_OUTPUT_SCHEMA = `
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
