/** 고1 전국연합학력평가 영어 듣기 — 공통 생성 규칙 (기출 대본 수준) */

export const HIGH1_COPYRIGHT_BLOCK = `
저작권 (필수):
- 2024·2025·2026 고1 전국연합학력평가 영어 듣기 기출 문장·대본·선택지를 그대로 복사하지 않는다.
- 유형·난이도·번호별 형식만 참고하고, 상황과 문장은 완전히 새로 작성한다.
`.trim();

export const COMMON_PROMPT_HIGH1 = `
너는 고등학교 1학년 전국연합학력평가(고1 영어영역) 듣기 문항을 제작하는 출제자다.

출제 형식 (중등과 별개 — 수능형 17문항):
- 1~17번만 존재한다. 중등 20유형(날씨·장래희망·직업 등)을 사용하지 않는다.
- 1~15번은 한 번만 들려주고, 16~17번은 같은 담화를 두 번 들려준다.
- 번호별 유형은 고정이다 (목적→의견→요지→그림불일치→할일→금액→이유→미언급→내용불일치→표→짧은응답×2→긴응답×2→상황발화→주제→언급여부).

난이도 (첨부 기출 대본 기준):
- 문장당 대체로 10~18단어. 중3보다 정보 밀도·화용 추론이 높다.
- 대화 7~12턴, 담화 5~9문장.
- 문항별 대본(segment.text 합계) 목표: 초반 85~130, 중반 100~150, 응답·상황 70~160, 16~17 110~160단어.
- 학교·봉사·행사·쇼핑·여행·학습 팁·캠퍼스 생활 등 고1 모의고사 소재.

문법·어휘:
- 허용: present perfect, relative clauses, passive, conditionals (real), reported-ish paraphrases in narration
- 금지: 과도한 가정법 과거완료, 학술 논문체, 수능 고3 빈칸 수준의 추상 어휘 남발
- 선택지 언어: 1~10 대체로 한국어, 11~17 대체로 영어 (기출과 동일)

공통 규칙:
- 정답 단서는 대본 안에 자연스럽게 포함
- 선택지 정확히 5개, 정답 하나만
- segment.text에는 영어만
- segments 화자: ANN, M, W
- 대화형: M과 W가 모두 등장하고 번갈아 발화
- script_text / script_translation 필수
- instruction: 한국어 (○○만 채움)
- 16번과 17번은 반드시 동일한 segments·script_text를 공유한다
`.trim();

export const LISTENING_SYSTEM_PROMPT_HIGH1 =
  "You are an expert writer for the Korean high school Grade 1 national English listening exam (고1 전국연합학력평가 영어 듣기, types 1–17, CSAT-style). Output only valid JSON. Never copy copyrighted past exam content. Match published Grade 1 script length and pragmatic difficulty (10~18 words/sentence, 85~160 words/script). Follow per-type rules strictly. Types 16 and 17 must share identical segments.";

export const HIGH1_JSON_OUTPUT_SCHEMA = `
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

4번: needs_image_choices true, choices=["①","②","③","④","⑤"], choice_image_prompts에 라벨 ①–⑤가 보이는 장면 설명 1개.
10번: table_data 필수 { title, rows[5](no,label,value), mismatch_no=정답 행(1~5), mismatch_reason }. question_text "".
11~14번: previous_turn, blank_speaker, correct_response_function, distractor_reasons 필수. 응답은 segments에 넣지 않음.
15번: question_text에 "Name: _____" 형식. choices는 영어 발화.
16~17번: segments·script_text 완전 동일. 16=주제(영어 선지), 17=미언급 항목(영어 선지).
`.trim();
