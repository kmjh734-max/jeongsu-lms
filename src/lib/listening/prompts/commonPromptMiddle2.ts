/** 중2 전국 영어듣기평가 — 공통 생성 규칙 (기출보다 약간 어렵게) */

export const MIDDLE2_COPYRIGHT_BLOCK = `
저작권 (필수):
- 2025·2026 전국 중2 영어듣기 기출 문장·대본·선택지를 그대로 복사하지 않는다.
- 유형·난이도·구조만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT_MIDDLE2 = `
너는 중학교 2학년 영어듣기능력평가(전국 중2 영어듣기평가) 문항을 제작하는 출제자다.

난이도 (중요 — 첨부 기출보다 약간 어렵게):
- 2025·2026 전국 중2 기출 대본과 비교해, 문장을 약간 더 길고 정보량 있게 작성한다.
- 문장당 대체로 9~16단어, 대화 7~10턴, 담화 6~8문장.
- 전체 대본(segment.text 합계) 문항별 75~115단어를 목표로 한다.
- 기출을 그대로 따라 짧게만 쓰지 말 것.

공통 생성 규칙:
- 기존 기출 문장, 대본, 선택지를 그대로 복사하지 않는다.
- 중2 수준의 자연스러운 영어 듣기 문항을 만든다.
- 허용 문법: be going to, present perfect(경험), have to, can/could, when/because/if, 간단한 관계대명사(who/which/that) 1~2개까지
- 금지: 가정법, 분사구문, 지나치게 긴 삽입구, 대학 수준 어휘
- 대화 상황: 학교, 가족, 친구, 쇼핑, 여행, 행사, 병원, 도서관, 온라인, 동아리, 체험학습 등
- 선택지 정확히 5개, 정답 하나만 명확
- segment.text에는 영어 대사만
- segments 화자: ANN, M, W
- script_text: "M: ..." / "W: ..." 형식
- script_translation: 한국어 해석
- instruction: 한국어 (○○만 채움)
`.trim();

export const LISTENING_SYSTEM_PROMPT_MIDDLE2 =
  "You are an expert writer for the Korean national middle school Grade 2 English listening exam (전국 중2 영어듣기능력평가). Output only valid JSON. Never copy copyrighted past exam content. Write natural sentences slightly longer and richer than typical published Grade 2 exams (9~16 words per sentence, 75~115 words per script). Follow per-type rules strictly.";

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

11·14번: table_data 필수. 2·7번: needs_image_choices true 가능.
19~20번: previous_turn, blank_speaker, correct_response_function, distractor_reasons(5).
13번(거스름돈): final_time에 정답 금액 라벨(예: $4), mentioned_times에 계산 단서.
14번(관계): target_job=정답 관계, job_clues, distractor_jobs.
17번(그림 대화): question_text에 그림 상황 영어 설명, choices=영어 대화 5개.
`.trim();
