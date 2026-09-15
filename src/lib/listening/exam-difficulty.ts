import { examTypeCode, type ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { listeningTargetText } from "@/lib/listening/prompts/quality-craft";

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
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 7~11",
    vocabulary: "very common middle school grade 1 words only",
    extra: "One clear fact per sentence; natural spoken rhythm with contractions.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "7~13번",
    monologueSentences: "5~6 sentences",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 7~11",
    vocabulary: "grade 1 textbook vocabulary; one new word at most per item",
    extra: "Short natural dialogues; one main idea to track.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "14~18번",
    monologueSentences: "5~7 sentences",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 8~12",
    vocabulary: "grade 1+; may include numbers, times, places, simple compound sentences",
    extra: "May include announcement with details, table in question_text, or location clues.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "19~20번",
    monologueSentences: "N/A (dialogue only)",
    dialogueTurns: "6~8 turns",
    wordsPerSentence: "dialogue lines of 1~2 short sentences (5~8 words); reply choices 3~7 words in English",
    vocabulary: "grade 1; focus on natural replies, not rare words",
    extra:
      "Dialogue ends with W (type 19) or M (type 20). The OTHER speaker's reply is NOT in segments. question_text must be exactly \"Man: ________\" (type 19) or \"Woman: ________\" (type 20) with no other words.",
  },
};

/** 중3 — 2024~2026 전국 기출 대본 수준 */
export const MIDDLE3_DIFFICULTY_RULES: Record<ListeningDifficultyTier, DifficultyRules> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "기초 유형(그림 선택·그림 상황·한 일)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~9 turns",
    wordsPerSentence: "dialogue 6~9 words per sentence, 1~3 sentences per turn; monologue 10~14",
    vocabulary: "grade 3 textbook vocabulary; natural collocations",
    extra: "Match typical 중3 기출 (shopping, phone calls, picture dialogue).",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "보통 유형(언급X·목적·심정·설명 대상·어색한 대화·직후 할 일)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "dialogue 6~9 words per sentence, 1~3 sentences per turn; monologue 10~14",
    vocabulary: "grade 3; relative clauses and present perfect OK",
    extra: "One main idea with supporting details.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "심화 유형(표·날짜·금액·방송 목적·부탁)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "8~10 turns",
    wordsPerSentence: "dialogue 6~9 words per sentence, 1~3 sentences per turn; monologue 10~14",
    vocabulary:
      "grade 3+; prices, schedules, dates; passive voice OK; no subjunctive",
    extra: "May include payment math, table choice, schedule negotiation.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "응답·상황에 맞는 말(17~20번)",
    monologueSentences: "7~10 sentences (situation narration)",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "dialogue lines of 1~3 short sentences (6~9 words); reply/utterance choices 4~9 words in English",
    vocabulary: "grade 3; contextual replies with specific detail",
    extra:
      "Response items: the dialogue ends with the speaker named in the instruction; the reply is NOT in segments; question_text is exactly \"Man: ________\" or \"Woman: ________\". Situation item: third-person narration ending with \"In this situation, what would A most likely say to B?\"; question_text \"A: ______\".",
  },
};

/**
 * 고1 — 2025·2026 전국연합 듣기 대본 수준
 * (목적~요지 짧~중 / 금액·표 정보량 / 응답·상황 화용 / 16–17 열거 독백)
 */
export const HIGH1_DIFFICULTY_RULES: Record<
  ListeningDifficultyTier,
  DifficultyRules
> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "1~5번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "9~12 turns",
    wordsPerSentence: "dialogue 6~8 words per sentence on average, 1~3 sentences per turn; monologue 11~15",
    vocabulary: "high school grade 1; school/community announcement and daily opinion language",
    extra: "Match 고1 전국연합 purpose/opinion/gist/picture/next-action scripts.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "6~10번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "9~13 turns",
    wordsPerSentence: "dialogue 6~8 words per sentence on average, 1~3 sentences per turn; monologue 11~15",
    vocabulary:
      "grade 1; prices, schedules, event details; clear numbers; light relative clauses OK",
    extra: "Payment math, reason with false guesses, unmentioned item, announcement mismatch, or table filters.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "11~15번",
    monologueSentences: "8~11 sentences (type 15 narration)",
    dialogueTurns: "exactly 3 turns (short reply 11~12) or 9~12 turns (long reply 13~14)",
    wordsPerSentence: "dialogue 6~8 words per sentence on average; monologue 11~15; reply choices 5~10 words",
    vocabulary: "grade 1; pragmatic replies and situation speech acts",
    extra: "Short response: exactly 3 turns. Do NOT put the blank reply in segments. Situation speech: third-person narration ending with what A would say to B.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "16~17번",
    monologueSentences: "10~13 sentences",
    dialogueTurns: "N/A (shared monologue)",
    wordsPerSentence: "monologue 11~15 words per sentence",
    vocabulary: "grade 1; list/tips monologue with clear topic + enumerated items",
    extra: "Types 16 and 17 MUST share identical segments/script. Played twice in real exam. intro + 4 items with 1~2 sentences each + wrap-up. 16=topic (English choices), 17=unmentioned item.",
  },
};

