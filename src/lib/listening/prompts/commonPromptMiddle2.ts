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
- 1~20번 유형은 중1 전국 영어듣기평가와 번호·유형명·지시문·출제 형식이 동일하다.
- 난이도(문장 길이·정보량)만 아래 기준으로 약간 올린다.

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

14번: table_data 필수 { title, rows[5], mismatch_no, mismatch_reason }. question_text는 "".
1·2번: needs_image_choices true 가능 (1번 묘사·2번 구입).
18번: target_job, job_clues, distractor_jobs.
19~20번: previous_turn, blank_speaker, correct_response_function, distractor_reasons(5).
17번: target_person, target_time, planned_action, mentioned_other_actions. choices=한글 ~하기.
`.trim();
