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
    monologueSentences: "5~6 sentences",
    dialogueTurns: "6~7 turns",
    wordsPerSentence: "6~11 English words per sentence",
    vocabulary: "very common middle school grade 1 words only",
    extra: "Total script 55~75 words. One clear fact per sentence; natural but simple rhythm.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "7~13번",
    monologueSentences: "5~6 sentences",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "7~12 English words per sentence",
    vocabulary: "grade 1 textbook vocabulary; one new word at most per item",
    extra: "Total script 60~85 words. Short natural dialogues; one main idea to track.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "14~18번",
    monologueSentences: "5~7 sentences",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "8~13 English words per sentence",
    vocabulary: "grade 1+; may include numbers, times, places, simple compound sentences",
    extra:
      "Total script 65~90 words. May include announcement with details, table in question_text, or location clues.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "19~20번",
    monologueSentences: "N/A (dialogue only)",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "7~13 words per line; reply choices 6~12 words in English",
    vocabulary: "grade 1; focus on natural replies, not rare words",
    extra:
      "Dialogue ends with W (type 19) or M (type 20). The OTHER speaker's reply is NOT in segments. question_text: Man:/Woman: ________ only.",
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
