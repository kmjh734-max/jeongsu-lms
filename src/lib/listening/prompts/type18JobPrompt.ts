import { COPYRIGHT_BLOCK } from "@/lib/listening/prompts/commonPrompt";

/** 18번 유형 전용 — 다른 유형 규칙을 섞지 않음 */
export const TYPE18_QUESTION_TYPE = "직업 파악";

export const TYPE18_JSON_OUTPUT_SCHEMA = `
반드시 아래 JSON 구조만 출력한다 (questions 배열에 1개만).

{
  "questions": [
    {
      "order_index": 18,
      "question_type": "직업 파악",
      "instruction": "대화를 듣고, 남자의 직업으로 가장 적절한 것을 고르시오.",
      "needs_image_choices": false,
      "visual_choice_type": "none",
      "segments": [
        { "speaker": "M", "text": "" },
        { "speaker": "W", "text": "" }
      ],
      "script_text": "",
      "script_translation": "",
      "question_text": "",
      "choices": ["사진작가", "화가", "기자", "영화감독", "작가"],
      "choice_image_prompts": [],
      "correct_answer": 1,
      "answer_clue": "Please stand a little closer together. / Look at the camera and smile. / I'll take one more picture.",
      "explanation": "",
      "target_person": "남자",
      "target_job": "사진작가",
      "job_clues": [
        "Please stand a little closer together.",
        "Look at the camera and smile.",
        "I'll take one more picture."
      ],
      "distractor_jobs": [
        { "job": "화가", "reason": "그림을 그리는 직업이지만 사진 촬영 단서는 없음" },
        { "job": "기자", "reason": "기사를 쓰는 직업이지만 카메라 촬영 안내와 다름" }
      ],
      "quality_check_focus": [
        "직업명을 직접 말하지 않았는가",
        "직업을 추론할 단서가 충분한가",
        "지시문 대상과 target_person이 일치하는가",
        "선택지가 모두 한글 직업명인가",
        "정답 직업이 하나만 가능한가"
      ]
    }
  ]
}

order_index는 반드시 18.
M/W 대화 6~8턴. 직업명 직접 언급 금지(I am a doctor / as a firefighter).
target_person=지시문 남자/여자=직업 단서를 가진 화자. target_job=correct_answer.
job_clues 2개 이상. answer_clue에 추론 핵심 문장 2개 이상.
7번(장래 희망 I want to be)과 구분 — 현재 직업 역할로 추론.
choices: 한글 직업명 5개. needs_image_choices false.
`.trim();

const TYPE18_GENERATION_RULES = `
==================================================
18번 문항 유형 (이 요청만 생성 — 다른 번호 유형 금지)
==================================================

유형명: 직업 파악
지시문: 대화를 듣고, 남자/여자의 직업으로 가장 적절한 것을 고르시오.

문항 목적: 하는 일·도구·상황 단서로 현재 직업을 추론. 7번 장래 희망과 구분.

18번 vs 7번:
- 7번: I want to be a/an ... (장래 희망)
- 18번: 직업명 직접 말 금지, 업무 행동·도구로 추론

그림: needs_image_choices=false, visual_choice_type="none"

대본 (M/W, 6~8턴):
1. 서비스/도움 요청 → 2. target_person 직업 역할 반응 → 3. 직업 단서 2개+ → 4. 역할 더 명확

직업명 금지: I am a doctor / As a firefighter / my job is ...
직업 단서: check throat, library card, camera, oven, hose, cut hair 등

필수: target_person, target_job, job_clues(2+), distractor_jobs, answer_clue(2+ 문장).
target_person=지시문=직업 단서 화자. target_job=correct_answer.

소재: 의사, 수의사, 사진작가, 사서, 제빵사, 소방관, 미용사, 요리사, 경찰 등.
기존 기출 복사 금지. 중1 수준 영어.
`.trim();

const TYPE18_VALIDATION_CRITERIA = `
생성 후 스스로 검수 (18번 전용):
1. 직업명 직접 언급 없음
2. job_clues 2개 이상
3. target_person = 지시문
4. choices 한글 직업명 5개
5. target_job = correct_answer
6. I want to be (7번) 없음
`.trim();

export function buildType18OnlyGenerationPrompt(previousProblems?: string[]): string {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n이전 생성 문제(반드시 피할 것):\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";

  return `
${TYPE18_GENERATION_RULES}

${COPYRIGHT_BLOCK}
${avoid}
${TYPE18_VALIDATION_CRITERIA}

${TYPE18_JSON_OUTPUT_SCHEMA}
`.trim();
}

export function getType18PromptBlockForExam(): string {
  return `
### 18번 유형: 직업 파악
${TYPE18_GENERATION_RULES}

필수: target_person, target_job, job_clues, distractor_jobs
`.trim();
}