/** 중2 — 첨부 기출(2025·2026)보다 약간 긴 문장·어휘 */
export const MIDDLE2_DIFFICULTY_RULES: Record<ListeningDifficultyTier, DifficultyRules> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "기초 유형(날씨·그림 선택·그림 상황·한 일)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~9 turns",
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 8~12",
    vocabulary: "grade 2 textbook vocabulary; natural collocations",
    extra: "Slightly richer than typical 중2 기출 by adding turns and details, not longer sentences.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "보통 유형(심정·장소·특정 정보·언급X·불일치·목적)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 8~12",
    vocabulary: "grade 2; simple relative clauses (who/which/that) sparingly allowed",
    extra: "Track one main idea with supporting details.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "심화 유형(거스름돈·관계·부탁·양식 빈칸·표현의 의미)",
    monologueSentences: "6~8 sentences",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "dialogue 5~8 words per sentence, 1~2 sentences per turn; monologue 8~12",
    vocabulary:
      "grade 2+; numbers, prices, times; present perfect for experience OK; no subjunctive",
    extra: "May include change/payment math, relationship inference, a printed flyer with two blanks, or the meaning of a quoted expression.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "응답 유형(19·20번)",
    monologueSentences: "N/A (dialogue only)",
    dialogueTurns: "7~10 turns",
    wordsPerSentence: "dialogue lines of 1~2 short sentences (5~8 words); reply choices 4~8 words in English",
    vocabulary: "grade 2; contextual replies with specific detail",
    extra:
      "Response items: the dialogue ends with the speaker named in the instruction; the reply is NOT in segments; question_text is exactly \"Man: ________\" or \"Woman: ________\".",
  },
};

/**
 * 고2 — 2025 전국연합 듣기 대본 수준 (고1과 동일 슬롯, 밀도↑)
 */
export const HIGH2_DIFFICULTY_RULES: Record<
  ListeningDifficultyTier,
  DifficultyRules
> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "1~5번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "9~12 turns",
    wordsPerSentence: "dialogue 6~9 words per sentence on average, 1~3 sentences per turn; monologue 12~16",
    vocabulary:
      "high school grade 2; school/community plus light science-of-daily-life wording",
    extra: "Match 고2 전국연합: clearer cause/effect than 고1 (e.g. schedule change reasons, safety tips).",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "6~10번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "9~13 turns",
    wordsPerSentence: "dialogue 6~9 words per sentence on average, 1~3 sentences per turn; monologue 12~16",
    vocabulary:
      "grade 2; prices, event rules, multi-step table filters; denser detail than 고1",
    extra: "Payment with options/discount, false-guess reasons, unmentioned item, announcement mismatch, table choice.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "11~15번",
    monologueSentences: "8~11 sentences (type 15 narration)",
    dialogueTurns: "exactly 3 turns (short reply 11~12) or 9~12 turns (long reply 13~14)",
    wordsPerSentence: "dialogue 6~9 words per sentence on average; monologue 12~16; reply choices 5~10 words",
    vocabulary: "grade 2; pragmatic replies with specific contextual detail",
    extra: "Short response: exactly 3 turns. Do NOT put blank replies in segments. Situation speech denser than 고1.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "16~17번",
    monologueSentences: "10~13 sentences",
    dialogueTurns: "N/A (shared monologue)",
    wordsPerSentence: "monologue 12~16 words per sentence",
    vocabulary:
      "grade 2; topical list monologue (nature, food, science) with clear functions/examples",
    extra: "Types 16–17 share identical segments. Denser examples than 고1.",
  },
};

/**
 * 고3 — 2025·2026 전국연합 듣기 대본 수준 (고1·고2와 동일 슬롯, 밀도·추론↑)
 */
export const HIGH3_DIFFICULTY_RULES: Record<
  ListeningDifficultyTier,
  DifficultyRules
> = {
  foundation: {
    tier: "foundation",
    label: "기초",
    questionRange: "1~5번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "10~13 turns",
    wordsPerSentence: "dialogue 7~9 words per sentence on average, 1~3 sentences per turn; monologue 12~17",
    vocabulary:
      "high school grade 3; school/community plus research-light wellness and practical explanation wording",
    extra: "Match 고3 전국연합: inconvenience framing, brief research/tip support, denser than 고2.",
  },
  standard: {
    tier: "standard",
    label: "보통",
    questionRange: "6~10번",
    monologueSentences: "8~11 sentences",
    dialogueTurns: "10~13 turns",
    wordsPerSentence: "dialogue 7~9 words per sentence on average, 1~3 sentences per turn; monologue 12~17",
    vocabulary:
      "grade 3; multi-option tickets, event rules, multi-step table filters with clearer constraints",
    extra: "Payment with options/discount, denied guesses, unmentioned item, mismatch announcement, table choice.",
  },
  applied: {
    tier: "applied",
    label: "심화",
    questionRange: "11~15번",
    monologueSentences: "8~11 sentences (type 15 narration)",
    dialogueTurns: "exactly 3 turns (short reply 11~12) or 10~12 turns (long reply 13~14)",
    wordsPerSentence: "dialogue 7~9 words per sentence on average; monologue 12~17; reply choices 5~10 words",
    vocabulary:
      "grade 3; pragmatic replies with copyright/AI/project or schedule detail",
    extra: "Short response: exactly 3 turns. Do NOT put blank replies in segments. Situation speech denser than 고2.",
  },
  advanced: {
    tier: "advanced",
    label: "고난도",
    questionRange: "16~17번",
    monologueSentences: "10~13 sentences",
    dialogueTurns: "N/A (shared monologue)",
    wordsPerSentence: "monologue 12~17 words per sentence",
    vocabulary:
      "grade 3; topical/academic list monologue (economy terms, science, culture) with clear definitions/examples",
    extra: "Types 16–17 share identical segments. Denser definitions than 고2.",
  },
};

