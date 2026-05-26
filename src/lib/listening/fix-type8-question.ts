import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE8_QUESTION_TYPE } from "@/lib/listening/prompts/type8EmotionPrompt";
import {
  indexOfEmotionInChoices,
  normalizeEmotionClues,
  normalizeEmotionLabel,
  targetPersonLabel,
} from "@/lib/listening/type8-emotion-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function buildInstruction(targetPerson: string): string {
  const who = targetPersonLabel(targetPerson) ?? "남자";
  return `대화를 듣고, ${who}의 심정으로 가장 적절한 것을 고르시오.`;
}

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  if (q.target_person?.trim()) {
    const label = targetPersonLabel(q.target_person);
    if (label) return label;
  }
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "남자";
}

export function fixType8Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 8) return q;

  const target_person = resolveTargetPerson(q);
  const target_emotion = normalizeEmotionLabel(
    q.target_emotion?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const emotion_clues = normalizeEmotionClues(q.emotion_clues);

  const instruction =
    q.instruction?.trim() &&
    /심정/.test(q.instruction) &&
    ((target_person === "남자" && /남자/.test(q.instruction)) ||
      (target_person === "여자" && /여자/.test(q.instruction)))
      ? q.instruction
      : buildInstruction(target_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 8,
    question_type: TYPE8_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    target_emotion,
    emotion_clues,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = target_emotion
    ? indexOfEmotionInChoices(base.choices, target_emotion)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
