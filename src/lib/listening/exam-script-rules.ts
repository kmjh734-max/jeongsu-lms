/** 중1 전국 영어듣기평가 대본·문법·어휘 규칙 (2024·2025·2026 기출 참고, 문장 복사 금지) */
export const EXAM_SCRIPT_RULES = `
중1 대본 생성 규칙 (반드시 준수):
- 한 문장: 5~12 English words (strict)
- 전체 대본: 40~75 English words per item (count all segment.text words)
- 1번 묘사: exactly 5~6 sentences, first-person I, last sentence MUST be "What am I?"
- 대화형: 5~8 speaker turns (M/W alternating)
- 담화/안내형: 4~6 sentences
- 금지 문법: relative clauses (who/which/that), subjunctive, participial phrases, complex conditionals
- 허용 문법 only: simple present/past, be going to, want to, have to, can, will, there is/are, why don't we, how about
- 금지: rare/academic vocabulary, idioms, phrasal verbs beyond grade 1 textbook
- 고유명사: easy names (Tom, Sarah, Chris) and simple place names
- 상황: school, family, shop, weather, hobby, appointment, transport, event only
- 정답 단서: must appear clearly once in the script (not hidden)
- segment.text: ONLY spoken English (never Korean instruction, never choices)
- Types 19~20: dialogue ends before the blank response; do NOT include the answer line in segments
`.trim();

export const CHOICE_RULES = `
선택지 규칙:
- Exactly 5 choices
- Exactly 1 correct answer (correct_answer 1~5)
- Wrong options: same category as correct (all jobs, all weather, all transport, etc.)
- Similar length and style; no absurd distractors
- Korean stems → natural Korean choices
- English response items (19~20) → natural short English sentences
`.trim();

export const JSON_OUTPUT_SCHEMA = `
Return ONLY valid JSON:
{
  "questions": [
    {
      "order_index": 1,
      "question_type": "묘사 듣고 대상 고르기",
      "instruction": "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.",
      "segments": [{ "speaker": "M", "text": "..." }],
      "script_text": "M: ...",
      "script_translation": "남: ...",
      "question_text": "",
      "choices": ["...", "...", "...", "...", "..."],
      "correct_answer": 1,
      "answer_clue": "exact phrase from script supporting the answer",
      "explanation": "한국어 짧은 해설"
    }
  ]
}
`.trim();
