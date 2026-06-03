import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE9_QUESTION_TYPE } from "@/lib/listening/prompts/type9ImmediateActionPrompt";
import {
  findImmediateActionSpeaker,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedActions,
  targetPersonLabel,
} from "@/lib/listening/type9-action-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function buildInstruction(targetPerson: string): string {
  const who = targetPersonLabel(targetPerson) ?? "남자";
  return `대화를 듣고, ${who}가 대화 직후에 할 일로 가장 적절한 것을 고르시오.`;
}

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  if (q.target_person?.trim()) {
    const label = targetPersonLabel(q.target_person);
    if (label) return label;
  }
  const speaker = findImmediateActionSpeaker(q.segments);
  if (speaker === "M") return "남자";
  if (speaker === "W") return "여자";
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "여자";
}

export function fixType9Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 9) return q;

  const target_person = resolveTargetPerson(q);
  const immediate_action = normalizeActionLabel(
    q.immediate_action?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const mentioned_actions = normalizeMentionedActions(q.mentioned_actions);

  const instruction =
    q.instruction?.trim() &&
    /대화\s*직후/.test(q.instruction) &&
    ((target_person === "남자" && /남자/.test(q.instruction)) ||
      (target_person === "여자" && /여자/.test(q.instruction)))
      ? q.instruction
      : buildInstruction(target_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 9,
    question_type: TYPE9_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    immediate_action,
    mentioned_actions,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = immediate_action
    ? indexOfActionInChoices(base.choices, immediate_action)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
