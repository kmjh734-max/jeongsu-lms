import type { ExamTypeTemplate } from "@/lib/listening/exam-types";

/** 전국 중1 영어듣기평가 기출(2024·2025) 문항 번호대별 난이도 */
export type ListeningDifficultyTier =
  | "foundation"
  | "standard"
  | "applied"
  | "advanced";

export type ListeningDifficultyMode =
  | "auto"
  | ListeningDifficultyTier;

export interface DifficultyRules {
  tier: ListeningDifficultyTier;
  label: string;
  /** 유형 번호 범위 (기출 배치 참고) */
  questionRange: string;
  monologueSentences: string;
  dialogueTurns: string;
  wordsPerSentence: string;
  vocabulary: string;
  extra: string;
}

export const DIFFICULTY_RULES: Record<ListeningDifficultyTier, DifficultyRules> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "1~6번",
    monologueSentences: "3~4 sentences",
    dialogueTurns: "4~5 turns",
    wordsPerSentence: "6~10 English words per sentence",
    vocabulary: "very common middle school grade 1 words only",
    extra: "One clear fact per sentence; no idioms; slow, simple rhythm when written.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "7~13번",
    monologueSentences: "4~5 sentences",
    dialogueTurns: "5~7 turns",
    wordsPerSentence: "8~12 English words per sentence",
    vocabulary: "grade 1 textbook vocabulary; one new word at most per item",
    extra: "Short natural dialogues; one main idea to track.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "14~18번",
    monologueSentences: "5~7 sentences",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "10~14 English words per sentence",
    vocabulary: "grade 1+; may include numbers, times, places, simple compound sentences",
    extra:
      "May include announcement with 4~5 details, simple table in question_text, or location clues.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "19~20번",
    monologueSentences: "N/A (dialogue only)",
    dialogueTurns: "7~9 turns including a short pause before the final line",
    wordsPerSentence: "8~12 words; final reply choices are short English sentences",
    vocabulary: "grade 1; focus on natural replies, not rare words",
    extra:
      "Dialogue ends with one speaker's line; the answer is the OTHER speaker's next line (not spoken in audio). Include [Pause] in script_text only, not in segment.text.",
  },
};

export const DIFFICULTY_MODE_OPTIONS: Array<{
  value: ListeningDifficultyMode;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "유형·번호별 자동",
    description: "기출처럼 1~6 기초, 7~13 보통, 14~18 심화, 19~20 고난도",
  },
  {
    value: "foundation",
    label: "전체 기초",
    description: "짧은 문장·적은 화자 교환",
  },
  {
    value: "standard",
    label: "전체 보통",
    description: "중1 평균 대화 길이",
  },
  {
    value: "applied",
    label: "전체 심화",
    description: "정보가 많은 대화·안내문",
  },
  {
    value: "advanced",
    label: "전체 고난도",
    description: "긴 대화·이어 말하기 유형",
  },
];

export function resolveDifficultyForType(
  type: ExamTypeTemplate,
  mode: ListeningDifficultyMode
): DifficultyRules {
  if (mode !== "auto") {
    return DIFFICULTY_RULES[mode];
  }
  return DIFFICULTY_RULES[type.difficulty_tier];
}

export function buildDifficultyPromptBlock(
  types: ExamTypeTemplate[],
  mode: ListeningDifficultyMode
): string {
  return types
    .map((t, i) => {
      const rules = resolveDifficultyForType(t, mode);
      return `Item ${i + 1} (Type #${t.id}, ${rules.label}): ${rules.wordsPerSentence}; ${rules.dialogueTurns}; ${rules.monologueSentences}; vocab: ${rules.vocabulary}. ${rules.extra}`;
    })
    .join("\n");
}
