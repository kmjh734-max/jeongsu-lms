import type { QuestionTypeOption } from "@/lib/question-generator/types";

export type TargetLevel = "상" | "중" | "하";

/**
 * 문항 난이도(상·중·하)를 유형마다 실제로 손댈 수 있는 곳으로 바꿔 알려 준다.
 * 예전에는 "기본/내신/고난도"를 받아도 프롬프트에 쓰지 않아 난이도가 바뀌지 않았다.
 */
export function targetLevelFromOverall(overall: string | null | undefined): TargetLevel | null {
  if (overall === "고난도") return "상";
  if (overall === "내신") return "중";
  // "기본"은 예전 결과를 그대로 둔다
  return null;
}

export function difficultyRule(option: QuestionTypeOption, level: TargetLevel | null | undefined): string {
  if (!level) return "";
  const t = option.type;
  const common: Record<TargetLevel, string> = {
    상: "TARGET DIFFICULTY 상 (top 20% students separate here).",
    중: "TARGET DIFFICULTY 중 (average 내신 level).",
    하: "TARGET DIFFICULTY 하 (most students should get it right, still not trivial).",
  };
  const byType: Record<string, Record<TargetLevel, string>> = {
    mcq: {
      상: "Correct choice paraphrases abstractly (no shared key words with the passage). ≥3 distractors that are partly true or true-but-too-narrow/too-broad. Choice lengths balanced.",
      중: "Correct choice paraphrased; 2 strong distractors that reuse passage words with a meaning shift.",
      하: "Correct choice close to the passage wording; distractors clearly contradict or are off-topic (but not absurd).",
    },
    blank: {
      상: "Blank the abstract core claim/concept that must be inferred from the whole passage; clues are indirect (not a repeated word). Distractors are near-miss paraphrases or the opposite claim.",
      중: "Blank a key phrase supported by 1–2 clues elsewhere in the passage.",
      하: "Blank a phrase whose meaning is restated nearby; clue is direct.",
    },
    structure: {
      상: "Choose a spot where connectors/pronoun cues are subtle; logical flow must be inferred from content. Avoid obvious 'However/For example' giveaways where possible.",
      중: "Use a normal spot with one clear cue (connector, pronoun, or article).",
      하: "Use a spot with clear cues (explicit connector + pronoun reference).",
    },
    grammar: {
      상: "Test subtle points: long-distance subject–verb agreement, relative vs. what, participle vs. finite verb, parallelism in long sentences, inversion. The wrong one should look natural at first glance.",
      중: "Test core 내신 grammar (tense/voice, relative pronouns, to-V vs -ing, agreement) in medium-length sentences.",
      하: "Test clear basic grammar in short sentences; the error is noticeable to careful readers.",
    },
    vocabulary: {
      상: "Swap in context-dependent antonyms/near-antonyms that fit the local sentence but break the passage logic; target less common words.",
      중: "Swap in a clear antonym that breaks the sentence meaning.",
      하: "Swap in an obviously opposite common word.",
    },
    subjective: {
      상: "Add conditions: word-form change + one added word, or 2 grammar points in one answer; a longer target sentence.",
      중: "One or two conditions (e.g., use all given words, change one form).",
      하: "Simple conditions; short target sentence taken almost directly from the passage.",
    },
  };
  const group = !option.isObjective
    ? "subjective"
    : t === "sentence_blank"
      ? "blank"
      : t === "order" || t === "sentence_insertion" || t === "irrelevant_sentence"
        ? "structure"
        : t === "grammar"
          ? "grammar"
          : t === "vocabulary"
            ? "vocabulary"
            : "mcq";
  return `- ${common[level]} ${byType[group]![level]}`;
}
