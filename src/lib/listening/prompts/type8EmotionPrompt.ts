import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 8번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE8_QUESTION_TYPE = "심정 파악";

export const TYPE8_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 8,
      "question_type": "심정 파악",
      "instruction": "대화를 듣고, 남자의 심정으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["실망", "안도", "걱정", "만족", "불안"],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "",
      "explanation": "",
      "target_person": "남자",
      "target_emotion": "실망",
      "emotion_clues": ["기대하던 여행 취소", "I waited so long for this trip"],
      "quality_check_focus": [
        "목표 인물의 심정이 명확한가",
        "감정 단서가 목표 인물의 말에 들어 있는가",
        "선택지가 모두 한국어 감정어인가",
        "정답 감정이 하나만 가능한가",
        "대화 상황이 감정을 자연스럽게 뒷받침하는가"
      ]
    }
  ]
}

order_index는 반드시 8.
M/W 대화 6~8턴. target_person = 지시문 남자/여자.
choices: 한국어 감정어 5개 (실망·설렘·걱정·안도·만족·불안·당황·슬픔 등).
target_emotion과 correct_answer 일치. emotion_clues에 상황·대본 단서.
"I am disappointed."만으로 끝내지 말고 상황 단서 포함.
needs_image_choices false.
`.trim();

const TYPE8_GENERATION_RULES = `
==================================================
8번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 심정 파악
지시문: 대화를 듣고, 남자/여자의 심정으로 가장 적절한 것을 고르시오.

문항 목적: 상황·반응을 듣고 한 사람의 감정을 고른다.

형식:
- M/W 대화 6~8턴.
- 흐름: 상황 → 목표 인물 반응 → 이유 → 상대 반응 → 목표 인물 감정 드러남.
- choices: 한국어 감정 명사 5개.
- target_person, target_emotion, emotion_clues 필수.
- needs_image_choices: false.

감정: 실망·설렘·걱정·안도·만족·불안·당황·슬픔·놀람·자랑스러움·지루함·평화로움 중 하나.
감정 단서는 목표 인물(M/W)의 말에 있어야 함. 상대 감정과 혼동 금지.
question_text 비움.
`.trim();

const TYPE8_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (8번 전용):
1. target_person = 지시문 남자/여자
2. choices 한국어 감정 5개
3. target_emotion = 정답, 맥락상 하나만
4. answer_clue에 감정 판단 근거 문장
`.trim();

export function buildType8OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE8_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE8_VALIDATION_CRITERIA}

${TYPE8_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType8PromptBlockForExam(): string {
  return `
### 8번 유형: 심정 파악
${TYPE8_GENERATION_RULES}

필수: target_person, target_emotion, emotion_clues, needs_image_choices=false
`.trim();
}
