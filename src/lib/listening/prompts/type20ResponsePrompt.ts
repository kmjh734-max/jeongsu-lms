import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 20번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE20_QUESTION_TYPE = "응답 고르기";

export const TYPE20_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 20,
      "question_type": "응답 고르기",
      "instruction": "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "I'm sorry I'm late. The bus was slower than usual." },
        { "speaker": "W", "text": "That's okay. The movie doesn't start until 3:30." }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "Woman: __________________________",
      "choices": [
        "Yes. Let's buy our tickets now.",
        "I don't need a new pencil today.",
        "My sister likes orange juice.",
        "The dog is sleeping under the chair.",
        "I finished my math homework yesterday."
      ],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "M: I'm glad we're not late. 정답은 영화 시작 전 시간이 남은 상황에서 표를 사자는 자연스러운 응답이다.",
      "explanation": "",
      "previous_turn": "M: I'm glad we're not late.",
      "blank_speaker": "W",
      "situation_type": "영화 약속",
      "correct_response_function": "계획 확인",
      "distractor_reasons": [
        { "choice": "Yes. Let's buy our tickets now.", "reason": "직전 발화와 영화관 상황에 맞는 정답" },
        { "choice": "I don't need a new pencil today.", "reason": "영화·약속 맥락과 무관" },
        { "choice": "My sister likes orange juice.", "reason": "대화와 무관한 내용" },
        { "choice": "The dog is sleeping under the chair.", "reason": "대화와 무관한 내용" },
        { "choice": "I finished my math homework yesterday.", "reason": "시점·맥락이 맞지 않음" }
      ],
      "avoid_duplicate_with_question_19": true,
      "quality_check_focus": [
        "직전 발화와 정답 응답이 자연스럽게 연결되는가",
        "정답 외 선택지 중 자연스러운 응답이 없는가",
        "question_text의 화자와 지시문 속 화자가 일치하는가",
        "정답이 너무 일반적이지 않은가",
        "19번과 상황 또는 응답 기능이 반복되지 않는가"
      ]
    }
  ]
}

order_index는 반드시 20.
M/W 대화 5~7턴. 마지막 segment 화자=M(남자). 여자 응답은 segments·음원에 넣지 않음.
question_text: "Woman: __________________________" (blank_speaker=W).
instruction: 남자의 마지막 말 → 여자의 말.
choices: 영어 응답 5개. Okay/Yes/Sure/Thank you/I see 단독 금지. 구체적 맥락 포함.
19번과 다른 상황·응답 기능(잃어버린 물건 등 19번 소재 반복 금지).
필수: previous_turn, blank_speaker, situation_type, correct_response_function, distractor_reasons(5개).
`.trim();

const TYPE20_GENERATION_RULES = `
==================================================
20번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 응답 고르기
기본 지시문: 대화를 듣고, 남자/여자의 마지막 말에 이어질 말로 가장 적절한 것을 고르시오.
20번 지시문: 대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.

문항 목적:
**대화 전체 주제/요지가 아니라**, 남자 **마지막 한 줄 발화 직후** 여자가 말할 가장 적절한 **한 줄 응답**만 고르게 한다.
금지: "대화의 주요 내용", "두 사람이 무엇을 했는지" 같은 전체 요지형 정답·지시.

문항 형식:
- 두 사람이 대화한다.
- 마지막 응답자(여자)는 대본에서 말하지 않고 빈칸 처리한다.
- 학생은 영어 응답 선택지 5개 중 가장 자연스러운 말을 고른다.
- 정답은 직전 발화에 직접 반응해야 한다.
- 정답은 대화 전체 맥락과도 자연스럽게 이어져야 한다.

==================================================
19번과 20번의 차이
==================================================

19번과 20번은 같은 응답 고르기 유형이지만, 20번은 19번과 상황을 반드시 다르게 만든다.

예: 19번이 잃어버린 물건이면 20번은 약속 변경, 길 안내, 음식 주문, 생일 준비, 도서관 이용, 병원/보건실, 학교 행사 등 다른 상황.

- 19번: 여자 마지막 → 남자 응답 (Man: ______, blank_speaker=M)
- 20번: 남자 마지막 → 여자 응답 (Woman: ______, blank_speaker=W)
- 19번과 같은 소재·응답 기능 반복 금지
- 19·20번 모두 "감사" 또는 "제안 수락" 정답이 되지 않도록 주의
- 20번은 독립된 새 대화와 새 상황으로 만든다.

그림: needs_image_choices=false, visual_choice_type="none", choice_image_prompts=[]

==================================================
가장 중요한 규칙
==================================================

