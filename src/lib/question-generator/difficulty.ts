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
    /*
     * 상을 「추상적으로·애매하게」가 아니라 「더 길고 세부가 많게」로 바꾼다(선생님 말씀 2026-10-04: 너무 어렵게 만들려다 애매해진다).
     * 예전 상 문구 「abstract, no shared key words」는 제목 정답이 글감을 감추는 원인이었다(전수조사 17%).
     */
    mcq: {
      상: "Key is reworded (not copied) but still names the passage's subject in plain words; choices are somewhat longer and carry more of the passage's detail than at 하. ≥3 distractors that are partly true, too narrow or too broad, or reverse a relation — each CLEARLY worse than the key for one nameable reason. Never two choices that both state the whole main point. No abstract or metaphorical wording, no rare words. Choice lengths balanced.",
      중: "Correct choice paraphrased; 2 strong distractors that reuse passage words with a meaning shift.",
      하: "Correct choice close to the passage wording; distractors clearly contradict or are off-topic (but not absurd).",
    },
    blank: {
      상: "Blank a key phrase tied to the passage's main point; its clues are elsewhere in the passage in different words (not a repeated word), so the student must read the whole passage. Exactly one choice fits; each distractor is clearly wrong for one nameable reason (opposite, only one part, unrelated detail). Longer choices are fine; no riddles or abstract wording that could fit two ways.",
      중: "Blank a key phrase supported by 1–2 clues elsewhere in the passage.",
      하: "Blank a phrase whose meaning is restated nearby; clue is direct.",
    },
    structure: {
      상: "Choose a spot where the decisive cue is the content flow (what is said before and after) rather than an obvious 'However/For example' giveaway — but exactly one position/order must remain coherent; a second plausible place makes the item defective. Never add a connector or phrase that is not in the passage (e.g. a new 'For that reason') to the given sentence or chunks.",
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
  /*
   * 내용일치·불일치는 「추상적으로 바꿔 쓰고 일부만 맞는 오답」(mcq 상)을 쓰면 판단 불가 보기가 나왔다
   * (2026-10-04 전수조사). 사실을 잇고 가려내는 것으로 어렵게 한다.
   */
  byType.fact = {
    /*
     * 선생님 결정(2026-10-04): 상·하는 문장 길이와 담는 세부로 나눈다. 「두 문장 잇기·누가 말했나」로
     * 어렵게 하려다 보니 애매한 보기가 나왔다. 상도 사실 하나만 담되, 그 문장의 조건·수치·이유·대상을
     * 함께 담아 길게 쓰고 문장 구조를 더 바꾼다. 참·거짓은 하와 똑같이 분명해야 한다.
     */
    상: "LONGER choices (roughly 15-22 words in English; Korean about 30-50 characters). Still ONE fact from the passage, but carry that sentence's details with it (the condition, number, reason, place or person the same sentence states), and restructure the sentence somewhat (clause order, active/passive). When false, the one changed element may sit inside those details. Do not link separate sentences or add anything the passage lacks; every choice is as clearly true or false as at 하. A natural, grammatical sentence comes first — never pad, never translate word for word (Korean must read like a native exam sentence, with people or things — not sounds or lines — as the ones who perceive or act).",
    중: "Each choice checks one explicit fact, plainly reworded (roughly 12-16 words in English).",
    하: "SHORTER choices (roughly 8-13 words in English; Korean about 15-30 characters). One explicit fact from one sentence, wording close to the passage; who and what are obvious; a false choice has one clear change. A complete, grammatical sentence comes first — never drop articles or prepositions to make it short.",
  };
  const group = !option.isObjective
    ? "subjective"
    : t === "content_true" || t === "content_false"
      ? "fact"
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