export function getDifficultyRulesForGrade(
  grade: ListeningGradeLevel
): Record<ListeningDifficultyTier, DifficultyRules> {
  if (grade === "high3") return HIGH3_DIFFICULTY_RULES;
  if (grade === "high2") return HIGH2_DIFFICULTY_RULES;
  if (grade === "high1") return HIGH1_DIFFICULTY_RULES;
  if (grade === "middle3") return MIDDLE3_DIFFICULTY_RULES;
  if (grade === "middle2") return MIDDLE2_DIFFICULTY_RULES;
  return DIFFICULTY_RULES;
}

export const DIFFICULTY_MODE_OPTIONS: Array<{
  value: ListeningDifficultyMode;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "유형·번호별 자동",
    description: "기출처럼 번호대별 자동 (중등 1~20 / 고1 1~17)",
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
    grade === "high3"
      ? " (고3: 전국연합 듣기 대본 — 고2보다 밀도·추론↑)"
      : grade === "high2"
        ? " (고2: 전국연합 듣기 대본 — 고1보다 밀도↑)"
        : grade === "high1"
          ? " (고1: 전국연합 수능형 듣기 대본 수준)"
          : grade === "middle3"
            ? " (중3: 2024~2026 전국 기출 대본 수준)"
            : grade === "middle2"
              ? " (중2: 전국 기출보다 턴·정보를 약간 더, 문장은 짧은 구어체)"
              : "";
  if (grade === "middle1") {
    return `
## 난이도 (참고 — 중1은 문장·대화 **단어 수**로 저장을 막지 않음)
- 적용: ${rules.label} (${rules.questionRange})
- 권장 문장 길이: ${rules.wordsPerSentence}
- 권장 분량: ${listeningTargetText(examTypeCode(type), grade) || `${rules.dialogueTurns} / 독백: ${rules.monologueSentences}`}
- 어휘: ${rules.vocabulary}
- 형식 참고: ${rules.extra}
- 단어 수가 권장보다 길거나 짧아도 문항은 유효. 자연스러운 중1 영어가 우선.
`.trim();
  }

  return `
## 난이도 — 반드시 준수${harderNote}
- 적용: ${rules.label} (${rules.questionRange})
- 문장 길이: ${rules.wordsPerSentence}
- 분량: ${listeningTargetText(examTypeCode(type), grade) || `대화 ${rules.dialogueTurns} / 독백 ${rules.monologueSentences}`}
- 어휘: ${rules.vocabulary}
- 총 분량·형식: ${rules.extra}
- 총 분량·턴 수는 위 기준보다 적으면 안 됨. 문장은 짧은 구어체로 쓰되 턴·정보를 줄이지 않는다 (긴 한 문장으로 늘이지 말 것).
`.trim();
}

export function buildDifficultyPromptBlock(
  types: ExamTypeTemplate[],
  mode: ListeningDifficultyMode,
  grade: ListeningGradeLevel = "middle1"
): string {
  const harderNote =
    grade === "high3"
      ? " (고3: 전국연합 듣기 대본 — 고2보다 밀도·추론↑)"
      : grade === "high2"
        ? " (고2: 전국연합 듣기 대본 — 고1보다 밀도↑)"
        : grade === "high1"
          ? " (고1: 전국연합 수능형 듣기 대본 수준)"
          : grade === "middle3"
            ? " (중3: 2024~2026 전국 기출 대본 수준)"
            : grade === "middle2"
              ? " (중2: 2025·2026 전국 기출보다 턴·정보를 약간 더, 문장은 짧은 구어체)"
              : "";
  return types
    .map((t, i) => {
      const rules = resolveDifficultyForType(t, mode, grade);
      // 분량은 유형별 표(quality-craft) 한 곳에서 가져온다 — 번호대 tier의 턴·문장 수는 표가 없을 때만
      const size = listeningTargetText(examTypeCode(t), grade) || `${rules.dialogueTurns}; ${rules.monologueSentences}`;
      return `Item ${i + 1} (Type #${examTypeCode(t)}, ${rules.label})${harderNote}: script ${size}; ${rules.wordsPerSentence}; vocab: ${rules.vocabulary}. ${rules.extra}`;
    })
    .join("\n");
}
