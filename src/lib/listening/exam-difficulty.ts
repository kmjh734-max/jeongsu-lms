import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";

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
      "Dialogue ends with W (type 19) or M (type 20). The OTHER speaker's reply is NOT in segments. question_text must be exactly \"Man: ________\" (type 19) or \"Woman: ________\" (type 20) with no other words.",
  },
};

/** 중2 — 첨부 기출(2025·2026)보다 약간 긴 문장·어휘 */
export const MIDDLE2_DIFFICULTY_RULES: Record<ListeningDifficultyTier, DifficultyRules> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "1~6번",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~9 turns",
    wordsPerSentence: "9~14 English words per sentence",
    vocabulary: "grade 2 textbook vocabulary; natural collocations",
    extra:
      "Total script 70~95 words. Slightly richer than typical 중2 기출. One clear fact per sentence.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "7~12번",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "10~15 English words per sentence",
    vocabulary: "grade 2; simple relative clauses (who/which/that) sparingly allowed",
    extra: "Total script 75~105 words. Track one main idea with supporting details.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "13~18번",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "10~16 English words per sentence",
    vocabulary:
      "grade 2+; numbers, prices, times; present perfect for experience OK; no subjunctive",
    extra:
      "Total script 80~115 words. May include payment math, relationship inference, schedule-at-time plans (type 17).",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "19~20번",
    monologueSentences: "N/A (dialogue only)",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "9~15 words per line; reply choices 8~14 words in English",
    vocabulary: "grade 2; contextual replies with specific detail",
    extra:
      "Dialogue ends with W (19) or M (20). Reply NOT in segments. Man:/Woman: ______ format.",
  },
};

export function getDifficultyRulesForGrade(
  grade: ListeningGradeLevel
): Record<ListeningDifficultyTier, DifficultyRules> {
  return grade === "middle2" ? MIDDLE2_DIFFICULTY_RULES : DIFFICULTY_RULES;
}

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
  mode: ListeningDifficultyMode,
  grade: ListeningGradeLevel = "middle1"
): DifficultyRules {
  const rulesByTier = getDifficultyRulesForGrade(grade);
  if (mode !== "auto") {
    return rulesByTier[mode];
  }
  return rulesByTier[type.difficulty_tier];
}

/** 단일 유형 생성 프롬프트 끝에 붙이는 난이도 강제 블록 */
export function buildDifficultyRequirementBlock(
  type: ExamTypeTemplate,
  mode: ListeningDifficultyMode,
  grade: ListeningGradeLevel = "middle1"
): string {
  const rules = resolveDifficultyForType(type, mode, grade);
  const harderNote =
    grade === "middle2"
      ? " (중2: 전국 기출 수준보다 문장·정보를 약간 더 길게)"
      : "";
  if (grade === "middle1") {
    return `
## 난이도 (참고 — 중1은 문장·대화 **단어 수**로 저장을 막지 않음)
- 적용: ${rules.label} (${rules.questionRange})
- 권장 문장 길이: ${rules.wordsPerSentence}
- 권장 대화: ${rules.dialogueTurns} / 독백: ${rules.monologueSentences}
- 어휘: ${rules.vocabulary}
- 형식 참고: ${rules.extra}
- 단어 수가 권장보다 길거나 짧아도 문항은 유효. 자연스러운 중1 영어가 우선.
`.trim();
  }

  return `
## 난이도 — 반드시 준수${harderNote}
- 적용: ${rules.label} (${rules.questionRange})
- 문장 길이: ${rules.wordsPerSentence}
- 대화: ${rules.dialogueTurns} / 독백: ${rules.monologueSentences}
- 어휘: ${rules.vocabulary}
- 총 분량·형식: ${rules.extra}
- 위 수치보다 짧거나 단순하면 안 됨. 선택한 난이도를 벗어난 초단문·초단대화 금지.
`.trim();
}

export function buildDifficultyPromptBlock(
  types: ExamTypeTemplate[],
  mode: ListeningDifficultyMode,
  grade: ListeningGradeLevel = "middle1"
): string {
  const harderNote =
    grade === "middle2"
      ? " (중2: 2025·2026 전국 기출 대본보다 문장을 약간 더 길고 정보 밀도 있게)"
      : "";
  return types
    .map((t, i) => {
      const rules = resolveDifficultyForType(t, mode, grade);
      return `Item ${i + 1} (Type #${t.id}, ${rules.label})${harderNote}: ${rules.wordsPerSentence}; ${rules.dialogueTurns}; ${rules.monologueSentences}; vocab: ${rules.vocabulary}. ${rules.extra}`;
    })
    .join("\n");
}