1. 직전 발화가 명확해야 한다.
2. 빈칸에 들어갈 화자(여자)가 명확해야 한다.
3. 정답은 직전 발화에 직접 반응해야 한다.
4. 오답 4개는 문법적으로 가능해도 현재 맥락에는 맞지 않아야 한다.
5. 선택지 2개 이상이 자연스럽게 이어지면 실패.
6. 정답은 너무 일반적이면 안 된다.
7. "Okay.", "Sure.", "Thank you.", "Yes.", "No.", "I see." 단독 정답 금지.
8. 정답은 구체적 맥락을 포함해야 한다.

좋은 정답 예: Sure. I'll meet you in front of the bookstore. / That's fine. I can wait ten more minutes.
나쁜 정답 예: Okay. / Sure. / Yes. / Thank you.

==================================================
대본 기준
==================================================

- 화자 M/W 모두 사용, 5~7턴
- segments에는 빈칸 직전 발화(남자 마지막)까지만
- question_text: Woman: __________________________
- 직전 발화는 마지막 여자 응답을 자연스럽게 유도
- 중1 수준 자연스러운 영어. 관계대명사·가정법·분사구문 금지
- 기존 기출 복사 금지. 완전히 새로운 상황·문장

대화 흐름:
1. 상황/문제 제시 → 2. 자연스러운 대화 → 3. 핵심 정보 2~3턴
4. 마지막에서 두 번째(남자) 발화가 정답 유도 → 5. 여자 응답은 빈칸

==================================================
응답 기능 유형 (19번과 같은 기능은 가능하면 피함)
==================================================

1. 약속 변경 수락 — That's fine. I can meet you at 4 instead.
2. 길 안내 이해 — Thanks. I'll turn left at the bank. / I'll get off at City Hall.
3. 음식/물건 선택 — I'll choose the chocolate cake. / The blue one looks better.
4. 사과 수용 — That's okay. Please be careful next time.
5. 도움 요청 수락 — Sure. I can help you after class.
6. 계획 확인 — Yes. Let's finish the poster before lunch.
7. 조언 수용 — Good idea. I'll take a short rest. / You're right. I should study more.
8. 축하/긍정 반응 — That's great! You worked really hard.

==================================================
사용 가능한 상황 (19번과 다르게)
==================================================

약속 시간 변경, 길 안내/교통, 음식·물건 선택, 사과와 이해, 학교 행사 준비, 건강/컨디션 조언, 좋은 소식

==================================================
선택지·오답 설계
==================================================

choices: 영어 문장 5개, 중1 수준, 1문장 또는 짧은 2문장, 길이 비슷하게.
정답만 직전 발화+맥락에 자연스럽게 연결.

오답 방식:
- 대화 단어와 약간 관련 있으나 응답 기능 불일치
- 다른 상황에서는 자연스럽지만 현재 맥락 부적절
- 화자 역할 불일치 (사과 받아야 하는데 자신이 사과)
- 시점 불일치 (last week, next year 등)
- 감정 기능 불일치 (좋은 소식에 걱정 응답)

오답이 너무 엉뚱하면 안 됨. 오답 중 하나라도 자연스러우면 실패.

필수: previous_turn, blank_speaker(W), situation_type, correct_response_function, distractor_reasons.
blank_speaker=W ↔ instruction 여자의 말 ↔ question_text Woman:
`.trim();

const TYPE20_VALIDATION_CRITERIA = `
생성 전: 마지막 M 발화의 의도를 분류하고(situation_type·correct_response_function), 그 직후 여자 **한 줄 응답**만 정답으로 설계한다.
생성 후 스스로 검수 (20번 전용):
1. 지시문이 응답 고르기 유형에 맞는가?
2. choices가 모두 영어 응답 문장 5개인가?
3. question_text가 "Woman: ______" 형식인가?
4. question_text 화자와 지시문 응답 화자(여자)가 일치하는가?
5. segments에 빈칸(여자) 응답이 없는가?
6. previous_turn이 마지막 남자(M) 발화인가?
7. 정답이 previous_turn에 직접 반응하는가?
8. 정답이 대화 전체 맥락과 자연스러운가?
9. 정답이 Okay/Yes/Sure/Thank you 등 너무 일반적이지 않은가?
10. 정답 외 자연스러운 응답이 또 없는가?
11. 오답이 문법상 가능하나 현재 맥락에는 맞지 않는가?
12. 선택지가 중1 수준 영어인가?
13. situation_type이 19번(잃어버린 물건 등)과 지나치게 비슷하지 않은가?
14. correct_response_function이 19번과 반복되지 않았는가?
15. distractor_reasons 5개
`.trim();

export function buildType20OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE20_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE20_VALIDATION_CRITERIA}

${TYPE20_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType20PromptBlockForExam(): string {
  return `
### 20번 유형: 응답 고르기
${TYPE20_GENERATION_RULES}

필수: previous_turn, blank_speaker, situation_type, correct_response_function, distractor_reasons
`.trim();
}
