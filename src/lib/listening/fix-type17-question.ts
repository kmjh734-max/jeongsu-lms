import { buildScriptText } from "@/lib/listening/script-text";
import { targetPersonLabel } from "@/lib/listening/type7-career-choices";
import { TYPE17_QUESTION_TYPE } from "@/lib/listening/prompts/type17SchedulePrompt";
import {
  buildType17Instruction,
  extractTargetTimeFromInstruction,
  findPlannedActionSpeaker,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedOtherActions,
} from "@/lib/listening/type17-schedule-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  if (q.target_person?.trim()) {
    return targetPersonLabel(q.target_person) ?? q.target_person.trim();
  }
  const speaker = findPlannedActionSpeaker(q.segments);
  if (speaker === "M") return "남자";
  if (speaker === "W") return "여자";
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "남자";
}

function instructionMatches(
  instruction: string,
  targetPerson: string,
  targetTime: string
): boolean {
  const who = targetPersonLabel(targetPerson) ?? targetPerson;
  return (
    instruction.includes(who) &&
    (instruction.includes(targetTime) ||
      instruction.includes(`${targetTime}에`))
  );
}

export function fixType17Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 17) return q;

  const target_person = resolveTargetPerson(q);
  const target_time =
    q.target_time?.trim() ||
    extractTargetTimeFromInstruction(q.instruction ?? "");
  const planned_action = normalizeActionLabel(
    q.planned_action?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const mentioned_other_actions = normalizeMentionedOtherActions(
    q.mentioned_other_actions
  );

  const instruction =
    q.instruction?.trim() &&
    /할\s*일/.test(q.instruction) &&
    instructionMatches(q.instruction, target_person, target_time)
      ? q.instruction
      : buildType17Instruction(target_person, target_time);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 17,
    question_type: TYPE17_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    target_time,
    planned_action,
    mentioned_other_actions,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = planned_action
    ? indexOfActionInChoices(base.choices, planned_action)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
