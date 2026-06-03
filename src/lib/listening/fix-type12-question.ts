import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE12_QUESTION_TYPE } from "@/lib/listening/prompts/type12ReasonPrompt";
import {
  buildType12Instruction,
  indexOfReasonInChoices,
  normalizeMentionedPossibleReasons,
  normalizeReasonLabel,
  targetPersonLabel,
} from "@/lib/listening/type12-reason-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export function fixType12Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 12) return q;

  const target_person =
    targetPersonLabel(q.target_person ?? "") ??
    (q.target_person?.trim() || "");
  const target_place = q.target_place?.trim() ?? "";
  const reason_for_going = normalizeReasonLabel(
    q.reason_for_going?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const mentioned_possible_reasons = normalizeMentionedPossibleReasons(
    q.mentioned_possible_reasons
  );

  const instruction =
    q.instruction?.trim() ||
    (target_person && target_place
      ? buildType12Instruction(target_person, target_place)
      : "대화를 듣고, ○○가 ○○에 가는 이유로 가장 적절한 것을 고르시오.");

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 12,
    question_type: TYPE12_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    target_place,
    reason_for_going,
    mentioned_possible_reasons,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = reason_for_going
    ? indexOfReasonInChoices(base.choices, reason_for_going)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}
