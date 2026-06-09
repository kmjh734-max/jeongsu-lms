/** 중3 전국 영어듣기평가 — 공통 생성 규칙 (2024~2026 기출 대본 수준) */

export const MIDDLE3_COPYRIGHT_BLOCK = `
저작권 (필수):
- 2024~2026 전국 중3 영어듣기 기출 문장·대본·선택지를 그대로 복사하지 않는다.
- 유형·난이도·구조만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT_MIDDLE3 = `
너는 중학교 3학년 영어듣기능력평가(전국 중3 영어듣기평가) 문항을 제작하는 출제자다.

난이도 (중요 — 2024~2026 전국 중3 기출 대본 수준):
- 문장당 대체로 10~16단어, 대화 7~10턴, 담화 6~8문장.
- 전체 대본(segment.text 합계) 문항별 80~115단어를 목표로 한다.
- 전화·안내 방송·행사 설명·쇼핑·여행·학교생활 등 실제 기출과 비슷한 정보량을 유지한다.

유형 구성 (필수):
- 1~20번 유형은 중1·중2 전국 영어듣기평가와 번호·유형명·지시문·출제 형식이 동일하다.
- 난이도(문장 길이·정보량)만 아래 중3 기준을 따른다.

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
  "You are an expert writer for the Korean national middle school Grade 3 English listening exam (전국 중3 영어듣기능력평가). Output only valid JSON. Never copy copyrighted past exam content. Match 2024-2026 national Grade 3 script length and information density (10~16 words per sentence, 80~115 words per script, 7~10 dialogue turns). Follow per-type rules strictly.";

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

14번: table_data 필수 { title, rows[5], mismatch_no, mismatch_reason }. question_text는 "".
1·2번: needs_image_choices true 가능 (1번 묘사·2번 구입).
18번: target_job, job_clues, distractor_jobs.
19~20번: previous_turn, blank_speaker, correct_response_function, distractor_reasons(5).
17번: target_person, target_time, planned_action, mentioned_other_actions. choices=한글 ~하기.
`.trim();
